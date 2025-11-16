import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-publicando-app-vps',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './publicando-app-vps.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicandoAppVpsComponent {
  installCommandsSnippet = `
# 1. Conecte-se à sua VPS via SSH
ssh root@SEU_IP_AQUI

# 2. Atualize a lista de pacotes
sudo apt-get update

# 3. Instale o Git, Docker e Docker Compose
sudo apt-get install git docker.io -y
sudo systemctl start docker
sudo systemctl enable docker

# NOTA: O comando abaixo é para Docker Compose v2. Verifique a versão mais recente.
sudo curl -L "https://github.com/docker/compose/releases/download/v2.17.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
  `.trim();

  dockerComposeProdSnippet = `
version: '3.8'

services:
  traefik:
    image: traefik:v2.9
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--entrypoints.web.http.redirections.entryPoint.to=websecure"
      - "--entrypoints.web.http.redirections.entryPoint.scheme=https"
      - "--certificatesresolvers.myresolver.acme.httpchallenge=true"
      - "--certificatesresolvers.myresolver.acme.httpchallenge.entrypoint=web"
      - "--certificatesresolvers.myresolver.acme.email=\${LETSENCRYPT_EMAIL}"
      - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "traefik-data:/letsencrypt"
    networks:
      - web

  api:
    image: minha-api-tarefas:latest # A imagem que construiremos na VPS
    restart: always
    environment:
      - DB_HOST=db
      - DB_USER=\${DB_USER}
      - DB_PASSWORD=\${DB_PASSWORD}
      - DB_DATABASE=\${DB_DATABASE}
    networks:
      - web
      - internal
    depends_on:
      - db
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.api.rule=Host(\`\${DOMAIN_API}\`)"
        - "traefik.http.routers.api.entrypoints=websecure"
        - "traefik.http.routers.api.tls.certresolver=myresolver"
        - "traefik.http.services.api.loadbalancer.server.port=3000"

  db:
    image: postgres:13
    restart: always
    environment:
      - POSTGRES_USER=\${DB_USER}
      - POSTGRES_PASSWORD=\${DB_PASSWORD}
      - POSTGRES_DB=\${DB_DATABASE}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - internal

volumes:
  traefik-data:
  postgres-data:

networks:
  web:
  internal:
  `.trim();

  envSnippet = `
# Credenciais do Banco de Dados
DB_USER=seu_usuario_postgres
DB_PASSWORD=sua_senha_super_segura
DB_DATABASE=seu_banco_de_dados

# Configurações do Traefik e Domínio
LETSENCRYPT_EMAIL=seu-email@exemplo.com
DOMAIN_API=api.seudominio.com
  `.trim();

  buildAndRunSnippet = `
# 1. Navegue para a pasta do seu projeto clonado
cd seu-repositorio

# 2. Construa a imagem Docker da sua API na própria VPS
docker build -t minha-api-tarefas .

# 3. Inicie todos os serviços em segundo plano (-d)
docker-compose -f docker-compose.prod.yml up -d
  `.trim();
}
