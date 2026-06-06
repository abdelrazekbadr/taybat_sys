/**
 * Supabase implementation of ITopicsRepository.
 *
 * Tables:
 *   library_topics      (id, code, sequence, title, description, image_url, accent_color, icon, is_active)
 *   library_topic_items (id, topic_id, code, sequence, icon, title, description, is_active)
 *
 * Read-only reference tables — no user filtering needed.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { ServerError } from '@/shared/errors/AppError';
import type { LibraryTopic, LibraryTopicItem, LibraryTopicWithItems } from '@/types';
import type { ITopicsRepository } from './ITopicsRepository';

export class TopicsRepositorySupabase implements ITopicsRepository {
  constructor(private readonly client: SupabaseClient) {}

  async getTopicsWithItems(): Promise<LibraryTopicWithItems[]> {
    const { data: topics, error: topicsError } = await this.client
      .from('library_topics')
      .select('*')
      .eq('is_active', true)
      .order('sequence');

    if (topicsError) throw new ServerError(topicsError);

    const { data: items, error: itemsError } = await this.client
      .from('library_topic_items')
      .select('*')
      .eq('is_active', true)
      .order('sequence');

    if (itemsError) throw new ServerError(itemsError);

    const itemsByTopicId = new Map<number, LibraryTopicItem[]>();
    for (const item of (items ?? []) as LibraryTopicItem[]) {
      const list = itemsByTopicId.get(item.topic_id) ?? [];
      list.push(item);
      itemsByTopicId.set(item.topic_id, list);
    }

    return ((topics ?? []) as LibraryTopic[]).map((t) => ({
      ...t,
      items: itemsByTopicId.get(t.id) ?? [],
    }));
  }
}
