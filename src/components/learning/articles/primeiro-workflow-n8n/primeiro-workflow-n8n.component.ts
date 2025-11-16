
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-primeiro-workflow-n8n',
  standalone: true,
  imports: [RouterLink],
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
