import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { N8nApiService, Workflow, Execution } from '../../../services/n8n/n8n-api.service';
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
  selectedWorkflow = signal<Workflow | null>(null);
  executions = signal<Execution[]>([]);
  executionsLoading = signal(false);

  // Create Modal State
  isCreateModalVisible = signal(false);
  newWorkflowName = signal('');
  
  // View JSON Modal State
  workflowJsonContent = signal<string | null>(null);
  isJsonModalVisible = signal(false);
  copyJsonButtonText = signal('Copiar');


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
    this.selectedWorkflow.set(null);
    this.executions.set([]);
  }

  async fetchWorkflows() {
    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      const fetchedWorkflows = await this.n8nApiService.getWorkflows();
      this.workflows.set(fetchedWorkflows.sort((a,b) => a.name.localeCompare(b.name)));
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
    this.selectedWorkflow.update(w => w ? { ...w, active: !w.active } : null);

    try {
      if (originalStatus) {
        await this.n8nApiService.deactivateWorkflow(workflow.id);
      } else {
        await this.n8nApiService.activateWorkflow(workflow.id);
      }
    } catch (e) {
      // Revert on error
      this.workflows.update(ws => ws.map(w => w.id === workflow.id ? { ...w, active: originalStatus } : w));
      this.selectedWorkflow.update(w => w ? { ...w, active: originalStatus } : null);
      this.errorMessage.set(e instanceof Error ? e.message : 'Falha ao atualizar o workflow.');
    }
  }
  
  async selectWorkflow(workflow: Workflow) {
    this.selectedWorkflow.set(workflow);
    this.executions.set([]);
    await this.fetchExecutions(workflow.id);
  }

  async fetchExecutions(workflowId: string) {
    this.executionsLoading.set(true);
    try {
      const execs = await this.n8nApiService.getExecutions(workflowId);
      this.executions.set(execs);
    } catch (e) {
      this.errorMessage.set(e instanceof Error ? e.message : 'Falha ao buscar execuções.');
    } finally {
      this.executionsLoading.set(false);
    }
  }
  
  async createWorkflow() {
    if (!this.newWorkflowName().trim()) {
      return;
    }
    this.loading.set(true);
    try {
      await this.n8nApiService.createWorkflow(this.newWorkflowName());
      this.closeCreateModal();
      await this.fetchWorkflows();
    } catch (e) {
      this.errorMessage.set(e instanceof Error ? e.message : 'Falha ao criar workflow.');
    } finally {
      this.loading.set(false);
    }
  }

  async deleteWorkflow(workflow: Workflow) {
    if (!confirm(`Tem certeza que deseja excluir o workflow "${workflow.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    this.loading.set(true);
    try {
      await this.n8nApiService.deleteWorkflow(workflow.id);
      this.selectedWorkflow.set(null);
      this.executions.set([]);
      await this.fetchWorkflows();
    } catch (e) {
      this.errorMessage.set(e instanceof Error ? e.message : 'Falha ao excluir o workflow.');
    } finally {
      this.loading.set(false);
    }
  }

  async viewWorkflowJson(workflow: Workflow) {
    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      const fullWorkflow = await this.n8nApiService.getWorkflow(workflow.id);
      this.workflowJsonContent.set(JSON.stringify(fullWorkflow, null, 2));
      this.isJsonModalVisible.set(true);
    } catch (e) {
      this.errorMessage.set(e instanceof Error ? e.message : 'Falha ao buscar o JSON do workflow.');
    } finally {
      this.loading.set(false);
    }
  }
  
  openCreateModal() {
    this.newWorkflowName.set('');
    this.isCreateModalVisible.set(true);
  }

  closeCreateModal() {
    this.isCreateModalVisible.set(false);
  }
  
  closeJsonModal() {
    this.isJsonModalVisible.set(false);
    this.workflowJsonContent.set(null);
    this.copyJsonButtonText.set('Copiar');
  }

  copyWorkflowJson() {
    if (!this.workflowJsonContent()) return;
    navigator.clipboard.writeText(this.workflowJsonContent()!).then(() => {
      this.copyJsonButtonText.set('Copiado!');
      setTimeout(() => this.copyJsonButtonText.set('Copiar'), 2000);
    });
  }

  getExecutionDuration(execution: Execution): string {
    if (!execution.startedAt || !execution.finishedAt) {
      return '-';
    }
    const start = new Date(execution.startedAt).getTime();
    const end = new Date(execution.finishedAt).getTime();
    const duration = end - start;
    if (duration < 1000) {
      return `${duration}ms`;
    }
    return `${(duration / 1000).toFixed(2)}s`;
  }
}