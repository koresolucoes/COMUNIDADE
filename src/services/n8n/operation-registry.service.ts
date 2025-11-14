import { Injectable } from '@angular/core';
import { IOperation, StepOperation } from './operations/operation.interface';
import { operations } from './operations';

@Injectable()
export class OperationRegistryService {
  private availableOperations: IOperation[] = operations.map(Op => new Op());
  private operationsMap: Map<StepOperation, IOperation> = new Map(
    this.availableOperations.map(op => [op.type, op])
  );

  getAvailableOperations(): IOperation[] {
    return this.availableOperations;
  }

  getOperationByType(type: StepOperation): IOperation | undefined {
    return this.operationsMap.get(type);
  }
}
