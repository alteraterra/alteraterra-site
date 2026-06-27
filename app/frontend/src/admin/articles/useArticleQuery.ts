import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { BlogPost } from '@/types/blog';

export const ARTICLE_QUERY_KEY = (id: string | undefined) => ['admin', 'article', id ?? 'new'];

export function useArticleQuery(id: string | undefined) {
  return useQuery<BlogPost | null>({
    queryKey: ARTICLE_QUERY_KEY(id),
    enabled: !!id && id !== 'new',
    queryFn: async () => {
      if (!id || id === 'new') return null;
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as BlogPost | null;
    },
  });
}
