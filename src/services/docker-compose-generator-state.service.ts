import { Injectable, signal, computed, inject } from '@angular/core';
import { DockerComposeService } from './docker-compose.service';

@Injectable({
  providedIn: 'root'
})
export class DockerComposeGeneratorStateService {
  private dockerComposeService = inject(DockerComposeService);

  // --- State Signals ---
  
  selectedServices = signal<Record<string, boolean>>({
    'n8n': true,
    'postgres': true,
    'redis': true,
    'traefik': true
  });
  
  serviceConfigs = signal<Record<string, any>>({
    'n8n': this.dockerComposeService.getDefaultConfig('n8n'),
    'postgres': this.dockerComposeService.getDefaultConfig('postgres'),
    'redis': this.dockerComposeService.getDefaultConfig('redis'),
    'traefik': this.dockerComposeService.getDefaultConfig('traefik')
  });

  // --- Computed Signals ---

  selectedServiceIds = computed(() => {
    const selected = this.selectedServices();
    const objectKeys = <T extends object>(obj: T): (keyof T)[] => Object.keys(obj) as (keyof T)[];
    return objectKeys(selected).filter(k => selected[k]).sort((a, b) => (a as string).localeCompare(b as string));
  });

  // --- State Mutation Methods ---

  toggleService(serviceId: string, isChecked: boolean) {
    this.selectedServices.update(s => ({ ...s, [serviceId]: isChecked }));

    this.serviceConfigs.update(c => {
      const newConfigs = { ...c };
      if (isChecked) {
        newConfigs[serviceId] = this.dockerComposeService.getDefaultConfig(serviceId);
      } else {
        delete newConfigs[serviceId];
      }
      return newConfigs;
    });
  }
  
  updateConfigValue(serviceId: string, path: (string | number)[], value: any) {
    this.serviceConfigs.update(configs => {
        const newConfigs = JSON.parse(JSON.stringify(configs)); // Deep copy for immutability
        let current = newConfigs[serviceId];
        
        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }
        
        current[path[path.length - 1]] = value;
        
        return newConfigs;
    });
  }

  addArrayItem(serviceId: string, key: string) {
    this.serviceConfigs.update(configs => {
      const newConfigs = JSON.parse(JSON.stringify(configs));
      const serviceConfig = newConfigs[serviceId];
      if (serviceConfig && Array.isArray(serviceConfig[key])) {
        serviceConfig[key].push('');
      }
      return newConfigs;
    });
  }

  removeArrayItem(serviceId: string, key: string, index: number) {
    this.serviceConfigs.update(configs => {
      const newConfigs = JSON.parse(JSON.stringify(configs));
      const serviceConfig = newConfigs[serviceId];
      if (serviceConfig && Array.isArray(serviceConfig[key])) {
        serviceConfig[key].splice(index, 1);
      }
      return newConfigs;
    });
  }
}
