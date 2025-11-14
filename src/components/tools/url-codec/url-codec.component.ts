import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodeUsageTipsComponent } from '../../shared/code-usage-tips/code-usage-tips.component';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserDataService } from '../../../services/user-data.service';
import { ToolDataStateService } from '../../../services/tool-data-state.service';

@Component({
  selector: 'app-url-codec',
  standalone: true,
  imports: [FormsModule, CodeUsageTipsComponent, RouterLink],
  templateUrl: './url-codec.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UrlCodecComponent implements OnInit {
  private authService = inject(AuthService);
  private userDataService = inject(UserDataService);
  private toolDataStateService = inject(ToolDataStateService);
  currentUser = this.authService.currentUser;

  inputText = signal('');
  outputText = signal('');
  error = signal<string | null>(null);
  copyButtonText = signal('Copiar');

  n8nSnippet1 = `https://api.example.com/search?query={{ encodeURIComponent('automação n8n & "testes"') }}`;
  n8nSnippet2 = `https://api.example.com/search?filter={{ encodeURIComponent(JSON.stringify($json.meuObjeto)) }}`;

  pythonSnippet = computed(() => `
from urllib.parse import quote, unquote
import json

# --- Codificação ---
# String com espaços, acentos e caracteres especiais
original_string = 'automação n8n & "testes"'
encoded_string = quote(original_string)
print(f"Original: {original_string}")
print(f"Codificada: {encoded_string}")

# Exemplo com JSON
json_payload = {"nome": "João Silva", "empresa": "Kore"}
# Primeiro, transforma o dicionário em string
json_string = json.dumps(json_payload)
encoded_json = quote(json_string)
print(f"\\nJSON Original: {json_string}")
print(f"JSON Codificado: {encoded_json}")


# --- Decodificação ---
encoded_url = 'https%3A%2F%2Fwww.google.com%2Fsearch%3Fq%3Dn8n%2Bautoma%C3%A7%C3%A3o'
decoded_url = unquote(encoded_url)
print(f"\\nURL Codificada: {encoded_url}")
print(f"URL Decodificada: {decoded_url}")
`);

  javascriptSnippet = computed(() => `
// --- Codificação ---
// String com espaços, acentos e caracteres especiais
const originalString = 'automação n8n & "testes"';
// encodeURIComponent é a função correta para codificar parâmetros de URL
const encodedString = encodeURIComponent(originalString);

console.log(\`Original: \${originalString}\`);
console.log(\`Codificada: \${encodedString}\`);

// Exemplo com JSON
const jsonPayload = { nome: "João Silva", empresa: "Kore" };
// Primeiro, transforma o objeto em string
const jsonString = JSON.stringify(jsonPayload);
const encodedJson = encodeURIComponent(jsonString);

console.log(\`\\nJSON Original: \${jsonString}\`);
console.log(\`JSON Codificado: \${encodedJson}\`);


// --- Decodificação ---
const encodedUrl = 'https%3A%2F%2Fwww.google.com%2Fsearch%3Fq%3Dn8n%2Bautoma%C3%A7%C3%A3o';
const decodedUrl = decodeURIComponent(encodedUrl);

console.log(\`\\nURL Codificada: \${encodedUrl}\`);
console.log(\`URL Decodificada: \${decodedUrl}\`);
`);

  ngOnInit(): void {
      const dataToLoad = this.toolDataStateService.consumeData();
      if (dataToLoad && dataToLoad.toolId === 'url-codec') {
        this.loadState(dataToLoad.data);
      }
  }

  encode() {
    this.error.set(null);
    try {
      this.outputText.set(encodeURIComponent(this.inputText()));
    } catch (e) {
      this.error.set('Erro ao codificar: ' + (e instanceof Error ? e.message : String(e)));
    }
  }

  decode() {
    this.error.set(null);
    try {
      this.outputText.set(decodeURIComponent(this.inputText()));
    } catch (e) {
      this.error.set('Erro ao decodificar: A string de entrada não é uma URI válida.');
    }
  }

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
  
  copyCodeSnippet(content: string) {
    navigator.clipboard.writeText(content);
  }

  async saveData() {
    if (!this.currentUser()) {
      alert('Você precisa estar logado para salvar.');
      return;
    }
    if (!this.inputText()) {
      alert('O campo de entrada não pode estar vazio para salvar.');
      return;
    }
    const title = prompt('Digite um nome para salvar este texto:', `URL Codec - ${new Date().toLocaleDateString()}`);
    if (title) {
      const state = {
        inputText: this.inputText(),
      };
      try {
        await this.userDataService.saveData('url-codec', title, state);
        alert('Texto salvo com sucesso!');
      } catch (e) {
        console.error(e);
        alert('Falha ao salvar o texto.');
      }
    }
  }

  private loadState(state: any) {
    if (!state) return;
    this.inputText.set(state.inputText ?? '');
  }
}
