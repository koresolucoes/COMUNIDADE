
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-seguranca-ci-cd',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './seguranca-ci-cd.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegurancaCiCdComponent {
  githubActionSnippet = `
name: DevSecOps Pipeline Example

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  security-pipeline:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      # 1. Análise Estática de Código (SAST) com CodeQL
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3

      # 2. Análise de Composição de Software (SCA)
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Check for vulnerable dependencies
        run: npm audit --audit-level=high

      # 3. Escaneamento de Segredos
      - name: Scan for secrets
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          exit-code: '1'
          ignore-unfixed: true
          severity: 'CRITICAL,HIGH'
          format: 'table'
          trivy-config: trivy-config.yaml # Supõe um arquivo de configuração

      # 4. Escaneamento da Imagem Docker
      - name: Build Docker image
        run: docker build -t minha-api-segura:latest .
      
      - name: Scan Docker image with Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'minha-api-segura:latest'
          format: 'table'
          exit-code: '1'
          ignore-unfixed: true
          severity: 'CRITICAL,HIGH'
`.trim();
}
