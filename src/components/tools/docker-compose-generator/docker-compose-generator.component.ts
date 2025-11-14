import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DockerComposeService, AvailableService } from '../../../services/docker-compose.service';
import { DockerComposeGeneratorStateService } from '../../../services/docker-compose-generator-state.service';

declare var jsyaml: any;

@Component({
  selector: 'app-docker-compose-generator',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './docker-compose-generator.component.html',
  styleUrl: './docker-compose-generator.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DockerComposeGeneratorComponent {
  private dockerComposeService = inject(DockerComposeService);
  public stateService = inject(DockerComposeGeneratorStateService);
  
  availableServices: AvailableService[] = this.dockerComposeService.getAvailableServices();

  copyButtonText = signal('Copiar');

  n8nEnvTooltips: Record<string, string> = {
    'N8N_BLOCK_ENV_ACCESS_IN_NODE': 'v2.0+: Bloqueia o acesso a variáveis de ambiente no nó Code por padrão para maior segurança. Mude para "false" para permitir (não recomendado).',
    'N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS': 'v2.0+: Exige permissões restritas (0600) em arquivos de configuração para maior segurança. Mude para "false" em sistemas que não suportam permissões de arquivo.',
    'N8N_RUNNERS_ENABLED': 'v2.0+: Habilita "task runners" por padrão, isolando a execução de código. Para usar o nó Python nativo, é necessário configurar "external mode" com a imagem n8nio/runners.',
    'NODES_EXCLUDE': 'v2.0+: Desabilita nós inseguros (ExecuteCommand, LocalFileTrigger) por padrão. Para reabilitá-los, defina como "[]".',
    'N8N_SKIP_AUTH_ON_OAUTH_CALLBACK': 'v2.0+: Exige autenticação em callbacks OAuth por padrão. Mude para "true" apenas se souber as implicações de segurança.',
    'N8N_RESTRICT_FILE_ACCESS_TO': 'v2.0+: Restringe o acesso ao sistema de arquivos dos nós de leitura/escrita ao diretório especificado. O padrão é o subdiretório "data" do volume do n8n.',
    'N8N_GIT_NODE_DISABLE_BARE_REPOS': 'v2.0+: Desabilita o uso de "bare repositories" no nó Git por segurança. Mude para "false" para permitir.',
    'N8N_DEFAULT_BINARY_DATA_MODE': 'v2.0+: Define "filesystem" como o único modo para armazenar dados binários, removendo o modo "memory" para maior estabilidade.'
  };

  generatedYaml = computed(() => {
    const yamlObject = this.dockerComposeService.buildComposeObject(
      this.stateService.selectedServices(), 
      this.stateService.serviceConfigs()
    );

    if (Object.keys(yamlObject.services).length === 0) {
      return '# Selecione os serviços à esquerda para começar.';
    }

    return (window as any).jsyaml.dump(yamlObject, { indent: 2, skipInvalid: true, noRefs: true });
  });

  toggleService(serviceId: string, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.stateService.toggleService(serviceId, isChecked);
  }
  
  copyToClipboard() {
    if (!this.generatedYaml()) return;
    navigator.clipboard.writeText(this.generatedYaml()).then(() => {
      this.copyButtonText.set('Copiado!');
      setTimeout(() => this.copyButtonText.set('Copiar'), 2000);
    });
  }
  
  downloadYaml() {
    const blob = new Blob([this.generatedYaml()], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'docker-compose.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // --- Type Guards for Template ---
  isObject(value: any): value is Record<string, any> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  isSelect(key: string): boolean {
    return key === 'mode';
  }

  getSelectOptions(key: string): string[] {
    if (key === 'mode') {
        return ['standalone', 'queue'];
    }
    return [];
  }

  isResourcesObject(value: any): value is { limits: { cpus: string, memory: string } } {
    return this.isObject(value) && value.hasOwnProperty('limits') && this.isObject(value.limits);
  }

  isStringArray(value: any): value is string[] {
      return Array.isArray(value) && value.every(item => typeof item === 'string');
  }

  isArrayOfObjects(value: any): value is Record<string, any>[] {
      return Array.isArray(value) && value.every(item => this.isObject(item));
  }

  // --- Helpers for Template ---
  objectKeys(obj: any): string[] {
    return this.isObject(obj) ? Object.keys(obj) : [];
  }

  formatConfigKey(key: string): string {
    return key.replace(/_/g, ' ');
  }

  getServiceName(serviceId: string): string {
    return this.availableServices.find(s => s.id === serviceId)?.name ?? serviceId;
  }
}