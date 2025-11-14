import { ServiceDefinition } from './service.interface';
import { traefikService } from './traefik';
import { n8nService } from './n8n';
import { postgresService } from './postgres';
import { redisService } from './redis';
import { portainerService } from './portainer';
import { nginxService } from './nginx';
import { evolutionService } from './evolution';
import { chatwootService } from './chatwoot';

export const ALL_SERVICES: ServiceDefinition[] = [
  n8nService,
  postgresService,
  redisService,
  traefikService,
  portainerService,
  nginxService,
  evolutionService,
  chatwootService
];
