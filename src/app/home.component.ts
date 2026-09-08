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
      `${this.digitalTwinOrigin}/canvas/6879f6adef94973d975284c7/spatial-validation?workspaceId=64b8f335dc5ac99755c8bc11`,
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
      event.origin !== this.digitalTwinOrigin ||
      event.source !== this.spatialValidationFrame?.contentWindow
    ) {
      return;
    }

    if (event.data?.eventType === 'DT_READY') {
      this.clearSpatialReadyTimeout();
      this.spatialValidationReady = true;
      this.sendSpatialPositionCheck();
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
    if (!iframeWindow || !this.spatialValidationReady) return;

    const message: SpatialPositionCheckPayload = {
      eventType: 'SPATIAL_POSITION_CHECK',
      siteId: 'VICMEL001',
      structureId: 'STR_1',
      timestamp: '2026-07-13T10:30:00Z',
      assetsToValidate: [
        {
          portalUniqueId: null,
          assetId: 'STR_1_ANT_17',
        },
        {
          portalUniqueId: null,
          assetId: 'STR_1_ANT_18',
        },
        {
          portalUniqueId: '85f28f0a-f6a9-460d-b5f1-3e34ca750e0b',
          assetId: null,
        },
      ],
      orderAssets: [
        {
          portalUniqueId: '85f28f0a-f6a9-460d-b5f1-3e34ca750e0b',
          assetId: 'Telco Equipment 1',
          assetDetails: {
            assetCategory: 'EQUIPMENT',
            assetTypeKey: 'equipmentType',
            assetTypeValue: 'AW3161-E-F-V2',
            status: ComponentAssociationStatus.REQUESTED,
            directionOrientationDesign_deg: 136.4,
            xDesign_m: -0.735,
            yDesign_m: 1.195,
            zDesign_m: 43.337,
            tiltDesign_deg: 90,
            length_mm: 480,
            width_mm: 172,
            depth_mm: 52,
            assetClassCode: 'PANEL',
            isAssetSwapped: false,
            swappedWithPortalUniqueId: null,
          },
        },
      ],
    };

    this.spatialCheckStatus.set('Checking asset positions...');
    console.log('Sending spatial position check to Digital Twin iframe', message);
    iframeWindow.postMessage(message, this.digitalTwinOrigin);
    this.startSpatialResponseTimeout();
  }

  private startSpatialReadyTimeout(): void {
    this.clearSpatialReadyTimeout();
    this.spatialReadyTimeout = setTimeout(() => {
      if (this.spatialValidationReady) return;

      this.spatialCheckActive.set(false);
      this.finishSpatialPositionCheck(
        'Spatial validation endpoint did not become ready. Please try again.',
      );
    }, 10_000);
  }

  private startSpatialResponseTimeout(): void {
    this.clearSpatialReadyTimeout();
    this.spatialReadyTimeout = setTimeout(() => {
      this.finishSpatialPositionCheck(
        'The spatial position check timed out. Please try again.',
      );
    }, 15_000);
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
