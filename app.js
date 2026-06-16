// =============================================
//  MEMORIES — app.js (refactored)
//  Fixes: scroll jank, black screen, text jump
//  Features: parallax, music player, scrollbar
// =============================================

// ---------- Parallax banner (lightweight) ----------
const bgLayers = document.querySelectorAll('.bg-parallax');

function updateParallax() {
  const scrollY = window.scrollY;
  bgLayers.forEach((layer, i) => {
    const speed = parseFloat(layer.dataset.speed || 0);
    layer.style.transform = `translateY(${scrollY * speed}px)`;
  });
}

window.addEventListener('scroll', updateParallax, { passive: true });

// ---------- Scroll-reveal for tab content ----------
const tabs = document.querySelectorAll('.tab');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  },
  { threshold: 0.15 }
);

tabs.forEach(tab => revealObserver.observe(tab));

// ---------- Custom scrollbar thumb ----------
const scrollTrack = document.querySelector('.scroll-track');
const scrollThumb = document.querySelector('.scroll-thumb');

function updateScrollThumb() {
  const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  const thumbHeight = Math.max(40, window.innerHeight / document.body.scrollHeight * window.innerHeight);
  const thumbTop = scrollPercent * (window.innerHeight - thumbHeight);
  scrollThumb.style.height = thumbHeight + 'px';
  scrollThumb.style.top = thumbTop + 'px';
}

window.addEventListener('scroll', updateScrollThumb, { passive: true });
window.addEventListener('resize', updateScrollThumb);
updateScrollThumb();

// Drag scrollbar
let isDragging = false;
let dragStartY = 0;
let dragStartScrollY = 0;

scrollThumb.addEventListener('mousedown', (e) => {
  isDragging = true;
  dragStartY = e.clientY;
  dragStartScrollY = window.scrollY;
  document.body.style.userSelect = 'none';
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const delta = e.clientY - dragStartY;
  const scrollRatio = document.body.scrollHeight / window.innerHeight;
  window.scrollTo(0, dragStartScrollY + delta * scrollRatio);
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  document.body.style.userSelect = '';
});

// ---------- Music player ----------
const audio = document.getElementById('bg-music');
const playBtn = document.getElementById('play-btn');
const volSlider = document.getElementById('vol-slider');
const volIcon = document.getElementById('vol-icon');

let isPlaying = false;

// Try autoplay (may be blocked by browser)
window.addEventListener('click', () => {
  if (!isPlaying && audio) {
    audio.play().then(() => {
      isPlaying = true;
      playBtn.textContent = '⏸';
    }).catch(() => {});
  }
}, { once: true });

if (playBtn) {
  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
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

if (volSlider) {
  volSlider.addEventListener('input', () => {
    const val = parseFloat(volSlider.value);
    audio.volume = val;
    if (val === 0) volIcon.textContent = '🔇';
    else if (val < 0.5) volIcon.textContent = '🔉';
    else volIcon.textContent = '🔊';
  });
}

// ---------- Film grain animation ----------
const canvas = document.getElementById('grain-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let animFrame;

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
      data[i] = data[i+1] = data[i+2] = v;
      data[i+3] = Math.random() * 18 | 0; // very subtle
    }
    ctx.putImageData(imageData, 0, 0);
    animFrame = requestAnimationFrame(drawGrain);
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  drawGrain();
}
