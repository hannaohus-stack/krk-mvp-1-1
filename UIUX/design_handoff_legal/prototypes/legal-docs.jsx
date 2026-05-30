/* global React */
// legal-docs.jsx — 이용약관 + 개인정보처리방침
//
// Props:
//   doc    : 'terms' | 'privacy'
//   device : 'desktop' | 'mobile'

const HERITAGE = '#002D72';
const BREATH   = '#0CA4F9';
const INK      = '#0A0A0B';
const SOFT_INK = 'rgba(10,10,11,0.75)';
const FAINT    = 'rgba(10,10,11,0.55)';
const MUTED    = 'rgba(10,10,11,0.40)';
const HAIRLINE = 'rgba(10,10,11,0.12)';
const STUDIO   = '#FAFAFA';

const FONT_KR = 'Pretendard, "Pretendard Variable", system-ui, -apple-system, sans-serif';
const FONT_EN = 'Inter, system-ui, sans-serif';

// ─── 이용약관 데이터 ─────────────────────────────────────────
const TERMS_ARTICLES = [
  { no: '제1조', title: '목적', body: [
    '본 약관은 krk.team(이하 "회사")이 운영하는 라벨 검토 시스템 krk Checker(이하 "서비스")의 이용에 관한 회사와 회원 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.',
  ]},
  { no: '제2조', title: '용어의 정의', body: [
    '① "서비스"란 회사가 제공하는 식품 라벨 표시 기준 자동 검토 시스템 및 관련 산출물 제공 서비스를 말합니다.',
    '② "회원"이란 서비스에 회원가입을 하고 본 약관에 동의한 자를 말합니다.',
    '③ "검토 결과"란 회원이 입력한 데이터를 기준으로 회사 시스템이 자동 산출한 표시기준 검토 결과를 말합니다.',
    '④ "산출물"이란 결제 후 제공되는 라벨 PDF, 라벨 PNG, 품목제조보고 입력 가이드, krk 라벨 검토 리포트, 분리배출 마크 ZIP 등을 말합니다.',
    '⑤ "패키지"란 회사가 제공하는 유료 서비스 단위로, 기본 라벨 패키지(9,900원) 및 전문 수정 가이드(19,900원)로 구분됩니다.',
  ]},
  { no: '제3조', title: '약관의 효력 및 변경', body: [
    '① 본 약관은 서비스 화면에 게시함으로써 효력이 발생합니다.',
    '② 회사는 관련 법령을 위배하지 않는 범위에서 약관을 개정할 수 있으며, 개정 시 적용일자 14일 전부터 공지합니다.',
    '③ 회원이 개정 약관에 동의하지 않는 경우 이용계약을 해지할 수 있습니다.',
  ]},
  { no: '제4조', title: '이용계약의 성립', body: [
    '① 이용계약은 회원이 본 약관에 동의하고 회사가 정한 절차에 따라 회원가입을 완료한 시점에 성립합니다.',
    '② 만 14세 미만의 자는 회원가입을 할 수 없습니다.',
    '③ 회사는 카카오 등 제3자 인증 서비스를 통한 간편 가입을 제공할 수 있습니다.',
  ]},
  { no: '제5조', title: '서비스의 내용', body: [
    '① 회사는 다음 각 호의 서비스를 제공합니다.',
    '  1. 식품 라벨 입력 도구 (Creator)',
    '  2. 무료 표시기준 검토 결과 제공 (/review)',
    '  3. 유료 패키지를 통한 산출물 제공 (라벨 PDF·PNG 등)',
    '  4. 마이페이지를 통한 결제 내역 및 산출물 재다운로드',
    '② 서비스의 구체적 내용 및 가격은 서비스 화면에 게시된 바에 따릅니다.',
  ]},
  { no: '제6조', title: '결제 및 환불', body: [
    '① 회원은 토스페이먼츠를 통해 결제할 수 있습니다.',
    '② 회원은 결제 완료 후 산출물을 다운로드하기 전까지 환불을 요청할 수 있으며, 회사는 영업일 기준 3일 이내에 처리합니다.',
    '③ 산출물을 한 건이라도 다운로드한 경우, 디지털 콘텐츠의 특성상 환불이 제한됩니다(전자상거래법 제17조 제2항 제5호).',
    '④ 회사의 귀책사유로 서비스가 정상 제공되지 않은 경우, 회원은 전액 환불을 요청할 수 있습니다.',
  ]},
  { no: '제7조', title: '산출물의 효력', body: [
    '① 회사가 제공하는 검토 결과 및 산출물은 회원이 입력한 정보를 기준으로 자동 검토한 결과이며, 자율 점검 참고 자료입니다.',
    '② krk 라벨 검토 리포트는 사업자의 자율 점검 노력 기록 용도이며, 식품의약품안전처 또는 관할 시·군·구청이 발급한 공식 인증서가 아닙니다.',
    '③ 산출물은 법적 효력을 보장하지 않으며, 식품 표시기준 준수의 최종 책임은 사업자에게 있습니다.',
    '④ 법규 개정 시 회원은 산출물을 재검토하여야 합니다.',
  ]},
  { no: '제8조', title: '회원의 의무', body: [
    '① 회원은 정확한 정보를 입력하여야 하며, 허위 정보 입력으로 인한 결과의 책임은 회원에게 있습니다.',
    '② 회원은 산출물을 본인의 사업 목적으로만 사용하여야 하며, 제3자에게 재판매·재배포할 수 없습니다.',
    '③ 회원은 타인의 계정을 도용하거나 서비스의 운영을 방해하는 행위를 하여서는 안 됩니다.',
  ]},
  { no: '제9조', title: '회사의 의무', body: [
    '① 회사는 안정적인 서비스 제공을 위해 최선을 다합니다.',
    '② 회사는 회원의 개인정보를 관련 법령 및 개인정보처리방침에 따라 보호합니다.',
    '③ 회사는 회원의 의견 및 불만이 접수된 경우 신속히 처리합니다.',
  ]},
  { no: '제10조', title: '책임의 한계', body: [
    '① 회사는 천재지변, 불가항력, 통신망 장애 등으로 인한 서비스 중단에 대해 책임을 지지 않습니다.',
    '② 회사는 회원이 입력한 정보의 정확성에 대해 보증하지 않으며, 그로 인한 검토 결과의 오차에 대해 책임을 지지 않습니다.',
    '③ 회사는 산출물 사용으로 인해 발생한 행정처분, 과태료 등에 대해 책임을 지지 않습니다.',
  ]},
  { no: '제11조', title: '재다운로드', body: [
    '① 회원은 결제일로부터 1년간 마이페이지에서 산출물을 무료로 재다운로드할 수 있습니다.',
    '② 1년 경과 후 재다운로드는 제공되지 않을 수 있습니다.',
  ]},
  { no: '제12조', title: '서비스의 중단', body: [
    '① 회사는 시스템 점검, 보수, 교체 등의 사유로 서비스를 일시 중단할 수 있으며, 사전에 공지합니다.',
    '② 긴급한 사유로 사전 공지가 불가한 경우 사후에 공지합니다.',
  ]},
  { no: '제13조', title: '분쟁 해결 및 관할', body: [
    '① 본 약관은 대한민국 법령에 따라 해석됩니다.',
    '② 서비스 이용과 관련하여 분쟁이 발생한 경우, 회사와 회원은 신의성실의 원칙에 따라 협의로 해결합니다.',
    '③ 협의가 이루어지지 않을 경우, 서울중앙지방법원을 제1심 관할법원으로 합니다.',
  ]},
];

// ─── 개인정보처리방침 데이터 ────────────────────────────────
const PRIVACY_ARTICLES = [
  { no: '제1조', title: '수집하는 개인정보 항목', body: [
    '회사는 다음의 정보를 수집합니다.',
    '① 필수 항목',
    '  · 이메일 주소, 비밀번호, 성명, 휴대전화번호',
    '  · 사업자 정보: 사업장 명, 사업자등록번호, 사업장 소재지, 영업신고번호, 대표자명',
    '② 선택 항목 (라벨 데이터)',
    '  · 제품명, 식품 카테고리, 사업자 유형',
    '  · 원재료 정보, 알레르기 유발물질, 영양성분 수치',
    '  · 소비기한, 보관방법, 포장재 재질',
    '③ 자동 수집 항목',
    '  · 접속 IP 주소, 쿠키, 접속 일시, 서비스 이용 기록',
    '  · 결제 내역 (토스페이먼츠 결제 식별자, 결제 금액, 결제 일시)',
  ]},
  { no: '제2조', title: '개인정보 수집 및 이용 목적', body: [
    '① 회원 식별 및 관리',
    '② 서비스 제공: 라벨 검토 결과 산출, 산출물 생성, 마이페이지 재다운로드',
    '③ 결제 처리 및 환불 처리',
    '④ 고객 문의 응대 및 분쟁 해결',
    '⑤ 서비스 개선을 위한 통계 분석 (비식별 처리)',
    '⑥ 법령상 의무 이행',
  ]},
  { no: '제3조', title: '개인정보의 보유 및 이용기간', body: [
    '① 회원 정보: 회원 탈퇴 시까지. 탈퇴 즉시 파기합니다.',
    '② 결제 기록: 전자상거래 등에서의 소비자보호에 관한 법률에 따라 5년간 보관합니다.',
    '③ 라벨 데이터(제품 정보 등): 결제일로부터 1년간 보관 후 자동 파기합니다.',
    '④ 접속 로그: 통신비밀보호법에 따라 3개월간 보관합니다.',
  ]},
  { no: '제4조', title: '개인정보의 제3자 제공', body: [
    '① 회사는 원칙적으로 개인정보를 외부에 제공하지 않습니다.',
    '② 다만 다음의 경우에 한해 제한적으로 제공할 수 있습니다.',
    '  · 결제 처리를 위해 토스페이먼츠 주식회사에 결제 정보 제공',
    '  · 법령에 따라 수사기관의 적법한 요청이 있는 경우',
    '  · 정보주체의 사전 동의가 있는 경우',
  ]},
  { no: '제5조', title: '개인정보 처리의 위탁', body: [
    '회사는 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁합니다.',
    '① Vercel Inc. — 서버 호스팅 및 인프라 운영',
    '② 토스페이먼츠 주식회사 — 결제 처리',
    '③ Kakao Corp. — 소셜 로그인 인증',
    '수탁자는 회사와 체결한 계약에 따라 개인정보를 안전하게 처리하며, 위탁 목적 외 사용을 금지합니다.',
  ]},
  { no: '제6조', title: '정보주체의 권리', body: [
    '① 회원은 언제든지 자신의 개인정보를 열람, 정정, 삭제, 처리정지를 요청할 수 있습니다.',
    '② 권리 행사는 마이페이지 또는 이메일(chaeumkorea@gmail.com)을 통해 가능하며, 회사는 지체 없이 조치합니다.',
    '③ 회원은 회원 탈퇴를 통해 모든 개인정보의 즉시 삭제를 요청할 수 있습니다.',
  ]},
  { no: '제7조', title: '개인정보의 파기 절차 및 방법', body: [
    '① 보유기간 경과 또는 처리목적 달성 시 지체 없이 해당 정보를 파기합니다.',
    '② 전자적 파일은 복구·재생할 수 없는 방법으로 영구 삭제합니다.',
    '③ 종이 문서는 분쇄하거나 소각하여 파기합니다.',
  ]},
  { no: '제8조', title: '쿠키의 운영 및 거부', body: [
    '① 회사는 회원의 자동 로그인 및 서비스 이용 통계를 위해 쿠키를 사용합니다.',
    '② 회원은 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으며, 거부 시 일부 서비스 이용에 제한이 있을 수 있습니다.',
  ]},
  { no: '제9조', title: '개인정보의 안전성 확보 조치', body: [
    '① 비밀번호 일방향 암호화 저장',
    '② 전송 구간 SSL/TLS 암호화',
    '③ 개인정보 접근 권한 최소화 및 접근 기록 보관',
    '④ 정기적 보안 점검 및 취약점 진단',
  ]},
  { no: '제10조', title: '개인정보 보호책임자', body: [
    '회사는 다음과 같이 개인정보 보호책임자를 지정합니다.',
    '· 이메일: chaeumkorea@gmail.com',
    '· 직책: 개인정보 보호책임자',
    '회원은 서비스 이용 중 개인정보 관련 문의, 불만 처리, 피해 구제 등을 위 연락처로 문의하실 수 있습니다.',
  ]},
  { no: '제11조', title: '개인정보처리방침의 변경', body: [
    '본 개인정보처리방침은 시행일로부터 적용되며, 변경이 있을 경우 변경사항을 시행 7일 전부터 홈페이지를 통해 공지합니다.',
  ]},
];

// ─── Components ──────────────────────────────────────────────
function KrkLogo({ size = 13, color = INK }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 1, lineHeight: 1 }}>
      <span style={{ fontFamily: FONT_EN, fontWeight: 800, fontSize: size, color, letterSpacing: '0.22em', textTransform: 'uppercase' }}>KRK CHECKER</span>
      <span style={{ fontFamily: FONT_EN, fontWeight: 800, fontSize: size, color: BREATH, marginLeft: '0.18em' }}>·</span>
    </div>
  );
}

function Nav({ device }) {
  const isDesktop = device === 'desktop';
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 60,
      padding: isDesktop ? '16px 40px' : '14px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(255,255,255,0.78)',
      backdropFilter: 'blur(28px) saturate(180%)',
      WebkitBackdropFilter: 'blur(28px) saturate(180%)',
      borderBottom: `1px solid ${HAIRLINE}`,
      flexShrink: 0,
    }}>
      <KrkLogo size={isDesktop ? 13 : 12} />
      <button type="button" style={{
        padding: isDesktop ? '9px 16px' : '7px 12px',
        background: INK, color: '#fff', border: 'none', borderRadius: 0,
        fontFamily: FONT_KR, fontSize: isDesktop ? 12.5 : 11.5, fontWeight: 600,
        letterSpacing: '-0.005em', cursor: 'pointer',
      }}>3분 만에 시작하기</button>
    </nav>
  );
}

function DocHeader({ title, eyebrow, device }) {
  const isDesktop = device === 'desktop';
  return (
    <header style={{
      background: STUDIO, borderBottom: `1px solid ${HAIRLINE}`,
      padding: isDesktop ? '64px 40px 40px' : '36px 20px 28px',
    }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{
          fontFamily: FONT_EN, fontSize: 11, fontWeight: 700,
          letterSpacing: '0.22em', textTransform: 'uppercase', color: HERITAGE,
          marginBottom: 12,
        }}>{eyebrow}</div>
        <h1 style={{
          margin: 0, fontSize: isDesktop ? 40 : 26,
          fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15,
        }}>{title}</h1>
        <div style={{
          marginTop: 14, display: 'flex', gap: 18, flexWrap: 'wrap',
          fontFamily: FONT_EN, fontSize: 11.5, color: MUTED,
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          <span>v1.0</span>
          <span>시행일 · 2026-06-01</span>
          <span>최종 개정 · 2026-06-01</span>
        </div>
      </div>
    </header>
  );
}

function TocSidebar({ articles, device }) {
  const isDesktop = device === 'desktop';
  if (!isDesktop) return null;
  return (
    <aside style={{
      position: 'sticky', top: 80,
      alignSelf: 'flex-start',
      width: 220, flexShrink: 0,
      padding: '8px 0',
    }}>
      <div style={{
        fontFamily: FONT_EN, fontSize: 10, fontWeight: 700,
        letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED,
        marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${HAIRLINE}`,
      }}>목차 / Contents</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {articles.map((a) => (
          <a key={a.no} href={`#${a.no.replace(/[^0-9]/g, '')}`} style={{
            display: 'flex', gap: 8,
            padding: '6px 0', fontSize: 12.5, color: SOFT_INK,
            letterSpacing: '-0.005em', textDecoration: 'none',
            lineHeight: 1.4,
          }}>
            <span style={{ color: MUTED, fontFamily: FONT_EN, fontWeight: 500, minWidth: 36 }}>{a.no}</span>
            <span>{a.title}</span>
          </a>
        ))}
        <a href="#bucho" style={{
          display: 'flex', gap: 8,
          marginTop: 4, padding: '6px 0', fontSize: 12.5, color: SOFT_INK,
          letterSpacing: '-0.005em', textDecoration: 'none',
        }}>
          <span style={{ color: MUTED, fontFamily: FONT_EN, fontWeight: 500, minWidth: 36 }}>부칙</span>
          <span>시행일</span>
        </a>
      </div>
    </aside>
  );
}

function Article({ no, title, body }) {
  const id = no.replace(/[^0-9]/g, '');
  return (
    <article id={id} style={{
      padding: '28px 0', borderBottom: `1px solid ${HAIRLINE}`,
      scrollMarginTop: 80,
    }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14, flexWrap: 'wrap',
      }}>
        <span style={{
          fontFamily: FONT_EN, fontSize: 11, fontWeight: 700,
          letterSpacing: '0.16em', textTransform: 'uppercase', color: HERITAGE,
        }}>{no}</span>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: '-0.015em' }}>{title}</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {body.map((line, i) => (
          <p key={i} style={{
            margin: 0, fontSize: 14, color: SOFT_INK, lineHeight: 1.75,
            letterSpacing: '-0.005em', wordBreak: 'keep-all',
            paddingLeft: line.startsWith('  ') ? 14 : 0,
          }}>{line.trimStart()}</p>
        ))}
      </div>
    </article>
  );
}

function Footer({ device }) {
  const isDesktop = device === 'desktop';
  return (
    <footer style={{
      background: '#0F0F12', color: 'rgba(255,255,255,0.55)',
      padding: isDesktop ? '36px 40px 28px' : '28px 20px 22px',
      fontSize: 12, letterSpacing: '-0.005em', flexShrink: 0,
    }}>
      <div style={{
        maxWidth: 1240, margin: '0 auto',
        display: 'flex', alignItems: isDesktop ? 'center' : 'flex-start',
        justifyContent: 'space-between', gap: 16,
        flexDirection: isDesktop ? 'row' : 'column',
      }}>
        <div>
          <KrkLogo size={12} color="#fff" />
          <div style={{ marginTop: 6, fontSize: 11 }}>(c) 2026 krk.team · 서울특별시</div>
        </div>
        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', fontSize: 11.5 }}>
          <a href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>홈</a>
          <a href="/terms" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>이용약관</a>
          <a href="/privacy" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>개인정보처리방침</a>
          <a href="mailto:chaeumkorea@gmail.com" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>chaeumkorea@gmail.com</a>
        </div>
      </div>
    </footer>
  );
}

function LegalDoc({ doc = 'terms', device = 'desktop' }) {
  const isTerms = doc === 'terms';
  const articles = isTerms ? TERMS_ARTICLES : PRIVACY_ARTICLES;
  const title = isTerms ? '이용약관' : '개인정보처리방침';
  const eyebrow = isTerms ? 'Terms of Service' : 'Privacy Policy';
  const isDesktop = device === 'desktop';

  return (
    <div style={{
      width: '100%', height: '100%', background: '#fff',
      fontFamily: FONT_KR, color: INK,
      display: 'flex', flexDirection: 'column', overflow: 'auto',
      wordBreak: 'keep-all',
    }}>
      <Nav device={device} />
      <DocHeader title={title} eyebrow={eyebrow} device={device} />
      <main style={{
        flex: 1,
        padding: isDesktop ? '40px 40px 64px' : '24px 20px 40px',
      }}>
        <div style={{
          maxWidth: 1080, margin: '0 auto',
          display: 'flex', gap: isDesktop ? 56 : 0,
        }}>
          <TocSidebar articles={articles} device={device} />
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* 책임 한정 안내 (terms only) */}
            {isTerms ? (
              <div style={{
                padding: '14px 16px', marginBottom: 24,
                background: 'rgba(12,164,249,0.05)',
                border: `1px solid rgba(12,164,249,0.22)`,
                borderLeft: `3px solid ${BREATH}`,
                fontSize: 12.5, color: SOFT_INK, lineHeight: 1.65, letterSpacing: '-0.005em',
              }}>
                <b style={{ color: INK, fontWeight: 600 }}>본 약관은 참고용 초안입니다.</b> 시행 전 법률 자문을 통한 검토가 권장됩니다.
              </div>
            ) : null}
            {articles.map((a) => <Article key={a.no} {...a} />)}
            {/* 부칙 */}
            <article id="bucho" style={{ padding: '28px 0', scrollMarginTop: 80 }}>
              <div style={{
                display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14,
              }}>
                <span style={{
                  fontFamily: FONT_EN, fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.16em', textTransform: 'uppercase', color: HERITAGE,
                }}>부칙</span>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: '-0.015em' }}>시행일</h2>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: SOFT_INK, lineHeight: 1.75, letterSpacing: '-0.005em' }}>
                본 {title}은 2026년 6월 1일부터 시행합니다.
              </p>
            </article>
          </div>
        </div>
      </main>
      <Footer device={device} />
    </div>
  );
}

Object.assign(window, { LegalDoc });
