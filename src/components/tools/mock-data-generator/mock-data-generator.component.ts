import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MockDataService, DataType } from '../../../services/mock-data.service';

interface SchemaField {
  id: number;
  key: string;
  type: string;
}

@Component({
  selector: 'app-mock-data-generator',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './mock-data-generator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MockDataGeneratorComponent {
  private mockDataService = inject(MockDataService);
  
  schemaFields = signal<SchemaField[]>([
    { id: 1, key: 'id', type: 'id.uuid' },
    { id: 2, key: 'name', type: 'person.fullName' },
    { id: 3, key: 'email', type: 'internet.email' },
  ]);
  recordCount = signal(10);
  generatedJson = signal('');
  copyButtonText = signal('Copiar');
  
  availableDataTypes = this.mockDataService.dataTypes;
  
  groupedDataTypes = computed(() => {
    const groups: { [key: string]: DataType[] } = {};
    for (const type of this.availableDataTypes) {
      if (!groups[type.group]) {
        groups[type.group] = [];
      }
      groups[type.group].push(type);
    }
    return Object.entries(groups);
  });
  
  private nextId = 4;

  addField() {
    this.schemaFields.update(fields => [
      ...fields,
      { id: this.nextId++, key: '', type: 'word.random' }
    ]);
  }

  removeField(idToRemove: number) {
    this.schemaFields.update(fields => fields.filter(f => f.id !== idToRemove));
  }

  updateField(id: number, part: 'key' | 'type', value: string) {
    this.schemaFields.update(fields => fields.map(f => 
      f.id === id ? { ...f, [part]: value } : f
    ));
  }
  
  generateData() {
    if (this.recordCount() <= 0) {
        this.generatedJson.set('[]');
        return;
    }
    
    const records = [];
    for (let i = 0; i < this.recordCount(); i++) {
      const record: { [key: string]: any } = {};
      for (const field of this.schemaFields()) {
        if (field.key.trim()) {
          record[field.key.trim()] = this.mockDataService.generate(field.type);
        }
      }
      records.push(record);
    }
    this.generatedJson.set(JSON.stringify(records, null, 2));
  }

  copyToClipboard() {
    if (!this.generatedJson()) return;
    navigator.clipboard.writeText(this.generatedJson()).then(() => {
      this.copyButtonText.set('Copiado!');
      setTimeout(() => this.copyButtonText.set('Copiar'), 2000);
    });
  }
}
