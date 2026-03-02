import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CourseService } from '../../../../services/course.service';

@Component({
  selector: 'app-course-overview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseOverviewComponent {
  courseService = inject(CourseService);
  activeCourse = this.courseService.activeCourse;
}
