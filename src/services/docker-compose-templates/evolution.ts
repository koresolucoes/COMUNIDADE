import { ServiceDefinition, BuildContext, ServiceCompose } from './service.interface';

export const evolutionService: ServiceDefinition = {
  id: 'evolution',
  name: 'Evolution API',
  description: 'API para WhatsApp.',
  logo: 'https://i.imgur.com/c5whdak.png',
  expose: true,
  
  defaultConfig: {
    environment: { 
        API_KEY: 'your-evolution-api-key',
        // Outras variáveis de ambiente podem ser adicionadas aqui
    },
    ports: [{ target: 8080, published: 8082, mode: 'ingress' }],
    volumes: ['evolution_data:/evolution/dist/instances'],
    networks: ['network_public']
  },

  getTemplate(config: any, context: BuildContext): ServiceCompose {
    const service: any = {
      image: 'wppconnect/evolution-api:latest',
      restart: 'always',
      environment: config.environment,
      ports: config.ports,
      volumes: config.volumes,
      deploy: {
        labels: []
      }
    };
    
    const networks = [...(config.networks || [])];

    if (context.selectedServices['traefik']) {
        service.deploy.labels.push(
            'traefik.enable=true',
            'traefik.http.routers.evolution.rule=Host(`evolution.localhost`)',
            'traefik.http.routers.evolution.entrypoints=websecure',
            'traefik.http.routers.evolution.tls.certresolver=letsencryptresolver',
            'traefik.http.services.evolution.loadbalancer.server.port=8080'
        );
        networks.push('network_public');
    }

    if (networks.length > 0) {
        service.networks = Array.from(new Set(networks));
    }

    return {
        services: { evolution: service },
        volumes: { evolution_data: { external: true, name: 'evolution_data' } }
    };
  }
};