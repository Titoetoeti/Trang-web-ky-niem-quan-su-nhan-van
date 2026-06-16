// =============================================
//  MEMORIES — app.js
//  Parallax 3D gốc, viết lại mượt hơn
//  Logic: mỗi .bg dịch translateY(-scrollY * index)
//  Layer index lớn hơn = di chuyển nhanh hơn = gần hơn
// =============================================

const listBg = document.querySelectorAll('.bg-group .bg');
const tabs   = document.querySelectorAll('.tab');

// ---------- Parallax 3D banner ----------
let rafPending = false;

function applyParallax() {
  const top = window.scrollY;

  listBg.forEach((bg, index) => {
    if (index === 0) return; // layer nền đứng yên làm gốc

    // Giữ nguyên công thức gốc: -top * index
    // Dùng style.transform thay vì .animate() để tránh jank
    bg.style.transform = `translateY(${-top * index * 0.35}px)`;
  });

  rafPending = false;
}

window.addEventListener('scroll', () => {
  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(applyParallax);
  }
}, { passive: true });

applyParallax(); // set ngay lúc load

// ---------- Scroll-reveal cho content từng tab ----------
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  },
  { threshold: 0.12 }
);

tabs.forEach(tab => revealObserver.observe(tab));

// ---------- Music player ----------
const audio     = document.getElementById('bg-music');
const playBtn   = document.getElementById('play-btn');
const volSlider = document.getElementById('vol-slider');
const volIcon   = document.getElementById('vol-icon');

let isPlaying = false;

// Autoplay khi user tương tác lần đầu (browser policy)
window.addEventListener('click', () => {
  if (!isPlaying && audio && audio.currentSrc &&
      !audio.currentSrc.includes('YOUR_MUSIC_FILE')) {
    audio.play().then(() => {
      isPlaying = true;
      if (playBtn) playBtn.textContent = '⏸';
    }).catch(() => {});
  }
}, { once: true });

if (playBtn) {
  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!audio.currentSrc || audio.currentSrc.includes('YOUR_MUSIC_FILE')) return;
    if (isPlaying) {
      audio.pause();
      playBtn.textContent = '▶';
      isPlaying = false;
    } else {
      audio.play();
      playBtn.textContent = '⏸';
      isPlaying = true;
    }
  });
}

if (volSlider && audio) {
  audio.volume = parseFloat(volSlider.value);
  volSlider.addEventListener('input', () => {
    const val = parseFloat(volSlider.value);
    audio.volume = val;
    if (volIcon) {
      volIcon.textContent = val === 0 ? '🔇' : val < 0.5 ? '🔉' : '🔊';
    }
  });
}

// ---------- Film grain ----------
const canvas = document.getElementById('grain-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function drawGrain() {
    const { width: w, height: h } = canvas;
    const img  = ctx.createImageData(w, h);
    const data = img.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 255 | 0;
      data[i] = data[i+1] = data[i+2] = v;
      data[i+3] = Math.random() * 18 | 0;
    }
    ctx.putImageData(img, 0, 0);
    requestAnimationFrame(drawGrain);
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  drawGrain();
}
