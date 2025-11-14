import { IOperation, StepOperation, GetPropertyParams } from './operation.interface';

const validIdentifierRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

export class GetPropertyOperation implements IOperation<GetPropertyParams> {
  readonly type: StepOperation = 'getProperty';
  readonly name = 'Pegar Propriedade';
  readonly defaultParams: GetPropertyParams = { property: '' };

  generateCode(previousCode: string, params: GetPropertyParams): string {
    if (!params.property) {
      return previousCode;
    }
    if (validIdentifierRegex.test(params.property)) {
      return `${previousCode}?.${params.property}`;
    }
    return `${previousCode}?.["${params.property}"]`;
  }

  execute(previousData: any, params: GetPropertyParams): any {
    if (!params.property || typeof previousData !== 'object' || previousData === null) {
      return undefined;
    }
    return previousData[params.property];
  }
}
