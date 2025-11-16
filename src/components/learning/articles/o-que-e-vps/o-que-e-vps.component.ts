import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-o-que-e-vps',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './o-que-e-vps.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OQueEVpsComponent {}
