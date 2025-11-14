import { ServiceDefinition, BuildContext, ServiceCompose } from './service.interface';

export const redisService: ServiceDefinition = {
  id: 'redis',
  name: 'Redis',
  description: 'Banco de dados em memória.',
  logo: 'redis.svg',
  expose: false,
  
  defaultConfig: {
    command: [
      "redis-server",
      "--appendonly",
      "yes",
      "--port",
      "6379"
    ],
    volumes: ['redis_data:/data'],
    networks: ['network_internal'],
    resources: {
      limits: {
        cpus: "0.5",
        memory: "1024M"
      }
    }
  },

  getTemplate(config: any, context: BuildContext): ServiceCompose {
    const service: any = {
      image: 'redis:latest',
      restart: 'always',
      command: config.command,
      volumes: config.volumes,
      networks: config.networks || ['network_internal'],
      deploy: {
        placement: {
          constraints: ['node.role == manager']
        },
        resources: config.resources
      }
    };

    return {
        services: { redis: service },
        volumes: { 
            redis_data: {
                external: true,
                name: 'redis_data'
            } 
        }
    };
  }
};
