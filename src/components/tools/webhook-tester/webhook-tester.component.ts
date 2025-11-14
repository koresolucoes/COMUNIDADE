import { Component, ChangeDetectionStrategy, signal, computed, OnInit, OnDestroy } from '@angular/core';

interface WebhookRequest {
  id: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  query: Record<string, string>;
  receivedAt: string;
}

@Component({
  selector: 'app-webhook-tester',
  standalone: true,
  imports: [],
  templateUrl: './webhook-tester.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebhookTesterComponent implements OnInit, OnDestroy {
  private readonly uuid = signal(crypto.randomUUID());
  private pollingInterval: any;

  requests = signal<WebhookRequest[]>([]);
  selectedRequest = signal<WebhookRequest | null>(null);
  copyButtonText = signal('Copiar');
  
  webhookUrl = computed(() => {
    const currentHost = window.location.host;
    const protocol = window.location.protocol;
    return `${protocol}//${currentHost}/api/webhook/test/${this.uuid()}`;
  });

  ngOnInit() {
    this.startPolling();
  }

  ngOnDestroy() {
    this.stopPolling();
    // Inform the backend to clean up any lingering data for this session
    navigator.sendBeacon(`/api/webhook/clear/${this.uuid()}`);
  }

  private startPolling() {
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
      const response = await fetch(`/api/webhook/poll/${this.uuid()}`);
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
    navigator.sendBeacon(`/api/webhook/clear/${this.uuid()}`);
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.webhookUrl()).then(() => {
      this.copyButtonText.set('Copiado!');
      setTimeout(() => this.copyButtonText.set('Copiar'), 2000);
    });
  }

  getFormattedBody(): string {
    if (!this.selectedRequest()) return '';
    const { body, headers } = this.selectedRequest()!;
    const contentType = Object.entries(headers).find(([key]) => key.toLowerCase() === 'content-type')?.[1] || '';

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
