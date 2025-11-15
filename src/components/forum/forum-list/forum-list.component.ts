import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ForumService, Topic, SortBy } from '../../../services/forum.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forum-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './forum-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForumListComponent implements OnInit {
  private forumService = inject(ForumService);
  public authService = inject(AuthService);

  topics = signal<Topic[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  activeTab = signal<SortBy>('updated_at');

  ngOnInit() {
    this.loadTopics();
  }

  async loadTopics() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const topics = await this.forumService.getTopics(this.activeTab());
      this.topics.set(topics);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Falha ao carregar os tópicos.');
    } finally {
      this.loading.set(false);
    }
  }

  changeTab(tab: SortBy) {
    this.activeTab.set(tab);
    this.loadTopics();
  }
}
