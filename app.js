// Audio Synthesizer via Web Audio API
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
      osc.frequency.linearRampToValueAtTime(1200, this.ctx.currentTime + 0.35);
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
const video = document.getElementById('video');
const videoWrap = document.getElementById('video-wrap');
const analyzeBtn = document.getElementById('analyze-btn');
const camToggleBtn = document.getElementById('cam-toggle-btn');
const captureBtn = document.getElementById('capture-btn');
const scanOverlay = document.getElementById('scan-overlay');
const scanProgress = document.getElementById('scan-progress');
const scanStatusText = document.getElementById('scan-status-text');
const resultCard = document.getElementById('result-card');
const inputSection = document.getElementById('input-section');

let currentStream = null;
let currentImageSrc = null;
let currentBestMatch = null;
let currentTraits = null;
let isShinyRoll = false;

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
}

// Camera Support
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
  } catch (err) {
    alert('Unable to access webcam. Please ensure camera permissions are granted or use file upload.');
  }
});

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
  loadPreview(canvas.toDataURL('image/jpeg', 0.92));
  stopCamera();
});

function stopCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach(t => t.stop());
    currentStream = null;
  }
  videoWrap.style.display = 'none';
  camToggleBtn.textContent = '📷 Take Selfie';
}

// Quick Sample Presets (generated dynamically via Canvas)
function loadSamplePreset(type) {
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 300, 300);

  if (type === 'pallet') {
    grad.addColorStop(0, '#ffedd5');
    grad.addColorStop(0.5, '#fb923c');
    grad.addColorStop(1, '#38bdf8');
  } else if (type === 'cinnabar') {
    grad.addColorStop(0, '#f97316');
    grad.addColorStop(0.5, '#ef4444');
    grad.addColorStop(1, '#7f1d1d');
  } else if (type === 'cerulean') {
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(0.5, '#0284c7');
    grad.addColorStop(1, '#0c4a6e');
  } else if (type === 'viridian') {
    grad.addColorStop(0, '#4ade80');
    grad.addColorStop(0.5, '#16a34a');
    grad.addColorStop(1, '#14532d');
  } else if (type === 'lavender') {
    grad.addColorStop(0, '#c084fc');
    grad.addColorStop(0.5, '#7e22ce');
    grad.addColorStop(1, '#3b0764');
  } else if (type === 'celadon') {
    grad.addColorStop(0, '#fef08a');
    grad.addColorStop(0.5, '#eab308');
    grad.addColorStop(1, '#10b981');
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 300, 300);
  loadPreview(canvas.toDataURL('image/jpeg', 0.95));
}

// Vibe & Color Analysis Algorithm
analyzeBtn.addEventListener('click', () => {
  if (!currentImageSrc) return;
  audio.init();
  startScanSequence();
});

function startScanSequence() {
  inputSection.style.display = 'none';
  resultCard.style.display = 'none';
  scanOverlay.style.display = 'block';

  let progress = 0;
  const messages = [
    'CALIBRATING OPTICAL SENSORS...',
    'EXTRACTING KANTO BIOMETRIC PALETTE...',
    'CROSS-REFERENCING SILPH CO. 151 ARCHIVES...',
    'CALCULATING ELEMENTAL RESONANCE...',
    'FINALIZING TWIN PROFILE...'
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
  let brightnessVals = [];

  for (let i = 0; i < imgData.length; i += 4) {
    const a = imgData[i + 3];
    if (a < 80) continue;
    const r = imgData[i];
    const g = imgData[i + 1];
    const b = imgData[i + 2];
    rSum += r;
    gSum += g;
    bSum += b;
    count++;
    brightnessVals.push(0.299 * r + 0.587 * g + 0.114 * b);
  }

  if (count === 0) count = 1;
  const avgR = Math.round(rSum / count);
  const avgG = Math.round(gSum / count);
  const avgB = Math.round(bSum / count);

  // Compute 5 vibe metrics
  const avgLum = (0.299 * avgR + 0.587 * avgG + 0.114 * avgB);
  const maxC = Math.max(avgR, avgG, avgB);
  const minC = Math.min(avgR, avgG, avgB);
  const saturation = (maxC === 0) ? 0 : (maxC - minC) / maxC;

  const energy = Math.min(99, Math.max(25, Math.round((avgR * 0.45 + (1 - avgB / 255) * 50 + saturation * 40))));
  const chill = Math.min(99, Math.max(20, Math.round(((avgB * 0.5 + avgG * 0.4) / 255) * 90 + 10)));
  const cuteness = Math.min(99, Math.max(25, Math.round(((avgR + avgB) / 510) * 80 + 15)));
  const mystery = Math.min(99, Math.max(15, Math.round((1 - avgLum / 255) * 65 + (avgB / 255) * 30)));
  const bravery = Math.min(99, Math.max(30, Math.round((avgR / 255) * 60 + saturation * 35)));

  currentTraits = { energy, chill, cuteness, mystery, bravery, avgR, avgG, avgB };

  // Score against all 151 Kanto Pokémon
  const ranked = KANTO_POKEDEX.map(p => {
    const colorDist = Math.hypot(avgR - p.c[0], avgG - p.c[1], avgB - p.c[2]);
    const sync = Math.round(Math.max(62, Math.min(99, 100 - (colorDist / 4.2))));
    return { p, dist: colorDist, sync };
  }).sort((a, b) => a.dist - b.dist);

  currentBestMatch = ranked[0];
  const runners = [ranked[1], ranked[2], ranked[3]];

  // 10% Chance for Shiny roll
  isShinyRoll = Math.random() < 0.10;

  displayResults(currentBestMatch, runners, currentTraits);
}

function displayResults(top, runners, traits) {
  const p = top.p;
  const padId = String(p.id).padStart(3, '0');

  // Official PokeAPI high-res artwork URL
  const artUrl = isShinyRoll
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${p.id}.png`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`;

  const fallbackSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`;

  const imgEl = document.getElementById('pokemon-img');
  imgEl.src = artUrl;
  imgEl.onerror = () => { imgEl.src = fallbackSprite; };

  document.getElementById('pokemon-id').textContent = `#${padId}`;
  document.getElementById('pokemon-name').textContent = p.name;
  document.getElementById('match-score-badge').textContent = `KANTO SYNC: ${top.sync}%`;
  document.getElementById('result-headline').textContent = `Your Kanto Spirit Twin is ${p.name}!`;
  document.getElementById('pokemon-lore').textContent = p.lore;
  document.getElementById('pokemon-nature').textContent = p.nature;
  document.getElementById('pokemon-move').textContent = p.move;

  const shinyTag = document.getElementById('shiny-tag');
  if (isShinyRoll) {
    shinyTag.style.display = 'block';
  } else {
    shinyTag.style.display = 'none';
  }

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

  // Color Swatches
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

  // Vibe Trait Fill Meters
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
}

// Download Collectible Trainer Card (Canvas Export)
document.getElementById('download-card-btn').addEventListener('click', () => {
  if (!currentBestMatch || !preview.src) return;
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 500;
  const ctx = canvas.getContext('2d');

  // Background
  const grad = ctx.createLinearGradient(0, 0, 800, 500);
  grad.addColorStop(0, '#181926');
  grad.addColorStop(1, '#0f111a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 800, 500);

  // Border & Header
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, 780, 480);

  ctx.fillStyle = '#ef4444';
  ctx.fillRect(10, 10, 780, 60);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Chakra Petch, sans-serif';
  ctx.fillText('POKÉTWIN KANTO PASSPORT', 30, 48);

  ctx.font = '16px Press Start 2P, monospace';
  ctx.fillText('KANTO #151', 630, 48);

  // User Photo
  const uImg = new Image();
  uImg.crossOrigin = 'anonymous';
  uImg.onload = () => {
    ctx.drawImage(uImg, 40, 100, 200, 200);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 100, 200, 200);

    // Pokémon Art
    const pImg = new Image();
    pImg.crossOrigin = 'anonymous';
    pImg.onload = () => {
      ctx.drawImage(pImg, 270, 100, 200, 200);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.strokeRect(270, 100, 200, 200);

      // Info Texts
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px Chakra Petch, sans-serif';
      ctx.fillText(`${currentBestMatch.p.name} (#${String(currentBestMatch.p.id).padStart(3, '0')})`, 500, 130);

      ctx.font = '16px Plus Jakarta Sans, sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`Match Resonance: ${currentBestMatch.sync}%`, 500, 165);

      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`Types: ${currentBestMatch.p.types.join(' / ')}`, 500, 195);
      ctx.fillText(`Nature: ${currentBestMatch.p.nature}`, 500, 225);
      ctx.fillText(`Signature Move: ${currentBestMatch.p.move}`, 500, 255);

      // Traits Footer
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px Chakra Petch, sans-serif';
      ctx.fillText(`ENERGY: ${currentTraits.energy}%  |  CHILL: ${currentTraits.chill}%  |  CUTENESS: ${currentTraits.cuteness}%`, 40, 340);
      ctx.fillText(`MYSTERY: ${currentTraits.mystery}%  |  BRAVERY: ${currentTraits.bravery}%`, 40, 370);

      // Footer branding
      ctx.fillStyle = '#64748b';
      ctx.font = '12px Press Start 2P, monospace';
      ctx.fillText('VERIFIED SILPH CO. ARCHIVE - POKETWIN 151', 40, 440);

      const a = document.createElement('a');
      a.download = `PokéTwin-${currentBestMatch.p.name}-Card.png`;
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
  const text = `⚡ PokéTwin Kanto 151 Match!\nMy spirit twin is #${String(p.id).padStart(3, '0')} ${p.name} (${p.types.join('/')}) with a ${currentBestMatch.sync}% match rate!\nNature: ${p.nature} | Move: ${p.move}\n"${p.lore}"`;
  navigator.clipboard.writeText(text).then(() => {
    alert('PokéTwin match summary copied to clipboard!');
  });
});

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
window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

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