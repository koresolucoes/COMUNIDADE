import { Component, ChangeDetectionStrategy, signal, computed, input, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodeUsageTipsComponent } from '../../shared/code-usage-tips/code-usage-tips.component';
import { AuthService } from '../../../services/auth.service';
import { UserDataService } from '../../../services/user-data.service';
import { ToolDataStateService } from '../../../services/tool-data-state.service';
import { RouterLink } from '@angular/router';

interface JsonError {
  message: string;
  line: number | null;
}

@Component({
  selector: 'app-json-formatter',
  standalone: true,
  imports: [FormsModule, CodeUsageTipsComponent, RouterLink],
  templateUrl: './json-formatter.component.html',
  styleUrls: ['./json-formatter.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsonFormatterComponent implements OnInit {
  isEmbedded = input<boolean>(false);
  
  private authService = inject(AuthService);
  private userDataService = inject(UserDataService);
  private toolDataStateService = inject(ToolDataStateService);
  currentUser = this.authService.currentUser;

  jsonContent = signal('');
  error = signal<JsonError | null>(null);
  copyButtonText = signal('Copiar');
  validationStatus = signal<'unchecked' | 'valid' | 'invalid'>('unchecked');

  pythonSnippet = computed(() => `
import json

# Um dicionário Python para exemplo
data = {
    "user": {
        "id": 123,
        "name": "João Silva",
        "isActive": True
    },
    "permissions": ["read", "write"]
}

# 1. Formatar (pretty-print)
# indent=2 cria uma string legível. ensure_ascii=False garante que acentos como 'ã' sejam mantidos.
formatted_json_str = json.dumps(data, indent=2, ensure_ascii=False)
print("--- JSON Formatado ---")
print(formatted_json_str)

# 2. Minificar
# separators remove espaços em branco, criando a string mais compacta possível.
minified_json_str = json.dumps(data, separators=(',', ':'), ensure_ascii=False)
print("\\n--- JSON Minificado ---")
print(minified_json_str)

# 3. Analisar (Parse) de uma string para um objeto Python
# json.loads converte a string JSON de volta para um dicionário.
parsed_data = json.loads(minified_json_str)
print("\\n--- Objeto Analisado ---")
print(parsed_data)
print(f"Nome do usuário: {parsed_data['user']['name']}")
`);

  javascriptSnippet = computed(() => `
// Um objeto JavaScript para exemplo
const data = {
    user: {
        id: 123,
        name: "João Silva",
        isActive: true
    },
    permissions: ["read", "write"]
};

// 1. Formatar (pretty-print)
// O segundo argumento 'null' é o 'replacer', o terceiro é o número de espaços para indentação.
const formattedJsonStr = JSON.stringify(data, null, 2);
console.log("--- JSON Formatado ---");
console.log(formattedJsonStr);

// 2. Minificar
// Sem os argumentos 'replacer' e 'space', a saída é minificada por padrão.
const minifiedJsonStr = JSON.stringify(data);
console.log("\\n--- JSON Minificado ---");
console.log(minifiedJsonStr);

// 3. Analisar (Parse) de uma string para um objeto JS
// JSON.parse() converte a string JSON de volta para um objeto.
const parsedData = JSON.parse(minifiedJsonStr);
console.log("\\n--- Objeto Analisado ---");
console.log(parsedData);
console.log(\`Nome do usuário: \${parsedData.user.name}\`);
`);

  errorLinePosition = computed(() => {
    const err = this.error();
    if (this.validationStatus() !== 'invalid' || !err || err.line === null) {
      return null;
    }
    const lineHeight = 24; // Corresponds to 1.5rem line-height in CSS
    const top = (err.line - 1) * lineHeight;
    return `${top}px`;
  });

  ngOnInit() {
    const dataToLoad = this.toolDataStateService.consumeData();
    if (dataToLoad && dataToLoad.toolId === 'json-formatter') {
      this.jsonContent.set(dataToLoad.data.content);
      this.validateJson();
    }
  }

  onContentChange(newContent: string) {
    this.jsonContent.set(newContent);
    this.validationStatus.set('unchecked');
    this.error.set(null);
  }

  private parseError(e: Error): JsonError {
    const genericMessage = e.message.replace('JSON.parse: ','').replace('Unexpected token', 'Token inesperado');
    
    // Try to find line number from different error message formats
    const positionMatch = e.message.match(/at position (\d+)/);
    if (positionMatch) {
       const position = parseInt(positionMatch[1], 10);
       const textBeforeError = this.jsonContent().substring(0, position);
       const errorLine = textBeforeError.split('\n').length;
       return { message: genericMessage, line: errorLine };
    }

    const lineColMatch = e.message.match(/at line (\d+)/);
    if (lineColMatch) {
        const line = parseInt(lineColMatch[1], 10);
        return { message: genericMessage, line: line };
    }

    return { message: genericMessage, line: null };
  }

  validateJson() {
    this.error.set(null);
    if (!this.jsonContent().trim()) {
      this.error.set({ message: 'O conteúdo não pode estar vazio.', line: null });
      this.validationStatus.set('invalid');
      return false;
    }

    try {
      JSON.parse(this.jsonContent());
      this.validationStatus.set('valid');
      return true;
    } catch (e) {
      this.validationStatus.set('invalid');
      if (e instanceof Error) {
        this.error.set(this.parseError(e));
      } else {
        this.error.set({ message: 'Ocorreu um erro desconhecido ao analisar o JSON.', line: null });
      }
      return false;
    }
  }

  private _parseJsonInternal(): any | null {
    try {
        return JSON.parse(this.jsonContent());
    } catch (e) {
        this.validateJson();
        return null;
    }
  }

  formatJson() {
    const parsed = this._parseJsonInternal();
    if (parsed) {
      this.jsonContent.set(JSON.stringify(parsed, null, 2));
      this.validationStatus.set('valid');
    }
  }

  minifyJson() {
    const parsed = this._parseJsonInternal();
    if (parsed) {
      this.jsonContent.set(JSON.stringify(parsed));
       this.validationStatus.set('valid');
    }
  }

  clearContent() {
    this.jsonContent.set('');
    this.error.set(null);
    this.validationStatus.set('unchecked');
  }

  copyToClipboard() {
    if (!this.jsonContent() || this.validationStatus() === 'invalid') return;
    navigator.clipboard.writeText(this.jsonContent()).then(() => {
      this.copyButtonText.set('Copiado!');
      setTimeout(() => this.copyButtonText.set('Copiar'), 2000);
    });
  }

  copyCodeSnippet(content: string) {
    navigator.clipboard.writeText(content);
  }

  async saveData() {
    if (!this.currentUser()) {
      alert('Você precisa estar logado para salvar.');
      return;
    }
    if(this.validationStatus() === 'invalid' || !this.jsonContent()){
      alert('O JSON precisa ser válido e não pode estar vazio para ser salvo.');
      return;
    }
    const title = prompt('Digite um nome para salvar este JSON:', 'Meu JSON');
    if (title) {
      try {
        await this.userDataService.saveData('json-formatter', title, { content: this.jsonContent() });
        alert('JSON salvo com sucesso!');
      } catch (e) {
        console.error(e);
        alert('Falha ao salvar o JSON.');
      }
    }
  }
}