import fetch from 'node-fetch';

async function check() {
  try {
    const res = await fetch('https://api.aladhan.com/v1/gToHCalendar/3/2024?method=3', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://ais-dev-d2rnwqvg2vrhek3xbzrl7i-509201086325.asia-southeast1.run.app',
        'Access-Control-Request-Method': 'GET'
      }
    });
    console.log('Status:', res.status);
    console.log('CORS:', res.headers.get('access-control-allow-origin'));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

check();