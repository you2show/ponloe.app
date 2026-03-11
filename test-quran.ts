fetch('https://api.quran.com/api/v4/verses/by_chapter/1?language=en&words=true&audio=7&fields=text_uthmani&word_fields=text_uthmani%2Ctranslation&word_translation_language=en&per_page=300')
  .then(r => r.json())
  .then(data => {
    console.log(data);
    process.exit(0);
  });
