import { IOperation, StepOperation } from './operation.interface';

export class ReduceSumOperation implements IOperation<{}> {
  readonly type: StepOperation = 'reduceSum';
  readonly name = 'Somar Array';
  readonly defaultParams = {};

  generateCode(previousCode: string): string {
    return `${previousCode}?.reduce((a, b) => a + b, 0)`;
  }

  execute(previousData: any): any {
    if (!Array.isArray(previousData)) {
      return 0;
    }
    return previousData.reduce((acc, val) => {
      const num = Number(val);
      return acc + (isNaN(num) ? 0 : num);
    }, 0);
  }
}
