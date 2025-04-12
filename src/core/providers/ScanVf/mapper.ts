import { Manga } from '@/core/models/Manga';
import { Suggestion } from '@/core/providers/ScanVf/types';

export function mapSuggestionToManga(s: Suggestion): Manga {
  return {
    title: s.value,
    url: s.data.startsWith('http') ? s.data : `https://www.scan-vf.net/${s.data}`,
    description: '',
    cover: '',
    source: 'scan-vf',
    status: 'unknown',
  };
}
