export type MethodDataType = 'array' | 'object' | 'string' | 'number' | 'any';

export interface MethodParameter {
  name: string;
  type: 'string' | 'number' | 'any';
  optional?: boolean;
  description: string;
  defaultValue?: any;
}

export interface MethodDefinition {
  name: string;
  description: string;
  example: string;
  appliesTo: MethodDataType[];
  category: 'Suggested' | 'Other';
  parameters?: MethodParameter[];
}