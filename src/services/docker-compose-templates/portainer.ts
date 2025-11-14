import { ServiceDefinition, BuildContext, ServiceCompose } from './service.interface';

export const portainerService: ServiceDefinition = {
  id: 'portainer',
  name: 'Portainer',
  description: 'UI para gerenciamento de Docker.',
  logo: 'https://i.imgur.com/B6PBEZu.png',
  expose: true,
  
  defaultConfig: {
    ports: [
        { target: 9000, published: 9000, mode: 'ingress' },
        { target: 9443, published: 9443, mode: 'ingress' }
    ],
    volumes: [
        '/var/run/docker.sock:/var/run/docker.sock',
        'portainer_data:/data'
    ],
    networks: ['network_public']
  },

  getTemplate(config: any, context: BuildContext): ServiceCompose {
    const service: any = {
      image: 'portainer/portainer-ce:latest',
      restart: 'always',
      ports: config.ports,
      volumes: config.volumes,
      deploy: {
        placement: {
          constraints: ['node.role == manager']
        },
        labels: []
      }
    };
    
    const networks = [...(config.networks || [])];
    
    if (context.selectedServices['traefik']) {
        service.deploy.labels.push(
            'traefik.enable=true',
            'traefik.http.routers.portainer.rule=Host(`portainer.localhost`)',
            'traefik.http.routers.portainer.entrypoints=websecure',
            'traefik.http.routers.portainer.tls.certresolver=letsencryptresolver',
            'traefik.http.services.portainer.loadbalancer.server.port=9000'
        );
        networks.push('network_public');
    }

    if (networks.length > 0) {
        service.networks = Array.from(new Set(networks));
    }

    return {
        services: { portainer: service },
        volumes: { portainer_data: { external: true, name: 'portainer_data' } }
    };
  }
};