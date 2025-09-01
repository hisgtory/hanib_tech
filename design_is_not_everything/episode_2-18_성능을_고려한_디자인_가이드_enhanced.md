# 에피소드 2-18: 성능을 고려한 디자인 - 속도가 곧 사용자 경험이다

## 🎯 이 글을 읽으면 얻게 되는 것
- 디자인 결정이 앱 성능에 미치는 실제 영향 이해
- 성능 최적화를 위한 디자인 체크리스트
- 개발자와 성능 이슈를 논의하는 방법
- 2025년 성능 기준과 측정 도구 활용법

## 📱 왜 디자이너가 성능을 신경써야 할까?

### 성능이 비즈니스에 미치는 영향
```
📊 실제 통계 (2024년 기준)
• 페이지 로딩 1초 지연 → 전환율 7% 감소
• 3초 이상 로딩 → 53% 사용자 이탈
• 0.1초 개선 → 매출 1% 증가 (Amazon)
• 모바일 속도 1초 개선 → 전환율 27% 증가
```

### 디자인 결정의 성능 영향
```
🎨 디자인 요소별 성능 비용
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
요소                   | 로딩 시간 영향
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hero 이미지 (4K)       | +2-3초
커스텀 폰트 3개        | +0.5-1초
무한 스크롤            | +메모리 30%
복잡한 애니메이션      | +CPU 40%
그림자 효과 (다중)     | +렌더링 20%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🚀 성능 최적화 디자인 전략

### 1. 이미지 최적화 가이드

#### 포맷 선택 기준
```
📸 2025년 이미지 포맷 가이드
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
포맷    | 용도              | 압축률 | 브라우저 지원
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AVIF   | 고품질 사진       | 최고   | 90%
WebP   | 일반 이미지       | 높음   | 95%
JPEG   | 폴백 이미지       | 보통   | 100%
SVG    | 아이콘/로고       | -      | 100%
PNG    | 투명 배경 필요시  | 낮음   | 100%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### 반응형 이미지 설계
```html
<!-- 디자이너가 준비해야 할 이미지 세트 -->
<picture>
  <!-- 모바일: 360-768px -->
  <source media="(max-width: 768px)" 
          srcset="hero-mobile.avif" type="image/avif">
  <source media="(max-width: 768px)" 
          srcset="hero-mobile.webp" type="image/webp">
  
  <!-- 태블릿: 768-1024px -->
  <source media="(max-width: 1024px)" 
          srcset="hero-tablet.avif" type="image/avif">
  
  <!-- 데스크톱: 1024px+ -->
  <source srcset="hero-desktop.avif" type="image/avif">
  
  <!-- 폴백 -->
  <img src="hero-fallback.jpg" alt="Hero Image">
</picture>
```

#### 이미지 사이즈 가이드라인
```
📐 디바이스별 최적 이미지 크기
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
디바이스      | 너비    | DPR | 실제 필요 크기
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
iPhone 15    | 393px  | 3x  | 1179px
Galaxy S24   | 412px  | 2.5x| 1030px
iPad Pro     | 1024px | 2x  | 2048px
MacBook Pro  | 1512px | 2x  | 3024px
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 권장사항:
• Hero 이미지: 최대 200KB
• 상품 이미지: 최대 100KB
• 썸네일: 최대 30KB
• 아이콘: SVG 또는 최대 5KB
```

### 2. 폰트 최적화 전략

#### 폰트 로딩 우선순위
```css
/* 성능 최적화된 폰트 로딩 */

/* 1단계: 중요 텍스트용 (제목) */
@font-face {
  font-family: 'Brand-Bold';
  src: url('brand-bold.woff2') format('woff2');
  font-display: swap; /* 즉시 대체 폰트 표시 */
  unicode-range: U+0020-007E; /* 영문만 */
}

/* 2단계: 본문용 */
@font-face {
  font-family: 'Brand-Regular';
  src: url('brand-regular.woff2') format('woff2');
  font-display: optional; /* 네트워크 상황에 따라 */
}

/* 3단계: 한글 (서브셋) */
@font-face {
  font-family: 'Brand-Korean';
  src: url('brand-korean-subset.woff2') format('woff2');
  font-display: swap;
  unicode-range: U+AC00-D7AF; /* 한글 범위 */
}
```

#### 폰트 서브셋 만들기
```bash
# 자주 사용하는 2,350자 한글만 추출
pyftsubset "NotoSansKR-Regular.otf" \
  --text-file="korean-2350.txt" \
  --output-file="NotoSansKR-subset.woff2" \
  --flavor=woff2

# 결과: 15MB → 350KB (98% 감소!)
```

### 3. 애니메이션 성능 가이드

#### GPU 가속 활용하기
```css
/* ❌ 성능 저하 애니메이션 */
.bad-animation {
  animation: badMove 1s infinite;
}
@keyframes badMove {
  to { left: 100px; top: 100px; } /* layout 변경 */
}

/* ✅ GPU 가속 애니메이션 */
.good-animation {
  animation: goodMove 1s infinite;
  will-change: transform; /* GPU 힌트 */
}
@keyframes goodMove {
  to { transform: translate(100px, 100px); }
}

/* 성능 비교 */
/* Bad: 16ms/frame (60fps 불가능) */
/* Good: 4ms/frame (60fps 유지) */
```

#### 애니메이션 복잡도 관리
```javascript
// 애니메이션 성능 점수 계산
const animationScore = {
  transform: 1,      // 가장 빠름
  opacity: 2,        // 빠름
  filter: 5,         // 보통
  boxShadow: 10,     // 느림
  width: 20,         // 매우 느림
  
  calculateTotal: (animations) => {
    return animations.reduce((sum, anim) => 
      sum + (animationScore[anim] || 30), 0);
  }
};

// 예시: 복잡한 호버 효과
const hoverEffects = ['transform', 'opacity', 'boxShadow'];
const score = animationScore.calculateTotal(hoverEffects);
// Score: 13 (권장: 15 이하)
```

### 4. 레이아웃 최적화

#### 가상 스크롤링 구현 시점
```
📜 무한 스크롤 vs 가상 스크롤
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
아이템 수  | 권장 방식        | 이유
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
< 50      | 일반 렌더링      | 충분히 빠름
50-200    | 무한 스크롤      | 점진적 로딩
200-1000  | 가상 스크롤      | DOM 최적화 필요
1000+     | 가상 스크롤 필수 | 메모리 관리 중요
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### 레이아웃 쓰레싱 방지
```javascript
// ❌ 레이아웃 쓰레싱 발생
elements.forEach(el => {
  el.style.left = el.offsetLeft + 10 + 'px';  // Read
  el.style.top = el.offsetTop + 10 + 'px';    // Read
});

// ✅ 배치 읽기/쓰기 분리
const positions = elements.map(el => ({
  left: el.offsetLeft,  // 모든 Read 먼저
  top: el.offsetTop
}));

elements.forEach((el, i) => {
  el.style.left = positions[i].left + 10 + 'px';  // Write만
  el.style.top = positions[i].top + 10 + 'px';
});
```

## 📊 성능 측정 도구 활용법

### 1. Core Web Vitals 이해하기
```
🎯 2025년 성능 목표치
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
지표    | 의미              | 좋음   | 개선필요 | 나쁨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LCP    | 최대 콘텐츠 렌더  | <2.5s | <4s     | >4s
FID    | 첫 입력 지연      | <100ms| <300ms  | >300ms
CLS    | 레이아웃 이동     | <0.1  | <0.25   | >0.25
INP    | 상호작용 응답     | <200ms| <500ms  | >500ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 2. 디자이너를 위한 Chrome DevTools
```
🔧 필수 체크 항목

1. Network 탭
   • 이미지 크기 확인
   • 폰트 로딩 순서
   • 총 다운로드 크기
   • 로딩 워터폴 차트

2. Performance 탭
   • FPS 미터 활성화
   • CPU 스로틀링 (6x slowdown)
   • 네트워크 스로틀링 (Slow 3G)
   • 스크린샷 타임라인

3. Lighthouse
   • Performance 점수
   • 최적화 제안사항
   • 이미지 최적화 기회
   • 사용하지 않는 CSS/JS
```

### 3. 실시간 성능 모니터링
```javascript
// 디자인 변경 후 성능 영향 측정
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fps: [],
      memory: [],
      loadTime: []
    };
  }
  
  measureFPS() {
    let lastTime = performance.now();
    let fps = 0;
    
    const measure = () => {
      const currentTime = performance.now();
      fps = Math.round(1000 / (currentTime - lastTime));
      lastTime = currentTime;
      
      // 30fps 이하면 경고
      if (fps < 30) {
        console.warn(`⚠️ Low FPS: ${fps}`);
      }
      
      requestAnimationFrame(measure);
    };
    measure();
  }
  
  checkImageSizes() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.naturalWidth > img.clientWidth * 2) {
        console.warn(`🖼️ 과도한 이미지 크기: ${img.src}`);
        console.log(`  실제: ${img.naturalWidth}px`);
        console.log(`  필요: ${img.clientWidth * 2}px`);
      }
    });
  }
}
```

## 🎨 디자인 시스템의 성능 고려사항

### 컴포넌트 복잡도 관리
```
📦 컴포넌트 성능 등급
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
등급 | 렌더링 시간 | 예시              | 사용 제한
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A   | <10ms      | 버튼, 텍스트      | 무제한
B   | <50ms      | 카드, 폼 필드     | 페이지당 20개
C   | <100ms     | 차트, 지도        | 페이지당 5개
D   | >100ms     | 3D 뷰어, 에디터   | 페이지당 1개
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 상태별 스타일 최적화
```css
/* ❌ 비효율적인 상태 관리 */
.button {
  /* 20개의 속성... */
}
.button:hover {
  /* 20개 속성 모두 재정의... */
}

/* ✅ 변경사항만 정의 */
.button {
  /* 기본 스타일 */
  transition: transform 0.2s, background 0.2s;
}
.button:hover {
  transform: translateY(-2px);
  background: var(--hover-color);
  /* 2개 속성만 변경 */
}
```

## 💬 개발자와의 성능 대화법

### 성능 이슈 보고 템플릿
```markdown
## 성능 이슈 리포트

### 발견 위치
- 페이지: /product/detail
- 컴포넌트: ProductGallery
- 디바이스: iPhone 12 (실제 기기)

### 증상
- [ ] 느린 초기 로딩 (LCP)
- [x] 스크롤 버벅임 (FPS 저하)
- [ ] 클릭 반응 지연 (INP)
- [ ] 레이아웃 깜빡임 (CLS)

### 측정값
- FPS: 평균 24fps (목표: 60fps)
- 발생 조건: 갤러리 스와이프 시

### 예상 원인 (디자이너 의견)
- 이미지 크기: 4000x3000px 원본 사용
- 애니메이션: transform + box-shadow 동시

### 제안사항
1. 이미지를 디바이스별로 최적화
2. box-shadow 대신 미리 렌더링된 그림자 이미지 사용
```

### 성능 vs 디자인 협상 전략
```
🤝 Trade-off 협상 가이드

1. 데이터로 말하기
   "이 애니메이션으로 FPS가 60 → 30으로 떨어집니다"
   
2. 대안 제시하기
   "복잡한 그림자 대신 단순한 그림자 + 블러로 대체하면?"
   
3. A/B 테스트 제안
   "성능 최적화 버전과 원본을 50:50으로 테스트해보죠"
   
4. 점진적 개선
   "모바일만 먼저 최적화하고 데스크톱은 유지하면?"
```

## 🚦 성능 체크리스트

### 디자인 핸드오프 전 체크리스트
```
✅ 이미지 최적화
□ 모든 이미지가 실제 표시 크기의 2배 이하
□ Hero 이미지 200KB 이하
□ WebP/AVIF 포맷 버전 준비
□ 레이지 로딩 적용 위치 표시
□ 플레이스홀더/스켈레톤 디자인 제공

✅ 애니메이션
□ 60fps 유지 가능한 속성만 사용
□ 애니메이션 시간 0.3초 이하
□ 동시 애니메이션 3개 이하
□ 모바일에서 애니메이션 감소 옵션

✅ 폰트
□ 웹폰트 3개 이하 사용
□ 폰트 서브셋 제작 완료
□ 폴백 폰트 정의
□ 중요 텍스트 우선 로딩 표시

✅ 레이아웃
□ 스크롤 시 고정 요소 최소화
□ 무한 스크롤 시 가상화 필요 여부 표시
□ 반응형 브레이크포인트 3개 이하
□ CSS Grid/Flexbox 활용
```

## 🎯 실전 예제: 전자상거래 상품 목록 최적화

### Before: 성능 문제가 있는 디자인
```
😰 문제가 있는 디자인
• 4K 상품 이미지 20개 동시 로딩
• 호버 시 복잡한 3D 회전 효과
• 각 상품마다 5개의 커스텀 폰트
• 실시간 재고 업데이트 애니메이션
• 결과: 초기 로딩 8초, 스크롤 15fps
```

### After: 최적화된 디자인
```
😊 최적화된 디자인
• 뷰포트 내 이미지만 로딩 (Intersection Observer)
• 호버 시 단순 스케일 + 그림자
• 시스템 폰트 + 브랜드 폰트 1개
• 재고 변경 시만 fade 애니메이션
• 결과: 초기 로딩 1.5초, 스크롤 60fps

💰 비즈니스 임팩트
• 이탈률 35% → 12% 감소
• 전환율 2.1% → 3.8% 증가
• 평균 체류시간 2분 → 5분 증가
```

## 📚 더 알아보기

### 추천 도구
- [PageSpeed Insights](https://pagespeed.web.dev/) - Google 성능 측정
- [WebPageTest](https://www.webpagetest.org/) - 상세 성능 분석
- [Squoosh](https://squoosh.app/) - 이미지 최적화
- [FontSquirrel](https://www.fontsquirrel.com/) - 웹폰트 생성

### 성능 모니터링 서비스
- Datadog RUM - 실사용자 모니터링
- New Relic Browser - 프론트엔드 성능 추적
- Sentry Performance - 성능 이슈 추적
- SpeedCurve - 지속적 성능 모니터링

### 학습 자료
- [Web.dev Performance](https://web.dev/performance/) - Google 가이드
- [CSS Triggers](https://csstriggers.com/) - CSS 속성별 성능 영향
- [Bundle Phobia](https://bundlephobia.com/) - 패키지 크기 확인

## 💡 핵심 정리

> "성능은 디자인의 일부다. 아름답지만 느린 디자인은 실패한 디자인이다."

1. **측정 가능한 목표 설정**: LCP < 2.5초, FPS > 30
2. **점진적 개선**: 완벽보다는 지속적 개선
3. **모바일 우선**: 가장 느린 디바이스 기준 최적화
4. **협업**: 개발자와 함께 성능 목표 설정
5. **자동화**: 성능 테스트를 CI/CD에 통합

성능 최적화는 한 번에 끝나는 작업이 아니라 지속적인 과정입니다. 디자인 단계부터 성능을 고려하면, 나중에 대규모 수정 없이도 빠르고 매끄러운 사용자 경험을 제공할 수 있습니다.