
import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';

// --- Type Definitions ---
export interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  display_name: string;
}

export interface Attachment {
  id: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  size_bytes: number;
  // FIX: Add user_id to match the database schema and type usage.
  user_id: string;
  url?: string;
}

export interface Comment {
  id: string;
  created_at: string;
  content: string;
  user_id: string;
  author: UserProfile;
  attachments: Attachment[];
  last_edited_at?: string;
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
  last_edited_at?: string;
}

export interface EditHistory {
  id: string;
  created_at: string;
  user_id: string;
  previous_title?: string;
  previous_content: string;
  author: UserProfile;
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
        id, created_at, updated_at, title, user_id, view_count, comment_count, last_edited_at
      `)
      .order(sortBy, { ascending: false });

    if (error) {
      console.error('Error fetching topics:', error);
      throw error;
    }

    // FIX: Correctly filter and type user IDs to prevent passing `unknown[]` to a function expecting `string[]`.
    const userIds = [...new Set(data.map(topic => topic.user_id))].filter((id): id is string => !!id);
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
      .select('*, last_edited_at')
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
      ...comments.flatMap(c => c.attachments.map(a => a.user_id)),
      ...topicAttachments.map(a => a.user_id)
    ];
    // FIX: Correctly filter and type user IDs to prevent passing `unknown[]` to a function expecting `string[]`.
    const uniqueStringUserIds = [...new Set(userIds)].filter((id): id is string => !!id);
    const profiles = await this.getUserProfiles(uniqueStringUserIds);
    
    topicData.author = profiles[topicData.user_id];
    comments.forEach(c => {
        c.author = profiles[c.user_id];
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

  async updateTopic(topicId: string, title: string, content: string): Promise<Topic> {
    if (!this.user) throw new Error("Usuário não autenticado.");

    const { data, error } = await this.supabase
      .from('forum_topics')
      .update({ title, content })
      .eq('id', topicId)
      .eq('user_id', this.user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateComment(commentId: string, content: string): Promise<Comment> {
    if (!this.user) throw new Error("Usuário não autenticado.");

    const { data, error } = await this.supabase
      .from('forum_comments')
      .update({ content })
      .eq('id', commentId)
      .eq('user_id', this.user.id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
  
  async deleteTopic(topicId: string): Promise<void> {
    if (!this.user) throw new Error("Usuário não autenticado.");
    const { error } = await this.supabase
      .from('forum_topics')
      .delete()
      .eq('id', topicId)
      .eq('user_id', this.user.id);
    if (error) throw error;
  }

  async deleteComment(commentId: string): Promise<void> {
    if (!this.user) throw new Error("Usuário não autenticado.");
    const { error } = await this.supabase
      .from('forum_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', this.user.id);
    if (error) throw error;
  }
  
  async getEditHistory(id: string, type: 'topic' | 'comment'): Promise<EditHistory[]> {
    const parentIdColumn = type === 'topic' ? 'topic_id' : 'comment_id';
    
    const { data, error } = await this.supabase
      .from('forum_edits')
      .select(`*`)
      .eq(parentIdColumn, id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // FIX: Correctly filter and type user IDs to prevent passing `unknown[]` to a function expecting `string[]`.
    const userIds = [...new Set(data.map(edit => edit.user_id))].filter((id): id is string => !!id);
    const profiles = await this.getUserProfiles(userIds);

    return data.map(edit => ({
      ...edit,
      author: profiles[edit.user_id]
    }));
  }

  private async getCommentsForTopic(topicId: string): Promise<Comment[]> {
     const { data, error } = await this.supabase
      .from('forum_comments')
      .select('*, last_edited_at')
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
    
    const { data, error } = await this.supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', userIds);

    if (error) {
      console.error('Error fetching profiles for forum:', error);
      throw error;
    }

    const profiles: Record<string, UserProfile> = {};
    const storageUrl = `${environment.supabaseUrl}/storage/v1/object/public/avatars/`;
    
    if (data) {
        for (const profile of data) {
            profiles[profile.id] = { 
                ...profile,
                avatar_url: profile.avatar_url ? `${storageUrl}${profile.avatar_url}` : null,
                display_name: profile.username || profile.full_name || `Usuário...${profile.id.substring(0,4)}`
            };
        }
    }
    
    // Fallback for users without a profile entry yet
    for (const id of userIds) {
        if (!profiles[id]) {
            profiles[id] = { id, username: null, full_name: null, avatar_url: null, display_name: `Usuário...${id.substring(0,4)}` };
        }
    }

    return profiles;
  }
}
