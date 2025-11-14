import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './placeholder.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceholderComponent {
  title = signal('Página em Construção');
  message = signal('Este conteúdo estará disponível em breve.');

  constructor(route: ActivatedRoute) {
    route.data.subscribe(data => {
      if (data['title']) {
        this.title.set(data['title']);
      }
      if (data['message']) {
        this.message.set(data['message']);
      }
    });
  }
}
