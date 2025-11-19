import { Component, ChangeDetectionStrategy, signal, input, viewChild, ElementRef, AfterViewChecked, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VirtualFileSystemService } from '../../../services/virtual-file-system.service';

interface ConsoleLine {
  type: 'input' | 'output' | 'error' | 'info';
  content: string;
}

// --- Mock DataFrame Class for Emulation ---
class MockDataFrame {
  _isMockDataFrame = true;
  constructor(public data: any[], public columns?: string[]) {
    if (!this.columns && data && data.length > 0 && typeof data[0] === 'object') {
      this.columns = Object.keys(data[0]);
    }
  }

  get shape() {
    const rows = Array.isArray(this.data) ? this.data.length : 0;
    let cols = 0;
    if (this.columns) {
        cols = this.columns.length;
    } else if (this.data && this.data.length > 0 && typeof this.data[0] === 'object' && this.data[0] !== null) {
        cols = Object.keys(this.data[0]).length;
    }
    return [rows, cols];
  }
  
  get values() {
    return this.data;
  }

  head(n = 5) {
    return new MockDataFrame(this.data.slice(0, n), this.columns);
  }

  drop(label: string, options: { axis: number }) {
    if (options.axis === 1) { // Drop column
      const newColumns = this.columns?.filter(c => c !== label);
      const newData = this.data.map((row: any) => {
        const newRow = {...row};
        delete newRow[label];
        return newRow;
      });
      return new MockDataFrame(newData, newColumns);
    }
    return this; // Drop row not implemented for simplicity
  }

  set(columnName: string, values: any) {
    let valsAsArray: any[];
    if (!Array.isArray(values)) {
      valsAsArray = Array(this.data.length).fill(values);
    } else {
      valsAsArray = values;
    }

    if (this.data.length > 0 && this.data.length !== valsAsArray.length) {
        throw new Error(`ValueError: Length of values (${valsAsArray.length}) does not match length of index (${this.data.length})`);
    }
    
    if (this.data.length === 0 && valsAsArray.length > 0) {
      this.data = Array(valsAsArray.length).fill(null).map(() => ({}));
    }

    this.data.forEach((row, i) => {
        if(typeof row !== 'object' || row === null) {
            this.data[i] = {};
        }
        this.data[i][columnName] = valsAsArray[i];
    });

    if (!this.columns) {
        this.columns = [];
    }
    if (!this.columns.includes(columnName)) {
        this.columns.push(columnName);
    }
  }

  get(columnName: string): any[] {
    if (!this.columns?.includes(columnName)) {
      if (this.data.length > 0 && this.data[0] && this.data[0].hasOwnProperty(columnName)) {
         this.columns?.push(columnName);
      } else {
        throw new Error(`KeyError: "${columnName}"`);
      }
    }
    return this.data.map((row: any) => row[columnName]);
  }

  round(decimals: number) {
    const newData = this.data.map(row => {
      const newRow: any = {};
      for (const key in row) {
        if (typeof row[key] === 'number') {
          newRow[key] = parseFloat(row[key].toFixed(decimals));
        } else {
          newRow[key] = row[key];
        }
      }
      return newRow;
    });
    return new MockDataFrame(newData, this.columns);
  }
}

@Component({
  selector: 'app-python-console',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './python-console.component.html',
  styleUrls: ['./python-console.component.css'],
  host: {
    '(keydown.escape)': 'isExpanded.set(false)'
  }
})
export class PythonConsoleComponent implements OnInit, AfterViewChecked {
  initialCode = input<string>('');
  setupCode = input<string>('');
  outputHeight = input<string>('300px');
  vfs = inject(VirtualFileSystemService);
  
  lines = signal<ConsoleLine[]>([
    { type: 'info', content: 'Python 3.10.0 (Kore Web Shell)' },
    { type: 'info', content: 'Bibliotecas emuladas: pandas, sklearn.' },
    { type: 'info', content: '---' }
  ]);
  
  codeToRun = signal('');
  isRunning = signal(false);
  isExpanded = signal(false);
  
  terminalOutput = viewChild<ElementRef>('terminalOutput');
  
  ngOnInit(): void {
    this.codeToRun.set(this.initialCode());
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleExpand() {
    this.isExpanded.update(v => !v);
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
    const mainCode = this.codeToRun();
    if (!mainCode.trim() || this.isRunning()) return;

    this.isRunning.set(true);
    this.lines.update(l => [...l, { type: 'info', content: `--- Executando script ---` }]);

    try {
        const setup = this.setupCode();
        const silentSetup = setup.split('\n').map(line => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('print(') || trimmedLine.startsWith('print"')) {
                return `# ${line}`;
            }
            return line;
        }).join('\n');
        
        const fullCode = silentSetup + '\n' + mainCode;
        await this.executeBlock(fullCode);
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        this.lines.update(l => [...l, { type: 'error', content: `Traceback (most recent call last):\n  File "<stdin>", line 1, in <module>\n${msg}` }]);
    } finally {
        this.isRunning.set(false);
    }
  }

  private async executeBlock(code: string): Promise<void> {
      const jsCode = this.transpilePythonToJs(code);

      // --- Mock Python Environment ---
      const mockHousingData = {
          data: [[ 8.3252, 41, 6.984127, 1.02381, 322, 2.555556, 37.88, -122.23 ], [ 8.3014, 21, 6.238135, 0.97188, 2401, 2.109842, 37.86, -122.22 ]],
          target: [4.526, 3.585],
          feature_names: ['MedInc', 'HouseAge', 'AveRooms', 'AveBedrms', 'Population', 'AveOccup', 'Latitude', 'Longitude'],
      };

      class MockLinearRegression {
          fit(X: any, y: any) { /* no-op for simulation */ }
          predict(X: any[]) {
              // Simple prediction: take the first feature, scale it, and add some noise
              return X.map(row => (row[0] * 0.4 + 0.5) + (Math.random() - 0.5) * 0.3);
          }
      }

      const context: any = {
          print: (...args: any[]) => {
              const output = args.map(arg => this.formatPythonValue(arg)).join(' ');
              this.lines.update(l => [...l, { type: 'output', content: output }]);
          },
          pd: {
              DataFrame: (data: any, options?: { columns: string[] }) => {
                  if (data && data._isMockDataFrame) {
                      return new MockDataFrame(data.data, data.columns);
                  }
                  
                  let objectData: any[] = [];
                  let dfColumns: string[] | undefined = options?.columns;

                  if (!Array.isArray(data) && typeof data === 'object' && data !== null) {
                      const keys = Object.keys(data);
                      if (keys.length > 0 && Array.isArray(data[keys[0]])) {
                          const numRows = data[keys[0]].length;
                          for (let i = 0; i < numRows; i++) {
                              const row: any = {};
                              for (const key of keys) {
                                  row[key] = data[key][i];
                              }
                              objectData.push(row);
                          }
                          dfColumns = keys;
                      } else {
                        objectData = [data];
                      }
                  }
                  else if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0]) && dfColumns) {
                      objectData = data.map(rowArray => {
                          const rowObject: any = {};
                          dfColumns!.forEach((col, i) => {
                              rowObject[col] = rowArray[i];
                          });
                          return rowObject;
                      });
                  }
                  else {
                      objectData = data;
                  }

                  return new MockDataFrame(objectData, dfColumns);
              }
          },
          fetch_california_housing: () => mockHousingData,
          train_test_split: (X: any, y: any, options: any) => {
              const dfX = X instanceof MockDataFrame ? X.data : X;
              const dfY = y;
              const testSize = options.test_size || 0.2;
              const splitIndex = Math.floor(dfX.length * (1 - testSize));
              return [
                  dfX.slice(0, splitIndex), dfX.slice(splitIndex),
                  dfY.slice(0, splitIndex), dfY.slice(splitIndex)
              ];
          },
          LinearRegression: MockLinearRegression,
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

      Object.defineProperty(Array.prototype, 'shape', {
        get: function() { 
            if (this.length > 0 && Array.isArray(this[0])) {
                return [this.length, this[0].length];
            }
            return [this.length];
        },
        configurable: true
      });
      
      try {
          const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
          const func = new AsyncFunction(...Object.keys(context), jsCode);
          await func(...Object.values(context));
      } finally {
          delete (Array.prototype as any).shape;
      }
  }
  
  private transpilePythonToJs(code: string): string {
    let jsCode = code;
    jsCode = jsCode.replace(/^(?:from .* )?import .*$/gm, '');
    jsCode = jsCode.replace(/\bTrue\b/g, 'true');
    jsCode = jsCode.replace(/\bFalse\b/g, 'false');
    jsCode = jsCode.replace(/\bNone\b/g, 'null');
    jsCode = jsCode.replace(/\band\b/g, '&&');
    jsCode = jsCode.replace(/\bor\b/g, '||');
    jsCode = jsCode.replace(/\bnot\s+/g, '!');
    jsCode = jsCode.replace(/#.*$/gm, '');
    
    jsCode = jsCode.replace(/f"([^"]*)"/g, (_, content) => '`' + content.replace(/\{([^}]+)\}/g, '${$1}') + '`');
    jsCode = jsCode.replace(/f'([^']*)'/g, (_, content) => '`' + content.replace(/\{([^}]+)\}/g, '${$1}') + '`');
    
    jsCode = jsCode.replace(/(\w+(\.\w+)*)\[['"]([^'"]+)['"]\]\s*=\s*(.+)/gm, '$1.set("$3", $4)');
    jsCode = jsCode.replace(/(\w+(\.\w+)*)\[['"]([^'"]+)['"]\](?!\s*=)/g, '$1.get("$3")');
    
    jsCode = jsCode.replace(/^([a-zA-Z0-9_,\s]+?)\s*=\s*([^=].*)/gm, (match, lhs, rhs) => {
        if (lhs.includes(',')) {
            return `var [${lhs.trim()}] = ${rhs.trim()}`;
        }
        return match;
    });

    jsCode = jsCode.replace(/(\w+)\[:(\d+)\]/g, '$1.slice(0, $2)');
    
    // Specific fix for Scikit-learn classes
    jsCode = jsCode.replace(/\b(LinearRegression)\(\)/g, 'new $1()');

    return jsCode;
  }

  private formatPythonValue(val: any): string {
    if (val === null) return 'None';
    if (val === true) return 'True';
    if (val === false) return 'False';
    if (val && val._isMockDataFrame) return this.formatDataFrame(val);
    if (val && val.toString && val.toString().startsWith('<Response')) return val.toString();
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
      return this.formatDataFrame(new MockDataFrame(val));
    }
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
        try { return JSON.stringify(val, null, 2); } catch (e) { return String(val); }
    }
    return String(val);
  }

  private formatDataFrame(df: MockDataFrame): string {
    const data = df.data;
    const columns = df.columns || (data && data.length > 0 && data[0] ? Object.keys(data[0]) : []);
    if (!data || data.length === 0 || columns.length === 0) return 'Empty DataFrame\n';

    const colWidths: number[] = columns.map(c => c.length);
    const rowsAsStrings = data.map((row: any) => {
        return columns.map((col, i) => {
            const valStr = String(row[col]);
            if (valStr.length > colWidths[i]) colWidths[i] = valStr.length;
            return valStr;
        });
    });

    let output = ' ' + columns.map((c, i) => c.padEnd(colWidths[i])).join('  ') + '\n';
    rowsAsStrings.forEach((row, rowIndex) => {
        const indexStr = String(rowIndex).padEnd(String(data.length -1).length);
        output += indexStr + ' ' + row.map((val, i) => val.padEnd(colWidths[i])).join('  ') + '\n';
    });
    return output;
  }

  clear() {
    this.lines.set([
      { type: 'info', content: 'Console limpo.' },
      { type: 'info', content: '---' }
    ]);
  }
}