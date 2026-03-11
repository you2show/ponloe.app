import express from 'express';

const app = express();

app.get('/api/quran/*path', (req, res) => {
  const endpoint = Array.isArray(req.params.path) ? req.params.path.join('/') : req.params.path;
  const queryParams = new URLSearchParams(req.query as any).toString();
  const url = 'https://api.quran.com/api/v4/' + endpoint + (queryParams ? '?' + queryParams : '');
  res.json({ url });
});

app.listen(3002, () => {
  fetch('http://localhost:3002/api/quran/verses/by_chapter/1?language=en&words=true')
    .then(r => r.json())
    .then(data => {
      console.log(data);
      process.exit(0);
    });
});
