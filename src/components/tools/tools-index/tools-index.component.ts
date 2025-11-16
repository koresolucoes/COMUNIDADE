import { Component, ChangeDetectionStrategy, computed, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

interface Tool {
  name: string;
  description: string;
  link: string;
}

interface ToolCategory {
  name: string;
  icon: string;
  tools: Tool[];
}


@Component({
  selector: 'app-tools-index',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './tools-index.component.html',
  styleUrls: ['./tools-index.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolsIndexComponent implements OnInit {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;
  
  toolCategories: ToolCategory[] = [
    {
      name: 'Conversores & Codificadores',
      icon: 'swap_horiz',
      tools: [
        { name: 'Codificador / Decodificador de URL', description: 'Codifique ou decodifique textos para serem usados em URLs.', link: '/tools/url-codec' },
        { name: 'Codificador / Decodificador Base64', description: 'Codifique ou decodifique textos e arquivos para o formato Base64.', link: '/tools/base64-codec' },
        { name: 'Decodificador de JWT', description: 'Inspecione o conteúdo de um JSON Web Token (JWT).', link: '/tools/jwt-decoder' },
        { name: 'Conversor de Timestamp', description: 'Converta datas entre formato legível e Unix Timestamp.', link: '/tools/timestamp-converter' },
        { name: 'Conversor de Dados', description: 'Converta dados entre JSON, XML, CSV, YAML e outros formatos.', link: '/tools/data-converter' },
      ]
    },
    {
      name: 'Geradores & Utilitários',
      icon: 'smart_toy',
      tools: [
        { name: 'Gerador de Hash', description: 'Calcule hashes (MD5, SHA-256, SHA-512) de uma string.', link: '/tools/gerador-hash' },
        { name: 'Gerador de Senhas Seguras', description: 'Crie senhas fortes e aleatórias com opções personalizáveis.', link: '/tools/gerador-senha' },
        { name: 'Gerador de UUID (v4)', description: 'Gere um Identificador Único Universal (UUID) com um clique.', link: '/tools/gerador-uuid' },
        { name: 'Gerador de QR Code', description: 'Crie QR codes a partir de texto ou URLs com opções de personalização.', link: '/tools/gerador-qr-code' },
        { name: 'Gerador de Dados Falsos', description: 'Gere dados mock (JSON) para testar seus workflows e APIs.', link: '/tools/gerador-dados-falsos' },
      ]
    },
    {
      name: 'Texto & Regex',
      icon: 'text_fields',
      tools: [
        { name: 'Formatador de JSON', description: 'Valide, formate e minifique seu código JSON.', link: '/tools/formatador-json' },
        { name: 'Comparador de Texto (Diff)', description: 'Compare dois blocos de texto ou código e destaque as diferenças.', link: '/tools/comparador-texto' },
        { name: 'Testador de Regex', description: 'Valide expressões regulares e visualize matches e grupos em tempo real.', link: '/tools/testador-regex' },
      ]
    },
    {
      name: 'Rede & Infra',
      icon: 'public',
      tools: [
        { name: 'Qual é o meu IP?', description: 'Mostra seu IP público e as informações do seu navegador (User-Agent).', link: '/tools/meu-ip' },
        { name: 'Cliente REST (Mini-Postman)', description: 'Faça requisições HTTP (GET, POST, etc) para uma URL e inspecione a resposta.', link: '/tools/cliente-rest' },
        { name: 'Verificador de DNS', description: 'Veja os registros DNS (A, CNAME, MX, TXT) de qualquer domínio.', link: '/tools/verificador-dns' },
        { name: 'Verificador de Certificado SSL', description: 'Inspecione os detalhes do certificado SSL/TLS de um domínio.', link: '/tools/verificador-ssl' },
        { name: 'Testador de Webhook', description: 'Receba e inspecione payloads de webhooks em tempo real.', link: '/tools/webhook-tester' },
      ]
    },
    {
      name: 'Automação & DevOps',
      icon: 'lan',
      tools: [
        { name: 'Gerador de CRON', description: 'Crie expressões CRON de forma visual e intuitiva.', link: '/tools/gerador-cron' },
        { name: 'Construtor Docker-Compose', description: 'Crie arquivos docker-compose.yml visualmente com templates para serviços populares.', link: '/tools/docker-compose-generator' },
        { name: 'Simulador de Expressão n8n', description: 'Teste expressões n8n em um ambiente com dados mockados.', link: '/tools/n8n-expression-simulator' },
        { name: 'Gerenciador n8n', description: 'Conecte-se à sua instância n8n para gerenciar workflows e execuções.', link: '/tools/gerenciador-n8n' },
      ]
    },
    {
      name: 'Geradores CSS',
      icon: 'palette',
      tools: [
        { name: 'Gerador de Box Shadow', description: 'Crie sombras complexas (múltiplas camadas, inset) com uma interface visual.', link: '/tools/gerador-box-shadow' },
        { name: 'Gerador de Gradiente CSS', description: 'Crie gradientes lineares ou radiais e copie o código CSS final.', link: '/tools/gerador-gradiente-css' },
        { name: 'Gerador de Clip-Path', description: 'Crie formas de mascaramento (círculo, polígono) visualmente.', link: '/tools/gerador-clip-path' },
        { name: 'Construtor de Grid CSS', description: 'Desenhe layouts de grid visualmente e gere o código CSS correspondente.', link: '/tools/construtor-grid-css' },
        { name: 'Gerador de Filtros CSS', description: 'Aplique e combine filtros (blur, brilho, contraste) em uma imagem de exemplo.', link: '/tools/gerador-filtros-css' },
        { name: 'Gerador de Animação CSS', description: 'Use animações pré-construídas e copie os @keyframes e a classe CSS.', link: '/tools/gerador-animacao-css' }
      ]
    }
  ];
  
  ngOnInit() {
    if (this.currentUser()) {
      this.authService.fetchProfile(this.currentUser()!.id);
    }
  }

  // --- Favorite Tools Logic ---
  favoriteToolLinks = computed(() => this.authService.currentUserProfile()?.favorite_tools ?? []);

  private allToolsMap = computed(() => {
    const map = new Map<string, Tool>();
    for (const category of this.toolCategories) {
      for (const tool of category.tools) {
        map.set(tool.link, tool);
      }
    }
    return map;
  });

  favoriteTools = computed(() => {
    const map = this.allToolsMap();
    return this.favoriteToolLinks().map(link => map.get(link)).filter((t): t is Tool => !!t);
  });

  isFavorite(toolLink: string): boolean {
    return this.favoriteToolLinks().includes(toolLink);
  }

  async toggleFavorite(toolLink: string) {
    if (!this.currentUser()) return;
    const currentFavorites = this.favoriteToolLinks();
    const isCurrentlyFavorite = currentFavorites.includes(toolLink);
    
    const newFavorites = isCurrentlyFavorite
      ? currentFavorites.filter(link => link !== toolLink)
      : [...currentFavorites, toolLink];

    try {
      await this.authService.updateFavoriteTools(newFavorites);
    } catch (e) {
      console.error("Failed to update favorites", e);
    }
  }
  
  filteredToolCategories = computed(() => {
    if (!this.currentUser()) {
      return this.toolCategories;
    }
    const favoriteLinks = new Set(this.favoriteToolLinks());
    if (favoriteLinks.size === 0) {
      return this.toolCategories;
    }
    return this.toolCategories.map(category => ({
      ...category,
      tools: category.tools.filter(tool => !favoriteLinks.has(tool.link))
    })).filter(category => category.tools.length > 0);
  });

  // --- Drag and Drop Logic ---
  draggedToolLink = signal<string | null>(null);

  onDragStart(event: DragEvent, toolLink: string) {
    this.draggedToolLink.set(toolLink);
    if(event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', toolLink);
    }
    (event.currentTarget as HTMLElement).classList.add('dragging');
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    const target = (event.currentTarget as HTMLElement);
    if (target.classList.contains('drop-zone')) {
      target.classList.add('drag-over');
    }
  }

  onDragLeave(event: DragEvent) {
    (event.currentTarget as HTMLElement).classList.remove('drag-over');
  }

  onDrop(event: DragEvent, targetToolLink: string) {
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.remove('drag-over');

    const draggedLink = this.draggedToolLink();
    if (!draggedLink || draggedLink === targetToolLink) {
        return;
    }

    const currentFavorites = [...this.favoriteToolLinks()];
    const draggedIndex = currentFavorites.indexOf(draggedLink);
    const targetIndex = currentFavorites.indexOf(targetToolLink);

    if (draggedIndex > -1 && targetIndex > -1) {
        const [removed] = currentFavorites.splice(draggedIndex, 1);
        currentFavorites.splice(targetIndex, 0, removed);
        
        this.authService.updateFavoriteTools(currentFavorites).catch(err => {
            console.error("Failed to reorder favorites", err);
        });
    }

    this.draggedToolLink.set(null);
  }

  onDragEnd(event: DragEvent) {
    const target = event.currentTarget as HTMLElement;
    target?.classList.remove('dragging');
    // Clean up all drag-over classes just in case
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    this.draggedToolLink.set(null);
  }
}