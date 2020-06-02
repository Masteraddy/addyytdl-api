const btn = document.querySelector('.downld');

btn.addEventListener('click', (e) => {
  console.log('object');
  fetch('/play?id=jAJzji5UxnU', {
    method: 'GET',
  })
    .then((res) => res.json())
    .then((dt) => dt)
    .catch(console.log);
});
