import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SafeHtmlPipe } from '../../../pipes/safe-html.pipe';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
type ResponseTab = 'body' | 'headers';

interface Header {
  id: number;
  key: string;
  value: string;
  enabled: boolean;
}

interface ResponseState {
  status: number | null;
  statusText: string | null;
  time: number | null;
  body: string;
  headers: [string, string][];
}

@Component({
  selector: 'app-rest-client',
  standalone: true,
  imports: [FormsModule, SafeHtmlPipe],
  templateUrl: './rest-client.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RestClientComponent {
  // Request state
  method = signal<HttpMethod>('GET');
  url = signal('https://jsonplaceholder.typicode.com/todos/1');
  headers = signal<Header[]>([
    { id: 1, key: 'Content-Type', value: 'application/json', enabled: true }
  ]);
  body = signal('');
  private nextHeaderId = 2;

  // UI state
  loading = signal(false);
  error = signal<string | null>(null);
  activeTab = signal<'params' | 'headers' | 'body'>('headers');
  responseTab = signal<ResponseTab>('body');

  // Response state
  response = signal<ResponseState | null>(null);

  addHeader() {
    this.headers.update(h => [...h, { id: this.nextHeaderId++, key: '', value: '', enabled: true }]);
  }

  removeHeader(idToRemove: number) {
    this.headers.update(h => h.filter(header => header.id !== idToRemove));
  }
  
  updateHeader(id: number, part: 'key' | 'value' | 'enabled', value: string | boolean) {
    this.headers.update(h => h.map(header => 
      header.id === id ? { ...header, [part]: value } : header
    ));
  }

  async sendRequest() {
    this.loading.set(true);
    this.error.set(null);
    this.response.set(null);
    const startTime = Date.now();

    const requestHeaders: { [key: string]: string } = {};
    this.headers().forEach(h => {
      if (h.enabled && h.key) {
        requestHeaders[h.key] = h.value;
      }
    });

    try {
      const apiResponse = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: this.url(),
          method: this.method(),
          headers: requestHeaders,
          body: (this.method() !== 'GET' && this.method() !== 'HEAD') ? this.body() : undefined
        }),
      });

      if (!apiResponse.ok) {
        const errorBody = await apiResponse.json();
        throw new Error(errorBody.error || `Proxy Error: ${apiResponse.statusText}`);
      }

      const resJson = await apiResponse.json();
      const endTime = Date.now();
      
      this.response.set({
        status: resJson.status,
        statusText: resJson.statusText,
        time: endTime - startTime,
        body: this.formatBody(resJson.body, resJson.headers['content-type']),
        headers: Object.entries(resJson.headers),
      });

    } catch (e) {
      const message = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }

  private formatBody(body: string, contentType: string): string {
    if (contentType && contentType.includes('application/json')) {
      try {
        const parsed = JSON.parse(body);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return body; // Not valid JSON, return as is
      }
    }
    return body;
  }
}
