import { Injectable, signal, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import { LearningStep, LearningPath } from './learning.service';

export interface CourseModule {
  id: string;
  title: string;
  lessons: CourseLesson[];
  order: number;
}

export interface CourseLesson {
  id: string;
  slug: string;
  title: string;
  type: 'article' | 'video' | 'quiz' | 'challenge';
  duration?: string;
  content?: any;
  component?: any;
  order: number;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  category?: string;
  modules: CourseModule[];
  metadata: {
    difficulty: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Expert';
    duration: string;
    tags: string[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private supabase: SupabaseClient;

  activeCourse = signal<Course | null>(null);
  activeLesson = signal<CourseLesson | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async getAllCourses(): Promise<Course[]> {
    const { data, error } = await this.supabase
      .from('courses')
      .select('*');

    if (error) {
      console.error('Error fetching courses:', error);
      return [];
    }

    // Map to Course interface (simplified for list view)
    return (data || []).map((c: any) => ({
      id: c.id,
      slug: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      metadata: c.metadata || {},
      modules: [] // Don't need full modules for list view
    }));
  }

  async loadCourse(slug: string) {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      // 1. Fetch Course
      const { data: courseData, error: courseError } = await this.supabase
        .from('courses')
        .select('*')
        .eq('id', slug) // Assuming slug is the ID based on schema
        .single();

      if (courseError) throw courseError;
      if (!courseData) throw new Error('Course not found');

      // 2. Fetch Modules
      const { data: modulesData, error: modulesError } = await this.supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', courseData.id)
        .order('order', { ascending: true });

      if (modulesError) throw modulesError;

      // 3. Fetch Lessons for all modules
      const modules: CourseModule[] = [];
      
      for (const mod of modulesData || []) {
        const { data: lessonsData, error: lessonsError } = await this.supabase
          .from('course_lessons')
          .select('*')
          .eq('module_id', mod.id)
          .order('order', { ascending: true });

        if (lessonsError) throw lessonsError;

        modules.push({
          id: mod.id,
          title: mod.title,
          order: mod.order,
          lessons: (lessonsData || []).map(l => ({
            id: l.id,
            slug: l.slug,
            title: l.title,
            type: l.type,
            content: l.content, // Content is JSONB, Supabase returns it as object
            order: l.order,
            // Map metadata fields if they exist in content or separate columns
            duration: l.content?.duration || '5m' 
          }))
        });
      }

      const fullCourse: Course = {
        id: courseData.id,
        slug: courseData.id, // Using ID as slug based on schema
        title: courseData.title,
        description: courseData.description,
        metadata: courseData.metadata || {},
        modules: modules
      };

      this.activeCourse.set(fullCourse);

    } catch (err: any) {
      console.error('Error loading course:', err);
      this.error.set(err.message || 'Failed to load course');
      this.activeCourse.set(null);
    } finally {
      this.isLoading.set(false);
    }
  }

  setActiveCourse(slug: string) {
    // If we already have this course loaded, don't reload unless forced
    if (this.activeCourse()?.slug === slug) return;
    this.loadCourse(slug);
  }

  setActiveLesson(slug: string) {
    const course = this.activeCourse();
    if (!course) return;

    for (const module of course.modules) {
      const lesson = module.lessons.find(l => l.slug === slug);
      if (lesson) {
        this.activeLesson.set(lesson);
        return;
      }
    }
    // If not found in current course, maybe clear or handle error
    this.activeLesson.set(null);
  }

  getNextLesson(): CourseLesson | null {
    const course = this.activeCourse();
    const currentLesson = this.activeLesson();
    if (!course || !currentLesson) return null;

    let found = false;
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (found) return lesson;
        if (lesson.id === currentLesson.id) found = true;
      }
    }
    return null;
  }

  getPrevLesson(): CourseLesson | null {
    const course = this.activeCourse();
    const currentLesson = this.activeLesson();
    if (!course || !currentLesson) return null;

    let prev: CourseLesson | null = null;
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (lesson.id === currentLesson.id) return prev;
        prev = lesson;
      }
    }
    return null;
  }
}
