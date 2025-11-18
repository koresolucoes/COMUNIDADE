
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PythonConsoleComponent } from '../../../shared/python-console/python-console.component';

@Component({
  selector: 'app-python-listas-dicionarios',
  standalone: true,
  imports: [RouterLink, CommonModule, PythonConsoleComponent],
  templateUrl: './python-listas-dicionarios.component.html',
  styleUrls: ['./python-listas-dicionarios.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PythonListasDicionariosComponent {
  // Código inicial para os exercícios do console
  
  listExerciseCode = `# Uma lista de compras
compras = ["Maçã", "Banana", "Leite", "Ovos"]

# 1. Imprima o primeiro item (lembre-se, começa no 0!)
print(compras[0])

# 2. Adicione "Café" à lista
compras.append("Café")

# 3. Imprima a lista atualizada
print(compras)`;

  dictExerciseCode = `# Um dicionário representando um usuário
usuario = {
    "nome": "Ana Silva",
    "idade": 28,
    "email": "ana@email.com"
}

# 1. Acesse o valor da chave "nome"
print(usuario["nome"])

# 2. Altere o valor da chave "idade" para 29
usuario["idade"] = 29

# 3. Imprima o usuário atualizado
print(usuario)`;

  nestedExerciseCode = `# Dados complexos (como vêm de uma API)
dados = {
    "status": "sucesso",
    "usuarios": [
        {"id": 1, "nome": "Batman"},
        {"id": 2, "nome": "Superman"}
    ]
}

# DESAFIO: Tente imprimir apenas o nome "Superman"
# Dica: Acesse a chave "usuarios", pegue o item no índice 1 e depois a chave "nome"
# print(dados...?)`;

}
