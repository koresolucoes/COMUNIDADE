import { ARRAY_METHODS } from './array.methods';
import { COMMON_METHODS } from './common.methods';
import { OBJECT_METHODS } from './object.methods';
import { MethodDefinition } from './method.interface';

export const ALL_METHODS: MethodDefinition[] = [
  ...ARRAY_METHODS,
  ...OBJECT_METHODS,
  ...COMMON_METHODS,
];
