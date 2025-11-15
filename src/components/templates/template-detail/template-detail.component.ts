import { Component, ChangeDetectionStrategy, inject, signal, computed, viewChild, ElementRef, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TemplateService, Template, TemplateComment } from '../../../services/template.service';
import { from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { N8nApiService } from '../../../services/n8n/n8n-api.service';
import { AuthService } from '../../../services/auth.service';

declare var Drawflow: any;

@Component({
  selector: 'app-template-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule],
  templateUrl: './template-detail.component.html',
  styleUrl: './template-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateDetailComponent {
  private route = inject(ActivatedRoute);
  private templateService = inject(TemplateService);
  public n8nApiService = inject(N8nApiService);
  public authService = inject(AuthService);

  copyJsonButtonText = signal('Copiar Workflow (JSON)');
  private editor: any;

  // Comment state
  comments = signal<TemplateComment[]>([]);
  commentsLoading = signal(false);
  commentsError = signal<string | null>(null);
  newCommentContent = signal('');

  // Action states
  sendToN8nStatus = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  sendToN8nMessage = signal('');

  private readonly nodeStyleMap: Record<string, { color: string; icon: string }> = {
    start: { color: '#16a34a', icon: 'play_arrow' },
    if: { color: '#9333ea', icon: 'call_split' },
    httpRequest: { color: '#2563eb', icon: 'http' },
    set: { color: '#f59e0b', icon: 'functions' },
    code: { color: '#4b5563', icon: 'code' },
    webhook: { color: '#db2777', icon: 'webhook' },
    merge: { color: '#0d9488', icon: 'merge_type' },
    switch: { color: '#a855f7', icon: 'switch_right' },
    note: { color: '#ca8a04', icon: 'note' },
    default: { color: '#374151', icon: 'settings' },
  };

  private template$ = this.route.paramMap.pipe(
    map(params => params.get('id')),
    switchMap(id => {
      if (!id) {
        return of(null);
      }
      return from(this.templateService.getTemplateById(id));
    })
  );

  template = toSignal(this.template$, { initialValue: null });
  
  workflowData = computed(() => {
    const t = this.template();
    if (!t || !t.workflow_json) {
      return null;
    }
    if (typeof t.workflow_json === 'string') {
      try {
        return JSON.parse(t.workflow_json);
      } catch (e) {
        console.error("Failed to parse workflow_json", e);
        return null;
      }
    }
    return t.workflow_json;
  });

  private drawflowContainer = viewChild<ElementRef<HTMLDivElement>>('drawflowContainer');

  constructor() {
    effect(() => {
      const container = this.drawflowContainer()?.nativeElement;
      const data = this.workflowData();

      if (container && data && typeof Drawflow !== 'undefined') {
        if (this.editor) {
           this.editor.clear();
        }
        this.initializeDrawflow(container, data);
      }
      
      const t = this.template();
      if(t) {
        this.loadComments(t.id);
      }
    });
  }

  private getNodeType(n8nType: string): string {
    if (!n8nType) return 'default';
    const parts = n8nType.split('.');
    const type = parts[parts.length - 1];
    return this.nodeStyleMap[type] ? type : 'default';
  }
  
  private initializeDrawflow(container: HTMLElement, workflowData: any) {
    this.editor = new Drawflow(container);
    this.editor.start();
    this.editor.editor_mode = 'edit';
    this.editor.zoom_max = 1.6;
    this.editor.zoom_min = 0.2;

    this.n8nToDrawflow(workflowData);
    this.centerWorkflow(workflowData.nodes, container);
  }
  
  private centerWorkflow(nodes: any[], container: HTMLElement) {
    if (!this.editor || !nodes || nodes.length === 0) return;

    const NODE_WIDTH = 200;
    const NODE_HEIGHT = 50;

    const xCoords = nodes.map(n => n.position[0]);
    const yCoords = nodes.map(n => n.position[1]);

    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords) + NODE_WIDTH;
    const minY = Math.min(...yCoords);
    const maxY = Math.max(...yCoords) + NODE_HEIGHT;

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    const zoom = this.editor.zoom;

    // Pan canvas to center the content
    this.editor.canvas_x = (containerWidth / 2) / zoom - (minX + contentWidth / 2);
    this.editor.canvas_y = (containerHeight / 2) / zoom - (minY + contentHeight / 2);
    
    this.editor.zoom_refresh();
  }

  private n8nToDrawflow(workflow: any) {
    if (!workflow || !workflow.nodes || !workflow.connections) {
      return;
    }

    const drawflowData = { "drawflow": { "Home": { "data": {} } } };
    this.editor.import(drawflowData);

    const n8nNodeIdToDrawflowId = new Map<string, string>();
    const n8nNodeNameToNodeId = new Map<string, string>();

    for (const node of workflow.nodes) {
      const nodeType = this.getNodeType(node.type);
      const style = this.nodeStyleMap[nodeType] || this.nodeStyleMap['default'];

      const nodeHtml = `
        <div class="drawflow-node-content" style="background-color: ${style.color}">
          <span class="material-icons-outlined">${style.icon}</span>
          <span class="node-label">${node.name}</span>
        </div>
      `;

      const outputs = nodeType === 'if' ? 2 : 1;
      
      const drawflowId = this.editor.addNode(
        node.name, 1, outputs,
        node.position[0], node.position[1],
        '', {}, nodeHtml, false
      );

      n8nNodeIdToDrawflowId.set(node.id, String(drawflowId));
      n8nNodeNameToNodeId.set(node.name, node.id);
    }

    for (const sourceNodeName in workflow.connections) {
      const sourceNodeId = n8nNodeNameToNodeId.get(sourceNodeName);
      if (!sourceNodeId) continue;
      
      const drawflowSourceId = n8nNodeIdToDrawflowId.get(sourceNodeId);
      if (!drawflowSourceId) continue;

      const outputs = workflow.connections[sourceNodeName];
      for (const outputName in outputs) {
        const connectionGroups = outputs[outputName];
        if (Array.isArray(connectionGroups)) {
          for (const connections of connectionGroups) {
            if (Array.isArray(connections)) {
              for (const connection of connections) {
                const targetNodeId = n8nNodeNameToNodeId.get(connection.node);
                if (targetNodeId) {
                  const drawflowTargetId = n8nNodeIdToDrawflowId.get(targetNodeId);
                  if (drawflowTargetId) {
                    let sourceOutput = 'output_1';
                    if (outputName.toLowerCase() === 'false') {
                      sourceOutput = 'output_2';
                    }
                    this.editor.addConnection(drawflowSourceId, drawflowTargetId, sourceOutput, 'input_1');
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  copyWorkflow() {
    const data = this.workflowData();
    if (!data) return;

    const jsonString = JSON.stringify(data, null, 2);
    
    navigator.clipboard.writeText(jsonString).then(() => {
        this.copyJsonButtonText.set('Copiado!');
        setTimeout(() => this.copyJsonButtonText.set('Copiar Workflow (JSON)'), 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        this.copyJsonButtonText.set('Falha ao copiar');
    });
  }

  downloadWorkflow() {
    const workflowJson = this.workflowData();
    const t = this.template();
    if (!workflowJson || !t) return;

    const jsonString = JSON.stringify(workflowJson, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const filename = t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    a.download = `${filename}.n8n.json`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  async sendToN8n() {
    const t = this.template();
    const workflowJson = this.workflowData();
    if (!t || !workflowJson) return;

    this.sendToN8nStatus.set('loading');
    this.sendToN8nMessage.set('');

    try {
      const newWorkflow = await this.n8nApiService.createWorkflow(t.title);
      
      const fullWorkflowData = {
          ...workflowJson,
          name: t.title,
          active: false,
      };
      await this.n8nApiService.updateWorkflow(newWorkflow.id, fullWorkflowData);

      this.sendToN8nStatus.set('success');
      this.sendToN8nMessage.set(`Workflow "${t.title}" criado com sucesso!`);
      setTimeout(() => this.sendToN8nStatus.set('idle'), 5000);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
      this.sendToN8nStatus.set('error');
      this.sendToN8nMessage.set(`Falha ao enviar: ${message}`);
    }
  }

  async loadComments(templateId: number) {
    this.commentsLoading.set(true);
    this.commentsError.set(null);
    try {
      const commentsData = await this.templateService.getComments(templateId);
      this.comments.set(commentsData);
    } catch (e) {
      this.commentsError.set(e instanceof Error ? e.message : 'Falha ao carregar comentários.');
    } finally {
      this.commentsLoading.set(false);
    }
  }

  async postComment() {
    const t = this.template();
    if (!this.newCommentContent().trim() || !t) return;

    this.commentsLoading.set(true);
    this.commentsError.set(null);
    try {
      const newComment = await this.templateService.createComment(t.id, this.newCommentContent());
      this.comments.update(c => [...c, newComment]);
      this.newCommentContent.set('');
    } catch (e) {
      this.commentsError.set(e instanceof Error ? e.message : 'Falha ao enviar comentário.');
    } finally {
      this.commentsLoading.set(false);
    }
  }
}
