// scripts/apply-bunny-watermark.mjs
const options = {
  method: 'PUT',
  headers: {AccessKey: '68af878b-e4f5-4b8e-88bf9200bce2-16a6-49ae'}
};

fetch('https://api.bunny.net/videolibrary/{id}/watermark', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));