import { Component, ChangeDetectionStrategy, inject, signal, OnInit, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserDataService, ToolData } from '../../services/user-data.service';
import { ToolDataStateService } from '../../services/tool-data-state.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private userDataService = inject(UserDataService);
  private toolDataStateService = inject(ToolDataStateService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  loading = signal(true);
  allData = signal<ToolData[]>([]);

  toolIdToNameMap: Record<string, string> = {
    'json-formatter': 'Formatador JSON',
    'cron-generator': 'Gerador CRON',
  };

  toolIdToPathMap: Record<string, string> = {
    'json-formatter': '/tools/formatador-json',
    'cron-generator': '/tools/gerador-cron',
  };

  groupedData = computed(() => {
    const groups: Record<string, ToolData[]> = {};
    for (const item of this.allData()) {
      if (!groups[item.tool_id]) {
        groups[item.tool_id] = [];
      }
      groups[item.tool_id].push(item);
    }
    return Object.entries(groups);
  });

  async ngOnInit() {
    if (!this.currentUser()) {
      this.router.navigate(['/login']);
      return;
    }
    await this.fetchData();
  }

  private async fetchData() {
    this.loading.set(true);
    const data = await this.userDataService.getAllSavedData();
    this.allData.set(data);
    this.loading.set(false);
  }

  async deleteItem(id: string) {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      try {
        await this.userDataService.deleteData(id);
        this.allData.update(data => data.filter(item => item.id !== id));
      } catch (e) {
        console.error(e);
        alert('Falha ao excluir o item.');
      }
    }
  }

  loadItem(item: ToolData) {
    const path = this.toolIdToPathMap[item.tool_id];
    if (!path) {
      alert('Não foi possível encontrar a ferramenta associada.');
      return;
    }
    this.toolDataStateService.setDataForLoad({ toolId: item.tool_id, data: item.data });
    this.router.navigate([path]);
  }

  getToolName(toolId: string): string {
    return this.toolIdToNameMap[toolId] || toolId;
  }
}