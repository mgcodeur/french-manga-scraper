import { ScanVfProvider } from '@/core/providers/ScanVf/index';

async function main(): Promise<void> {
  const manga = await new ScanVfProvider().search('My Hero Academia');

  const onePiece = manga.find((m) => m.title.toLowerCase().includes('my hero'));

  const detail = await new ScanVfProvider().getChapters(onePiece!.url);

  console.log('detail', JSON.stringify(detail, null, 2));
}

main();
