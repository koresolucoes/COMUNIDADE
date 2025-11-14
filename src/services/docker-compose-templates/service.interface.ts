/**
 * The context passed to each service template's build function.
 * Contains information about the overall docker-compose stack being built.
 */
export interface BuildContext {
  // A record of which service IDs are currently selected by the user.
  selectedServices: Record<string, boolean>;
  // A record containing the full configuration objects for all selected services.
  allConfigs: Record<string, any>;
}

/**
 * The output of a service template's build function.
 */
export interface ServiceCompose {
  // The YAML-like object for the 'service' itself, which can contain multiple services.
  services: Record<string, any>; 
  // Any top-level volumes this service requires.
  volumes?: Record<string, any | null>;
  // Any top-level networks this service requires.
  networks?: Record<string, any | null>;
}

/**
 * Defines the contract for a modular service that can be used by the Docker Compose Generator.
 */
export interface ServiceDefinition {
  // Unique identifier for the service (e.g., 'n8n', 'traefik').
  id: string;
  // User-friendly name of the service (e.g., 'n8n').
  name: string;
  // A brief description of the service.
  description: string;
  // Filename of the logo (e.g., 'n8n.svg').
  logo: string;
  // Whether this service is designed to be exposed via a reverse proxy like Traefik.
  expose: boolean;
  
  /**
   * Returns the default configuration object for this service.
   * This object's structure will be used to generate the configuration form in the UI.
   */
  defaultConfig: any;

  /**
   * Generates the docker-compose YAML structure for this service.
   * @param config The current user-defined configuration for this service.
   * @param context Provides context about the entire stack being built.
   * @returns A `ServiceCompose` object containing the service definition and any required top-level volumes/networks.
   */
  getTemplate(config: any, context: BuildContext): ServiceCompose;
}