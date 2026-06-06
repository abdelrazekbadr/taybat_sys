import topicsJson from '@/data/topics/topics.json';
import type { LibraryTopic, LibraryTopicItem, LibraryTopicWithItems } from '@/types';
import { mockDelay } from '@/utils/mockDelay';
import type { ITopicsRepository } from './ITopicsRepository';

type JsonTopicItem = {
  id: number;
  code: string;
  icon: string;
  title: string;
  description: string;
};

type JsonTopic = {
  id: number;
  code: string;
  sequence: number;
  title: string;
  description: string;
  image_url: string;
  accent_color: string;
  icon: string;
  items: JsonTopicItem[];
};

function mapJsonToTopicWithItems(raw: JsonTopic): LibraryTopicWithItems {
  const topic: LibraryTopic = {
    id: raw.id,
    code: raw.code,
    sequence: raw.sequence,
    title: raw.title,
    description: raw.description,
    image_url: raw.image_url ?? '',
    accent_color: raw.accent_color,
    icon: raw.icon,
    is_active: true,
    created_at: new Date().toISOString(),
  };

  const items: LibraryTopicItem[] = raw.items.map((item, idx) => ({
    id: item.id,
    topic_id: raw.id,
    code: item.code,
    sequence: idx + 1,
    icon: item.icon,
    title: item.title,
    description: item.description,
    is_active: true,
  }));

  return { ...topic, items };
}

export class TopicsRepositoryMock implements ITopicsRepository {
  async getTopicsWithItems(): Promise<LibraryTopicWithItems[]> {
    await mockDelay();
    const parsed = topicsJson as unknown as JsonTopic[];
    return [...parsed]
      .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
      .map(mapJsonToTopicWithItems);
  }
}
