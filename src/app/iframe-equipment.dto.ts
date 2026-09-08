export enum ComponentAssociationStatus {
  CANCELLED = 'CANCELLED',
  DELETED = 'DELETED',
  AUDITED = 'AUDITED',
  REQUESTED = 'REQUESTED',
  RESERVED = 'RESERVED',
  OFFERED = 'OFFERED',
  PROPOSED_CREATE = 'PROPOSED CREATE',
  EXISTING = 'EXISTING',
  PROPOSED_REMOVE = 'PROPOSED REMOVE',
  PROPOSED_REMOVE_SWAP = 'PROPOSED REMOVE - SWAP',
  REMOVED = 'REMOVED',
  UNLICENSED = 'UNLICENSED',
  UNCATEGORISED = 'UNCATEGORISED',
  LEGACY_RESERVED = 'LEGACY RESERVED',
  ORPHANED = 'ORPHANED',
  UNMATCHED = 'UNASSOCIATED',
  MATCHED = 'ASSOCIATED',
  CUSTOM_INTERNAL = 'CUSTOM INTERNAL',
  NO_STATUS = 'No Status',
}

export interface OrderAssetDetails {
  assetCategory: string;
  assetTypeKey: string;
  assetTypeValue: string;
  status: ComponentAssociationStatus;
  directionOrientationDesign_deg: number;
  xDesign_m: number;
  yDesign_m: number;
  zDesign_m: number;
  tiltDesign_deg: number | null;
  length_mm: number;
  width_mm: number;
  depth_mm: number;
  assetClassCode: string;
  isAssetSwapped: boolean;
  swappedWithPortalUniqueId: string | null;
}

export interface OrderAsset {
  portalUniqueId: string | null;
  /** Digital Twin component name, including names generated for new assets. */
  assetId: string | null;
  assetDetails: OrderAssetDetails | null;
}

export interface InitialiseDigitalTwinPayload {
  eventType: 'INITIALISE_DT';
  siteId: string;
  structureId: string;
  timestamp: string;
  dtConfiguration: {
    showActionButton: boolean;
    actionButtonLabel: string;
    ownerCompanyName: string;
  };
  allowDragAndDrop: boolean;
}

export interface LoadOrderAssetsPayload {
  eventType: 'LOAD_ORDER_ASSETS';
  siteId: string;
  structureId: string;
  timestamp: string;
  dtConfiguration: {
    showActionButton: boolean;
    actionButtonLabel: string;
    ownerCompanyName: string;
    allowDragAndDrop: boolean;
  };
  orderAssets: OrderAsset[];
}

export interface DigitalTwinOrderAssetsResponsePayload {
  eventType: 'DIGITAL_TWIN_CREATE_COLS';
  siteId: string;
  structureId: string;
  timestamp: string;
  dtConfiguration: {
    showActionButton: boolean;
    actionButtonLabel: string;
    ownerCompanyName: string;
    allowDragAndDrop?: boolean;
  };
  allowDragAndDrop?: boolean;
  orderAssets: OrderAsset[];
}

export interface DigitalTwinCloseCheckPayload {
  eventType: 'DT_CLOSE_CHECK';
  hasUnsavedChanges: boolean;
}

export interface SpatialAssetReference {
  portalUniqueId: string | null;
  assetId: string | null;
}

export interface SpatialPositionCheckPayload {
  eventType: 'SPATIAL_POSITION_CHECK';
  siteId: string;
  structureId: string;
  timestamp: string;
  assetsToValidate: SpatialAssetReference[];
  orderAssets: OrderAsset[];
}

export interface SpatialOverlapAsset extends SpatialAssetReference {
  reason: string;
}

export interface SpatialValidationResult extends SpatialAssetReference {
  isOverlapping: boolean;
  overlappingAssets: SpatialOverlapAsset[];
}

export interface SpatialPositionCheckResponsePayload {
  eventType: 'SPATIAL_POSITION_CHECK';
  siteId: string;
  structureId: string;
  timestamp: string;
  validationResults: SpatialValidationResult[];
}

export function isOrderAsset(value: unknown): value is OrderAsset {
  if (!isRecord(value)) return false;

  const portalUniqueId = value['portalUniqueId'];
  const assetId = value['assetId'];
  const details = value['assetDetails'];
  if (!isNonEmptyString(portalUniqueId) && !isNonEmptyString(assetId)) {
    return false;
  }
  if (portalUniqueId !== null && !isString(portalUniqueId)) return false;
  if (assetId !== null && !isString(assetId)) return false;
  if (details === null) return true;
  if (!isRecord(details)) return false;

  return (
    isNonEmptyString(details['assetCategory']) &&
    isNonEmptyString(details['assetTypeKey']) &&
    isNonEmptyString(details['assetTypeValue']) &&
    isComponentAssociationStatus(details['status']) &&
    isFiniteNumber(details['directionOrientationDesign_deg']) &&
    isFiniteNumber(details['xDesign_m']) &&
    isFiniteNumber(details['yDesign_m']) &&
    isFiniteNumber(details['zDesign_m']) &&
    (details['tiltDesign_deg'] === null ||
      isFiniteNumber(details['tiltDesign_deg'])) &&
    isFiniteNumber(details['length_mm']) &&
    isFiniteNumber(details['width_mm']) &&
    isFiniteNumber(details['depth_mm']) &&
    isString(details['assetClassCode']) &&
    typeof details['isAssetSwapped'] === 'boolean' &&
    (details['swappedWithPortalUniqueId'] === null ||
      isString(details['swappedWithPortalUniqueId']))
  );
}

export function cloneOrderAsset(asset: OrderAsset): OrderAsset {
  return {
    portalUniqueId: asset.portalUniqueId,
    assetId: asset.assetId,
    assetDetails: asset.assetDetails ? { ...asset.assetDetails } : null,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

function isComponentAssociationStatus(
  value: unknown,
): value is ComponentAssociationStatus {
  return Object.values(ComponentAssociationStatus).includes(
    value as ComponentAssociationStatus,
  );
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
