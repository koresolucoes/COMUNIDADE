import { IOperation, StepOperation, FilterParams, FilterOperator } from './operation.interface';

export class FilterOperation implements IOperation<FilterParams> {
  readonly type: StepOperation = 'filter';
  readonly name = 'Filtrar Array';
  readonly defaultParams: FilterParams = {
    property: '',
    operator: '===',
    value: '',
  };

  generateCode(previousCode: string, params: FilterParams): string {
    if (!params.property) {
      return `${previousCode}?.filter(() => true)`;
    }
    const value = typeof params.value === 'string' ? `'${params.value.replace(/'/g, "\\'")}'` : params.value;
    return `${previousCode}?.filter(item => item?.${params.property} ${params.operator} ${value})`;
  }

  execute(previousData: any, params: FilterParams): any {
    if (!Array.isArray(previousData)) {
      return [];
    }
    if (!params.property) {
      return previousData;
    }

    // A simple evaluation for the preview
    const val = isNaN(Number(params.value)) ? params.value : Number(params.value);

    return previousData.filter(item => {
      if (typeof item !== 'object' || item === null) return false;
      const itemValue = item[params.property];
      switch (params.operator) {
        case '===': return itemValue === val;
        case '!==': return itemValue !== val;
        case '>': return itemValue > val;
        case '<': return itemValue < val;
        case '>=': return itemValue >= val;
        case '<=': return itemValue <= val;
        default: return false;
      }
    });
  }
}
