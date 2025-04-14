import { ScanVfProvider } from '@/core/providers/ScanVf';

async function main(): Promise<void> {
  const providers = new ScanVfProvider();
  const manga = await providers.getManga(`https://www.scan-vf.net/one_piece/`);

  const data = await providers.getMangaWithChaptersAndPages(manga, 4, 5);

  console.log(await providers.saveManga(data));
}

main();
