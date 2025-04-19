import chalk from 'chalk';
import { Manga } from '@/core/models/Manga';
import { getProvider } from '@/interface/cli/providers/providerFactory';

export async function runSave(
  providerName: string,
  url: string,
  numberOfChapters: number = 5,
  fromChapter: number = 1,
  webhook: string = ''
): Promise<void> {
  const provider = getProvider(providerName);

  if (!provider) {
    console.error(chalk.red(`❌ Provider "${providerName}" not found.`));
    return;
  }
  const manga: Manga = await provider.getManga(url);

  if (!manga) {
    console.error(chalk.red(`❌ Manga not found at "${url}".`));
    return;
  }

  const data = await provider.getMangaWithChaptersAndPages(manga, numberOfChapters, fromChapter);

  if (!data) {
    console.error(chalk.red(`❌ Failed to get manga data.`));
    return;
  }

  await provider.saveManga(data);

  console.log(chalk.green(`✅ Manga "${data.title}" saved successfully!`));

  if (webhook) {
    try {
      await provider.sendWebhook(webhook, data);
      console.log(chalk.green(`✅ Webhook sent to "${webhook}" successfully!`));
    } catch (error: any) {
      console.error(chalk.red(`❌ Failed to send webhook: ${error}`));
    }
  }
}
