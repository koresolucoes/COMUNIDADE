import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-principais-conceitos-k8s',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './principais-conceitos-k8s.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrincipaisConceitosK8sComponent {}
