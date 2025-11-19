import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PythonConsoleComponent } from '../../../shared/python-console/python-console.component';

@Component({
  selector: 'app-python-requests',
  standalone: true,
  imports: [RouterLink, PythonConsoleComponent],
  templateUrl: './python-requests.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PythonRequestsComponent {

  getRequestSnippet = `import requests

# A URL do recurso que queremos buscar
url = "https://jsonplaceholder.typicode.com/todos/1"

# Fazemos a requisição GET de forma assíncrona
response = await requests.get(url)

# 1. Verificamos se a requisição foi bem-sucedida (código 200 OK)
print(f"Status Code: {response.status_code}")

# 2. Convertendo a resposta JSON em um dicionário Python
dados = response.json()
print("Dados recebidos:")
print(dados)

# 3. Agora podemos usar os dados como um dicionário normal
print(f"Título da tarefa: {dados['title']}")`;

  postRequestSnippet = `import requests

url = "https://jsonplaceholder.typicode.com/posts"

# Os dados que queremos enviar, em formato de dicionário Python
novo_post = {
    "title": "Meu post via Python",
    "body": "Automação com a Kore é incrível!",
    "userId": 1
}

# Fazemos a requisição POST, passando os dados no parâmetro 'json'
response = await requests.post(url, json=novo_post)

print(f"Status Code: {response.status_code}") # Deve ser 201 (Created)
print("Resposta da API:")
print(response.json()) # A API retorna o objeto criado com um ID`;

  paramsAndHeadersSnippet = `import requests

url = "https://jsonplaceholder.typicode.com/posts"

# Parâmetros de query para filtrar os resultados (será convertido para ?userId=1)
parametros = { "userId": 1 }

# Cabeçalhos customizados (muito usado para chaves de API)
cabecalhos = {
    "Content-Type": "application/json",
    "X-Custom-Header": "Kore-Automation-Hub"
}

# A requisição combina a URL, os parâmetros e os cabeçalhos
response = await requests.get(url, params=parametros, headers=cabecalhos)

print(f"URL final da requisição: {response.headers['url']}") # O proxy nos informa a URL final
print(f"Total de posts encontrados: {len(response.json())}")`;
}
