
import { Component, ChangeDetectionStrategy, signal, input, viewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ConsoleLine {
  type: 'input' | 'output' | 'error' | 'info';
  content: string;
}

@Component({
  selector: 'app-python-console',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './python-console.component.html',
  styleUrls: ['./python-console.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PythonConsoleComponent implements AfterViewChecked {
  initialCode = input<string>('');
  outputHeight = input<string>('300px');
  
  lines = signal<ConsoleLine[]>([
    { type: 'info', content: 'Python 3.10.0 (Kore Web Shell)' },
    { type: 'info', content: 'Digite "help", "copyright", "credits" ou "license" para mais informações.' },
    { type: 'info', content: '---' }
  ]);
  
  currentInput = signal('');
  variables = signal<Record<string, any>>({});
  
  terminalOutput = viewChild<ElementRef>('terminalOutput');

  constructor() {
    if (this.initialCode()) {
      this.currentInput.set(this.initialCode());
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    try {
      const el = this.terminalOutput()?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    } catch(err) { }
  }

  handleEnter() {
    const rawCommand = this.currentInput();
    const command = rawCommand.trim();
    
    this.lines.update(l => [...l, { type: 'input', content: `>>> ${rawCommand}` }]);
    this.currentInput.set('');
    
    if (!command) return;

    // Comandos especiais do shell simulado
    if (command === 'clear') {
      this.clear();
      return;
    }
    if (['help', 'copyright', 'credits', 'license'].includes(command)) {
        this.lines.update(l => [...l, { type: 'output', content: 'Este é um emulador Python simplificado rodando no seu navegador para fins educativos.' }]);
        return;
    }

    try {
      this.processCommand(command);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.lines.update(l => [...l, { type: 'error', content: `Traceback (most recent call last):\n  File "<stdin>", line 1, in <module>\nError: ${msg}` }]);
    }
  }

  private processCommand(cmd: string) {
    // 1. Detecção de Atribuição (variavel = valor)
    // Regex simples para capturar atribuições, ignorando comparações (==)
    const assignmentMatch = cmd.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=(?!=)\s*(.*)$/);

    if (assignmentMatch) {
      const varName = assignmentMatch[1];
      const expr = assignmentMatch[2];
      
      // Avalia o lado direito
      const result = this.evaluatePythonExpression(expr);
      
      // Salva no estado
      this.variables.update(vars => ({ ...vars, [varName]: result }));
      return; // Atribuições não imprimem output no console
    }

    // 2. Avaliação de Expressão
    const result = this.evaluatePythonExpression(cmd);
    
    // No REPL, se o resultado não for None (null/undefined), imprime a representação
    if (result !== undefined && result !== null) {
        this.lines.update(l => [...l, { type: 'output', content: this.formatPythonValue(result, true) }]);
    }
  }

  private evaluatePythonExpression(code: string): any {
    // Pré-processamento: Traduz sintaxe Python para JS
    let jsCode = code;

    // Substituições de Sintaxe
    jsCode = jsCode.replace(/\bTrue\b/g, 'true');
    jsCode = jsCode.replace(/\bFalse\b/g, 'false');
    jsCode = jsCode.replace(/\bNone\b/g, 'null');
    jsCode = jsCode.replace(/\band\b/g, '&&');
    jsCode = jsCode.replace(/\bor\b/g, '||');
    jsCode = jsCode.replace(/\bnot\s+/g, '!');
    
    // Métodos de Lista/String comuns
    jsCode = jsCode.replace(/\.append\(/g, '.push('); // list.append -> array.push
    jsCode = jsCode.replace(/\.pop\(/g, '.pop(');     // list.pop -> array.pop
    jsCode = jsCode.replace(/\.lower\(\)/g, '.toLowerCase()');
    jsCode = jsCode.replace(/\.upper\(\)/g, '.toUpperCase()');

    // Contexto de Execução (Variáveis + Funções Built-in)
    const context: any = {
        ...this.variables(),
        print: (...args: any[]) => {
            const output = args.map(arg => 
                (typeof arg === 'string') ? arg : this.formatPythonValue(arg, false)
            ).join(' ');
            this.lines.update(l => [...l, { type: 'output', content: output }]);
            return null; // print retorna None
        },
        len: (obj: any) => {
            if (Array.isArray(obj) || typeof obj === 'string') return obj.length;
            if (typeof obj === 'object' && obj !== null) return Object.keys(obj).length;
            throw new Error(`object of type '${typeof obj}' has no len()`);
        },
        type: (obj: any) => {
             if (typeof obj === 'string') return "<class 'str'>";
             if (typeof obj === 'number') return Number.isInteger(obj) ? "<class 'int'>" : "<class 'float'>";
             if (typeof obj === 'boolean') return "<class 'bool'>";
             if (Array.isArray(obj)) return "<class 'list'>";
             if (obj === null) return "<class 'NoneType'>";
             if (typeof obj === 'object') return "<class 'dict'>";
             return "<class 'unknown'>";
        },
        str: (obj: any) => String(obj),
        int: (obj: any) => parseInt(obj),
        float: (obj: any) => parseFloat(obj),
    };

    // Criação da Função de Execução
    // Usamos 'new Function' para isolar o escopo das variáveis
    const contextKeys = Object.keys(context);
    const contextValues = Object.values(context);
    
    try {
        // "return " + jsCode permite avaliar expressões e obter o valor
        // Se for um statement (como if), isso falharia, mas para esse emulador simples focamos em expressões
        const func = new Function(...contextKeys, `return ${jsCode}`);
        return func(...contextValues);
    } catch (err) {
        // Tenta executar sem o 'return' caso seja uma expressão que não retorna valor direto ou complexa
        try {
             const func = new Function(...contextKeys, jsCode);
             return func(...contextValues);
        } catch (innerErr) {
            throw err; // Lança o erro original se falhar
        }
    }
  }

  // Formata valores JS para parecerem com Python
  private formatPythonValue(val: any, isRepr: boolean = false): string {
    if (val === null) return 'None';
    if (val === true) return 'True';
    if (val === false) return 'False';
    
    if (typeof val === 'string') {
        return isRepr ? `'${val}'` : val;
    }
    
    if (Array.isArray(val)) {
        // Recursivamente formata itens da lista
        const items = val.map(v => this.formatPythonValue(v, true)).join(', ');
        return `[${items}]`;
    }
    
    if (typeof val === 'object') {
        // Simplificação para dicionários
        try {
            const entries = Object.entries(val).map(([k, v]) => 
                `'${k}': ${this.formatPythonValue(v, true)}`
            ).join(', ');
            return `{${entries}}`;
        } catch (e) { return String(val); }
    }
    
    return String(val);
  }

  clear() {
    this.lines.set([{ type: 'info', content: 'Console limpo.' }]);
    this.variables.set({});
    this.currentInput.set('');
  }
}
