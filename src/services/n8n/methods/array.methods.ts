import { MethodDefinition } from './method.interface';

export const ARRAY_METHODS: MethodDefinition[] = [
  // Suggested
  {
    name: 'length',
    appliesTo: ['array', 'string'],
    category: 'Suggested',
    description: 'Retorna o número de elementos em um array ou caracteres em uma string.',
    example: "['Bob', 'Bill', 'Nat']\n// Result: 3"
  },
  {
    name: 'last()',
    appliesTo: ['array'],
    category: 'Suggested',
    description: 'Retorna o último elemento de um array.',
    example: "['Bob', 'Bill', 'Nat']\n// Result: 'Nat'"
  },
  {
    name: 'includes()',
    appliesTo: ['array', 'string'],
    category: 'Suggested',
    description: 'Verifica se um array contém um determinado elemento ou se uma string contém uma substring.',
    example: "['Bob', 'Bill'].includes('Bill')\n// Result: true",
    parameters: [
      { name: 'element', type: 'any', description: 'O valor a ser pesquisado.' },
      { name: 'start', type: 'number', optional: true, description: 'O índice inicial da busca.' }
    ]
  },
  {
    name: 'map()',
    appliesTo: ['array'],
    category: 'Suggested',
    description: 'Cria um novo array com os resultados da chamada de uma função para cada elemento do array.',
    example: "[{ 'id': 1}, {'id': 2}].map(item => item.id)\n// Result: [1, 2]"
  },
  {
    name: 'filter()',
    appliesTo: ['array'],
    category: 'Suggested',
    description: 'Cria um novo array com todos os elementos que passaram no teste implementado pela função fornecida.',
    example: "[1, 2, 3, 4].filter(n => n > 2)\n// Result: [3, 4]"
  },
  // Other
  {
    name: 'append()',
    appliesTo: ['array'],
    category: 'Other',
    description: 'Adiciona um elemento ao final de um array e retorna o novo array.',
    example: "[1, 2].append(3)\n// Result: [1, 2, 3]",
     parameters: [{ name: 'element', type: 'any', description: 'Elemento a adicionar.' }]
  },
  {
    name: 'chunk()',
    appliesTo: ['array'],
    category: 'Other',
    description: 'Cria um array de elementos divididos em grupos do tamanho de `size`.',
    example: "['a', 'b', 'c', 'd'].chunk(2)\n// Result: [['a', 'b'], ['c', 'd']]",
    parameters: [{ name: 'size', type: 'number', description: 'Tamanho de cada parte.', defaultValue: 1 }]
  },
  {
    name: 'compact()',
    appliesTo: ['array'],
    category: 'Other',
    description: 'Cria um array com todos os valores falsy removidos (false, null, 0, "", undefined, e NaN).',
    example: "[0, 1, false, 2, '', 3].compact()\n// Result: [1, 2, 3]"
  },
  {
    name: 'concat()',
    appliesTo: ['array'],
    category: 'Other',
    description: 'Combina dois ou mais arrays.',
    example: "[1].concat([2], [3, 4])\n// Result: [1, 2, 3, 4]"
  },
   {
    name: 'find()',
    appliesTo: ['array'],
    category: 'Other',
    description: 'Retorna o primeiro elemento no array que satisfaz a função de teste fornecida.',
    example: "[{n:1}, {n:2}].find(i => i.n === 2)\n// Result: { n: 2 }"
  },
  {
    name: 'indexOf()',
    appliesTo: ['array'],
    category: 'Other',
    description: 'Retorna o primeiro índice em que um determinado elemento pode ser encontrado no array, ou -1 se não estiver presente.',
    example: "[1, 2, 1, 2].indexOf(2)\n// Result: 1",
    parameters: [
      { name: 'searchElement', type: 'any', description: 'Elemento a ser localizado.' },
      { name: 'fromIndex', type: 'number', optional: true, description: 'O índice para iniciar a busca.' }
    ]
  },
  {
    name: 'join()',
    appliesTo: ['array'],
    category: 'Other',
    description: 'Junta todos os elementos de um array em uma string.',
    example: "['a', 'b', 'c'].join('~')\n// Result: 'a~b~c'",
    parameters: [{ name: 'separator', type: 'string', optional: true, description: 'O separador. Padrão é ",".' }]
  },
];
