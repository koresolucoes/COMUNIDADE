import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodeUsageTipsComponent } from '../../shared/code-usage-tips/code-usage-tips.component';

type CodecMode = 'text' | 'file';

@Component({
  selector: 'app-base64-codec',
  standalone: true,
  imports: [FormsModule, CodeUsageTipsComponent],
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
export class Base64CodecComponent {
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
  
  pythonEncryptionSnippet = computed(() => `...`); // Snippet content unchanged, can be omitted for brevity
  javascriptEncryptionSnippet = computed(() => `...`); // Snippet content unchanged, can be omitted for brevity
  pythonBase64Snippet = computed(() => `...`); // Snippet content unchanged, can be omitted for brevity
  javascriptBase64Snippet = computed(() => `...`); // Snippet content unchanged, can be omitted for brevity
  
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

  // --- Main Logic ---

  handleEncode() {
    this.resetOutput();
    if (this.codecMode() === 'text') {
      this.base64EncodeText();
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
      this.base64DecodeToText();
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
      const buffer = this.base64ToArrayBuffer(this.inputText());
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
      const buffer = this.base64ToArrayBuffer(this.inputText());
      this.decodedFileBlob.set(new Blob([buffer]));
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
      const combined = this.base64ToArrayBuffer(this.inputText());
      if (combined.byteLength < 44) throw new Error("Dados criptografados corrompidos ou incompletos.");
      
      const salt = new Uint8Array(combined.slice(0, 16));
      const iv = new Uint8Array(combined.slice(16, 28));
      const ciphertext = new Uint8Array(combined.slice(28));
      
      const key = await this.getKey(this.password(), salt);
      const decryptedContent = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, ciphertext);
      
      this.decodedFileBlob.set(new Blob([decryptedContent]));
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
}
