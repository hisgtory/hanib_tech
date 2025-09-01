# Episode 2-17: 디자인-개발 핸드오프 완벽 가이드
## 디자인이 코드가 되는 순간의 모든 것

---

## 🎬 Opening: 핸드오프의 악몽

**2024년 12월, 스프린트 3일차**

"디자인이랑 완전 달라요!"

개발자 준호의 말에 디자이너 서연은 화면을 확인했다. 맞다. 완전히 다르다.

- 폰트 크기가 다르다
- 여백이 이상하다  
- 색상이 미묘하게 다르다
- 애니메이션이 없다
- 반응형이 깨졌다

"제가 Figma에 다 명시했는데요..."
"어디에요? 못 봤는데..."
"여기... 아, 이 페이지 링크를 안 보냈구나..."

3주짜리 프로젝트가 5주가 되는 순간이었다.

오늘은 이런 악몽을 막는 **완벽한 디자인 핸드오프**의 모든 것을 배워보자.

---

## Part 1: 핸드오프 전 준비 체크리스트

### ✅ 디자인 완성도 자가진단

```javascript
// 핸드오프 준비도 체크리스트
const handoffReadiness = {
  필수_완료: {
    "모든_상태_디자인": ["Default", "Hover", "Active", "Disabled", "Loading", "Error", "Empty"],
    "반응형_대응": ["Mobile(360px)", "Tablet(768px)", "Desktop(1440px)", "Wide(1920px)"],
    "컴포넌트화": "반복 요소는 모두 컴포넌트로",
    "네이밍_규칙": "개발자와 합의된 이름 사용",
    "엣지_케이스": "긴 텍스트, 이미지 없음, 권한 없음 등"
  },
  
  스펙_문서화: {
    "컬러_시스템": "Hex, RGB, 변수명 모두 포함",
    "타이포그래피": "크기, 굵기, 행간, 자간 명시",
    "스페이싱": "8px 그리드 시스템",
    "애니메이션": "duration, easing, delay 명시",
    "인터랙션": "트리거와 액션 정의"
  },
  
  에셋_준비: {
    "아이콘": "SVG 포맷, 네이밍 규칙 적용",
    "이미지": "2x, 3x 버전 준비",
    "일러스트": "SVG 또는 Lottie",
    "폰트": "웹폰트 링크 또는 파일"
  }
};

// 준비도 점수 계산
function calculateReadiness(checklist) {
  const completed = Object.values(checklist)
    .flat()
    .filter(item => item.checked).length;
  const total = Object.values(checklist).flat().length;
  
  return {
    score: (completed / total * 100).toFixed(0),
    ready: completed === total,
    missing: total - completed
  };
}
```

### 🎨 Figma 파일 구조 정리

```
📁 Project Name
├── 📄 🏠 Cover
├── 📄 📐 Design System
│   ├── Colors
│   ├── Typography
│   ├── Spacing
│   ├── Components
│   └── Icons
├── 📄 🖼️ Screens
│   ├── 01_Onboarding
│   ├── 02_Authentication
│   ├── 03_Home
│   ├── 04_Profile
│   └── 05_Settings
├── 📄 🔄 User Flows
├── 📄 📱 Prototypes
└── 📄 🚀 Developer Handoff ← 핵심!
    ├── Specifications
    ├── Redlines
    ├── Assets Export
    └── Documentation
```

---

## Part 2: Figma Dev Mode 마스터하기

### 🛠️ Dev Mode 필수 설정

```typescript
// Figma Dev Mode 최적화 설정
interface FigmaDevModeSetup {
  // 1. 코드 스니펫 설정
  codeGeneration: {
    platform: "Web" | "iOS" | "Android",
    framework: "React" | "Vue" | "SwiftUI" | "Compose",
    unit: "px" | "rem" | "dp" | "pt",
    colorFormat: "HEX" | "RGB" | "HSL"
  },
  
  // 2. 레이어 정리
  layerOrganization: {
    naming: "컴포넌트명_상태_변형",
    grouping: "논리적 그룹핑",
    hiding: "불필요한 레이어 숨김",
    locking: "변경 금지 레이어 잠금"
  },
  
  // 3. 어노테이션 추가
  annotations: {
    specs: "중요 수치 명시",
    notes: "구현 주의사항",
    links: "관련 문서 링크",
    status: "Ready | In Progress | Review"
  }
}
```

### 📏 Redline과 Spacing 명시

```scss
// 디자인 스펙 명시 방법
.design-specifications {
  /* Spacing System (8px Grid) */
  --spacing-xs: 4px;   // 최소 간격
  --spacing-sm: 8px;   // 작은 간격
  --spacing-md: 16px;  // 기본 간격
  --spacing-lg: 24px;  // 큰 간격
  --spacing-xl: 32px;  // 매우 큰 간격
  --spacing-xxl: 48px; // 섹션 간격
  
  /* Component Spacing */
  .button {
    padding: var(--spacing-sm) var(--spacing-md);
    margin-bottom: var(--spacing-md);
    
    // 명시적 표기
    /* 
      Top/Bottom: 8px
      Left/Right: 16px
      Bottom Margin: 16px
    */
  }
  
  /* Responsive Spacing */
  @media (max-width: 768px) {
    --spacing-md: 12px; // 모바일에서 축소
  }
}
```

### 🎯 컴포넌트 스펙 문서화

```javascript
// 컴포넌트별 상세 스펙
const ButtonSpecification = {
  // 기본 속성
  properties: {
    variants: ["Primary", "Secondary", "Ghost", "Danger"],
    sizes: ["Small", "Medium", "Large"],
    states: ["Default", "Hover", "Active", "Disabled", "Loading"]
  },
  
  // 상세 스펙
  specifications: {
    small: {
      height: "32px",
      padding: "8px 16px",
      fontSize: "14px",
      borderRadius: "6px"
    },
    medium: {
      height: "40px",
      padding: "10px 20px",
      fontSize: "16px",
      borderRadius: "8px"
    },
    large: {
      height: "48px",
      padding: "12px 24px",
      fontSize: "18px",
      borderRadius: "10px"
    }
  },
  
  // 색상 시스템
  colors: {
    primary: {
      default: "#007AFF",
      hover: "#0051D5",
      active: "#0041AC",
      disabled: "#007AFF40"
    }
  },
  
  // 애니메이션
  animations: {
    hover: {
      transition: "all 0.2s ease-in-out",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
    },
    click: {
      transform: "scale(0.98)",
      transition: "transform 0.1s ease"
    }
  },
  
  // 구현 노트
  implementation_notes: [
    "로딩 상태에서는 텍스트를 스피너로 교체",
    "Disabled 상태에서는 pointer-events: none",
    "아이콘 있을 경우 8px gap 유지"
  ]
};
```

---

## Part 3: Design Token 시스템

### 🎨 Design Token이란?

```json
{
  "design_tokens": {
    "정의": "디자인 결정을 코드로 변환한 변수",
    "목적": "디자인과 개발 간 Single Source of Truth",
    "장점": [
      "일관성 유지",
      "업데이트 용이",
      "플랫폼 간 통일",
      "자동화 가능"
    ]
  }
}
```

### 🏗️ Token 구조 설계

```javascript
// design-tokens.js
const designTokens = {
  // 1. Core Tokens (Primitives)
  colors: {
    blue: {
      50: "#EFF6FF",
      100: "#DBEAFE",
      200: "#BFDBFE",
      300: "#93C5FD",
      400: "#60A5FA",
      500: "#3B82F6", // Primary
      600: "#2563EB",
      700: "#1D4ED8",
      800: "#1E40AF",
      900: "#1E3A8A"
    }
  },
  
  // 2. Semantic Tokens
  semantic: {
    colors: {
      primary: "$colors.blue.500",
      primaryHover: "$colors.blue.600",
      success: "$colors.green.500",
      warning: "$colors.yellow.500",
      error: "$colors.red.500",
      textPrimary: "$colors.gray.900",
      textSecondary: "$colors.gray.600",
      border: "$colors.gray.200",
      background: "$colors.white"
    }
  },
  
  // 3. Component Tokens
  components: {
    button: {
      primary: {
        background: "$semantic.colors.primary",
        color: "$colors.white",
        borderRadius: "$radii.md",
        padding: "$space.3 $space.4",
        fontSize: "$fontSizes.md",
        fontWeight: "$fontWeights.medium"
      }
    }
  },
  
  // 4. Typography Tokens
  typography: {
    fonts: {
      heading: "'Pretendard', sans-serif",
      body: "'Pretendard', sans-serif",
      mono: "'Fira Code', monospace"
    },
    fontSizes: {
      xs: "12px",
      sm: "14px",
      md: "16px",
      lg: "18px",
      xl: "20px",
      "2xl": "24px",
      "3xl": "30px",
      "4xl": "36px"
    },
    lineHeights: {
      tight: "1.2",
      normal: "1.5",
      relaxed: "1.75"
    }
  },
  
  // 5. Spacing Tokens
  space: {
    0: "0px",
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
    10: "40px",
    12: "48px",
    16: "64px"
  }
};

// Token 자동 생성 스크립트
function generateCSSVariables(tokens) {
  let css = ':root {\n';
  
  function processTokens(obj, prefix = '') {
    Object.entries(obj).forEach(([key, value]) => {
      const varName = prefix ? `${prefix}-${key}` : key;
      
      if (typeof value === 'object') {
        processTokens(value, varName);
      } else {
        css += `  --${varName}: ${value};\n`;
      }
    });
  }
  
  processTokens(tokens);
  css += '}';
  
  return css;
}
```

### 🔄 Token 변환 파이프라인

```yaml
# Token 변환 워크플로우
Token_Pipeline:
  1_Source:
    - Figma Tokens Plugin
    - tokens.json 파일
    
  2_Transform:
    - Style Dictionary
    - Token Transformer
    
  3_Output:
    Web:
      - CSS Variables
      - SCSS Variables
      - JS Constants
    Mobile:
      - iOS: Swift
      - Android: XML/Kotlin
    
  4_Integration:
    - Design System Package
    - NPM/Yarn 배포
    - 자동 업데이트
```

---

## Part 4: 에셋 준비와 최적화

### 🖼️ 이미지 에셋 체크리스트

```typescript
interface ImageAssetGuidelines {
  // 포맷별 용도
  formats: {
    SVG: "아이콘, 로고, 일러스트레이션",
    PNG: "투명 배경 필요한 래스터 이미지",
    JPG: "사진, 복잡한 이미지",
    WebP: "차세대 포맷, 용량 30% 절감"
  },
  
  // 해상도별 준비
  resolutions: {
    "1x": "기본 해상도",
    "2x": "레티나 디스플레이",
    "3x": "iPhone Plus/Pro Max"
  },
  
  // 네이밍 규칙
  naming: {
    pattern: "[component]_[element]_[state]_[size]",
    example: "btn_icon_hover_24px.svg",
    rules: [
      "소문자만 사용",
      "언더스코어(_)로 구분",
      "특수문자 금지",
      "의미있는 이름 사용"
    ]
  },
  
  // 최적화 가이드
  optimization: {
    SVG: [
      "불필요한 메타데이터 제거",
      "Path 단순화",
      "SVGO 도구 사용"
    ],
    PNG: [
      "TinyPNG로 압축",
      "필요시 8-bit 컬러 사용",
      "투명도 필요 없으면 JPG 고려"
    ],
    size_limits: {
      icon: "< 5KB",
      thumbnail: "< 50KB",
      hero_image: "< 200KB"
    }
  }
}
```

### 🎭 아이콘 시스템

```javascript
// 아이콘 export 자동화 스크립트
const iconExportConfig = {
  // Figma에서 설정
  figmaSetup: {
    frame_naming: "icon/[name]",
    size: "24x24px (기본)",
    padding: "2px (터치 영역 고려)",
    stroke_width: "2px (일관성)"
  },
  
  // Export 설정
  exportSettings: [
    {
      format: "SVG",
      suffix: "",
      svgSettings: {
        includeID: false,
        outline: true,
        simplifyStroke: true
      }
    },
    {
      format: "PNG",
      scales: [1, 2, 3],
      suffix: "@1x, @2x, @3x"
    }
  ],
  
  // React 컴포넌트 자동 생성
  componentGeneration: `
    // 자동 생성된 아이콘 컴포넌트
    import { ReactComponent as IconName } from './icons/icon-name.svg';
    
    export const Icon = ({ size = 24, color = 'currentColor', ...props }) => (
      <IconName 
        width={size} 
        height={size} 
        fill={color}
        {...props}
      />
    );
  `
};
```

---

## Part 5: 문서화 전략

### 📝 핸드오프 문서 템플릿

```markdown
# 🎨 [프로젝트명] Design Handoff Document

## 📅 기본 정보
- **프로젝트**: [프로젝트명]
- **버전**: v1.0.0
- **날짜**: 2024.12.15
- **디자이너**: [이름]
- **개발자**: [이름]
- **Figma 링크**: [URL]

## 🎯 프로젝트 개요
### 목표
- 주요 목표 1
- 주요 목표 2

### 범위
- [ ] 온보딩 플로우
- [ ] 홈 화면
- [ ] 프로필 설정

## 🎨 디자인 시스템
### Color Palette
| 용도 | 변수명 | Hex | RGB |
|-----|-------|-----|-----|
| Primary | $color-primary | #007AFF | rgb(0,122,255) |
| Secondary | $color-secondary | #5856D6 | rgb(88,86,214) |

### Typography
| 스타일 | 크기 | 굵기 | 행간 | 용도 |
|-------|------|------|------|------|
| H1 | 32px | Bold | 40px | 페이지 타이틀 |
| Body | 16px | Regular | 24px | 본문 |

### Spacing System
- 8px 그리드 기반
- 컴포넌트 간격: 16px
- 섹션 간격: 32px

## 📱 화면별 스펙

### 1. 온보딩 화면
#### 구성 요소
- [ ] 스플래시 스크린
- [ ] 튜토리얼 3단계
- [ ] 권한 요청

#### 인터랙션
- 스와이프로 다음 단계
- Skip 버튼으로 건너뛰기
- 프로그레스 인디케이터

#### 주의사항
- 첫 화면은 3초 이내 로드
- 애니메이션은 60fps 유지

### 2. 홈 화면
[상세 스펙...]

## 🔄 상태별 디자인
### 로딩 상태
- 스켈레톤 UI 사용
- 1초 이상 로딩 시 프로그레스 표시

### 에러 상태
- 에러 타입별 메시지
- 재시도 버튼 포함

### 빈 상태
- 일러스트레이션 + 안내 문구
- CTA 버튼으로 액션 유도

## 📦 에셋 목록
### 아이콘 (24개)
- [ ] icon_home_24.svg
- [ ] icon_profile_24.svg
- [ ] icon_settings_24.svg
[전체 목록...]

### 이미지 (12개)
- [ ] onboarding_01@2x.png
- [ ] onboarding_02@2x.png
[전체 목록...]

## ⚡ 애니메이션 스펙
### 페이지 전환
- Duration: 300ms
- Easing: ease-in-out
- Direction: 좌 → 우

### 컴포넌트 애니메이션
| 요소 | 트리거 | 애니메이션 | Duration |
|-----|--------|------------|----------|
| Button | Tap | Scale(0.98) | 100ms |
| Card | Hover | Shadow증가 | 200ms |

## 🔗 관련 문서
- [PRD 문서](link)
- [API 문서](link)
- [프로토타입](link)

## ✅ 체크리스트
### 디자이너 확인
- [ ] 모든 화면 디자인 완료
- [ ] 에셋 Export 완료
- [ ] 스펙 문서화 완료
- [ ] 프로토타입 링크 공유

### 개발자 확인
- [ ] 디자인 파일 접근 확인
- [ ] 에셋 다운로드 완료
- [ ] 불명확한 부분 질문
- [ ] 구현 일정 협의

## 💬 QnA Log
| 날짜 | 질문 | 답변 | 상태 |
|------|------|------|------|
| 12/15 | 로딩 애니메이션 타입? | 스피너 사용 | ✅ |

## 📞 연락처
- 디자이너: [이메일/슬랙]
- 개발자: [이메일/슬랙]
- PM: [이메일/슬랙]
```

### 🔄 버전 관리

```javascript
// 디자인 버전 관리 전략
const versionControl = {
  // 버전 네이밍
  naming: {
    major: "큰 변경 (v1.0.0 → v2.0.0)",
    minor: "기능 추가 (v1.0.0 → v1.1.0)",
    patch: "버그 수정 (v1.0.0 → v1.0.1)"
  },
  
  // 변경 이력 관리
  changelog: {
    "v1.0.0": {
      date: "2024-12-15",
      changes: [
        "초기 디자인 완성",
        "온보딩, 홈, 프로필 화면"
      ]
    },
    "v1.0.1": {
      date: "2024-12-16",
      changes: [
        "버튼 패딩 수정",
        "에러 상태 추가"
      ]
    }
  },
  
  // Figma 버전 관리
  figmaVersioning: {
    브랜치: "기능별 브랜치 생성",
    머지: "리뷰 후 메인에 병합",
    태그: "릴리즈 버전 태깅",
    백업: "주요 버전 복사본 보관"
  }
};
```

---

## Part 6: 커뮤니케이션 프로토콜

### 💬 효과적인 커뮤니케이션

```typescript
interface HandoffCommunication {
  // 킥오프 미팅
  kickoffMeeting: {
    agenda: [
      "프로젝트 목표 공유",
      "디자인 의도 설명",
      "기술적 제약 확인",
      "일정 협의",
      "QA 프로세스 합의"
    ],
    
    participants: ["Designer", "Frontend", "Backend", "PM"],
    
    deliverables: [
      "핸드오프 일정",
      "담당자 매핑",
      "커뮤니케이션 채널"
    ]
  },
  
  // 일일 싱크
  dailySync: {
    format: "Slack 스레드 or 15분 스탠드업",
    
    내용: {
      designer: "디자인 업데이트 사항",
      developer: "구현 진행 상황",
      blocker: "이슈 및 해결 필요 사항"
    }
  },
  
  // 피드백 루프
  feedbackLoop: {
    디자인_리뷰: {
      주기: "구현 50% 시점",
      방법: "화면 공유 or 스테이징 환경",
      문서화: "피드백 시트 작성"
    },
    
    최종_QA: {
      체크리스트: "디자인 QA 체크리스트",
      우선순위: "Critical > Major > Minor",
      사인오프: "디자이너 최종 승인"
    }
  }
}
```

### 🚨 이슈 트래킹

```javascript
// 이슈 관리 시스템
class HandoffIssueTracker {
  constructor() {
    this.issues = [];
  }
  
  // 이슈 생성
  createIssue(issue) {
    return {
      id: `HANDOFF-${Date.now()}`,
      title: issue.title,
      type: issue.type, // "Design Gap" | "Missing Asset" | "Spec Unclear"
      priority: issue.priority, // "Critical" | "Major" | "Minor"
      description: issue.description,
      screenshot: issue.screenshot,
      assignee: issue.assignee,
      status: "Open",
      created: new Date(),
      updated: new Date()
    };
  }
  
  // 이슈 템플릿
  issueTemplates = {
    designGap: {
      title: "[Design Gap] 구현이 디자인과 다름",
      fields: [
        "화면/컴포넌트",
        "예상 디자인",
        "실제 구현",
        "스크린샷 비교"
      ]
    },
    
    missingAsset: {
      title: "[Missing Asset] 에셋 누락",
      fields: [
        "에셋 종류",
        "파일명",
        "사용 위치",
        "필요 시점"
      ]
    },
    
    specUnclear: {
      title: "[Spec Unclear] 스펙 불명확",
      fields: [
        "불명확한 부분",
        "필요한 정보",
        "관련 화면",
        "예상 동작"
      ]
    }
  };
}
```

---

## Part 7: 플랫폼별 고려사항

### 📱 iOS vs Android

```javascript
// 플랫폼별 디자인 차이
const platformDifferences = {
  iOS: {
    navigation: {
      위치: "하단 탭바",
      뒤로가기: "좌상단 < Back",
      제스처: "스와이프로 뒤로"
    },
    
    components: {
      switch: "타원형 토글",
      picker: "휠 피커",
      actionSheet: "하단 시트"
    },
    
    typography: {
      시스템폰트: "SF Pro Display",
      최소크기: "11pt"
    },
    
    guidelines: "Human Interface Guidelines"
  },
  
  Android: {
    navigation: {
      위치: "상단 앱바 또는 하단 네비",
      뒤로가기: "시스템 뒤로 버튼",
      제스처: "시스템 제스처"
    },
    
    components: {
      switch: "사각형 스위치",
      picker: "드롭다운",
      bottomSheet: "바텀 시트"
    },
    
    typography: {
      시스템폰트: "Roboto",
      최소크기: "12sp"
    },
    
    guidelines: "Material Design"
  }
};

// 플랫폼 공통 vs 개별 디자인
const platformStrategy = {
  공통_요소: [
    "색상 시스템",
    "아이콘 스타일",
    "레이아웃 구조",
    "콘텐츠 구성"
  ],
  
  플랫폼별_요소: [
    "네비게이션 패턴",
    "시스템 컴포넌트",
    "제스처 인터랙션",
    "타이포그래피"
  ]
};
```

### 🌐 Web 반응형

```scss
// 반응형 브레이크포인트
$breakpoints: (
  mobile: 360px,    // 최소 지원
  tablet: 768px,    // iPad
  desktop: 1024px,  // 노트북
  wide: 1440px,     // 데스크톱
  ultrawide: 1920px // 대형 모니터
);

// 반응형 디자인 스펙
@mixin responsive-specs {
  // Mobile First
  .container {
    padding: 16px;
    
    @media (min-width: map-get($breakpoints, tablet)) {
      padding: 24px;
      max-width: 720px;
      margin: 0 auto;
    }
    
    @media (min-width: map-get($breakpoints, desktop)) {
      padding: 32px;
      max-width: 960px;
    }
    
    @media (min-width: map-get($breakpoints, wide)) {
      max-width: 1200px;
    }
  }
  
  // 그리드 시스템
  .grid {
    display: grid;
    gap: 16px;
    grid-template-columns: 1fr; // 모바일: 1열
    
    @media (min-width: map-get($breakpoints, tablet)) {
      grid-template-columns: repeat(2, 1fr); // 태블릿: 2열
    }
    
    @media (min-width: map-get($breakpoints, desktop)) {
      grid-template-columns: repeat(3, 1fr); // 데스크톱: 3열
      gap: 24px;
    }
  }
}
```

---

## Part 8: 자동화 도구와 플러그인

### 🔧 필수 Figma 플러그인

```javascript
const essentialPlugins = {
  "Design Tokens": {
    용도: "토큰 생성 및 관리",
    특징: "JSON 자동 생성",
    링크: "figma.com/community/plugin/..."
  },
  
  "Figma to Code": {
    용도: "코드 자동 생성",
    특징: "React, Vue, HTML/CSS 지원",
    사용법: "컴포넌트 선택 → 플러그인 실행 → 코드 복사"
  },
  
  "Design Lint": {
    용도: "디자인 일관성 검사",
    특징: "네이밍, 컬러, 텍스트 스타일 체크",
    자동수정: true
  },
  
  "Able": {
    용도: "접근성 검사",
    특징: "WCAG 기준 색상 대비 체크",
    레포트: "접근성 이슈 리포트 생성"
  },
  
  "Figmotion": {
    용도: "애니메이션 스펙",
    특징: "Lottie, CSS 애니메이션 생성",
    export: "JSON, CSS, After Effects"
  },
  
  "Stark": {
    용도: "종합 접근성 도구",
    특징: "색맹 시뮬레이션, 대비 체크",
    compliance: "WCAG 2.1 AA/AAA"
  }
};
```

### 🤖 자동화 워크플로우

```yaml
# GitHub Actions 자동화
name: Design System Update

on:
  push:
    paths:
      - 'tokens.json'

jobs:
  update-tokens:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install Dependencies
        run: npm install
      
      - name: Build Tokens
        run: |
          npm run build:tokens
          npm run generate:css
          npm run generate:scss
          npm run generate:js
      
      - name: Create PR
        uses: peter-evans/create-pull-request@v3
        with:
          title: 'Update Design Tokens'
          body: 'Auto-generated from Figma'
          branch: update-design-tokens
```

---

## Part 9: 실전 체크리스트

### ✅ 핸드오프 전 최종 체크리스트

```markdown
## 디자이너 체크리스트

### 디자인 완성도
- [ ] 모든 화면 디자인 완료
- [ ] 모든 상태(State) 디자인
- [ ] 반응형/적응형 대응
- [ ] 다크모드 대응 (필요시)
- [ ] 접근성 검토

### 디자인 시스템
- [ ] 컬러 팔레트 정의
- [ ] 타이포그래피 시스템
- [ ] 스페이싱 시스템
- [ ] 컴포넌트 라이브러리
- [ ] 아이콘 세트

### 문서화
- [ ] 디자인 의도 설명
- [ ] 인터랙션 정의
- [ ] 애니메이션 스펙
- [ ] 엣지 케이스 정리
- [ ] 구현 우선순위

### 에셋
- [ ] 모든 아이콘 Export
- [ ] 이미지 최적화
- [ ] 폰트 파일 준비
- [ ] Lottie 파일 (필요시)

### 커뮤니케이션
- [ ] Figma 접근 권한 부여
- [ ] 핸드오프 미팅 일정
- [ ] Slack 채널 생성
- [ ] 이슈 트래킹 설정

## 개발자 체크리스트

### 사전 준비
- [ ] Figma 계정 및 접근 권한
- [ ] Dev Mode 활성화
- [ ] 플러그인 설치
- [ ] Design Token 확인

### 기술 검토
- [ ] 구현 가능성 검토
- [ ] 플랫폼별 제약 확인
- [ ] 성능 영향 평가
- [ ] 일정 산정

### 구현 준비
- [ ] 컴포넌트 구조 설계
- [ ] 스타일 시스템 설정
- [ ] 에셋 통합 방법
- [ ] 애니메이션 라이브러리

### 협업
- [ ] 불명확한 부분 질문
- [ ] 구현 우선순위 합의
- [ ] QA 프로세스 확인
- [ ] 정기 싱크 일정
```

---

## Part 10: 트러블슈팅 가이드

### 🔥 자주 발생하는 문제와 해결법

```javascript
const commonProblems = {
  "색상이_다르게_보여요": {
    원인: [
      "색상 프로파일 차이",
      "모니터 캘리브레이션",
      "투명도 처리 차이"
    ],
    해결: [
      "Hex 코드로 정확히 명시",
      "스크린샷으로 비교",
      "개발 환경에서 직접 확인"
    ]
  },
  
  "폰트가_다르게_렌더링돼요": {
    원인: [
      "폰트 힌팅 차이",
      "OS별 렌더링 엔진",
      "웹폰트 로딩 실패"
    ],
    해결: [
      "웹폰트 CDN 사용",
      "font-display: swap 설정",
      "폴백 폰트 지정"
    ]
  },
  
  "애니메이션이_버벅거려요": {
    원인: [
      "너무 많은 DOM 조작",
      "GPU 가속 미사용",
      "프레임 드랍"
    ],
    해결: [
      "transform, opacity만 애니메이션",
      "will-change 속성 사용",
      "requestAnimationFrame 활용"
    ]
  },
  
  "반응형이_깨져요": {
    원인: [
      "고정 픽셀값 사용",
      "미디어쿼리 누락",
      "플렉스박스 설정 오류"
    ],
    해결: [
      "상대 단위 사용 (%, rem, vw)",
      "모든 브레이크포인트 테스트",
      "플렉스 컨테이너 구조 확인"
    ]
  }
};
```

---

## 🎬 Ending: 완벽한 핸드오프의 비밀

### 한비의 마지막 조언

핸드오프는 **배턴 터치**다.

릴레이 경주에서 배턴을 떨어뜨리면 아무리 빨리 달려도 소용없듯이,
디자인 핸드오프가 실패하면 아무리 좋은 디자인도 빛을 잃는다.

**성공적인 핸드오프의 핵심:**
1. 📋 **준비**: 체크리스트 100% 완료
2. 📐 **정확성**: 애매한 부분 없이 명확하게
3. 🤝 **소통**: 개발자와 충분한 대화
4. 📝 **문서화**: 말보다 문서로 남기기
5. 🔄 **피드백**: 구현 과정 계속 체크

**기억하세요:**
- 핸드오프는 끝이 아니라 시작이다
- 개발자는 적이 아니라 파트너다
- 완벽한 스펙보다 지속적인 소통이 중요하다

### 🎯 Action Items

```markdown
## 다음 프로젝트에서 실천하기

### Week 1: 준비
- [ ] Design Token 도입
- [ ] Figma Dev Mode 설정
- [ ] 핸드오프 체크리스트 작성

### Week 2: 실행
- [ ] 컴포넌트 라이브러리 구축
- [ ] 자동화 도구 설정
- [ ] 문서 템플릿 적용

### Week 3: 개선
- [ ] 핸드오프 회고
- [ ] 프로세스 개선점 도출
- [ ] 팀 공유 및 표준화
```

### 💎 Golden Rules

```javascript
const handoffGoldenRules = [
  "개발자가 질문하기 전에 답을 준비하라",
  "보여주는 것이 설명하는 것보다 낫다",
  "작은 단위로 자주 공유하라",
  "피드백은 빠를수록 좋다",
  "문서는 미래의 나를 위한 것이다"
];
```

---

*"좋은 핸드오프는 좋은 제품의 시작이다."*

**#디자인핸드오프 #DesignSystem #FigmaDevMode #DesignTokens #디자인개발협업 #핸드오프체크리스트 #디자인문서화 #hanib_tech**