import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearningNavigationComponent } from '../../shared/learning-navigation/learning-navigation.component';

@Component({
  selector: 'app-primeiro-workflow-n8n',
  standalone: true,
  imports: [RouterLink, LearningNavigationComponent],
  templateUrl: './primeiro-workflow-n8n.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrimeiroWorkflowN8nComponent {
  setNodeCode = `
{
  "mensagem": "Olá, Mundo da Automação!",
  "status": "sucesso"
}
  `.trim();
}