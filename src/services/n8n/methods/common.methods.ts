import { MethodDefinition } from './method.interface';

export const COMMON_METHODS: MethodDefinition[] = [
  {
    name: 'isEmpty()',
    appliesTo: ['array', 'object', 'string'],
    category: 'Suggested',
    description: 'Verifica se um array, objeto ou string está vazio.',
    example: "[].isEmpty()\n// Result: true\n\n{}.isEmpty()\n// Result: true"
  },
  {
    name: 'isNotEmpty()',
    appliesTo: ['array', 'object', 'string'],
    category: 'Other',
    description: 'Verifica se um array, objeto ou string não está vazio.',
    example: "[1, 2].isNotEmpty()\n// Result: true"
  },
];
