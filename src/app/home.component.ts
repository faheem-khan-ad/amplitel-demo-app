import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  ComponentDataStore,
  ComponentSection,
  DigitalTwinComponentData,
  EditableComponentField
} from './component-data.store';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private readonly router = inject(Router);
  private readonly componentDataStore = inject(ComponentDataStore);

  components = this.componentDataStore.components;
  componentSections = computed(() => this.groupComponents(this.components()));
  submittedComponents = this.componentDataStore.submittedComponents;

  openDigitalTwin(): void {
    console.log('Digital Twin clicked');
    this.componentDataStore.setEditSection(null);
    this.router.navigateByUrl('/digital-twin');
  }

  editSection(section: ComponentSection): void {
    console.log('Editing component section', section);
    this.componentDataStore.setEditSection(section);
    this.router.navigateByUrl('/digital-twin');
  }

  updateOrderComponent(
    component: DigitalTwinComponentData,
    field: EditableComponentField,
    event: Event
  ): void {
    const fieldElement = event.target as HTMLInputElement | HTMLSelectElement;
    this.componentDataStore.updateComponentField(
      component,
      field,
      fieldElement.value
    );
  }

  handleButtonTwo(): void {
    console.log('Button 2 clicked');
  }

  handleButtonThree(): void {
    console.log('Button 3 clicked');
  }

  private groupComponents(
    components: DigitalTwinComponentData[]
  ): ComponentSection[] {
    const sections = new Map<string, ComponentSection>();

    components.forEach((component) => {
      const key = this.getSectionKey(component);
      const section = sections.get(key);

      if (section) {
        section.components.push(component);
        return;
      }

      sections.set(key, {
        key,
        title: this.getSectionTitle(component, key),
        components: [component]
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
    key: string
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
