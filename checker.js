/* ========================================
   Checker JS - AI 라벨 분석기 메인 로직
   ======================================== */

// ========== 상태 관리 ==========
let analysisData = {
  ocrText: '',
  imageFile: null,
  riskLevel: 'pending',
  missingItems: [],
  forbiddenExpressions: [],
  warnings: []
};

// ========== 초기화 ==========
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
});

// ========== 이벤트 리스너 ==========
function setupEventListeners() {
  // 이미지 입력
  document.getElementById('imageInput').addEventListener('change', handleImageSelect);
  
  // 드래그 & 드롭
  const uploadArea = document.querySelector('.upload-area');
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#FF6B6B';
    uploadArea.style.background = '#fff5f5';
  });
  
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#ddd';
    uploadArea.style.background = '#fafafa';
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#ddd';
    uploadArea.style.background = '#fafafa';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      document.getElementById('imageInput').files = files;
      handleImageSelect({ target: { files } });
    }
  });
}

// ========== 이미지 선택 처리 ==========
function handleImageSelect(e) {
  const files = e.target.files;
  if (files.length === 0) return;
  
  const file = files[0];
  analysisData.imageFile = file;
  
  // 이미지 미리보기
  const reader = new FileReader();
  reader.onload = (event) => {
    document.getElementById('uploadedImage').src = event.target.result;
    document.querySelector('.upload-area').style.display = 'none';
    document.getElementById('imagePreviewContainer').style.display = 'flex';
    
    updateStatusBadge('pending');
  };
  reader.readAsDataURL(file);
}

// ========== OCR 시작 ==========
async function startOCR() {
  if (!analysisData.imageFile) {
    alert('이미지를 먼저 선택해주세요');
    return;
  }
  
  // UI 업데이트
  document.getElementById('imagePreviewContainer').style.display = 'none';
  document.getElementById('ocrProgress').style.display = 'block';
  document.getElementById('analyzeBtn').disabled = true;
  
  try {
    // Tesseract.js로 OCR 수행
    const { data: { text } } = await Tesseract.recognize(
      analysisData.imageFile,
      'kor',
      {
        logger: m => {
          // 진행률 업데이트
          const progress = Math.round(m.progress * 100);
          document.getElementById('progressFill').style.width = progress + '%';
          document.getElementById('progressText').textContent = `처리 중: ${progress}%`;
        }
      }
    );
    
    analysisData.ocrText = text;
    
    // 분석 실행
    performAnalysis(text);

    // 작업 기록 저장
    saveCheckerResult(analysisData.imageFile?.name, {
      status: analysisData.riskLevel,
      errors: analysisData.missingItems,
      warnings: analysisData.forbiddenExpressions,
      suggestions: []
    });
    
    // UI 업데이트
    document.getElementById('ocrProgress').style.display = 'none';
    document.getElementById('ocrText').value = text;
    
    // 버튼 활성화
    document.getElementById('downloadBtn').disabled = false;
    document.getElementById('editBtn').disabled = false;
    
  } catch (error) {
    console.error('OCR 에러:', error);
    alert('❌ OCR 처리 중 오류가 발생했습니다.\n\n다시 시도해주세요.');
    
    // UI 복원
    document.getElementById('ocrProgress').style.display = 'none';
    document.getElementById('imagePreviewContainer').style.display = 'flex';
    document.getElementById('analyzeBtn').disabled = false;
  }
}

// ========== 라벨 분석 ==========
function performAnalysis(ocrText) {
  const lowerText = ocrText.toLowerCase();
  
  // 1. 필수 9대 항목 검사
  analysisData.missingItems = checkMissingItems(lowerText);
  
  // 2. 금지 표현 검사
  analysisData.forbiddenExpressions = checkForbiddenExpressions(lowerText);
  
  // 3. 소비기한/유통기한 검사
  const expirationCheck = checkExpirationDate(lowerText);
  
  // 4. 알레르기 검사
  const allergyCheck = checkAllergyLabel(lowerText);
  
  // 5. 위험 등급 산정
  analysisData.riskLevel = calculateRiskLevel(
    analysisData.missingItems,
    analysisData.forbiddenExpressions,
    expirationCheck,
    allergyCheck
  );
  
  // 6. 결과 표시
  displayResults({
    missingItems: analysisData.missingItems,
    forbiddenExpressions: analysisData.forbiddenExpressions,
    expirationCheck: expirationCheck,
    allergyCheck: allergyCheck
  });
  
  // 7. 상태 배지 업데이트
  updateStatusBadge(analysisData.riskLevel);
}

// ========== 필수 9대 항목 검사 ==========
function checkMissingItems(lowerText) {
  const requiredItems = [
    { name: '제품명', keywords: [] }, // 일반적으로 이미지 최상단
    { name: '식품유형', keywords: ['식품유형', '과자', '음료', '빵'] },
    { name: '제조원', keywords: ['제조원', '제조사', '(주)', '주식회사'] },
    { name: '제조원 주소', keywords: ['주소', '서울', '대구', '부산', '인천', '광주', '대전', '울산', '세종'] },
    { name: '소비기한', keywords: ['소비기한', '유통기한'] },
    { name: '내용량', keywords: ['g', 'ml', 'kg', '그램', '밀리', '킬로'] },
    { name: '원재료명', keywords: ['원재료', '성분', '밀가루', '설탕', '소금'] },
    { name: '보관방법', keywords: ['보관', '냉장', '냉동', '상온', '직사광선'] },
    { name: '1399 신고', keywords: ['1399', '신고', '부정', '불량'] }
  ];
  
  const missing = [];
  
  requiredItems.forEach(item => {
    let found = false;
    
    if (item.keywords.length === 0) {
      // 제품명은 대부분 있다고 가정
      found = true;
    } else {
      found = item.keywords.some(keyword => lowerText.includes(keyword));
    }
    
    if (!found) {
      missing.push(item.name);
    }
  });
  
  return missing;
}

// ========== 금지 표현 검사 ==========
function checkForbiddenExpressions(lowerText) {
  const forbiddenWords = [
    { word: '최고', severity: 'error', message: '"최고"는 금지된 표현입니다' },
    { word: '특효', severity: 'error', message: '"특효"는 의약품 표현으로 금지됩니다' },
    { word: '항암', severity: 'error', message: '항암 관련 표현은 금지됩니다' },
    { word: '완치', severity: 'error', message: '"완치"는 의약품 표현으로 금지됩니다' },
    { word: '무설탕', severity: 'warning', message: '"무설탕" 표현 사용 시 영양표시 확인 필요' },
    { word: '무지방', severity: 'warning', message: '"무지방" 표현 사용 시 영양표시 확인 필요' },
    { word: '무콜레스테롤', severity: 'warning', message: '"무콜레스테롤" 표현 사용 시 검증 필요' },
    { word: '천연', severity: 'warning', message: '"천연" 표현은 신중히 사용해야 합니다' },
    { word: '유기농', severity: 'warning', message: '"유기농" 표현 사용 시 인증 필요' }
  ];
  
  const found = [];
  
  forbiddenWords.forEach(item => {
    if (lowerText.includes(item.word)) {
      found.push(item);
    }
  });
  
  return found;
}

// ========== 소비기한/유통기한 검사 ==========
function checkExpirationDate(lowerText) {
  if (lowerText.includes('유통기한')) {
    return {
      type: 'warning',
      message: '유통기한 표현이 발견되었습니다. 현재는 소비기한 사용을 권장합니다.'
    };
  }
  
  if (lowerText.includes('소비기한')) {
    return {
      type: 'success',
      message: '소비기한 표현이 올바르게 표기되어 있습니다.'
    };
  }
  
  return {
    type: 'error',
    message: '소비기한/유통기한이 발견되지 않습니다.'
  };
}

// ========== 알레르기 표시 검사 ==========
function checkAllergyLabel(lowerText) {
  const allergenKeywords = ['밀', '우유', '대두', '땅콩', '계란', '메밀', '새우', '게', '고등어', 
                            '돼지고기', '복숭아', '토마토', '아황산염', '호두', '닭고기', '쇠고기',
                            '오징어', '조개', '굴', '홍합', '잣'];
  
  const hasAllergen = allergenKeywords.some(keyword => lowerText.includes(keyword));
  const hasAllergyLabel = lowerText.includes('알레르기') || lowerText.includes('함유');
  
  if (hasAllergen && !hasAllergyLabel) {
    return {
      type: 'error',
      message: '알레르기 유발물질이 감지되었지만 알레르기 표시가 없습니다.'
    };
  }
  
  if (hasAllergenLabel) {
    return {
      type: 'success',
      message: '알레르기 표시가 올바르게 표기되어 있습니다.'
    };
  }
  
  return {
    type: 'info',
    message: '알레르기 표시 확인'
  };
}

// ========== 위험 등급 산정 ==========
function calculateRiskLevel(missingItems, forbiddenExpressions, expirationCheck, allergyCheck) {
  // 필수항목 2개 이상 누락 → 위험
  if (missingItems.length >= 2) {
    return 'danger';
  }
  
  // 금지표현(에러) 있음 → 위험
  if (forbiddenExpressions.some(item => item.severity === 'error')) {
    return 'danger';
  }
  
  // 알레르기 에러 → 위험
  if (allergyCheck.type === 'error') {
    return 'danger';
  }
  
  // 필수항목 1개 누락 또는 경고 표현 → 주의
  if (missingItems.length >= 1 || forbiddenExpressions.length > 0 || expirationCheck.type === 'warning') {
    return 'warning';
  }
  
  // 모두 통과 → 안전
  return 'safe';
}

// ========== 결과 표시 ==========
function displayResults(results) {
  const { missingItems, forbiddenExpressions, expirationCheck, allergyCheck } = results;
  
  let html = '';
  
  // 필수항목 누락
  if (missingItems.length > 0) {
    html += `
      <div class="result-section">
        <h4>❌ 누락된 필수항목 (${missingItems.length}개)</h4>
        ${missingItems.map(item => `<div class="result-item error">${item}</div>`).join('')}
      </div>
    `;
  }
  
  // 금지표현
  if (forbiddenExpressions.length > 0) {
    const errors = forbiddenExpressions.filter(e => e.severity === 'error');
    const warnings = forbiddenExpressions.filter(e => e.severity === 'warning');
    
    if (errors.length > 0) {
      html += `
        <div class="result-section">
          <h4>🚫 위반 표현 (${errors.length}개)</h4>
          ${errors.map(item => `<div class="result-item error">${item.word}: ${item.message}</div>`).join('')}
        </div>
      `;
    }
    
    if (warnings.length > 0) {
      html += `
        <div class="result-section">
          <h4>⚠️ 주의 표현 (${warnings.length}개)</h4>
          ${warnings.map(item => `<div class="result-item warning">${item.word}: ${item.message}</div>`).join('')}
        </div>
      `;
    }
  }
  
  // 소비기한/유통기한
  html += `
    <div class="result-section">
      <h4>📅 소비기한 확인</h4>
      <div class="result-item ${expirationCheck.type === 'error' ? 'error' : expirationCheck.type === 'warning' ? 'warning' : 'success'}">
        ${expirationCheck.message}
      </div>
    </div>
  `;
  
  // 알레르기
  html += `
    <div class="result-section">
      <h4>🔔 알레르기 표시</h4>
      <div class="result-item ${allergyCheck.type === 'error' ? 'error' : allergyCheck.type === 'warning' ? 'warning' : 'success'}">
        ${allergyCheck.message}
      </div>
    </div>
  `;
  
  // 수정 권고
  html += `
    <div class="result-section">
      <h4>✏️ 수정 권고사항</h4>
  `;
  
  if (missingItems.length > 0) {
    html += `<div class="result-item error">필수 누락항목부터 우선 추가하세요</div>`;
  }
  
  if (forbiddenExpressions.some(e => e.severity === 'error')) {
    html += `<div class="result-item error">위반 표현은 반드시 제거해야 합니다</div>`;
  }
  
  if (missingItems.length === 0 && forbiddenExpressions.length === 0) {
    html += `<div class="result-item success">라벨이 조건을 만족합니다</div>`;
  }
  
  html += `</div>`;
  
  document.getElementById('analysisResult').innerHTML = html;
}

// ========== 상태 배지 업데이트 ==========
function updateStatusBadge(riskLevel) {
  const badge = document.getElementById('statusBadge');
  const riskDiv = document.getElementById('riskLevel');
  const riskBadge = riskDiv.querySelector('.risk-badge');
  const riskMessage = document.getElementById('riskMessage');
  
  // 이전 상태 제거
  riskBadge.className = 'risk-badge';
  
  if (riskLevel === 'danger') {
    badge.textContent = '🚨 위험';
    badge.className = 'status-badge status-danger';
    riskBadge.classList.add('risk-danger');
    riskBadge.textContent = '위험';
    riskMessage.textContent = '수정이 필요합니다. 우선순위에 따라 수정하세요.';
  } else if (riskLevel === 'warning') {
    badge.textContent = '⚠️ 주의';
    badge.className = 'status-badge status-warning';
    riskBadge.classList.add('risk-warning');
    riskBadge.textContent = '주의';
    riskMessage.textContent = '검토 후 필요한 수정을 진행하세요.';
  } else if (riskLevel === 'safe') {
    badge.textContent = '✅ 안전';
    badge.className = 'status-badge status-safe';
    riskBadge.classList.add('risk-safe');
    riskBadge.textContent = '안전';
    riskMessage.textContent = '라벨이 기본 조건을 만족합니다.';
  } else {
    badge.textContent = '대기중';
    badge.className = 'status-badge';
    riskBadge.classList.add('risk-pending');
    riskBadge.textContent = '대기중';
    riskMessage.textContent = '이미지를 분석해주세요';
  }
}

// ========== OCR 텍스트 복사 ==========
function copyOCRText() {
  const ocrText = document.getElementById('ocrText').value;
  navigator.clipboard.writeText(ocrText).then(() => {
    alert('✅ 텍스트가 복사되었습니다!');
  }).catch(err => {
    alert('❌ 복사 실패: ' + err.message);
  });
}

// ========== 리포트 다운로드 ==========
function downloadReport() {
  const reportHTML = generateReport();
  const element = document.createElement('div');
  element.innerHTML = reportHTML;
  
  const opt = {
    margin: 10,
    filename: `라벨분석_${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
  };
  
  html2pdf().set(opt).from(element).save();
}

function generateReport() {
  const riskLabels = { 'safe': '안전', 'warning': '주의', 'danger': '위험', 'pending': '대기중' };
  
  return `
    <div style="font-family: Arial; padding: 20px; background: white;">
      <h1>🔍 라벨 분석 리포트</h1>
      <p>분석 날짜: ${new Date().toLocaleString('ko-KR')}</p>
      <hr>
      
      <h2>위험 등급: ${riskLabels[analysisData.riskLevel]}</h2>
      
      <h3>추출된 텍스트</h3>
      <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; white-space: pre-wrap;">
${analysisData.ocrText}
      </pre>
      
      <h3>분석 결과</h3>
      <ul>
        <li>누락된 항목: ${analysisData.missingItems.length}개</li>
        <li>위반 표현: ${analysisData.forbiddenExpressions.length}개</li>
      </ul>
      
      <p style="margin-top: 20px; font-size: 12px; color: #666;">
        ※ 본 분석은 1차 검토용으로 최종 법률 자문이 아닙니다.<br>
        중요한 결정 전 전문가 의견을 구하시기 바랍니다.
      </p>
    </div>
  `;
}

// ========== Creator로 이동 ==========
function goToCreator() {
  sessionStorage.setItem('checkerAnalysis', JSON.stringify(analysisData));
  window.location.href = 'creator.html';
}

// ========== 초기화 ==========
function resetAnalysis() {
  analysisData = {
    ocrText: '',
    imageFile: null,
    riskLevel: 'pending',
    missingItems: [],
    forbiddenExpressions: [],
    warnings: []
  };
  
  document.getElementById('imageInput').value = '';
  document.getElementById('uploadedImage').src = '';
  document.getElementById('ocrText').value = '';
  document.getElementById('analysisResult').innerHTML = '<p class="empty-text">아직 분석 결과가 없습니다</p>';
  document.querySelector('.upload-area').style.display = 'flex';
  document.getElementById('imagePreviewContainer').style.display = 'none';
  document.getElementById('ocrProgress').style.display = 'none';
  document.getElementById('downloadBtn').disabled = true;
  document.getElementById('editBtn').disabled = true;
  
  updateStatusBadge('pending');
}

// ========== 이미지 리셋 ==========
function resetImage() {
  document.getElementById('imageInput').value = '';
  document.getElementById('uploadedImage').src = '';
  document.querySelector('.upload-area').style.display = 'flex';
  document.getElementById('imagePreviewContainer').style.display = 'none';
  document.getElementById('ocrProgress').style.display = 'none';
  document.getElementById('ocrText').value = '';
  document.getElementById('analysisResult').innerHTML = '<p class="empty-text">아직 분석 결과가 없습니다</p>';
  
  analysisData.imageFile = null;
  analysisData.ocrText = '';
  
  updateStatusBadge('pending');
}

// ========== 작업 기록 저장 ==========
function saveCheckerResult(fileName, result) {
  const works = JSON.parse(localStorage.getItem('krk_works') || '[]');
  works.unshift({
    id: 'work_' + Date.now(),
    type: 'checker',
    title: (fileName || '라벨') + ' 분석',
    created_at: new Date().toISOString().split('T')[0],
    status: result.status,
    payload: {
      errors: result.errors?.length || 0,
      warnings: result.warnings?.length || 0,
      suggestions: result.suggestions?.length || 0
    }
  });
  if (works.length > 50) works.pop();
  localStorage.setItem('krk_works', JSON.stringify(works));
}
