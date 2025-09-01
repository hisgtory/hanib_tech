# Episode 19-1: 접근성, 모두를 위한 디자인이 최고의 디자인

## 🎬 Scene: 앱스토어 리뷰, 충격적인 피드백

```
⭐ (1점 리뷰)
"시각장애인은 쓰지 말라는 건가요?
스크린 리더가 아무것도 읽어주지 않네요."

⭐ (1점 리뷰)  
"색맹인데 빨강/초록 구분이 안 돼요.
중요한 정보를 색으로만 표시하다니..."

⭐ (1점 리뷰)
"한 손으로 조작이 불가능해요.
지하철에서 못 쓰겠어요."

디자이너: "이런 사용자가 있는 줄 몰랐어요..."

PM: "전체 사용자의 15%가 어떤 형태로든 
     장애를 가지고 있습니다.
     우리는 1,500만 명을 무시한 거예요."

3개월 후, 접근성 개선:
평점: 2.3 → 4.6
DAU: +35%
언론: "올해의 포용적 앱 선정"
```

**접근성은 소수를 위한 배려가 아니라 모두를 위한 디자인입니다.**

## Part 1: 접근성, 왜 중요한가?

### 📊 숫자로 보는 접근성

```
전 세계 장애 인구: 13억 명 (16%)

한국 현황:
- 등록 장애인: 265만 명
- 색각 이상: 200만 명
- 노안: 1,400만 명
- 일시적 장애: 모든 사람

일시적/상황적 장애:
- 한 손 사용 (육아, 지하철)
- 밝은 햇빛 (야외)
- 시끄러운 환경 (카페)
- 느린 인터넷 (지하)
= 사실상 100%

비즈니스 임팩트:
접근성 개선 → 사용자 +15%
             → 매출 +20%
             → 브랜드 가치 +30%
```

### 🌈 장애의 스펙트럼

```
영구적 → 일시적 → 상황적

시각:
실명 → 백내장 → 햇빛 눈부심

청각:
농 → 귀 감염 → 시끄러운 장소

운동:
팔 절단 → 팔 골절 → 아기 안고 있음

인지:
난독증 → 뇌진탕 → 주의 분산
```

## Part 2: WCAG 가이드라인

### 📏 WCAG 2.1 핵심 원칙

```
POUR 원칙:

1. Perceivable (인지 가능)
   - 모든 정보를 감지할 수 있어야
   - 대체 텍스트
   - 자막, 수어

2. Operable (조작 가능)
   - 모든 기능을 사용할 수 있어야
   - 키보드 접근
   - 충분한 시간

3. Understandable (이해 가능)
   - 정보와 UI를 이해할 수 있어야
   - 명확한 언어
   - 예측 가능한 동작

4. Robust (견고함)
   - 다양한 보조기술과 호환
   - 표준 준수
   - 미래 기술 대응
```

### 🎯 적합성 레벨

```
Level A (최소):
- 이미지 대체 텍스트
- 키보드 접근
- 페이지 제목

Level AA (권장): ⭐
- 색상 대비 4.5:1
- 텍스트 크기 조절
- 일관된 네비게이션

Level AAA (최고):
- 색상 대비 7:1
- 수어 제공
- 쉬운 언어 버전

목표: AA 레벨 (법적 요구사항)
```

## Part 3: 시각 접근성

### 🎨 색상 대비 가이드

```
텍스트 대비 요구사항:

일반 텍스트 (16px):
AA: 4.5:1
AAA: 7:1

큰 텍스트 (24px or 18px bold):
AA: 3:1
AAA: 4.5:1

실전 예시:
❌ Bad:
배경: #FFFFFF
텍스트: #CCCCCC
대비: 1.6:1 (FAIL)

✅ Good:
배경: #FFFFFF
텍스트: #595959
대비: 7.5:1 (AAA)

도구:
- Stark (Figma Plugin)
- Contrast (macOS)
- WebAIM Checker
```

### 👁 색맹 대응 디자인

```
색맹 유형:
- 적록색맹 (8% 남성)
- 청황색맹 (0.01%)
- 전색맹 (0.00003%)

디자인 원칙:

❌ 색상만으로 정보 전달:
🔴 에러 / 🟢 성공

✅ 색상 + 아이콘 + 텍스트:
🔴 ❌ 에러 발생
🟢 ✅ 성공

❌ 문제 조합:
빨강-초록
파랑-보라

✅ 안전한 조합:
파랑-주황
노랑-파랑
```

## Part 4: 키보드 접근성

### ⌨️ 키보드 네비게이션

```
필수 키보드 지원:

Tab: 다음 요소
Shift+Tab: 이전 요소
Enter: 실행/선택
Space: 체크박스/버튼
Arrow: 메뉴/리스트 탐색
Esc: 닫기/취소

Focus 표시:
/* 기본 (브라우저) */
:focus {
  outline: 2px solid blue;
}

/* 커스텀 (접근성 유지) */
:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
}

/* 마우스 사용자용 */
:focus:not(:focus-visible) {
  outline: none;
}
```

### 🎯 Focus 트랩

```
모달 Focus 관리:

1. 모달 열기
   → Focus를 모달로 이동

2. Tab 순환
   → 모달 내에서만 순환

3. 모달 닫기
   → Focus를 트리거로 복귀

구현:
const focusableElements = 
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const firstFocusable = modal.querySelectorAll(focusableElements)[0];
const focusableContent = modal.querySelectorAll(focusableElements);
const lastFocusable = focusableContent[focusableContent.length - 1];

// Tab 키 트랩
document.addEventListener('keydown', function(e) {
  if (e.key === 'Tab') {
    if (e.shiftKey) { // Shift + Tab
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else { // Tab
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  }
});
```

## Part 5: 스크린 리더 대응

### 🔊 ARIA 레이블링

```
ARIA (Accessible Rich Internet Applications):

필수 ARIA 속성:

1. role: 요소의 역할
<div role="button">클릭</div>

2. aria-label: 설명 제공
<button aria-label="메뉴 열기">
  <svg>...</svg>
</button>

3. aria-describedby: 추가 설명
<input aria-describedby="password-help">
<span id="password-help">8자 이상</span>

4. aria-live: 동적 콘텐츠
<div aria-live="polite">
  업데이트됨
</div>

5. aria-hidden: 장식 요소
<span aria-hidden="true">🎨</span>
```

### 📱 모바일 스크린 리더

```
iOS VoiceOver:
- 3손가락 탭: 음성 토글
- 스와이프: 다음/이전
- 더블탭: 실행

Android TalkBack:
- 볼륨 키: 활성화
- 스와이프: 탐색
- 더블탭: 실행

테스트 체크리스트:
□ 모든 콘텐츠 읽기 가능
□ 인터랙티브 요소 식별
□ 상태 변경 알림
□ 의미 있는 순서
□ 중복 읽기 없음
```

## Part 6: 실전 접근성 구현

### 🛠 폼 접근성

```
접근성 높은 폼:

<form>
  <!-- 레이블 연결 -->
  <label for="email">이메일</label>
  <input 
    id="email" 
    type="email"
    required
    aria-describedby="email-error"
  >
  
  <!-- 에러 메시지 -->
  <span 
    id="email-error" 
    role="alert"
    aria-live="polite"
  >
    올바른 이메일을 입력하세요
  </span>
  
  <!-- 그룹화 -->
  <fieldset>
    <legend>배송 방법</legend>
    <input type="radio" id="express" name="delivery">
    <label for="express">특급 배송</label>
    <input type="radio" id="standard" name="delivery">
    <label for="standard">일반 배송</label>
  </fieldset>
</form>
```

### 🎯 모바일 접근성

```
터치 타겟:
최소: 44×44px (iOS)
권장: 48×48px (Material)

간격:
최소: 8px
권장: 16px

제스처:
- 복잡한 제스처 피하기
- 대체 방법 제공
- 실행 취소 가능

한 손 조작:
- 중요 요소는 하단 배치
- 엄지 도달 범위 고려
- 플로팅 버튼 위치 조정
```

## 🎁 Bonus: 접근성 테스트 도구

### 🔧 자동화 도구

```
브라우저 확장:
- axe DevTools
- WAVE
- Lighthouse

Figma 플러그인:
- Stark
- Able
- Color Oracle

코드 검사:
- eslint-plugin-jsx-a11y
- pa11y
- axe-core

CI/CD 통합:
- Accessibility Insights
- Deque axe Monitor
```

### ✅ 수동 테스트 체크리스트

```markdown
## 키보드 테스트
- [ ] Tab으로 모든 요소 접근
- [ ] Enter/Space로 실행
- [ ] Esc로 취소
- [ ] Focus 표시 명확

## 스크린 리더
- [ ] 모든 콘텐츠 읽기
- [ ] 의미 있는 순서
- [ ] 대체 텍스트
- [ ] 폼 레이블

## 시각
- [ ] 200% 확대 가능
- [ ] 색상 대비 AA
- [ ] 색상만 의존 않음
- [ ] 다크 모드

## 기타
- [ ] 동영상 자막
- [ ] 애니메이션 정지
- [ ] 시간 제한 조정
```

## 📊 접근성 ROI

```
투자:
- 교육: 100만원
- 도구: 50만원
- 추가 개발: 20%
- 테스트: 100시간

수익:
- 사용자 증가: +15%
- 체류 시간: +25%
- 법적 리스크 제거
- 브랜드 가치: +40%
- SEO 개선: +30%

사례: 
Target 소송: 60억원 배상
Domino's Pizza: 패소
Netflix: 접근성으로 시장 확대

ROI: 500%+
```

## 💡 핵심 메시지

> "접근성은 '그들'을 위한 것이 아니라
> '우리 모두'를 위한 것입니다.
> 
> 오늘의 건강한 사용자도
> 내일은 일시적 장애를 경험할 수 있습니다.
> 
> 접근성 좋은 디자인은
> 모든 사람에게 더 나은 경험을 제공합니다."

**기억하세요:**
- 장애는 스펙트럼
- 15% → 100% 혜택
- 법적 의무 + 도덕적 책임
- 더 나은 UX for All

## 🚀 다음 에피소드 예고

**"Episode 20-1: 모션 디자인, 생명을 불어넣는 마법"**

정적 UI에서 살아있는 경험으로:
- 마이크로 인터랙션
- 의미 있는 트랜지션
- 성능 최적화
- After Effects to Code

"왜 애플 제품은 살아있는 것처럼 느껴질까?"

---

*"좋은 디자인은 소수를 배제하지 않습니다.
위대한 디자인은 모두를 포용합니다."*

**#접근성 #a11y #인클루시브디자인 #WCAG #UniversalDesign**