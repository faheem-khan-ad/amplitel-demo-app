import { Injectable, signal } from '@angular/core';

export interface DigitalTwinComponentData {
  index: number;
  markerId?: string;
  componentId?: string;
  componentName?: string;
  xOffset?: number;
  yOffset?: number;
  zOffset?: number;
  length?: number;
  width?: number;
  depth?: number;
  azimuth?: number;
  raw?: unknown;
}

@Injectable({ providedIn: 'root' })
export class ComponentDataStore {
  readonly components = signal<DigitalTwinComponentData[]>([]);

  setComponents(components: DigitalTwinComponentData[]): void {
    this.components.set(components);
  }
}
