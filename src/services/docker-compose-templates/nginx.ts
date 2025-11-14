import { ServiceDefinition, BuildContext, ServiceCompose } from './service.interface';

export const nginxService: ServiceDefinition = {
  id: 'nginx',
  name: 'Nginx',
  description: 'Servidor web e reverse proxy.',
  logo: 'nginx.svg',
  expose: true,
  
  defaultConfig: {
    ports: [{ target: 80, published: 8081, mode: 'ingress' }],
    volumes: ['nginx_config:/etc/nginx/conf.d'],
    networks: ['network_public']
  },

  getTemplate(config: any, context: BuildContext): ServiceCompose {
    const service: any = {
      image: 'nginx:alpine',
      restart: 'always',
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
            'traefik.http.routers.nginx.rule=Host(`nginx.localhost`)',
            'traefik.http.routers.nginx.entrypoints=websecure',
            'traefik.http.routers.nginx.tls.certresolver=letsencryptresolver',
            'traefik.http.services.nginx.loadbalancer.server.port=80'
        );
        networks.push('network_public');
    }

    if (networks.length > 0) {
        service.networks = Array.from(new Set(networks));
    }

    return {
        services: { nginx: service },
        volumes: { nginx_config: { external: true, name: 'nginx_config' } }
    };
  }
};
