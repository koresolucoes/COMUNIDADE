import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { LearningNavigationComponent } from '../../shared/learning-navigation/learning-navigation.component';

@Component({
  selector: 'app-conhecendo-interface-n8n',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage, LearningNavigationComponent],
  templateUrl: './conhecendo-interface-n8n.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConhecendoInterfaceN8nComponent {}