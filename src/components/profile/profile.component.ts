import { Component, ChangeDetectionStrategy, inject, signal, OnInit, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, Profile } from '../../services/auth.service';
import { UserDataService, ToolData } from '../../services/user-data.service';
import { ToolDataStateService } from '../../services/tool-data-state.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private userDataService = inject(UserDataService);
  private toolDataStateService = inject(ToolDataStateService);
  private router = inject(Router);
  // Fix: Inject FormBuilder into a property to ensure proper type inference before use.
  private fb = inject(FormBuilder);

  currentUser = this.authService.currentUser;
  currentUserProfile = this.authService.currentUserProfile;
  
  loading = signal(true);
  profileLoading = signal(false);
  allData = signal<ToolData[]>([]);
  activeTab = signal<'profile' | 'data'>('profile');
  
  avatarFile = signal<File | null>(null);
  avatarPreview = signal<string | null>(null);
  profileMessage = signal<{type: 'success' | 'error', text: string} | null>(null);

  profileForm = this.fb.group({
    username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/), Validators.minLength(3)]],
    full_name: [''],
  });

  toolIdToNameMap: Record<string, string> = {
    'json-formatter': 'Formatador JSON',
    'cron-generator': 'Gerador CRON',
    'base64-codec': 'Codec Base64',
    'jwt-decoder': 'Decoder JWT',
    'timestamp-converter': 'Conversor Timestamp',
    'url-codec': 'Codec de URL',
    'hash-generator': 'Gerador de Hash',
    'password-generator': 'Gerador de Senhas',
    'regex-tester': 'Testador Regex',
    'mock-data-generator': 'Gerador de Dados Falsos',
    'diff-checker': 'Comparador de Texto',
    'data-converter': 'Conversor de Dados',
  };

  toolIdToPathMap: Record<string, string> = {
    'json-formatter': '/tools/formatador-json',
    'cron-generator': '/tools/gerador-cron',
    'base64-codec': '/tools/base64-codec',
    'jwt-decoder': '/tools/jwt-decoder',
    'timestamp-converter': '/tools/timestamp-converter',
    'url-codec': '/tools/url-codec',
    'hash-generator': '/tools/gerador-hash',
    'password-generator': '/tools/gerador-senha',
    'regex-tester': '/tools/testador-regex',
    'mock-data-generator': '/tools/gerador-dados-falsos',
    'diff-checker': '/tools/comparador-texto',
    'data-converter': '/tools/data-converter',
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

  constructor() {
    effect(() => {
      const profile = this.currentUserProfile();
      if (profile) {
        this.profileForm.patchValue({
          username: profile.username,
          full_name: profile.full_name
        });
        this.avatarPreview.set(profile.avatar_url);
      }
    });
  }

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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
          this.profileMessage.set({ type: 'error', text: 'O arquivo do avatar não pode exceder 2MB.'});
          return;
      }
      this.avatarFile.set(file);
      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async updateProfile() {
    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid) {
      return;
    }

    this.profileLoading.set(true);
    this.profileMessage.set(null);
    try {
      let avatar_url: string | undefined = undefined;
      const file = this.avatarFile();
      if (file) {
        avatar_url = await this.authService.uploadAvatar(file);
      }
      
      const { username, full_name } = this.profileForm.value;
      const updates: Partial<Profile> = {
        username: username!,
        full_name: full_name!,
      };

      if (avatar_url) {
        updates.avatar_url = avatar_url;
      }
      
      await this.authService.updateProfile(updates);
      this.profileMessage.set({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      this.avatarFile.set(null); // Clear file after successful upload
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Falha ao atualizar o perfil.';
      this.profileMessage.set({ type: 'error', text: message });
    } finally {
      this.profileLoading.set(false);
    }
  }

  async onLogout() {
    await this.authService.signOut();
    this.router.navigate(['/']);
  }
}
