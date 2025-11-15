import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';

// --- Type Definitions ---
export interface UserProfile {
  id: string;
  email: string;
}

export interface Attachment {
  id: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  size_bytes: number;
  url?: string;
}

export interface Comment {
  id: string;
  created_at: string;
  content: string;
  user_id: string;
  author: UserProfile;
  attachments: Attachment[];
}

export interface Topic {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  content: string;
  user_id: string;
  author: UserProfile;
  view_count: number;
  comment_count: number;
  attachments: Attachment[];
  comments?: Comment[];
}

export type SortBy = 'updated_at' | 'comment_count';

const FORUM_ATTACHMENTS_BUCKET = 'forum_attachments';

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private supabase: SupabaseClient;
  private authService = inject(AuthService);

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  private get user(): User | null {
    return this.authService.currentUser();
  }

  async getTopics(sortBy: SortBy = 'updated_at'): Promise<Topic[]> {
    const { data, error } = await this.supabase
      .from('forum_topics')
      .select(`
        id, created_at, updated_at, title, user_id, view_count, comment_count
      `)
      .order(sortBy, { ascending: false });

    if (error) {
      console.error('Error fetching topics:', error);
      throw error;
    }

    const userIds = [...new Set(data.map(topic => topic.user_id))];
    const profiles = await this.getUserProfiles(userIds);

    return data.map(topic => ({
      ...topic,
      author: profiles[topic.user_id] || { id: topic.user_id, email: 'Usuário desconhecido' }
    } as Topic));
  }

  async getTopicWithDetails(topicId: string): Promise<Topic | null> {
    // Increment view count
    await this.supabase.rpc('increment_view_count', { topic_id_arg: topicId });

    const { data: topicData, error: topicError } = await this.supabase
      .from('forum_topics')
      .select('*')
      .eq('id', topicId)
      .single();

    if (topicError) {
      console.error('Error fetching topic:', topicError);
      throw topicError;
    }
    if (!topicData) return null;

    const [comments, topicAttachments] = await Promise.all([
      this.getCommentsForTopic(topicId),
      this.getAttachments('topic_id', topicId),
    ]);

    const userIds = [
      topicData.user_id,
      ...comments.map(c => c.user_id),
    ];
    const profiles = await this.getUserProfiles([...new Set(userIds)]);
    
    topicData.author = profiles[topicData.user_id] || { id: topicData.user_id, email: 'Usuário desconhecido' };
    comments.forEach(c => {
        c.author = profiles[c.user_id] || { id: c.user_id, email: 'Usuário desconhecido' }
    });

    return { ...topicData, comments, attachments: topicAttachments } as Topic;
  }

  async createTopic(title: string, content: string, files: File[]): Promise<Topic> {
    if (!this.user) throw new Error("Usuário não autenticado.");
    
    const { data: topicData, error: topicError } = await this.supabase
      .from('forum_topics')
      .insert({ title, content, user_id: this.user.id })
      .select()
      .single();

    if (topicError) throw topicError;

    if (files.length > 0) {
      await this.uploadAndLinkFiles(files, topicData.id, 'topic_id');
    }

    return topicData;
  }
  
  async createComment(topicId: string, content: string, files: File[]): Promise<Comment> {
    if (!this.user) throw new Error("Usuário não autenticado.");

     const { data: commentData, error: commentError } = await this.supabase
      .from('forum_comments')
      .insert({ topic_id: topicId, content, user_id: this.user.id })
      .select()
      .single();

    if (commentError) throw commentError;

    if (files.length > 0) {
      await this.uploadAndLinkFiles(files, commentData.id, 'comment_id');
    }

    return commentData;
  }

  private async getCommentsForTopic(topicId: string): Promise<Comment[]> {
     const { data, error } = await this.supabase
      .from('forum_comments')
      .select('*')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    const commentsWithAttachments = await Promise.all(data.map(async (comment) => {
        const attachments = await this.getAttachments('comment_id', comment.id);
        return { ...comment, attachments };
    }));
    
    return commentsWithAttachments as Comment[];
  }
  
  private async uploadAndLinkFiles(files: File[], parentId: string, parentType: 'topic_id' | 'comment_id') {
      if (!this.user) throw new Error("Usuário não autenticado para upload.");

      for (const file of files) {
          const filePath = `public/${this.user.id}/${crypto.randomUUID()}-${file.name}`;
          const { error: uploadError } = await this.supabase.storage
              .from(FORUM_ATTACHMENTS_BUCKET)
              .upload(filePath, file);

          if (uploadError) throw uploadError;

          const attachmentRecord = {
              user_id: this.user.id,
              [parentType]: parentId,
              file_name: file.name,
              file_path: filePath,
              mime_type: file.type,
              size_bytes: file.size,
          };

          const { error: dbError } = await this.supabase.from('forum_attachments').insert(attachmentRecord);
          if (dbError) throw dbError;
      }
  }
  
  private async getAttachments(parentIdType: 'topic_id' | 'comment_id', parentId: string): Promise<Attachment[]> {
    const { data, error } = await this.supabase
      .from('forum_attachments')
      .select('*')
      .eq(parentIdType, parentId);
    
    if (error) throw error;

    return data.map(att => {
        const { data: { publicUrl } } = this.supabase.storage.from(FORUM_ATTACHMENTS_BUCKET).getPublicUrl(att.file_path);
        return { ...att, url: publicUrl };
    });
  }

  private async getUserProfiles(userIds: string[]): Promise<Record<string, UserProfile>> {
    if (userIds.length === 0) return {};
    
    // In a real app, you would fetch from a 'profiles' table.
    // Here we'll just simulate it based on what's available (email from user object)
    // This is a placeholder. For a production app, you'd do:
    // const { data, error } = await this.supabase.from('profiles').select('id, username, avatar_url').in('id', userIds);
    // For now, we return the email as the main identifier.
    const profiles: Record<string, UserProfile> = {};
    for (const id of userIds) {
        profiles[id] = { id, email: 'Usuário' }; // Placeholder, will be enriched by a more specific call if needed.
    }
    
    // As we don't have a public profiles table, we can't get other users' emails.
    // We can at least get the current user's email.
    if(this.user && userIds.includes(this.user.id)){
        profiles[this.user.id] = { id: this.user.id, email: this.user.email || 'Usuário' };
    }

    return profiles;
  }
}
