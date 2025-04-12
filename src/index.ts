import { ScanVfProvider } from '@/core/providers/ScanVf/index';

async function main(): Promise<void> {
  const manga = await new ScanVfProvider().search('Jujutsu');

  const onePiece = manga.find((m) => m.title.toLowerCase().includes('jujutsu'));

  const detail = await new ScanVfProvider().getManga(onePiece!.url);

  console.log('detail', JSON.stringify(detail, null, 2));
}

main();
