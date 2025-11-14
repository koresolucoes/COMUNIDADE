import { Component, ChangeDetectionStrategy, signal, computed, input, effect, WritableSignal, Signal, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodeUsageTipsComponent } from '../../shared/code-usage-tips/code-usage-tips.component';
import { AuthService } from '../../../services/auth.service';
import { UserDataService } from '../../../services/user-data.service';
import { ToolDataStateService } from '../../../services/tool-data-state.service';
import { RouterLink } from '@angular/router';

type SelectionType = 'every' | 'each' | 'range' | 'list';

@Component({
  selector: 'app-cron-generator',
  standalone: true,
  imports: [FormsModule, CodeUsageTipsComponent, RouterLink],
  templateUrl: './cron-generator.component.html',
  styleUrls: ['./cron-generator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CronGeneratorComponent implements OnInit {
  isEmbedded = input<boolean>(false);
  
  private authService = inject(AuthService);
  private userDataService = inject(UserDataService);
  private toolDataStateService = inject(ToolDataStateService);
  currentUser = this.authService.currentUser;

  // --- Main State ---
  isAdvancedMode = signal(false);
  cronExpressionInput = signal('* * * * *');

  minute = signal('*');
  hour = signal('*');
  dayOfMonth = signal('*');
  month = signal('*');
  dayOfWeek = signal('*');

  // --- UI State for Simple Mode ---
  minuteSelectionType = signal<SelectionType>('every');
  minuteEachValue = signal(15);
  minuteRangeStart = signal(0);
  minuteRangeEnd = signal(30);
  minuteListValue = signal('0');
  minuteListError = signal<string|null>(null);

  hourSelectionType = signal<SelectionType>('every');
  hourEachValue = signal(2);
  hourRangeStart = signal(9);
  hourRangeEnd = signal(17);
  hourListValue = signal('0');
  hourListError = signal<string|null>(null);

  dayOfMonthSelectionType = signal<SelectionType>('every');
  dayOfMonthEachValue = signal(1);
  dayOfMonthRangeStart = signal(1);
  dayOfMonthRangeEnd = signal(15);
  dayOfMonthListValue = signal('1,15');
  dayOfMonthListError = signal<string|null>(null);

  monthSelectionType = signal<SelectionType>('every');
  monthEachValue = signal(1);
  monthRangeStart = signal(1);
  monthRangeEnd = signal(6);
  monthListValue = signal('1,7');
  monthListError = signal<string|null>(null);

  dayOfWeekSelectionType = signal<SelectionType>('every');
  dayOfWeekEachValue = signal(1);
  dayOfWeekRangeStart = signal(1); // Monday
  dayOfWeekRangeEnd = signal(5);   // Friday
  dayOfWeekListValue = signal('1-5');
  dayOfWeekListError = signal<string|null>(null);


  // --- Options for Selects ---
  minuteOptions = Array.from({ length: 60 }, (_, i) => i);
  hourOptions = Array.from({ length: 24 }, (_, i) => i);
  dayOfMonthOptions = Array.from({ length: 31 }, (_, i) => i + 1);
  monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  dayOfWeekOptions = Array.from({ length: 7 }, (_, i) => i);
  dayOfWeekNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  private fieldSignalMap = {
    minute: { type: this.minuteSelectionType, each: this.minuteEachValue, rangeStart: this.minuteRangeStart, rangeEnd: this.minuteRangeEnd, list: this.minuteListValue },
    hour: { type: this.hourSelectionType, each: this.hourEachValue, rangeStart: this.hourRangeStart, rangeEnd: this.hourRangeEnd, list: this.hourListValue },
    dayOfMonth: { type: this.dayOfMonthSelectionType, each: this.dayOfMonthEachValue, rangeStart: this.dayOfMonthRangeStart, rangeEnd: this.dayOfMonthRangeEnd, list: this.dayOfMonthListValue },
    month: { type: this.monthSelectionType, each: this.monthEachValue, rangeStart: this.monthRangeStart, rangeEnd: this.monthRangeEnd, list: this.monthListValue },
    dayOfWeek: { type: this.dayOfWeekSelectionType, each: this.dayOfWeekEachValue, rangeStart: this.dayOfWeekRangeStart, rangeEnd: this.dayOfWeekRangeEnd, list: this.dayOfWeekListValue },
  };

  constructor() {
    effect(() => this.updateCronPartFromUiState(this.minuteSelectionType(), this.minute, this.minuteEachValue(), {start: this.minuteRangeStart(), end: this.minuteRangeEnd()}, this.minuteListValue(), this.minuteListError));
    effect(() => this.updateCronPartFromUiState(this.hourSelectionType(), this.hour, this.hourEachValue(), {start: this.hourRangeStart(), end: this.hourRangeEnd()}, this.hourListValue(), this.hourListError));
    effect(() => this.updateCronPartFromUiState(this.dayOfMonthSelectionType(), this.dayOfMonth, this.dayOfMonthEachValue(), {start: this.dayOfMonthRangeStart(), end: this.dayOfMonthRangeEnd()}, this.dayOfMonthListValue(), this.dayOfMonthListError));
    effect(() => this.updateCronPartFromUiState(this.monthSelectionType(), this.month, this.monthEachValue(), {start: this.monthRangeStart(), end: this.monthRangeEnd()}, this.monthListValue(), this.monthListError));
    effect(() => this.updateCronPartFromUiState(this.dayOfWeekSelectionType(), this.dayOfWeek, this.dayOfWeekEachValue(), {start: this.dayOfWeekRangeStart(), end: this.dayOfWeekRangeEnd()}, this.dayOfWeekListValue(), this.dayOfWeekListError));
  
    // Validation effects
    effect(() => this.minuteListError.set(this.validateCronListValue(this.minuteListValue(), 0, 59, 'Minuto')));
    effect(() => this.hourListError.set(this.validateCronListValue(this.hourListValue(), 0, 23, 'Hora')));
    effect(() => this.dayOfMonthListError.set(this.validateCronListValue(this.dayOfMonthListValue(), 1, 31, 'Dia do Mês')));
    effect(() => this.monthListError.set(this.validateCronListValue(this.monthListValue(), 1, 12, 'Mês')));
    effect(() => this.dayOfWeekListError.set(this.validateCronListValue(this.dayOfWeekListValue(), 0, 6, 'Dia da Semana')));
  }
  
  ngOnInit(): void {
      const dataToLoad = this.toolDataStateService.consumeData();
      if (dataToLoad && dataToLoad.toolId === 'cron-generator') {
        this.loadState(dataToLoad.data);
      }
  }

  private updateCronPartFromUiState(type: SelectionType, signal: WritableSignal<string>, eachValue: number, rangeValue: {start: number, end: number}, listValue: string, errorSignal?: Signal<string|null>) {
    switch (type) {
      case 'every': signal.set('*'); break;
      case 'each': signal.set(`*/${eachValue}`); break;
      case 'range': signal.set(`${rangeValue.start}-${rangeValue.end}`); break;
      case 'list': 
        if (errorSignal?.()) {
            signal.set('?');
        } else {
            signal.set(listValue.trim() || '*');
        }
        break;
    }
  }

  // --- Computed Signals ---

  cronString = computed(() => {
    if (this.isAdvancedMode()) {
      return this.cronExpressionInput();
    }
    return `${this.minute()} ${this.hour()} ${this.dayOfMonth()} ${this.month()} ${this.dayOfWeek()}`;
  });

  explanation = computed(() => {
    try {
      const cron = this.cronString().trim();
      if (cron.includes('?')) {
        return 'Expressão inválida. Corrija os campos com erro.';
      }

      const parts = cron.split(/\s+/);
      if (parts.length !== 5) {
        return 'Expressão inválida. Requer 5 partes separadas por espaço.';
      }
      const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

      if (cron === '* * * * *') return 'Executa a cada minuto.';
      if (cron === '0 0 * * *') return 'Executa à meia-noite, todos os dias.';

      const dowNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const monthNamesForExplanation = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

      const timeDesc = this.getTimeDescription(minute, hour);
      const dayDesc = this.getDayDescription(dayOfMonth, dayOfWeek, dowNames);
      const monthDesc = this.getMonthDescription(month, monthNamesForExplanation);

      const sentenceParts = ['Executa', timeDesc];
      if (dayDesc) sentenceParts.push(dayDesc);
      if (monthDesc) sentenceParts.push(monthDesc);
      
      return sentenceParts.filter(p => p).join(', ') + '.';

    } catch (e) {
      return 'Descrição indisponível para esta expressão.';
    }
  });

  pythonSnippet = computed(() => `
# Requer: pip install croniter
from croniter import croniter
import datetime

cron_expression = "${this.cronString()}"
base_time = datetime.datetime.now()

# Cria um iterador a partir da expressão e da data atual
iterator = croniter(cron_expression, base_time)

# Obtém a próxima data/hora de execução
next_run = iterator.get_next(datetime.datetime)
print(f"A expressão '{cron_expression}' será executada em: {next_run}")

# Obtém as 5 próximas execuções
print("\\nPróximas 5 execuções:")
for i in range(5):
    print(iterator.get_next(datetime.datetime))
`);

  javascriptSnippet = computed(() => `
// Requer: npm install node-cron
const cron = require('node-cron');

const cronExpression = '${this.cronString()}';

// Valida a expressão CRON
if (cron.validate(cronExpression)) {
  console.log(\`Agendando tarefa com a expressão: \${cronExpression}\`);

  // Agenda a tarefa
  cron.schedule(cronExpression, () => {
    console.log('Executando a tarefa agendada...');
    // Coloque o código da sua tarefa aqui
  }, {
    scheduled: true,
    timezone: "America/Sao_Paulo" // Opcional: Especifique o fuso horário
  });

} else {
  console.error('Expressão CRON inválida.');
}
`);
  
  // --- Methods ---

  toggleMode() {
    const willBeAdvanced = !this.isAdvancedMode();
    this.isAdvancedMode.set(willBeAdvanced);

    if (willBeAdvanced) {
      const simpleCron = `${this.minute()} ${this.hour()} ${this.dayOfMonth()} ${this.month()} ${this.dayOfWeek()}`;
      this.cronExpressionInput.set(simpleCron);
    } else {
      const parts = this.cronExpressionInput().trim().split(/\s+/);
      if (parts.length === 5) {
        this.parseAndSetField('minute', parts[0]);
        this.parseAndSetField('hour', parts[1]);
        this.parseAndSetField('dayOfMonth', parts[2]);
        this.parseAndSetField('month', parts[3]);
        this.parseAndSetField('dayOfWeek', parts[4]);
      } else {
        this.fieldSignalMap.minute.type.set('every');
        this.fieldSignalMap.hour.type.set('every');
        this.fieldSignalMap.dayOfMonth.type.set('every');
        this.fieldSignalMap.month.type.set('every');
        this.fieldSignalMap.dayOfWeek.type.set('every');
      }
    }
  }

  private parseAndSetField(fieldName: keyof typeof this.fieldSignalMap, value: string) {
    const signals = this.fieldSignalMap[fieldName];
    if (value === '*') {
      signals.type.set('every');
    } else if (value.startsWith('*/') && !value.includes(',') && !value.includes('-')) {
      signals.type.set('each');
      signals.each.set(parseInt(value.substring(2)) || 1);
    } else if (/^\d+-\d+$/.test(value)) {
      signals.type.set('range');
      const [start, end] = value.split('-').map(Number);
      signals.rangeStart.set(start);
      signals.rangeEnd.set(end);
    } else {
      signals.type.set('list');
      signals.list.set(value);
    }
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.cronString());
  }

  copyCodeSnippet(content: string) {
    navigator.clipboard.writeText(content);
  }

  async saveData() {
    if (!this.currentUser()) {
      alert('Você precisa estar logado para salvar.');
      return;
    }
    const title = prompt('Digite um nome para salvar esta configuração CRON:', `Config ${new Date().toLocaleDateString()}`);
    if (title) {
      const state = {
        isAdvancedMode: this.isAdvancedMode(),
        cronExpressionInput: this.cronExpressionInput(),
        minuteSelectionType: this.minuteSelectionType(),
        minuteEachValue: this.minuteEachValue(),
        minuteRangeStart: this.minuteRangeStart(),
        minuteRangeEnd: this.minuteRangeEnd(),
        minuteListValue: this.minuteListValue(),
        hourSelectionType: this.hourSelectionType(),
        hourEachValue: this.hourEachValue(),
        hourRangeStart: this.hourRangeStart(),
        hourRangeEnd: this.hourRangeEnd(),
        hourListValue: this.hourListValue(),
        dayOfMonthSelectionType: this.dayOfMonthSelectionType(),
        dayOfMonthEachValue: this.dayOfMonthEachValue(),
        dayOfMonthRangeStart: this.dayOfMonthRangeStart(),
        dayOfMonthRangeEnd: this.dayOfMonthRangeEnd(),
        dayOfMonthListValue: this.dayOfMonthListValue(),
        monthSelectionType: this.monthSelectionType(),
        monthEachValue: this.monthEachValue(),
        monthRangeStart: this.monthRangeStart(),
        monthRangeEnd: this.monthRangeEnd(),
        monthListValue: this.monthListValue(),
        dayOfWeekSelectionType: this.dayOfWeekSelectionType(),
        dayOfWeekEachValue: this.dayOfWeekEachValue(),
        dayOfWeekRangeStart: this.dayOfWeekRangeStart(),
        dayOfWeekRangeEnd: this.dayOfWeekRangeEnd(),
        dayOfWeekListValue: this.dayOfWeekListValue(),
      };
      try {
        await this.userDataService.saveData('cron-generator', title, state);
        alert('Configuração CRON salva com sucesso!');
      } catch (e) {
        console.error(e);
        alert('Falha ao salvar a configuração.');
      }
    }
  }

  private loadState(state: any) {
    if (!state) return;
    this.isAdvancedMode.set(state.isAdvancedMode ?? false);
    this.cronExpressionInput.set(state.cronExpressionInput ?? '* * * * *');
    this.minuteSelectionType.set(state.minuteSelectionType ?? 'every');
    this.minuteEachValue.set(state.minuteEachValue ?? 15);
    this.minuteRangeStart.set(state.minuteRangeStart ?? 0);
    this.minuteRangeEnd.set(state.minuteRangeEnd ?? 30);
    this.minuteListValue.set(state.minuteListValue ?? '0');
    this.hourSelectionType.set(state.hourSelectionType ?? 'every');
    this.hourEachValue.set(state.hourEachValue ?? 2);
    this.hourRangeStart.set(state.hourRangeStart ?? 9);
    this.hourRangeEnd.set(state.hourRangeEnd ?? 17);
    this.hourListValue.set(state.hourListValue ?? '0');
    this.dayOfMonthSelectionType.set(state.dayOfMonthSelectionType ?? 'every');
    this.dayOfMonthEachValue.set(state.dayOfMonthEachValue ?? 1);
    this.dayOfMonthRangeStart.set(state.dayOfMonthRangeStart ?? 1);
    this.dayOfMonthRangeEnd.set(state.dayOfMonthRangeEnd ?? 15);
    this.dayOfMonthListValue.set(state.dayOfMonthListValue ?? '1,15');
    this.monthSelectionType.set(state.monthSelectionType ?? 'every');
    this.monthEachValue.set(state.monthEachValue ?? 1);
    this.monthRangeStart.set(state.monthRangeStart ?? 1);
    this.monthRangeEnd.set(state.monthRangeEnd ?? 6);
    this.monthListValue.set(state.monthListValue ?? '1,7');
    this.dayOfWeekSelectionType.set(state.dayOfWeekSelectionType ?? 'every');
    this.dayOfWeekEachValue.set(state.dayOfWeekEachValue ?? 1);
    this.dayOfWeekRangeStart.set(state.dayOfWeekRangeStart ?? 1);
    this.dayOfWeekRangeEnd.set(state.dayOfWeekRangeEnd ?? 5);
    this.dayOfWeekListValue.set(state.dayOfWeekListValue ?? '1-5');
  }

  // --- Private Helpers for Explanation & Validation ---

  private validateCronListValue(value: string, min: number, max: number, fieldName: string): string | null {
    if (!value.trim()) return null;

    if (/[*?/]/.test(value)) {
        return `${fieldName}: Caracteres como *, ? ou / não são permitidos aqui.`;
    }
    if (/[^0-9,-]/.test(value)) {
        return `${fieldName}: Contém caracteres inválidos. Apenas números, vírgulas e hífens.`;
    }

    const parts = value.split(',');
    for (const part of parts) {
        if (!part.trim() && part !== '0') {
            return `${fieldName}: Vírgula dupla ou valor em branco encontrado.`;
        }
        if (part.includes('-')) {
            const range = part.split('-');
            if (range.length !== 2 || range.some(p => !p.trim())) {
                return `${fieldName}: Intervalo inválido: "${part}". Formato deve ser "inicio-fim".`;
            }
            const [startStr, endStr] = range;
            const start = parseInt(startStr, 10);
            const end = parseInt(endStr, 10);
            if (isNaN(start) || isNaN(end)) {
                return `${fieldName}: Intervalo contém valor não numérico: "${part}".`;
            }
            if (start < min || start > max || end < min || end > max) {
                 return `${fieldName}: Valor no intervalo fora do limite (${min}-${max}): "${part}".`;
            }
            if (start > end) {
                return `${fieldName}: Início do intervalo (${start}) maior que o fim (${end}): "${part}".`;
            }
        } else {
            const num = parseInt(part, 10);
            if (isNaN(num)) {
                return `${fieldName}: Valor não numérico encontrado: "${part}".`;
            }
            if (num < min || num > max) {
                return `${fieldName}: Valor fora do limite (${min}-${max}): "${part}".`;
            }
        }
    }
    return null;
  }

  private getTimeDescription(minute: string, hour: string): string {
    if (minute === '*' && hour === '*') return 'a cada minuto';
    if (minute !== '*' && hour !== '*' && !minute.match(/[\/*,-]/) && !hour.match(/[\/*,-]/)) {
      return `às ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
    }
    const minDesc = this.describePart(minute, 'minuto', 'minutos', 'no', 'aos');
    const hourDesc = this.describePart(hour, 'hora', 'horas', 'à', 'às');
    if (minDesc && hourDesc) return `${minDesc} e ${hourDesc}`;
    return minDesc || hourDesc || '';
  }

  private getDayDescription(dayOfMonth: string, dayOfWeek: string, dowNames: string[]): string | null {
    if (dayOfMonth === '*' && dayOfWeek === '*') return null;
    const domDesc = this.describePart(dayOfMonth, 'dia do mês', 'dias do mês', 'no', 'nos');
    const dowDesc = this.describePart(dayOfWeek, 'dia da semana', 'dias da semana', 'no', 'nos', dowNames);
    if (domDesc && dowDesc) return `${domDesc} e ${dowDesc}`;
    return domDesc || dowDesc;
  }

  private getMonthDescription(month: string, monthNames: string[]): string | null {
    if (month === '*') return null;
    return this.describePart(month, 'mês', 'meses', 'em', 'em', monthNames);
  }

  private describePart(value: string, single: string, plural: string, prep: string, prepPlural: string, names: string[] = []): string | null {
    if (value === '*') return null;

    const mapValue = (v: string): string => {
        if (!names.length) return v;
        const num = parseInt(v);
        if (isNaN(num)) return v;
        if (single.includes('semana')) return names[num] || v;
        if (single.includes('mês')) return names[num] || v;
        return v;
    };
    
    if (value.includes('/')) {
        const [base, step] = value.split('/');
        if (base === '*') return `a cada ${step} ${plural}`;
        const baseDesc = this.describePart(base, single, plural, prep, prepPlural, names);
        return `a cada ${step} ${plural} ${baseDesc}`;
    }
    if (value.includes(',')) {
        return `${plural} ${value.split(',').map(mapValue).join(', ')}`;
    }
    if (value.includes('-')) {
        const [start, end] = value.split('-');
        return `de ${mapValue(start)} a ${mapValue(end)}`;
    }
    return `${prep} ${single} ${mapValue(value)}`;
  }
}