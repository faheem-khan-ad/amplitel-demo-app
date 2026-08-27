import { Injectable, signal } from '@angular/core';
import {
  DigitalTwinOrderAssetsResponsePayload,
  OrderAsset,
} from './iframe-equipment.dto';

/** Metadata used only to group rows in this parent application. */
interface ParentComponentMetadata {
  index?: number;
  order?: string | number;
  orderId?: string | number;
  colo?: string | number;
  coloId?: string | number;
}

/** The complete iframe DTO plus parent-only table metadata. */
export type DigitalTwinComponentData = OrderAsset & ParentComponentMetadata;

export type EditableComponentField = 'xDesign_m' | 'yDesign_m' | 'zDesign_m';

export interface ComponentSection {
  key: string;
  title: string;
  components: DigitalTwinComponentData[];
}

export type DigitalTwinOrderPayload = DigitalTwinOrderAssetsResponsePayload;

@Injectable({ providedIn: 'root' })
export class ComponentDataStore {
  readonly components = signal<DigitalTwinComponentData[]>([]);
  readonly editSection = signal<ComponentSection | null>(null);
  setComponents(components: DigitalTwinComponentData[]): void {
    this.components.set(components);
  }

  setOrderPayload(payload: DigitalTwinOrderPayload): void {
    const normalizedPayload = {
      ...payload,
      orderAssets: this.dedupeOrderAssets(payload.orderAssets),
    };
    this.components.update((components) => [
      ...components,
      ...this.withPayloadMetadata(normalizedPayload, this.getNextOrderNumber()),
    ]);
  }

  updateEditSection(payload: DigitalTwinOrderPayload): void {
    const section = this.editSection();

    if (!section) {
      this.setOrderPayload(payload);
      return;
    }

    const existingSectionSource = section.components[0];
    const updatedComponents = this.dedupeOrderAssets(
      payload.orderAssets,
    ).map((component) =>
      this.withSectionMetadata(component, existingSectionSource),
    );
    const nextComponents = [
      ...this.components().filter(
        (component) => this.getSectionKey(component) !== section.key,
      ),
      ...updatedComponents,
    ];

    this.components.set(nextComponents);
    this.editSection.set(null);
  }

  setEditSection(section: ComponentSection | null): void {
    this.editSection.set(section);
  }

  private dedupeOrderAssets(orderAssets: OrderAsset[]): OrderAsset[] {
    const assetsByIdentity = new Map<string, OrderAsset>();

    orderAssets.forEach((asset) => {
      const identity = this.getAssetIdentity(asset);
      assetsByIdentity.set(identity, asset);
    });

    return Array.from(assetsByIdentity.values());
  }

  private getAssetIdentity(asset: OrderAsset): string {
    return `${
      asset.portalUniqueId
        ? `PORTAL:${asset.portalUniqueId}`
        : asset.assetId
          ? `ASSET:${asset.assetId}`
          : ''
    }`
      .trim()
      .toUpperCase();
  }

  updateComponentField(
    component: DigitalTwinComponentData,
    field: EditableComponentField,
    value: string,
  ): void {
    this.components.update((components) =>
      components.map((item) =>
        this.isSameComponent(item, component)
          ? this.applyEditableFieldChange(item, field, value)
          : item,
      ),
    );
  }

  private applyEditableFieldChange(
    component: DigitalTwinComponentData,
    field: EditableComponentField,
    value: string,
  ): DigitalTwinComponentData {
    const numericValue = this.parseNumber(value);

    if (numericValue === null || !component.assetDetails) {
      return component;
    }

    return {
      ...component,
      assetDetails: { ...component.assetDetails, [field]: numericValue },
    };
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
    fallbackOrderNumber: number,
  ): DigitalTwinComponentData[] {
    const orderKey = `order-${fallbackOrderNumber}`;
    const orderTitle = `Order ${fallbackOrderNumber}`;

    return payload.orderAssets.map((asset) => ({
      ...asset,
      orderId: orderKey,
      order: orderTitle,
    }));
  }

  private getSectionKey(component: DigitalTwinComponentData): string {
    return String(
      component.orderId ??
        component.order ??
        component.coloId ??
        component.colo ??
        'created-order',
    );
  }

  private getNextOrderNumber(): number {
    return (
      new Set(
        this.components().map((component) => this.getSectionKey(component)),
      ).size + 1
    );
  }

  private withSectionMetadata(
    component: OrderAsset,
    source?: DigitalTwinComponentData,
  ): DigitalTwinComponentData {
    return {
      ...component,
      order: source?.order,
      orderId: source?.orderId,
      colo: source?.colo,
      coloId: source?.coloId,
    };
  }

  private isSameComponent(
    a: DigitalTwinComponentData,
    b: DigitalTwinComponentData,
  ): boolean {
    return a === b;
  }
}
