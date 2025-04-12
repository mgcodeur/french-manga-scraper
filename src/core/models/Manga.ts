import { Chapter } from '@/core/models/Chapter';

export interface Manga {
  title: string;
  alternativeTitles?: string[];
  url: string;
  cover: string;
  description: string;
  authors?: string[];
  drawers?: string[];
  status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled' | 'unknown';
  genders?: string[];
  source: 'scan-vf';
  rating?: number;
  demographic?: string;
  type?: string;
  releaseDate?: string;
  chapters?: Chapter[];
}
