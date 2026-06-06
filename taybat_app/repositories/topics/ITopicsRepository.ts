import type { LibraryTopicWithItems } from '@/types';

export interface ITopicsRepository {
  getTopicsWithItems(): Promise<LibraryTopicWithItems[]>;
}
