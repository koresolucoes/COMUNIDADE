import { Injectable } from '@angular/core';
import { ALL_METHODS } from './methods';
import { MethodDefinition } from './methods/method.interface';

@Injectable()
export class MethodRegistryService {
  private allMethods: MethodDefinition[] = ALL_METHODS;

  getMethodsForValue(value: any): MethodDefinition[] {
    const valueType = this.getValueType(value);

    if (valueType === 'unknown') {
      return [];
    }

    return this.allMethods
      .filter(m => m.appliesTo.includes(valueType) || m.appliesTo.includes('any'))
      .sort((a, b) => {
        // Prioritize suggested, then alphabetical
        if (a.category === 'Suggested' && b.category !== 'Suggested') return -1;
        if (a.category !== 'Suggested' && b.category === 'Suggested') return 1;
        return a.name.localeCompare(b.name);
      });
  }

  private getValueType(value: any): 'array' | 'object' | 'string' | 'number' | 'unknown' {
    if (Array.isArray(value)) {
      return 'array';
    }
    if (typeof value === 'object' && value !== null) {
      return 'object';
    }
    if (typeof value === 'string') {
      return 'string';
    }
     if (typeof value === 'number') {
      return 'number';
    }
    return 'unknown';
  }
}
