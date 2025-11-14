import { Injectable, signal, computed } from '@angular/core';

interface ExecutionContext {
  $json?: any;
  $node?: any;
  $env?: any;
}

interface ContextState {
  data: ExecutionContext | null;
  error: string | null;
}

const initialJson = {
  "usuario": {
    "nome": "Ana Silva",
    "id_cliente": 123
  },
  "pedidos": [
    {"id": 10, "valor": 150, "status": "pago"},
    {"id": 11, "valor": 80, "status": "pendente"},
    {"id": 12, "valor": 220, "status": "pago"}
  ]
};

const initialNode = {
  "Webhook": {
    "json": {
      "body": {
        "id_cliente": 456
      }
    }
  },
  "ReadFile": {
    "json": {
      "data": "conteúdo do arquivo"
    }
  }
};

const initialEnv = {
  "API_KEY": "12345-ABCDE"
};

@Injectable()
export class ExpressionContextService {
  jsonInput = signal(JSON.stringify(initialJson, null, 2));
  nodeInput = signal(JSON.stringify(initialNode, null, 2));
  envInput = signal(JSON.stringify(initialEnv, null, 2));

  context = computed<ContextState>(() => {
    try {
      const $json = this.jsonInput().trim() ? JSON.parse(this.jsonInput()) : {};
      const $node = this.nodeInput().trim() ? JSON.parse(this.nodeInput()) : {};
      const $env = this.envInput().trim() ? JSON.parse(this.envInput()) : {};

      return {
        data: { $json, $node, $env },
        error: null,
      };
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'JSON inválido';
      return { data: null, error: `Erro ao analisar o JSON de entrada: ${errorMessage}` };
    }
  });
}
