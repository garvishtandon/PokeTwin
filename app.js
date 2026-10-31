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

  isShinyRoll = (trainerHash % 10 === 0);

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
function renderFireRedTrainerCard(targetCanvas, matchObj, traits) {
  if (!targetCanvas) return;
  const ctx = targetCanvas.getContext('2d');
  const w = 750, h = 480;
  targetCanvas.width = w;
  targetCanvas.height = h;

  // 1. Teal Pinstripe Outer Background
  ctx.fillStyle = '#2ca999';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#239082';
  ctx.lineWidth = 1;
  for (let y = 0; y < h; y += 6) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // 2. Main Rounded Card Body
  const margin = 16, cardW = w - margin * 2, cardH = h - margin * 2;
  ctx.fillStyle = '#f3f4f6';
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 5;
  drawRoundedRect(ctx, margin, margin, cardW, cardH, 20, true, true);

  // Subtle card horizontal scanlines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.025)';
  ctx.lineWidth = 1;
  for (let y = margin + 10; y < margin + cardH - 10; y += 4) {
    ctx.beginPath(); ctx.moveTo(margin + 10, y); ctx.lineTo(margin + cardW - 10, y); ctx.stroke();
  }

  // 3. Faint Pokéball Arc Watermark (Right side)
  ctx.save();
  ctx.beginPath();
  ctx.arc(margin + cardW - 100, margin + cardH / 2 + 10, 150, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(209, 213, 219, 0.55)';
  ctx.lineWidth = 36;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(margin + cardW - 100, margin + cardH / 2 + 10, 48, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(209, 213, 219, 0.45)';
  ctx.fill();
  ctx.restore();

  // 4. Header Bar
  // Left: "TRAINER CARD" in gold pixel font with double underline
  ctx.fillStyle = '#d4af37';
  ctx.font = 'bold 26px "Press Start 2P", monospace';
  ctx.fillText('TRAINER CARD', margin + 26, margin + 46);

  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(margin + 24, margin + 56); ctx.lineTo(margin + 330, margin + 56); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(margin + 24, margin + 62); ctx.lineTo(margin + 330, margin + 62); ctx.stroke();

  // Right: IDNo. Pill Box
  const pillW = 220, pillH = 40;
  const pillX = margin + cardW - pillW - 24, pillY = margin + 18;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 10, true, true);

  ctx.fillStyle = '#1e293b';
  ctx.font = '20px "Press Start 2P", monospace';
  ctx.fillText(`IDNo.${currentTrainerId}`, pillX + 16, pillY + 28);

  // 5. Data Rows with Iconic Bullet ⚪
  const startX = margin + 26;
  let curY = margin + 105;

  // Row 1: NAME
  drawBullet(ctx, startX, curY - 7);
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 16px "Press Start 2P", monospace';
  ctx.fillText('NAME:', startX + 22, curY);
  ctx.fillStyle = '#0f172a';
  ctx.fillText(currentTrainerName.toUpperCase(), startX + 115, curY);

  // Underline for name
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(startX + 112, curY + 6); ctx.lineTo(startX + 350, curY + 6); ctx.stroke();

  // Gold Stars
  ctx.fillStyle = '#f59e0b';
  ctx.font = '18px "Press Start 2P", monospace';
  ctx.fillText('★★★', startX + 260, curY + 36);

  // Row 2: MONEY
  curY += 60;
  drawBullet(ctx, startX, curY - 7);
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 15px "Press Start 2P", monospace';
  ctx.fillText('MONEY', startX + 22, curY);
  ctx.fillStyle = '#0f172a';
  ctx.fillText('₽57516', startX + 210, curY);

  // Row 3: POKÉMON (Replaces Pokédex)
  curY += 46;
  drawBullet(ctx, startX, curY - 7);
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 15px "Press Start 2P", monospace';
  ctx.fillText('POKÉMON', startX + 22, curY);
  ctx.fillStyle = '#dc2626';
  const pName = matchObj.p.name.toUpperCase();
  ctx.fillText(pName.length > 9 ? pName.substring(0, 9) : pName, startX + 170, curY);
  ctx.fillStyle = '#64748b';
  ctx.font = '12px "Press Start 2P", monospace';
  ctx.fillText(`#${String(matchObj.p.id).padStart(3, '0')}`, startX + 325, curY);

  // Row 4: TIME (Scan time)
  curY += 46;
  drawBullet(ctx, startX, curY - 7);
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 15px "Press Start 2P", monospace';
  ctx.fillText('TIME', startX + 22, curY);
  ctx.fillStyle = '#0f172a';
  ctx.fillText(currentScanTimeStr, startX + 240, curY);

  // 6. Right Side Visual: User Portrait + Pokémon Artwork
  const photoSize = 100;
  const photoX = margin + cardW - 260, photoY = margin + 88;
  const pImgX = photoX + 115, pImgY = photoY - 8;

  const uImg = new Image();
  uImg.crossOrigin = 'anonymous';
  uImg.onload = () => {
    ctx.save();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, photoX, photoY, photoSize, photoSize, 12, false, true);
    ctx.clip();
    ctx.drawImage(uImg, photoX, photoY, photoSize, photoSize);
    ctx.restore();

    const pImg = new Image();
    pImg.crossOrigin = 'anonymous';
    pImg.onload = () => {
      ctx.drawImage(pImg, pImgX, pImgY, 130, 130);
    };
    const mainPkmEl = $('pokemon-img');
    if (mainPkmEl) pImg.src = mainPkmEl.src;
  };
  if (preview && preview.src) uImg.src = preview.src;

  // 7. Bottom Section: Official BADGES Bar
  const badgeBarY = margin + cardH - 85;
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(margin + 20, badgeBarY, cardW - 40, 68);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.strokeRect(margin + 20, badgeBarY, cardW - 40, 68);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px "Press Start 2P", monospace';
  ctx.fillText('BADGES', margin + 28, badgeBarY + 16);

  const badgeStartX = margin + 130;
  const badgeSpacing = (cardW - 170) / 8;
  for (let i = 0; i < 8; i++) {
    drawOfficialBadge(ctx, badgeStartX + i * badgeSpacing, badgeBarY + 40, i);
  }
}

function drawBullet(ctx, x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#e2e8f0';
  ctx.fill();
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawRoundedRect(ctx, x, y, width, height, radius, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function drawOfficialBadge(ctx, cx, cy, idx) {
  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#334155';

  if (idx === 0) { // Boulder
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy - 14); ctx.lineTo(cx + 10, cy - 14);
    ctx.lineTo(cx + 16, cy); ctx.lineTo(cx + 10, cy + 14);
    ctx.lineTo(cx - 10, cy + 14); ctx.lineTo(cx - 16, cy);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if (idx === 1) { // Cascade
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 16);
    ctx.bezierCurveTo(cx + 14, cy - 2, cx + 14, cy + 12, cx, cy + 14);
    ctx.bezierCurveTo(cx - 14, cy + 12, cx - 14, cy - 2, cx, cy - 16);
    ctx.fill(); ctx.stroke();
  } else if (idx === 2) { // Thunder
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const r = i % 2 === 0 ? 15 : 7;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if (idx === 3) { // Rainbow
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#6366f1', '#a855f7', '#ec4899'];
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      const a = (i * Math.PI) / 4;
      ctx.arc(cx + Math.cos(a) * 8, cy + Math.sin(a) * 8, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.stroke();
  } else if (idx === 4) { // Soul
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.moveTo(cx, cy + 12);
    ctx.bezierCurveTo(cx - 16, cy + 2, cx - 14, cy - 14, cx, cy - 6);
    ctx.bezierCurveTo(cx + 14, cy - 14, cx + 16, cy + 2, cx, cy + 12);
    ctx.fill(); ctx.stroke();
  } else if (idx === 5) { // Marsh
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fillStyle = '#f59e0b'; ctx.fill(); ctx.stroke();
  } else if (idx === 6) { // Volcano
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 16);
    ctx.quadraticCurveTo(cx + 14, cy - 4, cx + 12, cy + 12);
    ctx.quadraticCurveTo(cx, cy + 16, cx - 12, cy + 12);
    ctx.quadraticCurveTo(cx - 14, cy - 4, cx, cy - 16);
    ctx.fill(); ctx.stroke();
  } else if (idx === 7) { // Earth
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 16); ctx.lineTo(cx + 10, cy); ctx.lineTo(cx + 5, cy + 14);
    ctx.lineTo(cx, cy + 8); ctx.lineTo(cx - 5, cy + 14); ctx.lineTo(cx - 10, cy);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
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

// CSV & SQL Exporters
const exportFactBtn = $('export-fact-csv-btn');
if (exportFactBtn) {
  exportFactBtn.addEventListener('click', () => {
    const scans = getStoredScans();
    if (scans.length === 0) { alert('No scans to export yet!'); return; }
    const headers = ['scan_id', 'trainer_name', 'trainer_id', 'scan_timestamp', 'detected_emotion', 'matched_pokemon_id', 'matched_pokemon_name', 'primary_type', 'sync_rate_pct', 'is_shiny'];
    let csv = headers.join(',') + '\n';
    scans.forEach(s => {
      csv += `${s.scan_id},"${s.trainer_name}","${s.trainer_id || '45256'}","${s.timestamp}","${s.emotion}",${s.pokemon_id},"${s.pokemon_name}","${s.primary_type}",${s.sync_rate},${s.is_shiny}\n`;
    });
    downloadFile(csv, 'poketwin_fact_user_scans.csv', 'text/csv');
  });
}

const exportDimBtn = $('export-dim-csv-btn');
if (exportDimBtn) {
  exportDimBtn.addEventListener('click', () => {
    const headers = ['pokedex_id', 'name', 'primary_type', 'secondary_type', 'rgb_r', 'rgb_g', 'rgb_b', 'nature', 'signature_move', 'lore'];
    let csv = headers.join(',') + '\n';
    KANTO_POKEDEX.forEach(p => {
      const sec = p.types[1] ? `"${p.types[1]}"` : '';
      csv += `${p.id},"${p.name}","${p.types[0]}",${sec},${p.c[0]},${p.c[1]},${p.c[2]},"${p.nature}","${p.move}","${p.lore.replace(/"/g, '""')}"\n`;
    });
    downloadFile(csv, 'poketwin_dim_pokemon.csv', 'text/csv');
  });
}

const exportSqlBtn = $('export-sql-btn');
if (exportSqlBtn) {
  exportSqlBtn.addEventListener('click', () => {
    const sql = `-- PokéTwin Relational Schema & Analytical Queries
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
    trainer_id VARCHAR(10) NOT NULL,
    scan_timestamp TIMESTAMP NOT NULL,
    detected_emotion VARCHAR(30) NOT NULL,
    matched_pokemon_id INT NOT NULL,
    sync_rate_pct DECIMAL(5,2),
    is_shiny INT DEFAULT 0,
    CONSTRAINT fk_pokemon FOREIGN KEY (matched_pokemon_id) REFERENCES dim_pokemon(pokedex_id)
);

SELECT p.pokedex_id, p.name, p.primary_type, COUNT(s.scan_id) AS total_matches
FROM fact_user_scans s JOIN dim_pokemon p ON s.matched_pokemon_id = p.pokedex_id
GROUP BY p.pokedex_id, p.name, p.primary_type ORDER BY total_matches DESC;
`;
    downloadFile(sql, 'poketwin_schema_queries.sql', 'text/plain');
  });
}

function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  a.click();
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