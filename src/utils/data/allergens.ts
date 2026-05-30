export const ALLERGEN_LIST = [
  // 현행 표시 기준 22품목 체계(조개류 세부 품목 포함) + alias 매핑
  { id: "A01", name: "난류", aliases: ["계란", "달걀", "egg", "전란", "난황", "난백", "메추리알"] },
  { id: "A02", name: "우유", aliases: ["milk", "유크림", "버터", "치즈", "생크림", "탈지분유", "전지분유", "유청", "카제인", "락토스"] },
  { id: "A03", name: "메밀", aliases: ["buckwheat", "메밀가루", "메밀분"] },
  { id: "A04", name: "땅콩", aliases: ["peanut", "땅콩버터", "아라키스유"] },
  { id: "A05", name: "대두", aliases: ["콩", "soy", "soybean", "두부", "된장", "간장", "청국장", "두유", "콩기름", "대두유", "레시틴"] },
  { id: "A06", name: "밀", aliases: ["wheat", "소맥", "밀가루", "글루텐", "세몰리나", "밀전분", "밀배아"] },
  { id: "A07", name: "고등어", aliases: ["mackerel", "고등어액젓", "고등어추출물"] },
  { id: "A08", name: "게", aliases: ["crab", "꽃게", "대게", "킹크랩", "게살", "게엑기스"] },
  { id: "A09", name: "새우", aliases: ["shrimp", "prawn", "건새우", "새우젓", "새우분말"] },
  { id: "A10", name: "돼지고기", aliases: ["pork", "돈육", "삼겹살", "햄", "베이컨", "라드"] },
  { id: "A11", name: "복숭아", aliases: ["peach", "복숭아농축액", "백도", "황도"] },
  { id: "A12", name: "토마토", aliases: ["tomato", "토마토페이스트", "토마토퓨레", "토마토분말"] },
  { id: "A13", name: "아황산류", aliases: ["아황산", "이산화황", "SO2", "sulfite", "메타중아황산칼륨", "아황산나트륨"] },
  { id: "A14", name: "호두", aliases: ["walnut", "호두오일"] },
  { id: "A15", name: "닭고기", aliases: ["chicken", "계육", "닭가슴살", "닭다리"] },
  { id: "A16", name: "쇠고기", aliases: ["beef", "우육", "소고기", "한우"] },
  { id: "A17", name: "오징어", aliases: ["squid", "오징어분말", "오징어먹물"] },
  { id: "A18", name: "조개류", aliases: ["조개", "clam", "굴", "홍합", "전복", "가리비", "바지락"] },
  { id: "A19", name: "잣", aliases: ["pine nut", "잣오일"] }
];

export type Allergen = typeof ALLERGEN_LIST[number];
