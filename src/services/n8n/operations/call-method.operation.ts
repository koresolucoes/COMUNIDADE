import { IOperation, StepOperation, CallMethodParams } from './operation.interface';

export class CallMethodOperation implements IOperation<CallMethodParams> {
  readonly type: StepOperation = 'callMethod';
  readonly name = 'Chamar Método';
  readonly defaultParams: CallMethodParams = { methodName: '' };

  generateCode(previousCode: string, params: CallMethodParams): string {
    if (!params.methodName) {
      return previousCode;
    }
    // Properties don't have (), methods do.
    const access = params.methodName.endsWith('()') 
      ? `.${params.methodName}` 
      : `.${params.methodName}`;
      
    return `${previousCode}?${access}`;
  }

  execute(previousData: any, params: CallMethodParams): any {
    if (!params.methodName || previousData === null || typeof previousData === 'undefined') {
      return undefined;
    }
    
    const isFunction = params.methodName.endsWith('()');
    const propName = isFunction ? params.methodName.slice(0, -2) : params.methodName;

    if (isFunction) {
        // Handle n8n-specific methods that aren't native JS
        if (Array.isArray(previousData)) {
            switch(propName) {
                case 'last': return previousData[previousData.length - 1];
            }
        }
        if (typeof previousData === 'object') {
             switch(propName) {
                case 'keys': return Object.keys(previousData);
                case 'values': return Object.values(previousData);
            }
        }
        // Fallback to native methods if they exist
        const method = (previousData as any)[propName];
        if (typeof method === 'function') {
            return method.call(previousData);
        }
    } else {
      // Handle property access
      if (propName === 'length') {
        return previousData.length;
      }
    }
    
    return undefined;
  }
}
