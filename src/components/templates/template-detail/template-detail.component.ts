

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

export interface VisualNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isStickyNote: boolean;
  // For regular nodes
  name?: string;
  type?: string;
  friendlyName?: string;
  icon?: string;
  color?: string;
  parameters?: { key: string; value: any }[];
  // For sticky notes
  content?: string;
  noteColor?: number;
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
  // Fix: Explicitly type injected ActivatedRoute to resolve type errors.
  private route: ActivatedRoute = inject(ActivatedRoute);
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
    formTrigger: { color: '#db2777', icon: 'edit_note' },
    merge: { color: '#0d9488', icon: 'merge_type' },
    switch: { color: '#a855f7', icon: 'switch_right' },
    note: { color: '#ca8a04', icon: 'note' },
    googleSheets: { color: '#0f9d58', icon: 'table_chart' },
    discord: { color: '#5865f2', icon: 'forum' },
    cron: { color: '#6366f1', icon: 'schedule' },
    agent: { color: '#8b5cf6', icon: 'smart_toy' },
    lmChatOpenAi: { color: '#10b981', icon: 'chat' },
    lmChatGoogleGemini: { color: '#fbbf24', icon: 'chat' },
    outputParserStructured: { color: '#6366f1', icon: 'data_object' },
    toolSerpApi: { color: '#ef4444', icon: 'travel_explore' },
    aggregate: { color: '#f97316', icon: 'calculate' },
    openAi: { color: '#10b981', icon: 'psychology_alt' },
    gmail: { color: '#dc2626', icon: 'mail' },
    twitter: { color: '#3b82f6', icon: 'chat_bubble' },
    facebookGraphApi: { color: '#3b82f6', icon: 'facebook' },
    linkedIn: { color: '#0ea5e9', icon: 'work' },
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
    // Fix: Cast template signal to correct type to resolve type inference issue.
    const t = this.template() as Template | null;
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
    const PADDING = 60;
    const NODE_WIDTH = 250;
    const NODE_HEADER_HEIGHT = 34;
    const NODE_BODY_MIN_HEIGHT = 28;
    const NODE_PARAM_HEIGHT = 18;
    const SCALE_X = 1.4;
    const SCALE_Y = 1.4;

    let minX = Infinity;
    let minY = Infinity;

    // 1. First pass to find boundaries
    for (const node of workflow.nodes) {
      if (!node.position) continue;
      minX = Math.min(minX, node.position[0]);
      minY = Math.min(minY, node.position[1]);
    }

    // Scale the min values
    minX *= SCALE_X;
    minY *= SCALE_Y;

    // 2. Calculate offset to push everything into the positive padded space
    const offsetX = minX < PADDING ? PADDING - minX : 0;
    const offsetY = minY < PADDING ? PADDING - minY : 0;


    const visualNodesMap = new Map<string, VisualNode>();
    let finalMaxX = 0;
    let finalMaxY = 0;

    // 3. Create Visual Nodes using positions from JSON, now with offset
    for (const node of workflow.nodes) {
      if (!node.position) continue;
      const x = node.position[0] * SCALE_X + offsetX;
      const y = node.position[1] * SCALE_Y + offsetY;
      let visualNode: VisualNode;

      if (node.type === 'n8n-nodes-base.stickyNote') {
        const width = node.parameters.width || 200;
        const height = node.parameters.height || 100;
        visualNode = {
          id: node.id,
          x, y, width, height,
          isStickyNote: true,
          content: node.parameters.content,
          noteColor: node.parameters.color,
        };
      } else {
        const nodeTypeKey = this.getNodeType(node.type);
        const style = this.nodeStyleMap[nodeTypeKey] || this.nodeStyleMap['default'];
        const parameters = this.getNodeParameters(node);
        const bodyHeight = Math.max(NODE_BODY_MIN_HEIGHT, parameters.length * NODE_PARAM_HEIGHT + 12);
        const width = NODE_WIDTH;
        const height = NODE_HEADER_HEIGHT + bodyHeight;

        visualNode = {
          id: node.id, x, y, width, height,
          isStickyNote: false,
          name: node.name,
          type: node.type,
          friendlyName: this.getFriendlyNodeName(node.type),
          icon: style.icon,
          color: style.color,
          parameters,
        };
      }
      visualNodesMap.set(node.id, visualNode);
      finalMaxX = Math.max(finalMaxX, visualNode.x + visualNode.width);
      finalMaxY = Math.max(finalMaxY, visualNode.y + visualNode.height);
    }

    // --- Create Adjacency list for edges ---
    const n8nNodeNameToNodeId = new Map<string, string>();
    workflow.nodes.forEach((node: any) => n8nNodeNameToNodeId.set(node.name, node.id));

    const adj = new Map<string, { targetId: string; outputIndex: number; outputName: string }[]>();
    workflow.nodes.forEach((node: any) => adj.set(node.id, []));

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
            }
          });
        });
      }
    }
    
    // --- Create Visual Edges ---
    const edges: VisualEdge[] = [];
    for (const [sourceId, targets] of adj.entries()) {
      const sourceNode = visualNodesMap.get(sourceId);
      const sourceNodeData = workflow.nodes.find((n: any) => n.id === sourceId);
      if (!sourceNode || sourceNode.isStickyNote || targets.length === 0) continue;

      for (const { targetId, outputIndex } of targets) {
        const targetNode = visualNodesMap.get(targetId);
        if (!targetNode || targetNode.isStickyNote) continue;

        let y1 = sourceNode.y + sourceNode.height / 2;
        if (targets.length > 1) {
          const spread = Math.min(sourceNode.height / 2.5, (targets.length - 1) * 15);
          const totalOutputs = Math.max(...targets.map(t => t.outputIndex)) + 1;
          const step = totalOutputs > 1 ? spread / (totalOutputs - 1) : 1;
          const offset = (outputIndex - (totalOutputs - 1) / 2) * step;
          y1 = (sourceNode.y + sourceNode.height / 2) + offset;
        }

        const x1 = sourceNode.x + sourceNode.width;
        const x2 = targetNode.x;
        const y2 = targetNode.y + targetNode.height / 2;
        const hDistance = Math.max(60, x2 - x1);
        const c1x = x1 + hDistance / 2;
        const c2x = x2 - hDistance / 2;
        const path = `M ${x1} ${y1} C ${c1x} ${y1}, ${c2x} ${y2}, ${x2} ${y2}`;

        let label: string | undefined;
        if (sourceNodeData.type === 'n8n-nodes-base.if') {
          label = outputIndex === 0 ? 'true' : 'false';
        } else if (sourceNodeData.type === 'n8n-nodes-base.switch') {
          label = `Output ${outputIndex}`;
        }
        
        const labelX = x1 + hDistance * 0.25;
        const labelY = y1 + (y2 - y1) * 0.25 - 5;
        
        edges.push({ id: `${sourceId}-${targetId}-${outputIndex}`, sourceId, targetId, path, label, labelX, labelY });
      }
    }

    return {
      nodes: Array.from(visualNodesMap.values()),
      edges,
      width: finalMaxX + PADDING,
      height: finalMaxY + PADDING,
    };
  });

  constructor() {
    effect(() => {
      // Fix: Cast template signal to correct type to resolve type inference issue.
      const t = this.template() as Template | null;
      if(t) {
        this.loadComments(t.id);
      }
    });
  }

  private getNodeParameters(node: any): { key: string; value: any }[] {
    const params = node.parameters;
    if (!params) return [];

    try {
      const MAX_VALUE_LENGTH = 50;
      const truncate = (val: any) => {
        if (typeof val !== 'string') return val;
        return val.length > MAX_VALUE_LENGTH ? val.substring(0, MAX_VALUE_LENGTH) + '...' : val;
      }

      switch (node.type) {
        case 'n8n-nodes-base.if':
          return (params.conditions?.values || []).map((cond: any, i: number) => ({
            key: `Condição ${i + 1}`,
            value: truncate(`${cond.firstValue || ''} ${cond.operation || ''} ${cond.secondValue || ''}`),
          }));
        case 'n8n-nodes-base.httpRequest':
          return [
            { key: 'Method', value: params.method },
            { key: 'URL', value: truncate(params.url) },
          ].filter(p => p.value);
        case 'n8n-nodes-base.set':
          return (params.assignments?.assignments || []).map((v: any) => ({
            key: v.name,
            value: truncate(v.value),
          }));
        case 'n8n-nodes-base.webhook':
          return [{ key: 'Path', value: params.path }];
        case 'n8n-nodes-base.formTrigger':
          return [{key: 'Title', value: truncate(params.formTitle)}]
        case '@n8n/n8n-nodes-langchain.agent':
            return [{ key: 'Prompt', value: truncate(params.text)}];
        case '@n8n/n8n-nodes-langchain.lmChatOpenAi':
        case '@n8n/n8n-nodes-langchain.lmChatGoogleGemini':
            const model = params.model?.value || params.model || 'default';
            return [{key: 'Model', value: truncate(model)}];
        case 'n8n-nodes-base.gmail':
            return [{key: 'To', value: truncate(params.sendTo)}, {key: 'Subject', value: truncate(params.subject)}];
        case 'n8n-nodes-base.twitter':
            return [{key: 'Text', value: truncate(params.text)}];
        case 'n8n-nodes-base.merge':
            return [{key: 'Mode', value: params.mode}, {key: 'Combine By', value: params.combineBy}];
        case 'n8n-nodes-base.aggregate':
            return [{key: 'Aggregate', value: params.aggregate}];
        case '@n8n/n8n-nodes-langchain.openAi':
            return [{key: 'Resource', value: params.resource}, {key: 'Prompt', value: truncate(params.prompt)}];
        default:
          if(params.operation) return [{key: 'Operation', value: params.operation}];
          if(params.resource) return [{key: 'Resource', value: params.resource}];
          return [];
      }
    } catch(e) {
      console.warn("Could not parse parameters for node", node, e);
      return [{key: "Error", value: "Could not parse parameters"}];
    }
}

  private getNodeType(n8nType: string): string {
    if (!n8nType) return 'default';
    // Handles 'n8n-nodes-base.if' -> 'if'
    // Handles '@n8n/n8n-nodes-langchain.agent' -> 'agent'
    const type = n8nType.split('.').pop() || '';
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
    // Fix: Cast template signal to correct type to resolve type inference issue.
    const t = this.template() as Template | null;
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
    // Fix: Cast template signal to correct type to resolve type inference issue.
    const t = this.template() as Template | null;
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
    // Fix: Cast template signal to correct type to resolve type inference issue.
    const t = this.template() as Template | null;
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