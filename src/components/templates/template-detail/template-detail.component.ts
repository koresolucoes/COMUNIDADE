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

  private readonly nodeStyleMap: Record<string, { color: string; icon: string }> = {
    start: { color: '#55a06a', icon: 'start' },
    if: { color: '#8a5ed6', icon: 'if' },
    httpRequest: { color: '#3b82f6', icon: 'http' },
    set: { color: '#f59e0b', icon: 'set' },
    code: { color: '#4b5563', icon: 'code' },
    webhook: { color: '#ec4899', icon: 'webhook' },
    merge: { color: '#14b8a6', icon: 'merge' },
    switch: { color: '#a855f7', icon: 'switch' },
    note: { color: '#facc15', icon: 'note' },
    default: { color: '#374151', icon: 'default' },
  };

  private readonly icons: Record<string, string> = {
    start: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBmaWxsPSJ3aGl0ZSI+PHBhdGggZD0iTTggNXYxNGwxMS03eiIvPjwvc3ZnPg==',
    if: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBmaWxsPSJ3aGl0ZSI+PHBhdGggZD0iTTE0IDRsMi4yOSAyLjI5LTIuODggMi44OCAxLjQyIDEuNDIgMi44OC0yLjg4TDIwIDEwVjR6bS00IDBINFYxMGwyLjI5LTIuMjkgNC43MSA0LjdWMjBoMnYtOC40MWwtNS4yOS01LjN6Ii8+PC9zdmc+',
    http: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBmaWxsPSJ3aGl0ZSI+PHBhdGggZD0iTTQuNSAxMWgtMlY5SDF2NmgxLjV2LTIuNWgyVjE1SDZWOXgtMS41djJ6bTIuNS0uNWgxLjVWMTVIMTB2LTQuNWgxLjVWOUg3djEuNXptNS41IDBIMTRWMTVoMS41di00LjVIMTdWOXgtNC41djEuNXptOCAwaC01djZoMS41di0ySDIzVjl6bS0xLjUgMi41aC0ydi0xaDJ2MXoiLz48L3N2Zz4=',
    set: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBmaWxsPSJ3aGl0ZSI+PHBhdGggZD0iTTMgMTd2Mmg2di0ySDN6TTMgNXYyaDEwVjVIM3ptMTAgMTZ2LTJoOHYtMmgtOHYtMmgtMnY2aDJ6TTcgOXYySDN2Mmg0djJoMlY5SDd6bTE0IDR2LTJILTExdjJoMTB6bS02LTRoMlY3aDRWNWMtNFYzSDExdjZ6Ii8+PC9zdmc+',
    code: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBmaWxsPSJ3aGl0ZSI+PHBhdGggZD0iTTkuNCAxNi42TDQuOCAxMmwuNi00LjZDOCA2bC02IDYgNiA2IDEuNC0xLjR6bTUuMiAwbDQuNi00LjYtNC42LTQuNkwxNiA2bDYgNi02IDYtMS40LTEuNHoiLz48L3N2Zz4=',
    webhook: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBmaWxsPSJ3aGl0ZSI+PHBhdGggZD0iTTE3LjY2IDcuOTNMMTIgMiA2LjM0IDcuOTNhLjk5Ni45OTYgMCAwMDAgMS40MWw1LjY2IDUuNjZzLjM5LjM5LjM5LjM5LjM5LS4zOS4zOS0uMzhsNS42Ni01LjY3Yy4zOS0uMzguMzktMS4wMSAwLTEuNDF6TTEyIDEyLjRMOS4xMSA5LjUxIDEyIDYuNjJsMi44OSAyLjg5TDEyIDEyLjR6TTEyIDIybDUuNjYtNS42NmEuOTk2Ljk5NiAwIDAwMC0xLjQxTDEyIDkuMjdsLTUuNjYgNS42NmEuOTk2Ljk5NiAwIDAwMCAxLjQxTDEyIDIyeiIvPjwvc3ZnPg==',
    merge: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBmaWxsPSJ3aGl0ZSI+PHBhdGggZD0iTTQgMjJoMTZ2LTJIMjJMMTIgNCAyIDEwLjI5VjIyaDR6bTYtNGgtMnYtMmgydjJ6bS0yLTRoMnYtMmgtMnYyem00IDRoMnYtMmgtMnYyem0wLTRoMnYtMmgtMnYyem00IDBoMnYtMmgtMnYyem0wIDRoMnYtMmgtMnYyeiIvPjwvc3ZnPg==',
    switch: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBmaWxsPSJ3aGl0ZSI+PHBhdGggZD0iTTE1IDEuNVYzbDQtNCAxIDQgMS00IDQtNFYxLjVIMTV6TTcgNEg0djZMMiAxMGwyIDIgMi0yVjZIN3YxLjVMODUgOUw2LjUgNXYxSDd6bTAgNVYxMWw0IDQgNCA0VjExaC0xLjVMMTIgMTNsLTEuNS0xLjVWMTB6bTIgNWgydjRoMnYtNEgyNHYtMmgtNy41TDE0IDhoLTIuNDdsLTIgMkg0djJoM3YxaC41bDEuNSAxLjVWMTZ6Ii8+PC9zdmc+',
    note: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBmaWxsPSJ3aGl0ZSI+PHBhdGggZD0iTTE0IDJDNiAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTBzMTAtNC40OCAxMC0xMFMyMS41MiAyIDE0IDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4IDggOCAzLjU5IDggOC0zLjU5IDgtOCA4eiIvPjxwYXRoIGQ9Ik0xMy41IDE1SDkuNXYtMS41SDExVjdoMi41djEuNWgtMS41VjEzeDEuNVYxNXoiLz48L3N2Zz4=',
    default: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBmaWxsPSJ3aGl0ZSI+PHBhdGggZD0iTTE5Ljk1IDEzLjIzbDEuODEgMS4yOWEuOTk2Ljk5NiAwIDAxMCAxLjY5bC0xLjgxIDEuMjkgMS4xMiAyLjExYS45OTQuOTk0IDAgMDEtMS4zMyAxLjIxbC0yLjEyLTEuMDctMS4xMiAyLjExYS45OTQuOTk0IDAgMDEtMS4zMy4zOWwtMS4xMi0yLjExLTIuMTIgMS4wN2EuOTk0Ljk5NCAwIDAxLTEuMzMtMS4yMWwxLjEyLTIuMTFMMi4wNSA4LjExYy0uMzUtLjI1LTIuMDYtLjk4LTIuMDYtMS42OWwwLTEuNTUgMi4xMi0xLjA3YTEgMSAwIDAxMS4zMy4zOWwxLjEyIDIuMTFMMTEgMS4yOWExIDEgMCAwMTEuMzMtMS4yMWwxLjEyIDIuMTFMNi4wNiAxLjI5YTEgMSAwIDAxMS4zMyAxLjIxbDIuMTIgMS4wNyAxLjEyLTIuMTFhMSAxIDAgMDEtMS4zMy0uMzlMMi4wNSA0LjA1eiIvPjwvc3ZnPg==',
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
  
  private getNodeType(n8nType: string): string {
    if (!n8nType) return 'default';
    const parts = n8nType.split('.');
    const type = parts[parts.length - 1];
    return this.nodeStyleMap[type] ? type : 'default';
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
        nodeType: this.getNodeType(node.type),
      },
      position: {
        x: node.position[0],
        y: node.position[1],
      },
    }));
  
    const nodeNameMap = new Map<string, string>();
    const nodeTypeMap = new Map<string, string>();
    workflow.nodes.forEach((node: any) => {
      nodeNameMap.set(node.name, node.id);
      nodeTypeMap.set(node.name, node.type);
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
                  
                  const edge: any = {
                    group: 'edges',
                    data: {
                      id: `e${edgeIdCounter++}`,
                      source: sourceNodeId,
                      target: targetNodeId,
                      label: outputName,
                    },
                    classes: ''
                  };

                  const sourceNodeType = nodeTypeMap.get(sourceNodeName);
                  if (sourceNodeType === 'n8n-nodes-base.if') {
                    if (outputName === 'true') {
                      edge.classes = 'true-branch';
                    } else if (outputName === 'false') {
                      edge.classes = 'false-branch';
                    }
                  }

                  edges.push(edge);
                }
            }
        }
      }
    }
  
    return [...nodes, ...edges];
  }
  
  private initializeCytoscape(container: HTMLElement, workflowData: any) {
    const nodeStyles = Object.entries(this.nodeStyleMap).map(([type, style]) => ({
      selector: `node[nodeType = "${type}"]`,
      style: {
        'background-color': style.color,
        'background-image': this.icons[style.icon] || this.icons['default'],
      },
    }));

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
            'border-color': '#484f58',
            'border-width': 2,
            'label': 'data(label)',
            'color': '#c9d1d9',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'font-size': '10px',
            'text-margin-y': 5,
            'width': '50px',
            'height': '50px',
            'shape': 'round-rectangle',
            'background-fit': 'contain',
            'background-clip': 'none',
            'background-opacity': 1,
            'background-position-x': '50%',
            'background-position-y': '50%',
            'background-height': '50%',
            'background-width': '50%',
          },
        },
        ...nodeStyles,
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
        {
          selector: 'edge.true-branch',
          style: {
            'line-color': '#3fb950',
            'target-arrow-color': '#3fb950',
          }
        },
         {
          selector: 'edge.false-branch',
          style: {
            'line-color': '#f85149',
            'target-arrow-color': '#f85149',
          }
        },
        {
          selector: ':selected',
          style: {
            'border-width': 3,
            'border-color': '#58a6ff',
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
