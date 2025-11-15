import { Component, ChangeDetectionStrategy, inject, signal, CUSTOM_ELEMENTS_SCHEMA, computed, viewChild, ElementRef, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TemplateService, Template } from '../../../services/template.service';
import { from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-template-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './template-detail.component.html',
  styleUrl: './template-detail.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Allow custom elements like n8n-workflow-view
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateDetailComponent {
  private route = inject(ActivatedRoute);
  private templateService = inject(TemplateService);

  copyButtonText = signal('Copiar Workflow (JSON)');

  readonly viewOptions = {
    nodesDraggable: true,
    nodesConnectable: false,
    elementsSelectable: true,
    zoomOnScroll: true,
    panOnDrag: true,
    fitView: true,
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

  private workflowView = viewChild<ElementRef<HTMLElement & { workflow: any }>>('workflowView');

  constructor() {
    effect(() => {
      const element = this.workflowView()?.nativeElement;
      const data = this.workflowData();
      if (element && data) {
        // Imperatively set the property on the custom element.
        // This can sometimes resolve timing issues with web components.
        element.workflow = data;
      }
    });
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
