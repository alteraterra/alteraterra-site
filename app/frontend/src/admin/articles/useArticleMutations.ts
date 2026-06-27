import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase';
import type { BlogPost } from '@/types/blog';
import { ARTICLE_QUERY_KEY } from './useArticleQuery';

export type ArticleSavePayload = Partial<BlogPost> & {
  id?: string;
};

export function useSaveArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ArticleSavePayload): Promise<BlogPost> => {
      const { id, ...rest } = payload;
      // Strip read-only fields from updates
      const row: Record<string, unknown> = { ...rest };
      delete (row as Record<string, unknown>).created_at;
      delete (row as Record<string, unknown>).updated_at;

      if (id) {
        const { data, error } = await supabase
          .from('blog_posts')
          .update(row)
          .eq('id', id)
          .select('*')
          .single();
        if (error) throw error;
        return data as BlogPost;
      }
      const { data, error } = await supabase
        .from('blog_posts')
        .insert(row)
        .select('*')
        .single();
      if (error) throw error;
      return data as BlogPost;
    },
    onSuccess: (data) => {
      toast.success('Article saved');
      qc.invalidateQueries({ queryKey: ['admin', 'articles'] });
      qc.invalidateQueries({ queryKey: ARTICLE_QUERY_KEY(data.id) });
    },
    onError: (err: { message?: string }) => {
      toast.error('Save failed', { description: err?.message ?? 'Unknown error' });
    },
  });
}

export function useDeleteArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      toast.success('Article deleted');
      qc.invalidateQueries({ queryKey: ['admin', 'articles'] });
    },
    onError: (err: { message?: string }) => {
      toast.error('Delete failed', { description: err?.message ?? 'Unknown error' });
    },
  });
}
