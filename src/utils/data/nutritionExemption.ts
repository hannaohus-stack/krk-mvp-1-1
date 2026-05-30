export const NUTRITION_EXEMPTION_CRITERIA = [
  {
    id: "E01",
    question: "연 매출액이 120억원 이하인 영업소인가요?",
    regulation: "식품등의 표시기준 영양표시 단계적 적용 기준"
  },
  {
    id: "E02",
    question: "2028년 전까지 단계적 적용 유예 대상인지 확인했나요?",
    regulation: "식품등의 표시기준 영양표시 단계적 적용 기준"
  },
  {
    id: "E03",
    question: "영양강조표시(무가당·저칼로리·고단백 등)를 사용하지 않나요?",
    regulation: "식품등의 표시기준 제5조 제2항 별표"
  }
];

export const NUTRITION_REQUIRED_ITEMS = [
  { id: "열량",    unit: "kcal" },
  { id: "탄수화물", unit: "g"    },
  { id: "당류",    unit: "g"    },
  { id: "단백질",  unit: "g"    },
  { id: "지방",    unit: "g"    },
  { id: "나트륨",  unit: "mg"   }
];
