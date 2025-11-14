import { Component, ChangeDetectionStrategy, signal, computed, effect, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SafeHtmlPipe } from '../../../pipes/safe-html.pipe';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserDataService } from '../../../services/user-data.service';
import { ToolDataStateService } from '../../../services/tool-data-state.service';

interface RegexMatch {
  value: string;
  index: number;
  groups: string[];
}

export interface BuilderStep {
  id: number;
  type: 'text' | 'charClass' | 'anchor';
  quantifier: 'once' | 'optional' | 'zeroOrMore' | 'oneOrMore' | 'exact' | 'range';
  params: {
    textValue?: string;
    charClass?: string;
    anchorType?: 'start' | 'end';
    quantifierValue1?: number;
    quantifierValue2?: number;
  };
}

@Component({
  selector: 'app-regex-tester',
  standalone: true,
  imports: [FormsModule, SafeHtmlPipe, RouterLink],
  templateUrl: './regex-tester.component.html',
  styleUrls: ['./regex-tester.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegexTesterComponent implements OnInit {
  private authService = inject(AuthService);
  private userDataService = inject(UserDataService);
  private toolDataStateService = inject(ToolDataStateService);
  currentUser = this.authService.currentUser;
  
  // --- Main state ---
  regexPattern = signal('');
  regexFlags = signal('g');
  testString = signal('O pedido P-12345 foi enviado. Contato: email@kore.com.br. CPF: 123.456.789-00.');
  
  // --- Builder State ---
  mode = signal<'builder' | 'tester'>('builder');
  builderMode = signal<'common' | 'custom'>('common');
  selectedCommonPattern = signal<string>('email');
  builderSteps = signal<BuilderStep[]>([]);
  private nextStepId = 1;

  commonPatterns = new Map<string, { regex: string, explanation: string }>([
    ['email', { regex: `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}`, explanation: 'Corresponde a um endereço de e-mail padrão.' }],
    ['url', { regex: `https?://(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)`, explanation: 'Corresponde a uma URL HTTP ou HTTPS.' }],
    ['ip', { regex: `((25[0-5]|(2[0-4]|1\\d|[1-9]|)\\d)\\.){3}(25[0-5]|(2[0-4]|1\\d|[1-9]|)\\d)`, explanation: 'Corresponde a um endereço de IP (IPv4).' }],
    ['brPhone', { regex: `(?:\\(?([1-9][0-9])\\)?\\s?)?(9\\d{4})-?(\\d{4})`, explanation: 'Corresponde a um número de celular brasileiro com ou sem DDD.' }],
    ['cpf', { regex: `\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}`, explanation: 'Corresponde a um CPF no formato xxx.xxx.xxx-xx.' }],
    ['cnpj', { regex: `\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}`, explanation: 'Corresponde a um CNPJ no formato xx.xxx.xxx/xxxx-xx.' }],
    ['date', { regex: `(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/\\d{4}`, explanation: 'Corresponde a uma data no formato dd/mm/aaaa.' }],
  ]);

  charClasses = [
    { id: 'any', name: 'Qualquer Caractere (.)', regex: '.' },
    { id: 'digit', name: 'Um Número (\\d)', regex: '\\d' },
    { id: 'word', name: 'Uma Letra/Número (\\w)', regex: '\\w' },
    { id: 'whitespace', name: 'Um Espaço em Branco (\\s)', regex: '\\s' },
    { id: 'nonDigit', name: 'Não-Número (\\D)', regex: '\\D' },
    { id: 'nonWord', name: 'Não-Letra/Número (\\W)', regex: '\\W' },
    { id: 'nonWhitespace', name: 'Não-Espaço (\\S)', regex: '\\S' },
  ];

  quantifiers = [
    { id: 'once', name: 'Uma vez' },
    { id: 'optional', name: 'Zero ou uma vez (?)' },
    { id: 'zeroOrMore', name: 'Zero ou mais vezes (*)' },
    { id: 'oneOrMore', name: 'Uma ou mais vezes (+)' },
    { id: 'exact', name: 'Exatamente X vezes' },
    { id: 'range', name: 'De X a Y vezes' },
  ];

  constructor() {
    effect(() => {
      if (this.mode() !== 'builder') return;
      this.regexPattern.set(this.generatedFromBuilder().regex);
    }, { allowSignalWrites: true });

    // Initialize with a default pattern
    this.regexPattern.set(this.commonPatterns.get('email')?.regex ?? '');
  }

  ngOnInit(): void {
      const dataToLoad = this.toolDataStateService.consumeData();
      if (dataToLoad && dataToLoad.toolId === 'regex-tester') {
        this.loadState(dataToLoad.data);
      }
  }

  // --- Computed properties ---

  result = computed(() => {
    // ... (rest of the logic remains the same)
    const pattern = this.regexPattern();
    const flags = this.regexFlags();
    const text = this.testString();

    if (!pattern) {
      return { error: 'A expressão regular não pode estar vazia.', matches: [] };
    }

    try {
      const regex = new RegExp(pattern, flags);
      const matches: RegexMatch[] = [];

      if (flags.includes('g')) {
        for (const match of text.matchAll(regex)) {
          matches.push({
            value: match[0],
            index: match.index ?? 0,
            groups: Array.from(match, String).slice(1),
          });
        }
      } else {
        const match = regex.exec(text);
        if (match) {
          matches.push({
            value: match[0],
            index: match.index,
            groups: Array.from(match, String).slice(1),
          });
        }
      }

      return { error: null, matches };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Expressão regular inválida.';
      return { error: message, matches: [] };
    }
  });

  highlightedText = computed(() => {
    const text = this.testString();
    const { matches, error } = this.result();

    if (error || matches.length === 0) {
      return this.escapeHtml(text);
    }

    let lastIndex = 0;
    let highlighted = '';

    matches.forEach(match => {
      highlighted += this.escapeHtml(text.substring(lastIndex, match.index));
      highlighted += `<mark class="highlight">${this.escapeHtml(match.value)}</mark>`;
      lastIndex = match.index + match.value.length;
    });

    highlighted += this.escapeHtml(text.substring(lastIndex));

    return highlighted;
  });

  generatedFromBuilder = computed(() => {
    if (this.builderMode() === 'common') {
      const pattern = this.commonPatterns.get(this.selectedCommonPattern());
      return {
        regex: pattern?.regex ?? '',
        explanation: pattern?.explanation ?? 'Selecione um padrão.',
      };
    }

    if (this.builderSteps().length === 0) {
      return { regex: '', explanation: 'Adicione um passo para começar a construir sua expressão.' };
    }

    let regex = '';
    let explanation = 'Corresponde a ';
    const explanations: string[] = [];

    for (const step of this.builderSteps()) {
      const { regexPart, explanationPart } = this.generatePartsForStep(step);
      regex += regexPart;
      explanations.push(explanationPart);
    }
    
    explanation += explanations.join(', seguido por ');
    explanation += '.';

    return { regex, explanation };
  });

  // --- Builder Methods ---
  
  addStep(type: BuilderStep['type']) {
    const newStep: BuilderStep = {
      id: this.nextStepId++,
      type: type,
      quantifier: 'once',
      params: {
        textValue: type === 'text' ? 'texto' : undefined,
        charClass: type === 'charClass' ? 'digit' : undefined,
        anchorType: type === 'anchor' ? 'start' : undefined,
        quantifierValue1: 1,
        quantifierValue2: 1,
      },
    };
    this.builderSteps.update(steps => [...steps, newStep]);
  }

  removeStep(idToRemove: number) {
    this.builderSteps.update(steps => steps.filter(s => s.id !== idToRemove));
  }
  
  updateStep(id: number, newValues: Partial<BuilderStep['params'] & {quantifier?: string}>) {
    this.builderSteps.update(steps => steps.map(s => {
      if (s.id === id) {
        return {
            ...s,
            quantifier: newValues.quantifier ? newValues.quantifier as BuilderStep['quantifier'] : s.quantifier,
            params: { ...s.params, ...newValues }
        };
      }
      return s;
    }));
  }

  private generatePartsForStep(step: BuilderStep): { regexPart: string, explanationPart: string } {
    let baseRegex = '';
    let baseExplanation = '';

    switch (step.type) {
      case 'text':
        baseRegex = this.escapeRegex(step.params.textValue || '');
        baseExplanation = `o texto "${step.params.textValue || ''}"`;
        break;
      case 'charClass':
        const charClass = this.charClasses.find(c => c.id === step.params.charClass);
        baseRegex = charClass?.regex || '';
        baseExplanation = charClass?.name.toLowerCase() || '';
        break;
      case 'anchor':
        baseRegex = step.params.anchorType === 'start' ? '^' : '$';
        baseExplanation = step.params.anchorType === 'start' ? 'o início da linha' : 'o fim da linha';
        break;
    }

    if (step.type === 'anchor') {
      return { regexPart: baseRegex, explanationPart: baseExplanation };
    }

    const { quantifierRegex, quantifierExplanation } = this.getQuantifierParts(step);
    return {
      regexPart: `${baseRegex}${quantifierRegex}`,
      explanationPart: `${baseExplanation}${quantifierExplanation}`
    };
  }

  private getQuantifierParts(step: BuilderStep): { quantifierRegex: string, quantifierExplanation: string } {
    switch (step.quantifier) {
      case 'optional': return { quantifierRegex: '?', quantifierExplanation: ', opcionalmente' };
      case 'zeroOrMore': return { quantifierRegex: '*', quantifierExplanation: ', zero ou mais vezes' };
      case 'oneOrMore': return { quantifierRegex: '+', quantifierExplanation: ', uma ou mais vezes' };
      case 'exact': return { quantifierRegex: `{${step.params.quantifierValue1}}`, quantifierExplanation: `, exatamente ${step.params.quantifierValue1} vez(es)` };
      case 'range': return { quantifierRegex: `{${step.params.quantifierValue1},${step.params.quantifierValue2}}`, quantifierExplanation: `, de ${step.params.quantifierValue1} a ${step.params.quantifierValue2} vezes` };
      case 'once':
      default: return { quantifierRegex: '', quantifierExplanation: '' };
    }
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private escapeHtml(str: string): string {
    // ... (logic remains the same)
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  
  async saveData() {
    if (!this.currentUser()) {
      alert('Você precisa estar logado para salvar.');
      return;
    }
    const title = prompt('Digite um nome para salvar este Teste de Regex:', `Regex - ${new Date().toLocaleDateString()}`);
    if (title) {
      const state = {
        regexPattern: this.regexPattern(),
        regexFlags: this.regexFlags(),
        testString: this.testString(),
        mode: this.mode(),
        builderMode: this.builderMode(),
        selectedCommonPattern: this.selectedCommonPattern(),
        builderSteps: this.builderSteps(),
      };
      try {
        await this.userDataService.saveData('regex-tester', title, state);
        alert('Teste de Regex salvo com sucesso!');
      } catch (e) {
        console.error(e);
        alert('Falha ao salvar o teste.');
      }
    }
  }

  private loadState(state: any) {
    if (!state) return;
    this.regexPattern.set(state.regexPattern ?? '');
    this.regexFlags.set(state.regexFlags ?? 'g');
    this.testString.set(state.testString ?? '');
    this.mode.set(state.mode ?? 'builder');
    this.builderMode.set(state.builderMode ?? 'common');
    this.selectedCommonPattern.set(state.selectedCommonPattern ?? 'email');
    this.builderSteps.set(state.builderSteps ?? []);
  }
}
