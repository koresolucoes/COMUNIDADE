
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cicd-github-actions',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './cicd-github-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CicdGithubActionsComponent {
  // Pipeline State
  pipelineState = signal<'idle' | 'running' | 'success' | 'failed'>('idle');
  currentStep = signal(0); // 0: None, 1: Build, 2: Test, 3: Deploy
  logs = signal<string[]>([]);

  startPipeline() {
    if (this.pipelineState() === 'running') return;
    
    this.pipelineState.set('running');
    this.currentStep.set(1);
    this.logs.set(['> Iniciando Pipeline...', '> Checkout do código... OK']);

    // Step 1: Build (simulated)
    setTimeout(() => {
        this.logs.update(l => [...l, '> Instalando dependências...', '> Construindo imagem Docker...']);
        
        setTimeout(() => {
             this.logs.update(l => [...l, '> Build concluído com sucesso!']);
             this.currentStep.set(2);
             
             // Step 2: Test
             setTimeout(() => {
                 this.logs.update(l => [...l, '> Rodando testes unitários...', '> Testes de integração...']);
                 
                 setTimeout(() => {
                     this.logs.update(l => [...l, '> Todos os testes passaram!']);
                     this.currentStep.set(3);

                     // Step 3: Deploy
                     setTimeout(() => {
                         this.logs.update(l => [...l, '> Conectando à VPS...', '> Atualizando contêineres...', '> Deploy finalizado!']);
                         this.pipelineState.set('success');
                     }, 1500);

                 }, 1500);

             }, 500);

        }, 1500);

    }, 500);
  }

  resetPipeline() {
      this.pipelineState.set('idle');
      this.currentStep.set(0);
      this.logs.set([]);
  }
}
