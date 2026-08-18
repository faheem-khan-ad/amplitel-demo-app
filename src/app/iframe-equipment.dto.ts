export type IframeEquipmentAction = 'added' | 'removed';

export type IframeEquipmentSource =
  | 'new'
  | 'parent'
  | 'submitted'
  | 'existing'
  | 'swap'
  | string;

/**
 * Version 1 of the compact equipment contract shared with the Digital Twin.
 * Scene objects, backend component records and Three.js values are intentionally
 * not part of this transport DTO.
 */
export interface IframeEquipmentDto {
  schemaVersion: 1;
  equipmentId: string;
  componentId: string;
  componentName: string;
  action: IframeEquipmentAction;
  status: string;
  source: IframeEquipmentSource;
  dimensionsMm: {
    length: number;
    width: number;
    depth: number;
  };
  design: {
    x: number;
    y: number;
    z: number;
    directionOrientationDeg: number;
    locationOrientationDeg: number;
  };
  equipment?: {
    catalogId?: string;
    labelId?: string;
    type?: string;
    subType?: string;
    classCode?: string;
  };
  swap?: {
    fromEquipmentId?: string;
    fromComponentId?: string;
    toEquipmentId?: string;
    removalReason?: string;
  };
}

export function isIframeEquipmentDto(value: unknown): value is IframeEquipmentDto {
  if (!isRecord(value)) {
    return false;
  }

  const dimensions = value['dimensionsMm'];
  const design = value['design'];

  return (
    value['schemaVersion'] === 1 &&
    isString(value['equipmentId']) &&
    isString(value['componentId']) &&
    isString(value['componentName']) &&
    (value['action'] === 'added' || value['action'] === 'removed') &&
    isString(value['status']) &&
    isString(value['source']) &&
    isRecord(dimensions) &&
    isFiniteNumber(dimensions['length']) &&
    isFiniteNumber(dimensions['width']) &&
    isFiniteNumber(dimensions['depth']) &&
    isRecord(design) &&
    isFiniteNumber(design['x']) &&
    isFiniteNumber(design['y']) &&
    isFiniteNumber(design['z']) &&
    isFiniteNumber(design['directionOrientationDeg']) &&
    isFiniteNumber(design['locationOrientationDeg'])
  );
}

/** Removes parent-only metadata before a component is sent to the iframe. */
export function toIframeEquipmentDto(component: IframeEquipmentDto): IframeEquipmentDto {
  return {
    schemaVersion: 1,
    equipmentId: component.equipmentId,
    componentId: component.componentId,
    componentName: component.componentName,
    action: component.action,
    status: component.status,
    source: component.source,
    dimensionsMm: { ...component.dimensionsMm },
    design: { ...component.design },
    ...(component.equipment ? { equipment: { ...component.equipment } } : {}),
    ...(component.swap ? { swap: { ...component.swap } } : {})
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
