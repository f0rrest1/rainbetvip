import { Timestamp } from 'firebase/firestore';

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  published: boolean;
  isPriority: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  excerpt?: string;
  tags?: string[];
  imageUrl?: string;
  source: 'firestore' | 'api';
}

export interface NewsFormData {
  title: string;
  slug: string;
  content: string;
  author: string;
  published: boolean;
  isPriority: boolean;
  excerpt?: string;
  tags?: string[];
  imageUrl?: string;
}

// API News Item (from external sources)
export interface ApiNewsItem {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  source: 'api';
  link?: string;
  excerpt?: string;
}
