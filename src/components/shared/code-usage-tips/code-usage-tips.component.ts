import { Component, ChangeDetectionStrategy, signal } from '@angular/core';

type CodeSnippetTab = 'n8n' | 'python' | 'javascript';

@Component({
  selector: 'app-code-usage-tips',
  standalone: true,
  imports: [],
  templateUrl: './code-usage-tips.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeUsageTipsComponent {
  activeTab = signal<CodeSnippetTab>('n8n');
}
