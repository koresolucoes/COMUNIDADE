export type MethodDataType = 'array' | 'object' | 'string' | 'number' | 'any';

export interface MethodDefinition {
  name: string;
  description: string;
  example: string;
  appliesTo: MethodDataType[];
  category: 'Suggested' | 'Other';
}
