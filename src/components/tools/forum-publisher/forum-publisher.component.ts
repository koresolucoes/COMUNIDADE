import { Component, ChangeDetectionStrategy, signal, inject, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-forum-publisher',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './forum-publisher.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForumPublisherComponent {
  loading = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  mode = signal<'topic' | 'comment'>('topic');

  // Fix: Explicitly typed the injected FormBuilder to resolve a type inference issue.
  private fb: FormBuilder = inject(FormBuilder);
  publisherForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    content: ['', [Validators.required, Validators.minLength(10)]],
    topicId: [''],
    apiKey: ['', [Validators.required]],
    userId: [''],
  });
  
  constructor() {
    effect(() => {
        const currentMode = this.mode();
        if (currentMode === 'topic') {
            this.publisherForm.get('title')?.setValidators([Validators.required, Validators.minLength(5)]);
            this.publisherForm.get('topicId')?.clearValidators();
            this.publisherForm.get('topicId')?.setValue('');
        } else { // comment mode
            this.publisherForm.get('title')?.clearValidators();
            this.publisherForm.get('title')?.setValue('');
            this.publisherForm.get('topicId')?.setValidators([Validators.required]);
        }
        this.publisherForm.get('title')?.updateValueAndValidity();
        this.publisherForm.get('topicId')?.updateValueAndValidity();
    });
  }

  async onSubmit() {
    this.publisherForm.markAllAsTouched();
    if (this.publisherForm.invalid) {
      this.errorMessage.set('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    this.loading.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const formValue = this.publisherForm.getRawValue();
    const payload: any = { content: formValue.content };
    
    if (this.mode() === 'topic') {
        payload.title = formValue.title;
    } else {
        payload.topicId = formValue.topicId;
    }
    
    if (formValue.userId) {
        payload.user_id = formValue.userId;
    }

    try {
      const response = await fetch('/api/forum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${formValue.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const responseBody = await response.json();

      if (!response.ok) {
        throw new Error(responseBody.error || `Falha na publicação: ${response.statusText}`);
      }

      this.successMessage.set(`${this.mode() === 'topic' ? 'Tópico' : 'Comentário'} publicado com sucesso!`);
      this.publisherForm.patchValue({
          title: '',
          content: '',
          topicId: ''
      });
      this.publisherForm.markAsPristine();
      this.publisherForm.markAsUntouched();

    } catch (e) {
      this.errorMessage.set(e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.');
    } finally {
      this.loading.set(false);
    }
  }
}
