import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-n8n-git-versioning',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './n8n-git-versioning.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class N8nGitVersioningComponent {
  gitInitSnippet = `
# 1. Navegue até a pasta onde você quer guardar seus workflows
cd ~/documentos/n8n-workflows

# 2. Inicie um repositório Git
git init

# 3. (Opcional) Conecte a um repositório remoto no GitHub
git remote add origin https://github.com/seu-usuario/meus-workflows.git
  `.trim();

  workflowSnippet = `
# 1. Salve o JSON do seu workflow como um arquivo (ex: meu-workflow.json)

# 2. Adicione o arquivo à "área de preparação" do Git
git add meu-workflow.json

# 3. Crie um "commit" (uma "foto" da alteração) com uma mensagem clara
git commit -m "feat: Adiciona lógica para tratar novos clientes"

# 4. Envie a alteração para o GitHub
git push origin main
  `.trim();

  diffSnippet = `
# Veja um resumo das alterações
git diff

# Veja as alterações em um arquivo específico
git diff meu-workflow.json
  `.trim();

  restoreSnippet = `
# Para descartar alterações que ainda não foram "commitadas"
git checkout -- meu-workflow.json

# Para reverter para um commit anterior (cuidado, isso reescreve o histórico)
# Primeiro, encontre o ID do commit com 'git log'
git log

# Depois, reverta para o estado daquele commit
git reset --hard <ID_DO_COMMIT>
  `.trim();
}
