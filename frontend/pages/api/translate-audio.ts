import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import formidable from 'formidable';
import fs from 'fs';
import fetch from 'node-fetch';

const apiRoute = createRouter<NextApiRequest, NextApiResponse>();

apiRoute.use((req, res, next) => {
  const form = formidable({ multiples: true, keepExtensions: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Error parsing the files:', err);
      res.status(500).json({ error: 'Error parsing the files' });
      return;
    }
    req.body = fields;
    req.files = files;
    next();
  });
});

apiRoute.post(async (req: any, res: NextApiResponse) => {
  try {
    const file = req.files.file[0];
    const language = req.body.language;
    const model_name = req.body.model_name;

    if (!file || !file.filepath) {
      res.status(400).json({ error: 'File not provided or invalid' });
      return;
    }

    // Read the file as base64
    const fileData = fs.readFileSync(file.filepath, { encoding: 'base64' });

    // Send the file to the Flask server
    const response = await fetch('http://127.0.0.1:5000/api/translate-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: `data:audio/mpeg;base64,${fileData}`, language, model_name }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error from Flask server:', errorData);
      res.status(500).json({ error: 'Error processing the file' });
      return;
    }

    const data = await response.json();

    res.status(200).json({ translatedAudio: data.translatedAudio });
  } catch (error) {
    console.error('Error processing the request:', error);
    res.status(500).json({ error: 'Error processing the request' });
  } finally {
    // Clean up the temporary file
    if (req.files.file && req.files.file[0] && req.files.file[0].filepath) {
      fs.unlinkSync(req.files.file[0].filepath);
    }
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apiRoute.handler();
