import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SafeHtmlPipe } from '../../../pipes/safe-html.pipe';
import { map, switchMap } from 'rxjs/operators';
import { from, of } from 'rxjs';
import { ForumService, Topic, Comment, EditHistory } from '../../../services/forum.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forum-topic',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule, ReactiveFormsModule, SafeHtmlPipe],
  templateUrl: './forum-topic.component.html',
  styleUrls: ['./forum-topic.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForumTopicComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private forumService = inject(ForumService);
  public authService = inject(AuthService);
  private fb = inject(FormBuilder);

  loading = signal(true);
  error = signal<string | null>(null);
  topic = signal<Topic | null>(null);

  // New comment state
  newCommentContent = signal('');
  commentFiles = signal<File[]>([]);
  commentLoading = signal(false);
  commentError = signal<string | null>(null);
  
  // --- Editing State ---
  isEditingTopic = signal(false);
  editingCommentId = signal<string | null>(null);

  topicEditForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    content: ['', [Validators.required, Validators.minLength(10)]],
  });

  commentEditForm = this.fb.group({
    content: ['', [Validators.required, Validators.minLength(10)]],
  });
  
  // --- History Modal State ---
  isHistoryModalVisible = signal(false);
  historyItems = signal<EditHistory[]>([]);
  historyCurrentContent = signal('');
  historyCurrentTitle = signal('');
  historyItemName = signal(''); // "Tópico" or "Comentário"

  private topicId$ = this.route.paramMap.pipe(map(params => params.get('topicId')));

  constructor() {
    this.topicId$.subscribe(id => {
      if (id) {
        this.loadTopic(id);
      }
    });
  }

  async loadTopic(id: string) {
    this.loading.set(true);
    this.error.set(null);
    try {
      const topicData = await this.forumService.getTopicWithDetails(id);
      if (topicData) {
        this.topic.set(topicData);
      } else {
        this.error.set('Tópico não encontrado.');
      }
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Falha ao carregar o tópico.');
    } finally {
      this.isEditingTopic.set(false);
      this.editingCommentId.set(null);
      this.loading.set(false);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.commentFiles.set(Array.from(input.files));
    }
  }

  removeFile(fileToRemove: File) {
    this.commentFiles.update(files => files.filter(file => file !== fileToRemove));
  }

  async postComment() {
    if (!this.newCommentContent().trim() || !this.topic()?.id) {
      return;
    }

    this.commentLoading.set(true);
    this.commentError.set(null);
    try {
      await this.forumService.createComment(this.topic()!.id, this.newCommentContent(), this.commentFiles());
      this.newCommentContent.set('');
      this.commentFiles.set([]);
      await this.loadTopic(this.topic()!.id);
    } catch (e) {
      this.commentError.set(e instanceof Error ? e.message : 'Falha ao postar comentário.');
    } finally {
      this.commentLoading.set(false);
    }
  }
  
  // --- Topic Methods ---
  startEditTopic() {
    if (!this.topic()) return;
    this.topicEditForm.patchValue({
      title: this.topic()!.title,
      content: this.topic()!.content,
    });
    this.isEditingTopic.set(true);
  }

  cancelEditTopic() {
    this.isEditingTopic.set(false);
  }

  async saveTopic() {
    if (this.topicEditForm.invalid || !this.topic()) return;
    this.loading.set(true);
    const { title, content } = this.topicEditForm.value;
    try {
      await this.forumService.updateTopic(this.topic()!.id, title!, content!);
      await this.loadTopic(this.topic()!.id);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Falha ao salvar o tópico.');
    } finally {
      this.isEditingTopic.set(false);
      this.loading.set(false);
    }
  }

  async deleteTopic() {
    if (!this.topic() || !confirm('Tem certeza de que deseja excluir este tópico? Todos os comentários também serão removidos. Esta ação é irreversível.')) return;
    this.loading.set(true);
    try {
      await this.forumService.deleteTopic(this.topic()!.id);
      this.router.navigate(['/forum']);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Falha ao excluir o tópico.');
    } finally {
      this.loading.set(false);
    }
  }

  // --- Comment Methods ---
  startEditComment(comment: Comment) {
    this.editingCommentId.set(comment.id);
    this.commentEditForm.patchValue({ content: comment.content });
  }

  cancelEditComment() {
    this.editingCommentId.set(null);
  }

  async saveComment(comment: Comment) {
    if (this.commentEditForm.invalid) return;
    this.commentLoading.set(true);
    const { content } = this.commentEditForm.value;
    try {
      await this.forumService.updateComment(comment.id, content!);
      await this.loadTopic(this.topic()!.id);
    } catch (e) {
      this.commentError.set(e instanceof Error ? e.message : 'Falha ao salvar o comentário.');
    } finally {
      this.editingCommentId.set(null);
      this.commentLoading.set(false);
    }
  }

  async deleteComment(commentId: string) {
    if (!confirm('Tem certeza de que deseja excluir este comentário?')) return;
    this.commentLoading.set(true);
    try {
      await this.forumService.deleteComment(commentId);
      await this.loadTopic(this.topic()!.id);
    } catch (e) {
      this.commentError.set(e instanceof Error ? e.message : 'Falha ao excluir o comentário.');
    } finally {
      this.commentLoading.set(false);
    }
  }
  
  // --- History Methods ---
  async showHistory(item: Topic | Comment, type: 'topic' | 'comment') {
    this.historyItemName.set(type === 'topic' ? 'Tópico' : 'Comentário');
    this.historyCurrentContent.set(item.content);
    if ('title' in item && item.title) {
      this.historyCurrentTitle.set(item.title);
    } else {
      this.historyCurrentTitle.set('');
    }
    
    try {
      const history = await this.forumService.getEditHistory(item.id, type);
      this.historyItems.set(history);
      this.isHistoryModalVisible.set(true);
    } catch(e) {
      this.error.set("Falha ao carregar histórico de edições.");
    }
  }

  closeHistoryModal() {
    this.isHistoryModalVisible.set(false);
    this.historyItems.set([]);
  }
  
  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  getDiffHtml(text1: string, text2: string): string {
    const jsdiff = (window as any).Diff;
    if (typeof jsdiff === 'undefined') {
      return '<span>Aguardando biblioteca de comparação...</span>';
    }

    try {
      const diff = jsdiff.diffChars(text1, text2);
      let html = '';
      diff.forEach((part: any) => {
        const tag = part.added ? 'ins' :
                      part.removed ? 'del' : null;
        const escapedValue = this.escapeHtml(part.value);
        if (tag) {
          html += `<${tag}>${escapedValue}</${tag}>`;
        } else {
          html += escapedValue;
        }
      });
      return html;
    } catch (e) {
      console.error("Diff error:", e);
      return '<span>Ocorreu um erro ao gerar a comparação.</span>';
    }
  }
}