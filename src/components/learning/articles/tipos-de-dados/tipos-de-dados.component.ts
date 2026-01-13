import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearningNavigationComponent } from '../../shared/learning-navigation/learning-navigation.component';

@Component({
  selector: 'app-tipos-de-dados',
  standalone: true,
  imports: [RouterLink, LearningNavigationComponent],
  templateUrl: './tipos-de-dados.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TiposDeDadosComponent {}