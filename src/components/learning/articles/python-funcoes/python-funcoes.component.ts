
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PythonConsoleComponent } from '../../../shared/python-console/python-console.component';

interface FunctionPreset {
  id: string;
  name: string;
  description: string;
  params: { name: string; type: 'text' | 'number'; label: string; min?: number; max?: number; step?: number }[];
  logicDisplay: string; // Python code inside the function
  color: string;
}

@Component({
  selector: 'app-python-funcoes',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule, PythonConsoleComponent],
  templateUrl: './python-funcoes.component.html',
  styleUrls: ['./python-funcoes.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PythonFuncoesComponent {
  
  // --- FUNCTION FACTORY STATE ---
  presets: FunctionPreset[] = [
    {
      id: 'math',
      name: 'calcular_desconto',
      description: 'Calcula o preço final após aplicar uma porcentagem de desconto.',
      color: 'blue',
      params: [
        { name: 'preco', type: 'number', label: 'Preço (R$)', min: 0, max: 1000, step: 10 },
        { name: 'porcentagem', type: 'number', label: 'Desconto (%)', min: 0, max: 100, step: 5 }
      ],
      logicDisplay: `    desconto = preco * (porcentagem / 100)
    final = preco - desconto
    return final`
    },
    {
      id: 'text',
      name: 'gerar_saudacao',
      description: 'Cria uma mensagem personalizada com base no nome e horário.',
      color: 'green',
      params: [
        { name: 'nome', type: 'text', label: 'Nome' },
        { name: 'periodo', type: 'text', label: 'Período (Dia/Tarde)' }
      ],
      logicDisplay: `    if periodo == "Dia":
        msg = f"Bom dia, {nome}!"
    else:
        msg = f"Boa tarde, {nome}!"
    return msg`
    },
    {
      id: 'logic',
      name: 'pode_beber',
      description: 'Verifica se a idade permite consumo de álcool (regra BR).',
      color: 'purple',
      params: [
        { name: 'idade', type: 'number', label: 'Idade', min: 0, max: 100, step: 1 }
      ],
      logicDisplay: `    if idade >= 18:
        return True
    else:
        return False`
    }
  ];

  selectedPresetId = signal('math');
  
  // Input Values
  val1 = signal<string | number>(100);
  val2 = signal<string | number>(20);

  activePreset = computed(() => this.presets.find(p => p.id === this.selectedPresetId())!);

  // Computed Results
  functionResult = computed(() => {
    const id = this.selectedPresetId();
    const v1 = this.val1();
    const v2 = this.val2();

    if (id === 'math') {
      const price = Number(v1);
      const pct = Number(v2);
      return (price - (price * pct / 100)).toFixed(2);
    } else if (id === 'text') {
      const nome = String(v1);
      const periodo = String(v2);
      return periodo === 'Dia' ? `Bom dia, ${nome}!` : `Boa tarde, ${nome}!`;
    } else if (id === 'logic') {
      const idade = Number(v1);
      return idade >= 18 ? 'True' : 'False';
    }
    return '';
  });

  pythonCallCode = computed(() => {
    const p = this.activePreset();
    const v1 = typeof this.val1() === 'string' ? `"${this.val1()}"` : this.val1();
    
    if (p.params.length === 1) {
        return `resultado = ${p.name}(${v1})`;
    } else {
        const v2 = typeof this.val2() === 'string' ? `"${this.val2()}"` : this.val2();
        return `resultado = ${p.name}(${v1}, ${v2})`;
    }
  });

  // --- SCOPE SIMULATOR STATE ---
  scopeStep = signal(0); // 0: Start, 1: Inside Function, 2: End
  
  globalVar = signal('Kore');
  localVar = signal('Python');

  scopeStepsInfo = [
    { title: 'Estado Inicial', desc: 'O programa começa. A variável `empresa` é criada no Escopo Global.' },
    { title: 'Chamando a Função', desc: 'A função `imprimir_dados` é chamada. Um novo Escopo Local é criado. A variável `linguagem` só existe aqui dentro.' },
    { title: 'Fim da Execução', desc: 'A função termina. O Escopo Local é destruído. A variável `linguagem` deixa de existir. Voltamos ao Global.' }
  ];

  nextScopeStep() {
    this.scopeStep.update(s => (s + 1) % 3);
  }
  
  // --- CONSOLE EXERCISE ---
  consoleExercise = `# Desafio: Crie uma função que converte graus Celsius para Fahrenheit
# Fórmula: (C * 9/5) + 32

def converter(celsius):
    # Escreva sua lógica aqui
    # fahrenheit = ...
    # return fahrenheit
    return (celsius * 9/5) + 32

# Teste sua função
temp = converter(30)
print(f"30°C é igual a {temp}°F")`;

  selectPreset(id: string) {
    this.selectedPresetId.set(id);
    // Reset defaults based on preset
    if (id === 'math') { this.val1.set(100); this.val2.set(20); }
    if (id === 'text') { this.val1.set('Ana'); this.val2.set('Dia'); }
    if (id === 'logic') { this.val1.set(16); this.val2.set(0); }
  }
}
