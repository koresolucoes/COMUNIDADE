import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tools-index',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './tools-index.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolsIndexComponent {
  tools = [
    { 
      name: 'Gerador de CRON', 
      description: 'Crie expressões CRON de forma visual e intuitiva.',
      link: '/tools/gerador-cron' 
    },
    { 
      name: 'Formatador de JSON', 
      description: 'Valide, formate e minifique seu código JSON.',
      link: '/tools/formatador-json'
    },
    {
      name: 'Simulador n8n',
      description: 'Teste expressões n8n em um ambiente sandboxed com dados mockados.',
      link: '/tools/n8n-expression-simulator'
    },
    {
      name: 'Codificador / Decodificador de URL',
      description: 'Codifique ou decodifique textos para serem usados em URLs.',
      link: '/tools/url-codec'
    },
    {
      name: 'Codificador / Decodificador Base64',
      description: 'Codifique ou decodifique textos para o formato Base64.',
      link: '/tools/base64-codec'
    },
    {
      name: 'Decodificador de JWT',
      description: 'Inspecione o conteúdo de um JSON Web Token (JWT).',
      link: '/tools/jwt-decoder'
    },
    {
      name: 'Conversor de Timestamp',
      description: 'Converta datas entre formato legível e Unix Timestamp.',
      link: '/tools/timestamp-converter'
    },
    {
      name: 'Conversor de Dados',
      description: 'Converta dados entre JSON, XML, CSV e outros formatos.',
      link: '/tools/data-converter'
    },
    { 
      name: 'Testador de Webhook', 
      description: 'Receba e inspecione payloads de webhooks em tempo real.',
      link: '/tools/webhook-tester'
    },
  ];
}