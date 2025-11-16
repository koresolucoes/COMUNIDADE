import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TemplateService, Template, TemplateComment } from '../../../services/template.service';
import { from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { N8nApiService } from '../../../services/n8n/n8n-api.service';
import { AuthService } from '../../../services/auth.service';

export interface TimelineNode {
  id: string;
  name: string;
  type: string;
  friendlyName: string;
  icon: string;
  color: string;
}

export interface TimelineColumn {
  level: number;
  nodes: TimelineNode[];
}

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
    googleSheets: { color: '#0f9d58', icon: 'table_chart' },
    discord: { color: '#5865f2', icon: 'forum' },
    cron: { color: '#6366f1', icon: 'schedule' },
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

  workflowTimeline = computed<TimelineColumn[] | null>(() => {
    const workflow = this.workflowData();
    if (!workflow || !workflow.nodes || !workflow.connections) {
      return null;
    }
    
    const n8nNodeNameToNodeId = new Map<string, string>();
    workflow.nodes.forEach((node: any) => n8nNodeNameToNodeId.set(node.name, node.id));

    const adj = new Map<string, string[]>();
    const revAdj = new Map<string, string[]>();
    workflow.nodes.forEach((node: any) => {
        adj.set(node.id, []);
        revAdj.set(node.id, []);
    });

    for (const sourceNodeName in workflow.connections) {
      const sourceNodeId = n8nNodeNameToNodeId.get(sourceNodeName);
      if (!sourceNodeId) continue;

      const outputs = workflow.connections[sourceNodeName];
      for (const outputName in outputs) {
        const connectionGroups = outputs[outputName];
        if (Array.isArray(connectionGroups)) {
          for (const connection of connectionGroups) {
            const targetNodeId = n8nNodeNameToNodeId.get(connection.node);
            if (targetNodeId) {
              adj.get(sourceNodeId)?.push(targetNodeId);
              revAdj.get(targetNodeId)?.push(sourceNodeId);
            }
          }
        }
      }
    }

    const nodeLevels = new Map<string, number>();
    const queue: { nodeId: string; level: number }[] = [];
    
    workflow.nodes.forEach((node: any) => {
      if ((revAdj.get(node.id)?.length || 0) === 0) {
        if (!nodeLevels.has(node.id)) {
            nodeLevels.set(node.id, 0);
            queue.push({ nodeId: node.id, level: 0 });
        }
      }
    });

    let head = 0;
    while (head < queue.length) {
        const { nodeId, level } = queue[head++];
        (adj.get(nodeId) || []).forEach(neighborId => {
            const newLevel = level + 1;
            const existingLevel = nodeLevels.get(neighborId);
            if (existingLevel === undefined || newLevel > existingLevel) {
                nodeLevels.set(neighborId, newLevel);
                const queueItem = queue.find(item => item.nodeId === neighborId);
                if (queueItem) {
                    queueItem.level = newLevel;
                } else {
                    queue.push({ nodeId: neighborId, level: newLevel });
                }
            }
        });
    }

    const levelMap = new Map<number, any[]>();
    let maxLevel = 0;
    workflow.nodes.forEach((node: any) => {
        const level = nodeLevels.get(node.id) ?? (maxLevel + 1);
        if (!levelMap.has(level)) {
            levelMap.set(level, []);
        }
        levelMap.get(level)!.push(node);
        maxLevel = Math.max(maxLevel, level);
    });

    const timeline: TimelineColumn[] = [];
    const sortedLevels = Array.from(levelMap.keys()).sort((a,b) => a - b);

    for (const level of sortedLevels) {
        const nodesInLevel = levelMap.get(level) || [];
        timeline.push({
            level: level,
            nodes: nodesInLevel.map(node => {
                const nodeTypeKey = this.getNodeType(node.type);
                const style = this.nodeStyleMap[nodeTypeKey] || this.nodeStyleMap['default'];
                return {
                    id: node.id,
                    name: node.name,
                    type: node.type,
                    friendlyName: this.getFriendlyNodeName(node.type),
                    icon: style.icon,
                    color: style.color,
                };
            })
        });
    }

    return timeline;
  });

  constructor() {
    effect(() => {
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
  
  private getFriendlyNodeName(n8nType: string): string {
    if (!n8nType) return 'Node';
    const type = n8nType.split('.').pop() || 'Node';
    return type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
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
      const workflowCreatePayload = {
        name: t.title,
        nodes: workflowJson.nodes || [],
        connections: workflowJson.connections || {},
        settings: workflowJson.settings || {},
        staticData: workflowJson.staticData || null,
      };

      await this.n8nApiService.createWorkflow(workflowCreatePayload);

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