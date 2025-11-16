import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-n8n-cicd',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './n8n-cicd.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class N8nCicdComponent {
  githubActionSnippet = `
name: Deploy n8n Workflows

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Install jq
        run: sudo apt-get install -y jq

      - name: Sync workflows with n8n instance
        run: |
          # Get all workflows from the instance
          INSTANCE_WORKFLOWS=$(curl -s --fail -H "X-N8N-API-KEY: \${{ secrets.N8N_API_KEY }}" "\${{ secrets.N8N_URL }}/api/v1/workflows")
          
          if [ -z "$INSTANCE_WORKFLOWS" ]; then
            echo "::error::Failed to fetch workflows from n8n instance. Check URL and API Key."
            exit 1
          fi

          # Loop through each local workflow file
          for file in ./workflows/*.json; do
            if [ -f "$file" ]; then
              WORKFLOW_NAME=$(jq -r .name "$file")
              
              # Check if a workflow with this name exists on the instance
              EXISTING_ID=$(echo "$INSTANCE_WORKFLOWS" | jq -r --arg name "$WORKFLOW_NAME" '.data[] | select(.name == $name) | .id')

              if [ -n "$EXISTING_ID" ]; then
                # Update existing workflow
                echo "Updating workflow: $WORKFLOW_NAME (ID: $EXISTING_ID)"
                curl -X PUT --fail -H "X-N8N-API-KEY: \${{ secrets.N8N_API_KEY }}" -H "Content-Type: application/json" \\
                  --data-binary @"$file" \\
                  "\${{ secrets.N8N_URL }}/api/v1/workflows/$EXISTING_ID"
              else
                # Create new workflow
                echo "Creating new workflow: $WORKFLOW_NAME"
                curl -X POST --fail -H "X-N8N-API-KEY: \${{ secrets.N8N_API_KEY }}" -H "Content-Type: application/json" \\
                  --data-binary @"$file" \\
                  "\${{ secrets.N8N_URL }}/api/v1/workflows"
              fi
            fi
          done
  `.trim();
}
