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

export type HeadframeConfiguration =
  | {
      type: 'triangular';
      frameLength: number;
      height: number;
      pipeCount: number;
    }
  | {
      type: 'circular';
      diameter: number;
      height: number;
      pipeCount: number;
    }
  | {
      type: 'mercedes';
      frameLength: number;
      height: number;
      armConfiguration: 'single' | 'double_0_5' | 'double_1';
      pipeCount: number;
    }
  | {
      type: 'single_mount';
      height: number;
    }
  | {
      type: 'face_mount' | 'square';
      frameLength: number;
      height: number;
      pipeCount: number;
    };

export type HeadframeType = HeadframeConfiguration['type'];

export type PortalUniqueId = string | number | null;

export interface OrderAssetDetails {
  assetCategory: string;
  assetTypeKey: string;
  assetTypeValue: string | null;
  status: ComponentAssociationStatus;
  directionOrientationDesign_deg: number;
  xDesign_m: number;
  yDesign_m: number;
  zDesign_m: number;
  tiltDesign_deg: number | null;
  length_mm: number | string;
  width_mm: number | string;
  depth_mm: number | string;
  assetClassCode: string;
  ownerCompany?: string;
  headFrameHeignt?: string;
  headFrameLength?: string;
  headFrameNoOFPipes?: string;
  headFrameDiameter?: string;
  headFrameArmConfig?: string;
  headframeType?: HeadframeType;
  headframeConfiguration?: HeadframeConfiguration;
  isAssetSwapped: boolean;
  swappedWithPortalUniqueId: PortalUniqueId;
}

export interface OrderAsset {
  portalUniqueId: PortalUniqueId;
  /** Digital Twin component name, including names generated for new assets. */
  assetId: string | null;
  assetDetails: OrderAssetDetails | null;
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
  eventType: 'LOAD_ORDER_ASSETS';
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
  portalUniqueId: PortalUniqueId;
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
  if (!isPortalUniqueIdValue(portalUniqueId) && !isNonEmptyString(assetId)) {
    return false;
  }
  if (portalUniqueId !== null && !isPortalUniqueIdValue(portalUniqueId)) return false;
  if (assetId !== null && !isString(assetId)) return false;
  if (details === null) return true;
  if (!isRecord(details)) return false;

  return (
    isNonEmptyString(details['assetCategory']) &&
    isNonEmptyString(details['assetTypeKey']) &&
    (details['assetTypeValue'] === null ||
      isString(details['assetTypeValue'])) &&
    isComponentAssociationStatus(details['status']) &&
    isFiniteNumber(details['directionOrientationDesign_deg']) &&
    isFiniteNumber(details['xDesign_m']) &&
    isFiniteNumber(details['yDesign_m']) &&
    isFiniteNumber(details['zDesign_m']) &&
    (details['tiltDesign_deg'] === null ||
      isFiniteNumber(details['tiltDesign_deg'])) &&
    isNumericValue(details['length_mm']) &&
    isNumericValue(details['width_mm']) &&
    isNumericValue(details['depth_mm']) &&
    isString(details['assetClassCode']) &&
    (details['ownerCompany'] === undefined ||
      isString(details['ownerCompany'])) &&
    isOptionalString(details['headFrameHeignt']) &&
    isOptionalString(details['headFrameLength']) &&
    isOptionalString(details['headFrameNoOFPipes']) &&
    isOptionalString(details['headFrameDiameter']) &&
    isOptionalString(details['headFrameArmConfig']) &&
    isOptionalHeadframeType(details['headframeType']) &&
    isOptionalHeadframeConfiguration(details['headframeConfiguration']) &&
    typeof details['isAssetSwapped'] === 'boolean' &&
    (details['swappedWithPortalUniqueId'] === null ||
      isPortalUniqueIdValue(details['swappedWithPortalUniqueId']))
  );
}

export function cloneOrderAsset(asset: OrderAsset): OrderAsset {
  return {
    portalUniqueId: asset.portalUniqueId,
    assetId: asset.assetId,
    assetDetails: asset.assetDetails
      ? {
          ...asset.assetDetails,
          ...(asset.assetDetails.headframeConfiguration
            ? {
                headframeConfiguration: {
                  ...asset.assetDetails.headframeConfiguration,
                },
              }
            : {}),
        }
      : null,
  };
}

function isOptionalHeadframeType(
  value: unknown,
): value is HeadframeType | undefined {
  return (
    value === undefined ||
    value === 'triangular' ||
    value === 'circular' ||
    value === 'mercedes' ||
    value === 'single_mount' ||
    value === 'face_mount' ||
    value === 'square'
  );
}

function isOptionalHeadframeConfiguration(
  value: unknown,
): value is HeadframeConfiguration | undefined {
  if (value === undefined) return true;
  if (!isRecord(value) || !isOptionalHeadframeType(value['type'])) return false;
  if (!isFiniteNumber(value['height'])) return false;

  switch (value['type']) {
    case 'triangular':
    case 'face_mount':
    case 'square':
      return (
        isFiniteNumber(value['frameLength']) &&
        isFiniteNumber(value['pipeCount'])
      );
    case 'circular':
      return (
        isFiniteNumber(value['diameter']) &&
        isFiniteNumber(value['pipeCount'])
      );
    case 'mercedes':
      return (
        isFiniteNumber(value['frameLength']) &&
        isFiniteNumber(value['pipeCount']) &&
        (value['armConfiguration'] === 'single' ||
          value['armConfiguration'] === 'double_0_5' ||
          value['armConfiguration'] === 'double_1')
      );
    case 'single_mount':
      return true;
    default:
      return false;
  }
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

function isPortalUniqueIdValue(value: unknown): value is string | number {
  return isNonEmptyString(value) || isFiniteNumber(value);
}

function isNumericValue(value: unknown): value is string | number {
  return isFiniteNumber(value) ||
    (isNonEmptyString(value) && Number.isFinite(Number(value)));
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || isString(value);
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
