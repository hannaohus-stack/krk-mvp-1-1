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
document.addEventListener(‘DOMContentLoaded’, () => {
setupEventListeners();

// 수정 모드 확인: ?edit=workId 파라미터가 있을 때만 이전 데이터 로드
const params = new URLSearchParams(location.search);
const editId = params.get(‘edit’);

if (editId) {
loadFromWorkHistory(editId);
} else {
// 일반 진입: 항상 초기화 상태로 시작
clearAll();
}

updatePreview();
});

// ========== 이벤트 리스너 설정 ==========
function setupEventListeners() {
const inputFields = [‘productName’, ‘foodType’, ‘manufacturer’, ‘manufacturerAddress’,
‘consumerDate’, ‘weight’, ‘storageMethod’, ‘packagingMaterial’, ‘originCountry’];

inputFields.forEach(id => {
const el = document.getElementById(id);
if (el) {
el.addEventListener(‘change’, handleInputChange);
el.addEventListener(‘input’, handleInputChange);
}
});

document.getElementById(‘weightUnit’).addEventListener(‘change’, handleInputChange);

document.querySelectorAll(‘input[name=“businessType”]’).forEach(radio => {
radio.addEventListener(‘change’, handleInputChange);
});

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

// ========== 초기화 (새 작업) ==========
function clearAll() {
formData = {
productName: ‘’, foodType: ‘’, businessType: ‘’,
manufacturer: ‘’, manufacturerAddress: ‘’,
consumerDate: ‘’, weight: ‘’, weightUnit: ‘g’,
storageMethod: ‘’, packagingMaterial: ‘’, originCountry: ‘’,
ingredients: [], allergens: []
};

// 입력 필드 초기화
const textFields = [‘productName’, ‘manufacturer’, ‘manufacturerAddress’,
‘consumerDate’, ‘weight’, ‘storageMethod’, ‘packagingMaterial’, ‘originCountry’];
textFields.forEach(id => {
const el = document.getElementById(id);
if (el) el.value = ‘’;
});

const foodTypeEl = document.getElementById(‘foodType’);
if (foodTypeEl) foodTypeEl.value = ‘’;

const weightUnitEl = document.getElementById(‘weightUnit’);
if (weightUnitEl) weightUnitEl.value = ‘g’;

document.querySelectorAll(‘input[name=“businessType”]’).forEach(r => r.checked = false);

// 원재료 초기화 (빈 행 1개)
const tbody = document.getElementById(‘ingredientsBody’);
tbody.innerHTML = ` <tr class="ingredient-row"> <td><input type="text" class="ingredient-name" placeholder="밀가루"></td> <td><input type="number" class="ingredient-weight" placeholder="100" step="0.01"></td> <td><input type="text" class="ingredient-origin" placeholder="미국산"></td> <td><button type="button" class="btn-delete" onclick="deleteIngredient(this)">🗑️</button></td> </tr>`;

tbody.querySelectorAll(‘input’).forEach(input => {
input.addEventListener(‘input’, handleIngredientsChange);
});

// 요약 초기화
document.getElementById(‘totalIngredients’).textContent = ‘0’;
document.getElementById(‘totalWeight’).textContent = ‘0’;
document.getElementById(‘detectedAllergens’).textContent = ‘없음’;
}

// ========== 수정 모드: 작업 기록에서 데이터 로드 ==========
function loadFromWorkHistory(workId) {
try {
const works = JSON.parse(localStorage.getItem(‘krk_works’) || ‘[]’);
const work = works.find(w => w.id === workId);
if (!work || !work.fullData) return;

```
formData = { ...formData, ...work.fullData };
restoreFormUI();
```

} catch (e) {
console.error(‘작업 기록 로드 실패:’, e);
}
}

// ========== UI 복원 (수정 모드 전용) ==========
function restoreFormUI() {
document.getElementById(‘productName’).value = formData.productName || ‘’;
document.getElementById(‘foodType’).value = formData.foodType || ‘’;
document.getElementById(‘manufacturer’).value = formData.manufacturer || ‘’;
document.getElementById(‘manufacturerAddress’).value = formData.manufacturerAddress || ‘’;
document.getElementById(‘consumerDate’).value = formData.consumerDate || ‘’;
document.getElementById(‘weight’).value = formData.weight || ‘’;
document.getElementById(‘weightUnit’).value = formData.weightUnit || ‘g’;
document.getElementById(‘storageMethod’).value = formData.storageMethod || ‘’;
document.getElementById(‘packagingMaterial’).value = formData.packagingMaterial || ‘’;
document.getElementById(‘originCountry’).value = formData.originCountry || ‘’;

const businessRadio = document.querySelector(`input[name="businessType"][value="${formData.businessType}"]`);
if (businessRadio) businessRadio.checked = true;

restoreIngredients();
}

// ========== 원재료 관리 ==========
function addIngredient() {
const tbody = document.getElementById(‘ingredientsBody’);
const row = document.createElement(‘tr’);
row.className = ‘ingredient-row’;

row.innerHTML = `<td><input type="text" class="ingredient-name" placeholder="밀가루"></td> <td><input type="number" class="ingredient-weight" placeholder="100" step="0.01"></td> <td><input type="text" class="ingredient-origin" placeholder="미국산"></td> <td><button type="button" class="btn-delete" onclick="deleteIngredient(this)">🗑️</button></td>`;

tbody.appendChild(row);
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
const name   = row.querySelector(’.ingredient-name’).value.trim();
const weight = parseFloat(row.querySelector(’.ingredient-weight’).value) || 0;
const origin = row.querySelector(’.ingredient-origin’).value.trim();

```
if (name && weight > 0) {
  ingredients.push({ name, weight, origin, label: origin ? `${name}(${origin})` : name });
}
```

});

if (ingredients.length > 0) {
formData.ingredients = calculateAndSortIngredients(ingredients);
const ingredientText = formData.ingredients.map(i => i.label).join(’, ’);
formData.allergens = detectAllergens(ingredientText);
} else {
formData.ingredients = [];
formData.allergens = [];
}

updateIngredientsSummary();
}

function calculateAndSortIngredients(ingredients) {
const total = ingredients.reduce((sum, i) => sum + i.weight, 0);
if (total === 0) return ingredients;

return ingredients
.map(i => ({ …i, percent: ((i.weight / total) * 100).toFixed(2) }))
.sort((a, b) => parseFloat(b.percent) - parseFloat(a.percent));
}

function detectAllergens(ingredientText) {
const map = {
‘밀’:     [‘밀’, ‘밀가루’, ‘글루텐’],
‘우유’:   [‘우유’, ‘유제품’, ‘버터’, ‘치즈’, ‘요거트’],
‘대두’:   [‘대두’, ‘콩’, ‘두유’, ‘간장’, ‘된장’],
‘땅콩’:   [‘땅콩’, ‘피넛’],
‘계란’:   [‘계란’, ‘달걀’, ‘에그’],
‘메밀’:   [‘메밀’, ‘소바’],
‘새우’:   [‘새우’],
‘게’:     [‘게’],
‘고등어’: [‘고등어’],
‘돼지고기’: [‘돼지고기’],
‘복숭아’: [‘복숭아’],
‘토마토’: [‘토마토’],
‘아황산염’: [‘아황산염’],
‘호두’:   [‘호두’],
‘닭고기’: [‘닭고기’, ‘치킨’],
‘쇠고기’: [‘쇠고기’, ‘소고기’],
‘오징어’: [‘오징어’],
‘조개류’: [‘조개’, ‘굴’, ‘홍합’, ‘바지락’],
‘잣’:     [‘잣’]
};

const detected = new Set();
const lower = ingredientText.toLowerCase();

Object.keys(map).forEach(allergen => {
map[allergen].forEach(kw => {
if (lower.includes(kw.toLowerCase())) detected.add(allergen);
});
});

return Array.from(detected);
}

function updateIngredientsSummary() {
const total  = formData.ingredients.length;
const weight = formData.ingredients.reduce((s, i) => s + i.weight, 0);
document.getElementById(‘totalIngredients’).textContent = total;
document.getElementById(‘totalWeight’).textContent = Math.round(weight * 100) / 100;
document.getElementById(‘detectedAllergens’).textContent =
formData.allergens.length > 0 ? formData.allergens.join(’, ’) : ‘없음’;
}

// ========== 미리보기 업데이트 ==========
function updatePreview() {
updateRequiredCheckList();

const weight = formData.weight ? `${formData.weight}${formData.weightUnit}` : ‘’;
const labelHTML = generateLabelTable({ …formData, weight });
document.getElementById(‘labelPreview’).innerHTML = labelHTML;

updateStatusBadge();
}

function updateRequiredCheckList() {
const checks = {
‘제품명’:     !!formData.productName,
‘식품유형’:   !!formData.foodType,
‘제조원’:     !!formData.manufacturer,
‘제조원 주소’: !!formData.manufacturerAddress,
‘소비기한’:   !!formData.consumerDate,
‘내용량’:     !!formData.weight,
‘원재료명’:   formData.ingredients.length > 0,
‘보관방법’:   !!formData.storageMethod,
‘1399 문구’:  true
};

const items = document.querySelectorAll(’#requiredCheckList li’);
let completed = 0;
const keys = Object.keys(checks);

items.forEach((item, i) => {
const span = item.querySelector(’.check’);
if (checks[keys[i]]) {
span.textContent = ‘✓’;
span.style.color = ‘#4CAF50’;
completed++;
} else {
span.textContent = ‘○’;
span.style.color = ‘#999’;
}
});

document.getElementById(‘completedItems’).textContent = completed;
document.getElementById(‘completionProgress’).style.width = (completed / 9 * 100) + ‘%’;
}

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
const { productName, foodType, consumerDate, weight, manufacturer,
manufacturerAddress, ingredients, allergens, storageMethod, packagingMaterial } = data;

const ingredientText = ingredients.length > 0
? `원재료명: ${ingredients.map(i => i.label).join(', ')}`
: ‘’;

const allergenText = allergens.length > 0
? `알레르기 유발물질: ${allergens.join(', ')} 함유`
: ‘’;

const row = (label, value, bg = ‘#f9f9f9’) => ` <tr> <td style="border:1px solid #000;padding:8px;width:35%;font-weight:bold;background:${bg};">${label}</td> <td style="border:1px solid #000;padding:8px;background:${bg === '#fff3cd' ? '#fff3cd' : 'white'};">${value || '-'}</td> </tr>`;

let html = `<table style="width:100%;border-collapse:collapse;border:2px solid #000;font-family:Arial,sans-serif;">`;
html += row(‘제품명’, productName);
html += row(‘식품유형’, foodType);
html += row(‘소비기한’, consumerDate);
html += row(‘내용량’, weight);
html += row(‘제조원’, manufacturer);
html += row(‘소재지’, manufacturerAddress);
if (ingredientText) html += row(‘원재료명’, ingredientText);
if (allergenText)   html += row(‘알레르기’, allergenText, ‘#fff3cd’);
html += row(‘보관방법’, storageMethod);
html += row(‘포장재질’, packagingMaterial);
html += ` <tr> <td colspan="2" style="border:1px solid #000;padding:8px;text-align:center;font-size:11px;"> 부정·불량식품 신고는 국번없이 1399 </td> </tr>`;
html += `</table>`;

return html;
}

// ========== 다운로드: 미리보기 영역을 그대로 저장 ==========
function downloadLabel(format) {
const previewEl = document.getElementById(‘labelPreview’);
const filename  = (formData.productName || ‘label’).replace(/\s+/g, ‘_’);

if (!formData.productName) {
alert(‘⚠️ 제품명을 먼저 입력해주세요!’);
return;
}

if (format === ‘png’) {
// 미리보기 영역을 그대로 PNG 캡처
html2canvas(previewEl, {
scale: 2,
backgroundColor: ‘white’,
useCORS: true
}).then(canvas => {
const link = document.createElement(‘a’);
link.href = canvas.toDataURL(‘image/png’);
link.download = `${filename}_label.png`;
link.click();
}).catch(err => {
alert(’PNG 다운로드 실패: ’ + err.message);
});

} else if (format === ‘pdf’) {
// 미리보기 영역을 그대로 PDF로 변환
const opt = {
margin: 10,
filename: `${filename}_label.pdf`,
image: { type: ‘jpeg’, quality: 0.98 },
html2canvas: { scale: 2, backgroundColor: ‘white’ },
jsPDF: { orientation: ‘portrait’, unit: ‘mm’, format: ‘a4’ }
};

```
html2pdf().set(opt).from(previewEl).save();
```

}

// 다운로드 시점에 작업 기록 저장
saveWorkToHistory(formData, ‘safe’);
}

// ========== 텍스트 복사: 한글표시사항 문구 ==========
function copyToClipboard() {
if (!formData.productName) {
alert(‘⚠️ 제품명을 먼저 입력해주세요!’);
return;
}

const weight = formData.weight ? `${formData.weight}${formData.weightUnit}` : ‘-’;
const ingredients = formData.ingredients.map(i => i.label).join(’, ’) || ‘-’;
const allergens   = formData.allergens.length > 0
? `알레르기 유발물질: ${formData.allergens.join(', ')} 함유`
: ‘’;

const lines = [
`제품명: ${formData.productName || '-'}`,
`식품유형: ${formData.foodType || '-'}`,
`소비기한: ${formData.consumerDate || '-'}`,
`내용량: ${weight}`,
`제조원: ${formData.manufacturer || '-'}`,
`소재지: ${formData.manufacturerAddress || '-'}`,
`원재료명: ${ingredients}`,
];

if (allergens) lines.push(allergens);

lines.push(
`보관방법: ${formData.storageMethod || '-'}`,
`포장재질: ${formData.packagingMaterial || '-'}`,
`부정·불량식품 신고는 국번없이 1399`
);

const text = lines.join(’\n’);

navigator.clipboard.writeText(text).then(() => {
alert(‘✅ 한글표시사항 텍스트가 복사되었습니다!’);
}).catch(() => {
// fallback
const ta = document.createElement(‘textarea’);
ta.value = text;
document.body.appendChild(ta);
ta.select();
document.execCommand(‘copy’);
document.body.removeChild(ta);
alert(‘✅ 복사되었습니다!’);
});
}

// ========== 라벨 분석기로 보내기 ==========
function analyzeLabel() {
if (!formData.productName) {
alert(‘⚠️ 제품명을 먼저 입력해주세요!’);
return;
}

sessionStorage.setItem(‘labelToAnalyze’, JSON.stringify({
labelHTML: document.getElementById(‘labelPreview’).innerHTML,
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
if (!text) { alert(‘데이터를 입력해주세요.’); return; }

const tbody = document.getElementById(‘ingredientsBody’);
tbody.innerHTML = ‘’;

let count = 0;
text.split(’\n’).forEach(line => {
const parts = line.split(’,’).map(p => p.trim());
if (parts[0] && parts[1]) {
const row = document.createElement(‘tr’);
row.className = ‘ingredient-row’;
row.innerHTML = ` <td><input type="text" class="ingredient-name" value="${parts[0]}"></td> <td><input type="number" class="ingredient-weight" value="${parts[1]}" step="0.01"></td> <td><input type="text" class="ingredient-origin" value="${parts[2] || ''}"></td> <td><button type="button" class="btn-delete" onclick="deleteIngredient(this)">🗑️</button></td>`;
tbody.appendChild(row);
row.querySelectorAll(‘input’).forEach(i => i.addEventListener(‘input’, handleIngredientsChange));
count++;
}
});

if (count > 0) {
updateIngredients();
updatePreview();
alert(`✅ ${count}개 원재료가 추가되었습니다!`);
closeExcelPaste();
} else {
alert(‘❌ 올바른 형식의 데이터가 없습니다.\n형식: 재료명,중량’);
}
}

// ========== 원재료 복원 (수정 모드) ==========
function restoreIngredients() {
const tbody = document.getElementById(‘ingredientsBody’);
tbody.innerHTML = ‘’;

if (formData.ingredients && formData.ingredients.length > 0) {
formData.ingredients.forEach(ing => {
const row = document.createElement(‘tr’);
row.className = ‘ingredient-row’;
row.innerHTML = ` <td><input type="text" class="ingredient-name" value="${ing.name}"></td> <td><input type="number" class="ingredient-weight" value="${ing.weight}" step="0.01"></td> <td><input type="text" class="ingredient-origin" value="${ing.origin || ''}"></td> <td><button type="button" class="btn-delete" onclick="deleteIngredient(this)">🗑️</button></td>`;
tbody.appendChild(row);
row.querySelectorAll(‘input’).forEach(i => i.addEventListener(‘input’, handleIngredientsChange));
});
} else {
addIngredient();
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
fullData: { …labelData } // 수정 모드를 위해 전체 데이터 보존
});
if (works.length > 50) works.pop();
localStorage.setItem(‘krk_works’, JSON.stringify(works));
} catch (e) {
console.error(‘작업 기록 저장 실패:’, e);
}
}

// ========== 페이지 이탈 경고 ==========
window.addEventListener(‘beforeunload’, e => {
if (formData.productName || formData.ingredients.length > 0) {
e.preventDefault();
e.returnValue = ‘’;
}
});