import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ComponentDataStore } from './component-data.store';

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

  openDigitalTwin(): void {
    console.log('Digital Twin clicked');
    this.router.navigateByUrl('/digital-twin');
  }

  handleButtonTwo(): void {
    console.log('Button 2 clicked');
  }

  handleButtonThree(): void {
    console.log('Button 3 clicked');
  }
}
