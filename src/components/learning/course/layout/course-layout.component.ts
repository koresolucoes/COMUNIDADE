import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { CourseService } from '../../../../services/course.service';
import { LearningProgressService } from '../../../../services/learning-progress.service';

@Component({
  selector: 'app-course-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './course-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseLayoutComponent {
  courseService = inject(CourseService);
  learningProgressService = inject(LearningProgressService);
  route = inject(ActivatedRoute);

  isSidebarOpen = signal(true);

  activeCourse = this.courseService.activeCourse;
  activeLesson = this.courseService.activeLesson;

  constructor() {
    this.route.paramMap.subscribe(params => {
      const courseSlug = params.get('courseSlug');
      if (courseSlug) {
        this.courseService.setActiveCourse(courseSlug);
      }
    });

    // Initial check for mobile
    this.checkScreenSize();
  }

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  isMobile(): boolean {
    return window.innerWidth < 768; // md breakpoint
  }

  closeSidebarOnMobile() {
    if (this.isMobile()) {
      this.isSidebarOpen.set(false);
    }
  }

  private checkScreenSize() {
    if (this.isMobile()) {
      this.isSidebarOpen.set(false);
    }
  }

  isLessonCompleted(lessonId: string): boolean {
    // Placeholder for now, will integrate with LearningProgressService
    return this.learningProgressService.isStepCompleted(lessonId);
  }

  get progressPercentage() {
    const course = this.activeCourse();
    if (!course) return 0;
    
    // Calculate progress based on completed lessons
    // This logic will be moved to LearningProgressService later
    return 0; 
  }
}
