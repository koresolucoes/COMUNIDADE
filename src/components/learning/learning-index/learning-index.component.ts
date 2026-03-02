import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService, Course } from '../../../services/course.service';
import { LearningService } from '../../../services/learning.service';
import { LearningProgressService } from '../../../services/learning-progress.service';

interface CourseCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  courses: Course[];
}

@Component({
  selector: 'app-learning-index',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './learning-index.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearningIndexComponent implements OnInit {
  private courseService = inject(CourseService);
  private learningService = inject(LearningService); // Keep for legacy content
  public learningProgressService = inject(LearningProgressService);
  private router = inject(Router);

  // New Course System
  allCourses = signal<Course[]>([]);
  isLoading = signal(true);
  
  // Modal State
  selectedPath = signal<Course | null>(null);
  isModalOpen = signal(false);

  // Computed Categories
  courseCategories = computed<CourseCategory[]>(() => {
    const courses = this.allCourses();
    
    return [
      {
        id: 'beginner',
        title: 'Nível 1: Explorador (Iniciante)',
        description: 'Construa sua base sólida. Domine a lógica, entenda como a web funciona e dê seus primeiros passos na automação.',
        icon: 'explore',
        courses: courses.filter(c => c.category === 'Iniciante' || c.metadata?.difficulty === 'Iniciante')
      },
      {
        id: 'intermediate',
        title: 'Nível 2: Construtor (Intermediário)',
        description: 'Transforme conhecimento em ferramentas. Crie fluxos complexos, integre APIs e manipule dados como um engenheiro.',
        icon: 'construction',
        courses: courses.filter(c => c.category === 'Intermediário' || c.metadata?.difficulty === 'Intermediário')
      },
      {
        id: 'professional',
        title: 'Nível 3: Arquiteto (Profissional)',
        description: 'Escalabilidade, segurança e performance. Aprenda a pensar como um arquiteto de soluções enterprise.',
        icon: 'architecture',
        courses: courses.filter(c => c.category === 'Profissional' || c.metadata?.difficulty === 'Avançado' || c.metadata?.difficulty === 'Expert')
      }
    ];
  });

  // Legacy Content (Reference)
  legacyCategories = this.learningService.getLearningData();

  async ngOnInit() {
    this.isLoading.set(true);
    try {
      const courses = await this.courseService.getAllCourses();
      this.allCourses.set(courses);
    } catch (error) {
      console.error('Failed to load courses', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  navigateToCourse(slug: string) {
    this.router.navigate(['/learning/course', slug]);
  }

  openPreview(course: Course) {
    this.selectedPath.set(course);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedPath.set(null);
  }

  stopProp(event: Event) {
    event.stopPropagation();
  }

  navigateToPath() {
    const course = this.selectedPath();
    if (course) {
      this.navigateToCourse(course.slug);
      this.closeModal();
    }
  }
}