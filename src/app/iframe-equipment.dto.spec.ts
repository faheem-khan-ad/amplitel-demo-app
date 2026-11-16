import {
  cloneOrderAsset,
  ComponentAssociationStatus,
  HeadframeConfiguration,
  isOrderAsset,
  OrderAsset,
} from './iframe-equipment.dto';

function makeAsset(configuration?: HeadframeConfiguration): OrderAsset {
  return {
    portalUniqueId: 'synthetic-portal',
    assetId: null,
    assetLabel: 'Synthetic frame',
    assetDetails: {
      assetCategory: 'Headframe',
      assetTypeKey: 'headFrameMountTypeCode',
      assetTypeValue: 'Synthetic frame',
      assetClassCode: 'synthetic-class',
      status: ComponentAssociationStatus.REQUESTED,
      directionOrientationDesign_deg: 92,
      xDesign_m: 1,
      yDesign_m: 2,
      zDesign_m: 3,
      tiltDesign_deg: 0,
      length_mm: 1000,
      width_mm: 2000,
      depth_mm: 500,
      isAssetSwapped: true,
      swapPairId: 'synthetic-pair',
      ownerCompany: 'Synthetic owner',
      ...(configuration ? { headframeConfiguration: configuration } : {}),
    },
  };
}

describe('Digital Twin asset-details DTO', () => {
  const families: { name: string; configuration: HeadframeConfiguration }[] = [
    {
      name: 'triangular',
      configuration: { height: 1, frameLength: 2, pipeCount: 12 },
    },
    {
      name: 'circular',
      configuration: { height: 1, diameter: 2.5, pipeCount: 9 },
    },
    {
      name: 'mercedes',
      configuration: {
        height: 1,
        frameLength: 1.2,
        pipeCount: 6,
        armConfiguration: 'Double (0.5m separation)',
      },
    },
    { name: 'single mount', configuration: { height: 1 } },
    {
      name: 'face mount',
      configuration: { height: 1, frameLength: 2, pipeCount: 0 },
    },
    {
      name: 'square',
      configuration: { height: 1, frameLength: 2.5, pipeCount: 16 },
    },
  ];
  for (const { name, configuration } of families) {
    it(`accepts the ${name} configuration without type`, () => {
      expect(isOrderAsset(makeAsset(configuration))).toBeTrue();
    });
  }
  for (const armConfiguration of [
    'Single',
    'Double (0.5m separation)',
    'Double (1m separation)',
    'Double (0.75m separation)',
  ]) {
    it(`preserves the metadata arm value ${armConfiguration}`, () => {
      const asset = makeAsset({
        height: 1,
        frameLength: 1.2,
        pipeCount: 6,
        armConfiguration,
      });
      expect(isOrderAsset(asset)).toBeTrue();
      expect(
        cloneOrderAsset(asset).assetDetails?.headframeConfiguration,
      ).toEqual(asset.assetDetails?.headframeConfiguration);
    });
  }
  it('retains no-configuration and null-details assets', () => {
    expect(isOrderAsset(makeAsset())).toBeTrue();
    expect(isOrderAsset({ ...makeAsset(), assetDetails: null })).toBeTrue();
  });
  it('accepts nullable contract fields and numeric legacy flat fields', () => {
    const asset = makeAsset({ height: 1 });
    Object.assign(asset.assetDetails!, {
      assetTypeKey: null,
      ownerCompany: null,
      headFrameHeignt: 1,
      headFrameLength: 2,
    });
    expect(isOrderAsset(asset)).toBeTrue();
  });
  it('clones legacy configuration without type and preserves order fields', () => {
    const legacy = {
      type: 'mercedes',
      height: 1,
      frameLength: 1.2,
      pipeCount: 6,
      armConfiguration: 'double_0_5',
    };
    const asset = makeAsset(legacy);
    expect(isOrderAsset(asset)).toBeTrue();
    const cloned = cloneOrderAsset(asset);
    expect(cloned.assetDetails?.headframeConfiguration).toEqual({
      height: 1,
      frameLength: 1.2,
      pipeCount: 6,
      armConfiguration: 'double_0_5',
    });
    expect(legacy.type).toBe('mercedes');
    expect(cloned.assetDetails).not.toBe(asset.assetDetails);
    expect(cloned.assetDetails?.headframeConfiguration).not.toBe(
      asset.assetDetails?.headframeConfiguration,
    );
    expect(cloned.portalUniqueId).toBe(asset.portalUniqueId);
    expect(cloned.assetLabel).toBe(asset.assetLabel);
    expect(cloned.assetDetails?.swapPairId).toBe('synthetic-pair');
    expect(cloned.assetDetails?.tiltDesign_deg).toBe(0);
    expect(cloned.assetDetails?.directionOrientationDesign_deg).toBe(92);
  });
  const invalid: unknown[] = [
    null,
    [],
    {},
    { height: 0 },
    { height: Infinity },
    { height: '1' },
    { height: 1, diameter: 0, pipeCount: 6 },
    { height: 1, frameLength: 2 },
    { height: 1, diameter: 2, pipeCount: 2.5 },
    { height: 1, frameLength: 2, pipeCount: -1 },
    { height: 1, pipeCount: 6 },
    { height: 1, armConfiguration: 'Single' },
    { height: 1, frameLength: 2, pipeCount: 6, armConfiguration: '' },
  ];
  for (const [index, configuration] of invalid.entries()) {
    it(`rejects malformed configuration ${index}`, () => {
      const asset = makeAsset();
      expect(
        isOrderAsset({
          ...asset,
          assetDetails: {
            ...asset.assetDetails,
            headframeConfiguration: configuration,
          },
        }),
      ).toBeFalse();
    });
  }
});
