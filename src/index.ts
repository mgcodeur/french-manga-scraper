import { ScanVfProvider } from '@/core/providers/ScanVf/index';

async function main(): Promise<void> {
  const mangas = await new ScanVfProvider().search("one");

  console.log(mangas);
}

main();