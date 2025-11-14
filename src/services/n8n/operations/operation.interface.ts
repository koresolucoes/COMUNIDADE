export type StepOperation = 'getProperty' | 'filter' | 'map' | 'reduceSum' | 'callMethod';

export type FilterOperator = '===' | '!==' | '>' | '<' | '>=' | '<=';

export interface GetPropertyParams {
  property: string;
}

export interface FilterParams {
  property: string;
  operator: FilterOperator;
  value: string | number;
}

export interface MapParams {
  property: string;
}

export interface CallMethodParams {
  methodName: string;
  args?: { [key: string]: any };
}

export type StepParams = GetPropertyParams | FilterParams | MapParams | CallMethodParams | {};

export interface Step {
  id: string;
  type: StepOperation;
  params: StepParams;
}

export interface IOperation<T = StepParams> {
  readonly type: StepOperation;
  readonly name: string;
  readonly defaultParams: T;

  generateCode(previousCode: string, params: T, previousData?: any): string;
  execute(previousData: any, params: T): any;
}