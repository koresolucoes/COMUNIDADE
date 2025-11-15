import { Component, ChangeDetectionStrategy, inject, signal, computed, viewChild, ElementRef, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TemplateService } from '../../../services/template.service';
import { from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

declare var cytoscape: any;

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

  private cyContainer = viewChild<ElementRef<HTMLDivElement>>('cyContainer');
  private cy: any;

  constructor() {
    effect(() => {
      const container = this.cyContainer()?.nativeElement;
      const data = this.workflowData();

      if (container && data && typeof cytoscape !== 'undefined') {
        if (this.cy) {
          this.cy.destroy();
        }
        this.initializeCytoscape(container, data);
      }
    });
  }
  
  private n8nToCytoscape(workflow: any): any[] {
    if (!workflow || !workflow.nodes || !workflow.connections) {
      return [];
    }
  
    const nodes = workflow.nodes.map((node: any) => ({
      group: 'nodes',
      data: {
        id: node.id,
        label: node.name,
        type: node.type,
      },
      position: {
        x: node.position[0],
        y: node.position[1],
      },
    }));
  
    const nodeNameMap = new Map<string, string>();
    workflow.nodes.forEach((node: any) => {
      nodeNameMap.set(node.name, node.id);
    });
  
    const edges: any[] = [];
    let edgeIdCounter = 0;
  
    for (const sourceNodeName in workflow.connections) {
      const sourceNodeId = nodeNameMap.get(sourceNodeName);
      if (!sourceNodeId) continue;
  
      const outputs = workflow.connections[sourceNodeName];
      for (const outputName in outputs) {
        if (outputs[outputName] && Array.isArray(outputs[outputName][0])) {
            const connections = outputs[outputName][0]; 
            for (const connection of connections) {
                const targetNodeName = connection.node;
                const targetNodeId = nodeNameMap.get(targetNodeName);
                if (targetNodeId) {
                edges.push({
                    group: 'edges',
                    data: {
                    id: `e${edgeIdCounter++}`,
                    source: sourceNodeId,
                    target: targetNodeId,
                    label: outputName,
                    },
                });
                }
            }
        }
      }
    }
  
    return [...nodes, ...edges];
  }
  
  private initializeCytoscape(container: HTMLElement, workflowData: any) {
    this.cy = cytoscape({
      container: container,
      elements: this.n8nToCytoscape(workflowData),
      layout: {
        name: 'preset'
      },
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#21262d',
            'border-color': '#484f58',
            'border-width': 2,
            'label': 'data(label)',
            'color': '#c9d1d9',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'font-size': '10px',
            'text-margin-y': 5,
            'width': '60px',
            'height': '60px',
            'shape': 'round-rectangle',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#484f58',
            'target-arrow-color': '#484f58',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
          },
        },
      ],
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: true,
      autoungrabify: false,
    });
    this.cy.fit(50);
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