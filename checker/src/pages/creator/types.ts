export interface CreatorIngredient {
  id: string
  name: string
  weight: string       // string for controlled input
  isAllergen: boolean
  isComposite: boolean
}

export interface CreatorData {
  // Step 1 — 제품 정보
  productName: string
  foodCategory: string
  totalWeight: string
  unit: 'g' | 'mL'
  manufacturer: string
  storage: string
  expiryDate: string   // ISO 날짜 (YYYY-MM-DD)

  // Step 2 — 원재료
  ingredients: CreatorIngredient[]
  detectedAllergens:  { id: string; name: string }[]                              // detectAllergensFromList() 결과
  detectedComposites: { ingredientName: string; matchedKeyword: string; hint: string }[]  // detectCompositesFromList() 결과

  // Step 3 — 영양성분
  nutritionExempted: boolean   // 면제 자가진단 결과
  servingSize: string
  servingUnit: 'g' | 'mL'
  calories: string
  totalCarbs: string
  sugar: string
  totalFat: string
  saturatedFat: string
  transFat: string
  cholesterol: string
  protein: string
  sodium: string
}

export const INITIAL_DATA: CreatorData = {
  productName: '',
  foodCategory: '',
  totalWeight: '',
  unit: 'g',
  manufacturer: '',
  storage: '',
  expiryDate: '',
  ingredients: [],
  detectedAllergens:  [],
  detectedComposites: [],
  nutritionExempted: false,
  servingSize: '',
  servingUnit: 'g',
  calories: '',
  totalCarbs: '',
  sugar: '',
  totalFat: '',
  saturatedFat: '',
  transFat: '0',
  cholesterol: '',
  protein: '',
  sodium: '',
}

export interface StepProps {
  data: CreatorData
  onChange: (partial: Partial<CreatorData>) => void
}

/** Step 1 필수 항목 완성 여부 */
export function isStep1Complete(data: CreatorData): boolean {
  return (
    data.productName.trim()  !== '' &&
    data.foodCategory        !== '' &&
    data.totalWeight.trim()  !== '' && parseFloat(data.totalWeight) > 0 &&
    data.manufacturer.trim() !== '' &&
    data.storage             !== '' &&
    data.expiryDate          !== ''
  )
}
