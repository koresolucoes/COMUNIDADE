import { ServiceDefinition, BuildContext, ServiceCompose } from './service.interface';

export const n8nService: ServiceDefinition = {
  id: 'n8n',
  name: 'n8n',
  description: 'Plataforma de automação de workflows.',
  logo: 'https://i.imgur.com/1irkLDl.png',
  expose: true,
  
  defaultConfig: {
    mode: 'standalone',
    queue_config: {
        editor_host: 'n8n.editor.com.br',
        webhook_host: 'n8n.webhook.com.br',
        encryption_key: 'r3djGX2vPoeL9zKL',
        webhook_replicas: 2,
        worker_replicas: 1,
        worker_concurrency: 10
    },
    environment: { 
      GENERIC_TIMEZONE: 'America/Sao_Paulo',
      TZ: 'America/Sao_Paulo',
      NODE_ENV: 'production',
      
      // v2.0+ Security & Breaking Changes
      N8N_BLOCK_ENV_ACCESS_IN_NODE: 'true',
      N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS: 'true',
      N8N_RUNNERS_ENABLED: 'true',
      NODES_EXCLUDE: '[ "n8n-nodes-base.executeCommand", "n8n-nodes-base.localFileTrigger" ]',
      N8N_SKIP_AUTH_ON_OAUTH_CALLBACK: 'false',
      N8N_RESTRICT_FILE_ACCESS_TO: '/home/node/.n8n/data',
      N8N_GIT_NODE_DISABLE_BARE_REPOS: 'true',
      N8N_DEFAULT_BINARY_DATA_MODE: 'filesystem',
      
      // Queue & Community Features
      EXECUTIONS_DATA_PRUNE: 'true',
      EXECUTIONS_DATA_MAX_AGE: 336,
      N8N_REINSTALL_MISSING_PACKAGES: 'true',
      N8N_COMMUNITY_PACKAGES_ENABLED: 'true',
      N8N_NODE_PATH: '/home/node/.n8n/nodes',
      N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE: 'true',
      NODE_FUNCTION_ALLOW_EXTERNAL: 'moment,lodash',
      QUEUE_CONCURRENCY: 10,
    },
    ports: [{ target: 5678, published: 5678, mode: 'ingress' }],
    volumes: ['n8n_data:/home/node/.n8n'],
    networks: ['network_public', 'network_internal']
  },

  getTemplate(config: any, context: BuildContext): ServiceCompose {
    
    // --- Standalone Mode ---
    if (config.mode === 'standalone') {
        const service: any = {
            image: 'n8nio/n8n:latest',
            restart: 'always',
            environment: { ...config.environment },
            ports: config.ports,
            volumes: config.volumes,
            deploy: {
                labels: []
            }
        };
        
        const networks = [...(config.networks || [])];

        if (context.selectedServices['postgres']) {
            const pgConfig = context.allConfigs['postgres'];
            service.environment = {
                ...service.environment,
                DB_TYPE: 'postgresdb',
                DB_POSTGRESDB_HOST: 'postgres',
                DB_POSTGRESDB_PORT: 5432,
                DB_POSTGRESDB_DATABASE: pgConfig.environment.POSTGRES_DB,
                DB_POSTGRESDB_USER: pgConfig.environment.POSTGRES_USER,
                DB_POSTGRESDB_PASSWORD: pgConfig.environment.POSTGRES_PASSWORD
            };
            networks.push('network_internal');
        }
        
        if (context.selectedServices['traefik']) {
            service.deploy.labels.push(
                'traefik.enable=true',
                'traefik.http.routers.n8n.rule=Host(`n8n.localhost`)',
                'traefik.http.routers.n8n.entrypoints=websecure',
                'traefik.http.routers.n8n.tls.certresolver=letsencryptresolver',
                'traefik.http.services.n8n.loadbalancer.server.port=5678'
            );
            networks.push('network_public');
        }

        if (networks.length > 0) {
            service.networks = Array.from(new Set(networks));
        }

        return {
            services: { n8n: service },
            volumes: { n8n_data: { external: true, name: 'n8n_data' } }
        };
    }

    // --- Queue Mode ---
    const queueConfig = config.queue_config;
    const commonEnv: any = {
        ...config.environment,
        N8N_ENCRYPTION_KEY: queueConfig.encryption_key,
        N8N_HOST: queueConfig.editor_host,
        N8N_EDITOR_BASE_URL: `https://${queueConfig.editor_host}/`,
        WEBHOOK_URL: `https://${queueConfig.webhook_host}/`,
        N8N_PROTOCOL: 'https',
        EXECUTIONS_MODE: 'queue',
        QUEUE_BULL_REDIS_DB: 2,
        QUEUE_CONCURRENCY: queueConfig.worker_concurrency,
    };

    if (context.selectedServices['postgres']) {
        const pgConfig = context.allConfigs['postgres'];
        Object.assign(commonEnv, {
            DB_TYPE: 'postgresdb',
            DB_POSTGRESDB_HOST: 'postgres',
            DB_POSTGRESDB_PORT: 5432,
            DB_POSTGRESDB_DATABASE: pgConfig.environment.POSTGRES_DB,
            DB_POSTGRESDB_USER: pgConfig.environment.POSTGRES_USER,
            DB_POSTGRESDB_PASSWORD: pgConfig.environment.POSTGRES_PASSWORD,
        });
    }

    if (context.selectedServices['redis']) {
        Object.assign(commonEnv, {
            QUEUE_BULL_REDIS_HOST: 'redis',
            QUEUE_BULL_REDIS_PORT: 6379,
        });
    }
    
    const userNetworks = config.networks || [];
    const publicInternalNetworks = Array.from(new Set([...userNetworks, 'network_public', 'network_internal']));


    const n8n_editor = {
        image: 'n8nio/n8n:latest',
        command: 'start',
        environment: commonEnv,
        networks: publicInternalNetworks,
        volumes: config.volumes,
        deploy: {
            mode: 'replicated',
            replicas: 1,
            placement: { constraints: ['node.role == manager'] },
            resources: { limits: { cpus: '0.5', memory: '1024M' } },
            labels: [
                'traefik.enable=true',
                `traefik.http.routers.n8n_editor.rule=Host(\`${queueConfig.editor_host}\`)`,
                'traefik.http.routers.n8n_editor.entrypoints=websecure',
                'traefik.http.routers.n8n_editor.priority=1',
                'traefik.http.routers.n8n_editor.tls.certresolver=letsencryptresolver',
                'traefik.http.routers.n8n_editor.service=n8n_editor',
                'traefik.http.services.n8n_editor.loadbalancer.server.port=5678',
                'traefik.http.services.n8n_editor.loadbalancer.passHostHeader=true',
            ]
        }
    };
    
    const n8n_webhook = {
        image: 'n8nio/n8n:latest',
        command: 'webhook',
        environment: commonEnv,
        networks: publicInternalNetworks,
        deploy: {
            mode: 'replicated',
            replicas: queueConfig.webhook_replicas,
            placement: { constraints: ['node.role == manager'] },
            resources: { limits: { cpus: '0.5', memory: '1024M' } },
            labels: [
                'traefik.enable=true',
                `traefik.http.routers.n8n_webhook.rule=Host(\`${queueConfig.webhook_host}\`)`,
                'traefik.http.routers.n8n_webhook.entrypoints=websecure',
                'traefik.http.routers.n8n_webhook.priority=1',
                'traefik.http.routers.n8n_webhook.tls.certresolver=letsencryptresolver',
                'traefik.http.routers.n8n_webhook.service=n8n_webhook',
                'traefik.http.services.n8n_webhook.loadbalancer.server.port=5678',
                'traefik.http.services.n8n_webhook.loadbalancer.passHostHeader=true',
            ]
        }
    };

    const n8n_worker = {
        image: 'n8nio/n8n:latest',
        command: `worker --concurrency=${queueConfig.worker_concurrency}`,
        environment: commonEnv,
        networks: publicInternalNetworks,
        volumes: config.volumes,
        deploy: {
            mode: 'replicated',
            replicas: queueConfig.worker_replicas,
            placement: { constraints: ['node.role == manager'] },
            resources: { limits: { cpus: '0.5', memory: '1024M' } },
        }
    };

    const n8n_mcp_api = {
        image: 'n8nio/n8n:latest',
        command: 'webhook',
        networks: publicInternalNetworks,
        environment: commonEnv,
        deploy: {
            mode: 'replicated',
            replicas: 1,
            placement: { constraints: ['node.role == manager'] },
            resources: { limits: { cpus: '1', memory: '2048M' } },
            labels: [
                'traefik.enable=true',
                'traefik.http.middlewares.nogzip.headers.customResponseHeaders.Content-Encoding=""',
                `traefik.http.routers.n8n_mcp_api.rule=Host(\`${queueConfig.webhook_host}\`) && PathPrefix(\`/mcp\`)`,
                'traefik.http.routers.n8n_mcp_api.entrypoints=websecure',
                'traefik.http.routers.n8n_mcp_api.tls.certresolver=letsencryptresolver',
                'traefik.http.routers.n8n_mcp_api.service=n8n_mcp_api',
                'traefik.http.services.n8n_mcp_api.loadbalancer.server.port=5678',
                'traefik.http.services.n8n_mcp_api.loadbalancer.passHostHeader=true',
                'traefik.http.routers.n8n_mcp_api.middlewares=nogzip'
            ],
            update_config: {
                parallelism: 1,
                delay: '30s',
                order: 'start-first',
                failure_action: 'rollback'
            }
        }
    };

    return {
        services: { n8n_editor, n8n_webhook, n8n_worker, n8n_mcp_api },
        volumes: { n8n_data: { external: true, name: 'n8n_data' } }
    };
  }
};