import { ServiceDefinition, BuildContext, ServiceCompose } from './service.interface';

export const chatwootService: ServiceDefinition = {
  id: 'chatwoot',
  name: 'Chatwoot',
  description: 'Plataforma de atendimento ao cliente.',
  logo: 'https://i.imgur.com/z6xl8ay.png',
  logoWidth: 40,
  logoHeight: 22,
  expose: true,

  defaultConfig: {
    frontend_url: 'chat.localhost',
    postgres_password: 'a-very-strong-password',
    environment: {
      RAILS_ENV: 'production',
      INSTALLATION_ENV: 'docker-swarm',
      RAILS_MAX_THREADS: '5',
      // The following will be populated by the template
      // POSTGRES_HOST: 'postgrescw',
      // POSTGRES_USERNAME: 'chatwoot',
      // POSTGRES_PASSWORD: '...',
      // POSTGRES_DATABASE: 'chatwoot_production',
      // REDIS_URL: 'redis://redis:6379'
    },
    volumes: [
      'chatwoot_data:/app/storage'
    ],
    networks: ['network_public', 'network_internal']
  },

  getTemplate(config: any, context: BuildContext): ServiceCompose {
    const postgresPassword = config.postgres_password;
    const commonEnv: any = {
      ...config.environment,
      FRONTEND_URL: `https://${config.frontend_url}`,
      POSTGRES_HOST: 'postgrescw',
      POSTGRES_USERNAME: 'chatwoot',
      POSTGRES_PASSWORD: postgresPassword,
      POSTGRES_DATABASE: 'chatwoot_production',
    };
    
    const networks = [...(config.networks || [])];

    if (context.selectedServices['redis']) {
      commonEnv['REDIS_URL'] = 'redis://redis:6379';
      networks.push('network_internal');
    }

    const appService: any = {
      image: 'chatwoot/chatwoot:latest',
      command: 'bundle exec rails s -p 3000 -b 0.0.0.0',
      restart: 'always',
      environment: commonEnv,
      volumes: config.volumes,
      networks: Array.from(new Set(networks)),
      depends_on: ['postgrescw'],
      deploy: {
        labels: []
      }
    };
    
    if (context.selectedServices['redis']) {
      appService.depends_on.push('redis');
    }

    if (context.selectedServices['traefik']) {
      appService.deploy.labels.push(
        'traefik.enable=true',
        `traefik.http.routers.chatwoot.rule=Host(\`${config.frontend_url}\`)`,
        'traefik.http.routers.chatwoot.entrypoints=websecure',
        'traefik.http.routers.chatwoot.tls.certresolver=letsencryptresolver',
        'traefik.http.services.chatwoot.loadbalancer.server.port=3000'
      );
      // Ensure public network is present if traefik is used
      if (!networks.includes('network_public')) {
          networks.push('network_public');
      }
      appService.networks = Array.from(new Set(networks));
    }

    const sidekiqService: any = {
      image: 'chatwoot/chatwoot:latest',
      command: 'bundle exec sidekiq -C config/sidekiq.yml',
      restart: 'always',
      environment: commonEnv,
      volumes: config.volumes,
      networks: ['network_internal'],
      depends_on: ['postgrescw'],
      deploy: {
        placement: {
          constraints: ['node.role == manager']
        }
      }
    };

    if (context.selectedServices['redis']) {
      sidekiqService.depends_on.push('redis');
    }

    const postgresService: any = {
      image: 'postgres:13-alpine',
      restart: 'always',
      environment: {
        POSTGRES_USER: 'chatwoot',
        POSTGRES_PASSWORD: postgresPassword,
        POSTGRES_DB: 'chatwoot_production'
      },
      volumes: ['postgrescw_data:/var/lib/postgresql/data'],
      networks: ['network_internal'],
      healthcheck: {
        test: ["CMD-SHELL", "pg_isready -U chatwoot -d chatwoot_production"],
        interval: '10s',
        timeout: '5s',
        retries: 5
      }
    };

    return {
      services: {
        chatwoot_app: appService,
        chatwoot_sidekiq: sidekiqService,
        postgrescw: postgresService
      },
      volumes: {
        chatwoot_data: { external: true, name: 'chatwoot_data' },
        postgrescw_data: { external: true, name: 'postgrescw_data' }
      }
    };
  }
};