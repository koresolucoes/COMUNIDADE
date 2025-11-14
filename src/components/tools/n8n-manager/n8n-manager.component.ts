import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { N8nApiService, Workflow } from '../../../services/n8n/n8n-api.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-n8n-manager',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './n8n-manager.component.html',
  styleUrls: ['./n8n-manager.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class N8nManagerComponent implements OnInit {
  private n8nApiService = inject(N8nApiService);

  // Connection State
  isConnected = this.n8nApiService.isConnected;
  instanceUrl = signal('');
  apiKey = signal('');

  // UI State
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  
  // Data State
  workflows = signal<Workflow[]>([]);

  ngOnInit() {
    if (this.isConnected()) {
      this.fetchWorkflows();
    } else {
      const creds = this.n8nApiService.getCredentials();
      this.instanceUrl.set(creds?.url || '');
      this.apiKey.set(creds?.apiKey || '');
    }
  }

  async connect() {
    if (!this.instanceUrl() || !this.apiKey()) {
      this.errorMessage.set('URL da Instância e Chave de API são obrigatórios.');
      return;
    }
    this.loading.set(true);
    this.errorMessage.set(null);
    this.n8nApiService.saveCredentials(this.instanceUrl(), this.apiKey());
    await this.fetchWorkflows();
  }

  disconnect() {
    this.n8nApiService.clearCredentials();
    this.workflows.set([]);
  }

  async fetchWorkflows() {
    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      const fetchedWorkflows = await this.n8nApiService.getWorkflows();
      this.workflows.set(fetchedWorkflows);
    } catch (e) {
      this.errorMessage.set(e instanceof Error ? e.message : 'Falha ao conectar. Verifique a URL e a Chave de API.');
      this.n8nApiService.clearCredentials();
    } finally {
      this.loading.set(false);
    }
  }

  async toggleWorkflowActive(workflow: Workflow) {
    // Optimistic update
    const originalStatus = workflow.active;
    this.workflows.update(ws => ws.map(w => w.id === workflow.id ? { ...w, active: !w.active } : w));

    try {
      if (originalStatus) {
        await this.n8nApiService.deactivateWorkflow(workflow.id);
      } else {
        await this.n8nApiService.activateWorkflow(workflow.id);
      }
    } catch (e) {
      // Revert on error
      this.workflows.update(ws => ws.map(w => w.id === workflow.id ? { ...w, active: originalStatus } : w));
      this.errorMessage.set(e instanceof Error ? e.message : 'Falha ao atualizar o workflow.');
    }
  }
}