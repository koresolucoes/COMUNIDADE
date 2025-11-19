import { Component, ChangeDetectionStrategy, signal, input, viewChild, ElementRef, AfterViewChecked, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VirtualFileSystemService } from '../../../services/virtual-file-system.service';

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
export class PythonConsoleComponent implements OnInit, AfterViewChecked {
  initialCode = input<string>('');
  outputHeight = input<string>('300px');
  vfs = inject(VirtualFileSystemService);
  
  lines = signal<ConsoleLine[]>([
    { type: 'info', content: 'Python 3.10.0 (Kore Web Shell)' },
    { type: 'info', content: 'Funções disponíveis: print(), requests.get(), requests.post(), e funções de arquivo.' },
    { type: 'info', content: '---' }
  ]);
  
  codeToRun = signal('');
  isRunning = signal(false);
  
  terminalOutput = viewChild<ElementRef>('terminalOutput');
  
  ngOnInit(): void {
    this.codeToRun.set(this.initialCode());
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

  async runCode() {
    const rawCode = this.codeToRun();
    if (!rawCode.trim() || this.isRunning()) return;

    this.isRunning.set(true);
    this.lines.update(l => [...l, { type: 'info', content: `--- Executando script ---` }]);

    try {
        await this.executeBlock(rawCode);
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        this.lines.update(l => [...l, { type: 'error', content: `Traceback (most recent call last):\n  File "<stdin>", line 1, in <module>\n${msg}` }]);
    } finally {
        this.isRunning.set(false);
    }
  }

  private async executeBlock(code: string): Promise<void> {
      const jsCode = this.transpilePythonToJs(code);

      const context: any = {
          print: (...args: any[]) => {
              const output = args.map(arg => 
                  (typeof arg === 'string') ? arg : this.formatPythonValue(arg)
              ).join(' ');
              this.lines.update(l => [...l, { type: 'output', content: output }]);
          },
          requests: {
            get: async (url: string, options: { params?: Record<string,any>, headers?: Record<string,any> } = {}) => this.makeRequest('GET', url, options),
            post: async (url: string, options: { json?: any, data?: any, headers?: Record<string,any> } = {}) => this.makeRequest('POST', url, options),
          },
          leia_arquivo: (path: string) => this.vfs.readFile(path),
          escreva_arquivo: (path: string, content: string, mode: 'w' | 'a' = 'w') => {
            if (mode === 'a') {
              this.vfs.appendFile(path, content);
            } else {
              this.vfs.writeFile(path, content);
            }
          },
          carregue_json: (path: string) => JSON.parse(this.vfs.readFile(path)),
          salve_json: (path: string, data: any) => this.vfs.writeFile(path, JSON.stringify(data, null, 2)),
      };

      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const func = new AsyncFunction(...Object.keys(context), jsCode);
      await func(...Object.values(context));
  }
  
  private async makeRequest(method: 'GET' | 'POST', url: string, options: any) {
    const fullUrl = new URL(url);
    if (options.params) {
      for (const key in options.params) {
        fullUrl.searchParams.append(key, options.params[key]);
      }
    }

    const body = options.json ? JSON.stringify(options.json) : options.data;

    const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            url: fullUrl.toString(),
            method: method,
            headers: options.headers || {},
            body: body,
        })
    });

    const resJson = await response.json();
    if (!response.ok) {
      throw new Error(`Request failed: ${resJson.error || resJson.statusText}`);
    }

    return {
        status_code: resJson.status,
        text: resJson.body,
        json: () => JSON.parse(resJson.body),
        headers: resJson.headers,
        toString: () => `<Response [${resJson.status}]>`
    };
  }

  private transpilePythonToJs(code: string): string {
    let jsCode = code;
    jsCode = jsCode.replace(/\bTrue\b/g, 'true');
    jsCode = jsCode.replace(/\bFalse\b/g, 'false');
    jsCode = jsCode.replace(/\bNone\b/g, 'null');
    jsCode = jsCode.replace(/\band\b/g, '&&');
    jsCode = jsCode.replace(/\bor\b/g, '||');
    jsCode = jsCode.replace(/\bnot\s+/g, '!');
    jsCode = jsCode.replace(/#.*$/gm, '');
    return jsCode;
  }

  private formatPythonValue(val: any): string {
    if (val === null) return 'None';
    if (val === true) return 'True';
    if (val === false) return 'False';
    
    if (val && val.toString && val.toString().startsWith('<Response')) {
        return val.toString();
    }
    
    if (typeof val === 'string') {
        return `'${val}'`;
    }
    
    if (Array.isArray(val)) {
        const items = val.map(v => this.formatPythonValue(v)).join(', ');
        return `[${items}]`;
    }
    
    if (typeof val === 'object') {
        try {
            const entries = Object.entries(val).map(([k, v]) => 
                `'${k}': ${this.formatPythonValue(v)}`
            ).join(', ');
            return `{${entries}}`;
        } catch (e) { return String(val); }
    }
    
    return String(val);
  }

  clear() {
    this.lines.set([
      { type: 'info', content: 'Console limpo.' },
      { type: 'info', content: '---' }
    ]);
  }
}
