import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/aladhan/calendar?year=2024&month=10&latitude=11.5564&longitude=104.9282&method=3&school=0&adjustment=0');
    console.log(res.status);
    const text = await res.text();
    console.log(text.substring(0, 100));
  } catch (err) {
    console.error(err);
  }
}

test();
