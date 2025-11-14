import { MethodDefinition } from './method.interface';

export const OBJECT_METHODS: MethodDefinition[] = [
  // Suggested
  {
    name: 'keys()',
    appliesTo: ['object'],
    category: 'Suggested',
    description: 'Retorna um array com os nomes das propriedades de um objeto.',
    example: "{ a: 1, b: 2 }.keys()\n// Result: ['a', 'b']"
  },
  {
    name: 'values()',
    appliesTo: ['object'],
    category: 'Suggested',
    description: 'Retorna um array com os valores das propriedades de um objeto.',
    example: "{ a: 1, b: 2 }.values()\n// Result: [1, 2]"
  },
  {
    name: 'hasField()',
    appliesTo: ['object'],
    category: 'Suggested',
    description: 'Verifica se um objeto possui a propriedade especificada.',
    example: "{ a: 1 }.hasField('a')\n// Result: true"
  },
  // Other
  {
    name: 'keepFieldsContaining()',
    appliesTo: ['object'],
    category: 'Other',
    description: 'Mantém apenas os campos cujo nome contém a string fornecida.',
    example: "{'id_user':1, 'name':'Max'}.keepFieldsContaining('user')\n// Result: {'id_user': 1}"
  },
  {
    name: 'removeField()',
    appliesTo: ['object'],
    category: 'Other',
    description: 'Remove um campo específico de um objeto.',
    example: "{ a: 1, b: 2 }.removeField('b')\n// Result: { a: 1 }"
  },
  {
    name: 'removeFieldsContaining()',
    appliesTo: ['object'],
    category: 'Other',
    description: 'Remove todos os campos cujo nome contém a string fornecida.',
    example: "{'id_user':1, 'name':'Max'}.removeFieldsContaining('id')\n// Result: {'name': 'Max'}"
  },
  {
    name: 'toJsonString()',
    appliesTo: ['object', 'array'],
    category: 'Other',
    description: 'Converte um objeto ou array em uma string JSON.',
    example: "{ a: 1 }.toJsonString()\n// Result: '{\"a\":1}'"
  },
  {
    name: 'urlEncode()',
    appliesTo: ['object'],
    category: 'Other',
    description: 'Gera uma string de parâmetro de URL a partir das chaves e valores do objeto.',
    example: "{ name: 'Mr Nathan', city: 'hanoi' }.urlEncode()\n// Result: 'name=Mr%20Nathan&city=hanoi'"
  },
];
