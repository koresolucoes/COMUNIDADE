import { Injectable } from '@angular/core';
import { N8N_EXTENDED_METHODS } from './operations/call-method.operation';

interface ExecutionResult {
  value: any;
  isError: boolean;
}

@Injectable()
export class ExpressionExecutorService {

  private patchPrototypes() {
    const define = (proto: any, name: string, func: Function) => {
        Object.defineProperty(proto, name, {
            value: func,
            writable: true,
            configurable: true,
            enumerable: false
        });
    };

    // Common
    define(Array.prototype, 'isEmpty', N8N_EXTENDED_METHODS.isEmpty);
    define(Object.prototype, 'isEmpty', N8N_EXTENDED_METHODS.isEmpty);
    define(String.prototype, 'isEmpty', N8N_EXTENDED_METHODS.isEmpty);
    define(Array.prototype, 'isNotEmpty', N8N_EXTENDED_METHODS.isNotEmpty);
    define(Object.prototype, 'isNotEmpty', N8N_EXTENDED_METHODS.isNotEmpty);
    define(String.prototype, 'isNotEmpty', N8N_EXTENDED_METHODS.isNotEmpty);

    // Array
    define(Array.prototype, 'last', N8N_EXTENDED_METHODS.last);
    define(Array.prototype, 'append', N8N_EXTENDED_METHODS.append);
    define(Array.prototype, 'chunk', N8N_EXTENDED_METHODS.chunk);

    // Object
    define(Object.prototype, 'keys', N8N_EXTENDED_METHODS.keys);
    define(Object.prototype, 'values', N8N_EXTENDED_METHODS.values);
    define(Object.prototype, 'hasField', N8N_EXTENDED_METHODS.hasField);
    define(Object.prototype, 'keepFieldsContaining', N8N_EXTENDED_METHODS.keepFieldsContaining);
    define(Object.prototype, 'removeField', N8N_EXTENDED_METHODS.removeField);
    define(Object.prototype, 'removeFieldsContaining', N8N_EXTENDED_METHODS.removeFieldsContaining);
    define(Object.prototype, 'toJsonString', N8N_EXTENDED_METHODS.toJsonString);
    define(Object.prototype, 'urlEncode', N8N_EXTENDED_METHODS.urlEncode);
  }

  private cleanupPrototypes() {
    const methods = Object.keys(N8N_EXTENDED_METHODS);
    methods.forEach(name => {
        delete (Array.prototype as any)[name];
        delete (Object.prototype as any)[name];
        delete (String.prototype as any)[name];
    });
  }

  execute(expression: string, context: object): ExecutionResult {
    const code = expression.trim().replace(/^\{\{/, '').replace(/\}\}$/, '').trim();

    if (!code) {
      return { value: '', isError: false };
    }

    const contextKeys = Object.keys(context);
    const contextValues = Object.values(context);
    
    this.patchPrototypes();
    
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
    } finally {
        this.cleanupPrototypes();
    }
  }
}
