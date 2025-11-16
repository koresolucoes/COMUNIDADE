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
  
  private getFriendlyNodeName(n8nType: string): string {
    if (!n8nType) return 'Node';
    const type = n8nType.split('.').pop() || 'Node';
    // Converts camelCase or PascalCase to Title Case
    return type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
  }
  
  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private initializeDrawflow(container: HTMLElement, workflowData: any) {
    this.editor = new Drawflow(container);
    this.editor.start();
    this.editor.editor_mode = 'view';
    this.editor.zoom_max = 1.6;
    this.editor.zoom_min = 0.2;
    this.editor.curvature = 0.5;

    // Enable panning with left-click on the background
    container.addEventListener('mousedown', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // 0 = Left mouse button
      if (e.button === 0 && (target.classList.contains('drawflow') || target.classList.contains('parent-drawflow') || target.classList.contains('drawflow-precanvas'))) {
        this.editor.panning = true;
      }
    });
    container.addEventListener('mouseup', () => { this.editor.panning = false; });
    container.addEventListener('mouseleave', () => { this.editor.panning = false; });

    // Enable vertical scrolling with mouse wheel, allow zoom with Ctrl/Cmd
    container.addEventListener('wheel', (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        // Allow default zoom behavior
        return;
      }
      e.preventDefault();
      // Adjust canvas Y position for vertical panning.
      this.editor.canvas_y -= e.deltaY;
      this.editor.update();
    }, { passive: false });

    this.renderVerticalWorkflow(workflowData);
  }
  
  private renderVerticalWorkflow(workflow: any) {
    if (!workflow || !workflow.nodes || !workflow.connections) {
      return;
    }

    // 1. Preprocessing: Build graph structure
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

    // 2. Leveling (BFS variant to find longest path from start)
    const nodeLevels = new Map<string, number>();
    const queue: { nodeId: string; level: number }[] = [];
    
    // Find start nodes
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

    // Build map from level number to nodes at that level
    const levelMap = new Map<number, string[]>();
    let maxLevel = 0;
    workflow.nodes.forEach((node: any) => {
        const level = nodeLevels.get(node.id) ?? (maxLevel + 1); // Place un-leveled nodes at the end
        if (!levelMap.has(level)) {
            levelMap.set(level, []);
        }
        levelMap.get(level)!.push(node.id);
        maxLevel = Math.max(maxLevel, level);
    });

    // 3. Positioning
    const nodePositions = new Map<string, { x: number; y: number }>();
    const Y_SPACING = 150;
    const X_SPACING = 300;

    levelMap.forEach((nodesInLevel, level) => {
      const y = level * Y_SPACING;
      const numNodes = nodesInLevel.length;
      const startX = -((numNodes - 1) * X_SPACING) / 2;
      
      nodesInLevel.forEach((nodeId, index) => {
        const x = startX + index * X_SPACING;
        nodePositions.set(nodeId, { x, y });
      });
    });

    // 4. Drawflow Node Creation
    const drawflowData = { "drawflow": { "Home": { "data": {} } } };
    this.editor.import(drawflowData);
    const n8nNodeIdToDrawflowId = new Map<string, string>();

    for (const node of workflow.nodes) {
      const pos = nodePositions.get(node.id) || { x: 0, y: 0 };
      
      let outputs = 1;
      const nodeTypeKey = this.getNodeType(node.type);
      if (nodeTypeKey === 'if') {
        outputs = 2; // true, false
      } else if (nodeTypeKey === 'switch' && node.parameters?.rules?.values) {
        outputs = node.parameters.rules.values.length + 1; // one for each rule + default
      }

      const drawflowId = this.editor.addNode(
        node.name, 1, outputs, pos.x, pos.y,
        'n8n-node', {}, this.createNodeHtml(node), false
      );

      n8nNodeIdToDrawflowId.set(node.id, String(drawflowId));
    }
    
    // 5. Drawflow Connection Creation
    for (const sourceNodeName in workflow.connections) {
        const sourceNodeId = n8nNodeNameToNodeId.get(sourceNodeName);
        if (!sourceNodeId) continue;
        const drawflowSourceId = n8nNodeIdToDrawflowId.get(sourceNodeId);
        if (!drawflowSourceId) continue;

        const outputs = workflow.connections[sourceNodeName];
        for (const outputName in outputs) {
            const connectionGroups = outputs[outputName];
            for (const connection of connectionGroups) {
                const targetNodeId = n8nNodeNameToNodeId.get(connection.node);
                if (!targetNodeId) continue;
                const drawflowTargetId = n8nNodeIdToDrawflowId.get(targetNodeId);
                if (!drawflowTargetId) continue;

                let sourceOutput = 'output_1';
                const sourceNode = workflow.nodes.find((n: any) => n.id === sourceNodeId);
                
                if (sourceNode) {
                    const sourceNodeTypeKey = this.getNodeType(sourceNode.type);
                    if (sourceNodeTypeKey === 'if') {
                        sourceOutput = outputName === '0' ? 'output_1' : 'output_2';
                    } else if (sourceNodeTypeKey === 'switch') {
                        const outputIndex = parseInt(outputName, 10);
                        if (!isNaN(outputIndex)) {
                            sourceOutput = `output_${outputIndex + 1}`;
                        } else if (outputName === 'default') {
                            const numRules = sourceNode.parameters?.rules?.values?.length || 0;
                            sourceOutput = `output_${numRules + 1}`;
                        }
                    }
                }
                
                this.editor.addConnection(drawflowSourceId, drawflowTargetId, sourceOutput, 'input_1');
            }
        }
    }
    
    // 6. Set initial view
    const startNodesForView = levelMap.get(0) || [];
    this.setInitialCanvasView(nodePositions, startNodesForView);
  }

  private createNodeHtml(node: any): string {
    const nodeTypeKey = this.getNodeType(node.type);
    const nodeTypeName = this.getFriendlyNodeName(node.type);
    const style = this.nodeStyleMap[nodeTypeKey] || this.nodeStyleMap['default'];
    return `
      <div class="n8n-node-wrapper">
        <div class="n8n-node-header" style="background-color: ${style.color}">
          <span class="material-icons-outlined">${style.icon}</span>
          <span class="n8n-node-type-name">${nodeTypeName}</span>
        </div>
        <div class="n8n-node-body">
          <span class="n8n-node-label">${this.escapeHtml(node.name)}</span>
        </div>
      </div>
    `;
  }
  
  private setInitialCanvasView(nodePositions: Map<string, {x: number, y: number}>, startNodeIds: string[]) {
    if (!this.editor || startNodeIds.length === 0) return;

    const container = this.drawflowContainer()?.nativeElement;
    if (!container) return;
    
    const startPositions = startNodeIds.map(id => nodePositions.get(id)).filter(pos => !!pos) as {x: number, y: number}[];
    if (startPositions.length === 0) return;

    const minX = Math.min(...startPositions.map(p => p.x));
    const maxX = Math.max(...startPositions.map(p => p.x));
    const topY = startPositions[0].y; // All start nodes are at the same level/y

    const centerX = minX + (maxX - minX) / 2;
    const containerWidth = container.clientWidth;
    const zoom = this.editor.zoom;

    // Center horizontally on the midpoint of start nodes
    this.editor.canvas_x = (containerWidth / 2) / zoom - (centerX + 125); // 125 = node width / 2
    // Position vertically near the top
    this.editor.canvas_y = -topY + 50; // 50px margin from top

    if (typeof this.editor.update === 'function') {
      this.editor.update();
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
