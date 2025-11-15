import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-blog-publisher',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './blog-publisher.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogPublisherComponent {
  loading = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  // Fix: Inject FormBuilder into a property to ensure proper type inference before use.
  private fb = inject(FormBuilder);
  blogForm = this.fb.group({
    title: ['', [Validators.required]],
    author: ['', [Validators.required]],
    summary: ['', [Validators.required]],
    content: ['', [Validators.required]],
    apiKey: ['', [Validators.required]],
  });

  async onSubmit() {
    this.blogForm.markAllAsTouched();
    if (this.blogForm.invalid) {
      this.errorMessage.set('Por favor, preencha todos os campos.');
      return;
    }

    this.loading.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const { apiKey, ...postData } = this.blogForm.value;

    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(postData),
      });

      const responseBody = await response.json();

      if (!response.ok) {
        throw new Error(responseBody.error || `Falha na publicação: ${response.statusText}`);
      }

      this.successMessage.set(`Post "${responseBody.title}" publicado com sucesso!`);
      this.blogForm.reset();

    } catch (e) {
      this.errorMessage.set(e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.');
    } finally {
      this.loading.set(false);
    }
  }
}
