
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ux-ferramentas-internas',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './ux-ferramentas-internas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UxFerramentasInternasComponent {
  displayMode = signal<'card' | 'table'>('card');

  mockData = [
    { id: 'i-0a1b', status: 'Running', type: 't3.micro', ip: '10.0.0.15' },
    { id: 'i-0c3d', status: 'Stopped', type: 'm5.large', ip: '10.0.0.22' },
    { id: 'i-0e5f', status: 'Running', type: 't3.micro', ip: '10.0.0.45' },
    { id: 'i-1a2b', status: 'Pending', type: 'c5.xlarge', ip: '10.0.0.99' },
  ];
}
