
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-o-que-e-no-n8n',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './o-que-e-no-n8n.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OQueENoN8nComponent {}
