import { Injectable, signal } from '@angular/core';

export interface DigitalTwinComponentData {
  index: number;
  order?: string | number;
  orderId?: string | number;
  colo?: string | number;
  coloId?: string | number;
  markerId?: string;
  componentId?: string;
  componentName?: string;
  action?: string;
  componentStatus?: string;
  sceneObject?: {
    translation?: number[];
    scale?: number[];
    properties?: Record<string, unknown>;
    [key: string]: unknown;
  };
  translation?: number[];
  scale?: number[];
  xOffset?: string | number;
  yOffset?: string | number;
  zOffset?: string | number;
  length?: string | number;
  width?: string | number;
  depth?: string | number;
  azimuth?: string | number;
  raw?: unknown;
}

export interface SubmittedComponentData {
  action: string;
  markerId: string;
  componentId: string;
  componentName: string;
  iframeSessionSource: string;
  sceneObject: unknown;
  translation: number[];
  scale: number[];
  quaternion: number[];
  xOffset: string;
  yOffset: string;
  zOffset: string;
  length: string;
  width: string;
  depth: string;
  azimuth: string;
  raw: unknown;
  componentStatus: 'Requested';
}

export type EditableComponentField =
  | 'componentName'
  | 'action'
  | 'xOffset'
  | 'yOffset'
  | 'zOffset'
  | 'length'
  | 'width'
  | 'depth'
  | 'azimuth';

export interface ComponentSection {
  key: string;
  title: string;
  components: DigitalTwinComponentData[];
}

export interface DigitalTwinOrderPayload {
  sectionKey?: string | number;
  sectionTitle?: string;
  order?: {
    key?: string | number;
    title?: string;
    componentCount?: number;
  };
  components: DigitalTwinComponentData[];
}

@Injectable({ providedIn: 'root' })
export class ComponentDataStore {
  readonly components = signal<DigitalTwinComponentData[]>([]);
  readonly editSection = signal<ComponentSection | null>(null);
  readonly submittedComponents = signal<SubmittedComponentData[]>([
    {
      action: 'added',
      markerId: '7d1ff114-09d3-4222-aaba-aae71fc4184b',
      componentId: '7d1ff114-09d3-4222-aaba-aae71fc4184b',
      componentName: 'Telco Equipment 1',
      iframeSessionSource: 'new',
      sceneObject: {
        id: '7d1ff114-09d3-4222-aaba-aae71fc4184b',
        name: 'Telco Equipment 1',
        translation: [
          -0.3046545401626006,
          -1.1695879554308333,
          157.78259247517974
        ],
        scale: [0.081, 0.16, 0.75],
        rotation: [
          [2.83276944882399e-16, 1, 0],
          [-1, 2.83276944882399e-16, 0],
          [0, 0, 1]
        ],
        properties: {
          telco_equipment_type: 'antenna',
          telco_equipment_sub_type: 'antenna',
          telco_equipment_class_code: 'panel',
          telco_equipment_visual_enabled: true,
          telco_equipment_label_id: '67b329474ee46c890aea2a2b',
          component_reference: '6790d1d8d7a62e6ec06d4f59'
        },
        type: 'cuboid',
        action: 'removed',
        isIframeSessionEquipment: true,
        iframeSessionSource: 'new'
      },
      translation: [
        -0.3046545401626006,
        -1.1695879554308333,
        157.78259247517974
      ],
      scale: [0.081, 0.16, 0.75],
      quaternion: [0, 0, -0.7071067811865475, 0.7071067811865476],
      xOffset: '0.685 m',
      yOffset: '-0.820 m',
      zOffset: '26.789 m',
      length: 'N/A',
      width: 'N/A',
      depth: 'N/A',
      azimuth: 'N/A',
      raw: {
        offsetX: '0.685',
        offsetY: '-0.820',
        offsetZ: '26.789',
        length: null,
        width: null,
        depth: null
      },
      componentStatus: 'Requested'
    },
    {
      action: 'removed',
      markerId: '17766a3d-8f59-4a94-907e-a510ecaeac89',
      componentId: '17766a3d-8f59-4a94-907e-a510ecaeac89',
      componentName: 'Telco Equipment 2',
      iframeSessionSource: 'new',
      sceneObject: {
        id: '17766a3d-8f59-4a94-907e-a510ecaeac89',
        name: 'Telco Equipment 2',
        translation: [
          -0.020775250712844872,
          -2.5908664392559024,
          158.52989619165916
        ],
        scale: [0.085, 0.28, 0.783],
        rotation: [
          [0.15807943692543902, 0.9874263980780219, 0],
          [-0.9874263980780219, 0.15807943692543902, 0],
          [0, 0, 1]
        ],
        properties: {
          telco_equipment_type: 'antenna',
          telco_equipment_sub_type: 'antenna',
          telco_equipment_class_code: 'panel',
          telco_equipment_visual_enabled: true,
          telco_equipment_label_id: '67b329484ee46c890aea2a2e',
          component_reference: '6790d21cd7a62e6ec06d4ff7'
        },
        type: 'cuboid',
        action: 'added',
        isIframeSessionEquipment: true,
        iframeSessionSource: 'new'
      },
      translation: [
        -0.020775250712844872,
        -2.5908664392559024,
        158.52989619165916
      ],
      scale: [0.085, 0.28, 0.783],
      quaternion: [0, 0, -0.6488145201344375, 0.7609465936993999],
      xOffset: '0.859 m',
      yOffset: '-1.692 m',
      zOffset: '27.248 m',
      length: 'N/A',
      width: 'N/A',
      depth: 'N/A',
      azimuth: 'N/A',
      raw: {
        offsetX: '0.859',
        offsetY: '-1.692',
        offsetZ: '27.248',
        length: null,
        width: null,
        depth: null
      },
      componentStatus: 'Requested'
    },
    {
      action: 'removed',
      markerId: '4ceae708-70bb-4467-aec0-1cf3a5edf559',
      componentId: '6a4cb6d3952aef8763b114cb',
      componentName: 'Unknown_ANT_42',
      iframeSessionSource: 'existing',
      sceneObject: {
        id: '4ceae708-70bb-4467-aec0-1cf3a5edf559',
        name: 'Unknown_ANT_42',
        translation: [
          2.680424787548513,
          1.3329727887657945,
          178.813444269887
        ],
        scale: [
          4.013171356155309,
          3.883355307353244,
          1.7651399007809154
        ],
        rotation: [
          [
            0.005934991393606619,
            0.24363411204251512,
            -0.9698490580118192
          ],
          [
            -0.017279044762847584,
            -0.9696963535673025,
            -0.24370149053783113
          ],
          [
            -0.9998330913153661,
            0.018204431535542923,
            -0.0015453747850944183
          ]
        ],
        properties: {
          dims_order: 'hwd',
          confidence: 0.6468797922134399,
          telco_equipment_type: 'antenna',
          telco_equipment_reference_vector: [
            0.9698490580118192,
            0.24370149053783152,
            0.0015453747850944222
          ],
          component_reference: '64f721b01d1e682920de7e00',
          annotation_2d_references: [
            '67582bfc0f081c50e480e71f',
            '67582bfc0f081c50e480e721',
            '67582bfc0f081c50e480e723',
            '67582bfc0f081c50e480e725',
            '67582bfc0f081c50e480e727',
            '67582bfc0f081c50e480e729',
            '67582bfc0f081c50e480e72b',
            '67582bfc0f081c50e480e72d',
            '67582bfc0f081c50e480e72f',
            '67582bfc0f081c50e480e731'
          ],
          epaParameters: {
            epa: 24.9,
            epaWind: 12,
            referenceId: '4ceae708-70bb-4467-aec0-1cf3a5edf559',
            widthM: 3.883,
            heightM: 4.013,
            azimuth: 75.89,
            groundHeightM: 64.898,
            windForce: 2302
          }
        },
        type: 'cuboid',
        action: 'removed',
        isIframeSessionEquipment: true
      },
      translation: [
        2.680424787548513,
        1.3329727887657945,
        178.813444269887
      ],
      scale: [
        4.013171356155309,
        3.883355307353244,
        1.7651399007809154
      ],
      quaternion: [
        0.703060580559386,
        0.08048917601793595,
        -0.7003956002482814,
        0.09313063813967207
      ],
      xOffset: '2.516 m',
      yOffset: '0.715 m',
      zOffset: '39.692 m',
      length: '2.462 m',
      width: '2.382 m',
      depth: '1.083 m',
      azimuth: '75.89 deg',
      raw: {
        offsetX: '2.516',
        offsetY: '0.715',
        offsetZ: '39.692',
        length: '2.462',
        width: '2.382',
        depth: '1.083',
        azimuth: '75.89'
      },
      componentStatus: 'Requested'
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
    if (this.isOffsetField(field)) {
      return this.applyOffsetChange(component, field, value);
    }

    if (this.isDimensionField(field)) {
      return this.applyDimensionChange(component, field, value);
    }

    if (field === 'componentName') {
      return {
        ...component,
        componentName: value,
        sceneObject: component.sceneObject
          ? {
              ...component.sceneObject,
              name: value
            }
          : component.sceneObject
      };
    }

    if (field === 'action') {
      return {
        ...component,
        action: value,
        sceneObject: component.sceneObject
          ? {
              ...component.sceneObject,
              action: value
            }
          : component.sceneObject
      };
    }

    return { ...component, [field]: value };
  }

  private applyOffsetChange(
    component: DigitalTwinComponentData,
    field: 'xOffset' | 'yOffset' | 'zOffset',
    value: string
  ): DigitalTwinComponentData {
    const axisIndex = { xOffset: 0, yOffset: 1, zOffset: 2 }[field];
    const rawField = { xOffset: 'offsetX', yOffset: 'offsetY', zOffset: 'offsetZ' }[
      field
    ];
    const raw = this.getRawRecord(component);
    const previousOffset =
      this.parseNumber(raw[rawField]) ?? this.parseNumber(component[field]) ?? 0;
    const nextOffset = this.parseNumber(value) ?? previousOffset;
    const delta = nextOffset - previousOffset;
    const translation = this.updateTranslation(
      component.translation,
      axisIndex,
      delta
    );
    const sceneTranslation = this.updateTranslation(
      component.sceneObject?.translation ?? component.translation,
      axisIndex,
      delta
    );

    return {
      ...component,
      [field]: value,
      translation,
      sceneObject: component.sceneObject
        ? {
            ...component.sceneObject,
            translation: sceneTranslation
          }
        : component.sceneObject,
      raw: {
        ...raw,
        [rawField]: String(nextOffset)
      }
    };
  }

  private applyDimensionChange(
    component: DigitalTwinComponentData,
    field: 'length' | 'width' | 'depth',
    value: string
  ): DigitalTwinComponentData {
    const scaleIndex = { width: 0, depth: 1, length: 2 }[field];
    const nextScaleValue = this.parseNumber(value);
    const scale = this.updateScale(component.scale, scaleIndex, nextScaleValue);
    const sceneScale = this.updateScale(
      component.sceneObject?.scale ?? component.scale,
      scaleIndex,
      nextScaleValue
    );

    return {
      ...component,
      [field]: value,
      scale,
      sceneObject: component.sceneObject
        ? this.updateSceneObjectDimension(
            component.sceneObject,
            field,
            sceneScale,
            nextScaleValue
          )
        : component.sceneObject,
      raw: {
        ...this.getRawRecord(component),
        [field]: nextScaleValue
      }
    };
  }

  private updateTranslation(
    translation: number[] | undefined,
    axisIndex: number,
    delta: number
  ): number[] | undefined {
    if (!translation) {
      return translation;
    }

    return translation.map((coordinate, index) =>
      index === axisIndex ? coordinate + delta : coordinate
    );
  }

  private updateScale(
    scale: number[] | undefined,
    scaleIndex: number,
    value: number | null
  ): number[] | undefined {
    if (!scale || value === null) {
      return scale;
    }

    return scale.map((scaleValue, index) =>
      index === scaleIndex ? value : scaleValue
    );
  }

  private updateSceneObjectDimension(
    sceneObject: NonNullable<DigitalTwinComponentData['sceneObject']>,
    field: 'length' | 'width' | 'depth',
    scale: number[] | undefined,
    valueInMeters: number | null
  ): NonNullable<DigitalTwinComponentData['sceneObject']> {
    const properties = this.getPropertiesRecord(sceneObject.properties);

    return {
      ...sceneObject,
      scale,
      properties:
        valueInMeters === null
          ? properties
          : {
              ...properties,
              ...this.getDimensionPropertyUpdates(field, valueInMeters)
            }
    };
  }

  private getDimensionPropertyUpdates(
    field: 'length' | 'width' | 'depth',
    valueInMeters: number
  ): Record<string, number> {
    const valueInMillimeters = valueInMeters * 1000;

    if (field === 'length') {
      return {
        lengthMM: valueInMillimeters,
        heightMM: valueInMillimeters
      };
    }

    if (field === 'width') {
      return { widthMM: valueInMillimeters };
    }

    return { depthMM: valueInMillimeters };
  }

  private getPropertiesRecord(
    properties: Record<string, unknown> | undefined
  ): Record<string, unknown> {
    return properties ? { ...properties } : {};
  }

  private isOffsetField(
    field: EditableComponentField
  ): field is 'xOffset' | 'yOffset' | 'zOffset' {
    return field === 'xOffset' || field === 'yOffset' || field === 'zOffset';
  }

  private isDimensionField(
    field: EditableComponentField
  ): field is 'length' | 'width' | 'depth' {
    return field === 'length' || field === 'width' || field === 'depth';
  }

  private parseNumber(value: unknown): number | null {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }

    if (typeof value !== 'string') {
      return null;
    }

    const match = value.match(/-?\d+(\.\d+)?/);

    if (!match) {
      return null;
    }

    const parsed = Number(match[0]);

    return Number.isFinite(parsed) ? parsed : null;
  }

  private withPayloadMetadata(
    payload: DigitalTwinOrderPayload,
    fallbackOrderNumber: number
  ): DigitalTwinComponentData[] {
    const orderKey =
      payload.order?.key ??
      payload.sectionKey ??
      payload.components[0]?.orderId ??
      `order-${fallbackOrderNumber}`;
    const orderTitle =
      payload.order?.title ?? payload.sectionTitle ?? `Order ${fallbackOrderNumber}`;

    return payload.components.map((component) => ({
      ...component,
      orderId: component.orderId ?? orderKey,
      order: component.order ?? orderTitle ?? orderKey
    }));
  }

  private getSectionKey(component: DigitalTwinComponentData): string {
    const raw = this.getRawRecord(component);
    const value =
      component.orderId ??
      component.order ??
      component.coloId ??
      component.colo ??
      raw['orderId'] ??
      raw['order'] ??
      raw['coloId'] ??
      raw['colo'] ??
      'created-order';

    return String(value);
  }

  private getNextOrderNumber(): number {
    const sectionKeys = new Set(
      this.components().map((component) => this.getSectionKey(component))
    );

    return sectionKeys.size + 1;
  }

  private withSectionMetadata(
    component: DigitalTwinComponentData,
    source?: DigitalTwinComponentData
  ): DigitalTwinComponentData {
    if (!source) {
      return component;
    }

    const sourceRaw = this.getRawRecord(source);

    return {
      ...component,
      order: component.order ?? source.order ?? (sourceRaw['order'] as string | number | undefined),
      orderId:
        component.orderId ??
        source.orderId ??
        (sourceRaw['orderId'] as string | number | undefined),
      colo: component.colo ?? source.colo ?? (sourceRaw['colo'] as string | number | undefined),
      coloId:
        component.coloId ??
        source.coloId ??
        (sourceRaw['coloId'] as string | number | undefined)
    };
  }

  private getRawRecord(
    component: DigitalTwinComponentData
  ): Record<string, unknown> {
    if (component.raw && typeof component.raw === 'object') {
      return component.raw as Record<string, unknown>;
    }

    return {};
  }

  private isSameComponent(
    a: DigitalTwinComponentData,
    b: DigitalTwinComponentData
  ): boolean {
    if (a.componentId && b.componentId) {
      return a.componentId === b.componentId;
    }

    if (a.markerId && b.markerId) {
      return a.markerId === b.markerId;
    }

    return a.index === b.index && this.getSectionKey(a) === this.getSectionKey(b);
  }
}
