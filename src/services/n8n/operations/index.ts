import { FilterOperation } from './filter.operation';
import { GetPropertyOperation } from './get-property.operation';
import { MapOperation } from './map.operation';
import { ReduceSumOperation } from './reduce-sum.operation';
import { CallMethodOperation } from './call-method.operation';

export const operations = [
    GetPropertyOperation,
    FilterOperation,
    MapOperation,
    ReduceSumOperation,
    CallMethodOperation,
];
