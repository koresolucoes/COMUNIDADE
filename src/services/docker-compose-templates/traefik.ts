import { ServiceDefinition, BuildContext, ServiceCompose } from './service.interface';

export const traefikService: ServiceDefinition = {
  id: 'traefik',
  name: 'Traefik',
  description: 'Reverse proxy e load balancer.',
  logo: 'traefik.svg',
  expose: false,
  
  defaultConfig: {
    letsEncryptEmail: 'machineteste24@gmail.com',
    command: [
      "--api.dashboard=true",
      "--providers.docker.swarmMode=true",
      "--providers.docker.endpoint=unix:///var/run/docker.sock",
      "--providers.docker.exposedbydefault=false",
      "--providers.docker.network=network_public",
      "--entrypoints.web.address=:80",
      "--entrypoints.web.http.redirections.entryPoint.to=websecure",
      "--entrypoints.web.http.redirections.entryPoint.scheme=https",
      "--entrypoints.web.http.redirections.entrypoint.permanent=true",
      "--entrypoints.websecure.address=:443",
      "--certificatesresolvers.letsencryptresolver.acme.httpchallenge=true",
      "--certificatesresolvers.letsencryptresolver.acme.httpchallenge.entrypoint=web",
      "--certificatesresolvers.letsencryptresolver.acme.storage=/etc/traefik/letsencrypt/acme.json",
      "--log.level=INFO"
    ],
    ports: [
        { target: 80, published: 80, mode: 'host' },
        { target: 443, published: 443, mode: 'host' }
    ],
    volumes: [
        '/var/run/docker.sock:/var/run/docker.sock:ro',
        'vol_certificates:/etc/traefik/letsencrypt'
    ],
    networks: ['network_public']
  },

  getTemplate(config: any, context: BuildContext): ServiceCompose {
     // Create a copy of the command to avoid mutating the default config
    const command = [...config.command];
    // Dynamically insert the user's email
    command.push(`--certificatesresolvers.letsencryptresolver.acme.email=${config.letsEncryptEmail}`);
    
    const service = {
      image: 'traefik:2.11.2',
      command: command,
      deploy: {
        placement: {
          constraints: ['node.role == manager']
        },
        labels: [
            "traefik.enable=true",
            "traefik.http.routers.traefik-dashboard.rule=Host(`traefik.localhost`)",
            "traefik.http.routers.traefik-dashboard.service=api@internal",
            "traefik.http.routers.traefik-dashboard.entrypoints=websecure",
            "traefik.http.routers.traefik-dashboard.tls.certresolver=letsencryptresolver",
        ]
      },
      volumes: config.volumes,
      ports: config.ports,
      networks: config.networks || ['network_public']
    };

    return {
        services: { traefik: service },
        volumes: {
            vol_certificates: {
                external: true,
                name: 'volume_swarm_certificates'
            }
        },
        networks: {
            network_public: {
                external: true,
                name: 'network_public'
            },
            network_internal: {
                external: true,
                name: 'network_internal'
            }
        }
    };
  }
};
