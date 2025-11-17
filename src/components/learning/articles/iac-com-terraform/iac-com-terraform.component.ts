import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-iac-com-terraform',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './iac-com-terraform.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IacComTerraformComponent {}
