import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-n8n-custom-nodes',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './n8n-custom-nodes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class N8nCustomNodesComponent {
  cloneSnippet = `
# Clone o repositório oficial de template
git clone https://github.com/n8n-io/n8n-nodes-starter.git

# Entre na pasta do projeto
cd n8n-nodes-starter

# Instale as dependências
npm install
  `.trim();

  anatomySnippet = `
import { IExecuteFunctions } from 'n8n-workflow';
import { INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';

export class MyCustomNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'My Custom Node',
    name: 'myCustomNode',
    icon: 'fa:robot',
    group: ['transform'],
    version: 1,
    description: 'Descrição do que este nó faz.',
    defaults: {
      name: 'My Custom Node',
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      // Aqui você define os campos que aparecerão no painel do nó
      {
        displayName: 'My String Parameter',
        name: 'myString',
        type: 'string',
        default: '',
        placeholder: 'Placeholder for the string value',
        description: 'Descrição do parâmetro.',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      // Pega o valor do parâmetro definido no painel
      const myString = this.getNodeParameter('myString', i, '') as string;
      const json = items[i].json;

      // *** SUA LÓGICA VEM AQUI ***
      json.processed = true;
      json.message = \`O valor do parâmetro é: \${myString}\`;
      
      returnData.push({ json });
    }

    return [returnData];
  }
}
  `.trim();

  testingSnippet = `
# 1. Compile seu código TypeScript para JavaScript
npm run build

# 2. Link seu pacote de nós globalmente
npm link

# 3. Vá para a pasta onde está sua instalação do n8n
cd ~/.n8n

# 4. Link o pacote de nós para dentro do n8n
npm link n8n-nodes-kore

# 5. Inicie o n8n
n8n
  `.trim();
}