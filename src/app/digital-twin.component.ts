import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
  ComponentDataStore,
  DigitalTwinComponentData
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

    const components = event.data?.payload?.components;

    if (!Array.isArray(components)) {
      console.warn('DIGITAL_TWIN_CREATE_COLS received without components array');
      return;
    }

    console.log('Received components from Digital Twin iframe', components);
    this.componentDataStore.setComponents(
      components as DigitalTwinComponentData[]
    );
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
    const message = {
      type: 'DIGITAL_TWIN_OPENED',
      source: 'amplitel-demo-app',
      triggeredBy: 'digital-twin-button',
      timestamp: Date.now()
    };

    console.log('Sending event to Digital Twin iframe', message);

    [0, 300, 1000].forEach((delay) => {
      window.setTimeout(() => {
        iframe.contentWindow?.postMessage(message, this.digitalTwinOrigin);
      }, delay);
    });
  }
}
