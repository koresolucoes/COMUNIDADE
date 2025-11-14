import { Component, ChangeDetectionStrategy, signal, computed, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';

interface WebhookRequest {
  id: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  query: Record<string, string>;
  receivedAt: string;
}

const WEBHOOK_TESTER_SESSION_ID_KEY = 'kore-webhook-tester-session-id';

@Component({
  selector: 'app-webhook-tester',
  standalone: true,
  imports: [],
  templateUrl: './webhook-tester.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebhookTesterComponent implements OnInit, OnDestroy {
  // FIX: Explicitly type the injected Router to resolve type inference issue.
  private readonly router: Router = inject(Router);
  private readonly uuid = signal<string>(this.getOrCreateSessionId());
  private pollingInterval: any;

  requests = signal<WebhookRequest[]>([]);
  selectedRequest = signal<WebhookRequest | null>(null);
  copyButtonText = signal('Copiar');
  
  webhookUrl = computed(() => {
    const currentHost = window.location.host;
    const protocol = window.location.protocol;
    // Public URL for receiving webhooks. The action is determined by the HTTP method on the backend.
    return `${protocol}//${currentHost}/api/webhook?uuid=${this.uuid()}`;
  });

  ngOnInit() {
    this.startPolling();
  }

  ngOnDestroy() {
    this.stopPolling();
    // Inform the backend to clean up any lingering data for this session
    fetch(`/api/webhook?action=clear&uuid=${this.uuid()}`, { method: 'POST', keepalive: true }).catch(console.error);
  }

  private getOrCreateSessionId(): string {
    try {
        let sessionId = localStorage.getItem(WEBHOOK_TESTER_SESSION_ID_KEY);
        if (!sessionId) {
          sessionId = crypto.randomUUID();
          localStorage.setItem(WEBHOOK_TESTER_SESSION_ID_KEY, sessionId);
        }
        return sessionId;
    } catch (e) {
        console.warn('localStorage is not available. Webhook URL will not be persistent.');
        return crypto.randomUUID();
    }
  }

  private startPolling() {
    this.pollForRequests(); // Poll immediately on start
    this.pollingInterval = setInterval(() => {
      this.pollForRequests();
    }, 3000);
  }

  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  private async pollForRequests() {
    try {
      const response = await fetch(`/api/webhook?action=poll&uuid=${this.uuid()}`);
      if (response.ok) {
        // FIX: Explicitly type the result of response.json() to ensure type safety.
        const newRequests: WebhookRequest[] = await response.json();
        if (newRequests.length > 0) {
          this.requests.update(existing => [...newRequests, ...existing]);
          if (!this.selectedRequest()) {
            this.selectedRequest.set(newRequests[0]);
          }
        }
      }
    } catch (e) {
      console.error('Polling failed:', e);
    }
  }

  selectRequest(request: WebhookRequest) {
    this.selectedRequest.set(request);
  }
  
  clearRequests() {
    this.requests.set([]);
    this.selectedRequest.set(null);
    fetch(`/api/webhook?action=clear&uuid=${this.uuid()}`, { method: 'POST', keepalive: true }).catch(console.error);
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.webhookUrl()).then(() => {
      this.copyButtonText.set('Copiado!');
      setTimeout(() => this.copyButtonText.set('Copiar'), 2000);
    });
  }

  testWithRestClient() {
    this.router.navigate(['/tools/cliente-rest'], { queryParams: { url: this.webhookUrl() } });
  }

  getFormattedBody(): string {
    if (!this.selectedRequest()) return '';
    const { body, headers } = this.selectedRequest()!;
    const safeHeaders = headers || {};
    const contentType = Object.entries(safeHeaders).find(([key]) => key.toLowerCase() === 'content-type')?.[1] || '';

    // FIX: Ensure contentType is treated as a string to prevent type errors from malformed API responses.
    if (String(contentType).includes('application/json')) {
      try {
        return JSON.stringify(JSON.parse(body), null, 2);
      } catch {
        // Not valid JSON
      }
    }
    return body;
  }
}