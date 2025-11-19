
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

interface QuizItem {
  id: number;
  question: string;
  type: 'supervised' | 'unsupervised';
  userAnswer?: 'supervised' | 'unsupervised' | null;
}

@Component({
  selector: 'app-sklearn-o-que-e-ml',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './sklearn-o-que-e-ml.component.html',
  styleUrls: ['./sklearn-o-que-e-ml.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SklearnOQueEMlComponent {
  quizItems = signal<QuizItem[]>([
    { id: 1, question: 'Prever o preço de uma casa com base em sua área e número de quartos.', type: 'supervised' },
    { id: 2, question: 'Agrupar clientes de um e-commerce em diferentes segmentos com base no histórico de compras.', type: 'unsupervised' },
    { id: 3, question: 'Classificar um e-mail como "spam" ou "não spam" com base no texto.', type: 'supervised' },
    { id: 4, question: 'Detectar transações bancárias anômalas que podem ser fraudes.', type: 'unsupervised' }
  ]);

  answeredCount = signal(0);
  correctCount = signal(0);
  showResults = signal(false);

  answer(item: QuizItem, answer: 'supervised' | 'unsupervised') {
    if (item.userAnswer) return; // Prevent changing answer

    this.quizItems.update(items => 
      items.map(i => i.id === item.id ? { ...i, userAnswer: answer } : i)
    );
    this.answeredCount.update(c => c + 1);
    if (answer === item.type) {
      this.correctCount.update(c => c + 1);
    }
  }

  checkResults() {
    this.showResults.set(true);
  }

  resetQuiz() {
    this.quizItems.update(items => items.map(i => ({ ...i, userAnswer: null })));
    this.answeredCount.set(0);
    this.correctCount.set(0);
    this.showResults.set(false);
  }
}
