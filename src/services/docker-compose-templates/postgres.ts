import { ServiceDefinition, BuildContext, ServiceCompose } from './service.interface';

export const postgresService: ServiceDefinition = {
  id: 'postgres',
  name: 'PostgreSQL',
  description: 'Banco de dados relacional open-source.',
  logo: 'https://i.imgur.com/VvZrojK.png',
  logoWidth: 37,
  logoHeight: 40,
  expose: false,
  
  defaultConfig: {
    environment: { 
      POSTGRES_USER: 'n8n', 
      POSTGRES_PASSWORD: 'mysecretpassword', 
      POSTGRES_DB: 'n8n' 
    },
    ports: [{ target: 5432, published: 5432, mode: 'ingress' }],
    volumes: ['postgres_data:/var/lib/postgresql/data'],
    networks: ['network_internal']
  },

  getTemplate(config: any, context: BuildContext): ServiceCompose {
    const service: any = {
      image: 'postgres:13',
      restart: 'always',
      environment: config.environment,
      ports: config.ports,
      volumes: config.volumes,
      deploy: {
        placement: {
          constraints: ['node.role == manager']
        }
      }
    };

    const networks = [...(config.networks || [])];
    if (context.selectedServices['n8n']) {
        networks.push('network_internal');
    }

    if (networks.length > 0) {
        service.networks = Array.from(new Set(networks));
    }

    return {
        services: { postgres: service },
        volumes: { postgres_data: { external: true, name: 'postgres_data' } }
    };
  }
};