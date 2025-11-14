import { Injectable } from '@angular/core';
import { ALL_SERVICES } from './docker-compose-templates';
import { ServiceDefinition, BuildContext } from './docker-compose-templates/service.interface';

export interface AvailableService {
  id: string;
  name: string;
  description: string;
  logo: string;
  logoWidth?: number;
  logoHeight?: number;
  expose: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DockerComposeService {

  private services: Map<string, ServiceDefinition> = new Map(
    ALL_SERVICES.map(s => [s.id, s])
  );
  
  getAvailableServices(): AvailableService[] {
    return ALL_SERVICES.map(({ id, name, description, logo, expose, logoWidth, logoHeight }) => ({
      id, name, description, logo, expose, logoWidth, logoHeight
    }));
  }
  
  getDefaultConfig(serviceId: string): any {
    return this.services.get(serviceId)?.defaultConfig ?? {};
  }

  buildComposeObject(selectedServices: Record<string, boolean>, allConfigs: Record<string, any>): any {
    const finalCompose: any = { 
      version: '3.7', 
      services: {}, 
      volumes: {}, 
      networks: {} 
    };

    const context: BuildContext = {
      selectedServices,
      allConfigs
    };

    const selectedIds = Object.keys(selectedServices).filter(id => selectedServices[id]);

    for (const serviceId of selectedIds) {
      const template = this.services.get(serviceId);
      const config = allConfigs[serviceId];

      if (template && config) {
        const { services, volumes, networks } = template.getTemplate(config, context);
        
        Object.assign(finalCompose.services, services);
        
        if (volumes) {
          Object.assign(finalCompose.volumes, volumes);
        }
        if (networks) {
          Object.assign(finalCompose.networks, networks);
        }
      }
    }
    
    // Clean up empty top-level keys
    if (Object.keys(finalCompose.volumes).length === 0) delete finalCompose.volumes;
    if (Object.keys(finalCompose.networks).length === 0) delete finalCompose.networks;

    return finalCompose;
  }
}