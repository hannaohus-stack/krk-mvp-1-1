/* ========================================
   Creator JS - AI 라벨 생성기 메인 로직
   안정화 버전
======================================== */

// ========== 상태 관리 ==========
let formData = {
  productName: "",
  foodType: "",
  businessType: "",
  manufacturer: "",
  manufacturerAddress: "",
  consumerDate: "",
  weightValue: "",
  weightUnit: "g",
  storageMethod: "",
  packagingMaterial: "",
  originCountry: "",
  returnContact: "",
  cautionText: "",
  ingredients: [],
  allergens: []
};

// 입력 필드 id/name -> formData key 매핑
const FIELD_MAP = {
  productName: "productName",
  foodType: "foodType",
  businessType: "businessType",
  manufacturer: "manufacturer",
  manufacturerAddress: "manufacturerAddress",
  consumerDate: "consumerDate",
  weight: "weightValue",
  weightValue: "weightValue",
  weightUnit: "weightUnit",
  storageMethod: "storageMethod",
  packagingMaterial: "packagingMaterial",
  originCountry: "originCountry",
  returnContact: "returnContact",
  cautionText: "cautionText"
};

// ========== 공통 유틸 ==========
function getEl(id) {
  return document.getElementById(id);
}

function setText(id, value) {
  const el = getEl(id);
  if (el) el.textContent = value;
}

function setHTML(id, html) {
  const el = getEl(id);
  if (el) el.innerHTML = html;
}

function setValue(id, value) {
  const el = getEl(id);
  if (el) el.value = value ?? "";
}

function getWeightText() {
  return formData.weightValue ? `${formData.weightValue}${formData.weightUnit}` : "";
}

function hasAnyInputData() {
  return !!(
    formData.productName ||
    formData.foodType ||
    formData.businessType ||
    formData.manufacturer ||
    formData.manufacturerAddress ||
    formData.consumerDate ||
    formData.weightValue ||
    formData.storageMethod ||
    formData.packagingMaterial ||
    formData.originCountry ||
    formData.returnContact ||
    formData.cautionText ||
    formData.ingredients.length > 0
  );
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ========== 초기화 ==========
document.addEventListener("DOMContentLoaded", () => {
  try {
    setupEventListeners();

    const params = new URLSearchParams(location.search);
    const editId = params.get("edit");

    if (editId) {
      loadFromWorkHistory(editId);
    } else {
      ensureAtLeastOneIngredientRow();
    }

    updateIngredients();
    updatePreview();
  } catch (error) {
    console.error("[Creator] 초기화 실패:", error);
  }
});

// ========== 이벤트 리스너 설정 ==========
function setupEventListeners() {
  const inputIds = [
    "productName",
    "foodType",
    "manufacturer",
    "manufacturerAddress",
    "consumerDate",
    "weight",
    "weightValue",
    "storageMethod",
    "packagingMaterial",
    "originCountry",
    "returnContact",
    "cautionText"
  ];

  inputIds.forEach((id) => {
    const element = getEl(id);
    if (!element) return;

    element.addEventListener("input", handleInputChange);
    element.addEventListener("change", handleInputChange);
  });

  const weightUnitEl = getEl("weightUnit");
  if (weightUnitEl) {
    weightUnitEl.addEventListener("change", handleInputChange);
  }

  document.querySelectorAll('input[name="businessType"]').forEach((radio) => {
    radio.addEventListener("change", handleInputChange);
  });

  const ingredientsBody = getEl("ingredientsBody");
  if (ingredientsBody) {
    ingredientsBody.addEventListener("input", handleIngredientsChange);
    ingredientsBody.addEventListener("change", handleIngredientsChange);
  }
}

function handleInputChange(e) {
  const sourceKey = e.target.id || e.target.name;
  const targetKey = FIELD_MAP[sourceKey];

  if (!targetKey) return;

  if (e.target.type === "radio") {
    formData[targetKey] = e.target.value;
  } else {
    formData[targetKey] = e.target.value;
  }

  updatePreview();
}

function handleIngredientsChange() {
  updateIngredients();
  updatePreview();
}

// ========== 원재료 관리 ==========
function ensureAtLeastOneIngredientRow() {
  const tbody = getEl("ingredientsBody");
  if (!tbody) return;

  const rows = tbody.querySelectorAll(".ingredient-row");
  if (rows.length === 0) {
    addIngredient();
  }
}

function addIngredient() {
  const tbody = getEl("ingredientsBody");
  if (!tbody) return;

  const row = document.createElement("tr");
  row.className = "ingredient-row";
  row.innerHTML = `
    <td><input type="text" class="ingredient-name" placeholder="밀가루"></td>
    <td><input type="number" class="ingredient-weight" placeholder="100" step="0.01"></td>
    <td><input type="text" class="ingredient-origin" placeholder="미국산"></td>
    <td><button type="button" class="btn-delete" onclick="deleteIngredient(this)">🗑️</button></td>
  `;

  tbody.appendChild(row);
}

function deleteIngredient(button) {
  const row = button.closest("tr");
  if (row) row.remove();

  ensureAtLeastOneIngredientRow();
  updateIngredients();
  updatePreview();
}

function updateIngredients() {
  const rows = document.querySelectorAll(".ingredient-row");
  const ingredients = [];

  rows.forEach((row) => {
    const nameEl = row.querySelector(".ingredient-name");
    const weightEl = row.querySelector(".ingredient-weight");
    const originEl = row.querySelector(".ingredient-origin");

    const name = nameEl ? nameEl.value.trim() : "";
    const weight = weightEl ? parseFloat(weightEl.value) || 0 : 0;
    const origin = originEl ? originEl.value.trim() : "";

    if (name && weight > 0) {
      ingredients.push({
        name,
        weight,
        origin,
        label: origin ? `${name}(${origin})` : name
      });
    }
  });

  if (ingredients.length > 0) {
    formData.ingredients = calculateAndSortIngredients(ingredients);

    const ingredientText = formData.ingredients.map((i) => i.label).join(", ");
    formData.allergens = detectAllergens(ingredientText);
  } else {
    formData.ingredients = [];
    formData.allergens = [];
  }

  updateIngredientsSummary();
  updateIngredientResultPanel();
}

// ========== 배합비 계산 및 정렬 ==========
function calculateAndSortIngredients(ingredients) {
  const totalWeight = ingredients.reduce((sum, ing) => sum + ing.weight, 0);
  if (totalWeight === 0) return ingredients;

  const calculated = ingredients.map((ing) => ({
    ...ing,
    percent: Number(((ing.weight / totalWeight) * 100).toFixed(2))
  }));

  return calculated.sort((a, b) => b.percent - a.percent);
}

// ========== 알레르기 감지 ==========
function detectAllergens(ingredientText) {
  const allergenKeywords = {
    "밀": ["밀", "밀가루", "글루텐"],
    "우유": ["우유", "유제품", "버터", "치즈", "요거트", "락토오스"],
    "대두": ["대두", "콩", "두유", "간장", "된장"],
    "땅콩": ["땅콩", "피넛"],
    "계란": ["계란", "달걀", "에그"],
    "메밀": ["메밀", "소바"],
    "새우": ["새우"],
    "게": ["게"],
    "고등어": ["고등어"],
    "돼지고기": ["돼지고기", "돈"],
    "복숭아": ["복숭아"],
    "토마토": ["토마토"],
    "아황산염": ["아황산염", "아황산"],
    "호두": ["호두"],
    "닭고기": ["닭고기", "치킨"],
    "쇠고기": ["쇠고기", "소고기"],
    "오징어": ["오징어"],
    "조개류": ["조개", "굴", "홍합", "바지락"],
    "잣": ["잣"]
  };

  const detected = new Set();
  const lowerText = ingredientText.toLowerCase();

  Object.keys(allergenKeywords).forEach((allergen) => {
    allergenKeywords[allergen].forEach((keyword) => {
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
  const allergens = formData.allergens.length > 0 ? formData.allergens.join(", ") : "없음";

  setText("totalIngredients", String(totalCount));
  setText("totalWeight", String(Math.round(totalWeight * 100) / 100));
  setText("detectedAllergens", allergens);
}

// ========== 우측 원재료 결과 패널 ==========
function updateIngredientResultPanel() {
  const container = getEl("ingredientSummary");
  if (!container) return;

  if (formData.ingredients.length === 0) {
    container.innerHTML = `
      <div style="padding: 16px; color: #777; font-size: 14px;">
        원재료를 입력하면 자동 정렬된 결과와 알레르기 문구가 표시됩니다.
      </div>
    `;
    return;
  }

  const totalWeight = formData.ingredients.reduce((sum, ing) => sum + ing.weight, 0);
  const ingredientText = formData.ingredients.map((i) => i.label).join(", ");
  const allergenText = formData.allergens.length > 0
    ? `알레르기 유발물질: ${formData.allergens.join(", ")} 함유`
    : "감지된 알레르기 유발물질 없음";

  const rows = formData.ingredients.map((ing, index) => `
    <tr>
      <td style="border:1px solid #ddd; padding:8px; text-align:center;">${index + 1}</td>
      <td style="border:1px solid #ddd; padding:8px;">${escapeHtml(ing.label)}</td>
      <td style="border:1px solid #ddd; padding:8px; text-align:right;">${ing.weight}${formData.weightUnit || "g"}</td>
      <td style="border:1px solid #ddd; padding:8px; text-align:right;">${ing.percent}%</td>
    </tr>
  `).join("");

  container.innerHTML = `
    <div style="padding: 16px;">
      <table style="width:100%; border-collapse:collapse; font-size:14px; background:#fff;">
        <thead>
          <tr>
            <th style="border:1px solid #ddd; padding:8px; background:#f7f7f7;">순서</th>
            <th style="border:1px solid #ddd; padding:8px; background:#f7f7f7;">원재료명</th>
            <th style="border:1px solid #ddd; padding:8px; background:#f7f7f7;">중량</th>
            <th style="border:1px solid #ddd; padding:8px; background:#f7f7f7;">비율</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div style="margin-top:16px; font-size:14px; line-height:1.6;">
        <div><strong>원재료명:</strong> ${escapeHtml(ingredientText)}</div>
        <div style="margin-top:8px;"><strong>알레르기 표시:</strong> ${escapeHtml(allergenText)}</div>
        <div style="margin-top:8px; color:#777;">총 원재료 중량: ${totalWeight}${formData.weightUnit || "g"}</div>
      </div>
    </div>
  `;
}

// ========== 미리보기 업데이트 ==========
function updatePreview() {
  updateRequiredCheckList();
  updateLabelPreview();
  updateStatusBadge();
}

function updateLabelPreview() {
  const previewEl = getEl("labelPreview");
  if (!previewEl) return;

  if (!hasAnyInputData()) {
    previewEl.innerHTML = `
      <div style="
        display:flex;
        align-items:center;
        justify-content:center;
        min-height:280px;
        color:#999;
        font-size:15px;
        text-align:center;
        padding:24px;
        background:#fff;
        border:1px solid #ddd;
      ">
        왼쪽에 제품 정보를 입력하면 라벨이 자동으로 생성됩니다
      </div>
    `;
    return;
  }

  previewEl.innerHTML = generateLabelTable();
}

// ========== 필수항목 체크리스트 ==========
function getRequiredChecks() {
  return {
    productName: !!formData.productName,
    foodType: !!formData.foodType,
    manufacturer: !!formData.manufacturer,
    manufacturerAddress: !!formData.manufacturerAddress,
    consumerDate: !!formData.consumerDate,
    weight: !!formData.weightValue,
    ingredients: formData.ingredients.length > 0,
    storageMethod: !!formData.storageMethod,
    report1399: true
  };
}

function updateRequiredCheckList() {
  const checks = getRequiredChecks();
  const items = document.querySelectorAll("#requiredCheckList [data-check-key]");

  let completed = 0;

  items.forEach((item) => {
    const key = item.dataset.checkKey;
    const checkSpan = item.querySelector(".check");
    const isDone = !!checks[key];

    if (!checkSpan) return;

    checkSpan.textContent = isDone ? "✓" : "○";
    checkSpan.style.color = isDone ? "#4CAF50" : "#999";
    checkSpan.style.fontWeight = "700";

    if (isDone) completed++;
  });

  setText("completedItems", String(completed));

  const progressEl = getEl("completionProgress");
  if (progressEl) {
    progressEl.style.width = `${(completed / 9) * 100}%`;
  }
}

// ========== 상태 배지 업데이트 ==========
function updateStatusBadge() {
  const badge = getEl("statusBadge");
  if (!badge) return;

  const checks = getRequiredChecks();
  const completed = Object.values(checks).filter(Boolean).length;
  const hasData = hasAnyInputData();

  if (!hasData) {
    badge.textContent = "새 작업";
    badge.className = "status-badge status-default";
    return;
  }

  if (completed === 9) {
    badge.textContent = "✅ 완료";
    badge.className = "status-badge status-success";
  } else {
    badge.textContent = "⚠️ 필수 항목 부족";
    badge.className = "status-badge status-warning";
  }
}

// ========== 라벨 테이블 생성 ==========
function generateLabelTable() {
  const ingredientLabels = formData.ingredients.map((i) => i.label).join(", ");
  const allergenText = formData.allergens.length > 0
    ? `알레르기 유발물질: ${formData.allergens.join(", ")} 함유`
    : "";

  const rows = [];

  if (formData.productName) {
    rows.push(makeTableRow("제품명", formData.productName));
  }
  if (formData.foodType) {
    rows.push(makeTableRow("식품유형", formData.foodType));
  }
  if (formData.consumerDate) {
    rows.push(makeTableRow("소비기한", formData.consumerDate));
  }
  if (getWeightText()) {
    rows.push(makeTableRow("내용량", getWeightText()));
  }
  if (formData.manufacturer || formData.manufacturerAddress) {
    const manufacturerText = [formData.manufacturer, formData.manufacturerAddress]
      .filter(Boolean)
      .join(" / ");
    rows.push(makeTableRow("제조원", manufacturerText));
  }
  if (ingredientLabels) {
    rows.push(makeTableRow("원재료명", ingredientLabels));
  }
  if (allergenText) {
    rows.push(makeTableRow("알레르기 표시", allergenText, true));
  }
  if (formData.storageMethod) {
    rows.push(makeTableRow("보관방법", formData.storageMethod));
  }
  if (formData.packagingMaterial) {
    rows.push(makeTableRow("포장재질", formData.packagingMaterial));
  }
  if (formData.originCountry) {
    rows.push(makeTableRow("원산지", formData.originCountry));
  }
  if (formData.returnContact) {
    rows.push(makeTableRow("반품/교환처", formData.returnContact));
  }
  if (formData.cautionText) {
    rows.push(makeTableRow("주의사항", formData.cautionText));
  }

  rows.push(`
    <tr>
      <td colspan="2" style="border:1px solid #000; padding:8px; text-align:center; font-size:11px;">
        부정·불량식품 신고는 국번없이 1399
      </td>
    </tr>
  `);

  return `
    <div style="background:#fff; border:2px solid #000; padding:12px;">
      <div style="font-weight:700; font-size:16px; margin-bottom:8px;">한글표시사항</div>
      <table style="width:100%; border-collapse:collapse; font-family:Arial, sans-serif; font-size:14px; color:#111;">
        ${rows.join("")}
      </table>
    </div>
  `;
}

function makeTableRow(label, value, isAlert = false) {
  return `
    <tr>
      <td style="
        border:1px solid #000;
        padding:8px;
        width:35%;
        font-weight:bold;
        background:${isAlert ? "#fff3cd" : "#f9f9f9"};
        color:${isAlert ? "#856404" : "#111"};
      ">
        ${escapeHtml(label)}
      </td>
      <td style="
        border:1px solid #000;
        padding:8px;
        background:${isAlert ? "#fff3cd" : "#fff"};
      ">
        ${escapeHtml(value)}
      </td>
    </tr>
  `;
}

// ========== 다운로드 ==========
function downloadLabel(format) {
  if (!formData.productName) {
    alert("⚠️ 제품명을 먼저 입력해주세요!");
    return;
  }

  const previewEl = getEl("labelPreview");
  if (!previewEl) {
    alert("미리보기 영역을 찾을 수 없습니다.");
    return;
  }

  const filename = formData.productName.replace(/\s+/g, "_");

  if (format === "pdf") {
    const opt = {
      margin: 10,
      filename: `${filename}_label.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, backgroundColor: "white" },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" }
    };

    html2pdf().set(opt).from(previewEl).save();
  } else if (format === "png") {
    html2canvas(previewEl, { scale: 2, backgroundColor: "white" })
      .then((canvas) => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `${filename}_label.png`;
        link.click();
      })
      .catch((err) => {
        alert("PNG 다운로드 실패: " + err.message);
      });
  }

  saveWorkToHistory(formData, "safe");
}

// ========== 텍스트 복사 ==========
function copyToClipboard() {
  if (!formData.productName) {
    alert("⚠️ 제품명을 먼저 입력해주세요!");
    return;
  }

  const ingredients = formData.ingredients.map((i) => i.label).join(", ") || "-";
  const allergenLine = formData.allergens.length > 0
    ? `알레르기 유발물질: ${formData.allergens.join(", ")} 함유`
    : null;

  const lines = [
    `제품명: ${formData.productName || "-"}`,
    `식품유형: ${formData.foodType || "-"}`,
    `소비기한: ${formData.consumerDate || "-"}`,
    `내용량: ${getWeightText() || "-"}`,
    `제조원: ${formData.manufacturer || "-"}`,
    `소재지: ${formData.manufacturerAddress || "-"}`,
    `원재료명: ${ingredients}`,
    allergenLine,
    `보관방법: ${formData.storageMethod || "-"}`,
    `포장재질: ${formData.packagingMaterial || "-"}`,
    `원산지: ${formData.originCountry || "-"}`,
    formData.returnContact ? `반품/교환처: ${formData.returnContact}` : null,
    formData.cautionText ? `주의사항: ${formData.cautionText}` : null,
    `부정·불량식품 신고는 국번없이 1399`
  ].filter(Boolean).join("\n");

  navigator.clipboard.writeText(lines)
    .then(() => {
      alert("✅ 한글표시사항이 복사되었습니다!");
    })
    .catch(() => {
      const ta = document.createElement("textarea");
      ta.value = lines;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      alert("✅ 복사되었습니다!");
    });
}

// ========== 라벨 분석기로 보내기 ==========
function analyzeLabel() {
  const previewEl = getEl("labelPreview");

  if (!formData.productName) {
    alert("⚠️ 제품명을 먼저 입력해주세요!");
    return;
  }

  sessionStorage.setItem("labelToAnalyze", JSON.stringify({
    labelHTML: previewEl ? previewEl.innerHTML : "",
    productName: formData.productName,
    sourceData: formData
  }));

  window.location.href = "checker.html";
}

// ========== Excel 붙여넣기 ==========
function showExcelPaste() {
  const modal = getEl("excelModal");
  const area = getEl("excelPasteArea");

  if (modal) modal.style.display = "flex";
  if (area) area.focus();
}

function closeExcelPaste() {
  const modal = getEl("excelModal");
  const area = getEl("excelPasteArea");

  if (modal) modal.style.display = "none";
  if (area) area.value = "";
}

function pasteExcelData() {
  const area = getEl("excelPasteArea");
  const tbody = getEl("ingredientsBody");

  if (!area || !tbody) return;

  const text = area.value.trim();
  if (!text) {
    alert("데이터를 입력해주세요.");
    return;
  }

  const lines = text.split("\n");
  tbody.innerHTML = "";

  let addedCount = 0;

  lines.forEach((line) => {
    const parts = line.split(",").map((p) => p.trim());
    if (parts[0] && parts[1]) {
      const name = parts[0];
      const weight = parts[1];
      const origin = parts[2] || "";

      const row = document.createElement("tr");
      row.className = "ingredient-row";
      row.innerHTML = `
        <td><input type="text" class="ingredient-name" value="${escapeHtml(name)}"></td>
        <td><input type="number" class="ingredient-weight" value="${escapeHtml(weight)}" step="0.01"></td>
        <td><input type="text" class="ingredient-origin" value="${escapeHtml(origin)}"></td>
        <td><button type="button" class="btn-delete" onclick="deleteIngredient(this)">🗑️</button></td>
      `;
      tbody.appendChild(row);
      addedCount++;
    }
  });

  ensureAtLeastOneIngredientRow();
  updateIngredients();
  updatePreview();

  if (addedCount > 0) {
    alert(`✅ ${addedCount}개의 원재료가 추가되었습니다!`);
    closeExcelPaste();
  } else {
    alert("❌ 올바른 형식의 데이터가 없습니다.\n형식: 재료명,중량,원산지");
  }
}

// ========== 수정 모드: 작업 기록 로드 ==========
function loadFromWorkHistory(workId) {
  try {
    const works = JSON.parse(localStorage.getItem("krk_works") || "[]");
    const work = works.find((w) => w.id === workId);

    if (!work || !work.fullData) {
      ensureAtLeastOneIngredientRow();
      return;
    }

    formData = { ...formData, ...work.fullData };

    setValue("productName", formData.productName);
    setValue("foodType", formData.foodType);
    setValue("manufacturer", formData.manufacturer);
    setValue("manufacturerAddress", formData.manufacturerAddress);
    setValue("consumerDate", formData.consumerDate);
    setValue("weight", formData.weightValue);
    setValue("weightValue", formData.weightValue);
    setValue("weightUnit", formData.weightUnit || "g");
    setValue("storageMethod", formData.storageMethod);
    setValue("packagingMaterial", formData.packagingMaterial);
    setValue("originCountry", formData.originCountry);
    setValue("returnContact", formData.returnContact);
    setValue("cautionText", formData.cautionText);

    const radio = document.querySelector(`input[name="businessType"][value="${formData.businessType}"]`);
    if (radio) radio.checked = true;

    restoreIngredients();
  } catch (e) {
    console.error("작업 기록 로드 실패:", e);
    ensureAtLeastOneIngredientRow();
  }
}

function restoreIngredients() {
  const tbody = getEl("ingredientsBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (formData.ingredients && formData.ingredients.length > 0) {
    formData.ingredients.forEach((ing) => {
      const row = document.createElement("tr");
      row.className = "ingredient-row";
      row.innerHTML = `
        <td><input type="text" class="ingredient-name" value="${escapeHtml(ing.name)}"></td>
        <td><input type="number" class="ingredient-weight" value="${escapeHtml(ing.weight)}" step="0.01"></td>
        <td><input type="text" class="ingredient-origin" value="${escapeHtml(ing.origin || "")}"></td>
        <td><button type="button" class="btn-delete" onclick="deleteIngredient(this)">🗑️</button></td>
      `;
      tbody.appendChild(row);
    });
  } else {
    ensureAtLeastOneIngredientRow();
  }
}

// ========== 작업 기록 저장 ==========
function saveWorkToHistory(labelData, status) {
  try {
    const works = JSON.parse(localStorage.getItem("krk_works") || "[]");
    works.unshift({
      id: "work_" + Date.now(),
      type: "creator",
      title: (labelData.productName || "새 라벨") + " 라벨",
      created_at: new Date().toISOString().split("T")[0],
      status: status || "safe",
      payload: {
        product_name: labelData.productName,
        food_type: labelData.foodType,
        ingredients_count: labelData.ingredients?.length || 0
      },
      fullData: { ...labelData }
    });

    if (works.length > 50) works.pop();
    localStorage.setItem("krk_works", JSON.stringify(works));
  } catch (e) {
    console.error("작업 기록 저장 실패:", e);
  }
}

// ========== 페이지 이탈 경고 ==========
window.addEventListener("beforeunload", (e) => {
  const hasData = hasAnyInputData();
  if (hasData) {
    e.preventDefault();
    e.returnValue = "";
  }
});