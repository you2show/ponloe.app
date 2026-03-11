import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('https://api.quran.com/api/v4/chapters?language=en', {
      headers: {
        'Origin': 'https://ais-dev-r53qif3ubrqvn64ejn2cyw-531271929507.asia-southeast1.run.app'
      }
    });
    console.log(res.status);
    console.log(res.headers.get('access-control-allow-origin'));
  } catch (err) {
    console.error(err);
  }
}

test();
