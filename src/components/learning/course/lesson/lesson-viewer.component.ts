import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl, SafeHtml } from '@angular/platform-browser';
import { CourseService } from '../../../../services/course.service';
import { LearningProgressService } from '../../../../services/learning-progress.service';
import { QuizComponent } from '../quiz/quiz.component';
import { CodeChallengeComponent } from '../code-challenge/code-challenge.component';

@Component({
  selector: 'app-lesson-viewer',
  standalone: true,
  imports: [CommonModule, RouterLink, QuizComponent, CodeChallengeComponent],
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
      const url = typeof lesson.content === 'string' ? lesson.content : lesson.content.url;
      return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
    }
    return null;
  }

  get lessonContent(): SafeHtml | string {
    const lesson = this.activeLesson();
    if (!lesson?.content) return '';
    
    if (typeof lesson.content === 'string') {
      return this.sanitizer.bypassSecurityTrustHtml(lesson.content);
    }
    
    if (lesson.type === 'article' && lesson.content.html) {
      return this.sanitizer.bypassSecurityTrustHtml(lesson.content.html);
    }
    
    return '';
  }

  markAsComplete() {
    const lesson = this.activeLesson();
    if (lesson) {
      this.learningProgressService.toggleStepCompletion(lesson.id);
    }
  }

  onInteractiveComplete(result?: { score: number }) {
    const lesson = this.activeLesson();
    if (lesson) {
      // For interactive content, we just mark as complete for now.
      // In the future, we can save the score using a new method in LearningProgressService.
      if (!this.isCompleted()) {
        this.learningProgressService.toggleStepCompletion(lesson.id);
      }
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
