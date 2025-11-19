import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PythonConsoleComponent } from '../../../shared/python-console/python-console.component';
import { FileSystemExplorerComponent } from '../../../shared/file-system-explorer/file-system-explorer.component';
import { VirtualFileSystemService } from '../../../../services/virtual-file-system.service';

@Component({
  selector: 'app-python-arquivos',
  standalone: true,
  imports: [RouterLink, CommonModule, PythonConsoleComponent, FileSystemExplorerComponent],
  templateUrl: './python-arquivos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PythonArquivosComponent implements OnInit {
  vfs = inject(VirtualFileSystemService);

  initialFiles = {
    'notas.txt': 'Olá, mundo da automação!',
    'config.json': JSON.stringify({
      "user": "kore",
      "version": "1.2.0"
    }, null, 2)
  };
  
  ngOnInit(): void {
    this.vfs.initialize(this.initialFiles);
  }

  readTextExercise = `conteudo = leia_arquivo('notas.txt')
print("Conteúdo do arquivo:")
print(conteudo)`;
  
  writeTextExercise = `# O modo 'w' (write) sobrescreve o arquivo
escreva_arquivo('saida.txt', 'Primeira linha.\\n', 'w')
print("Arquivo 'saida.txt' foi criado/sobrescrito.")`;
  
  appendTextExercise = `# O modo 'a' (append) adiciona ao final
escreva_arquivo('saida.txt', 'Segunda linha adicionada.', 'a')
print("Conteúdo adicionado ao 'saida.txt'.")`;

  readJsonExercise = `dados_config = carregue_json('config.json')

# Agora 'dados_config' é um dicionário Python!
print(f"Usuário: {dados_config['user']}")
print(f"Versão: {dados_config['version']}")`;

  writeJsonExercise = `novo_produto = {
    "id": 202,
    "nome": "Notebook Pro",
    "em_estoque": True
}

# A função 'salve_json' cuida da conversão para texto formatado
salve_json('produto.json', novo_produto)
print("Arquivo 'produto.json' criado com sucesso!")`;
}
