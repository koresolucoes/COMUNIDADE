import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-python-web-scraping',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './python-web-scraping.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PythonWebScrapingComponent {}
