import { Injectable } from '@angular/core';

interface ExecutionResult {
  value: any;
  isError: boolean;
}

@Injectable()
export class ExpressionExecutorService {
  execute(expression: string, context: object): ExecutionResult {
    const code = expression.trim().replace(/^\{\{/, '').replace(/\}\}$/, '').trim();

    if (!code) {
      return { value: '', isError: false };
    }

    const contextKeys = Object.keys(context);
    const contextValues = Object.values(context);
    
    try {
      const executor = new Function(
        ...contextKeys,
        `return ${code}`
      );
      
      const result = executor(...contextValues);
      
      return { value: result, isError: false };
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Erro desconhecido durante a execução.';
      return { value: `Erro: ${errorMessage}`, isError: true };
    }
  }
}
