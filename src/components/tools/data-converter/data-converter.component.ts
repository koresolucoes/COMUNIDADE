import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodeUsageTipsComponent } from '../../shared/code-usage-tips/code-usage-tips.component';

declare var jsyaml: any; // Declarado para a biblioteca js-yaml carregada globalmente

type DataFormat = 'json' | 'xml' | 'csv' | 'yaml';

@Component({
  selector: 'app-data-converter',
  standalone: true,
  imports: [FormsModule, CodeUsageTipsComponent],
  templateUrl: './data-converter.component.html',
  styleUrls: ['./data-converter.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataConverterComponent {
  inputFormat = signal<DataFormat>('json');
  outputFormat = signal<DataFormat>('yaml');
  inputText = signal('{\n  "id": 1,\n  "nome": "Produto A",\n  "tags": ["novo", "em-estoque"]\n}');
  outputText = signal('');
  error = signal<string | null>(null);
  copyButtonText = signal('Copiar');
  isProcessing = signal(false);

  convert() {
    this.error.set(null);
    this.outputText.set('');
    this.isProcessing.set(true);

    if (!this.inputText().trim()) {
      this.isProcessing.set(false);
      return;
    }
    
    setTimeout(() => {
      try {
        let parsedData: any;
        switch (this.inputFormat()) {
          case 'json': parsedData = this.parseJson(this.inputText()); break;
          case 'xml': parsedData = this.parseXml(this.inputText()); break;
          case 'csv': parsedData = this.parseCsv(this.inputText()); break;
          case 'yaml': parsedData = this.parseYaml(this.inputText()); break;
        }

        let resultText: string;
        switch (this.outputFormat()) {
          case 'json': resultText = this.stringifyJson(parsedData); break;
          case 'xml': resultText = this.stringifyXml(parsedData); break;
          case 'csv': resultText = this.stringifyCsv(parsedData); break;
          case 'yaml': resultText = this.stringifyYaml(parsedData); break;
        }

        this.outputText.set(resultText);
      } catch (e) {
        this.error.set(e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.');
      } finally {
        this.isProcessing.set(false);
      }
    }, 50);
  }

  // --- PARSERS (Input Text -> Object) ---

  private parseJson(text: string): any {
    try {
      return JSON.parse(text);
    } catch {
      throw new Error('JSON de entrada inválido.');
    }
  }
  
  private parseYaml(text: string): any {
    try {
      return jsyaml.load(text);
    } catch (e) {
      throw new Error(`YAML de entrada inválido: ${e instanceof Error ? e.message : 'Erro desconhecido'}`);
    }
  }

  private parseXml(text: string): any {
    // ... (implementação mantida como antes)
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "application/xml");
    if (xmlDoc.getElementsByTagName("parsererror").length) {
      throw new Error('XML de entrada inválido ou malformado.');
    }
    const result = this.xmlNodeToJson(xmlDoc.documentElement);
    return result[xmlDoc.documentElement.nodeName] || result;
  }

  private xmlNodeToJson(xmlNode: Node): any {
    // ... (implementação mantida como antes)
    const obj: any = {};
    if (xmlNode.nodeType === 1) { // Element
      const element = xmlNode as Element;
      if (element.attributes.length > 0) {
        obj["_attributes"] = {};
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes.item(i)!;
          obj["_attributes"][attr.nodeName] = attr.nodeValue;
        }
      }
    } else if (xmlNode.nodeType === 3) { // Text
      return xmlNode.nodeValue;
    }

    if (xmlNode.hasChildNodes()) {
      for (let i = 0; i < xmlNode.childNodes.length; i++) {
        const item = xmlNode.childNodes.item(i);
        const nodeName = item.nodeName;

        if (nodeName === '#text' && item.nodeValue?.trim() === '') continue;

        const childJson = this.xmlNodeToJson(item);

        if (obj[nodeName] === undefined) {
          obj[nodeName] = childJson;
        } else {
          if (!Array.isArray(obj[nodeName])) {
            obj[nodeName] = [obj[nodeName]];
          }
          obj[nodeName].push(childJson);
        }
      }
    }
    
    const keys = Object.keys(obj);
    if (keys.length === 1 && keys[0] === '#text') {
      return obj['#text'];
    }
    
    return obj;
  }

  private parseCsv(text: string): any[] {
    // ... (implementação mantida como antes)
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) {
      throw new Error('CSV deve ter um cabeçalho e pelo menos uma linha de dados.');
    }
    const headers = lines[0].split(',').map(h => h.trim());
    const result = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) {
         throw new Error(`A linha ${i + 1} tem ${values.length} colunas, mas o cabeçalho tem ${headers.length}.`);
      }
      const obj: { [key: string]: string } = {};
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });
      result.push(obj);
    }
    return result;
  }

  // --- STRINGIFIERS (Object -> Output Text) ---

  private stringifyJson(data: any): string {
    return JSON.stringify(data, null, 2);
  }

  private stringifyYaml(data: any): string {
    return jsyaml.dump(data);
  }

  private stringifyXml(data: any, rootName = 'root'): string {
    // ... (implementação mantida como antes)
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    
    const toXml = (value: any, name: string, indent: string) => {
      if (value === null || value === undefined) return;

      const attributes = value?._attributes ? Object.entries(value._attributes).map(([k, v]) => `${k}="${v}"`).join(' ') : '';
      if (value?._attributes) delete value._attributes;
      const tagName = name.replace(/[^a-zA-Z0-9_.-]/g, '');

      if (Array.isArray(value)) {
        value.forEach(item => toXml(item, name, indent));
        return;
      }

      xml += `${indent}<${tagName}${attributes ? ' ' + attributes : ''}`;
      
      if (typeof value === 'object') {
        const keys = Object.keys(value);
        if (keys.length > 0) {
          xml += '>\n';
          keys.forEach(key => toXml(value[key], key, indent + '  '));
          xml += `${indent}</${tagName}>\n`;
        } else {
          xml += '/>\n';
        }
      } else {
         xml += `>${this.escapeXml(String(value))}</${tagName}>\n`;
      }
    };
    
    const dataIsArray = Array.isArray(data);
    const effectiveRoot = dataIsArray ? 'items' : rootName;
    const content = dataIsArray ? data : [data];

    xml += `<${effectiveRoot}>\n`;
    content.forEach(item => {
        toXml(item, dataIsArray ? 'item' : Object.keys(item)[0] || 'data', '  ');
    });
    xml += `</${effectiveRoot}>`;
    
    return xml;
  }
  
  private escapeXml(unsafe: string): string {
    // ... (implementação mantida como antes)
    return unsafe.replace(/[<>&'"]/g, c => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
  }

  private stringifyCsv(data: any): string {
    // ... (implementação mantida como antes)
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('A conversão para CSV requer um array de objetos não vazio.');
    }
    const headers = Object.keys(data[0]);
    const headerRow = headers.join(',');
    const rows = data.map(obj => {
      return headers.map(header => {
        const value = obj[header] ?? '';
        if (/[",\n\r]/.test(value)) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });
    return [headerRow, ...rows].join('\n');
  }

  // --- UI Methods ---

  clear() {
    this.inputText.set('');
    this.outputText.set('');
    this.error.set(null);
  }

  copyToClipboard() {
    if (!this.outputText()) return;
    navigator.clipboard.writeText(this.outputText()).then(() => {
      this.copyButtonText.set('Copiado!');
      setTimeout(() => this.copyButtonText.set('Copiar'), 2000);
    });
  }
}
