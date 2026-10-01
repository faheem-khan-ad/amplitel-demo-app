import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
  ComponentDataStore,
  DigitalTwinOrderPayload,
} from './component-data.store';
import {
  cloneOrderAsset,
  ComponentAssociationStatus,
  DigitalTwinCloseCheckPayload,
  DigitalTwinOrderAssetsResponsePayload,
  isOrderAsset,
  LoadOrderAssetsPayload,
  OrderAsset,
} from './iframe-equipment.dto';

@Component({
  selector: 'app-digital-twin',
  standalone: true,
  templateUrl: './digital-twin.component.html',
  styleUrl: './digital-twin.component.css',
})
export class DigitalTwinComponent implements OnInit, OnDestroy {
  digitalTwinUrl: SafeResourceUrl;

  @ViewChild('digitalTwinFrame')
  private digitalTwinFrame?: ElementRef<HTMLIFrameElement>;

  private readonly loadOrderConfiguration = {
    showActionButton: true,
    actionButtonLabel: 'Update Order',
    ownerCompanyName: 'Test OPTUS',
    allowDragAndDrop: true,
  };
  private readonly orderAssets: OrderAsset[] =
//    [

//      {
//       portalUniqueId: null,
//       assetId: 'STR_1_ANT_1',
//       assetDetails: null
//     },
//     {
//       portalUniqueId: null,
//       assetId: 'STR_1_ANT_13',
//       assetDetails: null
//     },
//     {
//       portalUniqueId: null,
//       assetId: 'STR_1_ANT_26',
//       assetDetails: null
//     },
//     {
//       portalUniqueId: null,
//       assetId: 'STR_1_AVL_4',
//       assetDetails: null
//     },
//     {
//       portalUniqueId: null,
//       assetId: 'Test antenna',
//       assetDetails: null
//     },
//     {
//     "portalUniqueId": 4818,
//     "assetId": null,
//     "assetDetails": {
//         "assetCategory": "ANTENNA",
//         "status": ComponentAssociationStatus.REQUESTED,
//         "directionOrientationDesign_deg": 2,
//         "xDesign_m": 4,
//         "yDesign_m": 3,
//         "zDesign_m": 3,
//         "tiltDesign_deg": 45,
//         "isAssetSwapped": false,
//         "swappedWithPortalUniqueId": null,
//         "headFrameHeignt": "",
//         "headFrameLength": "",
//         "headFrameNoOFPipes": "",
//         "headFrameDiameter": "",
//         "headFrameArmConfig": "",
//         "length_mm": "3200.0",
//         "width_mm": "60.0",
//         "depth_mm": "60.0",
//         "assetClassCode": "OMNI",
//         "assetTypeKey": "antennaType",
//         "assetTypeValue": "AEA BU6 OMNI"
//     }
// }
//   ];
[
  {
      portalUniqueId: null,
      assetId: 'STR_1_ANT_1',
      assetDetails: null
    },
        {
            "portalUniqueId": null,
            "assetId": "STR_1_ANT_7",
            "assetDetails": {
                "assetCategory": "ANTENNA",
                "status": ComponentAssociationStatus.EXISTING,
                "directionOrientationDesign_deg": 23,
                "xDesign_m": 0,
                "yDesign_m": 0.5,
                "zDesign_m": 0,
                "tiltDesign_deg": 0,
                "isAssetSwapped": false,
                "swappedWithPortalUniqueId": null,
                "headFrameHeignt": "",
                "headFrameLength": "",
                "headFrameNoOFPipes": "",
                "headFrameDiameter": "",
                "headFrameArmConfig": "",
                "length_mm": 1415,
                "width_mm": 395,
                "depth_mm": 100,
                "assetClassCode": "PANEL",
                "assetTypeKey": "CAT4",
                "assetTypeValue": "ANDREW H13C-060-890VC-ANG PANEL",
            }
        },
        {
            "portalUniqueId": null,
            "assetId": "STR_1_ANT_8",
            "assetDetails": {
                "assetCategory": "ANTENNA",
                "status": ComponentAssociationStatus.PROPOSED_CREATE,
                "directionOrientationDesign_deg": 23,
                "xDesign_m": -2.629,
                "yDesign_m": -0.6,
                "zDesign_m": 0,
                "tiltDesign_deg": 257,
                "isAssetSwapped": false,
                "swappedWithPortalUniqueId": null,
                "headFrameHeignt": "",
                "headFrameLength": "",
                "headFrameNoOFPipes": "",
                "headFrameDiameter": "",
                "headFrameArmConfig": "",
                "length_mm": 1415,
                "width_mm": 395,
                "depth_mm": 100,
                "assetClassCode": "PANEL",
                "assetTypeKey": "antennaType",
                "assetTypeValue": "ANDREW H13C-060-890VC-ANG PANEL"
            }
        },
        {
            "portalUniqueId": null,
            "assetId": "STR_1_ANT_10",
            "assetDetails": {
                "assetCategory": "ANTENNA",
                "status": ComponentAssociationStatus.PROPOSED_CREATE,
                "directionOrientationDesign_deg": 23,
                "xDesign_m": 0.559,
                "yDesign_m": 0.62,
                "zDesign_m": 0,
                "tiltDesign_deg": 42,
                "isAssetSwapped": false,
                "swappedWithPortalUniqueId": null,
                "headFrameHeignt": "",
                "headFrameLength": "",
                "headFrameNoOFPipes": "",
                "headFrameDiameter": "",
                "headFrameArmConfig": "",
                "length_mm": 1415,
                "width_mm": 395,
                "depth_mm": 100,
                "assetClassCode": "PANEL",
                "assetTypeKey": "antennaType",
                "assetTypeValue": "ANDREW H13C-060-890VC-ANG PANEL"
            }
        },
        {
            "portalUniqueId": null,
            "assetId": "STR_1_TJD_2",
            "assetDetails": {
                "assetCategory": "TRANSCEIVER",
                "status": ComponentAssociationStatus.PROPOSED_CREATE,
                "directionOrientationDesign_deg": 261,
                "xDesign_m": 0,
                "yDesign_m": -11.867,
                "zDesign_m": 22,
                "tiltDesign_deg": 180,
                "isAssetSwapped": false,
                "swappedWithPortalUniqueId": null,
                "headFrameHeignt": "",
                "headFrameLength": "",
                "headFrameNoOFPipes": "",
                "headFrameDiameter": "",
                "headFrameArmConfig": "",
                "length_mm": 240.2,
                "width_mm": 175.3,
                "depth_mm": 121,
                "assetClassCode": "INTEGRATED POWER SPLITTER",
                "assetTypeKey": "transceiverJunctionDeviceTypeCode",
                "assetTypeValue": "ERICSSON MINILINK IPS3 6 V2"
            }
        },
        {
            "portalUniqueId": null,
            "assetId": "STR_1_TJD_3",
            "assetDetails": {
                "assetCategory": "TRANSCEIVER",
                "status": ComponentAssociationStatus.PROPOSED_CREATE,
                "directionOrientationDesign_deg": 261,
                "xDesign_m": -5.767,
                "yDesign_m": 0,
                "zDesign_m": 0,
                "tiltDesign_deg": 270,
                "isAssetSwapped": false,
                "swappedWithPortalUniqueId": null,
                "headFrameHeignt": "",
                "headFrameLength": "",
                "headFrameNoOFPipes": "",
                "headFrameDiameter": "",
                "headFrameArmConfig": "",
                "length_mm": 240.2,
                "width_mm": 175.3,
                "depth_mm": 121,
                "assetClassCode": "INTEGRATED POWER SPLITTER",
                "assetTypeKey": "transceiverJunctionDeviceTypeCode",
                "assetTypeValue": "ERICSSON MINILINK IPS3 6 V2"
            }
        },
        {
            "portalUniqueId": null,
            "assetId": "STR_1_TJD_4",
            "assetDetails": {
                "assetCategory": "TRANSCEIVER",
                "status": ComponentAssociationStatus.PROPOSED_CREATE,
                "directionOrientationDesign_deg": 261,
                "xDesign_m": -56.897,
                "yDesign_m": 65.776,
                "zDesign_m": 32,
                "tiltDesign_deg": 319,
                "isAssetSwapped": false,
                "swappedWithPortalUniqueId": null,
                "headFrameHeignt": "",
                "headFrameLength": "",
                "headFrameNoOFPipes": "",
                "headFrameDiameter": "",
                "headFrameArmConfig": "",
                "length_mm": 240.2,
                "width_mm": 175.3,
                "depth_mm": 121,
                "assetClassCode": "INTEGRATED POWER SPLITTER",
                "assetTypeKey": "transceiverJunctionDeviceTypeCode",
                "assetTypeValue": "ERICSSON MINILINK IPS3 6 V2"
            }
        },
        {
            "portalUniqueId": null,
            "assetId": "STR_1_TJD_5",
            "assetDetails": {
                "assetCategory": "TRANSCEIVER",
                "status": ComponentAssociationStatus.PROPOSED_CREATE,
                "directionOrientationDesign_deg": 261,
                "xDesign_m": -2.804,
                "yDesign_m": -0.466,
                "zDesign_m": 0,
                "tiltDesign_deg": 261,
                "isAssetSwapped": false,
                "swappedWithPortalUniqueId": null,
                "headFrameHeignt": "",
                "headFrameLength": "",
                "headFrameNoOFPipes": "",
                "headFrameDiameter": "",
                "headFrameArmConfig": "",
                "length_mm": 240.2,
                "width_mm": 175.3,
                "depth_mm": 121,
                "assetClassCode": "INTEGRATED POWER SPLITTER",
                "assetTypeKey": "transceiverJunctionDeviceTypeCode",
                "assetTypeValue": "ERICSSON MINILINK IPS3 6 V2"
            }
        },
        {
            "portalUniqueId": null,
            "assetId": "STR_1_TJD_9",
            "assetDetails": {
                "assetCategory": "TRANSCEIVER",
                "status": ComponentAssociationStatus.PROPOSED_CREATE,
                "directionOrientationDesign_deg": 261,
                "xDesign_m": 0,
                "yDesign_m": 0,
                "zDesign_m": 0,
                "tiltDesign_deg": 0,
                "isAssetSwapped": false,
                "swappedWithPortalUniqueId": null,
                "headFrameHeignt": "",
                "headFrameLength": "",
                "headFrameNoOFPipes": "",
                "headFrameDiameter": "",
                "headFrameArmConfig": "",
                "length_mm": 240.2,
                "width_mm": 175.3,
                "depth_mm": 121,
                "assetClassCode": "INTEGRATED POWER SPLITTER",
                "assetTypeKey": "transceiverJunctionDeviceTypeCode",
                "assetTypeValue": "ERICSSON MINILINK IPS3 6 V2"
            }
        }
    ];

  private readonly digitalTwinSource =
    `http://localhost:8057/canvas/amplitel/digital-twin?token=YRvLK6kN4TZSqrkU3OP00p7xE3ww%2FSvT5a%2F38BijekiAFNjfLw0BVaD2JBPFwQHGvdnrQCozrNgWa4Iywz5EApyRavJRVa07gWk1IjsI2ZBAlw2WqvD9uduEKLMlas1kccMnUqrhA3h42nU1HbjLfZIOPQNP%2BmQ4v2YePKRe0Z00ICQx35mVmWxr0nB7N%2FQKk%2ByuX5xB%2B0j18HTIOjDouZcJ%2F5Vp7WyPFuisfnYnsCjZ9q6lqTKmaBRU%2BhB41ouuAOsfN4xe2ffxtW2inrMT3w%3D%3D`;
  private readonly digitalTwinOrigin = new URL(
    this.digitalTwinSource,
  ).origin;
  private readyIframeWindow: MessageEventSource | null = null;
  private hasSentInitialMessage = false;
  private hasUnsavedChanges = false;
  readonly closeConfirmationOpen = signal(false);
  private pendingIframeMessage: {
    iframe: HTMLIFrameElement;
    message: unknown;
  } | null = null;
  private readonly handleMessage = (event: MessageEvent): void => {
    const iframeWindow = this.digitalTwinFrame?.nativeElement.contentWindow;
    if (
      !iframeWindow ||
      event.source !== iframeWindow ||
      event.origin !== this.digitalTwinOrigin
    ) {
      return;
    }

    console.log('[Parent iframe message received]', {
      eventName: event.data?.eventType,
      message: event.data,
      origin: event.origin,
    });

    if (event.data?.eventType === 'DT_READY') {
      if (!event.source) return;

      this.readyIframeWindow = event.source;
      this.sendPendingIframeMessage();
      return;
    }

    if (event.data?.eventType === 'DT_CLOSE_CHECK') {
      if (
        event.source !== this.readyIframeWindow ||
        typeof event.data?.hasUnsavedChanges !== 'boolean'
      ) {
        return;
      }

      const closeCheck = event.data as DigitalTwinCloseCheckPayload;
      this.hasUnsavedChanges = closeCheck.hasUnsavedChanges;
      console.log('Digital Twin unsaved-change state updated', closeCheck);
      return;
    }

    if (event.data?.eventType !== 'LOAD_ORDER_ASSETS') {
      return;
    }

    const payload = event.data;
    const orderAssets: unknown = payload?.orderAssets;

    if (!Array.isArray(orderAssets)) {
      console.warn(
        'LOAD_ORDER_ASSETS received without orderAssets array',
      );
      return;
    }

    const validOrderAssets = orderAssets.filter(isOrderAsset);

    if (validOrderAssets.length !== orderAssets.length) {
      console.warn(
        'Digital Twin returned assets that do not match the order asset DTO',
        orderAssets.filter((asset) => !isOrderAsset(asset)),
      );
      if (validOrderAssets.length === 0) {
        this.navigateHome();
        return;
      }
    }

    const orderPayload: DigitalTwinOrderPayload = {
      ...(payload as DigitalTwinOrderAssetsResponsePayload),
      orderAssets: validOrderAssets,
    };

    console.log('Received order assets from Digital Twin iframe', orderPayload);
    this.componentDataStore.updateEditSection(orderPayload);
    this.router.navigateByUrl('/');
  };

  constructor(
    private readonly router: Router,
    private readonly sanitizer: DomSanitizer,
    private readonly componentDataStore: ComponentDataStore,
  ) {
    this.digitalTwinUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.digitalTwinSource,
    );
  }

  ngOnInit(): void {
    window.addEventListener('message', this.handleMessage);
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.handleMessage);
    this.readyIframeWindow = null;
    this.pendingIframeMessage = null;
    this.hasSentInitialMessage = false;
    this.hasUnsavedChanges = false;
  }

  closeDigitalTwin(): void {
    if (this.hasUnsavedChanges) {
      this.closeConfirmationOpen.set(true);
      return;
    }

    this.navigateHome();
  }

  cancelClose(): void {
    this.closeConfirmationOpen.set(false);
  }

  confirmClose(): void {
    this.closeConfirmationOpen.set(false);
    this.navigateHome();
  }

  @HostListener('document:keydown.escape')
  closeConfirmationOnEscape(): void {
    if (this.closeConfirmationOpen()) {
      this.cancelClose();
    }
  }

  private navigateHome(): void {
    console.log('Digital Twin iframe closed');
    this.router.navigateByUrl('/');
  }

  sendDigitalTwinOpened(event: Event): void {
    if (this.hasSentInitialMessage) {
      return;
    }

    const iframe = event.target as HTMLIFrameElement;
    const editSection = this.componentDataStore.editSection();
    const message: LoadOrderAssetsPayload = {
      eventType: 'LOAD_ORDER_ASSETS',
      siteId: 'VICMEL001',
      structureId: 'STR_1',
      timestamp: '2026-07-13T10:30:00Z',
      dtConfiguration: { ...this.loadOrderConfiguration },
      orderAssets: editSection
        ? editSection.components.map(cloneOrderAsset)
        : this.orderAssets.map(cloneOrderAsset),
    };

    this.pendingIframeMessage = {
      iframe,
      message,
    };
    this.sendPendingIframeMessage();
  }

  private sendPendingIframeMessage(): void {
    if (!this.pendingIframeMessage) {
      return;
    }

    const { iframe, message } = this.pendingIframeMessage;
    const iframeContentWindow = iframe.contentWindow;

    if (
      !iframeContentWindow ||
      iframeContentWindow !== this.readyIframeWindow ||
      typeof iframeContentWindow.postMessage !== 'function'
    ) {
      return;
    }

    console.log(
      'Sending event to Digital Twin iframe',
      this.digitalTwinOrigin,
      message,
    );
    iframeContentWindow.postMessage(message, this.digitalTwinOrigin);
    this.hasSentInitialMessage = true;
    this.pendingIframeMessage = null;
  }

}
