import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs/operators';
import { from, of } from 'rxjs';
import { ForumService, Topic } from '../../../services/forum.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forum-topic',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule],
  templateUrl: './forum-topic.component.html',
  styleUrls: ['./forum-topic.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForumTopicComponent {
  private route = inject(ActivatedRoute);
  private forumService = inject(ForumService);
  public authService = inject(AuthService);

  loading = signal(true);
  error = signal<string | null>(null);

  topic = signal<Topic | null>(null);

  // New comment state
  newCommentContent = signal('');
  commentFiles = signal<File[]>([]);
  commentLoading = signal(false);
  commentError = signal<string | null>(null);

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
      // Reload topic to see the new comment
      await this.loadTopic(this.topic()!.id);
    } catch (e) {
      this.commentError.set(e instanceof Error ? e.message : 'Falha ao postar comentário.');
    } finally {
      this.commentLoading.set(false);
    }
  }
}
