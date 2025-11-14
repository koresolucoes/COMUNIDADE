import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodeUsageTipsComponent } from '../../shared/code-usage-tips/code-usage-tips.component';

@Component({
  selector: 'app-timestamp-converter',
  standalone: true,
  imports: [FormsModule, CodeUsageTipsComponent],
  templateUrl: './timestamp-converter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimestampConverterComponent {
  // The source of truth is the timestamp in seconds.
  timestamp = signal<number>(Math.floor(Date.now() / 1000));

  pythonSnippet = computed(() => `
import datetime
import time

# --- De Timestamp para Objeto Datetime ---
unix_timestamp = ${this.timestamp()}
# Converte o timestamp para um objeto datetime (UTC)
dt_object_utc = datetime.datetime.fromtimestamp(unix_timestamp, tz=datetime.timezone.utc)
# Converte para o fuso horário local do sistema
dt_object_local = dt_object_utc.astimezone()

print(f"Timestamp: {unix_timestamp}")
print(f"Data (UTC): {dt_object_utc.strftime('%Y-%m-%d %H:%M:%S %Z')}")
print(f"Data (Local): {dt_object_local.strftime('%Y-%m-%d %H:%M:%S %Z')}")

# --- De Objeto Datetime para Timestamp ---
now = datetime.datetime.now()
# .timestamp() retorna um float, use int() para um timestamp Unix padrão
current_timestamp = int(now.timestamp())

print(f"\\nData atual: {now}")
print(f"Timestamp atual: {current_timestamp}")

# Usando o módulo time para obter o timestamp atual (mais direto)
print(f"Timestamp atual (com time.time()): {int(time.time())}")
`);
  
  javascriptSnippet = computed(() => `
// --- De Timestamp para Objeto Date ---
// O construtor do Date espera milissegundos, então multiplicamos por 1000.
const unixTimestamp = ${this.timestamp()};
const dateObject = new Date(unixTimestamp * 1000);

console.log(\`Timestamp: \${unixTimestamp}\`);
// .toUTCString() exibe a data no fuso horário UTC
console.log(\`Data (UTC): \${dateObject.toUTCString()}\`);
// .toLocaleString() exibe a data no fuso horário do sistema/navegador
console.log(\`Data (Local): \${dateObject.toLocaleString('pt-BR')}\`);
// .toISOString() é um formato padrão muito usado em APIs
console.log(\`Data (ISO 8601): \${dateObject.toISOString()}\`);

// --- De Objeto Date para Timestamp ---
const now = new Date();
// getTime() retorna milissegundos, então dividimos por 1000 e arredondamos.
const currentTimestamp = Math.floor(now.getTime() / 1000);

console.log(\`\\nData atual: \${now}\`);
console.log(\`Timestamp atual: \${currentTimestamp}\`);

// Usando Date.now() (mais direto)
console.log(\`Timestamp atual (com Date.now()): \${Math.floor(Date.now() / 1000)}\`);
`);

  // Computed values derived from the timestamp.
  dateObject = computed(() => {
    const ts = this.timestamp();
    if (isNaN(ts)) return null;
    return new Date(ts * 1000);
  });

  utcString = computed(() => this.dateObject()?.toUTCString() ?? 'Inválido');
  localString = computed(() => this.dateObject()?.toLocaleString() ?? 'Inválido');
  isoString = computed(() => this.dateObject()?.toISOString() ?? 'Inválido');
  relativeTimeString = computed(() => {
      const date = this.dateObject();
      if (!date) return 'Inválido';
      
      const now = new Date();
      const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
      const minutes = Math.round(seconds / 60);
      const hours = Math.round(minutes / 60);
      const days = Math.round(hours / 24);

      if (Math.abs(seconds) < 45) return 'agora mesmo';
      
      const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

      if (Math.abs(days) > 0) return rtf.format(days, 'day');
      if (Math.abs(hours) > 0) return rtf.format(hours, 'hour');
      if (Math.abs(minutes) > 0) return rtf.format(minutes, 'minute');
      return rtf.format(seconds, 'second');
  });


  onTimestampChange(value: string) {
    const newTimestamp = parseInt(value, 10);
    if (!isNaN(newTimestamp)) {
      this.timestamp.set(newTimestamp);
    }
  }

  onDateChange(value: string) {
    const newDate = new Date(value);
    if (!isNaN(newDate.getTime())) {
      this.timestamp.set(Math.floor(newDate.getTime() / 1000));
    }
  }

  setCurrentTime() {
    this.timestamp.set(Math.floor(Date.now() / 1000));
  }
  
  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  // This is for the datetime-local input, which needs a specific format.
  getDateTimeLocalValue(): string {
    const date = this.dateObject();
    if (!date) return '';
    
    // Adjust for timezone offset to display correctly in local time
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);
    return localDate.toISOString().slice(0, 16);
  }

  copyCodeSnippet(content: string) {
    navigator.clipboard.writeText(content);
  }
}
