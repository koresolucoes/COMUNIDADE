import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SafeHtmlPipe } from '../../../pipes/safe-html.pipe';

declare var diff_match_patch: any;

@Component({
  selector: 'app-diff-checker',
  standalone: true,
  imports: [FormsModule, SafeHtmlPipe],
  templateUrl: './diff-checker.component.html',
  styleUrls: ['./diff-checker.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiffCheckerComponent {
  text1 = signal('{\n  "id": 123,\n  "status": "pending"\n}');
  text2 = signal('{\n  "id": 123,\n  "status": "completed",\n  "timestamp": 1672531200\n}');
  
  diffHtml = computed(() => {
    try {
      if (typeof diff_match_patch === 'undefined') {
        return 'Aguardando a biblioteca de comparação...';
      }
      const dmp = new diff_match_patch();
      const diffs = dmp.diff_main(this.text1(), this.text2());
      dmp.diff_cleanupSemantic(diffs);
      return dmp.diff_prettyHtml(diffs);
    } catch (e) {
      console.error("Diff error:", e);
      return 'Ocorreu um erro ao gerar a comparação.';
    }
  });
}
