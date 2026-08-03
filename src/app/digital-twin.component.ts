import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
  ComponentDataStore,
  DigitalTwinComponentData,
  DigitalTwinOrderPayload
} from './component-data.store';

@Component({
  selector: 'app-digital-twin',
  standalone: true,
  templateUrl: './digital-twin.component.html',
  styleUrl: './digital-twin.component.css'
})
export class DigitalTwinComponent implements OnInit, OnDestroy {
  digitalTwinUrl: SafeResourceUrl;

  private readonly digitalTwinSource =
    'http://localhost:8057/canvas/6879f6adef94973d975284c7/3d?workspaceId=64b8f335dc5ac99755c8bc11';
  private readonly digitalTwinOrigin = 'http://localhost:8057';
  private readonly handleMessage = (event: MessageEvent): void => {
    if (event.origin !== this.digitalTwinOrigin) {
      return;
    }

    if (event.data?.type !== 'DIGITAL_TWIN_CREATE_COLS') {
      return;
    }

    const payload = event.data?.payload;
    const components = payload?.components;

    if (!Array.isArray(components)) {
      console.warn('DIGITAL_TWIN_CREATE_COLS received without components array');
      return;
    }

    const orderPayload = this.normalizeOrderPayload(payload);

    console.log('Received components from Digital Twin iframe', orderPayload);
    this.componentDataStore.updateEditSection(orderPayload);
    this.router.navigateByUrl('/');
  };

  constructor(
    private readonly router: Router,
    private readonly sanitizer: DomSanitizer,
    private readonly componentDataStore: ComponentDataStore
  ) {
    this.digitalTwinUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.digitalTwinSource
    );
  }

  ngOnInit(): void {
    window.addEventListener('message', this.handleMessage);
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.handleMessage);
  }

  closeDigitalTwin(): void {
    console.log('Digital Twin iframe closed');
    this.router.navigateByUrl('/');
  }

  sendDigitalTwinOpened(event: Event): void {
    const iframe = event.target as HTMLIFrameElement;
    const editSection = this.componentDataStore.editSection();
    const openedMessage = {
      type: 'DIGITAL_TWIN_OPENED',
      source: 'amplitel-demo-app',
      triggeredBy: 'digital-twin-button',
      payload: {
        submittedComponents: this.componentDataStore.submittedComponents()
      },
      timestamp: Date.now()
    };
    const editMessage = editSection
      ? {
          type: 'DIGITAL_TWIN_EDIT_SECTION',
          source: 'amplitel-demo-app',
          payload: {
            sectionKey: editSection.key,
            sectionTitle: editSection.title,
            order: {
              key: editSection.key,
              title: editSection.title,
              componentCount: editSection.components.length
            },
            components: editSection.components,
            submittedComponents: this.componentDataStore.submittedComponents()
          },
          timestamp: Date.now()
        }
      : null;

    console.log(
      'Sending event to Digital Twin iframe',
      editMessage ?? openedMessage
    );

    const delays = editMessage ? [500, 1500, 3000] : [0, 300, 1000];

    delays.forEach((delay) => {
      window.setTimeout(() => {
        if (editMessage) {
          iframe.contentWindow?.postMessage(editMessage, this.digitalTwinOrigin);
          return;
        }

        iframe.contentWindow?.postMessage(openedMessage, this.digitalTwinOrigin);
      }, delay);
    });
  }

  private normalizeOrderPayload(payload: unknown): DigitalTwinOrderPayload {
    const record = payload as Partial<DigitalTwinOrderPayload>;

    return {
      sectionKey: record.sectionKey,
      sectionTitle: record.sectionTitle,
      order: record.order,
      components: (record.components ?? []) as DigitalTwinComponentData[]
    };
  }
}
