// PokéTwin Biometric & SQL/Power BI Analytics Engine
class PokedexAudio {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
  playChirp(freq = 880, dur = 0.08) {
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + dur);
    } catch(e) {}
  }
  playScanSweep() {
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1400, this.ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch(e) {}
  }
  playFanfare(shiny = false) {
    try {
      this.init();
      const notes = shiny ? [523, 659, 784, 1046, 1318, 1568] : [440, 554, 659, 880];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = shiny ? 'triangle' : 'square';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.1);
        osc.stop(this.ctx.currentTime + idx * 0.1 + 0.3);
      });
    } catch(e) {}
  }
}

const audio = new PokedexAudio();

// Elements
const fileInput = document.getElementById('file-input');
const dropZone = document.getElementById('drop-zone');
const preview = document.getElementById('preview');
const previewBox = document.getElementById('preview-box');
const previewOverlay = document.getElementById('preview-overlay-canvas');
const video = document.getElementById('video');
const videoWrap = document.getElementById('video-wrap');
const faceHudCanvas = document.getElementById('face-hud-canvas');
const analyzeBtn = document.getElementById('analyze-btn');
const camToggleBtn = document.getElementById('cam-toggle-btn');
const captureBtn = document.getElementById('capture-btn');
const scanOverlay = document.getElementById('scan-overlay');
const scanProgress = document.getElementById('scan-progress');
const scanStatusText = document.getElementById('scan-status-text');
const resultCard = document.getElementById('result-card');
const inputSection = document.getElementById('input-section');
const faceDetectPill = document.getElementById('face-detect-pill');
const faceDetectMsg = document.getElementById('face-detect-msg');
const trainerNameInput = document.getElementById('trainer-name-input');

let currentStream = null;
let currentImageSrc = null;
let currentBestMatch = null;
let currentTraits = null;
let currentTrainerName = 'Trainer';
let detectedExpression = 'neutral';
let detectedEmotionConfidence = 85;
let isShinyRoll = false;
let modelsLoaded = false;
let cameraAnimationId = null;

// Initialize face-api models asynchronously with graceful fallback
async function initFaceApi() {
  try {
    if (window.faceapi) {
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]);
      modelsLoaded = true;
      console.log('Pokédex Facial Neural Nets Loaded.');
    }
  } catch (err) {
    console.warn('Face-api neural nets unavailable, using embedded geometric biometric parser.', err);
    modelsLoaded = false;
  }
}
initFaceApi();

// Load saved trainer name from memory
if (localStorage.getItem('poketwin_trainer_name')) {
  trainerNameInput.value = localStorage.getItem('poketwin_trainer_name');
}
trainerNameInput.addEventListener('input', () => {
  localStorage.setItem('poketwin_trainer_name', trainerNameInput.value.trim());
});

// Drop zone events
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    handleImageFile(e.dataTransfer.files[0]);
  }
});
dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
  if (fileInput.files && fileInput.files[0]) {
    handleImageFile(fileInput.files[0]);
  }
});

function handleImageFile(file) {
  if (!file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = (e) => loadPreview(e.target.result);
  reader.readAsDataURL(file);
}

function loadPreview(src) {
  currentImageSrc = src;
  preview.src = src;
  previewBox.style.display = 'block';
  analyzeBtn.disabled = false;
  stopCamera();
  audio.playChirp(700, 0.05);

  preview.onload = () => {
    analyzeFacialFrame(preview, previewOverlay);
  };
}

// Live Camera
camToggleBtn.addEventListener('click', async (e) => {
  e.stopPropagation();
  if (currentStream) {
    stopCamera();
    return;
  }
  try {
    currentStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false
    });
    video.srcObject = currentStream;
    videoWrap.style.display = 'block';
    camToggleBtn.textContent = '❌ Stop Camera';
    audio.playChirp(900, 0.06);

    video.onloadedmetadata = () => {
      runLiveCameraHud();
    };
  } catch (err) {
    alert('Unable to access webcam. Please check permissions or upload a portrait photo.');
  }
});

function runLiveCameraHud() {
  if (!currentStream) return;
  faceHudCanvas.width = video.videoWidth || 640;
  faceHudCanvas.height = video.videoHeight || 480;
  const ctx = faceHudCanvas.getContext('2d');

  function renderHud() {
    if (!currentStream) return;
    ctx.clearRect(0, 0, faceHudCanvas.width, faceHudCanvas.height);

    const cx = faceHudCanvas.width / 2;
    const cy = faceHudCanvas.height / 2;
    const boxSize = Math.min(faceHudCanvas.width, faceHudCanvas.height) * 0.55;

    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    const s = boxSize / 2;
    const corner = 24;

    ctx.beginPath(); ctx.moveTo(cx - s, cy - s + corner); ctx.lineTo(cx - s, cy - s); ctx.lineTo(cx - s + corner, cy - s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + s - corner, cy - s); ctx.lineTo(cx + s, cy - s); ctx.lineTo(cx + s, cy - s + corner); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - s, cy + s - corner); ctx.lineTo(cx - s, cy + s); ctx.lineTo(cx - s + corner, cy + s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + s - corner, cy + s); ctx.lineTo(cx + s, cy + s); ctx.lineTo(cx + s, cy + s - corner); ctx.stroke();

    ctx.fillStyle = 'rgba(6, 182, 212, 0.8)';
    ctx.fillRect(cx - 10, cy, 20, 1);
    ctx.fillRect(cx, cy - 10, 1, 20);

    ctx.font = '12px "Chakra Petch", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('BIOMETRIC TARGET LOCK', cx - s + 10, cy - s - 10);

    cameraAnimationId = requestAnimationFrame(renderHud);
  }
  renderHud();
}

captureBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!video.videoWidth) return;
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0);
  loadPreview(canvas.toDataURL('image/jpeg', 0.94));
  stopCamera();
});

function stopCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach(t => t.stop());
    currentStream = null;
  }
  if (cameraAnimationId) {
    cancelAnimationFrame(cameraAnimationId);
    cameraAnimationId = null;
  }
  videoWrap.style.display = 'none';
  camToggleBtn.textContent = '📷 Take Live Selfie';
}

// Biometric & Expression Analysis
async function analyzeFacialFrame(imgEl, overlayCanvas) {
  faceDetectPill.style.display = 'flex';
  faceDetectMsg.textContent = 'CALIBRATING FACIAL GEOMETRY & EXPRESSIONS...';

  let faceBox = null;
  let expressionResult = null;

  if (modelsLoaded && window.faceapi) {
    try {
      const detection = await faceapi.detectSingleFace(imgEl, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
      if (detection) {
        faceBox = detection.detection.box;
        expressionResult = detection.expressions;
      }
    } catch (err) {
      console.warn('Face-api pass error, running geometric fallback', err);
    }
  }

  if (!expressionResult) {
    expressionResult = estimateGeometricExpression(imgEl);
  }

  let topExpr = 'neutral';
  let topScore = 0;
  for (const [expr, score] of Object.entries(expressionResult)) {
    if (score > topScore) {
      topScore = score;
      topExpr = expr;
    }
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

    ctx.fillStyle = 'rgba(18, 19, 26, 0.85)';
    ctx.fillRect(bx, by - 26, 180, 22);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px "Chakra Petch", sans-serif';
    ctx.fillText(`MOOD: ${detectedExpression.toUpperCase()} (${detectedEmotionConfidence}%)`, bx + 6, by - 10);
  }

  const exprEmoji = {
    happy: '😄 RADIANT JOY',
    neutral: '😌 CALM / ZEN',
    angry: '😠 FIERCE / BOLD',
    surprised: '😲 HIGH ENERGY',
    sad: '🌧️ DEEP INTROSPECTIVE',
    disgusted: '⚡ SASSY / SKEPTICAL',
    fearful: '🔮 MYSTERIOUS / ENIGMATIC'
  }[detectedExpression] || '✨ CHARISMATIC';

  faceDetectMsg.textContent = `DETECTED: ${exprEmoji}`;
}

function estimateGeometricExpression(img) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
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

  const avgUpper = upperLum / (upperCount || 1);
  const avgLower = lowerLum / (lowerCount || 1);
  const mouthRatio = avgLower / (avgUpper || 1);

  if (mouthRatio > 1.08) {
    return { happy: 0.88, neutral: 0.08, surprised: 0.04 };
  } else if (avgUpper < 80 && avgLower < 80) {
    return { fearful: 0.72, sad: 0.18, neutral: 0.1 };
  } else if (avgUpper > 160 && avgLower > 150) {
    return { surprised: 0.75, happy: 0.2, neutral: 0.05 };
  } else {
    return { neutral: 0.82, happy: 0.1, angry: 0.08 };
  }
}

function loadSampleExpression(type) {
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 300;
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

// Scanning & Matching Workflow
analyzeBtn.addEventListener('click', () => {
  if (!currentImageSrc) return;
  currentTrainerName = trainerNameInput.value.trim() || 'Trainer';
  audio.init();
  startScanSequence();
});

function startScanSequence() {
  inputSection.style.display = 'none';
  resultCard.style.display = 'none';
  scanOverlay.style.display = 'block';

  let progress = 0;
  const messages = [
    `AUTHENTICATING TRAINER: ${currentTrainerName.toUpperCase()}...`,
    `PARSING BIOMETRIC FACIAL MESH: ${detectedExpression.toUpperCase()}...`,
    'EXTRACTING FACIAL CHROMATIC HARMONY...',
    'SYNCHRONIZING WITH SILPH CO. 151 CANON...',
    'WRITING EVENT TO SQL FACT TABLE...'
  ];

  const interval = setInterval(() => {
    progress += 20;
    scanProgress.style.width = progress + '%';
    const msgIdx = Math.min(Math.floor(progress / 20), messages.length - 1);
    scanStatusText.textContent = messages[msgIdx];
    audio.playScanSweep();

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        executeMatching();
        scanOverlay.style.display = 'none';
        resultCard.style.display = 'block';
      }, 300);
    }
  }, 220);
}

function executeMatching() {
  const canvas = document.createElement('canvas');
  canvas.width = 60;
  canvas.height = 60;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(preview, 0, 0, 60, 60);
  const imgData = ctx.getImageData(0, 0, 60, 60).data;

  let rSum = 0, gSum = 0, bSum = 0, count = 0;
  for (let i = 0; i < imgData.length; i += 4) {
    if (imgData[i + 3] < 80) continue;
    rSum += imgData[i];
    gSum += imgData[i + 1];
    bSum += imgData[i + 2];
    count++;
  }

  if (count === 0) count = 1;
  const avgR = Math.round(rSum / count);
  const avgG = Math.round(gSum / count);
  const avgB = Math.round(bSum / count);

  const avgLum = 0.299 * avgR + 0.587 * avgG + 0.114 * avgB;
  const maxC = Math.max(avgR, avgG, avgB);
  const minC = Math.min(avgR, avgG, avgB);
  const saturation = maxC === 0 ? 0 : (maxC - minC) / maxC;

  let energy = Math.round((avgR * 0.45 + (1 - avgB / 255) * 50 + saturation * 40));
  let chill = Math.round(((avgB * 0.5 + avgG * 0.4) / 255) * 90 + 10);
  let cuteness = Math.round(((avgR + avgB) / 510) * 80 + 15);
  let mystery = Math.round((1 - avgLum / 255) * 65 + (avgB / 255) * 30);
  let bravery = Math.round((avgR / 255) * 60 + saturation * 35);

  if (detectedExpression === 'happy') {
    energy += 25; cuteness += 30; chill += 10;
  } else if (detectedExpression === 'neutral') {
    chill += 35; mystery += 10; energy -= 10;
  } else if (detectedExpression === 'angry') {
    bravery += 35; energy += 20; cuteness -= 15;
  } else if (detectedExpression === 'surprised') {
    energy += 35; mystery += 15;
  } else if (detectedExpression === 'sad' || detectedExpression === 'fearful') {
    mystery += 35; chill += 15; energy -= 15;
  }

  energy = Math.min(99, Math.max(20, energy));
  chill = Math.min(99, Math.max(20, chill));
  cuteness = Math.min(99, Math.max(20, cuteness));
  mystery = Math.min(99, Math.max(20, mystery));
  bravery = Math.min(99, Math.max(20, bravery));

  currentTraits = { energy, chill, cuteness, mystery, bravery, avgR, avgG, avgB };

  const ranked = KANTO_POKEDEX.map(p => {
    const colorDist = Math.hypot(avgR - p.c[0], avgG - p.c[1], avgB - p.c[2]);

    let archetypeScore = 0;
    const isElectricOrFire = p.types.includes('Electric') || p.types.includes('Fire');
    const isWaterOrGrass = p.types.includes('Water') || p.types.includes('Grass');
    const isGhostOrPsychic = p.types.includes('Ghost') || p.types.includes('Psychic');
    const isFairyOrNormal = p.types.includes('Fairy') || p.types.includes('Normal');
    const isFighting = p.types.includes('Fighting');

    if (detectedExpression === 'happy' && (isFairyOrNormal || isElectricOrFire)) archetypeScore += 30;
    if (detectedExpression === 'neutral' && isWaterOrGrass) archetypeScore += 30;
    if (detectedExpression === 'angry' && (isFighting || isElectricOrFire)) archetypeScore += 30;
    if ((detectedExpression === 'sad' || detectedExpression === 'fearful') && isGhostOrPsychic) archetypeScore += 30;
    if (detectedExpression === 'surprised' && isElectricOrFire) archetypeScore += 30;

    const finalDist = colorDist - (archetypeScore * 1.8);
    const sync = Math.round(Math.max(68, Math.min(99, 100 - (finalDist / 4.4))));
    return { p, dist: finalDist, sync };
  }).sort((a, b) => a.dist - b.dist);

  currentBestMatch = ranked[0];
  const runners = [ranked[1], ranked[2], ranked[3]];

  isShinyRoll = Math.random() < 0.10;

  // Log to Analytics Fact Pipeline (localStorage event store)
  logScanEvent({
    trainer_name: currentTrainerName,
    pokemon_id: currentBestMatch.p.id,
    pokemon_name: currentBestMatch.p.name,
    primary_type: currentBestMatch.p.types[0],
    sync_rate: currentBestMatch.sync,
    is_shiny: isShinyRoll ? 1 : 0,
    emotion: detectedExpression,
    traits: currentTraits
  });

  displayResults(currentBestMatch, runners, currentTraits);
}

function displayResults(top, runners, traits) {
  const p = top.p;
  const padId = String(p.id).padStart(3, '0');

  const artUrl = isShinyRoll
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${p.id}.png`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`;

  const fallbackSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`;

  const imgEl = document.getElementById('pokemon-img');
  imgEl.src = artUrl;
  imgEl.onerror = () => { imgEl.src = fallbackSprite; };

  document.getElementById('pokemon-id').textContent = `#${padId}`;
  document.getElementById('pokemon-name').textContent = p.name;
  document.getElementById('match-score-badge').textContent = `BIOMETRIC SYNC: ${top.sync}%`;
  document.getElementById('result-headline').textContent = `${currentTrainerName}, your Kanto Spirit Twin is ${p.name}!`;
  document.getElementById('trainer-tag-display').textContent = `TRAINER ID: ${currentTrainerName.toUpperCase()}`;
  document.getElementById('spec-trainer-name').textContent = currentTrainerName;
  document.getElementById('pokemon-lore').textContent = p.lore;
  document.getElementById('pokemon-nature').textContent = p.nature;
  document.getElementById('pokemon-move').textContent = p.move;

  const expressionLabels = {
    happy: '😄 Joyous Radiance',
    neutral: '😌 Zen Equilibrium',
    angry: '😠 Fierce Resolve',
    surprised: '😲 Electric Awe',
    sad: '🌧️ Mystic Depth',
    fearful: '🔮 Enigmatic Aura'
  };
  document.getElementById('detected-expression-badge').textContent = `EXPRESSION: ${expressionLabels[detectedExpression] || '✨ CHARISMATIC'}`;
  document.getElementById('pokemon-vibe-match').textContent = `${detectedExpression.toUpperCase()} Synergy`;

  const shinyTag = document.getElementById('shiny-tag');
  shinyTag.style.display = isShinyRoll ? 'block' : 'none';

  // Types
  const typesContainer = document.getElementById('pokemon-types');
  typesContainer.innerHTML = '';
  p.types.forEach(t => {
    const b = document.createElement('span');
    b.className = 'type-badge';
    b.textContent = t;
    b.style.backgroundColor = TYPE_COLORS[t] || '#777';
    b.style.color = '#fff';
    typesContainer.appendChild(b);
  });

  // Swatches
  const swatchContainer = document.getElementById('swatch-container');
  swatchContainer.innerHTML = '';
  const hexPrimary = `rgb(${traits.avgR}, ${traits.avgG}, ${traits.avgB})`;
  const hexPkm = `rgb(${p.c[0]}, ${p.c[1]}, ${p.c[2]})`;
  [hexPrimary, hexPkm].forEach(col => {
    const s = document.createElement('div');
    s.className = 'swatch';
    s.style.backgroundColor = col;
    swatchContainer.appendChild(s);
  });

  // Meters
  setTraitMeter('trait-energy', traits.energy);
  setTraitMeter('trait-chill', traits.chill);
  setTraitMeter('trait-cuteness', traits.cuteness);
  setTraitMeter('trait-mystery', traits.mystery);
  setTraitMeter('trait-bravery', traits.bravery);

  // Runners
  const runnersBox = document.getElementById('runners-container');
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

  audio.playFanfare(isShinyRoll);
}

function setTraitMeter(id, val) {
  const fill = document.getElementById(id);
  const text = document.getElementById(id + '-val');
  fill.style.width = val + '%';
  text.textContent = val + '%';
}

function resetScan() {
  stopCamera();
  resultCard.style.display = 'none';
  scanOverlay.style.display = 'none';
  inputSection.style.display = 'block';
  previewBox.style.display = 'none';
  preview.src = '';
  currentImageSrc = null;
  analyzeBtn.disabled = true;
  fileInput.value = '';
  faceDetectPill.style.display = 'none';
}

// Download Collectible Passport with Trainer Name
document.getElementById('download-card-btn').addEventListener('click', () => {
  if (!currentBestMatch || !preview.src) return;
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 520;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 800, 520);
  grad.addColorStop(0, '#181926');
  grad.addColorStop(1, '#0f111a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 800, 520);

  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, 780, 500);

  ctx.fillStyle = '#ef4444';
  ctx.fillRect(10, 10, 780, 60);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Chakra Petch, sans-serif';
  ctx.fillText('POKÉTWIN BIOMETRIC PASSPORT', 30, 48);

  ctx.font = '14px Press Start 2P, monospace';
  ctx.fillText('KANTO #151', 630, 48);

  const uImg = new Image();
  uImg.crossOrigin = 'anonymous';
  uImg.onload = () => {
    ctx.drawImage(uImg, 40, 100, 200, 200);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 100, 200, 200);

    const pImg = new Image();
    pImg.crossOrigin = 'anonymous';
    pImg.onload = () => {
      ctx.drawImage(pImg, 270, 100, 200, 200);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.strokeRect(270, 100, 200, 200);

      // Info Texts with Trainer Identification
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px Chakra Petch, sans-serif';
      ctx.fillText(`${currentBestMatch.p.name} (#${String(currentBestMatch.p.id).padStart(3, '0')})`, 500, 130);

      ctx.font = 'bold 16px Chakra Petch, sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`TRAINER: ${currentTrainerName.toUpperCase()}`, 500, 160);

      ctx.font = '15px Plus Jakarta Sans, sans-serif';
      ctx.fillStyle = '#4ade80';
      ctx.fillText(`Sync: ${currentBestMatch.sync}% | Mood: ${detectedExpression.toUpperCase()}`, 500, 190);

      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`Types: ${currentBestMatch.p.types.join(' / ')}`, 500, 220);
      ctx.fillText(`Nature: ${currentBestMatch.p.nature}`, 500, 248);
      ctx.fillText(`Signature: ${currentBestMatch.p.move}`, 500, 276);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px Chakra Petch, sans-serif';
      ctx.fillText(`ENERGY: ${currentTraits.energy}%  |  CHILL: ${currentTraits.chill}%  |  CUTENESS: ${currentTraits.cuteness}%`, 40, 340);
      ctx.fillText(`MYSTERY: ${currentTraits.mystery}%  |  BRAVERY: ${currentTraits.bravery}%`, 40, 370);

      ctx.fillStyle = '#64748b';
      ctx.font = '12px Press Start 2P, monospace';
      ctx.fillText(`ISSUED TO TRAINER: ${currentTrainerName.toUpperCase()} • SILPH CO.`, 40, 440);

      const a = document.createElement('a');
      a.download = `PokéTwin-${currentTrainerName}-${currentBestMatch.p.name}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    pImg.src = document.getElementById('pokemon-img').src;
  };
  uImg.src = preview.src;
});

// Copy Summary
document.getElementById('share-summary-btn').addEventListener('click', () => {
  if (!currentBestMatch) return;
  const p = currentBestMatch.p;
  const text = `⚡ PokéTwin Facial Biometric Match!
Trainer: ${currentTrainerName}
Detected Mood: ${detectedExpression.toUpperCase()} (${detectedEmotionConfidence}%)
Spirit Twin: #${String(p.id).padStart(3, '0')} ${p.name} (${p.types.join('/')}) with a ${currentBestMatch.sync}% sync rate!
Nature: ${p.nature} | Move: ${p.move}
"${p.lore}"`;
  navigator.clipboard.writeText(text).then(() => {
    alert('PokéTwin biometric summary copied to clipboard!');
  });
});

// =====================================================================
// SQL & POWER BI ANALYTICS EVENT STORE PIPELINE
// =====================================================================
function getStoredScans() {
  try {
    const raw = localStorage.getItem('poketwin_analytics_fact');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function logScanEvent(evt) {
  const scans = getStoredScans();
  const newRecord = {
    scan_id: 'SCN-' + (10000 + scans.length + 1),
    trainer_name: evt.trainer_name,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    emotion: evt.emotion,
    pokemon_id: evt.pokemon_id,
    pokemon_name: evt.pokemon_name,
    primary_type: evt.primary_type,
    sync_rate: evt.sync_rate,
    is_shiny: evt.is_shiny,
    energy: evt.traits.energy,
    chill: evt.traits.chill,
    cuteness: evt.traits.cuteness,
    mystery: evt.traits.mystery,
    bravery: evt.traits.bravery,
    card_downloaded: 0
  };
  scans.unshift(newRecord);
  if (scans.length > 200) scans.pop();
  localStorage.setItem('poketwin_analytics_fact', JSON.stringify(scans));
}

// Analytics Modal & Export Handlers
const analyticsModal = document.getElementById('analytics-modal');
const openAnalyticsBtn = document.getElementById('open-analytics-btn');
const analyticsCloseBtn = document.getElementById('analytics-close-btn');

openAnalyticsBtn.addEventListener('click', openAnalyticsModal);
analyticsCloseBtn.addEventListener('click', () => { analyticsModal.style.display = 'none'; });

function openAnalyticsModal() {
  analyticsModal.style.display = 'block';
  renderAnalyticsDashboard();
}

function renderAnalyticsDashboard() {
  const scans = getStoredScans();
  document.getElementById('kpi-total-scans').textContent = scans.length;

  const trainers = new Set(scans.map(s => s.trainer_name));
  document.getElementById('kpi-unique-trainers').textContent = trainers.size;

  if (scans.length > 0) {
    const avgSync = Math.round(scans.reduce((acc, s) => acc + s.sync_rate, 0) / scans.length);
    document.getElementById('kpi-avg-sync').textContent = avgSync + '%';
    const shinies = scans.filter(s => s.is_shiny === 1).length;
    document.getElementById('kpi-shiny-count').textContent = shinies;
  } else {
    document.getElementById('kpi-avg-sync').textContent = '0%';
    document.getElementById('kpi-shiny-count').textContent = '0';
  }

  const tbody = document.getElementById('analytics-tbody');
  tbody.innerHTML = '';
  if (scans.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #64748b; padding: 16px;">No scans recorded yet. Run a selfie scan to generate live data!</td></tr>';
    return;
  }

  scans.slice(0, 15).forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-family: monospace; color: #38bdf8;">${s.scan_id}</td>
      <td style="font-weight: 700;">${s.trainer_name}</td>
      <td style="color: #94a3b8; font-size: 11px;">${s.timestamp}</td>
      <td><span style="text-transform: capitalize;">${s.emotion}</span></td>
      <td>#${String(s.pokemon_id).padStart(3, '0')} ${s.pokemon_name}</td>
      <td style="font-family: monospace; color: #4ade80;">${s.sync_rate}%</td>
      <td>${s.is_shiny ? '✨ Yes' : 'No'}</td>
    `;
    tbody.appendChild(tr);
  });
}

document.getElementById('clear-data-btn').addEventListener('click', () => {
  if (confirm('Clear local scan analytics log?')) {
    localStorage.removeItem('poketwin_analytics_fact');
    renderAnalyticsDashboard();
  }
});

// 1-Click CSV & SQL Exporters
document.getElementById('export-fact-csv-btn').addEventListener('click', () => {
  const scans = getStoredScans();
  if (scans.length === 0) {
    alert('No scan events recorded yet! Perform a scan first.');
    return;
  }
  const headers = ['scan_id', 'trainer_name', 'scan_timestamp', 'detected_emotion', 'matched_pokemon_id', 'matched_pokemon_name', 'primary_type', 'sync_rate_pct', 'is_shiny', 'energy_score', 'chill_score', 'cuteness_score', 'mystery_score', 'bravery_score'];
  let csv = headers.join(',') + '\n';
  scans.forEach(s => {
    csv += `${s.scan_id},"${s.trainer_name}","${s.timestamp}","${s.emotion}",${s.pokemon_id},"${s.pokemon_name}","${s.primary_type}",${s.sync_rate},${s.is_shiny},${s.energy},${s.chill},${s.cuteness},${s.mystery},${s.bravery}\n`;
  });
  downloadFile(csv, 'poketwin_fact_user_scans.csv', 'text/csv');
});

document.getElementById('export-dim-csv-btn').addEventListener('click', () => {
  const headers = ['pokedex_id', 'name', 'primary_type', 'secondary_type', 'rgb_r', 'rgb_g', 'rgb_b', 'nature', 'signature_move', 'lore'];
  let csv = headers.join(',') + '\n';
  KANTO_POKEDEX.forEach(p => {
    const sec = p.types[1] ? `"${p.types[1]}"` : '';
    csv += `${p.id},"${p.name}","${p.types[0]}",${sec},${p.c[0]},${p.c[1]},${p.c[2]},"${p.nature}","${p.move}","${p.lore.replace(/"/g, '""')}"\n`;
  });
  downloadFile(csv, 'poketwin_dim_pokemon.csv', 'text/csv');
});

document.getElementById('export-sql-btn').addEventListener('click', () => {
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
    scan_timestamp TIMESTAMP NOT NULL,
    detected_emotion VARCHAR(30) NOT NULL,
    matched_pokemon_id INT NOT NULL,
    sync_rate_pct DECIMAL(5,2),
    is_shiny INT DEFAULT 0,
    energy_score INT,
    chill_score INT,
    cuteness_score INT,
    mystery_score INT,
    bravery_score INT,
    CONSTRAINT fk_pokemon FOREIGN KEY (matched_pokemon_id) REFERENCES dim_pokemon(pokedex_id)
);

-- Analytical Query: Top Matched Pokémon Twins
SELECT 
    p.pokedex_id, p.name, p.primary_type,
    COUNT(s.scan_id) AS total_matches,
    ROUND(100.0 * COUNT(s.scan_id) / SUM(COUNT(s.scan_id)) OVER(), 2) AS match_share_pct,
    ROUND(AVG(s.sync_rate_pct), 2) AS avg_sync_pct,
    SUM(s.is_shiny) AS shiny_count
FROM fact_user_scans s
JOIN dim_pokemon p ON s.matched_pokemon_id = p.pokedex_id
GROUP BY p.pokedex_id, p.name, p.primary_type
ORDER BY total_matches DESC;
`;
  downloadFile(sql, 'poketwin_schema_queries.sql', 'text/plain');
});

function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  a.click();
}

// 151 Pokédex Modal / Drawer functionality
const modal = document.getElementById('pokedex-modal');
const openModalBtn = document.getElementById('open-roster-btn');
const closeModalBtn = document.getElementById('modal-close-btn');
const searchInput = document.getElementById('search-151');
const typeFilter = document.getElementById('filter-type');
const modalGrid = document.getElementById('modal-roster-grid');

openModalBtn.addEventListener('click', () => {
  modal.style.display = 'block';
  renderModalRoster();
});
closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', (e) => {
  if (e.target === modal) modal.style.display = 'none';
  if (e.target === analyticsModal) analyticsModal.style.display = 'none';
});

function renderModalRoster() {
  const query = searchInput.value.toLowerCase().trim();
  const filter = typeFilter.value;

  const filtered = KANTO_POKEDEX.filter(p => {
    const padId = String(p.id).padStart(3, '0');
    const matchesName = p.name.toLowerCase().includes(query) || padId.includes(query);
    const matchesType = !filter || p.types.includes(filter);
    return matchesName && matchesType;
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
      modal.style.display = 'none';
      currentTrainerName = trainerNameInput.value.trim() || 'Trainer';
      displayResults({ p, sync: 100, dist: 0 }, [
        { p: KANTO_POKEDEX[(p.id) % 151], sync: 94 },
        { p: KANTO_POKEDEX[(p.id + 1) % 151], sync: 88 },
        { p: KANTO_POKEDEX[(p.id + 2) % 151], sync: 82 }
      ], {
        energy: 75, chill: 65, cuteness: 70, mystery: 50, bravery: 80,
        avgR: p.c[0], avgG: p.c[1], avgB: p.c[2]
      });
      inputSection.style.display = 'none';
      resultCard.style.display = 'block';
    });
    modalGrid.appendChild(el);
  });
}

searchInput.addEventListener('input', renderModalRoster);
typeFilter.addEventListener('change', renderModalRoster);