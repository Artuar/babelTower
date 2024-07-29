import type { NextApiRequest, NextApiResponse } from 'next';

let serverUrl = 'http://127.0.0.1:5000';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    serverUrl = req.body.serverUrl;
    res.status(200).json({ message: 'Server URL updated successfully' });
  } else if (req.method === 'GET') {
    res.status(200).json({ serverUrl });
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
