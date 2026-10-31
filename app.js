// =====================================================================
// POKÉTWIN: KANTO 151 BIOMETRIC ENGINE & FIRERED TRAINER CARD RENDERER
// =====================================================================

class PokedexAudio {
  constructor() { this.ctx = null; }
  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }
  playChirp(freq = 880, dur = 0.08) {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(); osc.stop(this.ctx.currentTime + dur);
    } catch(e) {}
  }
  playScanSweep() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1400, this.ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(); osc.stop(this.ctx.currentTime + 0.35);
    } catch(e) {}
  }
  playFanfare(shiny = false) {
    try {
      this.init();
      if (!this.ctx) return;
      const notes = shiny ? [523, 659, 784, 1046, 1318, 1568] : [440, 554, 659, 880];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = shiny ? 'triangle' : 'square';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.1 + 0.3);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.1);
        osc.stop(this.ctx.currentTime + idx * 0.1 + 0.3);
      });
    } catch(e) {}
  }
}

const audio = new PokedexAudio();

// Safe DOM Helper functions to prevent null reference crashes
function $(id) { return document.getElementById(id); }
function safeSetText(id, text) { const el = $(id); if (el) el.textContent = text; }

// Elements
const fileInput = $('file-input');
const dropZone = $('drop-zone');
const preview = $('preview');
const previewBox = $('preview-box');
const previewOverlay = $('preview-overlay-canvas');
const video = $('video');
const videoWrap = $('video-wrap');
const faceHudCanvas = $('face-hud-canvas');
const analyzeBtn = $('analyze-btn');
const camToggleBtn = $('cam-toggle-btn');
const captureBtn = $('capture-btn');
const scanOverlay = $('scan-overlay');
const scanProgress = $('scan-progress');
const scanStatusText = $('scan-status-text');
const resultCard = $('result-card');
const inputSection = $('input-section');
const faceDetectPill = $('face-detect-pill');
const faceDetectMsg = $('face-detect-msg');
const trainerNameInput = $('trainer-name-input');
const trainerIdInput = $('trainer-id-input');
const rollIdBtn = $('roll-id-btn');
const fireredCanvas = $('firered-card-canvas');

let currentStream = null;
let currentImageSrc = null;
let currentBestMatch = null;
let currentTraits = null;
let currentTrainerName = 'Trainer';
let currentTrainerId = '45256';
let currentScanTimeStr = '12 00';
let detectedExpression = 'neutral';
let detectedEmotionConfidence = 85;
let isShinyRoll = false;
let modelsLoaded = false;
let cameraAnimationId = null;

// Initialize face-api safely
async function initFaceApi() {
  try {
    if (window.faceapi) {
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]);
      modelsLoaded = true;
    }
  } catch (err) {
    modelsLoaded = false;
  }
}
initFaceApi();

// Trainer ID & Name Initialization
function generateRandomTrainerId() {
  return String(Math.floor(10000 + Math.random() * 90000));
}

if (!localStorage.getItem('poketwin_trainer_id')) {
  localStorage.setItem('poketwin_trainer_id', generateRandomTrainerId());
}
if (trainerIdInput) {
  trainerIdInput.value = localStorage.getItem('poketwin_trainer_id');
  trainerIdInput.addEventListener('input', () => {
    localStorage.setItem('poketwin_trainer_id', trainerIdInput.value.trim());
  });
}
if (rollIdBtn) {
  rollIdBtn.addEventListener('click', () => {
    const newId = generateRandomTrainerId();
    if (trainerIdInput) trainerIdInput.value = newId;
    localStorage.setItem('poketwin_trainer_id', newId);
    audio.playChirp(1040, 0.05);
  });
}

if (trainerNameInput) {
  if (localStorage.getItem('poketwin_trainer_name')) {
    trainerNameInput.value = localStorage.getItem('poketwin_trainer_name');
  }
  trainerNameInput.addEventListener('input', () => {
    localStorage.setItem('poketwin_trainer_name', trainerNameInput.value.trim());
  });
}

// Dropzone & File Handlers
if (dropZone) {
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault(); dropZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleImageFile(e.dataTransfer.files[0]);
  });
  dropZone.addEventListener('click', () => fileInput && fileInput.click());
}

if (fileInput) {
  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files[0]) handleImageFile(fileInput.files[0]);
  });
}

function handleImageFile(file) {
  if (!file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = (e) => loadPreview(e.target.result);
  reader.readAsDataURL(file);
}

function loadPreview(src) {
  currentImageSrc = src;
  if (preview) preview.src = src;
  if (previewBox) previewBox.style.display = 'block';
  if (analyzeBtn) analyzeBtn.disabled = false;
  stopCamera();
  audio.playChirp(700, 0.05);
  if (preview) {
    preview.onload = () => { analyzeFacialFrame(preview, previewOverlay); };
  }
}

// Webcam support
if (camToggleBtn) {
  camToggleBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (currentStream) { stopCamera(); return; }
    try {
      currentStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false
      });
      if (video) video.srcObject = currentStream;
      if (videoWrap) videoWrap.style.display = 'block';
      camToggleBtn.textContent = '❌ Stop Camera';
      audio.playChirp(900, 0.06);
      if (video) video.onloadedmetadata = () => { runLiveCameraHud(); };
    } catch (err) {
      alert('Camera unavailable. Check permissions or upload a portrait photo.');
    }
  });
}

function runLiveCameraHud() {
  if (!currentStream || !faceHudCanvas || !video) return;
  faceHudCanvas.width = video.videoWidth || 640;
  faceHudCanvas.height = video.videoHeight || 480;
  const ctx = faceHudCanvas.getContext('2d');

  function renderHud() {
    if (!currentStream) return;
    ctx.clearRect(0, 0, faceHudCanvas.width, faceHudCanvas.height);
    const cx = faceHudCanvas.width / 2, cy = faceHudCanvas.height / 2;
    const boxSize = Math.min(faceHudCanvas.width, faceHudCanvas.height) * 0.55;
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    const s = boxSize / 2, corner = 24;

    ctx.beginPath(); ctx.moveTo(cx - s, cy - s + corner); ctx.lineTo(cx - s, cy - s); ctx.lineTo(cx - s + corner, cy - s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + s - corner, cy - s); ctx.lineTo(cx + s, cy - s); ctx.lineTo(cx + s, cy - s + corner); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - s, cy + s - corner); ctx.lineTo(cx - s, cy + s); ctx.lineTo(cx - s + corner, cy + s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + s - corner, cy + s); ctx.lineTo(cx + s, cy + s); ctx.lineTo(cx + s, cy - s + corner); ctx.stroke();

    ctx.fillStyle = 'rgba(6, 182, 212, 0.8)';
    ctx.fillRect(cx - 10, cy, 20, 1); ctx.fillRect(cx, cy - 10, 1, 20);
    cameraAnimationId = requestAnimationFrame(renderHud);
  }
  renderHud();
}

if (captureBtn) {
  captureBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0); ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    loadPreview(canvas.toDataURL('image/jpeg', 0.94));
    stopCamera();
  });
}

function stopCamera() {
  if (currentStream) { currentStream.getTracks().forEach(t => t.stop()); currentStream = null; }
  if (cameraAnimationId) { cancelAnimationFrame(cameraAnimationId); cameraAnimationId = null; }
  if (videoWrap) videoWrap.style.display = 'none';
  if (camToggleBtn) camToggleBtn.textContent = '📷 Take Live Selfie';
}

// Biometric Feature Extractor
async function analyzeFacialFrame(imgEl, overlayCanvas) {
  if (faceDetectPill) faceDetectPill.style.display = 'flex';
  safeSetText('face-detect-msg', 'CALIBRATING FACIAL GEOMETRY & EXPRESSIONS...');

  let faceBox = null;
  let expressionResult = null;

  if (modelsLoaded && window.faceapi) {
    try {
      const detection = await faceapi.detectSingleFace(imgEl, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
      if (detection) {
        faceBox = detection.detection.box;
        expressionResult = detection.expressions;
      }
    } catch (err) {}
  }

  if (!expressionResult) expressionResult = estimateGeometricExpression(imgEl);

  let topExpr = 'neutral', topScore = 0;
  for (const [expr, score] of Object.entries(expressionResult)) {
    if (score > topScore) { topScore = score; topExpr = expr; }
  }
  detectedExpression = topExpr;
  detectedEmotionConfidence = Math.round(topScore * 100);

  if (overlayCanvas) {
    overlayCanvas.width = imgEl.naturalWidth || 300;
    overlayCanvas.height = imgEl.naturalHeight || 300;
    const ctx = overlayCanvas.getContext('2d');
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    const bx = faceBox ? faceBox.x : overlayCanvas.width * 0.2;
    const by = faceBox ? faceBox.y : overlayCanvas.height * 0.15;
    const bw = faceBox ? faceBox.width : overlayCanvas.width * 0.6;
    const bh = faceBox ? faceBox.height : overlayCanvas.height * 0.65;

    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = Math.max(2, overlayCanvas.width * 0.008);
    const cr = Math.min(bw, bh) * 0.15;
    ctx.beginPath(); ctx.moveTo(bx, by + cr); ctx.lineTo(bx, by); ctx.lineTo(bx + cr, by); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx + bw - cr, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + cr); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx, by + bh - cr); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + cr, by + bh); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx + bw - cr, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + bh - cr); ctx.stroke();
  }

  const exprEmoji = {
    happy: '😄 RADIANT JOY', neutral: '😌 CALM / ZEN', angry: '😠 FIERCE / BOLD',
    surprised: '😲 HIGH ENERGY', sad: '🌧️ DEEP MYSTIC', fearful: '🔮 ENIGMATIC AURA'
  }[detectedExpression] || '✨ CHARISMATIC';
  safeSetText('face-detect-msg', `DETECTED: ${exprEmoji}`);
}

function estimateGeometricExpression(img) {
  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, 64, 64);
  const data = ctx.getImageData(0, 0, 64, 64).data;
  let upperLum = 0, lowerLum = 0, upperCount = 0, lowerCount = 0;
  for (let y = 16; y < 36; y++) {
    for (let x = 16; x < 48; x++) {
      const idx = (y * 64 + x) * 4;
      upperLum += 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      upperCount++;
    }
  }
  for (let y = 40; y < 58; y++) {
    for (let x = 18; x < 46; x++) {
      const idx = (y * 64 + x) * 4;
      lowerLum += 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      lowerCount++;
    }
  }
  const mouthRatio = (lowerLum / (lowerCount || 1)) / (upperLum / (upperCount || 1) || 1);
  if (mouthRatio > 1.07) return { happy: 0.88, neutral: 0.08, surprised: 0.04 };
  if (mouthRatio < 0.94) return { angry: 0.75, neutral: 0.2 };
  return { neutral: 0.82, happy: 0.1, angry: 0.08 };
}

function loadSampleExpression(type) {
  const canvas = document.createElement('canvas');
  canvas.width = 300; canvas.height = 300;
  const ctx = canvas.getContext('2d');

  if (type === 'happy') {
    ctx.fillStyle = '#fef08a'; ctx.fillRect(0, 0, 300, 300);
    ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(150, 150, 90, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.beginPath(); ctx.arc(120, 130, 10, 0, Math.PI * 2); ctx.arc(180, 130, 10, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 8; ctx.strokeStyle = '#1e293b';
    ctx.beginPath(); ctx.arc(150, 150, 50, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
  } else if (type === 'calm') {
    ctx.fillStyle = '#bae6fd'; ctx.fillRect(0, 0, 300, 300);
    ctx.fillStyle = '#7dd3fc'; ctx.beginPath(); ctx.arc(150, 150, 90, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = '#0369a1';
    ctx.beginPath(); ctx.arc(120, 140, 14, Math.PI, 0); ctx.stroke();
    ctx.beginPath(); ctx.arc(180, 140, 14, Math.PI, 0); ctx.stroke();
    ctx.beginPath(); ctx.arc(150, 165, 20, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
  } else if (type === 'fierce') {
    ctx.fillStyle = '#fecaca'; ctx.fillRect(0, 0, 300, 300);
    ctx.fillStyle = '#f87171'; ctx.beginPath(); ctx.arc(150, 150, 90, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.beginPath(); ctx.moveTo(100, 130); ctx.lineTo(135, 140); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(200, 130); ctx.lineTo(165, 140); ctx.stroke();
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(125, 190); ctx.lineTo(175, 190); ctx.stroke();
  } else if (type === 'mystic') {
    ctx.fillStyle = '#e9d5ff'; ctx.fillRect(0, 0, 300, 300);
    ctx.fillStyle = '#c084fc'; ctx.beginPath(); ctx.arc(150, 150, 90, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#581c87';
    ctx.beginPath(); ctx.arc(120, 135, 8, 0, Math.PI * 2); ctx.arc(180, 135, 8, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = '#581c87';
    ctx.beginPath(); ctx.arc(150, 180, 16, Math.PI, 0); ctx.stroke();
  } else if (type === 'playful') {
    ctx.fillStyle = '#fed7aa'; ctx.fillRect(0, 0, 300, 300);
    ctx.fillStyle = '#fb923c'; ctx.beginPath(); ctx.arc(150, 150, 90, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = '#431407';
    ctx.beginPath(); ctx.arc(120, 135, 12, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
    ctx.fillStyle = '#431407'; ctx.beginPath(); ctx.arc(180, 135, 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(150, 165, 30, 0, Math.PI); ctx.stroke();
  } else if (type === 'surprised') {
    ctx.fillStyle = '#fef3c7'; ctx.fillRect(0, 0, 300, 300);
    ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(150, 150, 90, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.beginPath(); ctx.arc(120, 125, 14, 0, Math.PI * 2); ctx.arc(180, 125, 14, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = '#1e293b';
    ctx.beginPath(); ctx.arc(150, 180, 22, 0, Math.PI * 2); ctx.stroke();
  }

  loadPreview(canvas.toDataURL('image/jpeg', 0.94));
}

// 32-bit FNV-1a Hash for Deterministic Trainer Biometric Consistency
function getBiometricHash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

// =====================================================================
// MATCHING ENGINE: 100% 151 COVERAGE + RESCAN CONSISTENCY
// =====================================================================
if (analyzeBtn) {
  analyzeBtn.addEventListener('click', () => {
    if (!currentImageSrc) return;
    currentTrainerName = (trainerNameInput ? trainerNameInput.value.trim() : '') || 'Trainer';
    currentTrainerId = (trainerIdInput ? trainerIdInput.value.trim() : '') || generateRandomTrainerId();
    
    const now = new Date();
    currentScanTimeStr = `${String(now.getHours()).padStart(2, '0')} ${String(now.getMinutes()).padStart(2, '0')}`;
    
    audio.init();
    startScanSequence();
  });
}

function startScanSequence() {
  if (inputSection) inputSection.style.display = 'none';
  if (resultCard) resultCard.style.display = 'none';
  if (scanOverlay) scanOverlay.style.display = 'block';

  let progress = 0;
  const messages = [
    `AUTHENTICATING TRAINER: ${currentTrainerName.toUpperCase()} [ID#${currentTrainerId}]...`,
    `PARSING BIOMETRIC LANDMARK MESH...`,
    'CALCULATING 5D POKÉDEX CENTROID AFFINITY...',
    'SYNCHRONIZING SILPH CO. ARCHIVES...',
    'PRINTING RETRO TRAINER CARD...'
  ];

  const interval = setInterval(() => {
    progress += 20;
    if (scanProgress) scanProgress.style.width = progress + '%';
    const msgIdx = Math.min(Math.floor(progress / 20), messages.length - 1);
    safeSetText('scan-status-text', messages[msgIdx]);
    audio.playScanSweep();

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        try {
          executeMatching();
        } catch (err) {
          console.error('Error during matching execution:', err);
        } finally {
          // ALWAYS ensure loading overlay hides and results display!
          if (scanOverlay) scanOverlay.style.display = 'none';
          if (resultCard) resultCard.style.display = 'block';
        }
      }, 300);
    }
  }, 220);
}

function executeMatching() {
  const canvas = document.createElement('canvas');
  canvas.width = 80; canvas.height = 80;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (preview) ctx.drawImage(preview, 0, 0, 80, 80);
  const imgData = ctx.getImageData(0, 0, 80, 80).data;

  let upperLum = 0, lowerLum = 0, totalLum = 0, count = 0;
  let rSum = 0, gSum = 0, bSum = 0;

  for (let y = 0; y < 80; y++) {
    for (let x = 0; x < 80; x++) {
      const idx = (y * 80 + x) * 4;
      if (imgData[idx + 3] < 80) continue;
      const r = imgData[idx], g = imgData[idx + 1], b = imgData[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      rSum += r; gSum += g; bSum += b; totalLum += lum; count++;
      if (y >= 15 && y <= 40) upperLum += lum;
      if (y >= 45 && y <= 70) lowerLum += lum;
    }
  }

  if (count === 0) count = 1;
  const avgR = rSum / count, avgG = gSum / count, avgB = bSum / count, avgLum = totalLum / count;
  const smileRatio = (lowerLum / 25) / ((upperLum / 25) || 1);

  // 5D Normalized Trait Vector (Energy, Chill, Cuteness, Mystery, Bravery)
  let energy = Math.round(Math.min(95, Math.max(15, (avgR / (avgB || 1)) * 30 + (smileRatio > 1.05 ? 30 : 10))));
  let chill = Math.round(Math.min(95, Math.max(15, (avgB / (avgR || 1)) * 40 + (smileRatio <= 1.02 ? 35 : 10))));
  let cuteness = Math.round(Math.min(95, Math.max(15, smileRatio * 45 + (avgLum / 255) * 35)));
  let mystery = Math.round(Math.min(95, Math.max(15, (1 - avgLum / 255) * 60 + (avgB > avgG ? 25 : 10))));
  let bravery = Math.round(Math.min(95, Math.max(15, (avgR / 255) * 50 + (energy > 60 ? 30 : 15))));

  if (detectedExpression === 'happy') { cuteness += 25; energy += 20; }
  else if (detectedExpression === 'neutral') { chill += 30; mystery += 10; }
  else if (detectedExpression === 'angry') { bravery += 35; energy += 15; }
  else if (detectedExpression === 'surprised') { energy += 35; mystery += 15; }

  energy = Math.min(99, Math.max(10, energy));
  chill = Math.min(99, Math.max(10, chill));
  cuteness = Math.min(99, Math.max(10, cuteness));
  mystery = Math.min(99, Math.max(10, mystery));
  bravery = Math.min(99, Math.max(10, bravery));

  currentTraits = { energy, chill, cuteness, mystery, bravery, avgR: Math.round(avgR), avgG: Math.round(avgG), avgB: Math.round(avgB) };

  // Biometric Identity Key for Rescan Consistency
  const trainerClean = currentTrainerName.toLowerCase();
  const binnedFace = `${Math.round(energy / 12)}-${Math.round(chill / 12)}-${Math.round(cuteness / 12)}`;
  const biometricKey = `${trainerClean}_${currentTrainerId}_${binnedFace}`;
  const trainerHash = getBiometricHash(biometricKey);

  // 100% Attainability: Low-discrepancy 151 centroid space-filling distribution
  const ranked = KANTO_POKEDEX.map(p => {
    let pe = 50.0, pc = 50.0, pcu = 50.0, pm = 50.0, pb = 50.0;
    const types = p.types;

    if (types.includes('Electric')) { pe += 28; pcu += 10; pc -= 15; }
    if (types.includes('Fire'))     { pe += 24; pb += 24; pc -= 20; }
    if (types.includes('Water'))    { pc += 24; pcu += 8; pe -= 8; }
    if (types.includes('Grass'))    { pc += 28; pm += 8; pe -= 10; }
    if (types.includes('Ghost'))    { pm += 36; pcu -= 12; pe += 8; }
    if (types.includes('Psychic'))  { pm += 28; pc += 12; pe += 8; }
    if (types.includes('Fighting')) { pb += 32; pe += 16; pcu -= 16; }
    if (types.includes('Fairy'))    { pcu += 36; pe += 8; }
    if (types.includes('Normal'))   { pcu += 12; pc += 12; }
    if (types.includes('Dragon'))   { pb += 28; pm += 20; pe += 12; }
    if (types.includes('Rock') || types.includes('Ground')) { pb += 24; pc += 8; pe -= 12; }
    if (types.includes('Bug'))      { pcu += 12; pe += 8; }
    if (types.includes('Poison'))   { pm += 20; pb += 8; }
    if (types.includes('Ice'))      { pc += 24; pm += 16; }

    // Space-filling coordinate dispersion across 151
    pe += ((p.id * 37) % 41) - 20;
    pc += ((p.id * 43) % 41) - 20;
    pcu += ((p.id * 53) % 41) - 20;
    pm += ((p.id * 61) % 41) - 20;
    pb += ((p.id * 71) % 41) - 20;

    const traitDist = Math.hypot(energy - pe, chill - pc, cuteness - pcu, mystery - pm, bravery - pb);
    
    // Hash proximity factor for deterministic repeat scans
    const hTarget = (trainerHash % 151) + 1;
    const hDist = Math.min(Math.abs(p.id - hTarget), 151 - Math.abs(p.id - hTarget));
    const totalDist = 0.70 * traitDist + 0.30 * (hDist * 2.2);

    const sync = Math.round(Math.max(74, Math.min(99, 100 - (totalDist / 3.4))));
    return { p, dist: totalDist, sync };
  }).sort((a, b) => a.dist - b.dist);

  currentBestMatch = ranked[0];
  const runners = [ranked[1], ranked[2], ranked[3]];

  isShinyRoll = (trainerHash % 100 === 0); // 1/100 Shiny Encounter Rate

  // Log scan event for SQL & Power BI analytics
  logScanEvent({
    trainer_name: currentTrainerName,
    trainer_id: currentTrainerId,
    pokemon_id: currentBestMatch.p.id,
    pokemon_name: currentBestMatch.p.name,
    primary_type: currentBestMatch.p.types[0],
    sync_rate: currentBestMatch.sync,
    is_shiny: isShinyRoll ? 1 : 0,
    emotion: detectedExpression,
    traits: currentTraits
  });

  displayResults(currentBestMatch, runners, currentTraits);
  renderFireRedTrainerCard(fireredCanvas, currentBestMatch, currentTraits);
}

function displayResults(top, runners, traits) {
  const p = top.p;
  const padId = String(p.id).padStart(3, '0');

  const artUrl = isShinyRoll
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${p.id}.png`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`;

  const fallbackSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`;

  const imgEl = $('pokemon-img');
  if (imgEl) {
    imgEl.src = artUrl;
    imgEl.onerror = () => { imgEl.src = fallbackSprite; };
  }

  safeSetText('pokemon-id', `#${padId}`);
  safeSetText('pokemon-name', p.name);
  safeSetText('match-score-badge', `KANTO SYNC: ${top.sync}%`);
  safeSetText('result-headline', `${currentTrainerName}, your Kanto Spirit Twin is ${p.name}!`);
  safeSetText('trainer-tag-display', `TRAINER: ${currentTrainerName.toUpperCase()} • IDNo. ${currentTrainerId}`);
  safeSetText('spec-trainer-name', currentTrainerName);
  safeSetText('spec-trainer-id', currentTrainerId);
  safeSetText('spec-scan-time', currentScanTimeStr);
  safeSetText('pokemon-lore', p.lore);
  safeSetText('pokemon-nature', p.nature);
  safeSetText('pokemon-move', p.move);

  const expressionLabels = {
    happy: '😄 Joyous Radiance', neutral: '😌 Zen Equilibrium', angry: '😠 Fierce Resolve',
    surprised: '😲 Electric Awe', sad: '🌧️ Mystic Depth', fearful: '🔮 Enigmatic Aura'
  };
  safeSetText('detected-expression-badge', `EXPRESSION: ${expressionLabels[detectedExpression] || '✨ CHARISMATIC'}`);

  const shinyTag = $('shiny-tag');
  if (shinyTag) shinyTag.style.display = isShinyRoll ? 'block' : 'none';

  const typesContainer = $('pokemon-types');
  if (typesContainer) {
    typesContainer.innerHTML = '';
    p.types.forEach(t => {
      const b = document.createElement('span');
      b.className = 'type-badge';
      b.textContent = t;
      b.style.backgroundColor = TYPE_COLORS[t] || '#777';
      b.style.color = '#fff';
      typesContainer.appendChild(b);
    });
  }

  setTraitMeter('trait-energy', traits.energy);
  setTraitMeter('trait-chill', traits.chill);
  setTraitMeter('trait-cuteness', traits.cuteness);
  setTraitMeter('trait-mystery', traits.mystery);
  setTraitMeter('trait-bravery', traits.bravery);

  const runnersBox = $('runners-container');
  if (runnersBox) {
    runnersBox.innerHTML = '';
    runners.forEach(r => {
      const item = document.createElement('div');
      item.className = 'runner-card';
      const rId = String(r.p.id).padStart(3, '0');
      const rSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${r.p.id}.png`;
      item.innerHTML = `
        <img src="${rSprite}" alt="${r.p.name}">
        <div>
          <div class="runner-name">#${rId} ${r.p.name}</div>
          <div class="runner-sync">${r.sync}% RESONANCE</div>
        </div>
      `;
      runnersBox.appendChild(item);
    });
  }

  audio.playFanfare(isShinyRoll);
}

function setTraitMeter(id, val) {
  const fill = $(id);
  const text = $(id + '-val');
  if (fill) fill.style.width = val + '%';
  if (text) text.textContent = val + '%';
}

function resetScan() {
  stopCamera();
  if (resultCard) resultCard.style.display = 'none';
  if (scanOverlay) scanOverlay.style.display = 'none';
  if (inputSection) inputSection.style.display = 'block';
  if (previewBox) previewBox.style.display = 'none';
  if (preview) preview.src = '';
  currentImageSrc = null;
  if (analyzeBtn) analyzeBtn.disabled = true;
  if (fileInput) fileInput.value = '';
  if (faceDetectPill) faceDetectPill.style.display = 'none';
}

// =====================================================================
// RETRO FIRERED / LEAFGREEN TRAINER CARD RENDERER
// =====================================================================
const FIRERED_TEMPLATE_B64 = "data:image/png;base64,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";
const cardTemplateImg = new Image();
cardTemplateImg.src = FIRERED_TEMPLATE_B64;

function renderFireRedTrainerCard(targetCanvas, matchObj, traits) {
  if (!targetCanvas) return;
  const ctx = targetCanvas.getContext('2d');
  const w = 750, h = 498;
  targetCanvas.width = w;
  targetCanvas.height = h;
  ctx.imageSmoothingEnabled = false;

  const drawCardContents = () => {
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(cardTemplateImg, 0, 0, w, h);

    // 1. Dynamic IDNo. (top right pill) - perfectly baseline-aligned with IDNo.
    const cleanIdStr = String(currentTrainerId || '45256').trim();
    let idFontSize = 18;
    ctx.font = `${idFontSize}px "Press Start 2P", monospace`;
    while (ctx.measureText(cleanIdStr).width > 148 && idFontSize > 10) {
      idFontSize -= 1;
      ctx.font = `${idFontSize}px "Press Start 2P", monospace`;
    }
    const idX = 564;
    const idY = 90;
    ctx.fillStyle = '#b8c0c0';
    ctx.fillText(cleanIdStr, idX + 1, idY + 1);
    ctx.fillStyle = '#484848';
    ctx.fillText(cleanIdStr, idX, idY);

    // 2. Dynamic NAME (top row) - sits directly on the name line and matches NAME: baseline
    const tName = currentTrainerName.toUpperCase().substring(0, 14);
    let nameFontSize = 20;
    ctx.font = `${nameFontSize}px "Press Start 2P", monospace`;
    while (ctx.measureText(tName).width > 230 && nameFontSize > 11) {
      nameFontSize -= 1;
      ctx.font = `${nameFontSize}px "Press Start 2P", monospace`;
    }
    const nameX = 195;
    const nameY = 150;
    ctx.fillStyle = '#c0c8c8';
    ctx.fillText(tName, nameX + 2, nameY + 2);
    ctx.fillStyle = '#484848';
    ctx.fillText(tName, nameX, nameY);

    // 3. Dynamic POKéMON Name (replaces Pokédex count)
    const pName = matchObj.p.name.toUpperCase();
    ctx.font = '18px "Press Start 2P", monospace';
    const pWidth = ctx.measureText(pName).width;
    ctx.fillStyle = '#c0c8c8';
    ctx.fillText(pName, 452 - pWidth, 285);
    ctx.fillStyle = '#484848';
    ctx.fillText(pName, 450 - pWidth, 283);

    // 4. Dynamic TIME of Scan
    ctx.font = '20px "Press Start 2P", monospace';
    const timeWidth = ctx.measureText(currentScanTimeStr).width;
    ctx.fillStyle = '#c0c8c8';
    ctx.fillText(currentScanTimeStr, 452 - timeWidth, 335);
    ctx.fillStyle = '#484848';
    ctx.fillText(currentScanTimeStr, 450 - timeWidth, 333);

    // 5. Draw Matched Pokémon Sprite right beside Trainer Red
    const pkmSprite = new Image();
    pkmSprite.crossOrigin = 'anonymous';
    pkmSprite.onload = () => {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(pkmSprite, 462, 228, 120, 120);
    };
    pkmSprite.src = isShinyRoll
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${matchObj.p.id}.png`
      : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${matchObj.p.id}.png`;
  };

  if (cardTemplateImg.complete && cardTemplateImg.naturalWidth > 0) {
    drawCardContents();
  } else {
    cardTemplateImg.onload = drawCardContents;
  }
}

// Download Button
const downloadBtn = $('download-card-btn');
if (downloadBtn) {
  downloadBtn.addEventListener('click', () => {
    if (!currentBestMatch || !fireredCanvas) return;
    const a = document.createElement('a');
    a.download = `TrainerCard-${currentTrainerName}-${currentBestMatch.p.name}.png`;
    a.href = fireredCanvas.toDataURL('image/png');
    a.click();
  });
}

// Copy Summary
const shareBtn = $('share-summary-btn');
if (shareBtn) {
  shareBtn.addEventListener('click', () => {
    if (!currentBestMatch) return;
    const p = currentBestMatch.p;
    const text = `🎮 Official Kanto Trainer Card!\nTrainer: ${currentTrainerName} (IDNo.${currentTrainerId})\nTime of Scan: ${currentScanTimeStr}\nPokémon Partner: #${String(p.id).padStart(3, '0')} ${p.name} (${p.types.join('/')})\nResonance: ${currentBestMatch.sync}%\n"${p.lore}"`;
    navigator.clipboard.writeText(text).then(() => {
      alert('Trainer Card summary copied to clipboard!');
    });
  });
}

// Analytics Event Logger
function getStoredScans() {
  try {
    const raw = localStorage.getItem('poketwin_analytics_fact');
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

function logScanEvent(evt) {
  const scans = getStoredScans();
  const newRecord = {
    scan_id: 'SCN-' + (10000 + scans.length + 1),
    trainer_name: evt.trainer_name,
    trainer_id: evt.trainer_id,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    emotion: evt.emotion,
    pokemon_id: evt.pokemon_id,
    pokemon_name: evt.pokemon_name,
    primary_type: evt.primary_type,
    sync_rate: evt.sync_rate,
    is_shiny: evt.is_shiny
  };
  scans.unshift(newRecord);
  if (scans.length > 200) scans.pop();
  localStorage.setItem('poketwin_analytics_fact', JSON.stringify(scans));
}

// Analytics Modal Handlers
const analyticsModal = $('analytics-modal');
const openAnalyticsBtn = $('open-analytics-btn');
const analyticsCloseBtn = $('analytics-close-btn');

if (openAnalyticsBtn) openAnalyticsBtn.addEventListener('click', openAnalyticsModal);
if (analyticsCloseBtn) analyticsCloseBtn.addEventListener('click', () => { if (analyticsModal) analyticsModal.style.display = 'none'; });

function openAnalyticsModal() {
  if (analyticsModal) analyticsModal.style.display = 'block';
  renderAnalyticsDashboard();
}

function renderAnalyticsDashboard() {
  const scans = getStoredScans();
  safeSetText('kpi-total-scans', scans.length);
  const trainers = new Set(scans.map(s => s.trainer_name));
  safeSetText('kpi-unique-trainers', trainers.size);

  if (scans.length > 0) {
    const avgSync = Math.round(scans.reduce((acc, s) => acc + s.sync_rate, 0) / scans.length);
    safeSetText('kpi-avg-sync', avgSync + '%');
    const shinies = scans.filter(s => s.is_shiny === 1).length;
    safeSetText('kpi-shiny-count', shinies);
  } else {
    safeSetText('kpi-avg-sync', '0%');
    safeSetText('kpi-shiny-count', '0');
  }

  const tbody = $('analytics-tbody');
  if (tbody) {
    tbody.innerHTML = '';
    if (scans.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #64748b; padding: 16px;">No scans recorded yet.</td></tr>';
      return;
    }

    scans.slice(0, 15).forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-family: monospace; color: #38bdf8;">${s.scan_id}</td>
        <td style="font-weight: 700;">${s.trainer_name}</td>
        <td style="font-family: monospace; color: #fbbf24;">${s.trainer_id || '45256'}</td>
        <td style="color: #94a3b8; font-size: 11px;">${s.timestamp}</td>
        <td><span style="text-transform: capitalize;">${s.emotion}</span></td>
        <td>#${String(s.pokemon_id).padStart(3, '0')} ${s.pokemon_name}</td>
        <td style="font-family: monospace; color: #4ade80;">${s.sync_rate}%</td>
        <td>${s.is_shiny ? '✨ Yes' : 'No'}</td>
      `;
      tbody.appendChild(tr);
    });
  }
}

const clearDataBtn = $('clear-data-btn');
if (clearDataBtn) {
  clearDataBtn.addEventListener('click', () => {
    if (confirm('Clear local scan analytics log?')) {
      localStorage.removeItem('poketwin_analytics_fact');
      renderAnalyticsDashboard();
    }
  });
}

// 151 Pokédex Modal
const modal = $('pokedex-modal');
const openModalBtn = $('open-roster-btn');
const closeModalBtn = $('modal-close-btn');
const searchInput = $('search-151');
const typeFilter = $('filter-type');
const modalGrid = $('modal-roster-grid');

if (openModalBtn) openModalBtn.addEventListener('click', () => { if (modal) modal.style.display = 'block'; renderModalRoster(); });
if (closeModalBtn) closeModalBtn.addEventListener('click', () => { if (modal) modal.style.display = 'none'; });
window.addEventListener('click', (e) => {
  if (e.target === modal) modal.style.display = 'none';
  if (e.target === analyticsModal) analyticsModal.style.display = 'none';
});

function renderModalRoster() {
  if (!modalGrid) return;
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const filter = typeFilter ? typeFilter.value : '';
  const filtered = KANTO_POKEDEX.filter(p => {
    const padId = String(p.id).padStart(3, '0');
    return (p.name.toLowerCase().includes(query) || padId.includes(query)) && (!filter || p.types.includes(filter));
  });

  modalGrid.innerHTML = '';
  filtered.forEach(p => {
    const el = document.createElement('div');
    el.className = 'roster-item';
    const padId = String(p.id).padStart(3, '0');
    const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`;
    el.innerHTML = `
      <img src="${sprite}" alt="${p.name}" loading="lazy">
      <div class="roster-id">#${padId}</div>
      <div class="roster-name">${p.name}</div>
    `;
    el.addEventListener('click', () => {
      if (modal) modal.style.display = 'none';
      currentTrainerName = (trainerNameInput ? trainerNameInput.value.trim() : '') || 'Trainer';
      currentTrainerId = (trainerIdInput ? trainerIdInput.value.trim() : '') || '45256';
      const now = new Date();
      currentScanTimeStr = `${String(now.getHours()).padStart(2, '0')} ${String(now.getMinutes()).padStart(2, '0')}`;
      
      const topObj = { p, sync: 100, dist: 0 };
      displayResults(topObj, [
        { p: KANTO_POKEDEX[(p.id) % 151], sync: 94 },
        { p: KANTO_POKEDEX[(p.id + 1) % 151], sync: 88 },
        { p: KANTO_POKEDEX[(p.id + 2) % 151], sync: 82 }
      ], { energy: 75, chill: 65, cuteness: 70, mystery: 50, bravery: 80, avgR: p.c[0], avgG: p.c[1], avgB: p.c[2] });
      
      renderFireRedTrainerCard(fireredCanvas, topObj, currentTraits);
      if (inputSection) inputSection.style.display = 'none';
      if (resultCard) resultCard.style.display = 'block';
    });
    modalGrid.appendChild(el);
  });
}

if (searchInput) searchInput.addEventListener('input', renderModalRoster);
if (typeFilter) typeFilter.addEventListener('change', renderModalRoster);

function getYearOfStudy(id) {
  const cleanId = String(id || '').trim();
  if (cleanId.startsWith('260') || cleanId.includes('260')) return '1st Year';
  if (cleanId.startsWith('250') || cleanId.includes('250')) return '2nd Year';
  if (cleanId.startsWith('240') || cleanId.includes('240')) return '3rd Year';
  if (cleanId.startsWith('230') || cleanId.includes('230')) return '4th/5th Year';
  return 'Student';
}

function downloadFile(content, fileName, mimeType) {
  try {
    const blob = new Blob([content], { type: mimeType || 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      try {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {}
    }, 250);
  } catch (err) {
    console.error('Download error:', err);
    alert('Failed to trigger download: ' + err.message);
  }
}

// Robust Export Bindings for Power BI, SQL & CSV
window.exportFactCsv = function() {
  let scans = getStoredScans();
  if (!scans || scans.length === 0) {
    if (currentBestMatch && currentBestMatch.p) {
      scans = [{
        scan_id: 'SCN-10001',
        trainer_name: currentTrainerName || 'Trainer',
        trainer_id: currentTrainerId || '9926010123',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        emotion: detectedExpression || 'confident',
        pokemon_id: currentBestMatch.p.id,
        pokemon_name: currentBestMatch.p.name,
        primary_type: currentBestMatch.p.types[0],
        sync_rate: currentBestMatch.sync || 95,
        is_shiny: isShinyRoll ? 1 : 0
      }];
    } else {
      scans = [{
        scan_id: 'SCN-10001',
        trainer_name: currentTrainerName || 'Trainer Ash',
        trainer_id: currentTrainerId || '9926010123',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        emotion: 'confident',
        pokemon_id: 25,
        pokemon_name: 'Pikachu',
        primary_type: 'Electric',
        sync_rate: 98.5,
        is_shiny: 0
      }];
    }
  }

  const headers = ['scan_id', 'trainer_name', 'trainer_id', 'email', 'year_of_study', 'scan_timestamp', 'detected_emotion', 'matched_pokemon_id', 'matched_pokemon_name', 'primary_type', 'sync_rate_pct', 'is_shiny'];
  let csv = headers.join(',') + '\n';
  scans.forEach(s => {
    const tid = String(s.trainer_id || '45256').trim();
    const email = `${tid}@mail.jiit.ac.in`;
    const year = getYearOfStudy(tid);
    const cleanName = (s.trainer_name || 'Trainer').replace(/"/g, '""');
    const pName = (s.pokemon_name || 'Unknown').replace(/"/g, '""');
    const pType = (s.primary_type || 'Normal').replace(/"/g, '""');
    const pId = s.pokemon_id || 1;
    const sync = s.sync_rate !== undefined ? s.sync_rate : 90;
    const shiny = s.is_shiny ? 1 : 0;
    const time = s.timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19);
    const emo = s.emotion || 'neutral';
    csv += `${s.scan_id},"${cleanName}","${tid}","${email}","${year}","${time}","${emo}",${pId},"${pName}","${pType}",${sync},${shiny}\n`;
  });
  downloadFile(csv, 'poketwin_fact_user_scans.csv', 'text/csv;charset=utf-8;');
};

window.exportDimCsv = function() {
  const headers = ['pokedex_id', 'name', 'primary_type', 'secondary_type', 'rgb_r', 'rgb_g', 'rgb_b', 'nature', 'signature_move', 'lore'];
  let csv = headers.join(',') + '\n';
  KANTO_POKEDEX.forEach(p => {
    const sec = p.types[1] ? `"${p.types[1]}"` : '';
    const safeLore = (p.lore || '').replace(/"/g, '""');
    csv += `${p.id},"${p.name}","${p.types[0]}",${sec},${p.c[0]},${p.c[1]},${p.c[2]},"${p.nature}","${p.move}","${safeLore}"\n`;
  });
  downloadFile(csv, 'poketwin_dim_pokemon.csv', 'text/csv;charset=utf-8;');
};

window.exportSqlQueries = function() {
  const sql = `-- PokéTwin Relational Schema & Analytical Queries for PostgreSQL / MySQL
CREATE TABLE dim_pokemon (
    pokedex_id INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    primary_type VARCHAR(30) NOT NULL,
    secondary_type VARCHAR(30),
    nature VARCHAR(30),
    signature_move VARCHAR(60),
    lore TEXT
);

CREATE TABLE fact_user_scans (
    scan_id VARCHAR(20) PRIMARY KEY,
    trainer_name VARCHAR(50) NOT NULL,
    trainer_id VARCHAR(20) NOT NULL,
    email VARCHAR(80),
    year_of_study VARCHAR(30),
    scan_timestamp TIMESTAMP NOT NULL,
    detected_emotion VARCHAR(30) NOT NULL,
    matched_pokemon_id INT NOT NULL,
    sync_rate_pct DECIMAL(5,2),
    is_shiny INT DEFAULT 0,
    CONSTRAINT fk_pokemon FOREIGN KEY (matched_pokemon_id) REFERENCES dim_pokemon(pokedex_id)
);

-- Analytical Queries for Power BI & SQL Reports
-- 1. Top Twin Pokémon by Total User Resonance
SELECT p.pokedex_id, p.name, p.primary_type, COUNT(s.scan_id) AS total_matches, ROUND(AVG(s.sync_rate_pct), 2) AS avg_sync_pct
FROM fact_user_scans s 
JOIN dim_pokemon p ON s.matched_pokemon_id = p.pokedex_id
GROUP BY p.pokedex_id, p.name, p.primary_type 
ORDER BY total_matches DESC, avg_sync_pct DESC;

-- 2. Dominant Emotions vs. Pokémon Primary Element Distribution
SELECT s.detected_emotion, p.primary_type, COUNT(*) AS count_occurrences
FROM fact_user_scans s
JOIN dim_pokemon p ON s.matched_pokemon_id = p.pokedex_id
GROUP BY s.detected_emotion, p.primary_type
ORDER BY s.detected_emotion, count_occurrences DESC;
`;
  downloadFile(sql, 'poketwin_schema_queries.sql', 'text/plain');
};

// Bind Export Buttons
function initExporterButtons() {
  const fBtn = $('export-fact-csv-btn');
  if (fBtn) fBtn.onclick = window.exportFactCsv;
  const dBtn = $('export-dim-csv-btn');
  if (dBtn) dBtn.onclick = window.exportDimCsv;
  const sBtn = $('export-sql-btn');
  if (sBtn) sBtn.onclick = window.exportSqlQueries;
}
initExporterButtons();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExporterButtons);
}
