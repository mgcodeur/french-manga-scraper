import { Manga } from '@/core/models/Manga';
import cheerio from 'cheerio';

export const extractRating = (text: string): number => {
  const match = text.match(/([\d.]+)(?:\/5)?/);
  const ratingValue = match ? parseFloat(match[1]) : NaN;
  return isNaN(ratingValue) ? 0 : ratingValue;
};

export const extractTitle = ($: cheerio.CheerioAPI): string => {
  return $('h2.widget-title').first().text().trim();
};

export const extractAlternativeTitles = ($: cheerio.CheerioAPI): string[] => {
  return (
    $('dt:contains("Autres noms")')
      .next('dd')
      .text()
      .trim()
      .split(',')
      .map((title) => title.trim())
      .filter((title) => title) || []
  );
};

export const extractDescription = ($: cheerio.CheerioAPI): string => {
  return $('.well p').text().trim();
};

export const extractCover = ($: cheerio.CheerioAPI): string => {
  return $('.boxed img.img-responsive').first().attr('src') || '';
};

export function extractStatus(
  $: cheerio.CheerioAPI
): 'ongoing' | 'completed' | 'hiatus' | 'cancelled' | 'unknown' {
  const raw = $('dt:contains("Statut")').next('dd').text().trim();
  const map: Record<string, Manga['status']> = {
    'En cours': 'ongoing',
    Terminé: 'completed',
    'En pause': 'hiatus',
    Annulé: 'cancelled',
  };
  return map[raw] || 'unknown';
}

export const extractAuthors = ($: cheerio.CheerioAPI): string[] => {
  return $('dt:contains("Auteur(s)")').next('dd').text().trim().split(',');
};

export const extractReleaseDate = ($: cheerio.CheerioAPI): string => {
  return $('dt:contains("Date de sortie")').next('dd').text().trim();
};

export const extractGenders = ($: cheerio.CheerioAPI): string[] => {
  return $('dt:contains("Catégories")')
    .next('dd')
    .text()
    .trim()
    .split(',')
    .map((gender) => gender.trim())
    .filter((gender) => gender);
};

export const extractDrawers = ($: cheerio.CheerioAPI): string[] => {
  return $('dt:contains("Artist(s)")')
    .next('dd')
    .text()
    .trim()
    .split(',')
    .filter((drawer) => drawer);
};

export const extractChapters = ($: cheerio.CheerioAPI) => {
  return $('.chapters li')
    .map((_, el) => {
      const chapterUrl = $(el).find('a').attr('href');
      const chapterTitle = $(el).find('em').text().trim();
      const chapterNumber = parseInt($(el).find('a').text().trim().split(' ').pop() || '0', 10);
      const uploadDate = $(el).find('.date-chapter-title-rtl').text().trim();

      return {
        title: chapterTitle || '',
        url: chapterUrl || '',
        number: chapterNumber,
        uploadDate: convertChapterDateToDate(uploadDate),
      };
    })
    .toArray()
    .reverse();
};

export const convertChapterDateToDate = (dateString: string): Date => {
  return new Date(dateString.replace(/(\d{2}) (\w+)\.? (\d{4})/, '$1 $2 $3'));
};
