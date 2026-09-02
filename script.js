document.querySelectorAll('.teaser-row').forEach(function (row) {
  row.addEventListener('click', function () {
    var letters = row.querySelector('.teaser-letters');
    var answer = row.dataset.answer.split('');
    var tiles = letters.querySelectorAll('.tile');
    var revealed = letters.classList.contains('revealed');

    tiles.forEach(function (tile, i) {
      tile.textContent = revealed ? '?' : answer[i];
    });
    letters.classList.toggle('revealed', !revealed);
  });
});

document.querySelectorAll('.faq-toggle').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var item = btn.closest('.faq-item');
    var answer = item.querySelector('.faq-answer');
    var sign = item.querySelector('.faq-sign');
    var isOpen = answer.style.display !== 'none';

    document.querySelectorAll('.faq-answer').forEach(function (a) { a.style.display = 'none'; });
    document.querySelectorAll('.faq-sign').forEach(function (s) { s.textContent = '+'; });

    if (!isOpen) {
      answer.style.display = 'block';
      sign.textContent = '–';
    }
  });
});
