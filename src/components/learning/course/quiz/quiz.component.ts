import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseLesson } from '../../../../services/course.service';

interface QuizQuestion {
  id: string;
  text: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation?: string;
}

interface QuizContent {
  questions: QuizQuestion[];
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-3xl mx-auto">
      <!-- Progress Bar -->
      <div class="mb-8 bg-gray-700 rounded-full h-2.5">
        <div class="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
             [style.width.%]="progressPercentage()"></div>
      </div>

      <!-- Question -->
      <div *ngIf="currentQuestion() as question" class="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-lg">
        <h3 class="text-xl font-bold text-white mb-6">
          <span class="text-blue-400 mr-2">Questão {{ currentQuestionIndex() + 1 }}:</span>
          {{ question.text }}
        </h3>

        <!-- Options -->
        <div class="space-y-4">
          <button *ngFor="let option of question.options"
                  (click)="selectOption(option)"
                  [disabled]="isAnswered()"
                  class="w-full text-left p-4 rounded-lg border transition-all duration-200 flex items-center justify-between group"
                  [ngClass]="getOptionClass(option)">
            
            <span class="flex items-center gap-3">
              <span class="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold"
                    [ngClass]="getOptionIndicatorClass(option)">
                {{ getOptionLetter(option) }}
              </span>
              {{ option.text }}
            </span>

            <!-- Feedback Icon -->
            <span *ngIf="isAnswered() && option.id === selectedOptionId()" class="material-icons-outlined">
              {{ option.isCorrect ? 'check_circle' : 'cancel' }}
            </span>
          </button>
        </div>

        <!-- Explanation / Next Button -->
        <div *ngIf="isAnswered()" class="mt-8 pt-6 border-t border-gray-700 animate-fade-in">
          <div [ngClass]="isCorrect() ? 'bg-green-900/20 border-green-800' : 'bg-red-900/20 border-red-800'"
               class="p-4 rounded-lg border mb-6">
            <p class="font-bold mb-1" [ngClass]="isCorrect() ? 'text-green-400' : 'text-red-400'">
              {{ isCorrect() ? 'Correto!' : 'Incorreto' }}
            </p>
            <p class="text-gray-300 text-sm">{{ question.explanation }}</p>
          </div>

          <button (click)="nextQuestion()"
                  class="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
            {{ isLastQuestion() ? 'Finalizar Quiz' : 'Próxima Questão' }}
            <span class="material-icons-outlined">arrow_forward</span>
          </button>
        </div>
      </div>

      <!-- Results Screen -->
      <div *ngIf="quizCompleted()" class="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center animate-fade-in">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-700 mb-6">
          <span class="material-icons-outlined text-4xl" 
                [ngClass]="scorePercentage() >= 70 ? 'text-green-400' : 'text-yellow-400'">
            {{ scorePercentage() >= 70 ? 'emoji_events' : 'school' }}
          </span>
        </div>
        
        <h2 class="text-2xl font-bold text-white mb-2">Quiz Completado!</h2>
        <p class="text-gray-400 mb-6">Você acertou {{ score() }} de {{ totalQuestions() }} questões.</p>
        
        <div class="text-4xl font-bold mb-8" 
             [ngClass]="scorePercentage() >= 70 ? 'text-green-400' : 'text-yellow-400'">
          {{ scorePercentage() }}%
        </div>

        <button (click)="retry()" 
                class="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors mr-4">
          Tentar Novamente
        </button>
        
        <button (click)="finish()" 
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Continuar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class QuizComponent {
  lessonSignal = signal<CourseLesson | null>(null);

  @Input() set lesson(value: CourseLesson) {
    this.lessonSignal.set(value);
    this.reset();
  }
  
  @Output() completed = new EventEmitter<{ score: number }>();

  // State
  currentQuestionIndex = signal(0);
  selectedOptionId = signal<string | null>(null);
  isAnswered = signal(false);
  score = signal(0);
  quizCompleted = signal(false);

  // Computed
  questions = computed(() => {
    const lesson = this.lessonSignal();
    return (lesson?.content as QuizContent)?.questions || [];
  });
  
  currentQuestion = computed(() => this.questions()[this.currentQuestionIndex()]);
  totalQuestions = computed(() => this.questions().length);
  isLastQuestion = computed(() => this.currentQuestionIndex() === this.totalQuestions() - 1);
  
  progressPercentage = computed(() => {
    const total = this.totalQuestions();
    if (total === 0) return 0;
    return ((this.currentQuestionIndex() + (this.quizCompleted() ? 1 : 0)) / total) * 100;
  });
  
  scorePercentage = computed(() => {
    const total = this.totalQuestions();
    if (total === 0) return 0;
    return Math.round((this.score() / total) * 100);
  });

  isCorrect = computed(() => {
    const question = this.currentQuestion();
    if (!question) return false;
    const selected = question.options.find(o => o.id === this.selectedOptionId());
    return selected?.isCorrect || false;
  });

  selectOption(option: any) {
    if (this.isAnswered()) return;
    this.selectedOptionId.set(option.id);
    this.isAnswered.set(true);
    
    if (option.isCorrect) {
      this.score.update(s => s + 1);
    }
  }

  nextQuestion() {
    if (this.isLastQuestion()) {
      this.quizCompleted.set(true);
    } else {
      this.currentQuestionIndex.update(i => i + 1);
      this.selectedOptionId.set(null);
      this.isAnswered.set(false);
    }
  }

  retry() {
    this.reset();
  }

  finish() {
    this.completed.emit({ score: this.scorePercentage() });
  }

  reset() {
    this.currentQuestionIndex.set(0);
    this.selectedOptionId.set(null);
    this.isAnswered.set(false);
    this.score.set(0);
    this.quizCompleted.set(false);
  }

  // Helpers for template
  getOptionLetter(option: any): string {
    const question = this.currentQuestion();
    if (!question) return '';
    const index = question.options.indexOf(option);
    return String.fromCharCode(65 + index);
  }

  getOptionClass(option: any): string {
    if (!this.isAnswered()) {
      return 'border-gray-600 hover:border-blue-500 hover:bg-gray-700/50 text-gray-300';
    }
    
    if (option.isCorrect) {
      return 'border-green-500 bg-green-900/20 text-green-200';
    }

    if (this.selectedOptionId() === option.id && !option.isCorrect) {
      return 'border-red-500 bg-red-900/20 text-red-200';
    }

    return 'border-gray-700 opacity-50 text-gray-500';
  }

  getOptionIndicatorClass(option: any): string {
    if (!this.isAnswered()) {
      return 'border-gray-500 text-gray-400 group-hover:border-blue-400 group-hover:text-blue-400';
    }
    
    if (option.isCorrect) {
      return 'border-green-500 bg-green-500 text-white border-none';
    }

    if (this.selectedOptionId() === option.id && !option.isCorrect) {
      return 'border-red-500 bg-red-500 text-white border-none';
    }

    return 'border-gray-600 text-gray-600';
  }
}
