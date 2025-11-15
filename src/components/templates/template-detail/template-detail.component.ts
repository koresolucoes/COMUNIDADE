import { Component, ChangeDetectionStrategy, inject, signal, computed, viewChild, ElementRef, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TemplateService } from '../../../services/template.service';
import { from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

declare var Drawflow: any;

@Component({
  selector: 'app-template-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './template-detail.component.html',
  styleUrl: './template-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateDetailComponent {
  private route = inject(ActivatedRoute);
  private templateService = inject(TemplateService);

  copyButtonText = signal('Copiar Workflow (JSON)');
  private editor: any;

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
    this.editor.editor_mode = 'fixed';
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
    
    this.editor.update();
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
        this.copyButtonText.set('Copiado!');
        setTimeout(() => this.copyButtonText.set('Copiar Workflow (JSON)'), 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        this.copyButtonText.set('Falha ao copiar');
    });
  }
}
