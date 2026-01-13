import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearningNavigationComponent } from '../../shared/learning-navigation/learning-navigation.component';

@Component({
  selector: 'app-como-internet-funciona',
  standalone: true,
  imports: [RouterLink, LearningNavigationComponent],
  templateUrl: './como-internet-funciona.component.html',
  styleUrls: ['./como-internet-funciona.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComoInternetFuncionaComponent {}