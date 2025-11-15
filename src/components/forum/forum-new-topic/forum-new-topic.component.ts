import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ForumService } from '../../../services/forum.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forum-new-topic',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forum-new-topic.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForumNewTopicComponent implements OnInit {
  private forumService = inject(ForumService);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  selectedFiles = signal<File[]>([]);

  topicForm = inject(FormBuilder).group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    content: ['', [Validators.required, Validators.minLength(10)]],
  });

  ngOnInit() {
    if (!this.authService.currentUser()) {
      this.router.navigate(['/login']);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles.set(Array.from(input.files));
    }
  }

  removeFile(fileToRemove: File) {
    this.selectedFiles.update(files => files.filter(file => file !== fileToRemove));
  }

  async onSubmit() {
    this.topicForm.markAllAsTouched();
    if (this.topicForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { title, content } = this.topicForm.value;

    try {
      const newTopic = await this.forumService.createTopic(title!, content!, this.selectedFiles());
      this.router.navigate(['/forum', newTopic.id]);
    } catch (e) {
      this.errorMessage.set(e instanceof Error ? e.message : 'Falha ao criar o tópico.');
    } finally {
      this.loading.set(false);
    }
  }
}
