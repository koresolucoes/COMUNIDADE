import { Component, ChangeDetectionStrategy, signal, inject, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MockDataService, DataType } from '../../../services/mock-data.service';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserDataService } from '../../../services/user-data.service';
import { ToolDataStateService } from '../../../services/tool-data-state.service';

interface SchemaField {
  id: number;
  key: string;
  type: string;
}

@Component({
  selector: 'app-mock-data-generator',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './mock-data-generator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MockDataGeneratorComponent implements OnInit {
  private mockDataService = inject(MockDataService);
  private authService = inject(AuthService);
  private userDataService = inject(UserDataService);
  private toolDataStateService = inject(ToolDataStateService);
  currentUser = this.authService.currentUser;
  
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

  ngOnInit(): void {
      const dataToLoad = this.toolDataStateService.consumeData();
      if (dataToLoad && dataToLoad.toolId === 'mock-data-generator') {
        this.loadState(dataToLoad.data);
      }
  }

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

  async saveData() {
    if (!this.currentUser()) {
      alert('Você precisa estar logado para salvar.');
      return;
    }
    const title = prompt('Digite um nome para salvar este schema:', `Schema - ${new Date().toLocaleDateString()}`);
    if (title) {
      const state = {
        schemaFields: this.schemaFields(),
        recordCount: this.recordCount(),
      };
      try {
        await this.userDataService.saveData('mock-data-generator', title, state);
        alert('Schema salvo com sucesso!');
      } catch (e) {
        console.error(e);
        alert('Falha ao salvar o schema.');
      }
    }
  }

  private loadState(state: any) {
    if (!state) return;
    this.schemaFields.set(state.schemaFields ?? [
      { id: 1, key: 'id', type: 'id.uuid' },
      { id: 2, key: 'name', type: 'person.fullName' },
      { id: 3, key: 'email', type: 'internet.email' },
    ]);
    this.recordCount.set(state.recordCount ?? 10);
    this.nextId = (this.schemaFields()?.length > 0 ? Math.max(...this.schemaFields().map(f => f.id)) : 0) + 1;
    this.generateData();
  }
}
