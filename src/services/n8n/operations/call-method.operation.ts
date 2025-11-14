import { IOperation, StepOperation, CallMethodParams } from './operation.interface';
import { MethodRegistryService } from '../method-registry.service';

/**
 * Lógica para métodos customizados do n8n que não existem nativamente no JavaScript.
 * Esta lógica é usada tanto para a execução passo a passo (visual) quanto para
 * o motor de execução de expressões em modo texto.
 */
export const N8N_EXTENDED_METHODS = {
    // COMMON
    isEmpty: function(this: any) {
        if (Array.isArray(this) || typeof this === 'string') return this.length === 0;
        if (typeof this === 'object' && this !== null) return Object.keys(this).length === 0;
        return this === null || this === undefined;
    },
    isNotEmpty: function(this: any) {
        if (Array.isArray(this) || typeof this === 'string') return this.length > 0;
        if (typeof this === 'object' && this !== null) return Object.keys(this).length > 0;
        return this !== null && this !== undefined;
    },

    // ARRAY
    last: function<T>(this: T[]): T | undefined {
        return this[this.length - 1];
    },
    append: function<T>(this: T[], element: T): T[] {
        return [...this, element];
    },
    chunk: function<T>(this: T[], size = 1): T[][] {
        const result: T[][] = [];
        const effectiveSize = Math.max(1, size);
        for (let i = 0; i < this.length; i += effectiveSize) {
            result.push(this.slice(i, i + effectiveSize));
        }
        return result;
    },

    // OBJECT
    keys: function(this: object) {
        return Object.keys(this);
    },
    values: function(this: object) {
        return Object.values(this);
    },
    hasField: function(this: object, fieldName: string) {
        return Object.prototype.hasOwnProperty.call(this, fieldName);
    },
    keepFieldsContaining: function(this: Record<string, any>, substring: string) {
        if (!substring) return this;
        const newObj: any = {};
        for (const key in this) {
            if (Object.prototype.hasOwnProperty.call(this, key) && key.includes(substring)) {
                newObj[key] = this[key];
            }
        }
        return newObj;
    },
    removeField: function(this: Record<string, any>, fieldName: string) {
        if (!fieldName) return this;
        const newObj = { ...this };
        delete newObj[fieldName];
        return newObj;
    },
    removeFieldsContaining: function(this: Record<string, any>, substring: string) {
        if (!substring) return this;
        const newObj: any = {};
        for (const key in this) {
            if (Object.prototype.hasOwnProperty.call(this, key) && !key.includes(substring)) {
                newObj[key] = this[key];
            }
        }
        return newObj;
    },
    toJsonString: function(this: object) {
        return JSON.stringify(this);
    },
    urlEncode: function(this: Record<string, any>) {
        return new URLSearchParams(this).toString();
    }
};

function formatArg(value: any, type: string): string {
    const valStr = String(value);

    // Treat variable references (like $json.name) as raw values
    if (typeof value === 'string' && /^\$[a-zA-Z]/.test(value)) {
        return value;
    }

    if (type === 'string' || (type === 'any' && typeof value === 'string' && !/^\d+(\.\d+)?$/.test(valStr))) {
        return `'${valStr.replace(/'/g, "\\'")}'`;
    }
    if (type === 'number' || (type === 'any' && typeof value === 'number')) {
        return valStr;
    }
     if (type === 'any' && /^\d+(\.\d+)?$/.test(valStr)) {
        return valStr;
    }

    return valStr;
}

/**
 * Tries to convert a string value from the UI into its most likely intended type (number, boolean, or string).
 */
function smartCoerce(value: any): any {
    // Don't coerce non-strings
    if (typeof value !== 'string') {
        return value;
    }
    
    const trimmed = value.trim();
    
    // Don't convert empty or whitespace-only strings to 0
    if (trimmed === '') {
        return value;
    }

    // Handle booleans
    if (trimmed.toLowerCase() === 'true') return true;
    if (trimmed.toLowerCase() === 'false') return false;

    // Handle numbers. isFinite is a robust way to check for valid number representations.
    if (isFinite(Number(trimmed))) {
        return Number(trimmed);
    }

    // Otherwise, it's just a string
    return value;
}


export class CallMethodOperation implements IOperation<CallMethodParams> {
  readonly type: StepOperation = 'callMethod';
  readonly name = 'Chamar Método';
  readonly defaultParams: CallMethodParams = { methodName: '', args: {} };

  private methodRegistry = new MethodRegistryService();

  generateCode(previousCode: string, params: CallMethodParams): string {
    if (!params.methodName) {
      return previousCode;
    }

    const isFunction = params.methodName.endsWith('()');
    const methodName = isFunction ? params.methodName.slice(0, -2) : params.methodName;
    
    if (!isFunction) {
        return `${previousCode}?.${methodName}`;
    }

    const methodDef = this.methodRegistry.getMethodByName(params.methodName);
    const args = params.args || {};
    let argsString = '';

    if (methodDef?.parameters) {
        const argValues = methodDef.parameters.map(p => {
            const val = args[p.name];
            return (val !== undefined && val !== '') || (typeof val === 'number' && val === 0) ? formatArg(val, p.type) : undefined;
        });
        
        while (argValues.length > 0 && argValues[argValues.length-1] === undefined) {
            argValues.pop();
        }
        argsString = argValues.join(', ');
    }

    return `${previousCode}?.${methodName}(${argsString})`;
  }

  execute(previousData: any, params: CallMethodParams): any {
    if (!params.methodName || previousData === null || typeof previousData === 'undefined') {
      return undefined;
    }

    const isFunction = params.methodName.endsWith('()');
    const methodName = isFunction ? params.methodName.slice(0, -2) : params.methodName;
    const args = params.args || {};
    const methodDef = this.methodRegistry.getMethodByName(params.methodName);

    const argValues = methodDef?.parameters?.map(p => {
      let val = args[p.name];
      // Use default value if the provided value is undefined or an empty string
      if ((val === undefined || val === '') && p.defaultValue !== undefined) {
          val = p.defaultValue;
      }
      
      if (val === undefined) {
          return undefined;
      }

      // Coerce to number if the type is explicitly 'number'
      if (p.type === 'number') {
        return Number(val);
      }
      
      // If type is 'any', try to guess the most appropriate type from the string value
      if (p.type === 'any') {
        return smartCoerce(val);
      }

      return val;
    }) || [];

    // Trim trailing undefined optional args so they don't get passed
    if (methodDef?.parameters) {
      for (let i = argValues.length - 1; i >= 0; i--) {
        if (argValues[i] === undefined && methodDef.parameters[i].optional) {
          argValues.pop();
        } else {
          break;
        }
      }
    }

    // Handle custom n8n methods first
    const extendedMethod = (N8N_EXTENDED_METHODS as any)[methodName];
    if (isFunction && extendedMethod) {
        return extendedMethod.apply(previousData, argValues);
    }

    // Handle native properties/methods
    const prop = (previousData as any)[methodName];
    if (isFunction) {
        if (typeof prop === 'function') {
            return prop.apply(previousData, argValues);
        }
    } else {
      return prop; // It's a property like 'length'
    }
    
    return undefined; // Method not found
  }
}
