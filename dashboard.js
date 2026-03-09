// ============================================================
// KRK Dashboard - dashboard.js
// ============================================================

// ===== 상수 =====
const PLAN_CONFIG = {
  free: {
    name: 'Free',
    desc: '월 0원 · 체험 플랜',
    features: ['라벨 생성 3회/월', '라벨 분석 3회/월'],
    labelMax: 3,
    checkerMax: 3
  },
  lite: {
    name: 'LITE',
    desc: '월 9,900원',
    features: ['라벨 생성 10회/월', '라벨 분석 10회/월', '법령 개정 알림'],
    labelMax: 10,
    checkerMax: 10
  },
  standard: {
    name: 'STANDARD',
    desc: '월 19,900원',
    features: ['라벨 생성 무제한', '라벨 분석 무제한', '품목제조보고 가이드'],
    labelMax: Infinity,
    checkerMax: Infinity
  }
};

// ===== 상태 =====
let allWorks = [];
let currentFilter = 'all';

// ===== 초기화 =====
function init() {
  setTodayDate();
  loadUserInfo();
  loadWorks();
  renderWorks();
}

// ===== 날짜 =====
function setTodayDate() {
  const now = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
  document.getElementById('todayDate').textContent =
    now.toLocaleDateString('ko-KR', options);
}

// ===== 사용자 정보 로드 =====
function loadUserInfo() {
  const isPremium = localStorage.getItem('krk_isPremium') === 'true';
  const planKey = localStorage.getItem('krk_plan') || 'free';
  const plan = PLAN_CONFIG[planKey] || PLAN_CONFIG['free'];

  // 헤더 플랜 배지
  const badge = document.getElementById('planBadge');
  badge.textContent = plan.name;
  if (isPremium) badge.classList.add('premium');

  // 플랜 카드
  document.getElementById('planName').textContent = plan.name;
  document.getElementById('planDesc').textContent = plan.desc;

  const featuresEl = document.getElementById('planFeatures');
  featuresEl.innerHTML = plan.features
    .map(f => `<div class="plan-feature">${f}</div>`)
    .join('');

  // 사용량
  const labelLeft = parseInt(localStorage.getItem('krk_labelGenerations') || plan.labelMax);
  const checkerLeft = parseInt(localStorage.getItem('krk_diagnoses') || plan.checkerMax);

  // 라벨 생성 카운트
  if (plan.labelMax === Infinity) {
    document.getElementById('labelCount').textContent = '∞';
    document.getElementById('labelSub').textContent = '무제한 사용 가능';
  } else {
    document.getElementById('labelCount').textContent = labelLeft;
    document.getElementById('labelSub').textContent =
      `이번 달 남은 횟수 (총 ${plan.labelMax}회)`;
    renderUsageBar('labelBar', labelLeft, plan.labelMax);
  }

  // 라벨 분석 카운트
  if (plan.checkerMax === Infinity) {
    document.getElementById('checkerCount').textContent = '∞';
    document.getElementById('checkerSub').textContent = '무제한 사용 가능';
  } else {
    document.getElementById('checkerCount').textContent = checkerLeft;
    document.getElementById('checkerSub').textContent =
      `이번 달 남은 횟수 (총 ${plan.checkerMax}회)`;
    renderUsageBar('checkerBar', checkerLeft, plan.checkerMax);
  }
}

// ===== 사용량 바 렌더링 =====
function renderUsageBar(containerId, current, max) {
  const percent = Math.round((current / max) * 100);
  let colorClass = 'blue';
  if (percent <= 30) colorClass = 'red';
  else if (percent <= 60) colorClass = ''; // default blue
  else colorClass = 'green';

  document.getElementById(containerId).innerHTML = `
    <div class="usage-bar-label">
      <span>${current}회 남음</span>
      <span>${percent}%</span>
    </div>
    <div class="usage-bar">
      <div class="usage-bar-fill ${colorClass}" style="width: ${percent}%"></div>
    </div>
  `;
}

// ===== 작업 내역 로드 =====
function loadWorks() {
  const raw = localStorage.getItem('krk_works');
  allWorks = raw ? JSON.parse(raw) : [];

  // 데모 데이터: 작업이 없으면 샘플 표시 (개발 확인용)
  if (allWorks.length === 0 && window.location.search.includes('demo')) {
    allWorks = getDemoWorks();
  }
}

// ===== 작업 필터링 =====
function filterWorks(type) {
  currentFilter = type;

  // 탭 active 처리
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  event.currentTarget.classList.add('active');

  renderWorks();
}

// ===== 작업 목록 렌더링 =====
function renderWorks() {
  const filtered = currentFilter === 'all'
    ? allWorks
    : allWorks.filter(w => w.type === currentFilter);

  // 총 건수 업데이트
  document.getElementById('totalCount').textContent =
    `전체 ${allWorks.length}건`;

  const container = document.getElementById('worksList');

  if (filtered.length === 0) {
    container.innerHTML = renderEmptyState();
    return;
  }

  container.innerHTML = filtered.map(work => renderWorkItem(work)).join('');
}

// ===== Work 아이템 렌더링 =====
function renderWorkItem(work) {
  const typeIcon = work.type === 'creator' ? '✏️' : '📋';
  const typeLabel = work.type === 'creator' ? '라벨 생성' : '라벨 분석';
  const statusText = { safe: 'SAFE', warning: 'WARNING', risk: 'RISK' };

  return `
    <div class="work-item" onclick="openWorkDetail('${work.id}')">
      <div class="work-type-icon ${work.type}">${typeIcon}</div>
      <div class="work-info">
        <div class="work-title">${escapeHtml(work.title)}</div>
        <div class="work-meta">
          <span class="work-type-label">${typeLabel}</span>
          <span class="work-date">·</span>
          <span class="work-date">${formatDate(work.created_at)}</span>
        </div>
      </div>
      <span class="status-badge ${work.status}">
        ${statusText[work.status] || work.status.toUpperCase()}
      </span>
    </div>
  `;
}

// ===== 빈 상태 렌더링 =====
function renderEmptyState() {
  const isFiltered = currentFilter !== 'all';
  return `
    <div class="empty-state">
      <div class="empty-icon">${isFiltered ? '🔍' : '📂'}</div>
      <h3>${isFiltered ? '해당 유형의 작업이 없습니다' : '아직 작업 내역이 없습니다'}</h3>
      <p>${isFiltered
        ? '다른 탭을 확인하거나 새 작업을 시작해보세요.'
        : 'Creator 또는 Checker에서 첫 작업을 시작해보세요.'
      }</p>
      ${!isFiltered ? `<a class="btn-primary" href="../creator/creator.html">✏️ 첫 라벨 만들기</a>` : ''}
    </div>
  `;
}

// ===== 작업 상세 모달 =====
function openWorkDetail(workId) {
  const work = allWorks.find(w => w.id === workId);
  if (!work) return;

  const statusText = { safe: 'SAFE ✓', warning: 'WARNING ⚠️', risk: 'RISK ✗' };
  const typeLabel = work.type === 'creator' ? '라벨 생성' : '라벨 분석';

  let payloadHtml = '';
  if (work.payload) {
    if (work.type === 'creator') {
      if (work.payload.product_name)
        payloadHtml += `<div class="detail-row"><span class="label">제품명</span><span class="value">${escapeHtml(work.payload.product_name)}</span></div>`;
      if (work.payload.food_type)
        payloadHtml += `<div class="detail-row"><span class="label">식품유형</span><span class="value">${escapeHtml(work.payload.food_type)}</span></div>`;
      if (work.payload.ingredients_count !== undefined)
        payloadHtml += `<div class="detail-row"><span class="label">원재료 수</span><span class="value">${work.payload.ingredients_count}개</span></div>`;
    } else if (work.type === 'checker') {
      if (work.payload.errors !== undefined)
        payloadHtml += `<div class="detail-row"><span class="label">누락 항목</span><span class="value">${work.payload.errors}건</span></div>`;
      if (work.payload.warnings !== undefined)
        payloadHtml += `<div class="detail-row"><span class="label">주의 항목</span><span class="value">${work.payload.warnings}건</span></div>`;
      if (work.payload.suggestions !== undefined)
        payloadHtml += `<div class="detail-row"><span class="label">권고 사항</span><span class="value">${work.payload.suggestions}건</span></div>`;
    }
  }

  document.getElementById('modalTitle').textContent = work.title;
  document.getElementById('modalContent').innerHTML = `
    <div class="detail-row">
      <span class="label">작업 유형</span>
      <span class="value">${typeLabel}</span>
    </div>
    <div class="detail-row">
      <span class="label">작업 일시</span>
      <span class="value">${formatDate(work.created_at)}</span>
    </div>
    <div class="detail-row">
      <span class="label">결과 상태</span>
      <span class="value status-badge ${work.status}" style="display:inline-block">${statusText[work.status]}</span>
    </div>
    ${payloadHtml}
  `;

  document.getElementById('workModal').classList.add('active');
}

function closeModal() {
  document.getElementById('workModal').classList.remove('active');
}

// 모달 외부 클릭 닫기
document.getElementById('workModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ===== 유틸 =====
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const now = new Date();
  const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diff === 0) return '오늘';
  if (diff === 1) return '어제';
  if (diff < 7) return `${diff}일 전`;
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ===== 데모 데이터 (개발 확인용 /?demo 파라미터로 활성화) =====
function getDemoWorks() {
  return [
    {
      id: 'work_demo_1',
      type: 'creator',
      title: '고추장 쿠키 라벨',
      created_at: new Date().toISOString().split('T')[0],
      status: 'safe',
      payload: { product_name: '고추장 쿠키', food_type: '과자류', ingredients_count: 8 }
    },
    {
      id: 'work_demo_2',
      type: 'checker',
      title: '홍삼 음료 라벨_v2.jpg 분석',
      created_at: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      status: 'warning',
      payload: { errors: 0, warnings: 2, suggestions: 3 }
    },
    {
      id: 'work_demo_3',
      type: 'creator',
      title: '유기농 쌀과자 라벨',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
      status: 'safe',
      payload: { product_name: '유기농 쌀과자', food_type: '과자류', ingredients_count: 5 }
    },
    {
      id: 'work_demo_4',
      type: 'checker',
      title: '된장국 소스 라벨_최종.png 분석',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
      status: 'risk',
      payload: { errors: 2, warnings: 1, suggestions: 2 }
    }
  ];
}

// ===== 실행 =====
init();

