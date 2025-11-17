import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-layouts-com-grid-flexbox',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './layouts-com-grid-flexbox.component.html',
  styleUrls: ['./layouts-com-grid-flexbox.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutsComGridFlexboxComponent {}