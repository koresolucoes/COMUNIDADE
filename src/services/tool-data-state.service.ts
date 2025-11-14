import { Injectable, signal } from '@angular/core';

export interface ToolDataPayload {
    toolId: string;
    data: any;
}

@Injectable({
  providedIn: 'root'
})
export class ToolDataStateService {
  dataToLoad = signal<ToolDataPayload | null>(null);

  setDataForLoad(payload: ToolDataPayload) {
    this.dataToLoad.set(payload);
  }

  consumeData(): ToolDataPayload | null {
    const payload = this.dataToLoad();
    this.dataToLoad.set(null); // Clear after consumption
    return payload;
  }
}