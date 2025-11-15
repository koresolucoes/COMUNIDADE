import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SafeHtmlPipe } from '../../../pipes/safe-html.pipe';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserDataService } from '../../../services/user-data.service';
import { ToolDataStateService } from '../../../services/tool-data-state.service';

@Component({
  selector: 'app-diff-checker',
  standalone: true,
  imports: [FormsModule, SafeHtmlPipe, RouterLink],
  templateUrl: './diff-checker.component.html',
  styleUrls: ['./diff-checker.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiffCheckerComponent implements OnInit {
  private authService = inject(AuthService);
  private userDataService = inject(UserDataService);
  private toolDataStateService = inject(ToolDataStateService);
  currentUser = this.authService.currentUser;
  
  text1 = signal('{\n  "id": 123,\n  "status": "pending"\n}');
  text2 = signal('{\n  "id": 123,\n  "status": "completed",\n  "timestamp": 1672531200\n}');
  private dmpInstance: any | null = null;
  
  diffHtml = computed(() => {
    const dmpClass = (window as any).diff_match_patch;
    if (typeof dmpClass === 'undefined') {
      return 'Aguardando a biblioteca de comparação...';
    }

    if (!this.dmpInstance) {
      this.dmpInstance = new dmpClass();
    }

    try {
      const diffs = this.dmpInstance.diff_main(this.text1(), this.text2());
      this.dmpInstance.diff_cleanupSemantic(diffs);
      return this.dmpInstance.diff_prettyHtml(diffs);
    } catch (e) {
      console.error("Diff error:", e);
      return 'Ocorreu um erro ao gerar a comparação.';
    }
  });

  ngOnInit(): void {
      const dataToLoad = this.toolDataStateService.consumeData();
      if (dataToLoad && dataToLoad.toolId === 'diff-checker') {
        this.loadState(dataToLoad.data);
      }
  }

  async saveData() {
    if (!this.currentUser()) {
      alert('Você precisa estar logado para salvar.');
      return;
    }
    const title = prompt('Digite um nome para salvar esta comparação:', `Comparação - ${new Date().toLocaleDateString()}`);
    if (title) {
      const state = {
        text1: this.text1(),
        text2: this.text2(),
      };
      try {
        await this.userDataService.saveData('diff-checker', title, state);
        alert('Comparação salva com sucesso!');
      } catch (e) {
        console.error(e);
        alert('Falha ao salvar a comparação.');
      }
    }
  }

  private loadState(state: any) {
    if (!state) return;
    this.text1.set(state.text1 ?? '');
    this.text2.set(state.text2 ?? '');
  }
}
