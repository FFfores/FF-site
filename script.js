// ==========================================
// 1. ИЗОЛИРОВАННАЯ СТАБИЛЬНАЯ ФИЗИКА ЧИБИКОВ
// ==========================================
const chibis = [
 { id: '1', chibi: document.getElementById('chibi1'), spring: document.getElementById('spring1'), wrapper: document.getElementById('wrapper1'), anchorX: 120, anchorY: 350, restX: 120, restY: 70, x: 120, y: 70, vx: 0, vy: 0, isDragging: false, dragOffsetX: 0, dragOffsetY: 0 },
 { id: '2', chibi: document.getElementById('chibi2'), spring: document.getElementById('spring2'), wrapper: document.getElementById('wrapper2'), anchorX: 120, anchorY: 350, restX: 120, restY: 70, x: 120, y: 70, vx: 0, vy: 0, isDragging: false, dragOffsetX: 0, dragOffsetY: 0 }
];
const stiffness = 0.12; 
const damping = 0.85; 
let initialSpringHeight = 100;
const chibiRadius = 75; 

chibis.forEach(c => {
 if (!c.chibi) return;
 function measureSpring() {
 c.spring.style.transform = 'none';
 initialSpringHeight = c.spring.offsetHeight || 100;
 }
 if (c.spring.complete) measureSpring();
 else c.spring.addEventListener('load', measureSpring);
 c.chibi.addEventListener('dragstart', (e) => e.preventDefault());
 
 // Единая функция старта для мышки и для пальца
 function onStart(e) {
 c.isDragging = true;
 // ИСПРАВЛЕНО: Если это тач на телефоне, берём координаты первого пальца, иначе — мышку
 const touch = e.touches && e.touches[0] ? e.touches[0] : e;
 const clientX = touch.clientX || 0;
 const clientY = touch.clientY || 0;
 
 const rect = c.chibi.getBoundingClientRect();
 c.dragOffsetX = clientX - (rect.left + rect.width / 2);
 c.dragOffsetY = clientY - (rect.top + rect.height / 2);
 c.vx = 0;
 c.vy = 0;
 }
 
 c.chibi.addEventListener('mousedown', onStart);
 // ИСПРАВЛЕНО: Вешаем тач-старт и запрещаем браузеру блокировать перетаскивание картинки
 c.chibi.addEventListener('touchstart', (e) => {
   if (e.cancelable) e.preventDefault();
   onStart(e);
 }, { passive: false });
});

// Переводчики для движения пальца по экрану телефона
window.addEventListener('mousemove', onMove);
window.addEventListener('touchmove', (e) => {
  // Перенаправляем тач-координаты пальца в оригинальную функцию движения onMove
  if (e.touches && e.touches[0]) {
    onMove(e.touches[0]);
  }
}, { passive: false });

function onMove(e) {
 const clientX = e.clientX || 0;
 const clientY = e.clientY || 0;
 chibis.forEach(c => {
 if (!c.isDragging) return;
 const wrapperRect = c.wrapper.getBoundingClientRect();
 c.x = clientX - wrapperRect.left - c.dragOffsetX;
 c.y = clientY - wrapperRect.top - (c.chibi.offsetHeight / 2) - c.dragOffsetY;
 if (c.y > c.anchorY - 220) c.y = c.anchorY - 220;
 });
}

window.addEventListener('mouseup', () => chibis.forEach(c => c.isDragging = false));
window.addEventListener('touchend', () => chibis.forEach(c => c.isDragging = false));

function updateChibiVisuals(c) {
 c.chibi.style.left = `${c.x}px`;
 c.chibi.style.top = `${c.y}px`;
 if (!initialSpringHeight) return;
 const targetX = c.x;
 const targetY = c.y + 200;
 const dx = targetX - c.anchorX;
 const dy = c.anchorY - targetY;
 const currentLength = Math.sqrt(dx * dx + dy * dy);
 const scaleY = currentLength / initialSpringHeight;
 const scaleX = Math.max(0.4, 1 / Math.sqrt(scaleY));
 const angle = Math.atan2(dx, dy) * (180 / Math.PI);
 c.spring.style.transform = `translateX(-50%) rotate(${angle}deg) scale(${scaleX}, ${scaleY})`;
}

function updatePhysics() {
 const c1 = chibis[0];
 const c2 = chibis[1];
 if (c1 && c2 && c1.chibi && c2.chibi) {
 const r1 = c1.chibi.getBoundingClientRect();
 const r2 = c2.chibi.getBoundingClientRect();
 const c1GlobalX = r1.left + r1.width / 2;
 const c1GlobalY = r1.top + r1.height / 2;
 const c2GlobalX = r2.left + r2.width / 2;
 const c2GlobalY = r2.top + r2.height / 2;
 const dx = c2GlobalX - c1GlobalX;
 const dy = c2GlobalY - c1GlobalY;
 const distance = Math.sqrt(dx * dx + dy * dy);
 const minDistance = chibiRadius * 2;
 if (distance < minDistance) {
 const angle = Math.atan2(dy, dx);
 const overlap = minDistance - distance;
 const pushForce = overlap * 0.25;
 if (!c1.isDragging) {
 c1.vx -= Math.cos(angle) * pushForce;
 c1.vy -= Math.sin(angle) * pushForce;
 }
 if (!c2.isDragging) {
 c2.vx += Math.cos(angle) * pushForce;
 c2.vy += Math.sin(angle) * pushForce;
 }
 }
 }
 chibis.forEach(c => {
 if (!c.isDragging) {
 const ax = (c.restX - c.x) * stiffness;
 const ay = (c.restY - c.y) * stiffness;
 c.vx += ax;
 c.vy += ay;
 c.vx *= damping;
 c.vy *= damping;
 c.x += c.vx;
 c.y += c.vy;
 if (c.y > c.anchorY - 220) {
 c.y = c.anchorY - 220;
 c.vy *= -0.4;
 }
 }
 updateChibiVisuals(c);
 });
 requestAnimationFrame(updatePhysics);
}

const logo = document.querySelector('.logo-header');
if (logo) {
 // Функция расчета наклона логотипа
 function handleLogoTilt(clientX, clientY) {
 const rect = logo.getBoundingClientRect();
 const x = clientX - rect.left - rect.width / 2;
 const y = e.clientY - rect.top - rect.height / 2; // для мыши
 }
 
 // Новая чистая функция, работающая и с мышью, и с тачем
 function applyLogoTilt(clientX, clientY) {
 const rect = logo.getBoundingClientRect();
 const x = clientX - rect.left - rect.width / 2;
 const y = clientY - rect.top - rect.height / 2;
 const tiltX = -(y / (rect.height / 2)) * 15;
 const tiltY = (x / (rect.width / 2)) * 15;
 logo.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.05)`;
 }
 
 function resetLogoTilt() {
 logo.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
 }

 // События для ПК
 logo.addEventListener('mousemove', (e) => applyLogoTilt(e.clientX, e.clientY));
 logo.addEventListener('mouseleave', resetLogoTilt);
 
  // ИСПРАВЛЕНО: Блокируем скролл страницы пальцем при зажатии логотипа!
 logo.addEventListener('touchstart', (e) => {
   const touch = e.touches[0];
   applyLogoTilt(touch.clientX, touch.clientY);
 }, { passive: true });
 
 logo.addEventListener('touchmove', (e) => {
   if (e.cancelable) e.preventDefault();
   const touch = e.touches[0];
   applyLogoTilt(touch.clientX, touch.clientY);
 }, { passive: false });
 
 logo.addEventListener('touchend', resetLogoTilt);
}

// ==========================================
// 3. АРКАДНЫЙ ГЕНЕРАТОР С РЕДКИМ ГЛИТЧЕМ, СТОЛКНОВЕНИЕМ И МЕДЛЕННЫМ ТЕЧЕНИЕМ ФИГУР
// ==========================================
const canvas = document.getElementById('math-canvas');
let isBackgroundPaused = false;
if (canvas) {
 const ctx = canvas.getContext('2d'); let canvasTime = 0;
 function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
 window.addEventListener('resize', resizeCanvas); resizeCanvas();
 const neonColors = ['#bc2be6', '#ff2e93', '#2eff7a', '#ffb82e', '#2eb8ff', '#ffffff'];
 const shapeTypes = ['star', 'ring', 'square', 'triangle', 'cross', 'diamond'];
 let elements = [];
 function generateArcadePattern() {
 elements = [];
 const isMobile = window.innerWidth <= 768;
 const elementCount = isMobile ? 35 : 85; 
 for (let i = 0; i < elementCount; i++) {
 const baseSize = isMobile ? (15 + Math.random() * 30) : (35 + Math.random() * 75);
 elements.push({
 type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)], x: Math.random() * canvas.width, y: Math.random() * canvas.height,
 vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.12, size: baseSize,
 color1: neonColors[Math.floor(Math.random() * neonColors.length)], color2: neonColors[Math.floor(Math.random() * neonColors.length)],
 rotSpeed: (Math.random() - 0.5) * 0.0018, angle: Math.random() * Math.PI * 2, pulseOffset: Math.random() * Math.PI,
 glitchTimer: 400 + Math.random() * 800, isGlitchingNow: false, glitchDuration: 0, stutterX: 0, stutterY: 0
 });
 }
 }
 function drawNeonStar(cx, cy, spikes, outerRadius, innerRadius, color1, color2, angle) {
 let rot = (Math.PI / 2) * 3; let x = cx; let y = cy; let step = Math.PI / spikes;
 ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle); ctx.beginPath(); ctx.moveTo(0, -outerRadius);
 for (let i = 0; i < spikes; i++) {
 x = Math.cos(rot) * outerRadius; y = Math.sin(rot) * outerRadius; ctx.lineTo(x, y); rot += step;
 x = Math.cos(rot) * innerRadius; y = Math.sin(rot) * innerRadius; ctx.lineTo(x, y); rot += step;
 }
 ctx.lineTo(0, -outerRadius); ctx.closePath(); ctx.fillStyle = color1; ctx.fill(); ctx.strokeStyle = color2; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
 }
 function drawArcadeRings(cx, cy, size, angle, color) {
 ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle); ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, size / 2, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(size / 4, size / 4, size / 2, Math.PI, Math.PI * 1.5); ctx.stroke(); ctx.restore();
 }
 function drawCustomShape(type, cx, cy, size, angle, color1, color2) {
 ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle); ctx.strokeStyle = color1; ctx.fillStyle = color2; ctx.lineWidth = 3; ctx.beginPath();
 if (type === 'square') { ctx.rect(-size/2, -size/2, size, size); }
 else if (type === 'triangle') { ctx.moveTo(0, -size/2); ctx.lineTo(size/2, size/2); ctx.lineTo(-size/2, size/2); }
 else if (type === 'diamond') { ctx.moveTo(0, -size/2); ctx.lineTo(size/2, 0); ctx.lineTo(0, size/2); ctx.lineTo(-size/2, 0); }
 else if (type === 'cross') { ctx.lineWidth = 4; ctx.moveTo(-size/2, 0); ctx.lineTo(size/2, 0); ctx.moveTo(0, -size/2); ctx.lineTo(0, size/2); }
 ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
 }
 function renderSingleShape(type, x, y, size, angle, c1, c2) {
 if (type === 'star') { drawNeonStar(x, y, 6, size / 2, size / 5, c1, c2, angle); }
 else if (type === 'ring') { drawArcadeRings(x, y, size, angle, c1); }
 else { drawCustomShape(type, x, y, size, angle, c1, c2); }
 }
 function drawArcadeCarpet() {
 if (isBackgroundPaused) { requestAnimationFrame(drawArcadeCarpet); return; }
 ctx.clearRect(0, 0, canvas.width, canvas.height); canvasTime += 0.01;
 for (let i = 0; i < elements.length; i++) {
 for (let j = i + 1; j < elements.length; j++) {
 let el1 = elements[i]; let el2 = elements[j]; let dx = el2.x - el1.x; let dy = el2.y - el1.y; let dist = Math.sqrt(dx * dx + dy * dy); let minDist = (el1.size + el2.size) * 0.45;
 if (dist < minDist && dist > 0) { let angle = Math.atan2(dy, dx); let push = (minDist - dist) * 0.01; el1.vx -= Math.cos(angle) * push; el1.vy -= Math.sin(angle) * push; el2.vx += Math.cos(angle) * push; el2.vy += Math.sin(angle) * push; }
 }
 }
 elements.forEach(el => {
 el.x += el.vx; el.y += el.vy;
 if (el.x < -el.size) el.x = canvas.width + el.size; if (el.x > canvas.width + el.size) el.x = -el.size;
 if (el.y < -el.size) el.y = canvas.height + el.size; if (el.y > canvas.height + el.size) el.y = -el.size;
 const pulse = Math.sin(canvasTime + el.pulseOffset) * 0.08; const currentSize = el.size * (1 + pulse);
 el.angle += el.rotSpeed; el.glitchTimer--;
 if (el.glitchTimer <= 0 && !el.isGlitchingNow) { el.isGlitchingNow = true; el.glitchDuration = 10 + Math.floor(Math.random() * 8); }
 if (!el.isGlitchingNow) { renderSingleShape(el.type, el.x, el.y, currentSize, el.angle, el.color1, el.color2); }
 else {
 el.glitchDuration--; if (el.glitchDuration % 3 === 0) { el.stutterX = (Math.random() - 0.5) * 50; el.stutterY = (Math.random() - 0.5) * 20; }
 const glitchColor1 = neonColors[Math.floor(Math.random() * neonColors.length)]; const glitchColor2 = neonColors[Math.floor(Math.random() * neonColors.length)]; const glitchSize = currentSize * (0.7 + Math.random() * 1.1);
 ctx.save(); ctx.globalAlpha = 0.3; renderSingleShape(el.type, el.x + el.stutterX - 12, el.y + el.stutterY + 4, glitchSize, el.angle + 0.3, '#ff2e93', '#ffffff'); ctx.restore();
 ctx.save(); if (Math.random() > 0.5) { ctx.beginPath(); ctx.rect(el.x - 60, el.y - 60, el.size + 120, (Math.random() * el.size * 0.9)); ctx.clip(); }
 renderSingleShape(el.type, el.x + el.stutterX, el.y + el.stutterY, glitchSize, el.angle, glitchColor1, glitchColor2); ctx.restore();
 if (el.glitchDuration <= 0) { el.isGlitchingNow = false; el.glitchTimer = 900 + Math.random() * 1200; }
 }
 });
 ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
 for (let i = 0; i < 50; i++) {
 let px = (Math.sin(i + canvasTime * 0.2) * 0.5 + 0.5) * canvas.width; let py = (Math.cos(i * 2 + canvasTime * 0.1) * 0.5 + 0.5) * canvas.height;
 if (Math.random() < 0.0005) { ctx.fillRect(0, py, canvas.width, 1); } ctx.fillRect(px, py, 6, 6);
 }
 requestAnimationFrame(drawArcadeCarpet);
 }
 window.addEventListener('resize', generateArcadePattern); generateArcadePattern(); drawArcadeCarpet();
}
// ==========================================
// 4. ГАЛЕРЕЯ АРТОВ С НАКЛОНОМ
// ==========================================
const myArtFiles = [
 { src: 'arts/art1.png', title: ':О' }, { src: 'arts/art2.png', title: 'Хер' }, { src: 'arts/art3.png', title: ':)?' },
 { src: 'arts/art4.png', title: ':П' }, { src: 'arts/art5.png', title: ':)' }, { src: 'arts/art6.png', title: ';П' },
 { src: 'arts/art7.png', title: ':р' }, { src: 'arts/art8.png', title: 'FUCK OFF' }, { src: 'arts/art9.png', title: '<3' },
];
const artBtn = document.getElementById('art-trigger');
const galleryModal = document.getElementById('gallery-modal');
const closeGalleryBtn = document.getElementById('close-gallery');
const gridContainer = document.getElementById('art-grid-container');
const fullArtViewer = document.getElementById('full-art-viewer');
const fullImageTarget = document.getElementById('full-image-target');

function loadGallery() {
 if (!gridContainer) return; gridContainer.innerHTML = '';
 myArtFiles.forEach(art => {
 const card = document.createElement('div'); card.className = 'art-card';
 card.innerHTML = ` <img src="${art.src}" alt="${art.title}"> <div class="art-info">${art.title}</div> `;
 
 // Функция расчета наклона (общая для мыши и тача)
 function handleTilt(clientX, clientY) {
 const rect = card.getBoundingClientRect(); 
 const x = clientX - rect.left - rect.width / 2; 
 const y = clientY - rect.top - rect.height / 2;
 const maxTilt = 12; 
 const tiltX = -(y / (rect.height / 2)) * maxTilt; 
 const tiltY = (x / (rect.width / 2)) * maxTilt;
 card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.04)`;
 }
 
 // Сброс наклона
 function resetTilt() { 
 card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`; 
 }

 // События для ПК
 card.addEventListener('mousemove', (e) => handleTilt(e.clientX, e.clientY));
 card.addEventListener('mouseleave', resetTilt);
 
  // ИСПРАВЛЕНО: Блокируем скролл страницы пальцем, пока идёт 3D-наклон карточки!
 card.addEventListener('touchstart', (e) => {
   const touch = e.touches[0];
   handleTilt(touch.clientX, touch.clientY);
 }, { passive: true });
 
 card.addEventListener('touchmove', (e) => {
   // Если палец двигается внутри карточки, отменяем стандартный скролл галереи
   if (e.cancelable) e.preventDefault(); 
   const touch = e.touches[0];
   handleTilt(touch.clientX, touch.clientY);
 }, { passive: false }); // Важно: passive: false, чтобы блокировка скролла сработала!
 
 card.addEventListener('touchend', resetTilt);


 card.addEventListener('click', () => { if (fullArtViewer && fullImageTarget) { fullImageTarget.src = art.src; fullArtViewer.classList.add('active'); } });
 gridContainer.appendChild(card);
});
}
if (fullArtViewer) { fullArtViewer.addEventListener('click', () => { fullArtViewer.classList.remove('active'); });}
if (artBtn && galleryModal && closeGalleryBtn) {
 artBtn.addEventListener('click', () => { 
 if (typeof infoModal !== 'undefined' && infoModal) infoModal.classList.remove('active'); 
 if (typeof linksModal !== 'undefined' && linksModal) linksModal.classList.remove('active');
 isBackgroundPaused = true; galleryModal.classList.add('active'); loadGallery(); 
 });
 closeGalleryBtn.addEventListener('click', () => { isBackgroundPaused = false; galleryModal.classList.remove('active'); });
 galleryModal.addEventListener('click', (e) => { if (e.target === galleryModal) { isBackgroundPaused = false; galleryModal.classList.remove('active'); } });
}

// ==========================================
// 5. ОТКРЫТИЕ И ЗАКРЫТИЕ ОКНА ИНФО И ССЫЛОК (ФОН НЕ СТОПИТСЯ)
// ==========================================
const infoBtn = document.getElementById('info-trigger');
const infoModal = document.getElementById('info-modal');
const closeInfoBtn = document.getElementById('close-info');

const linksBtn = document.getElementById('links-trigger');
const linksModal = document.getElementById('links-modal');
const closeLinksBtn = document.getElementById('close-links');

if (infoBtn && infoModal && closeInfoBtn) {
 infoBtn.addEventListener('click', () => { 
 if (galleryModal) galleryModal.classList.remove('active'); 
 if (typeof linksModal !== 'undefined' && linksModal) linksModal.classList.remove('active'); 
 infoModal.classList.add('active'); 
 });
 closeInfoBtn.addEventListener('click', () => { infoModal.classList.remove('active'); });
}

if (linksBtn && linksModal && closeLinksBtn) {
 linksBtn.addEventListener('click', () => { 
 if (galleryModal) galleryModal.classList.remove('active'); 
 if (typeof infoModal !== 'undefined' && infoModal) infoModal.classList.remove('active'); 
 linksModal.classList.add('active'); 
 });
 closeLinksBtn.addEventListener('click', () => { linksModal.classList.remove('active'); });
}

// ==========================================
// 6. УПРАВЛЕНИЕ МУЗЫКАЛЬНЫМ ПЛЕЕРОМ (НАЧАЛО)
// ==========================================
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const loopBtn = document.getElementById('loop-btn');
const loopModeText = document.getElementById('loop-mode-text');
const volumeSlider = document.getElementById('volume-slider');
const volumeIcon = document.getElementById('volume-icon');
const audio = document.getElementById('audio-element');
const progress = document.getElementById('progress');
const timeline = document.getElementById('timeline');
const trackName = document.getElementById('track-name');

const myPlaylist = [
 { src: 'https://archive.org/download/track4_202609/track1.mp3', title: '' },
 { src: 'https://archive.org/download/track4_202609/track2.mp3', title: '' },
 { src: 'https://archive.org/download/track4_202609/track3.mp3', title: '' },
 { src: 'https://archive.org/download/track4_202609/track5.mp3', title: '' },
 { src: 'https://archive.org/download/track4_202609/track6.mp3', title: '' },
 { src: 'https://archive.org/download/track4_202609/track7.mp3', title: '' },
 { src: 'https://archive.org/download/track4_202609/track8.mp3', title: '' },
 { src: 'https://archive.org/download/track4_202609/track9.mp3', title: '' },
 { src: 'https://archive.org/download/track4_202609/track10.mp3', title: '' },
 { src: 'https://archive.org/download/track4_202609/track11.mp3', title: '' },
 { src: 'https://archive.org/download/track4_202609/track12.mp3', title: '' },
 { src: 'https://archive.org/download/track4_202609/track13.mp3', title: '' },
 { src: 'https://archive.org/download/track4_202609/track14.mp3', title: '' },
 { src: 'https://archive.org/download/track4_202609/track15.mp3', title: '' },
];

let currentTrackIndex = 0; let loopMode = 0;

function loadTrack(index) {
 if (!audio || myPlaylist.length === 0) return;
 audio.src = myPlaylist[index].src;
 if (trackName) { trackName.textContent = `🎧 Трек [${index + 1}/${myPlaylist.length}]: ${myPlaylist[index].title}`; }
 if (progress) progress.style.width = '0%';
}
if (playBtn && audio && progress && timeline && prevBtn && nextBtn && loopBtn && volumeSlider) {
 loadTrack(currentTrackIndex); audio.volume = volumeSlider.value;
 playBtn.addEventListener('click', () => {
 if (audio.paused) { audio.play().catch(err => console.log("Кликни сначала по экрану")); playBtn.textContent = '❚❚'; if (trackName) trackName.textContent = `🎶 Играет: ${myPlaylist[currentTrackIndex].title}`; }
 else { audio.pause(); playBtn.textContent = '▶'; if (trackName) trackName.textContent = `⏸ Пауза: ${myPlaylist[currentTrackIndex].title}`; }
 });
 prevBtn.addEventListener('click', () => {
 currentTrackIndex--; if (currentTrackIndex < 0) currentTrackIndex = myPlaylist.length - 1;
 const wasPlaying = !audio.paused; loadTrack(currentTrackIndex);
 if (wasPlaying) { setTimeout(() => { audio.play().catch(err => {}); }, 50); playBtn.textContent = '❚❚'; } else { playBtn.textContent = '▶'; }
 });
 nextBtn.addEventListener('click', () => {
 currentTrackIndex++; if (currentTrackIndex >= myPlaylist.length) currentTrackIndex = 0;
 const wasPlaying = !audio.paused; loadTrack(currentTrackIndex);
 if (wasPlaying) { setTimeout(() => { audio.play().catch(err => {}); }, 50); playBtn.textContent = '❚❚'; } else { playBtn.textContent = '▶'; }
 });
 loopBtn.addEventListener('click', () => {
 loopMode = (loopMode + 1) % 3; loopBtn.classList.remove('mode-track', 'mode-playlist');
 if (loopMode === 0) { if (loopModeText) loopModeText.textContent = 'ВЫКЛ'; }
 else if (loopMode === 1) { loopBtn.classList.add('mode-track'); if (loopModeText) loopModeText.textContent = 'ТРЕК'; }
 else if (loopMode === 2) { loopBtn.classList.add('mode-playlist'); if (loopModeText) loopModeText.textContent = 'ЛИСТ'; }
 });
 volumeSlider.addEventListener('input', (e) => {
 const val = e.target.value; audio.volume = val;
 if (volumeIcon) { if (val == 0) volumeIcon.textContent = '🔇'; else if (val < 0.4) volumeIcon.textContent = '🔈'; else volumeIcon.textContent = '🔊'; }
 });
 audio.addEventListener('timeupdate', () => {
 const currentTime = audio.currentTime; const duration = audio.duration;
 if (duration && progress) { const progressPercent = (currentTime / duration) * 100; progress.style.width = `${progressPercent}%`; }
 });
 timeline.addEventListener('click', (e) => {
 const timelineWidth = timeline.clientWidth; const clickX = e.offsetX; const duration = audio.duration;
 if (duration) { audio.currentTime = (clickX / timelineWidth) * duration; }
 });
 audio.addEventListener('ended', () => {
 if (loopMode === 1) { audio.currentTime = 0; audio.play().catch(err => {}); }
 else if (loopMode === 2) { currentTrackIndex++; if (currentTrackIndex >= myPlaylist.length) currentTrackIndex = 0; loadTrack(currentTrackIndex); setTimeout(() => { audio.play().then(() => { playBtn.textContent = '❚❚'; }).catch(err => {}); }, 100); }
 else { if (currentTrackIndex < myPlaylist.length - 1) { nextBtn.click(); } else { playBtn.textContent = '▶'; if (progress) progress.style.width = '0%'; } }
 });
}

// ==========================================
// 7. ФУНКЦИЯ КОПИРОВАНИЯ ЮЗЕРНЕЙМОВ ПО КЛИКУ
// ==========================================
function setupUsernameCopy(buttonId) {
 const btn = document.getElementById(buttonId);
 if (!btn) return;
 const originalText = btn.textContent;
 btn.addEventListener('click', () => {
 const username = btn.getAttribute('data-username');
 navigator.clipboard.writeText(username).then(() => {
 btn.textContent = '✅ Скопировано!';
 const origBg = btn.style.background; const origCol = btn.style.color;
 btn.style.background = '#2eff7a'; btn.style.color = '#11071c';
 setTimeout(() => { btn.textContent = originalText; btn.style.background = origBg; btn.style.color = origCol; }, 2000);
 }).catch(err => { console.error('Не удалось скопировать: ', err); });
 });
}
setupUsernameCopy('copy-tg');
setupUsernameCopy('copy-dc');
setupUsernameCopy('copy-st');

// Запуск физики чибиков
updatePhysics();

// ==========================================
// АВТОМАТИЧЕСКИЙ ПЕРЕРАСЧЕТ ХИТБОКСОВ ПРИ ПОВОРОТЕ ЭКРАНА
// ==========================================
window.addEventListener('resize', () => {
  chibis.forEach(c => {
    if (!c.wrapper || !c.chibi) return;
    
    // Считываем новые реальные размеры плашек после поворота
    const wrapperRect = c.wrapper.getBoundingClientRect();
    
    // Перезаписываем точки крепления и сбрасываем залипшую скорость
    c.anchorX = wrapperRect.width / 2;
    c.anchorY = wrapperRect.height;
    c.restX = wrapperRect.width / 2;
    c.restY = window.innerWidth <= 768 ? 20 : 70;
    
    // Если чибика прямо сейчас не тащат пальцем, плавно возвращаем его на новую пружину
    if (!c.isDragging) {
      c.vx = 0;
      c.vy = 0;
      c.x = c.restX;
      c.y = c.restY;
    }
  });
});

// Дублируем для мобильного события смены ориентации, чтобы сработало мгновенно
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
  }, 300);
});
