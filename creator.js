/* ========================================
Creator JS - AI 라벨 생성기 메인 로직
======================================== */

// ========== 상태 관리 ==========
let formData = {
productName: ‘’,
foodType: ‘’,
businessType: ‘’,
manufacturer: ‘’,
manufacturerAddress: ‘’,
consumerDate: ‘’,
weight: ‘’,
weightUnit: ‘g’,
storageMethod: ‘’,
packagingMaterial: ‘’,
originCountry: ‘’,
ingredients: [],
allergens: []
};

// ========== 초기화 ==========
// [수정1] 일반 진입 시 항상 새 작업. ?edit=workId 일 때만 기존 데이터 로드.
document.addEventListener(‘DOMContentLoaded’, () => {
setupEventListeners();

const params = new URLSearchParams(location.search);
const editId = params.get(‘edit’);

if (editId) {
// 수정 모드: 작업 기록에서 데이터 로드
loadFromWorkHistory(editId);
}
// 일반 진입: formData 기본값 그대로, UI도 빈 상태 그대로 시작

updatePreview();
});

// ========== 이벤트 리스너 설정 ==========
function setupEventListeners() {
// 제품정보 입력 필드
const inputFields = [‘productName’, ‘foodType’, ‘manufacturer’, ‘manufacturerAddress’,
‘consumerDate’, ‘weight’, ‘storageMethod’, ‘packagingMaterial’, ‘originCountry’];

inputFields.forEach(id => {
const element = document.getElementById(id);
if (element) {
element.addEventListener(‘change’, handleInputChange);
element.addEventListener(‘input’, handleInputChange);
}
});

// 내용량 단위
document.getElementById(‘weightUnit’).addEventListener(‘change’, handleInputChange);

// 업종 라디오
document.querySelectorAll(‘input[name=“businessType”]’).forEach(radio => {
radio.addEventListener(‘change’, handleInputChange);
});

// 원재료 입력 감시
document.getElementById(‘ingredientsBody’).addEventListener(‘input’, handleIngredientsChange);
}

function handleInputChange(e) {
const id = e.target.id || e.target.name;
const value = e.target.value;

if (e.target.type === ‘radio’) {
formData.businessType = value;
} else {
formData[id] = value;
}

updatePreview();
}

function handleIngredientsChange() {
updateIngredients();
updatePreview();
}

// ========== 원재료 관리 ==========
function addIngredient() {
const tbody = document.getElementById(‘ingredientsBody’);
const row = document.createElement(‘tr’);
row.className = ‘ingredient-row’;

row.innerHTML = `<td><input type="text" class="ingredient-name" placeholder="밀가루"></td> <td><input type="number" class="ingredient-weight" placeholder="100" step="0.01"></td> <td><input type="text" class="ingredient-origin" placeholder="미국산"></td> <td><button type="button" class="btn-delete" onclick="deleteIngredient(this)">🗑️</button></td>`;

tbody.appendChild(row);

// 새 입력 필드에 이벤트 리스너 추가
row.querySelectorAll(‘input’).forEach(input => {
input.addEventListener(‘input’, handleIngredientsChange);
});
}

function deleteIngredient(button) {
button.closest(‘tr’).remove();
updateIngredients();
updatePreview();
}

function updateIngredients() {
const rows = document.querySelectorAll(’.ingredient-row’);
const ingredients = [];

rows.forEach(row => {
const name = row.querySelector(’.ingredient-name’).value.trim();
const weight = parseFloat(row.querySelector(’.ingredient-weight’).value) || 0;
const origin = row.querySelector(’.ingredient-origin’).value.trim();

```
if (name && weight > 0) {
  ingredients.push({
    name: name,
    weight: weight,
    origin: origin,
    label: origin ? `${name}(${origin})` : name
  });
}
```

});

// 배합비 계산 및 정렬
if (ingredients.length > 0) {
formData.ingredients = calculateAndSortIngredients(ingredients);

```
// 알레르기 감지
const ingredientText = formData.ingredients.map(i => i.label).join(', ');
formData.allergens = detectAllergens(ingredientText);
```

} else {
formData.ingredients = [];
formData.allergens = [];
}

// 요약 업데이트
updateIngredientsSummary();
}

// ========== 배합비 계산 및 정렬 ==========
function calculateAndSortIngredients(ingredients) {
const totalWeight = ingredients.reduce((sum, ing) => sum + ing.weight, 0);

if (totalWeight === 0) return ingredients;

// 백분율 계산
const calculated = ingredients.map(ing => ({
…ing,
percent: ((ing.weight / totalWeight) * 100).toFixed(2)
}));

// 고함량순 정렬
return calculated.sort((a, b) => parseFloat(b.percent) - parseFloat(a.percent));
}

// ========== 알레르기 감지 ==========
function detectAllergens(ingredientText) {
const allergenKeywords = {
‘밀’: [‘밀’, ‘밀가루’, ‘글루텐’],
‘우유’: [‘우유’, ‘유제품’, ‘버터’, ‘치즈’, ‘요거트’, ‘락토오스’],
‘대두’: [‘대두’, ‘콩’, ‘두유’, ‘간장’, ‘된장’],
‘땅콩’: [‘땅콩’, ‘피넛’],
‘계란’: [‘계란’, ‘달걀’, ‘에그’],
‘메밀’: [‘메밀’, ‘소바’],
‘새우’: [‘새우’],
‘게’: [‘게’],
‘고등어’: [‘고등어’],
‘돼지고기’: [‘돼지고기’, ‘돈’],
‘복숭아’: [‘복숭아’],
‘토마토’: [‘토마토’],
‘아황산염’: [‘아황산염’, ‘아황산’],
‘호두’: [‘호두’],
‘닭고기’: [‘닭고기’, ‘치킨’],
‘쇠고기’: [‘쇠고기’, ‘소고기’],
‘오징어’: [‘오징어’],
‘조개류’: [‘조개’, ‘굴’, ‘홍합’, ‘바지락’],
‘잣’: [‘잣’]
};

const detected = new Set();
const lowerText = ingredientText.toLowerCase();

Object.keys(allergenKeywords).forEach(allergen => {
allergenKeywords[allergen].forEach(keyword => {
if (lowerText.includes(keyword.toLowerCase())) {
detected.add(allergen);
}
});
});

return Array.from(detected);
}

// ========== 요약 업데이트 ==========
function updateIngredientsSummary() {
const totalCount = formData.ingredients.length;
const totalWeight = formData.ingredients.reduce((sum, ing) => sum + ing.weight, 0);
const allergens = formData.allergens.length > 0 ? formData.allergens.join(’, ’) : ‘없음’;

document.getElementById(‘totalIngredients’).textContent = totalCount;
document.getElementById(‘totalWeight’).textContent = Math.round(totalWeight * 100) / 100;
document.getElementById(‘detectedAllergens’).textContent = allergens;
}

// ========== 미리보기 업데이트 (핵심) ==========
function updatePreview() {
// 필수항목 체크
updateRequiredCheckList();

// 라벨 생성
const weight = formData.weight ? `${formData.weight}${formData.weightUnit}` : ‘’;
const labelHTML = generateLabelTable({
…formData,
weight: weight
});

document.getElementById(‘labelPreview’).innerHTML = labelHTML;

// 상태 배지 업데이트
updateStatusBadge();
}

// ========== 필수항목 체크리스트 ==========
function updateRequiredCheckList() {
const checks = {
‘제품명’: !!formData.productName,
‘식품유형’: !!formData.foodType,
‘제조원’: !!formData.manufacturer,
‘제조원 주소’: !!formData.manufacturerAddress,
‘소비기한’: !!formData.consumerDate,
‘내용량’: !!formData.weight,
‘원재료명’: formData.ingredients.length > 0,
‘보관방법’: !!formData.storageMethod,
‘1399 문구’: true // 자동 추가
};

const listItems = document.querySelectorAll(’#requiredCheckList li’);
let completed = 0;

const checkLabels = Object.keys(checks);
listItems.forEach((item, index) => {
const checkSpan = item.querySelector(’.check’);
const key = checkLabels[index];

```
if (checks[key]) {
  checkSpan.textContent = '✓';
  checkSpan.style.color = '#4CAF50';
  completed++;
} else {
  checkSpan.textContent = '○';
  checkSpan.style.color = '#999';
}
```

});

document.getElementById(‘completedItems’).textContent = completed;

// 진행률 바 업데이트
const percentage = (completed / 9) * 100;
document.getElementById(‘completionProgress’).style.width = percentage + ‘%’;
}

// ========== 상태 배지 업데이트 ==========
function updateStatusBadge() {
const badge = document.getElementById(‘statusBadge’);
const completed = parseInt(document.getElementById(‘completedItems’).textContent) || 0;

if (completed === 9) {
badge.textContent = ‘✅ 완료’;
badge.className = ‘status-badge status-success’;
} else if (completed >= 5) {
badge.textContent = ‘⏳ 작성중’;
badge.className = ‘status-badge status-warning’;
} else {
badge.textContent = ‘새 작업’;
badge.className = ‘status-badge status-default’;
}
}

// ========== 라벨 테이블 생성 ==========
function generateLabelTable(data) {
const { productName, foodType, consumerDate, weight, manufacturer, manufacturerAddress,
ingredients, allergens, storageMethod, packagingMaterial } = data;

// 원재료명 문장 생성
const ingredientLabels = ingredients.map(i => i.label).join(’, ’);
const ingredientText = ingredientLabels ? `원재료명: ${ingredientLabels}` : ‘’;

// 알레르기 문구 생성
const allergenText = allergens.length > 0
? `알레르기 유발물질: ${allergens.join(', ')} 함유`
: ‘’;

// 테이블 생성
let html = `<table style="width: 100%; border-collapse: collapse; border: 2px solid #000; font-family: Arial, sans-serif;"> <tr> <td style="border: 1px solid #000; padding: 8px; width: 35%; font-weight: bold; background: #f9f9f9;">제품명</td> <td style="border: 1px solid #000; padding: 8px;">${productName || '-'}</td> </tr> <tr> <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background: #f9f9f9;">식품유형</td> <td style="border: 1px solid #000; padding: 8px;">${foodType || '-'}</td> </tr> <tr> <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background: #f9f9f9;">소비기한</td> <td style="border: 1px solid #000; padding: 8px;">${consumerDate || '-'}</td> </tr> <tr> <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background: #f9f9f9;">내용량</td> <td style="border: 1px solid #000; padding: 8px;">${weight || '-'}</td> </tr> <tr> <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background: #f9f9f9;">제조원</td> <td style="border: 1px solid #000; padding: 8px;">${manufacturer || '-'}</td> </tr> <tr> <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background: #f9f9f9;">소재지</td> <td style="border: 1px solid #000; padding: 8px;">${manufacturerAddress || '-'}</td> </tr>`;

if (ingredientText) {
html += `<tr> <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background: #f9f9f9;">원재료명</td> <td style="border: 1px solid #000; padding: 8px;">${ingredientText}</td> </tr>`;
}

if (allergenText) {
html += `<tr> <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background: #fff3cd; color: #856404;">알레르기</td> <td style="border: 1px solid #000; padding: 8px; background: #fff3cd;">${allergenText}</td> </tr>`;
}

html += `<tr> <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background: #f9f9f9;">보관방법</td> <td style="border: 1px solid #000; padding: 8px;">${storageMethod || '-'}</td> </tr> <tr> <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background: #f9f9f9;">포장재질</td> <td style="border: 1px solid #000; padding: 8px;">${packagingMaterial || '-'}</td> </tr> <tr> <td colspan="2" style="border: 1px solid #000; padding: 8px; text-align: center; font-size: 11px;"> 부정·불량식품 신고는 국번없이 1399 </td> </tr> </table>`;

return html;
}

// ========== [수정2] 다운로드: 미리보기 영역 그대로 저장 ==========
function downloadLabel(format) {
if (!formData.productName) {
alert(‘⚠️ 제품명을 먼저 입력해주세요!’);
return;
}

const previewEl = document.getElementById(‘labelPreview’);
const filename  = formData.productName.replace(/\s+/g, ‘_’);

if (format === ‘pdf’) {
const opt = {
margin: 10,
filename: `${filename}_label.pdf`,
image: { type: ‘jpeg’, quality: 0.98 },
html2canvas: { scale: 2, backgroundColor: ‘white’ },
jsPDF: { orientation: ‘portrait’, unit: ‘mm’, format: ‘a4’ }
};
html2pdf().set(opt).from(previewEl).save();

} else if (format === ‘png’) {
html2canvas(previewEl, { scale: 2, backgroundColor: ‘white’ }).then(canvas => {
const link = document.createElement(‘a’);
link.href = canvas.toDataURL(‘image/png’);
link.download = `${filename}_label.png`;
link.click();
}).catch(err => {
alert(’PNG 다운로드 실패: ’ + err.message);
});
}

saveWorkToHistory(formData, ‘safe’);
}

// ========== [수정3] 텍스트 복사: 한글표시사항 전체 문구 ==========
function copyToClipboard() {
if (!formData.productName) {
alert(‘⚠️ 제품명을 먼저 입력해주세요!’);
return;
}

const weight = formData.weight ? `${formData.weight}${formData.weightUnit}` : ‘-’;
const ingredients = formData.ingredients.map(i => i.label).join(’, ’) || ‘-’;
const allergenLine = formData.allergens.length > 0
? `알레르기 유발물질: ${formData.allergens.join(', ')} 함유`
: null;

const lines = [
`제품명: ${formData.productName || '-'}`,
`식품유형: ${formData.foodType || '-'}`,
`소비기한: ${formData.consumerDate || '-'}`,
`내용량: ${weight}`,
`제조원: ${formData.manufacturer || '-'}`,
`소재지: ${formData.manufacturerAddress || '-'}`,
`원재료명: ${ingredients}`,
allergenLine,
`보관방법: ${formData.storageMethod || '-'}`,
`포장재질: ${formData.packagingMaterial || '-'}`,
`부정·불량식품 신고는 국번없이 1399`
].filter(Boolean).join(’\n’);

navigator.clipboard.writeText(lines).then(() => {
alert(‘✅ 한글표시사항이 복사되었습니다!’);
}).catch(() => {
const ta = document.createElement(‘textarea’);
ta.value = lines;
document.body.appendChild(ta);
ta.select();
document.execCommand(‘copy’);
document.body.removeChild(ta);
alert(‘✅ 복사되었습니다!’);
});
}

// ========== 라벨 분석기로 보내기 ==========
function analyzeLabel() {
const labelHTML = document.getElementById(‘labelPreview’).innerHTML;

if (!formData.productName) {
alert(‘⚠️ 제품명을 먼저 입력해주세요!’);
return;
}

sessionStorage.setItem(‘labelToAnalyze’, JSON.stringify({
labelHTML: labelHTML,
productName: formData.productName,
sourceData: formData
}));

window.location.href = ‘checker.html’;
}

// ========== Excel 붙여넣기 ==========
function showExcelPaste() {
document.getElementById(‘excelModal’).style.display = ‘flex’;
document.getElementById(‘excelPasteArea’).focus();
}

function closeExcelPaste() {
document.getElementById(‘excelModal’).style.display = ‘none’;
document.getElementById(‘excelPasteArea’).value = ‘’;
}

function pasteExcelData() {
const text = document.getElementById(‘excelPasteArea’).value.trim();
if (!text) {
alert(‘데이터를 입력해주세요.’);
return;
}

const tbody = document.getElementById(‘ingredientsBody’);
const lines = text.split(’\n’);

// 기존 행 모두 삭제
tbody.innerHTML = ‘’;

let addedCount = 0;
lines.forEach(line => {
const parts = line.split(’,’).map(p => p.trim());
if (parts[0] && parts[1]) {
const row = document.createElement(‘tr’);
row.className = ‘ingredient-row’;

```
  const name = parts[0];
  const weight = parts[1];
  const origin = parts[2] || '';
  
  row.innerHTML = `
    <td><input type="text" class="ingredient-name" value="${name}"></td>
    <td><input type="number" class="ingredient-weight" value="${weight}" step="0.01"></td>
    <td><input type="text" class="ingredient-origin" value="${origin}"></td>
    <td><button type="button" class="btn-delete" onclick="deleteIngredient(this)">🗑️</button></td>
  `;
  
  tbody.appendChild(row);
  
  row.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', handleIngredientsChange);
  });
  
  addedCount++;
}
```

});

if (addedCount > 0) {
updateIngredients();
updatePreview();
alert(`✅ ${addedCount}개의 원재료가 추가되었습니다!`);
closeExcelPaste();
} else {
alert(‘❌ 올바른 형식의 데이터가 없습니다.\n형식: 재료명,중량’);
}
}

// ========== 수정 모드: 작업 기록에서 로드 ==========
function loadFromWorkHistory(workId) {
try {
const works = JSON.parse(localStorage.getItem(‘krk_works’) || ‘[]’);
const work = works.find(w => w.id === workId);
if (!work || !work.fullData) return;

```
formData = { ...formData, ...work.fullData };

document.getElementById('productName').value = formData.productName || '';
document.getElementById('foodType').value = formData.foodType || '';
document.getElementById('manufacturer').value = formData.manufacturer || '';
document.getElementById('manufacturerAddress').value = formData.manufacturerAddress || '';
document.getElementById('consumerDate').value = formData.consumerDate || '';
document.getElementById('weight').value = formData.weight || '';
document.getElementById('weightUnit').value = formData.weightUnit || 'g';
document.getElementById('storageMethod').value = formData.storageMethod || '';
document.getElementById('packagingMaterial').value = formData.packagingMaterial || '';
document.getElementById('originCountry').value = formData.originCountry || '';

const radio = document.querySelector(`input[name="businessType"][value="${formData.businessType}"]`);
if (radio) radio.checked = true;

restoreIngredients();
```

} catch (e) {
console.error(‘작업 기록 로드 실패:’, e);
}
}

function restoreIngredients() {
const tbody = document.getElementById(‘ingredientsBody’);
tbody.innerHTML = ‘’;

if (formData.ingredients && formData.ingredients.length > 0) {
formData.ingredients.forEach(ing => {
const row = document.createElement(‘tr’);
row.className = ‘ingredient-row’;

```
  row.innerHTML = `
    <td><input type="text" class="ingredient-name" value="${ing.name}"></td>
    <td><input type="number" class="ingredient-weight" value="${ing.weight}" step="0.01"></td>
    <td><input type="text" class="ingredient-origin" value="${ing.origin || ''}"></td>
    <td><button type="button" class="btn-delete" onclick="deleteIngredient(this)">🗑️</button></td>
  `;
  
  tbody.appendChild(row);
  
  row.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', handleIngredientsChange);
  });
});
```

} else {
// 기본 빈 행 1개 유지
const row = document.createElement(‘tr’);
row.className = ‘ingredient-row’;
row.innerHTML = `<td><input type="text" class="ingredient-name" placeholder="밀가루"></td> <td><input type="number" class="ingredient-weight" placeholder="100" step="0.01"></td> <td><input type="text" class="ingredient-origin" placeholder="미국산"></td> <td><button type="button" class="btn-delete" onclick="deleteIngredient(this)">🗑️</button></td>`;
tbody.appendChild(row);

```
row.querySelectorAll('input').forEach(input => {
  input.addEventListener('input', handleIngredientsChange);
});
```

}
}

// ========== 작업 기록 저장 ==========
function saveWorkToHistory(labelData, status) {
try {
const works = JSON.parse(localStorage.getItem(‘krk_works’) || ‘[]’);
works.unshift({
id: ‘work_’ + Date.now(),
type: ‘creator’,
title: (labelData.productName || ‘새 라벨’) + ’ 라벨’,
created_at: new Date().toISOString().split(‘T’)[0],
status: status || ‘safe’,
payload: {
product_name: labelData.productName,
food_type: labelData.foodType,
ingredients_count: labelData.ingredients?.length || 0
},
fullData: { …labelData }
});
if (works.length > 50) works.pop();
localStorage.setItem(‘krk_works’, JSON.stringify(works));
} catch (e) {
console.error(‘작업 기록 저장 실패:’, e);
}
}

// ========== 페이지 이탈 경고 ==========
window.addEventListener(‘beforeunload’, (e) => {
const hasData = formData.productName || formData.ingredients.length > 0;
if (hasData) {
e.preventDefault();
e.returnValue = ‘’;
}
});