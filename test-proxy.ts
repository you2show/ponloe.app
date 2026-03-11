fetch('http://localhost:3000/api/quran/verses/by_chapter/1')
  .then(r => r.json())
  .then(data => {
    console.log(data);
    process.exit(0);
  });
