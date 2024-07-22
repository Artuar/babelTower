import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

const apiRoute = createRouter<NextApiRequest, NextApiResponse>();

apiRoute.use((req, res, next) => {
  const form = formidable({ multiples: true, keepExtensions: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      res.status(500).json({ error: 'Error parsing the files' });
      return;
    }
    req.body = fields;
    req.files = files;
    next();
  });
});

apiRoute.post(async (req: any, res: NextApiResponse) => {
  const file = req.files.file[0];
  const language = req.body.language;

  if (!file || !file.filepath) {
    res.status(400).json({ error: 'File not provided or invalid' });
    return;
  }

  const data = fs.readFileSync(file.filepath, { encoding: 'base64' });
  const translatedFilePath = path.join(process.cwd(), 'public', `translated_${file.newFilename}.mp3`);

  // Simulate processing and translation
  await new Promise((resolve) => setTimeout(resolve, 2000));
  fs.writeFileSync(translatedFilePath, data, 'base64');

  res.status(200).json({ translatedAudio: `/translated_${file.newFilename}.mp3` });
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apiRoute.handler();
