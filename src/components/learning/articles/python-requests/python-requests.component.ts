import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-python-requests',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './python-requests.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PythonRequestsComponent {}
