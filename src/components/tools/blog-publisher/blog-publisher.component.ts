import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

function jsonValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }
  try {
    const parsed = JSON.parse(control.value);
    if (!Array.isArray(parsed)) {
      return { jsonInvalid: 'O conteúdo deve ser um array de seções.' };
    }
    return null;
  } catch (e) {
    return { jsonInvalid: 'O texto não é um JSON válido.' };
  }
}

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

  // FIX: Use inject(FormBuilder) directly to initialize the form group, avoiding potential issues with `this` context during property initialization.
  blogForm = inject(FormBuilder).group({
    title: ['', [Validators.required]],
    author: ['', [Validators.required]],
    summary: ['', [Validators.required]],
    content: ['', [Validators.required, jsonValidator]],
    apiKey: ['', [Validators.required]],
  });

  async onSubmit() {
    this.blogForm.markAllAsTouched();
    if (this.blogForm.invalid) {
      this.errorMessage.set('Por favor, preencha todos os campos e corrija os erros.');
      return;
    }

    this.loading.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const { apiKey, content, ...restOfForm } = this.blogForm.value;

    const postData = {
      ...restOfForm,
      content: JSON.parse(content!), // We know it's valid due to the validator
    };

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
