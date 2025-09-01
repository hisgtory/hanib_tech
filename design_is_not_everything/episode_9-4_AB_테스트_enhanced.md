# Episode 9-4: A/B 테스트, 데이터로 디자인 결정하기

## 🎬 Scene: 직감 vs 데이터

```
디자인 리뷰 미팅

디자이너 A: "파란색 버튼이 더 예뻐요"
디자이너 B: "초록색이 더 눈에 띄어요"
PM: "둘 다 좋은데... 어떻게 결정하죠?"

개발자: "A/B 테스트 해보면 되잖아요"

[2주 후]

실험 결과:
A안 (파란색): 전환율 3.2%
B안 (초록색): 전환율 4.8%
통계적 유의성: 95% 신뢰도

PM: "초록색으로 확정!"
디자이너 A: "숫자는 거짓말하지 않네요..."

연간 영향:
전환율 1.6% 상승 = 매출 20억 증가
```

**의견은 가설, 데이터는 증거입니다.**

## Part 1: A/B 테스트 기초

### 🔬 실험 설계의 과학

```
A/B 테스트 구조:

통제군(Control) vs 실험군(Treatment)

사용자 50% → A안 (기존)
        ↓
      측정: 클릭률, 전환율, 체류시간
        ↓
사용자 50% → B안 (변경)

핵심 요소:
1. 가설 (Hypothesis)
"CTA 버튼을 크게 하면 클릭률이 오를 것이다"

2. 변수 (Variable)
독립변수: 버튼 크기
종속변수: 클릭률
통제변수: 다른 모든 요소

3. 지표 (Metrics)
Primary: 클릭률
Secondary: 전환율, 이탈률
Guardrail: 페이지 로드 시간

4. 표본 크기 (Sample Size)
최소 표본 = f(기준 전환율, MDE, 신뢰도)

5. 기간 (Duration)
최소 1주일 (요일 효과)
최대 4주 (신선도 효과)
```

### 📊 통계적 유의성

```
통계 개념 쉽게 이해하기:

p-value (유의확률):
= 우연일 확률
p < 0.05 = 우연일 확률 5% 미만
= 95% 확신

신뢰구간 (Confidence Interval):
A안: 3.2% ± 0.5% (2.7% ~ 3.7%)
B안: 4.8% ± 0.5% (4.3% ~ 5.3%)
겹치지 않음 = 유의미한 차이

Statistical Power:
= 실제 차이를 발견할 확률
목표: 80% 이상

Effect Size (효과 크기):
작음: 2-5% 개선
중간: 5-15% 개선
큼: 15%+ 개선

샘플 사이즈 계산:
// 기준 전환율 3%, 5% 개선 감지, 95% 신뢰도
n = 16 * (p * (1-p)) / (효과크기)²
n = 16 * (0.03 * 0.97) / (0.0015)²
n = 20,693명 (각 그룹)
```

## Part 2: 실전 테스트 설계

### 🎯 무엇을 테스트할까?

```
테스트 우선순위:

Impact(영향) × Confidence(확신) × Ease(용이성) = ICE Score

높은 우선순위:
1. CTA 버튼 (색상, 문구, 크기, 위치)
   ICE: 9 × 7 × 9 = 567

2. 헤드라인 (메시지, 폰트, 크기)
   ICE: 8 × 6 × 10 = 480

3. 가격 표시 (할인 강조, 번들링)
   ICE: 10 × 5 × 8 = 400

4. 이미지 (제품샷, 라이프스타일)
   ICE: 7 × 7 × 7 = 343

5. 폼 필드 (개수, 순서, 필수 여부)
   ICE: 9 × 8 × 5 = 360

낮은 우선순위:
- 푸터 링크
- 약관 텍스트
- 로고 크기

테스트 아이디어 백로그:
┌──────────────────────────────────┐
│ ID │ 가설 │ ICE │ 상태 │ 결과 │
├────┼──────┼─────┼──────┼──────┤
│ 01 │ ... │ 567 │ 진행 │  -   │
│ 02 │ ... │ 480 │ 대기 │  -   │
│ 03 │ ... │ 400 │ 완료 │ +5%  │
└──────────────────────────────────┘
```

### 🔀 트래픽 분할 전략

```
분할 방법:

1. 랜덤 분할 (기본)
if (Math.random() < 0.5) {
  showVariantA();
} else {
  showVariantB();
}

2. 결정적 분할 (일관성)
const hash = md5(userId);
const bucket = parseInt(hash.substr(0, 8), 16) % 100;
if (bucket < 50) {
  showVariantA();
} else {
  showVariantB();
}

3. 계층화 분할 (Stratified)
// 중요 세그먼트별 균등 분배
segments.forEach(segment => {
  assignRandomly(segment, 50/50);
});

4. 점진적 롤아웃
Week 1: 90% A, 10% B (안전성 확인)
Week 2: 50% A, 50% B (본 실험)
Week 3: 10% A, 90% B (승자 롤아웃)

트래픽 요구사항:
최소: 일 1,000 방문자
권장: 일 10,000 방문자
이상적: 일 100,000+ 방문자
```

## Part 3: 도구와 구현

### 🛠 A/B 테스트 플랫폼

```
플랫폼 비교:

1. Google Optimize (무료)
장점: 무료, GA 연동
단점: 2023년 종료
대안: GA4 실험

2. Optimizely (엔터프라이즈)
장점: 강력한 기능, 서버사이드
단점: 비싸다 ($50K+/년)
적합: 대기업

3. VWO (중간)
장점: 비주얼 에디터, 히트맵
단점: 트래픽 제한
가격: $199+/월

4. LaunchDarkly (개발자)
장점: Feature Flag, 실시간
단점: 기술적
가격: $75+/월

5. 자체 구현
장점: 완전 제어, 무료
단점: 개발 필요
기술: Node.js + Redis
```

### 💻 직접 구현하기

```javascript
// 간단한 A/B 테스트 시스템

class ABTest {
  constructor(name, variants, weights = null) {
    this.name = name;
    this.variants = variants;
    this.weights = weights || new Array(variants.length).fill(1/variants.length);
  }
  
  // 사용자 할당
  assign(userId) {
    // 결정적 할당 (같은 유저는 항상 같은 버전)
    const hash = this.hash(userId + this.name);
    const random = hash / 0xFFFFFFFF;
    
    let cumulative = 0;
    for (let i = 0; i < this.weights.length; i++) {
      cumulative += this.weights[i];
      if (random < cumulative) {
        return this.variants[i];
      }
    }
    
    return this.variants[0];
  }
  
  // 이벤트 추적
  track(userId, variant, event, value = 1) {
    // 분석 시스템으로 전송
    analytics.track({
      userId,
      event: `${this.name}.${event}`,
      properties: {
        variant,
        value,
        timestamp: Date.now()
      }
    });
  }
  
  // 해시 함수
  hash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

// 사용 예
const buttonTest = new ABTest(
  'button_color_test',
  ['blue', 'green'],
  [0.5, 0.5]
);

// 사용자에게 버전 할당
const variant = buttonTest.assign(userId);

// React 컴포넌트
function CTAButton({ userId }) {
  const variant = buttonTest.assign(userId);
  
  const handleClick = () => {
    buttonTest.track(userId, variant, 'click');
    // 실제 동작...
  };
  
  return (
    <button 
      className={`cta-${variant}`}
      onClick={handleClick}
    >
      구매하기
    </button>
  );
}
```

## Part 4: 결과 분석

### 📈 데이터 해석

```
분석 체크리스트:

1. 통계적 유의성 확인
□ p-value < 0.05
□ 신뢰구간 겹치지 않음
□ 충분한 샘플 사이즈

2. 실질적 유의성 확인
□ 비즈니스 임팩트 있음
□ 구현 비용 대비 이익
□ 장기적 효과 예상

3. 세그먼트 분석
- 신규 vs 기존 사용자
- 모바일 vs 데스크톱
- 지역별 차이
- 연령대별 차이

4. 2차 지표 확인
Primary: 전환율 +5% ✅
Secondary: 
- 이탈률 변화 없음 ✅
- 페이지 체류시간 +10% ✅
- 고객 만족도 유지 ✅

5. 이상 패턴 체크
□ Simpson's Paradox
□ Novelty Effect
□ Selection Bias
□ Survivorship Bias

결과 리포트 템플릿:
## 실험 결과: [실험명]

### 요약
- 기간: 2024.03.01 - 03.14
- 참가자: 41,386명
- 승자: B안 (녹색 버튼)

### 주요 지표
| 지표 | A안 | B안 | 변화 | p-value |
|-----|-----|-----|------|---------|
| CTR | 3.2% | 4.8% | +50% | 0.001 |
| CVR | 2.1% | 2.8% | +33% | 0.02 |

### 권장사항
B안 전체 롤아웃 → 연간 $2M 추가 수익 예상
```

### 🚫 흔한 실수들

```
A/B 테스트 함정:

1. Peeking (조기 종료)
문제: 유의한 순간 바로 종료
해결: 사전 정의된 기간 준수

2. 다중 테스트 문제
문제: 20개 테스트 중 1개는 우연히 유의
해결: Bonferroni 보정

3. 샘플 오염
문제: 한 사용자가 여러 버전 경험
해결: 쿠키/사용자 ID 기반 할당

4. 선택 편향
문제: 특정 사용자만 참여
해결: 랜덤 샘플링

5. 계절성 무시
문제: 블랙프라이데이에만 테스트
해결: 전체 비즈니스 사이클 고려

6. 작은 변화 과대평가
문제: 0.1% 개선에 전사 리소스
해결: ROI 계산

7. 장기 효과 무시
문제: 단기 상승, 장기 하락
해결: 홀드아웃 그룹 유지
```

## Part 5: 고급 테스트 기법

### 🎲 다변량 테스트 (MVT)

```
여러 요소 동시 테스트:

2×2 Factorial Design:
헤드라인: [A, B]
버튼색상: [파랑, 초록]

조합:
1. 헤드라인A + 파랑
2. 헤드라인A + 초록
3. 헤드라인B + 파랑
4. 헤드라인B + 초록

장점: 상호작용 효과 발견
단점: 4배 트래픽 필요

Fractional Factorial:
일부 조합만 테스트
통계적 추론으로 나머지 예측
```

### 🤖 Contextual Bandits

```python
# 자동 최적화 알고리즘

class ThompsonSampling:
    def __init__(self, n_variants):
        # Beta 분포 파라미터
        self.successes = [1] * n_variants
        self.failures = [1] * n_variants
    
    def choose_variant(self):
        # 각 변종의 성공 확률 샘플링
        samples = [
            np.random.beta(s, f) 
            for s, f in zip(self.successes, self.failures)
        ]
        # 가장 높은 확률의 변종 선택
        return np.argmax(samples)
    
    def update(self, variant, reward):
        # 결과에 따라 분포 업데이트
        if reward:
            self.successes[variant] += 1
        else:
            self.failures[variant] += 1

# 사용
bandit = ThompsonSampling(3)
variant = bandit.choose_variant()
# 사용자 액션 후
bandit.update(variant, converted)
```

## 🎁 Bonus: 실험 문화 구축

### 🌱 조직의 실험 문화

```
실험 주도 조직 만들기:

1. 프로세스 확립
매주 실험 리뷰
분기별 실험 대회
실패 공유 세션

2. 도구 민주화
셀프서비스 플랫폼
템플릿 제공
교육 프로그램

3. KPI 연결
팀 OKR에 실험 목표
"분기당 10개 실험"
"5% 전환율 개선"

4. 실패 축하
"실패한 실험" 상
학습 문서화
포스트모템

실험 로그:
┌────────────────────────────┐
│ 2024 Q1: 15개 실험        │
│ 성공: 8개 (+12% 전환율)   │
│ 실패: 7개 (귀중한 학습)    │
│ 총 영향: $5M 추가 수익     │
└────────────────────────────┘
```

## 💡 핵심 메시지

> "A/B 테스트는 의견을 데이터로 바꾸는 과학입니다.
> 작은 개선이 모여 큰 성과를 만듭니다.
> 
> 실패한 테스트도 성공입니다.
> 무엇이 작동하지 않는지 배웠으니까요."

**기억하세요:**
- 가설 → 실험 → 학습
- 통계적 + 실질적 유의성
- 작은 개선의 누적
- 실험은 문화

## 🚀 다음 에피소드 예고

**"Episode 9-5: 데이터 파이프라인, ETL의 이해"**

데이터가 흐르는 길:
- 수집 → 저장 → 처리
- 실시간 vs 배치
- 데이터 웨어하우스
- 대시보드 자동화

"Raw 데이터가 인사이트가 되기까지"

---

*"In God we trust, all others bring data."
- W. Edwards Deming*

**#ABTest #데이터드리븐 #실험 #전환율최적화 #GrowthHacking**