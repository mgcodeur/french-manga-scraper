import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
import { Manga } from '@/core/models/Manga';
import { slugify } from '@/core/utils/string';
import { env } from '@/core/utils/env';

const app = express();
const port = env('API_PORT', '8990');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getMangaData = (title: string): Manga | null => {
  const filePath = path.join(__dirname, '../../data', title, 'manga.json');
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as Manga;
};

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
  res.send(`
    <h2>Scraper un Manga</h2>
    <form method="POST" action="/">
      <label>
        URL du manga:<br/>
        <input type="text" name="url" required />
      </label><br/><br/>

      <label>
        Nombre de chapitres (default 5):<br/>
        <input type="number" name="numberOfChapter" value="5" />
      </label><br/><br/>

      <label>
        À partir du chapitre (default 1):<br/>
        <input type="number" name="fromChapter" value="1" />
      </label><br/><br/>

      <button type="submit">Lancer le Scraper</button>
    </form>
  `);
});

app.post('/', (req, res) => {
  const { url, numberOfChapter = 5, fromChapter = 1 } = req.body;

  const command = `nohup node dist/cli.js save scanvf "${url}" ${numberOfChapter} ${fromChapter} > scraper.log 2>&1 &`;

  exec(command, (error) => {
    if (error) {
      console.error('Erreur lors de l’exécution:', error);
      return res.status(500).send('Erreur lors du lancement du scraper.');
    }

    res.send(`
      <p>✅ Scraper lancé avec succès !</p>
      <p>Commande : <code>${command}</code></p>
      <a href="/">Retour</a>
    `);
  });
});

app.get('/api/mangas', (req: Request, res: Response) => {
  const data: string[] = [];
  const directoryPath = path.join(__dirname, '../../data');
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    files.forEach((file) => {
      const filePath = path.join(directoryPath, file, 'manga.json');
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const title = JSON.parse(content).title;
        data.push(slugify(title));
      }
    });

    data.sort((a, b) => a.localeCompare(b));

    res.json(data);
  });
});

app.get('/api/mangas/:title', (req: any, res: any) => {
  const title: string = req.params.title;
  const data: Manga | null = getMangaData(title);

  if (!data) return res.status(404).json({ error: 'Manga not found' });
  res.json(data);
});

app.listen(port, () => {
  console.log(`✅ API server running at http://localhost:${port}`);
});
