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
  parameters: { key: string; value: any }[];
}

// New interfaces for the visual graph
export interface VisualNode extends TimelineNode {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface VisualEdge {
  id: string;
  sourceId: string;
  targetId: string;
  path: string; // SVG path 'd' attribute
  label?: string;
  labelX: number;
  labelY: number;
}

export interface VisualGraph {
  nodes: VisualNode[];
  edges: VisualEdge[];
  width: number;
  height: number;
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

  visualGraph = computed<VisualGraph | null>(() => {
    const workflow = this.workflowData();
    if (!workflow || !workflow.nodes || !workflow.connections) {
      return null;
    }

    // Constants for layout
    const NODE_WIDTH = 250;
    const NODE_HEADER_HEIGHT = 34;
    const NODE_BODY_MIN_HEIGHT = 28;
    const NODE_PARAM_HEIGHT = 18;
    const HORIZONTAL_SPACING = 150;
    const VERTICAL_SPACING = 40;
    const PADDING = 20;

    // --- 1. Build Graph Structure ---
    const n8nNodeNameToNodeId = new Map<string, string>();
    const nodeMap = new Map<string, any>();
    workflow.nodes.forEach((node: any) => {
      n8nNodeNameToNodeId.set(node.name, node.id);
      nodeMap.set(node.id, node);
    });

    const adj = new Map<string, { targetId: string; outputIndex: number; outputName: string }[]>();
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
            const connectionsByIndex = outputs[outputName];
            connectionsByIndex.forEach((connectionGroup: any[], outputIndex: number) => {
                connectionGroup.forEach(connection => {
                    const targetNodeId = n8nNodeNameToNodeId.get(connection.node);
                    if (targetNodeId) {
                        adj.get(sourceNodeId)?.push({ targetId: targetNodeId, outputIndex, outputName });
                        if (!revAdj.get(targetNodeId)?.includes(sourceNodeId)) {
                            revAdj.get(targetNodeId)?.push(sourceNodeId);
                        }
                    }
                });
            });
        }
    }

    // --- 2. Calculate Node Levels (Columns) using a topological sort approach ---
    const nodeLevels = new Map<string, number>();
    const queue: string[] = [];
    workflow.nodes.forEach((node: any) => {
      if (!revAdj.get(node.id)?.length) {
        queue.push(node.id);
        nodeLevels.set(node.id, 0);
      }
    });

    let head = 0;
    while(head < queue.length) {
        const u = queue[head++];
        (adj.get(u) || []).forEach(({ targetId }) => {
            const v = targetId;
            const newLevel = (nodeLevels.get(u) || 0) + 1;
            const currentLevel = nodeLevels.get(v) || -1;
            if (newLevel > currentLevel) {
              nodeLevels.set(v, newLevel);
            }
            if (!queue.includes(v) && head < workflow.nodes.length * 2) {
                queue.push(v);
            }
        });
    }

    // --- 3. Create Visual Nodes and Position them ---
    const columns: VisualNode[][] = [];
    let maxGraphHeight = 0;
    const visualNodes = new Map<string, VisualNode>();

    workflow.nodes.forEach((node: any) => {
      const level = nodeLevels.get(node.id) ?? 0;
      if (!columns[level]) columns[level] = [];
      
      const nodeTypeKey = this.getNodeType(node.type);
      const style = this.nodeStyleMap[nodeTypeKey] || this.nodeStyleMap['default'];
      const parameters = this.getNodeParameters(node);
      const bodyHeight = Math.max(NODE_BODY_MIN_HEIGHT, parameters.length * NODE_PARAM_HEIGHT + 12);
      
      const visualNode: VisualNode = {
        id: node.id,
        name: node.name,
        type: node.type,
        friendlyName: this.getFriendlyNodeName(node.type),
        icon: style.icon,
        color: style.color,
        parameters,
        width: NODE_WIDTH,
        height: NODE_HEADER_HEIGHT + bodyHeight,
        x: PADDING + level * (NODE_WIDTH + HORIZONTAL_SPACING),
        y: 0, // Will be set next
      };
      columns[level].push(visualNode);
      visualNodes.set(node.id, visualNode);
    });
    
    for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        if (i > 0) {
            column.sort((a, b) => {
                const getAvgParentY = (nodeId: string): number => {
                    const parents = revAdj.get(nodeId) || [];
                    if (parents.length === 0) return 0;
                    const sumY = parents.reduce((sum, parentId) => {
                        const parentNode = visualNodes.get(parentId);
                        return sum + (parentNode ? (parentNode.y + parentNode.height / 2) : 0);
                    }, 0);
                    return sumY / parents.length;
                };
                return getAvgParentY(a.id) - getAvgParentY(b.id);
            });
        }
        let currentY = PADDING;
        column.forEach(node => {
            node.y = currentY;
            currentY += node.height + VERTICAL_SPACING;
        });
        if (currentY > maxGraphHeight) {
            maxGraphHeight = currentY;
        }
    }
    
    columns.forEach(column => {
        if (column.length > 0) {
            const lastNode = column[column.length - 1];
            const columnHeight = lastNode.y + lastNode.height;
            const offset = (maxGraphHeight - columnHeight) / 2;
            if (offset > 0) {
                column.forEach(node => node.y += offset);
            }
        }
    });

    // --- 4. Create Visual Edges ---
    const edges: VisualEdge[] = [];
    for (const [sourceId, targets] of adj.entries()) {
      const sourceNode = visualNodes.get(sourceId);
      if (!sourceNode) continue;
      
      const sourceNodeData = nodeMap.get(sourceId);
      const hasMultipleOutputs = targets.length > 1;

      for (const { targetId, outputIndex } of targets) {
        const targetNode = visualNodes.get(targetId);
        if (targetNode) {
          let y1 = sourceNode.y + sourceNode.height / 2;
          if (hasMultipleOutputs && targets.length > 1) {
              const spread = Math.min(sourceNode.height / 2.5, (targets.length -1) * 15);
              const totalOutputs = Math.max(...targets.map(t => t.outputIndex)) + 1;
              const step = spread / (totalOutputs > 1 ? totalOutputs - 1 : 1);
              const offset = (outputIndex - (totalOutputs - 1) / 2) * step;
              y1 = (sourceNode.y + sourceNode.height / 2) + offset;
          }

          const x1 = sourceNode.x + sourceNode.width;
          const x2 = targetNode.x;
          const y2 = targetNode.y + targetNode.height / 2;
          const c1x = x1 + HORIZONTAL_SPACING / 2;
          const c2x = x2 - HORIZONTAL_SPACING / 2;
          const path = `M ${x1} ${y1} C ${c1x} ${y1}, ${c2x} ${y2}, ${x2} ${y2}`;

          let label: string | undefined;
          if (sourceNodeData.type === 'n8n-nodes-base.if') {
            label = outputIndex === 0 ? 'true' : 'false';
          } else if (sourceNodeData.type === 'n8n-nodes-base.switch') {
            label = `Output ${outputIndex}`;
          }
          
          const labelX = x1 + HORIZONTAL_SPACING * 0.25;
          const labelY = y1 + (y2 - y1) * 0.25 - 5;

          edges.push({
            id: `${sourceId}-${targetId}-${outputIndex}`,
            sourceId,
            targetId,
            path,
            label,
            labelX,
            labelY
          });
        }
      }
    }

    const graphWidth = PADDING * 2 + columns.length * NODE_WIDTH + (columns.length - 1) * HORIZONTAL_SPACING;
    
    return {
      nodes: Array.from(visualNodes.values()),
      edges: edges,
      width: Math.max(graphWidth, 600),
      height: maxGraphHeight,
    };
  });
  constructor() {
    effect(() => {
      const t = this.template();
      if(t) {
        this.loadComments(t.id);
      }
    });
  }

  private getNodeParameters(node: any): { key: string; value: any }[] {
    const params = node.parameters;
    if (!params) return [];

    try {
      switch (node.type) {
        case 'n8n-nodes-base.if':
          return (params.conditions?.values || []).map((cond: any, i: number) => ({
            key: `Condição ${i + 1}`,
            value: `${cond.firstValue || ''} ${cond.operation || ''} ${cond.secondValue || ''}`,
          }));
        case 'n8n-nodes-base.httpRequest':
          return [
            { key: 'Method', value: params.method },
            { key: 'URL', value: params.url },
          ].filter(p => p.value);
        case 'n8n-nodes-base.set':
          return (params.values?.values || []).map((v: any) => ({
            key: v.name,
            value: v.value,
          }));
        case 'n8n-nodes-base.webhook':
          return [{ key: 'Path', value: params.path }];
        default:
          return [];
      }
    } catch(e) {
      console.warn("Could not parse parameters for node", node, e);
      return [{key: "Error", value: "Could not parse parameters"}];
    }
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
