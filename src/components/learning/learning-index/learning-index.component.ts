import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { LearningService, LearningPath, MainCategory } from '../../../services/learning.service';
import { LearningProgressService } from '../../../services/learning-progress.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-learning-index',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './learning-index.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearningIndexComponent implements OnInit {
  private learningService = inject(LearningService);
  public learningProgressService = inject(LearningProgressService);
  private router = inject(Router);

  // Data
  mainCategories = this.learningService.getLearningData();
  
  // Search State
  searchQuery = signal('');

  // Modal State
  selectedPath = signal<LearningPath | null>(null);
  isModalOpen = signal(false);

  // Computed Filtered Data
  filteredCategories = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const categories = this.mainCategories();

    if (!query) return categories;

    // Deep filter: Filter paths, then subcategories, then main categories
    return categories.map(cat => ({
      ...cat,
      subcategories: cat.subcategories.map(sub => ({
        ...sub,
        paths: sub.paths.filter(p => 
          p.title.toLowerCase().includes(query) || 
          p.description.toLowerCase().includes(query)
        )
      })).filter(sub => sub.paths.length > 0)
    })).filter(cat => cat.subcategories.length > 0);
  });

  ngOnInit(): void {
    this.learningProgressService.loadCompletedSteps();
  }

  openPreview(path: LearningPath) {
    this.selectedPath.set(path);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    setTimeout(() => this.selectedPath.set(null), 300); // Clear after animation
  }

  navigateToPath() {
    const path = this.selectedPath();
    if (path) {
      this.router.navigate(['/learning', path.slug]);
      this.closeModal();
    }
  }

  // Helper to prevent closing when clicking content
  stopProp(event: Event) {
    event.stopPropagation();
  }
}