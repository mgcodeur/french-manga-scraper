export const cleanText = (text: string): string => {
  return text.replace(/\s+/g, ' ').trim();
};
