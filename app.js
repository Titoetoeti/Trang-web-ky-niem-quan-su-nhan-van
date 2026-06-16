// =============================================
//  MEMORIES — app.js
//  Parallax 3D banner + reveal + music + grain
// =============================================

// ---------- 3D Parallax banner ----------
// Mỗi layer .bg trong .bg-group dịch chuyển với tốc độ khác nhau
// tạo hiệu ứng chiều sâu 3D khi cuộn
const bgLayers = document.querySelectorAll('.bg-group .bg');

// Tốc độ parallax cho từng layer (index 0 = nền xa nhất, chậm nhất)
// Giá trị âm = layer dịch lên khi cuộn xuống (hiệu ứng đẩy ra xa)
const parallaxSpeeds = [0, 0.12, 0, 0.35, 0.55];

let ticking = false;

function updateParallax() {
  const scrollY = window.scrollY;
  bgLayers.forEach((layer, i) => {
    const speed = parallaxSpeeds[i] || 0;
    if (speed !== 0) {
      // translateY âm = layer dịch lên → tạo cảm giác layer ở phía trước
      layer.style.transform = `translateY(${-scrollY * speed}px)`;
    }
  });
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(updateParallax);
    ticking = true;
  }
}, { passive: true });

// Chạy lần đầu để set vị trí đúng
updateParallax();

// ---------- Scroll-reveal cho các tab ----------
const tabs = document.querySelectorAll('.tab');

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
const audio = document.getElementById('bg-music');
const playBtn = document.getElementById('play-btn');
const volSlider = document.getElementById('vol-slider');
const volIcon = document.getElementById('vol-icon');

let isPlaying = false;

// Autoplay khi user click lần đầu (browser policy)
window.addEventListener('click', () => {
  if (!isPlaying && audio && audio.src && !audio.src.includes('YOUR_MUSIC_FILE')) {
    audio.play().then(() => {
      isPlaying = true;
      if (playBtn) playBtn.textContent = '⏸';
    }).catch(() => {});
  }
}, { once: true });

if (playBtn) {
  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!audio.src || audio.src.includes('YOUR_MUSIC_FILE')) return;
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
      if (val === 0) volIcon.textContent = '🔇';
      else if (val < 0.5) volIcon.textContent = '🔉';
      else volIcon.textContent = '🔊';
    }
  });
}

// ---------- Film grain ----------
const canvas = document.getElementById('grain-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function drawGrain() {
    const w = canvas.width, h = canvas.height;
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 255 | 0;
      data[i] = data[i + 1] = data[i + 2] = v;
      data[i + 3] = Math.random() * 20 | 0;
    }
    ctx.putImageData(imageData, 0, 0);
    requestAnimationFrame(drawGrain);
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  drawGrain();
}
