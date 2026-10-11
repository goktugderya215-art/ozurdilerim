// ===== AYARLAR =====
// name : sayfada yazan şarkı adı (aynen yaz)
// file : mp3 dosyasının adı
// start: kaçıncı saniyeden başlasın (0 = baştan)
// end  : kaçıncı saniyede dursun (0 = sonuna kadar çalsın)
const VOLUME = 0.1;
const SONGS = [
  { name: 'Son aşkım',        file: 'sarki2.mp3.mp3', start: 60, end: 0  },
  { name: 'Ah benim hayatım', file: 'sarki1.mp3.mp3', start: 75, end: 0 },
];
// ===================

const audio = new Audio();
let current = -1;
let currentRow = null;

// Bir elemanın içinde hangi şarkı adları geçiyor?
function songsIn(el) {
  const text = el.textContent.toLocaleLowerCase('tr');
  return SONGS
    .map((s, i) => (text.includes(s.name.toLocaleLowerCase('tr')) ? i : -1))
    .filter(i => i >= 0);
}

// Tıklanan yerden yukarı çıkıp şarkının satırını bulur
function findRow(target) {
  let el = target;
  while (el && el !== document.body) {
    const found = songsIn(el);
    if (found.length > 1) return null;
    if (found.length === 1) {
      let row = el;
      while (row.parentElement && row.parentElement !== document.body) {
        const f = songsIn(row.parentElement);
        if (f.length === 1 && f[0] === found[0]) row = row.parentElement;
        else break;
      }
      return { row, index: found[0] };
    }
    el = el.parentElement;
  }
  return null;
}

function mark(row, on) {
  if (row) row.style.outline = on ? '2px solid #e0185f' : '';
}

// Şarkı satırının üstüne gelince el işareti çıksın
document.addEventListener('mouseover', e => {
  const hit = findRow(e.target);
  if (hit) hit.row.style.cursor = 'pointer';
});

document.addEventListener('click', e => {
  const hit = findRow(e.target);
  if (!hit) return;
  const { row, index } = hit;

  // Aynı şarkıya tekrar tıklanınca durdur / devam ettir
  if (current === index) {
    if (audio.paused) {
      audio.play();
      mark(currentRow, true);
    } else {
      audio.pause();
      mark(currentRow, false);
    }
    return;
  }

  // Başka şarkıya geçiş
  mark(currentRow, false);
  current = index;
  currentRow = row;

  const song = SONGS[index];
  audio.src = song.file;
  audio.addEventListener('loadedmetadata', () => {
    audio.currentTime = song.start;
  }, { once: true });

  audio.play().then(() => {
    mark(row, true);
  }).catch(() => {
    alert('Şarkı açılamadı. mp3 dosyasının adını ve klasörünü kontrol et.');
    current = -1;
    currentRow = null;
  });
});

// Bitiş saniyesi
audio.addEventListener('timeupdate', () => {
  if (current < 0) return;
  const end = SONGS[current].end;
  if (end && audio.currentTime >= end) {
    audio.pause();
    mark(currentRow, false);
    current = -1;
    currentRow = null;
  }
});

// Şarkı bitince sıfırla
audio.addEventListener('ended', () => {
  mark(currentRow, false);
  current = -1;
  currentRow = null;
});