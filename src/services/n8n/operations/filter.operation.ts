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

    const valueStr = String(params.value);
    // Check if the value is a number, but don't convert empty string to 0.
    const isNumeric = valueStr.trim() !== '' && !isNaN(Number(valueStr));

    // If it's not a number, wrap it in quotes. Otherwise, use the raw number.
    const value = isNumeric 
        ? valueStr
        : `'${valueStr.replace(/'/g, "\\'")}'`;

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
    const valueStr = String(params.value);
    const isNumeric = valueStr.trim() !== '' && !isNaN(Number(valueStr));
    const val = isNumeric ? Number(valueStr) : valueStr;


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
