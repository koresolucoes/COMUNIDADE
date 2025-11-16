import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Tool {
  name: string;
  description: string;
  link: string;
}

interface ToolCategory {
  name: string;
  icon: string;
  tools: Tool[];
}


@Component({
  selector: 'app-tools-index',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './tools-index.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolsIndexComponent {
  toolCategories: ToolCategory[] = [
    {
      name: 'Codificadores & Decodificadores',
      icon: 'code',
      tools: [
        {
          name: 'Codificador / Decodificador de URL',
          description: 'Codifique ou decodifique textos para serem usados em URLs.',
          link: '/tools/url-codec'
        },
        {
          name: 'Codificador / Decodificador Base64',
          description: 'Codifique ou decodifique textos e arquivos para o formato Base64.',
          link: '/tools/base64-codec'
        },
        {
          name: 'Decodificador de JWT',
          description: 'Inspecione o conteúdo de um JSON Web Token (JWT).',
          link: '/tools/jwt-decoder'
        },
      ]
    },
    {
      name: 'Segurança & Criptografia',
      icon: 'security',
      tools: [
        {
          name: 'Gerador de Hash',
          description: 'Calcule hashes (MD5, SHA-256, SHA-512) de uma string.',
          link: '/tools/gerador-hash'
        },
        {
          name: 'Gerador de Senhas Seguras',
          description: 'Crie senhas fortes e aleatórias com opções personalizáveis.',
          link: '/tools/gerador-senha'
        },
        {
          name: 'Gerador de UUID (v4)',
          description: 'Gere um Identificador Único Universal (UUID) com um clique.',
          link: '/tools/gerador-uuid'
        }
      ]
    },
     {
      name: 'Rede & DevOps-Lite',
      icon: 'public',
      tools: [
        { 
          name: 'Qual é o meu IP?', 
          description: 'Mostra seu IP público e as informações do seu navegador (User-Agent).',
          link: '/tools/meu-ip' 
        },
        {
          name: 'Cliente REST (Mini-Postman)',
          description: 'Faça requisições HTTP (GET, POST, etc) para uma URL e inspecione a resposta.',
          link: '/tools/cliente-rest'
        },
        {
          name: 'Verificador de DNS',
          description: 'Veja os registros DNS (A, CNAME, MX, TXT) de qualquer domínio.',
          link: '/tools/verificador-dns'
        },
        {
          name: 'Verificador de Certificado SSL',
          description: 'Inspecione os detalhes do certificado SSL/TLS de um domínio.',
          link: '/tools/verificador-ssl'
        },
        { 
          name: 'Testador de Webhook', 
          description: 'Receba e inspecione payloads de webhooks em tempo real.',
          link: '/tools/webhook-tester'
        },
      ]
    },
    {
      name: 'Automação & DevOps',
      icon: 'lan',
      tools: [
        { 
          name: 'Gerenciador n8n',
          description: 'Conecte-se à sua instância n8n para gerenciar workflows e execuções.',
          link: '/tools/gerenciador-n8n'
        },
        { 
          name: 'Gerador de CRON', 
          description: 'Crie expressões CRON de forma visual e intuitiva.',
          link: '/tools/gerador-cron' 
        },
        {
          name: 'Simulador de Expressão n8n',
          description: 'Teste expressões n8n em um ambiente com dados mockados.',
          link: '/tools/n8n-expression-simulator'
        },
        {
          name: 'Testador de Regex',
          description: 'Valide expressões regulares e visualize matches e grupos em tempo real.',
          link: '/tools/testador-regex'
        },
        {
          name: 'Gerador de Dados Falsos',
          description: 'Gere dados mock (JSON) para testar seus workflows e APIs.',
          link: '/tools/gerador-dados-falsos'
        },
        {
          name: 'Construtor Docker-Compose',
          description: 'Crie arquivos docker-compose.yml visualmente com templates para serviços populares.',
          link: '/tools/docker-compose-generator'
        }
      ]
    },
    {
      name: 'Dados & Formatação',
      icon: 'dataset',
      tools: [
        { 
          name: 'Formatador de JSON', 
          description: 'Valide, formate e minifique seu código JSON.',
          link: '/tools/formatador-json'
        },
        {
          name: 'Conversor de Timestamp',
          description: 'Converta datas entre formato legível e Unix Timestamp.',
          link: '/tools/timestamp-converter'
        },
        {
          name: 'Conversor de Dados',
          description: 'Converta dados entre JSON, XML, CSV, YAML e outros formatos.',
          link: '/tools/data-converter'
        },
        {
          name: 'Comparador de Texto (Diff)',
          description: 'Compare dois blocos de texto ou código e destaque as diferenças.',
          link: '/tools/comparador-texto'
        },
      ]
    }
  ];
}