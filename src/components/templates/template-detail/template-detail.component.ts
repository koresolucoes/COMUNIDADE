import { Component, ChangeDetectionStrategy, inject, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
  
  copyWorkflow(workflowJson: any) {
    if (!workflowJson) return;
    navigator.clipboard.writeText(JSON.stringify(workflowJson, null, 2)).then(() => {
        this.copyButtonText.set('Copiado!');
        setTimeout(() => this.copyButtonText.set('Copiar Workflow (JSON)'), 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        this.copyButtonText.set('Falha ao copiar');
    });
  }
}
