import { Component, ChangeDetectionStrategy, input, signal, HostListener } from '@angular/core';
import { SafeHtmlPipe } from '../../../pipes/safe-html.pipe';

export interface InfoSection {
  title: string;
  content: string;
}

@Component({
  selector: 'app-tool-info-section',
  standalone: true,
  imports: [SafeHtmlPipe],
  templateUrl: './tool-info-section.component.html',
  styleUrls: ['./tool-info-section.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolInfoSectionComponent {
  sections = input.required<InfoSection[]>();
  openSection = signal<number | null>(0); // Open the first section by default

  @HostListener('click', ['$event'])
  onClick(event: Event) {
    const button = (event.target as HTMLElement).closest<HTMLElement>('[data-copy-code]');
    if (button) {
      const code = button.getAttribute('data-copy-code');
      if (code) {
        navigator.clipboard.writeText(code).then(() => {
          const originalText = button.textContent;
          button.textContent = 'Copiado!';
          setTimeout(() => {
            button.textContent = originalText;
          }, 2000);
        });
      }
    }
  }

  toggleSection(index: number) {
    if (this.openSection() === index) {
      this.openSection.set(null);
    } else {
      this.openSection.set(index);
    }
  }
}
