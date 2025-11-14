// Fix: Import `computed` from `@angular/core`.
import { Component, ChangeDetectionStrategy, signal, effect, inject, OnInit, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodeUsageTipsComponent } from '../../shared/code-usage-tips/code-usage-tips.component';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserDataService } from '../../../services/user-data.service';
import { ToolDataStateService } from '../../../services/tool-data-state.service';

@Component({
  selector: 'app-jwt-decoder',
  standalone: true,
  imports: [FormsModule, CodeUsageTipsComponent, RouterLink],
  templateUrl: './jwt-decoder.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JwtDecoderComponent implements OnInit {
  private authService = inject(AuthService);
  private userDataService = inject(UserDataService);
  private toolDataStateService = inject(ToolDataStateService);
  currentUser = this.authService.currentUser;

  encodedToken = signal('');
  header = signal('');
  payload = signal('');
  signature = signal('');
  error = signal<string | null>(null);

  n8nSnippet = computed(() => `// Supondo que o token venha do nó anterior
const token = items[0].json.jwt_token;

if (token && token.split('.').length === 3) {
  const payloadBase64 = token.split('.')[1];
  const decodedPayload = Buffer.from(payloadBase64, 'base64').toString('utf-8');

  // Retorna o payload como um objeto JSON
  return [{ json: JSON.parse(decodedPayload) }];
} else {
  return [{ json: { error: "Token JWT inválido ou não encontrado." } }];
}`);

  pythonSnippet = computed(() => `
import jwt

# Cole seu token aqui
encoded_token = "${this.encodedToken() || 'SEU_TOKEN_JWT_AQUI'}"

try:
    # Decodifica o header
    header = jwt.get_unverified_header(encoded_token)
    print("--- Header ---")
    print(header)

    # Decodifica o payload SEM verificar a assinatura
    # Isso é útil para inspecionar o conteúdo de um token
    # NUNCA confie nos dados sem verificar a assinatura se a segurança for importante
    payload = jwt.decode(encoded_token, options={"verify_signature": False})
    print("\\n--- Payload ---")
    print(payload)

except jwt.PyJWTError as e:
    print(f"Erro ao decodificar o token: {e}")
`);

  javascriptSnippet = computed(() => `
// Requer: npm install jsonwebtoken
const jwt = require('jsonwebtoken');

const token = "${this.encodedToken() || 'SEU_TOKEN_JWT_AQUI'}";

try {
  // O método decode() analisa o token sem verificar a assinatura
  // O segundo argumento { complete: true } retorna o header e payload
  const decoded = jwt.decode(token, { complete: true });

  if (decoded) {
    console.log("--- Header ---");
    console.log(decoded.header);
  
    console.log("\\n--- Payload ---");
    console.log(decoded.payload);
  } else {
    console.error("Token inválido ou nulo.");
  }

} catch (error) {
  console.error("Erro ao decodificar o token:", error.message);
}
`);

  constructor() {
    effect(() => this.decodeToken(this.encodedToken()));
  }
  
  ngOnInit(): void {
      const dataToLoad = this.toolDataStateService.consumeData();
      if (dataToLoad && dataToLoad.toolId === 'jwt-decoder') {
        this.loadState(dataToLoad.data);
      }
  }

  private decodeToken(token: string) {
    this.header.set('');
    this.payload.set('');
    this.signature.set('');
    this.error.set(null);

    if (!token.trim()) {
      return;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      this.error.set('Token JWT inválido: Deve conter 3 partes separadas por ".".');
      return;
    }

    const [headerB64, payloadB64, signature] = parts;
    this.signature.set(signature);
    
    try {
      // B64url to B64
      const b64Header = headerB64.replace(/-/g, '+').replace(/_/g, '/');
      const decodedHeader = atob(b64Header);
      const parsedHeader = JSON.parse(decodedHeader);
      this.header.set(JSON.stringify(parsedHeader, null, 2));
    } catch (e) {
      this.error.set('Não foi possível decodificar ou analisar o Header do JWT.');
      return;
    }

    try {
       // B64url to B64
      const b64Payload = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = atob(b64Payload);
      const parsedPayload = JSON.parse(decodedPayload);
      this.payload.set(JSON.stringify(parsedPayload, null, 2));
    } catch (e) {
      this.error.set('Não foi possível decodificar ou analisar o Payload do JWT.');
    }
  }

  copyCodeSnippet(content: string) {
    navigator.clipboard.writeText(content);
  }

  async saveData() {
    if (!this.currentUser()) {
      alert('Você precisa estar logado para salvar.');
      return;
    }
     if (!this.encodedToken() || this.error()) {
      alert('O token JWT precisa ser válido para ser salvo.');
      return;
    }
    const title = prompt('Digite um nome para salvar este token JWT:', `Token ${new Date().toLocaleDateString()}`);
    if (title) {
      const state = {
        encodedToken: this.encodedToken(),
      };
      try {
        await this.userDataService.saveData('jwt-decoder', title, state);
        alert('Token JWT salvo com sucesso!');
      } catch (e) {
        console.error(e);
        alert('Falha ao salvar o token.');
      }
    }
  }

  private loadState(state: any) {
    if (!state) return;
    this.encodedToken.set(state.encodedToken ?? '');
  }
}
