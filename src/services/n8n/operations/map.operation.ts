import { IOperation, StepOperation, MapParams } from './operation.interface';

export class MapOperation implements IOperation<MapParams> {
  readonly type: StepOperation = 'map';
  readonly name = 'Mapear Array';
  readonly defaultParams: MapParams = { property: '' };

  generateCode(previousCode: string, params: MapParams): string {
    if (!params.property) {
      return `${previousCode}?.map(item => item)`;
    }
    return `${previousCode}?.map(item => item?.${params.property})`;
  }

  execute(previousData: any, params: MapParams): any {
    if (!Array.isArray(previousData)) {
      return [];
    }
    if (!params.property) {
      return previousData;
    }
    return previousData.map(item => {
      if (typeof item !== 'object' || item === null) return undefined;
      return item[params.property];
    });
  }
}
