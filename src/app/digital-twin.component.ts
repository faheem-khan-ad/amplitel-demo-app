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
    ownerCompanyName: 'Amplitel',
    allowDragAndDrop: true,
  };
  private readonly orderAssets: OrderAsset[] = [
   
    {
      portalUniqueId: null,
      assetId: 'STR_1_HFM_1',
      assetDetails: null
    },
    {
      portalUniqueId: null,
       assetId: 'STR_1_HFM_2',
      assetDetails: null
    },
     {
      portalUniqueId: null,
      assetId: 'STR_1_TJD_1',
      assetDetails: null
    },
    {
      portalUniqueId: null,
      assetId: 'STR_1_ANT_1',
      assetDetails: null
    },
  ];

  private readonly digitalTwinSource =
    `https://staging-amplitel.dronos.ai/canvas/amplitel/digital-twin?token=YRvLK6kN4TZSqrkU3OP00p7xE3ww%2FSvT5a%2F38BijekiAFNjfLw0BVaD2JBPFwQHGvdnrQCozrNgWa4Iywz5EApyRavJRVa07gWk1IjsI2ZBAlw2WqvD9uduEKLMlas1kccMnUqrhA3h42nU1HbjLfZIOPQNP%2BmQ4v2YePKRe0Z0YJPygkls38rub1X1p2eROqI7YYjxObspN50tVrTDpm5cJ%2F5Vp7WyPFuisfnYnsCjZ9q6lqTKmaBRU%2BhB41ouuAOsfN4xe2ffxtW2inrMT3w%3D%3D`;
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
