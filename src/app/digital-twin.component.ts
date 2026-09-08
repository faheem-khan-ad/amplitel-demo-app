import { Component, HostListener, OnDestroy, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
  ComponentDataStore,
  DigitalTwinOrderPayload,
} from './component-data.store';
import {
  cloneOrderAsset,
  DigitalTwinCloseCheckPayload,
  DigitalTwinOrderAssetsResponsePayload,
  InitialiseDigitalTwinPayload,
  isOrderAsset,
  LoadOrderAssetsPayload,
} from './iframe-equipment.dto';

@Component({
  selector: 'app-digital-twin',
  standalone: true,
  templateUrl: './digital-twin.component.html',
  styleUrl: './digital-twin.component.css',
})
export class DigitalTwinComponent implements OnInit, OnDestroy {
  digitalTwinUrl: SafeResourceUrl;

  private readonly initialiseDtConfiguration = {
    showActionButton: true,
    actionButtonLabel: 'Create Order',
    ownerCompanyName: 'TELSTRA',
  };
  private readonly loadOrderConfiguration = {
    showActionButton: true,
    actionButtonLabel: 'Update Order',
    ownerCompanyName: 'TELSTRA',
    allowDragAndDrop: true,
  };

  private readonly digitalTwinSource =
    'http://localhost:8057/canvas/6879f6adef94973d975284c7/3d?workspaceId=64b8f335dc5ac99755c8bc11';
  private readonly digitalTwinOrigin = 'http://localhost:8057';
  private readyIframeWindow: MessageEventSource | null = null;
  private hasUnsavedChanges = false;
  readonly closeConfirmationOpen = signal(false);
  private pendingIframeMessage: {
    iframe: HTMLIFrameElement;
    message: unknown;
  } | null = null;
  private readonly handleMessage = (event: MessageEvent): void => {
    if (event.origin !== this.digitalTwinOrigin) {
      return;
    }

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

    if (event.data?.eventType !== 'DIGITAL_TWIN_CREATE_COLS') {
      return;
    }

    const payload = event.data;
    const orderAssets: unknown = payload?.orderAssets;

    if (!Array.isArray(orderAssets)) {
      console.warn(
        'DIGITAL_TWIN_CREATE_COLS received without orderAssets array',
      );
      return;
    }

    const validOrderAssets = orderAssets.filter(isOrderAsset);

    if (validOrderAssets.length !== orderAssets.length) {
      console.warn(
        'Ignored Digital Twin assets that do not match the order asset DTO',
      );
    }

    if (!validOrderAssets.length) {
      return;
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
    const iframe = event.target as HTMLIFrameElement;
    const editSection = this.componentDataStore.editSection();
    const message: InitialiseDigitalTwinPayload | LoadOrderAssetsPayload =
      editSection
        ? {
            eventType: 'LOAD_ORDER_ASSETS',
            siteId: 'VICMEL001',
            structureId: 'STR_1',
            timestamp: '2026-07-13T10:30:00Z',
            dtConfiguration: { ...this.loadOrderConfiguration },
            orderAssets: editSection.components.map(cloneOrderAsset),
          }
        : {
            eventType: 'INITIALISE_DT',
            siteId: 'VIC001',
            structureId: 'STR_1',
            timestamp: '2026-07-13T10:30:00Z',
            dtConfiguration: { ...this.initialiseDtConfiguration },
            allowDragAndDrop: true,
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

    console.log('Sending event to Digital Twin iframe', message);
    iframeContentWindow.postMessage(message, this.digitalTwinOrigin);
    this.pendingIframeMessage = null;
  }

}
