import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodeUsageTipsComponent } from '../../shared/code-usage-tips/code-usage-tips.component';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserDataService } from '../../../services/user-data.service';
import { ToolDataStateService } from '../../../services/tool-data-state.service';

type CodecMode = 'text' | 'file';

@Component({
  selector: 'app-base64-codec',
  standalone: true,
  imports: [FormsModule, CodeUsageTipsComponent, RouterLink],
  templateUrl: './base64-codec.component.html',
  styles: [`
    #encryption-toggle:checked ~ .dot {
        transform: translateX(1.5rem);
        background-color: #58a6ff;
    }
    #encryption-toggle:checked ~ .block {
      background-color: #30363d;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Base64CodecComponent implements OnInit {
  private authService = inject(AuthService);
  private userDataService = inject(UserDataService);
  private toolDataStateService = inject(ToolDataStateService);
  currentUser = this.authService.currentUser;

  // --- Mode and Input State ---
  codecMode = signal<CodecMode>('text');
  inputText = signal('');
  selectedFile = signal<File | null>(null);
  isDraggingOver = signal(false);

  // --- Output State ---
  outputText = signal('');
  decodedFileBlob = signal<Blob | null>(null);
  downloadFilename = signal('decoded_file');

  // --- Options and Processing State ---
  password = signal('');
  isEncryptionEnabled = signal(false);
  error = signal<string | null>(null);
  copyButtonText = signal('Copiar');
  isProcessing = signal(false);
  selectedCharset = signal('UTF-8');
  fileMimeType = signal('application/octet-stream');

  popularCharsets = ['UTF-8', 'ASCII', 'ISO-8859-1', 'ISO-8859-2', 'ISO-8859-6', 'ISO-8859-15', 'Windows-1252'];
  otherCharsets = ['UTF-16', 'UTF-16BE', 'UTF-16LE'];

  fileInfo = computed(() => {
    const file = this.selectedFile();
    if (!file) return null;
    const sizeInKB = file.size / 1024;
    const size = sizeInKB > 1024 
      ? `${(sizeInKB / 1024).toFixed(2)} MB` 
      : `${sizeInKB.toFixed(2)} KB`;
    return { name: file.name, type: file.type, size };
  });

  // --- Code Snippets ---
  
  pythonEncryptionSnippet = computed(() => `
# Requer: pip install cryptography
import base64
import os
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# --- Criptografar ---
def encrypt(data: bytes, password: str) -> str:
    salt = os.urandom(16)
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
        backend=default_backend()
    )
    key = kdf.derive(password.encode())
    
    aesgcm = AESGCM(key)
    iv = os.urandom(12)
    ciphertext = aesgcm.encrypt(iv, data, None)
    
    # Concatena salt, iv e ciphertext para o resultado final
    encrypted_payload = salt + iv + ciphertext
    return base64.b64encode(encrypted_payload).decode('utf-8')

# --- Descriptografar ---
def decrypt(encrypted_data_b64: str, password: str) -> bytes:
    encrypted_payload = base64.b64decode(encrypted_data_b64)
    
    salt = encrypted_payload[:16]
    iv = encrypted_payload[16:28]
    ciphertext = encrypted_payload[28:]
    
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
        backend=default_backend()
    )
    key = kdf.derive(password.encode())
    
    aesgcm = AESGCM(key)
    return aesgcm.decrypt(iv, ciphertext, None)

# --- Exemplo de Uso ---
senha_secreta = "minha-senha-super-segura"
dados_originais = "Esta é uma mensagem secreta!".encode('utf-8')

dados_criptografados_b64 = encrypt(dados_originais, senha_secreta)
print(f"Dados Criptografados (Base64): {dados_criptografados_b64}")

dados_descriptografados = decrypt(dados_criptografados_b64, senha_secreta)
print(f"Dados Descriptografados: {dados_descriptografados.decode('utf-8')}")
`);
  javascriptEncryptionSnippet = computed(() => `
// Este snippet é para ambiente Node.js, como o nó "Execute Code" do n8n
// O módulo 'crypto' é nativo do Node.js
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const PBKDF2_ITERATIONS = 100000;

// --- Criptografar ---
function encrypt(text, password) {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const key = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  
  // Concatena salt, iv, tag e ciphertext para o resultado final
  const encryptedPayload = Buffer.concat([salt, iv, tag, encrypted]);
  return encryptedPayload.toString('base64');
}

// --- Descriptografar ---
function decrypt(encryptedDataB64, password) {
  const encryptedPayload = Buffer.from(encryptedDataB64, 'base64');
  
  const salt = encryptedPayload.slice(0, SALT_LENGTH);
  const iv = encryptedPayload.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = encryptedPayload.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const ciphertext = encryptedPayload.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  
  const key = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
}

// --- Exemplo de Uso ---
const senhaSecreta = "minha-senha-super-segura";
const dadosOriginais = "Esta é uma mensagem secreta!";

const dadosCriptografadosB64 = encrypt(dadosOriginais, senhaSecreta);
console.log(\`Dados Criptografados (Base64): \${dadosCriptografadosB64}\`);

const dadosDescriptografados = decrypt(dadosCriptografadosB64, senhaSecreta);
console.log(\`Dados Descriptografados: \${dadosDescriptografados}\`);
`);
  pythonBase64Snippet = computed(() => `
import base64

# --- Codificação de Texto ---
texto_original = "Olá, Kore! Automação é incrível."
# A string precisa ser convertida para bytes (usando UTF-8)
bytes_originais = texto_original.encode('utf-8')
# Codifica os bytes para Base64
base64_codificado = base64.b64encode(bytes_originais)
print(f"Texto codificado: {base64_codificado.decode('utf-8')}")

# --- Decodificação de Texto ---
# Decodifica a string Base64 de volta para bytes
bytes_decodificados = base64.b64decode(base64_codificado)
# Converte os bytes de volta para string
texto_decodificado = bytes_decodificados.decode('utf-8')
print(f"Texto decodificado: {texto_decodificado}")

# --- Codificação de Arquivo ---
# with open('meu_arquivo.png', 'rb') as arquivo_para_ler:
#     bytes_do_arquivo = arquivo_para_ler.read()
#     base64_do_arquivo = base64.b64encode(bytes_do_arquivo)
#     # A saída é uma string Base64 que pode ser salva ou transmitida
#     print(f"\\nBase64 do arquivo: {base64_do_arquivo.decode('utf-8')[:60]}...")
`);
  javascriptBase64Snippet = computed(() => `
// Este snippet é para ambiente Node.js, como o nó "Execute Code" do n8n

// --- Codificação de Texto ---
const textoOriginal = "Olá, Kore! Automação é incrível.";
// Cria um Buffer a partir da string e o converte para Base64
const base64Codificado = Buffer.from(textoOriginal).toString('base64');
console.log(\`Texto codificado: \${base64Codificado}\`);

// --- Decodificação de Texto ---
// Cria um Buffer a partir da string Base64 e o converte de volta para UTF-8
const textoDecodificado = Buffer.from(base64Codificado, 'base64').toString('utf-8');
console.log(\`Texto decodificado: \${textoDecodificado}\`);

// --- Decodificação de Arquivo (para uso no n8n) ---
// Suponha que 'items[0].json.base64Data' contém a string Base64 de um arquivo
// const base64Data = items[0].json.base64Data;
// const fileBuffer = Buffer.from(base64Data, 'base64');

// Agora você pode usar 'fileBuffer' para criar um dado binário no n8n:
// const binaryData = await $binary.create(fileBuffer, 'nome_do_arquivo.pdf', 'application/pdf');
// return { json: {}, binary: { data: binaryData } };
`);

  ngOnInit(): void {
      const dataToLoad = this.toolDataStateService.consumeData();
      if (dataToLoad && dataToLoad.toolId === 'base64-codec') {
        this.loadState(dataToLoad.data);
      }
  }
  
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
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private decodeBase64String(input: string): { data: string; mimeType: string | null } {
    const trimmedInput = input.trim();
    // 's' flag allows '.' to match newlines in multiline base64 data URIs
    const match = trimmedInput.match(/^data:([a-zA-Z0-9/+-]+);base64,(.*)$/s);
    if (match && match.length === 3) {
        // Remove any whitespace from the base64 part
        return { mimeType: match[1], data: match[2].replace(/\s/g, '') };
    }
    // For raw base64, also remove whitespace
    return { mimeType: null, data: trimmedInput.replace(/\s/g, '') };
  }

  private suggestFilename(mimeType: string) {
    const extensions: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/svg+xml': 'svg',
        'application/pdf': 'pdf',
        'text/plain': 'txt',
        'text/html': 'html',
        'audio/mpeg': 'mp3',
        'audio/wav': 'wav',
        'video/mp4': 'mp4',
        'video/webm': 'webm',
        'application/zip': 'zip',
    };
    const mainType = mimeType.split(';')[0].toLowerCase();
    const extension = extensions[mainType] || 'bin';
    this.downloadFilename.set(`decoded_file.${extension}`);
  }

  // --- Main Logic ---

  handleEncode() {
    this.resetOutput();
    if (this.codecMode() === 'text') {
      if (this.isEncryptionEnabled()) {
        this.encryptText();
      } else {
        this.base64EncodeText();
      }
    } else {
      if (this.isEncryptionEnabled()) {
        this.encryptFile();
      } else {
        this.base64EncodeFile();
      }
    }
  }

  handleDecode() {
    this.resetOutput();
    if (this.codecMode() === 'text') {
      if (this.isEncryptionEnabled()) {
        this.decryptText();
      } else {
        this.base64DecodeToText();
      }
    } else {
       if (this.isEncryptionEnabled()) {
        this.decryptFile();
      } else {
        this.base64DecodeToFile();
      }
    }
  }

  private resetOutput() {
    this.error.set(null);
    this.outputText.set('');
    this.decodedFileBlob.set(null);
  }

  private async encryptText() {
    if (!this.inputText()) return;
    if (!this.password()) {
      this.error.set('A senha é obrigatória para criptografar.');
      return;
    }

    this.isProcessing.set(true);
    try {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(this.inputText());
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const key = await this.getKey(this.password(), salt);
        const encryptedContent = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, dataBuffer);
        
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

  private async decryptText() {
    if (!this.inputText()) return;
    if (!this.password()) {
      this.error.set('A senha é obrigatória para descriptografar.');
      return;
    }
    this.isProcessing.set(true);
    try {
        const { data } = this.decodeBase64String(this.inputText());
        const combined = this.base64ToArrayBuffer(data);
        if (combined.byteLength < 44) throw new Error("Dados criptografados corrompidos ou incompletos.");
      
        const salt = new Uint8Array(combined.slice(0, 16));
        const iv = new Uint8Array(combined.slice(16, 28));
        const ciphertext = new Uint8Array(combined.slice(28));
        
        const key = await this.getKey(this.password(), salt);
        const decryptedContent = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, ciphertext);
        
        const decoder = new TextDecoder(this.selectedCharset());
        this.outputText.set(decoder.decode(decryptedContent));
    } catch (e) {
      this.error.set('Falha ao descriptografar. Verifique a senha ou os dados de entrada.');
    } finally {
      this.isProcessing.set(false);
    }
  }

  private base64EncodeText() {
    if (!this.inputText()) return;
    try {
      const encoder = new (window as any).TextEncoder(this.selectedCharset(), { NONSTANDARD_allowLegacyEncoding: true });
      const encodedBytes = encoder.encode(this.inputText());
      this.outputText.set(this.arrayBufferToBase64(encodedBytes.buffer));
    } catch (e) {
      this.error.set(`Erro ao codificar: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  private base64DecodeToText() {
    if (!this.inputText()) return;
    try {
      const { data } = this.decodeBase64String(this.inputText());
      const buffer = this.base64ToArrayBuffer(data);
      const decoder = new TextDecoder(this.selectedCharset());
      this.outputText.set(decoder.decode(buffer));
    } catch (e) {
      this.error.set('Erro ao decodificar: A string de entrada não é um Base64 válido ou o charset é incorreto.');
    }
  }

  private base64EncodeFile() {
    const file = this.selectedFile();
    if (!file) {
      this.error.set('Nenhum arquivo selecionado.');
      return;
    }
    this.isProcessing.set(true);
    const reader = new FileReader();
    reader.onload = () => {
      this.outputText.set(this.arrayBufferToBase64(reader.result as ArrayBuffer));
      this.isProcessing.set(false);
    };
    reader.onerror = () => {
      this.error.set('Falha ao ler o arquivo.');
      this.isProcessing.set(false);
    };
    reader.readAsArrayBuffer(file);
  }

  private base64DecodeToFile() {
    if (!this.inputText()) return;
    try {
      const { data, mimeType } = this.decodeBase64String(this.inputText());
      const buffer = this.base64ToArrayBuffer(data);

      const finalMimeType = mimeType || this.fileMimeType();
      this.decodedFileBlob.set(new Blob([buffer], { type: finalMimeType }));
      this.suggestFilename(finalMimeType);
    } catch (e) {
      this.error.set('Erro ao decodificar: A string de entrada não é um Base64 válido.');
    }
  }

  private async encryptFile() {
    const file = this.selectedFile();
    if (!file) {
      this.error.set('Nenhum arquivo selecionado.');
      return;
    }
    if (!this.password()) {
      this.error.set('A senha é obrigatória para criptografar.');
      return;
    }
    this.isProcessing.set(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const fileBuffer = reader.result as ArrayBuffer;
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const key = await this.getKey(this.password(), salt);
        const encryptedContent = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, fileBuffer);
        
        const combined = new Uint8Array(salt.length + iv.length + encryptedContent.byteLength);
        combined.set(salt, 0);
        combined.set(iv, salt.length);
        combined.set(new Uint8Array(encryptedContent), salt.length + iv.length);
        
        this.outputText.set(this.arrayBufferToBase64(combined.buffer));
      } catch (e) {
        this.error.set('Ocorreu um erro durante a criptografia do arquivo.');
      } finally {
        this.isProcessing.set(false);
      }
    };
    reader.onerror = () => {
      this.error.set('Falha ao ler o arquivo para criptografia.');
      this.isProcessing.set(false);
    };
    reader.readAsArrayBuffer(file);
  }

  private async decryptFile() {
    if (!this.password()) {
      this.error.set('A senha é obrigatória para descriptografar.');
      return;
    }
    if (!this.inputText()) return;

    this.isProcessing.set(true);
    try {
      // Encrypted data is never a data URI. Use decodeBase64String to clean the input.
      const { data } = this.decodeBase64String(this.inputText());
      const combined = this.base64ToArrayBuffer(data);

      if (combined.byteLength < 44) throw new Error("Dados criptografados corrompidos ou incompletos.");
      
      const salt = new Uint8Array(combined.slice(0, 16));
      const iv = new Uint8Array(combined.slice(16, 28));
      const ciphertext = new Uint8Array(combined.slice(28));
      
      const key = await this.getKey(this.password(), salt);
      const decryptedContent = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, ciphertext);
      
      const mimeType = this.fileMimeType();
      this.decodedFileBlob.set(new Blob([decryptedContent], { type: mimeType }));
      this.suggestFilename(mimeType);
    } catch (e) {
      this.error.set('Falha ao descriptografar. Verifique a senha ou os dados de entrada.');
    } finally {
      this.isProcessing.set(false);
    }
  }

  clear() {
    this.inputText.set('');
    this.selectedFile.set(null);
    this.resetOutput();
    this.password.set('');
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

  // --- File Input Handlers ---

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile.set(input.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDraggingOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDraggingOver.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDraggingOver.set(false);
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.selectedFile.set(event.dataTransfer.files[0]);
    }
  }

  downloadDecodedFile() {
    const blob = this.decodedFileBlob();
    if (!blob) return;
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.downloadFilename() || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async saveData() {
    if (!this.currentUser()) {
      alert('Você precisa estar logado para salvar.');
      return;
    }
    const title = prompt('Digite um nome para salvar esta configuração:', `Base64 - ${new Date().toLocaleDateString()}`);
    if (title) {
      const state = {
        inputText: this.inputText(),
        codecMode: this.codecMode(),
        isEncryptionEnabled: this.isEncryptionEnabled(),
        selectedCharset: this.selectedCharset(),
      };
      try {
        await this.userDataService.saveData('base64-codec', title, state);
        alert('Configuração salva com sucesso!');
      } catch (e) {
        console.error(e);
        alert('Falha ao salvar a configuração.');
      }
    }
  }

  private loadState(state: any) {
    if (!state) return;
    this.inputText.set(state.inputText ?? '');
    this.codecMode.set(state.codecMode ?? 'text');
    this.isEncryptionEnabled.set(state.isEncryptionEnabled ?? false);
    this.selectedCharset.set(state.selectedCharset ?? 'UTF-8');
  }
}