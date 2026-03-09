/* ========================================
Dashboard JS
======================================== */

// ── 플랜 설정 ──
const PLAN_CONFIG = {
free:     { name: ‘Free’,     label: ‘Free 플랜’,     labelMax: 3,  checkerMax: 3,  labelUnlimited: false, checkerUnlimited: false },
lite:     { name: ‘LITE’,     label: ‘LITE 플랜’,     labelMax: 30, checkerMax: 30, labelUnlimited: false, checkerUnlimited: false },
standard: { name: ‘STANDARD’, label: ‘STANDARD 플랜’, labelMax: 999, checkerMax: 999, labelUnlimited: true, checkerUnlimited: true }
};

// 데모 데이터
const DEMO_WORKS = [
{ id: ‘demo_1’, type: ‘creator’, title: ‘유기농 말차 라떼 라벨’, created_at: new Date().toISOString().split(‘T’)[0], status: ‘safe’,    payload: { product_name: ‘유기농 말차 라떼’, food_type: ‘음료’, ingredients_count: 5 } },
{ id: ‘demo_2’, type: ‘checker’, title: ‘말차 아이스크림 분석’,  created_at: new Date().toISOString().split(‘T’)[0], status: ‘warning’, payload: { errors: 1, warnings: 2, suggestions: 1 } },
{ id: ‘demo_3’, type: ‘creator’, title: ‘제주 말차 쿠키 라벨’,   created_at: (() => { const d = new Date(); d.setDate(d.getDate()-1); return d.toISOString().split(‘T’)[0]; })(), status: ‘safe’,    payload: { product_name: ‘제주 말차 쿠키’, food_type: ‘과자’, ingredients_count: 8 } }
];

// ── 상태 ──
let allWorks = [];
let currentFilter = ‘all’;

// ── 초기화 ──
document.addEventListener(‘DOMContentLoaded’, () => {
setDate();
loadPlan();
loadWorks();
});

// ── 오늘 날짜 ──
function setDate() {
const d = new Date();
const days = [‘일’, ‘월’, ‘화’, ‘수’, ‘목’, ‘금’, ‘토’];
const str = `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
document.getElementById(‘todayDate’).textContent = str;
}

// ── 플랜 로드 ──
function loadPlan() {
const plan = localStorage.getItem(‘krk_plan’) || ‘free’;
const cfg  = PLAN_CONFIG[plan] || PLAN_CONFIG.free;

// 헤더 배지
const badge = document.getElementById(‘planBadge’);
badge.textContent = cfg.name;
if (plan !== ‘free’) badge.classList.add(‘premium’);

// 사용량 태그
document.getElementById(‘planTag’).textContent = cfg.label;

// 사용량 수치
const labelRemain   = parseInt(localStorage.getItem(‘krk_labelGenerations’) ?? cfg.labelMax);
const checkerRemain = parseInt(localStorage.getItem(‘krk_diagnoses’)        ?? cfg.checkerMax);

renderUsage(‘label’,   labelRemain,   cfg.labelMax,   cfg.labelUnlimited);
renderUsage(‘checker’, checkerRemain, cfg.checkerMax, cfg.checkerUnlimited);
}

function renderUsage(type, remain, max, unlimited) {
const countEl = document.getElementById(type === ‘label’ ? ‘labelCount’ : ‘checkerCount’);
const barEl   = document.getElementById(type === ‘label’ ? ‘labelBar’   : ‘checkerBar’);

if (unlimited) {
countEl.innerHTML = ‘무제한’;
barEl.style.width = ‘100%’;
barEl.className = ‘bar-fill unlimited’;
return;
}

const pct = max > 0 ? Math.round((remain / max) * 100) : 0;
countEl.innerHTML = `${remain} <span class="denom">/ ${max}</span>`;
barEl.style.width = pct + ‘%’;
barEl.className = ‘bar-fill’ + (remain === 0 ? ’ empty’ : ‘’);
}

// ── 작업 기록 로드 ──
function loadWorks() {
const isDemo = new URLSearchParams(location.search).has(‘demo’);

if (isDemo) {
allWorks = DEMO_WORKS;
} else {
try {
allWorks = JSON.parse(localStorage.getItem(‘krk_works’) || ‘[]’);
} catch (e) {
allWorks = [];
}
}

updateFilterCounts();
renderWorks(allWorks);
}

// ── 필터 카운트 업데이트 ──
function updateFilterCounts() {
const total    = allWorks.length;
const creators = allWorks.filter(w => w.type === ‘creator’).length;
const checkers = allWorks.filter(w => w.type === ‘checker’).length;

document.getElementById(‘cnt-all’).textContent     = total;
document.getElementById(‘cnt-creator’).textContent = creators;
document.getElementById(‘cnt-checker’).textContent = checkers;
document.getElementById(‘worksTotal’).textContent  = `전체 ${total}건`;
}

// ── 필터 ──
function filterWorks(type, btn) {
currentFilter = type;

document.querySelectorAll(’.filter-tab’).forEach(t => t.classList.remove(‘active’));
btn.classList.add(‘active’);

const filtered = type === ‘all’ ? allWorks : allWorks.filter(w => w.type === type);
renderWorks(filtered);
}

// ── 작업 목록 렌더 ──
function renderWorks(works) {
const container = document.getElementById(‘worksList’);

if (works.length === 0) {
const isFiltered = currentFilter !== ‘all’;
container.innerHTML = `<div class="empty-state"> <div class="e-icon">${isFiltered ? '🔎' : '📂'}</div> <h3>${isFiltered ? '해당 작업이 없어요' : '아직 작업 기록이 없어요'}</h3> <p>${isFiltered ? '다른 필터를 선택해보세요' : '라벨을 생성하거나 분석하면 여기에 기록돼요'}</p> ${!isFiltered ?`<a class="btn-primary" href="./creator.html">라벨 생성하기</a>` : ''} </div>`;
return;
}

container.innerHTML = works.map(work => buildWorkItem(work)).join(’’);
}

// ── 작업 카드 HTML ──
function buildWorkItem(work) {
const icon      = work.type === ‘creator’ ? ‘✏️’ : ‘📋’;
const typeLabel = work.type === ‘creator’ ? ‘라벨 생성’ : ‘라벨 분석’;
const dateLabel = formatDate(work.created_at);
const badgeClass = `badge badge-${work.status || 'safe'}`;
const badgeText  = statusLabel(work.status);

// 제품명: title에서 추출 (저장 포맷: “XXX 라벨” 또는 “XXX 분석”)
const title = work.title || ‘(이름 없음)’;

return ` <div class="work-item" onclick="openModal('${work.id}')"> <div class="w-icon">${icon}</div> <div class="w-body"> <div class="w-title">${escHtml(title)}</div> <div class="w-meta">${typeLabel} · ${dateLabel}</div> </div> <div class="w-right"> <span class="${badgeClass}">${badgeText}</span> <span class="w-arrow">›</span> </div> </div>`;
}

// ── 날짜 포맷 ──
function formatDate(dateStr) {
if (!dateStr) return ‘’;
const today = new Date().toISOString().split(‘T’)[0];
const yesterday = (() => { const d = new Date(); d.setDate(d.getDate()-1); return d.toISOString().split(‘T’)[0]; })();

if (dateStr === today)     return ‘오늘’;
if (dateStr === yesterday) return ‘어제’;
return dateStr.replace(/-/g, ‘.’).slice(2); // YY.MM.DD
}

// ── 상태 라벨 ──
function statusLabel(status) {
const map = { safe: ‘SAFE’, warning: ‘WARNING’, risk: ‘ERROR’, danger: ‘ERROR’ };
return map[status] || ‘SAFE’;
}

// ── XSS 방어 ──
function escHtml(str) {
return String(str)
.replace(/&/g,’&’).replace(/</g,’<’)
.replace(/>/g,’>’).replace(/”/g,’"’);
}

// ── 모달 열기 ──
function openModal(workId) {
const work = allWorks.find(w => w.id === workId);
if (!work) return;

document.getElementById(‘modalTitle’).textContent = work.title || ‘작업 상세’;

const typeLabel = work.type === ‘creator’ ? ‘라벨 생성’ : ‘라벨 분석’;
const rows = [
[‘작업 유형’, typeLabel],
[‘날짜’,     work.created_at || ‘-’],
[‘상태’,     statusLabel(work.status)],
];

if (work.type === ‘creator’ && work.payload) {
if (work.payload.food_type)         rows.push([‘식품유형’, work.payload.food_type]);
if (work.payload.ingredients_count) rows.push([‘원재료 수’, work.payload.ingredients_count + ‘개’]);
}
if (work.type === ‘checker’ && work.payload) {
rows.push([‘누락 항목’, (work.payload.errors || 0) + ‘개’]);
rows.push([‘주의 표현’, (work.payload.warnings || 0) + ‘개’]);
}

document.getElementById(‘modalContent’).innerHTML =
rows.map(([lbl, val]) => ` <div class="detail-row"> <span class="lbl">${lbl}</span> <span class="val">${escHtml(String(val))}</span> </div>`).join(’’);

document.getElementById(‘workModal’).classList.add(‘active’);
}

// ── 모달 닫기 ──
function closeModal() {
document.getElementById(‘workModal’).classList.remove(‘active’);
}

// 모달 바깥 클릭 시 닫기
document.addEventListener(‘click’, e => {
if (e.target.id === ‘workModal’) closeModal();
});
