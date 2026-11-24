import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
  ComponentDataStore,
  ComponentSection,
  DigitalTwinComponentData,
  EditableComponentField,
} from './component-data.store';
import {
  ComponentAssociationStatus,
  SpatialPositionCheckPayload,
  SpatialPositionCheckResponsePayload,
} from './iframe-equipment.dto';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly componentDataStore = inject(ComponentDataStore);
  private readonly digitalTwinOrigin = 'http://localhost:8057';
  private spatialValidationFrame: HTMLIFrameElement | null = null;
  private spatialValidationReady = false;
  private spatialReadyTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly spatialValidationUrl: SafeResourceUrl =
    this.sanitizer.bypassSecurityTrustResourceUrl(
      `${this.digitalTwinOrigin}/canvas/amplitel/digital-twin/spatial-validation?token=YRvLK6kN4TZSqrkU3OP00p7xE3ww%2FSvT5a%2F38BijekiAFNjfLw0BVaD2JBPFwQHGvdnrQCozrNgWa4Iywz5EApyRavJRVa07gWk1IjsI2ZBAlw2WqvD9uduEKLMlas1kccMnUqrhA3h42nU1HbjLfZIOPQNP%2BmQ4v2YePKRe0Z0HIY6l0WYxEBkZp%2BtdLO2HdjjlpO7TW5lGEGleXiC4wDJs%2B2HVZhaE1svL%2FaD1Rf569i6qKfhlaaj4HIHnWWAYAOsfN4xe2ffxtW2inrMT3w%3D%3D`,
    );
  readonly spatialCheckActive = signal(false);
  readonly spatialCheckPending = signal(false);
  readonly spatialCheckStatus = signal<string | null>(null);
  readonly spatialValidationResponse =
    signal<SpatialPositionCheckResponsePayload | null>(null);
  readonly activeTool = signal<'digital-twin' | 'spatial-position'>(
    'digital-twin',
  );

  @ViewChild('spatialValidationFrame')
  set spatialValidationFrameRef(
    frame: ElementRef<HTMLIFrameElement> | undefined,
  ) {
    this.spatialValidationFrame = frame?.nativeElement ?? null;
    if (!frame) this.spatialValidationReady = false;
  }

  private readonly handleSpatialValidationMessage = (
    event: MessageEvent,
  ): void => {
    if (
      event.source !== this.spatialValidationFrame?.contentWindow
    ) {
      if (event.origin === this.digitalTwinOrigin) {
        console.warn('Ignoring spatial validation message from a different window', {
          eventType: event.data?.eventType,
          origin: event.origin,
        });
      }
      return;
    }

    console.log('Received event from spatial validation iframe', {
      eventType: event.data?.eventType,
      origin: event.origin,
    });

    if (event.data?.eventType === 'DT_READY') {
      if (this.spatialValidationReady) return;
      this.clearSpatialReadyTimeout();
      this.spatialValidationReady = true;
      if (this.spatialCheckPending()) this.sendSpatialPositionCheck();
      return;
    }

    if (event.data?.eventType !== 'SPATIAL_POSITION_CHECK') {
      return;
    }

    if (!Array.isArray(event.data?.validationResults)) {
      this.finishSpatialPositionCheck(
        'The spatial validation service returned an invalid response. Please try again.',
      );
      return;
    }

    const response = event.data as SpatialPositionCheckResponsePayload;
    this.spatialValidationResponse.set(response);
    this.finishSpatialPositionCheck(
      `Completed: ${response.validationResults.length} assets validated`,
    );
    console.log('Received spatial position validation results', response);
  };

  components = this.componentDataStore.components;
  componentSections = computed(() => this.groupComponents(this.components()));
  displayedAssetsCount = computed(() =>
    this.components().filter((component) => component.assetDetails !== null)
      .length,
  );

  ngOnInit(): void {
    window.addEventListener('message', this.handleSpatialValidationMessage);
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.handleSpatialValidationMessage);
    this.clearSpatialReadyTimeout();
    this.spatialValidationFrame = null;
    this.spatialValidationReady = false;
  }

  openDigitalTwin(): void {
    console.log('Digital Twin clicked');
    this.componentDataStore.setEditSection(null);
    this.router.navigateByUrl('/digital-twin');
  }

  selectTool(tool: 'digital-twin' | 'spatial-position'): void {
    this.activeTool.set(tool);
  }

  openSpatialPositionCheck(): void {
    console.log('Spatial position check requested', {
      iframeAttached: this.spatialValidationFrame !== null,
      iframeReady: this.spatialValidationReady,
    });
    this.spatialValidationResponse.set(null);
    this.spatialCheckPending.set(true);

    if (this.spatialValidationReady) {
      this.sendSpatialPositionCheck();
      return;
    }

    this.spatialCheckStatus.set('Loading spatial validation endpoint...');
    this.spatialCheckActive.set(true);
    this.startSpatialReadyTimeout();
  }

  onSpatialValidationFrameLoad(): void {
    console.log('Spatial validation iframe load event received', {
      iframeReady: this.spatialValidationReady,
    });
    if (this.spatialCheckPending() && !this.spatialValidationReady) {
      this.spatialCheckStatus.set('Waiting for spatial validation service readiness (DT_READY)...');
    }
  }

  editSection(section: ComponentSection): void {
    console.log('Editing component section', section);
    this.componentDataStore.setEditSection({
      ...section,
      components: this.components().filter(
        (component) => this.getSectionKey(component) === section.key,
      ),
    });
    this.router.navigateByUrl('/digital-twin');
  }

  updateOrderComponent(
    component: DigitalTwinComponentData,
    field: EditableComponentField,
    event: Event,
  ): void {
    const fieldElement = event.target as HTMLInputElement | HTMLSelectElement;
    this.componentDataStore.updateComponentField(
      component,
      field,
      fieldElement.value,
    );
  }

  handleButtonTwo(): void {
    console.log('Button 2 clicked');
  }

  handleButtonThree(): void {
    console.log('Button 3 clicked');
  }

  private sendSpatialPositionCheck(): void {
    const iframeWindow = this.spatialValidationFrame?.contentWindow;
    if (!iframeWindow || !this.spatialValidationReady) {
      console.warn('Spatial position check cannot be sent yet', {
        iframeAttached: !!iframeWindow,
        iframeReady: this.spatialValidationReady,
      });
      return;
    }

    const message: SpatialPositionCheckPayload = 
//     {
//       eventType: 'SPATIAL_POSITION_CHECK',
//       siteId: 'VICMEL001',
//       structureId: 'STR_1',
//       timestamp: '2026-07-13T10:30:00Z',
//       assetsToValidate: [
//         {
//           portalUniqueId: null,
//           assetId: 'STR_1_ANT_7',
//         },
//         {
//           portalUniqueId: null,
//           assetId: 'STR_1_ANT_13',
//         },
//         {
//           portalUniqueId: 32121,
//           assetId: null,
//         },
//         {
//           portalUniqueId: 57689,
//           assetId: null,
//         },
//       ],
//       orderAssets: [
//     {
//         "portalUniqueId": 4818,
//         "assetId": "Telco Equipment 1",
//         "assetDetails": {
//             "assetCategory": "ANTENNA",
//             "assetTypeKey": "antennaType",
//             "assetTypeValue": "AEA BU6 OMNI",
//             "status": ComponentAssociationStatus.REQUESTED,
//             "directionOrientationDesign_deg": 2,
//             "xDesign_m": 4,
//             "yDesign_m": 3,
//             "zDesign_m": 3,
//             "tiltDesign_deg": 45,
//             "length_mm": 3200,
//             "width_mm": 60,
//             "depth_mm": 60,
//             "assetClassCode": "OMNI",
//             "isAssetSwapped": false,
//             "swappedWithPortalUniqueId": null
//         }
//     },
//     {
//         "portalUniqueId": null,
//         "assetId": "STR_1_ANT_13",
//         "assetDetails": {
//             "assetCategory": "AVIATION_LIGHT",
//             "assetTypeKey": "antennaType",
//             "assetTypeValue": null,
//             "status": ComponentAssociationStatus.REQUESTED,
//             "directionOrientationDesign_deg": 61.35,
//             "xDesign_m": 1.047,
//             "yDesign_m": 0.419,
//             "zDesign_m": 11.5,
//             "tiltDesign_deg": 0,
//             "length_mm": 1000,
//             "width_mm": 1000,
//             "depth_mm": 1000,
//             "assetClassCode": "",
//             "isAssetSwapped": false,
//             "swappedWithPortalUniqueId": null,
//             "ownerCompany": "TEST OPTUS"
//         }
//     }
// ]
//     };

{
    "eventType": "SPATIAL_POSITION_CHECK",
    "siteId": "ACT10002353",
    "structureId": "STR_1",
      "timestamp": '2026-07-13T10:30:00Z',
   "assetsToValidate": [
        {
            "portalUniqueId": "PSTR_1_PANT_1",
            "assetId": null
        }
    ],
    "orderAssets": [
      {
        "portalUniqueId": "PSTR_1_PANT_1",
        "assetId": null,
        "assetLabel": "PSTR_1_PANT_1",
        "isSpatialValidationApplicable": true,
        "assetDetails": {
            "assetCategory": "ANTENNA",
            "status": ComponentAssociationStatus.REQUESTED,
            "directionOrientationDesign_deg": 180,
            "xDesign_m": -2.22,
            "yDesign_m": -1.454,
            "zDesign_m": 30.005,
            "tiltDesign_deg": 0,
            "isAssetSwapped": false,
            "swapPairId": null,
            "headFrameHeight": "",
            "headFrameLength": "",
            "headFrameNoOfPipes": "",
            "headFrameDiameter": "",
            "headFrameArmConfig": "",
            "length_mm": 1580,
            "width_mm": 370,
            "depth_mm": 170,
            "assetClassCode": "PANEL",
            "assetTypeKey": "antennaType",
            "assetTypeValue": "ACE TECHNOLOGY ACS-15-65 PANEL",
            "assetModelNumber": null,
            "ownerCompany": "Test KT"
        }
    }
    ]
}

    this.spatialCheckStatus.set('Checking asset positions...');
    console.log('Sending spatial position check to Digital Twin iframe', message);
    iframeWindow.postMessage(message, this.digitalTwinOrigin);
    this.startSpatialResponseTimeout();
  }

  private startSpatialReadyTimeout(): void {
    this.clearSpatialReadyTimeout();
    this.spatialReadyTimeout = setTimeout(() => {
      if (this.spatialValidationReady) return;

      console.error('Spatial validation iframe did not send DT_READY before the timeout');
      this.spatialCheckActive.set(false);
      this.finishSpatialPositionCheck(
        'Spatial validation endpoint did not become ready. Please try again.',
      );
    }, 200_000);
  }

  private startSpatialResponseTimeout(): void {
    this.clearSpatialReadyTimeout();
    this.spatialReadyTimeout = setTimeout(() => {
      console.error('Spatial validation iframe did not return SPATIAL_POSITION_CHECK results before the timeout');
      this.finishSpatialPositionCheck(
        'The spatial position check timed out. Please try again.',
      );
    }, 175_000);
  }

  private finishSpatialPositionCheck(status: string): void {
    this.clearSpatialReadyTimeout();
    this.spatialCheckPending.set(false);
    this.spatialCheckStatus.set(status);
  }

  private clearSpatialReadyTimeout(): void {
    if (this.spatialReadyTimeout === null) return;

    clearTimeout(this.spatialReadyTimeout);
    this.spatialReadyTimeout = null;
  }

  private groupComponents(
    components: DigitalTwinComponentData[],
  ): ComponentSection[] {
    const sections = new Map<string, ComponentSection>();

    components
      .filter((component) => component.assetDetails !== null)
      .forEach((component) => {
        const key = this.getSectionKey(component);
        const section = sections.get(key);

        if (section) {
          section.components.push(component);
          return;
        }

        sections.set(key, {
          key,
          title: this.getSectionTitle(component, key),
          components: [component],
        });
      });

    return Array.from(sections.values());
  }

  private getSectionKey(component: DigitalTwinComponentData): string {
    const value =
      component.orderId ??
      component.order ??
      component.coloId ??
      component.colo ??
      'created-order';

    return String(value);
  }

  private getSectionTitle(
    component: DigitalTwinComponentData,
    key: string,
  ): string {
    const order = component.order ?? component.orderId;
    const colo = component.colo ?? component.coloId;

    if (order && colo) {
      return `${this.formatSectionLabel('Order', order)} - ${this.formatSectionLabel('Colo', colo)}`;
    }

    if (order) {
      return this.formatSectionLabel('Order', order);
    }

    if (colo) {
      return this.formatSectionLabel('Colo', colo);
    }

    if (key === 'created-order') {
      return 'Order 1';
    }

    return `Order ${key}`;
  }

  private formatSectionLabel(prefix: string, value: unknown): string {
    const label = String(value);

    if (label.toLowerCase().startsWith(prefix.toLowerCase())) {
      return label;
    }

    return `${prefix} ${label}`;
  }
}
