export const cleanText = (text: string): string => {
  return text.replace(/\s+/g, ' ').trim();
};

export const slugify = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
};
