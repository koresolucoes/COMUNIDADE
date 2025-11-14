import { Injectable } from '@angular/core';

export interface DataType {
  id: string;
  group: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  public readonly dataTypes: DataType[] = [
    { id: 'id.uuid', group: 'ID', name: 'UUID' },
    { id: 'person.firstName', group: 'Pessoa', name: 'Primeiro Nome' },
    { id: 'person.lastName', group: 'Pessoa', name: 'Último Nome' },
    { id: 'person.fullName', group: 'Pessoa', name: 'Nome Completo' },
    { id: 'internet.email', group: 'Internet', name: 'Email' },
    { id: 'internet.ip', group: 'Internet', name: 'Endereço IP' },
    { id: 'location.city', group: 'Localização', name: 'Cidade' },
    { id: 'location.country', group: 'Localização', name: 'País' },
    { id: 'company.name', group: 'Empresa', name: 'Nome da Empresa' },
    { id: 'company.jobTitle', group: 'Empresa', name: 'Cargo' },
    { id: 'word.random', group: 'Texto', name: 'Palavra Aleatória' },
    { id: 'number.int', group: 'Número', name: 'Inteiro Aleatório (1-100)' },
  ];

  private firstNames = ['Ana', 'Bruno', 'Carlos', 'Daniela', 'Eduardo', 'Fernanda', 'Gabriel', 'Helena', 'Igor', 'Juliana'];
  private lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes'];
  private cities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador', 'Fortaleza', 'Curitiba', 'Manaus', 'Recife'];
  private countries = ['Brasil', 'Portugal', 'Angola', 'Moçambique', 'Cabo Verde'];
  private companies = ['Soluções Acme', 'Tech Inova', 'Proativa Web', 'Conectados SA', 'Alpha Digital', 'Nexus TI'];
  private jobs = ['Engenheiro de Automação', 'Desenvolvedor', 'Analista de Sistemas', 'Gerente de Projetos', 'Designer', 'QA'];
  private words = ['protocolo', 'servidor', 'api', 'workflow', 'automação', 'gatilho', 'execução', 'nó', 'credencial', 'variável'];

  private pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  generate(type: string): any {
    switch(type) {
      case 'id.uuid': return crypto.randomUUID();
      case 'person.firstName': return this.pickRandom(this.firstNames);
      case 'person.lastName': return this.pickRandom(this.lastNames);
      case 'person.fullName': return `${this.pickRandom(this.firstNames)} ${this.pickRandom(this.lastNames)}`;
      case 'internet.email':
        const fn = this.pickRandom(this.firstNames).toLowerCase();
        const ln = this.pickRandom(this.lastNames).toLowerCase();
        return `${fn}.${ln}@example.com`;
      case 'internet.ip':
        return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      case 'location.city': return this.pickRandom(this.cities);
      case 'location.country': return this.pickRandom(this.countries);
      case 'company.name': return this.pickRandom(this.companies);
      case 'company.jobTitle': return this.pickRandom(this.jobs);
      case 'word.random': return this.pickRandom(this.words);
      case 'number.int': return Math.floor(Math.random() * 100) + 1;
      default: return null;
    }
  }
}
