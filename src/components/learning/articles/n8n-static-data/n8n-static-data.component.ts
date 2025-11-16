import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-n8n-static-data',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './n8n-static-data.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class N8nStaticDataComponent {
  codeSnippet = `
// PASSO 1: Inicialização Segura
// Na primeira vez que este código rodar, 'counter' não existirá.
// Esta linha garante que ele comece em 0 para evitar erros.
if ($workflow.staticData.counter === undefined) {
  $workflow.staticData.counter = 0;
}

// PASSO 2: A Lógica Principal
// Incrementa o contador a cada item que passa por aqui.
$workflow.staticData.counter += 1;

// Retorna o item para que o fluxo continue normalmente.
return items;`.trim();
}
