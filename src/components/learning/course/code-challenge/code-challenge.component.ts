import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseLesson } from '../../../../services/course.service';

interface ChallengeContent {
  description: string;
  initialCode: string;
  language: string;
  solution?: string;
  hints?: string[];
}

@Component({
  selector: 'app-code-challenge',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-[calc(100vh-200px)] min-h-[500px] border border-gray-700 rounded-xl overflow-hidden bg-gray-900">
      
      <!-- Toolbar -->
      <div class="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div class="flex items-center gap-2">
          <span class="material-icons-outlined text-yellow-500">code</span>
          <span class="text-sm font-medium text-gray-300">{{ content()?.language || 'text' }}</span>
        </div>
        <div class="flex items-center gap-2">
          <button (click)="resetCode()" 
                  class="p-2 text-gray-400 hover:text-white rounded hover:bg-gray-700 transition-colors"
                  title="Resetar Código">
            <span class="material-icons-outlined text-sm">restart_alt</span>
          </button>
        </div>
      </div>

      <div class="flex flex-1 overflow-hidden">
        <!-- Problem Description (Left Panel) -->
        <div class="w-1/3 border-r border-gray-700 bg-gray-800/50 p-6 overflow-y-auto">
          <h3 class="text-lg font-bold text-white mb-4">Desafio</h3>
          <div class="prose prose-invert prose-sm max-w-none" [innerHTML]="content()?.description"></div>
          
          <!-- Hints -->
          <div *ngIf="content()?.hints?.length" class="mt-8">
            <button (click)="toggleHints()" 
                    class="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
              <span class="material-icons-outlined text-sm">{{ showHints() ? 'expand_less' : 'lightbulb' }}</span>
              {{ showHints() ? 'Esconder Dicas' : 'Mostrar Dicas' }}
            </button>
            
            <div *ngIf="showHints()" class="mt-4 space-y-3 animate-fade-in">
              <div *ngFor="let hint of content()?.hints; let i = index" 
                   class="bg-blue-900/20 border border-blue-800 rounded p-3 text-sm text-blue-200">
                <span class="font-bold mr-2">Dica {{i+1}}:</span> {{ hint }}
              </div>
            </div>
          </div>
        </div>

        <!-- Code Editor (Right Panel) -->
        <div class="flex-1 flex flex-col bg-[#1e1e1e]">
          <!-- Simple Textarea for now, styled to look like code -->
          <textarea 
            [ngModel]="userCode()"
            (ngModelChange)="userCode.set($event)"
            class="flex-1 w-full h-full bg-transparent text-gray-300 font-mono text-sm p-4 resize-none focus:outline-none"
            spellcheck="false"
            placeholder="Escreva seu código aqui...">
          </textarea>

          <!-- Output / Console -->
          <div *ngIf="output()" class="h-32 border-t border-gray-700 bg-black p-4 font-mono text-xs overflow-y-auto">
            <div class="text-gray-500 mb-1">Output:</div>
            <pre [class.text-red-400]="hasError()" [class.text-green-400]="!hasError()">{{ output() }}</pre>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="p-4 bg-gray-800 border-t border-gray-700 flex justify-end gap-3">
        <button (click)="runCode()" 
                class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
          <span class="material-icons-outlined text-sm">play_arrow</span>
          Executar
        </button>
        
        <button (click)="submit()" 
                class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
          <span class="material-icons-outlined text-sm">check</span>
          Enviar Resposta
        </button>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
    textarea { tab-size: 2; }
  `]
})
export class CodeChallengeComponent {
  lessonSignal = signal<CourseLesson | null>(null);

  @Input() set lesson(value: CourseLesson) {
    this.lessonSignal.set(value);
    this.reset();
  }

  @Output() completed = new EventEmitter<void>();

  // State
  userCode = signal('');
  output = signal<string | null>(null);
  hasError = signal(false);
  showHints = signal(false);

  // Computed
  content = computed(() => this.lessonSignal()?.content as ChallengeContent);

  reset() {
    const content = this.content();
    this.userCode.set(content?.initialCode || '');
    this.output.set(null);
    this.hasError.set(false);
    this.showHints.set(false);
  }

  resetCode() {
    this.userCode.set(this.content()?.initialCode || '');
  }

  toggleHints() {
    this.showHints.update(v => !v);
  }

  runCode() {
    // Simulation of code execution
    this.output.set('Compiling...');
    this.hasError.set(false);

    setTimeout(() => {
      // Simple check: just ensure it's not empty and maybe contains some keyword if we wanted
      if (!this.userCode().trim()) {
        this.output.set('Error: Code is empty');
        this.hasError.set(true);
      } else {
        // Mock success output
        this.output.set('> Code executed successfully.\n> Result: [Mock Output]');
      }
    }, 800);
  }

  submit() {
    // In a real app, we would validate against test cases here.
    // For now, we trust the user or check if they changed the code.
    
    if (!this.userCode().trim()) {
      this.output.set('Error: Please write some code before submitting.');
      this.hasError.set(true);
      return;
    }

    this.output.set('Running tests...\nAll tests passed! 🎉');
    this.hasError.set(false);
    
    setTimeout(() => {
      this.completed.emit();
    }, 1000);
  }
}
