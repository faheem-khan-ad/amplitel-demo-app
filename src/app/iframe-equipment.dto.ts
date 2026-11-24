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
      frameLength: number;
      height: number;
      pipeCount: number;
    }
  | {
      diameter: number;
      height: number;
      pipeCount: number;
    }
  | {
      frameLength: number;
      height: number;
      armConfiguration: string;
      pipeCount: number;
    }
  | {
      height: number;
    }
  | {
      frameLength: number;
      height: number;
      pipeCount: number;
    };

export type HeadframeType = string;

export type PortalUniqueId = string | number | null;

export interface OrderAssetDetails {
  assetCategory: string;
  assetTypeKey: string | null;
  assetTypeValue: string | null;
  assetModelNumber?: string | null;
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
  ownerCompany?: string | null;
  polarization?: string | number | boolean | null;
  inverted?: string | number | boolean | null;
  maxOutputPower_W?: string | number | boolean | null;
  notes?: string | number | boolean | null;
  headFrameHeight?: string | number;
  headFrameLength?: string | number;
  headFrameNoOfPipes?: string;
  headFrameDiameter?: string;
  headFrameArmConfig?: string;
  headframeType?: HeadframeType;
  headframeConfiguration?: HeadframeConfiguration;
  isAssetSwapped: boolean;
  swapPairId: PortalUniqueId;
}

export interface OrderAsset {
  portalUniqueId: PortalUniqueId;
  isSpatialValidationApplicable?: boolean;
  /** Digital Twin component ID for an existing asset. */
  assetId: string | null;
  /** Label for a new asset; null when assetId is present. */
  assetLabel: string | null;
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
  const assetLabel = value['assetLabel'];
  const details = value['assetDetails'];
  if (
    !isPortalUniqueIdValue(portalUniqueId) &&
    !isNonEmptyString(assetId) &&
    !isNonEmptyString(assetLabel)
  ) {
    return false;
  }
  if (portalUniqueId !== null && !isPortalUniqueIdValue(portalUniqueId))
    return false;
  if (assetId !== null && !isString(assetId)) return false;
  if (assetId === null ? !isNonEmptyString(assetLabel) : assetLabel !== null) {
    return false;
  }
  if (details === null) return true;
  if (!isRecord(details)) return false;

  return (
    isNonEmptyString(details['assetCategory']) &&
    (details['assetTypeKey'] === null ||
      isNonEmptyString(details['assetTypeKey'])) &&
    (details['assetTypeValue'] === null ||
      isString(details['assetTypeValue'])) &&
    (details['assetModelNumber'] === undefined ||
      details['assetModelNumber'] === null ||
      isString(details['assetModelNumber'])) &&
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
      details['ownerCompany'] === null ||
      isString(details['ownerCompany'])) &&
    (details['headFrameHeignt'] === undefined ||
      isString(details['headFrameHeignt']) ||
      isFiniteNumber(details['headFrameHeignt'])) &&
    (details['headFrameLength'] === undefined ||
      isString(details['headFrameLength']) ||
      isFiniteNumber(details['headFrameLength'])) &&
    isOptionalString(details['headFrameNoOFPipes']) &&
    isOptionalString(details['headFrameDiameter']) &&
    isOptionalString(details['headFrameArmConfig']) &&
    isOptionalHeadframeType(details['headframeType']) &&
    isOptionalHeadframeConfiguration(details['headframeConfiguration']) &&
    typeof details['isAssetSwapped'] === 'boolean' &&
    (details['swapPairId'] === null ||
      isPortalUniqueIdValue(details['swapPairId']))
  );
}

export function cloneOrderAsset(asset: OrderAsset): OrderAsset {
  return {
    portalUniqueId: asset.portalUniqueId,
    isSpatialValidationApplicable: true,
    assetId: asset.assetId,
    assetLabel: asset.assetId === null ? asset.assetLabel : null,
    assetDetails: asset.assetDetails
      ? {
          ...asset.assetDetails,
          ...(asset.assetDetails.headframeConfiguration
            ? {
                headframeConfiguration: {
                  ...cloneHeadframeConfiguration(
                    asset.assetDetails.headframeConfiguration,
                  ),
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
  if (!isRecord(value) || Array.isArray(value)) return false;
  if (!isPositiveNumber(value['height'])) return false;

  const hasFrameLength = 'frameLength' in value;
  const hasDiameter = 'diameter' in value;
  const hasPipeCount = 'pipeCount' in value;
  const hasArms = 'armConfiguration' in value;
  if (hasFrameLength && !isPositiveNumber(value['frameLength'])) return false;
  if (hasDiameter && !isPositiveNumber(value['diameter'])) return false;
  if (
    hasPipeCount &&
    (!isFiniteNumber(value['pipeCount']) ||
      !Number.isInteger(value['pipeCount']) ||
      value['pipeCount'] < 0)
  )
    return false;
  if (hasArms && !isNonEmptyString(value['armConfiguration'])) return false;
  if ((hasFrameLength || hasDiameter) && !hasPipeCount) return false;
  if (hasPipeCount && !hasFrameLength && !hasDiameter) return false;
  if (hasArms && (!hasFrameLength || !hasPipeCount)) return false;
  return true;
}

function isPositiveNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value > 0;
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
  return (
    isFiniteNumber(value) ||
    (isNonEmptyString(value) && Number.isFinite(Number(value)))
  );
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

function cloneHeadframeConfiguration(
  configuration: HeadframeConfiguration,
): HeadframeConfiguration {
  const result = { ...configuration };
  // Older saved payloads can carry this extra field; the current DTO does not.
  Reflect.deleteProperty(result, 'type');
  return result;
}
