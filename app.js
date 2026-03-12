// ===== UTILITÁRIOS YOUTUBE =====
function extractYouTubeId(url) {
  const patterns = [
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function embedUrl(id) {
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
}

function thumbUrl(id) {
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

// ===== VÍDEOS FIXOS (YouTube Shorts) =====
// Adicione aqui os IDs dos seus Shorts do YouTube
const defaultVideos = [
  { type: 'yt', id: 'VvkSetbUD8A', fixed: true },
  { type: 'yt', id: 'uUpu2JFnWok', fixed: true },
  { type: 'yt', id: '8nIzRCpJkKE', fixed: true },
  { type: 'yt', id: '-HaSyiG9gbU', fixed: true },
  { type: 'yt', id: '4Jdx6d1In6A', fixed: true },
  { type: 'yt', id: 'naZ__VEkfrk', fixed: true },
  { type: 'yt', id: 'O39Rka80T0o', fixed: true },
];

// ===== STATE =====
let userVideos = JSON.parse(localStorage.getItem('be_yt_videos') || '[]');
let currentVideoIndex = null;

function allVideos() {
  return [...defaultVideos, ...userVideos];
}

// ===== ELEMENTS =====
const videoGrid    = document.getElementById('videoGrid');
const addVideoBtn  = document.getElementById('addVideoBtn');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose   = document.getElementById('modalClose');
const ytUrl        = document.getElementById('ytUrl');
const ytPreviewWrap  = document.getElementById('ytPreviewWrap');
const ytPreviewFrame = document.getElementById('ytPreviewFrame');
const previewBtn   = document.getElementById('previewBtn');
const saveVideoBtn = document.getElementById('saveVideoBtn');

const viewOverlay    = document.getElementById('viewOverlay');
const viewClose      = document.getElementById('viewClose');
const viewVideoWrap  = document.getElementById('viewVideoWrap');
const deleteBtn      = document.getElementById('deleteBtn');

// ===== RENDER =====
function renderGrid() {
  videoGrid.innerHTML = '';
  const list = allVideos();

  if (list.length === 0) {
    videoGrid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 0;color:var(--muted)">
        <div style="font-size:3rem;margin-bottom:16px">▶</div>
        <p>Nenhum vídeo ainda. Clique em "+ Adicionar Vídeo" para começar.</p>
      </div>`;
    return;
  }

  list.forEach((vid, i) => {
    const card = document.createElement('div');
    card.className = 'video-card';

    const thumbContent = vid.type === 'local'
      ? `<video src="${vid.src}" preload="metadata" muted></video>`
      : `<img src="${thumbUrl(vid.id)}" alt="Short ${i+1}" loading="lazy" />`;

    card.innerHTML = `
      <div class="video-thumb yt-thumb">
        ${thumbContent}
        <div class="play-overlay">
          <div class="play-btn">▶</div>
        </div>
      </div>`;
    card.addEventListener('click', () => openViewModal(i));
    videoGrid.appendChild(card);
  });
}

// ===== SAVE =====
function saveToStorage() {
  localStorage.setItem('be_yt_videos', JSON.stringify(userVideos));
}

// ===== UPLOAD MODAL =====
function openUploadModal() {
  ytUrl.value = '';
  ytPreviewFrame.src = '';
  ytPreviewWrap.style.display = 'none';
  modalOverlay.classList.add('active');
}

function closeUploadModal() {
  modalOverlay.classList.remove('active');
  ytPreviewFrame.src = '';
}

previewBtn.addEventListener('click', () => {
  const id = extractYouTubeId(ytUrl.value.trim());
  if (!id) { alert('Link inválido. Cole um link de YouTube Shorts válido.'); return; }
  ytPreviewFrame.src = embedUrl(id);
  ytPreviewWrap.style.display = 'block';
});

saveVideoBtn.addEventListener('click', () => {
  const id = extractYouTubeId(ytUrl.value.trim());
  if (!id) { alert('Cole um link de YouTube Shorts válido antes de salvar.'); return; }
  userVideos.push({ id });
  saveToStorage();
  renderGrid();
  closeUploadModal();
});

addVideoBtn.addEventListener('click', openUploadModal);
modalClose.addEventListener('click', closeUploadModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeUploadModal(); });

// ===== VIEW MODAL =====
function openViewModal(index) {
  currentVideoIndex = index;
  const vid = allVideos()[index];
  const isFixed = !!vid.fixed;

  if (vid.type === 'local') {
    viewVideoWrap.innerHTML = `<video src="${vid.src}" controls style="width:100%;height:100%;object-fit:contain;background:#000"></video>`;
  } else {
    viewVideoWrap.innerHTML = `<iframe src="${embedUrl(vid.id)}" frameborder="0" allowfullscreen
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      style="width:100%;height:100%;border:none"></iframe>`;
  }

  deleteBtn.style.display = isFixed ? 'none' : 'flex';
  viewOverlay.classList.add('active');
}

function closeViewModal() {
  viewOverlay.classList.remove('active');
  viewVideoWrap.innerHTML = '';
}

viewClose.addEventListener('click', closeViewModal);
viewOverlay.addEventListener('click', e => { if (e.target === viewOverlay) closeViewModal(); });

deleteBtn.addEventListener('click', () => {
  if (!confirm('Deseja excluir este vídeo?')) return;
  const userIdx = currentVideoIndex - defaultVideos.length;
  userVideos.splice(userIdx, 1);
  saveToStorage();
  renderGrid();
  closeViewModal();
});

// ===== CONTATO FORM =====
document.querySelector('.contato-form').addEventListener('submit', e => {
  e.preventDefault();
  const nome    = e.target.querySelector('input[type="text"]').value.trim();
  const email   = e.target.querySelector('input[type="email"]').value.trim();
  const projeto = e.target.querySelector('textarea').value.trim();
  const texto   = `Olá, sou *${nome}* (${email})!%0A%0A${projeto}`;
  window.open(`https://wa.me/5522997937380?text=${texto}`, '_blank');
  e.target.reset();
});

// ===== INIT =====
renderGrid();
