import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-http-apis',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './http-apis.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HttpApisComponent {}
