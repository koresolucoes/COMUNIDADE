import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodeUsageTipsComponent } from '../../shared/code-usage-tips/code-usage-tips.component';

@Component({
  selector: 'app-url-codec',
  standalone: true,
  imports: [FormsModule, CodeUsageTipsComponent],
  templateUrl: './url-codec.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UrlCodecComponent {
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
}