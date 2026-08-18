import { Injectable, signal } from '@angular/core';
import { IframeEquipmentDto } from './iframe-equipment.dto';

/** Metadata used only to group rows in this parent application. */
interface ParentComponentMetadata {
  index?: number;
  order?: string | number;
  orderId?: string | number;
  colo?: string | number;
  coloId?: string | number;
}

/** The complete iframe DTO plus parent-only table metadata. */
export type DigitalTwinComponentData = IframeEquipmentDto &
  ParentComponentMetadata;

export type SubmittedComponentData = IframeEquipmentDto;

export type EditableComponentField =
  | 'componentName'
  | 'action'
  | 'x'
  | 'y'
  | 'z'
  | 'directionOrientationDeg'
  | 'locationOrientationDeg'
  | 'length'
  | 'width'
  | 'depth';

export interface ComponentSection {
  key: string;
  title: string;
  components: DigitalTwinComponentData[];
}

export interface DigitalTwinOrderPayload {
  componentSchemaVersion?: 1;
  sectionKey?: string | number;
  sectionTitle?: string;
  order?: {
    key?: string | number;
    title?: string;
    componentCount?: number;
  };
  components: IframeEquipmentDto[];
}

@Injectable({ providedIn: 'root' })
export class ComponentDataStore {
  readonly components = signal<DigitalTwinComponentData[]>([]);
  readonly editSection = signal<ComponentSection | null>(null);
  readonly submittedComponents = signal<SubmittedComponentData[]>([
    {
      schemaVersion: 1,
      equipmentId: '7d1ff114-09d3-4222-aaba-aae71fc4184b',
      componentId: '6790d1d8d7a62e6ec06d4f59',
      componentName: 'Telco Equipment 1',
      action: 'added',
      status: 'Requested',
      source: 'new',
      dimensionsMm: { length: 750, width: 160, depth: 81 },
      design: {
        x: 0.685,
        y: -0.82,
        z: 26.789,
        directionOrientationDeg: 90,
        locationOrientationDeg: 140.1
      },
      equipment: {
        labelId: '67b329474ee46c890aea2a2b',
        type: 'antenna',
        subType: 'antenna',
        classCode: 'panel'
      }
    },
    {
      schemaVersion: 1,
      equipmentId: '17766a3d-8f59-4a94-907e-a510ecaeac89',
      componentId: '6790d21cd7a62e6ec06d4ff7',
      componentName: 'Telco Equipment 2',
      action: 'removed',
      status: 'Requested',
      source: 'new',
      dimensionsMm: { length: 783, width: 280, depth: 85 },
      design: {
        x: 0.859,
        y: -1.692,
        z: 27.248,
        directionOrientationDeg: 80.9,
        locationOrientationDeg: 153.1
      },
      equipment: {
        labelId: '67b329484ee46c890aea2a2e',
        type: 'antenna',
        subType: 'antenna',
        classCode: 'panel'
      }
    },
    {
      schemaVersion: 1,
      equipmentId: '4ceae708-70bb-4467-aec0-1cf3a5edf559',
      componentId: '6a4cb6d3952aef8763b114cb',
      componentName: 'Unknown_ANT_42',
      action: 'removed',
      status: 'Requested',
      source: 'existing',
      dimensionsMm: { length: 2462, width: 2382, depth: 1083 },
      design: {
        x: 2.516,
        y: 0.715,
        z: 39.692,
        directionOrientationDeg: 75.89,
        locationOrientationDeg: 74.13
      },
      equipment: { type: 'antenna' }
    }
  ]);

  setComponents(components: DigitalTwinComponentData[]): void {
    this.components.set(components);
  }

  setOrderPayload(payload: DigitalTwinOrderPayload): void {
    this.components.update((components) => [
      ...components,
      ...this.withPayloadMetadata(payload, this.getNextOrderNumber())
    ]);
  }

  updateEditSection(payload: DigitalTwinOrderPayload): void {
    const section = this.editSection();

    if (!section) {
      this.setOrderPayload(payload);
      return;
    }

    const existingSectionSource = section.components[0];
    const updatedComponents = payload.components.map((component) =>
      this.withSectionMetadata(component, existingSectionSource)
    );
    const nextComponents = [
      ...this.components().filter(
        (component) => this.getSectionKey(component) !== section.key
      ),
      ...updatedComponents
    ];

    this.components.set(nextComponents);
    this.editSection.set(null);
  }

  setEditSection(section: ComponentSection | null): void {
    this.editSection.set(section);
  }

  updateComponentField(
    component: DigitalTwinComponentData,
    field: EditableComponentField,
    value: string
  ): void {
    this.components.update((components) =>
      components.map((item) =>
        this.isSameComponent(item, component)
          ? this.applyEditableFieldChange(item, field, value)
          : item
      )
    );
  }

  private applyEditableFieldChange(
    component: DigitalTwinComponentData,
    field: EditableComponentField,
    value: string
  ): DigitalTwinComponentData {
    if (field === 'componentName') {
      return { ...component, componentName: value };
    }

    if (field === 'action') {
      return value === 'added' || value === 'removed'
        ? { ...component, action: value }
        : component;
    }

    const numericValue = this.parseNumber(value);

    if (numericValue === null) {
      return component;
    }

    if (this.isDesignField(field)) {
      return {
        ...component,
        design: { ...component.design, [field]: numericValue }
      };
    }

    return {
      ...component,
      dimensionsMm: { ...component.dimensionsMm, [field]: numericValue }
    };
  }

  private isDesignField(
    field: EditableComponentField
  ): field is 'x' | 'y' | 'z' | 'directionOrientationDeg' | 'locationOrientationDeg' {
    return (
      field === 'x' ||
      field === 'y' ||
      field === 'z' ||
      field === 'directionOrientationDeg' ||
      field === 'locationOrientationDeg'
    );
  }

  private parseNumber(value: string): number | null {
    const normalized = value.trim();

    if (!normalized) {
      return null;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private withPayloadMetadata(
    payload: DigitalTwinOrderPayload,
    fallbackOrderNumber: number
  ): DigitalTwinComponentData[] {
    const orderKey =
      payload.order?.key ?? payload.sectionKey ?? `order-${fallbackOrderNumber}`;
    const orderTitle =
      payload.order?.title ?? payload.sectionTitle ?? `Order ${fallbackOrderNumber}`;

    return payload.components.map((component) => ({
      ...component,
      orderId: orderKey,
      order: orderTitle
    }));
  }

  private getSectionKey(component: DigitalTwinComponentData): string {
    return String(
      component.orderId ??
        component.order ??
        component.coloId ??
        component.colo ??
        'created-order'
    );
  }

  private getNextOrderNumber(): number {
    return new Set(
      this.components().map((component) => this.getSectionKey(component))
    ).size + 1;
  }

  private withSectionMetadata(
    component: IframeEquipmentDto,
    source?: DigitalTwinComponentData
  ): DigitalTwinComponentData {
    return {
      ...component,
      order: source?.order,
      orderId: source?.orderId,
      colo: source?.colo,
      coloId: source?.coloId
    };
  }

  private isSameComponent(
    a: DigitalTwinComponentData,
    b: DigitalTwinComponentData
  ): boolean {
    return a.equipmentId === b.equipmentId;
  }
}
