import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodeUsageTipsComponent } from '../../shared/code-usage-tips/code-usage-tips.component';

@Component({
  selector: 'app-base64-codec',
  standalone: true,
  imports: [FormsModule, CodeUsageTipsComponent],
  templateUrl: './base64-codec.component.html',
  styles: [`
    #encryption-toggle:checked ~ div > .dot {
        transform: translateX(1.5rem);
        background-color: #58a6ff;
    }
    #encryption-toggle:checked ~ .block {
      background-color: #30363d;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Base64CodecComponent {
  inputText = signal('');
  outputText = signal('');
  password = signal('');
  isEncryptionEnabled = signal(false);
  error = signal<string | null>(null);
  copyButtonText = signal('Copiar');
  isProcessing = signal(false);
  selectedCharset = signal('UTF-8');

  popularCharsets = ['UTF-8', 'ASCII', 'ISO-8859-1', 'ISO-8859-2', 'ISO-8859-6', 'ISO-8859-15', 'Windows-1252'];
  otherCharsets = ['UTF-16', 'UTF-16BE', 'UTF-16LE'];

  // --- Code Snippets ---
  
  pythonEncryptionSnippet = computed(() => {
    const pwd = this.password() || 'SUA_SENHA_SECRETA';
    const data = this.outputText() || 'COLE_SEUS_DADOS_B64_AQUI';

    return `# Requer: pip install cryptography
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
import os

# --- Seus Dados ---
# Substitua pelos seus valores. No n8n, você pode usar expressões como:
# password = items[0].json['secretKey']
# encrypted_data_b64 = items[0].json['encryptedField']
password = "${pwd}"
encrypted_data_b64 = "${data}"

# --- Lógica de Descriptografia ---
def decrypt_data(password_str, encrypted_b64):
    try:
        combined_data = base64.b64decode(encrypted_b64)
        
        # O dado combinado deve ter no mínimo: 16 (salt) + 12 (iv) + 16 (auth tag) = 44 bytes
        if len(combined_data) < 44:
            return "Erro: Dados criptografados corrompidos ou incompletos (comprimento inválido)."
        
        # Extrai salt (16 bytes), iv (12 bytes) e o texto cifrado
        salt = combined_data[:16]
        iv = combined_data[16:28]
        ciphertext = combined_data[28:]
        
        # Deriva a chave da senha (usando os mesmos parâmetros da UI)
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,  # 32 bytes = 256 bits
            salt=salt,
            iterations=100000
        )
        key = kdf.derive(password_str.encode('utf-8'))
        
        # Descriptografa os dados usando AES-GCM
        aesgcm = AESGCM(key)
        decrypted_bytes = aesgcm.decrypt(iv, ciphertext, None)
        
        return decrypted_bytes.decode('utf-8')
    except Exception as e:
        # Em um cenário real, trate o erro de forma mais robusta
        return f"Erro ao descriptografar: {e}"

# --- Execução e Retorno para n8n ---
decrypted_text = decrypt_data(password, encrypted_data_b64)

# O nó Python do n8n espera uma lista de dicionários como retorno.
# Cada dicionário se torna um "item" na saída do nó.
# Aqui, estamos criando um item com o resultado da descriptografia.
return [{'json': {'decryptedResult': decrypted_text}}]
`;
  });

  javascriptEncryptionSnippet = computed(() => {
    const pwd = this.password() || 'SUA_SENHA_SECRETA';
    const data = this.outputText() || 'COLE_SEUS_DADOS_B64_AQUI';
    
    return `// Roda em ambiente Node.js (como o nó "Execute Code" do n8n)
// IMPORTANTE: Este código requer o módulo 'crypto' do Node.js.
// Algumas instâncias do n8n podem desabilitar este módulo por segurança.
// Se você receber um erro como "Module 'crypto' is disallowed",
// use a alternativa com o nó Python, que é mais configurável.
const crypto = require('crypto');

// --- Seus Dados ---
// Substitua pelos seus valores. No n8n, você pode usar expressões como:
// const password = items[0].json.secretKey;
// const encryptedBase64 = items[0].json.encryptedField;
const password = '${pwd}';
const encryptedBase64 = '${data}';

// --- Lógica de Descriptografia ---
async function decryptText(passwordStr, encryptedB64) {
  try {
    const combined = Buffer.from(encryptedB64, 'base64');
    
    // O dado combinado deve ter no mínimo: 16 (salt) + 12 (iv) + 16 (auth tag) = 44 bytes
    if (combined.length < 44) {
      return { error: "Erro: Dados criptografados corrompidos ou incompletos (comprimento inválido)." };
    }
    
    // Extrai salt (16 bytes), iv (12 bytes) e o texto cifrado
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    // A tag de autenticação (16 bytes) é embutida no final do ciphertext pelo AES-GCM
    const ciphertext = combined.slice(28);

    // Deriva a chave da senha (usando os mesmos parâmetros da UI)
    const key = await new Promise((resolve, reject) => {
      crypto.pbkdf2(passwordStr, salt, 100000, 32, 'sha256', (err, derivedKey) => {
        if (err) reject(err);
        resolve(derivedKey);
      });
    });
    
    // Descriptografa os dados usando AES-GCM
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    // A tag de autenticação é extraída do final do ciphertext
    const authTag = ciphertext.slice(ciphertext.length - 16);
    decipher.setAuthTag(authTag);
    
    const encryptedPart = ciphertext.slice(0, ciphertext.length - 16);
    const decrypted = Buffer.concat([decipher.update(encryptedPart), decipher.final()]);
    
    return decrypted.toString('utf-8');
  } catch (error) {
    // Retorna uma mensagem de erro clara para o n8n
    return { error: "Falha na descriptografia. Verifique a senha ou os dados de entrada.", details: error.message };
  }
}

// --- Execução e Retorno para n8n ---
// O nó "Execute Code" do n8n permite top-level await.
const decrypted = await decryptText(password, encryptedBase64);

// Retorna o resultado para os próximos nós.
// Cada objeto no array se torna um "item" na saída do nó.
return [{ json: { decryptedResult: decrypted } }];
`;
  });

  pythonBase64Snippet = computed(() => {
    return `# O módulo 'base64' é padrão no Python, não requer instalação extra.
import base64

# --- Seus Dados ---
# Substitua pelos seus valores. No n8n, você pode usar expressões como:
# text_to_encode = items[0].json['meuCampoDeTexto']
text_to_encode = "Olá, n8n! Codificando para Base64."
base64_to_decode = "T2zDoSwgbjhuISBEZWNvZGlmaWNhbmRvIGRlIEJhc2U2NC4=" # "Olá, n8n! Decodificando de Base64."

# --- Lógica de Codificação ---
def encode_text_to_base64(text_str):
    message_bytes = text_str.encode('utf-8')
    base64_bytes = base64.b64encode(message_bytes)
    return base64_bytes.decode('utf-8')

# --- Lógica de Decodificação ---
def decode_text_from_base64(base64_str):
    try:
        base64_bytes = base64_str.encode('utf-8')
        message_bytes = base64.b64decode(base64_bytes)
        return message_bytes.decode('utf-8')
    except Exception as e:
        return f"Erro ao decodificar: {e}"

# --- Execução e Retorno para n8n ---
encoded_result = encode_text_to_base64(text_to_encode)
decoded_result = decode_text_from_base64(base64_to_decode)

# Retorna os resultados para os próximos nós do n8n.
return [{'json': {'encoded': encoded_result, 'decoded': decoded_result}}]
`;
  });
  
  javascriptBase64Snippet = computed(() => {
    return `// Roda em ambiente Node.js (como o nó "Execute Code" do n8n).

// --- Seus Dados ---
// Substitua pelos seus valores. No n8n, você pode usar expressões como:
// const textToEncode = items[0].json.meuCampoDeTexto;
const textToEncode = 'Olá, n8n! Codificando para Base64.';
const base64ToDecode = 'T2zDoSwgbjhuISBEZWNvZGlmaWNhbmRvIGRlIEJhc2U2NC4=';

// --- Lógica de Codificação e Decodificação ---
// Em Node.js, o objeto Buffer é a forma correta e segura de lidar com Base64.
const encoded = Buffer.from(textToEncode, 'utf-8').toString('base64');
const decoded = Buffer.from(base64ToDecode, 'base64').toString('utf-8');

// --- Retorno para n8n ---
// Retorna os resultados para os próximos nós.
// Cada objeto no array se torna um "item" na saída do nó.
return [{
  json: {
    encodedResult: encoded,
    decodedResult: decoded
  }
}];
`;
  });

  // --- Web Crypto API Helpers ---

  private async getKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }
  
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary_string = atob(base64);
    const bytes = new Uint8Array(binary_string.length);
    for (let i = 0; i < binary_string.length; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // --- Main Logic ---

  async handleEncode() {
    if (this.isEncryptionEnabled()) {
      await this.encrypt();
    } else {
      this.base64Encode();
    }
  }

  async handleDecode() {
    if (this.isEncryptionEnabled()) {
      await this.decrypt();
    } else {
      this.base64Decode();
    }
  }

  private base64Encode() {
    this.error.set(null);
    if (!this.inputText()) {
      this.outputText.set('');
      return;
    }
    try {
      // Use the polyfilled TextEncoder that accepts an encoding label
      const encoder = new (window as any).TextEncoder(this.selectedCharset(), { NONSTANDARD_allowLegacyEncoding: true });
      const encodedBytes = encoder.encode(this.inputText());
      this.outputText.set(this.arrayBufferToBase64(encodedBytes.buffer));
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      this.error.set(`Erro ao codificar: ${errorMessage}`);
      this.outputText.set('');
    }
  }

  private base64Decode() {
    this.error.set(null);
    if (!this.inputText()) {
      this.outputText.set('');
      return;
    }
    try {
      const buffer = this.base64ToArrayBuffer(this.inputText());
      // The standard TextDecoder constructor accepts an encoding label
      const decoder = new TextDecoder(this.selectedCharset());
      this.outputText.set(decoder.decode(buffer));
    } catch (e) {
      this.error.set('Erro ao decodificar: A string de entrada não é um Base64 válido ou o charset é incorreto.');
      this.outputText.set('');
    }
  }
  
  private async encrypt() {
    this.error.set(null);
    this.outputText.set('');

    if (!this.password()) {
      this.error.set('A senha é obrigatória para criptografar.');
      return;
    }
    if (!this.inputText()) {
      return;
    }
    
    this.isProcessing.set(true);
    try {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const key = await this.getKey(this.password(), salt);
      const enc = new TextEncoder();

      const encryptedContent = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        enc.encode(this.inputText())
      );

      // O resultado do AES-GCM no browser já contém o ciphertext + auth tag.
      // Concatenamos salt + iv + (ciphertext + auth tag)
      const combined = new Uint8Array(salt.length + iv.length + encryptedContent.byteLength);
      combined.set(salt, 0);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(encryptedContent), salt.length + iv.length);
      
      this.outputText.set(this.arrayBufferToBase64(combined.buffer));
    } catch (e) {
      this.error.set('Ocorreu um erro durante a criptografia.');
    } finally {
      this.isProcessing.set(false);
    }
  }
  
  private async decrypt() {
    this.error.set(null);
    this.outputText.set('');

    if (!this.password()) {
      this.error.set('A senha é obrigatória para descriptografar.');
      return;
    }
    if (!this.inputText()) {
      return;
    }

    this.isProcessing.set(true);
    try {
      const combined = this.base64ToArrayBuffer(this.inputText());
      // Minimum length: 16 (salt) + 12 (iv) + 16 (auth tag) = 44 bytes.
      if (combined.byteLength < 44) {
        throw new Error("Dados criptografados corrompidos ou incompletos.");
      }
      const salt = new Uint8Array(combined.slice(0, 16));
      const iv = new Uint8Array(combined.slice(16, 28));
      const ciphertext = new Uint8Array(combined.slice(28));
      
      const key = await this.getKey(this.password(), salt);
      
      const decryptedContent = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        ciphertext
      );
      
      const dec = new TextDecoder();
      this.outputText.set(dec.decode(decryptedContent));
    } catch (e) {
      if (e instanceof Error && e.message.includes("corrompidos")) {
         this.error.set(e.message);
      } else {
         this.error.set('Falha ao descriptografar. Verifique a senha ou os dados de entrada.');
      }
    } finally {
      this.isProcessing.set(false);
    }
  }

  clear() {
    this.inputText.set('');
    this.outputText.set('');
    this.password.set('');
    // this.isEncryptionEnabled.set(false); // Manter a opção selecionada
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
    // Poderia adicionar um feedback visual aqui se necessário
  }
}