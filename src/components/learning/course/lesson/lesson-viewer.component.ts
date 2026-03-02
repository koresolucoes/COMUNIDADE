import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CourseService } from '../../../../services/course.service';
import { LearningProgressService } from '../../../../services/learning-progress.service';

@Component({
  selector: 'app-lesson-viewer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lesson-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonViewerComponent {
  courseService = inject(CourseService);
  learningProgressService = inject(LearningProgressService);
  route = inject(ActivatedRoute);
  sanitizer = inject(DomSanitizer);

  activeLesson = this.courseService.activeLesson;
  activeCourse = this.courseService.activeCourse;

  constructor() {
    this.route.paramMap.subscribe(params => {
      const lessonSlug = params.get('lessonSlug');
      if (lessonSlug) {
        this.courseService.setActiveLesson(lessonSlug);
      }
    });
  }

  get sanitizedVideoUrl(): SafeResourceUrl | null {
    const lesson = this.activeLesson();
    if (lesson?.type === 'video' && lesson.content) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(lesson.content);
    }
    return null;
  }

  markAsComplete() {
    const lesson = this.activeLesson();
    if (lesson) {
      this.learningProgressService.toggleStepCompletion(lesson.id);
    }
  }

  isCompleted(): boolean {
    const lesson = this.activeLesson();
    return lesson ? this.learningProgressService.isStepCompleted(lesson.id) : false;
  }

  nextLesson() {
    const next = this.courseService.getNextLesson();
    return next ? ['/learning/course', this.activeCourse()?.slug, next.slug] : null;
  }

  prevLesson() {
    const prev = this.courseService.getPrevLesson();
    return prev ? ['/learning/course', this.activeCourse()?.slug, prev.slug] : null;
  }
}
