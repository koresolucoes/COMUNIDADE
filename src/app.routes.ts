import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ToolsIndexComponent } from './components/tools/tools-index/tools-index.component';
import { CronGeneratorComponent } from './components/tools/cron-generator/cron-generator.component';
import { JsonFormatterComponent } from './components/tools/json-formatter/json-formatter.component';
import { PlaceholderComponent } from './components/shared/placeholder/placeholder.component';
import { UrlCodecComponent } from './components/tools/url-codec/url-codec.component';
import { Base64CodecComponent } from './components/tools/base64-codec/base64-codec.component';
import { JwtDecoderComponent } from './components/tools/jwt-decoder/jwt-decoder.component';
import { TimestampConverterComponent } from './components/tools/timestamp-converter/timestamp-converter.component';
import { N8nExpressionSimulatorComponent } from './components/tools/n8n-expression-simulator/n8n-expression-simulator.component';
import { DataConverterComponent } from './components/tools/data-converter/data-converter.component';

export const APP_ROUTES: Routes = [
  { path: '', component: HomeComponent },
  { 
    path: 'blog', 
    component: PlaceholderComponent, 
    data: { title: 'Blog', message: 'Nossos artigos e tutoriais estarão aqui em breve.' } 
  },
  { 
    path: 'templates', 
    component: PlaceholderComponent, 
    data: { title: 'Templates n8n', message: 'Uma galeria de workflows prontos para usar.' } 
  },
  { path: 'tools', component: ToolsIndexComponent },
  { path: 'tools/gerador-cron', component: CronGeneratorComponent },
  { path: 'tools/formatador-json', component: JsonFormatterComponent },
  { path: 'tools/url-codec', component: UrlCodecComponent },
  { path: 'tools/base64-codec', component: Base64CodecComponent },
  { path: 'tools/jwt-decoder', component: JwtDecoderComponent },
  { path: 'tools/timestamp-converter', component: TimestampConverterComponent },
  { path: 'tools/n8n-expression-simulator', component: N8nExpressionSimulatorComponent },
  { path: 'tools/data-converter', component: DataConverterComponent },
  { 
    path: 'tools/webhook-tester',
    component: PlaceholderComponent, 
    data: { title: 'Testador de Webhook', message: 'Esta ferramenta está em desenvolvimento e estará disponível em breve.' } 
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];