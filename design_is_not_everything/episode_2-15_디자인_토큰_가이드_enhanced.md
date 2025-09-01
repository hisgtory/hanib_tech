# 에피소드 2-15: 디자인 토큰 완벽 가이드 - 디자인과 개발을 연결하는 다리

## 🎯 이 글을 읽으면 얻게 되는 것
- 디자인 토큰의 개념과 필요성 이해
- 토큰 시스템 구축 방법론
- Figma에서 코드까지 자동화 프로세스
- 다크모드와 테마 시스템 구현

## 🎨 디자인 토큰이란?

### 디자인 토큰의 정의
```
🔤 디자인 토큰 = 디자인 결정의 최소 단위

전통적 방식:
"버튼 색상은 파란색 #007AFF"
→ 100곳에 하드코딩
→ 변경 시 100곳 수정

토큰 방식:
"버튼 색상은 $color-primary"
→ 토큰 하나만 정의
→ 변경 시 한 곳만 수정

실제 예시:
$color-primary = #007AFF
$spacing-medium = 16px
$font-size-heading = 24px
$border-radius-button = 8px
```

### 왜 디자인 토큰이 필요할까?
```
💡 디자인 토큰의 가치
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
문제               | 토큰 없이      | 토큰 사용
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
일관성 유지        | 어려움         | 자동
다크모드 지원      | 수동 작업      | 즉시
브랜드 변경        | 몇 주          | 몇 분
플랫폼 확장        | 재작업         | 재사용
디자인-개발 동기화  | 수동 확인      | 자동화
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🏗️ 디자인 토큰 체계

### 토큰 레벨 구조
```
📊 3단계 토큰 아키텍처

Level 1: Core Tokens (원시 토큰)
├── 실제 값 정의
├── 플랫폼 독립적
└── 예: blue-500 = #007AFF

Level 2: Semantic Tokens (의미 토큰)
├── 용도별 별칭
├── 컨텍스트 제공
└── 예: color-primary = blue-500

Level 3: Component Tokens (컴포넌트 토큰)
├── 특정 컴포넌트용
├── 세밀한 제어
└── 예: button-background = color-primary
```

### 토큰 카테고리
```
🎨 디자인 토큰 분류 체계
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
카테고리    | 토큰 예시              | 값 예시
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Colors     | color-primary         | #007AFF
Typography | font-size-body        | 16px
Spacing    | spacing-medium        | 16px
Elevation  | shadow-card           | 0 2px 8px
Animation  | duration-normal       | 200ms
Breakpoint | screen-mobile         | 375px
Border     | radius-button         | 8px
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🎨 색상 토큰 시스템

### 색상 팔레트 구조
```javascript
// 색상 토큰 정의
const colors = {
  // Core Palette (원시 색상)
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  
  // Semantic Tokens (의미 기반)
  semantic: {
    primary: '$blue-500',
    secondary: '$gray-600',
    success: '$green-500',
    warning: '$yellow-500',
    error: '$red-500',
    info: '$blue-400',
  },
  
  // Surface Tokens (표면 색상)
  surface: {
    background: '$gray-50',
    foreground: '$white',
    border: '$gray-200',
    divider: '$gray-100',
  }
};
```

### 다크모드 토큰 전략
```javascript
// 테마별 토큰 매핑
const themes = {
  light: {
    // 배경색
    'bg-primary': '#FFFFFF',
    'bg-secondary': '#F5F5F5',
    'bg-tertiary': '#E5E5E5',
    
    // 텍스트색
    'text-primary': '#171717',
    'text-secondary': '#525252',
    'text-tertiary': '#737373',
    
    // 기능색
    'border-default': '#D4D4D4',
    'shadow-color': 'rgba(0,0,0,0.1)',
  },
  
  dark: {
    // 배경색 (반전)
    'bg-primary': '#171717',
    'bg-secondary': '#262626',
    'bg-tertiary': '#404040',
    
    // 텍스트색 (반전)
    'text-primary': '#FAFAFA',
    'text-secondary': '#A3A3A3',
    'text-tertiary': '#737373',
    
    // 기능색
    'border-default': '#525252',
    'shadow-color': 'rgba(0,0,0,0.5)',
  }
};
```

## 📏 타이포그래피 토큰

### 타입 스케일 시스템
```javascript
// 타이포그래피 토큰 정의
const typography = {
  // Font Families
  fontFamily: {
    sans: 'Inter, system-ui, sans-serif',
    serif: 'Georgia, serif',
    mono: 'JetBrains Mono, monospace',
  },
  
  // Type Scale (Minor Third - 1.2)
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  
  // Line Heights
  lineHeight: {
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
  // Font Weights
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  }
};
```

### 텍스트 스타일 조합
```javascript
// 컴포지트 텍스트 스타일
const textStyles = {
  // Headings
  h1: {
    fontSize: '$fontSize-5xl',
    lineHeight: '$lineHeight-tight',
    fontWeight: '$fontWeight-bold',
    letterSpacing: '$letterSpacing-tight',
  },
  
  h2: {
    fontSize: '$fontSize-4xl',
    lineHeight: '$lineHeight-tight',
    fontWeight: '$fontWeight-bold',
  },
  
  // Body
  body: {
    fontSize: '$fontSize-base',
    lineHeight: '$lineHeight-normal',
    fontWeight: '$fontWeight-regular',
  },
  
  // UI Elements
  button: {
    fontSize: '$fontSize-sm',
    lineHeight: '$lineHeight-normal',
    fontWeight: '$fontWeight-medium',
    letterSpacing: '$letterSpacing-wide',
    textTransform: 'uppercase',
  },
  
  caption: {
    fontSize: '$fontSize-xs',
    lineHeight: '$lineHeight-normal',
    fontWeight: '$fontWeight-regular',
  }
};
```

## 📐 스페이싱 토큰

### 8px 그리드 시스템
```javascript
// 스페이싱 토큰 정의
const spacing = {
  // Base unit = 8px
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
  32: '8rem',    // 128px
  
  // Semantic spacing
  xs: '$spacing-1',
  sm: '$spacing-2',
  md: '$spacing-4',
  lg: '$spacing-6',
  xl: '$spacing-8',
  '2xl': '$spacing-12',
};

// 컴포넌트별 스페이싱
const componentSpacing = {
  button: {
    paddingX: '$spacing-4',
    paddingY: '$spacing-2',
  },
  
  card: {
    padding: '$spacing-6',
    gap: '$spacing-4',
  },
  
  section: {
    marginBottom: '$spacing-16',
    paddingY: '$spacing-12',
  }
};
```

## 🌈 실전 구현: Figma to Code

### Figma 토큰 플러그인 설정
```javascript
// Figma Tokens 플러그인 설정
{
  "global": {
    // Core tokens
    "color": {
      "blue": {
        "100": { "value": "#DBEAFE" },
        "500": { "value": "#3B82F6" },
        "900": { "value": "#1E3A8A" }
      }
    },
    
    // Semantic tokens
    "primary": {
      "value": "{color.blue.500}",
      "type": "color"
    },
    
    // Component tokens
    "button": {
      "primary": {
        "bg": {
          "value": "{primary}",
          "type": "color"
        },
        "text": {
          "value": "#FFFFFF",
          "type": "color"
        }
      }
    }
  },
  
  // Theme sets
  "light": {
    "bg": {
      "default": {
        "value": "#FFFFFF",
        "type": "color"
      }
    }
  },
  
  "dark": {
    "bg": {
      "default": {
        "value": "#171717",
        "type": "color"
      }
    }
  }
}
```

### Style Dictionary 변환
```javascript
// build.js - 토큰 변환 설정
const StyleDictionary = require('style-dictionary');

StyleDictionary.extend({
  source: ['tokens/**/*.json'],
  platforms: {
    // CSS 변수 출력
    css: {
      transformGroup: 'css',
      buildPath: 'dist/css/',
      files: [{
        destination: 'tokens.css',
        format: 'css/variables',
        options: {
          outputReferences: true
        }
      }]
    },
    
    // JavaScript 출력
    js: {
      transformGroup: 'js',
      buildPath: 'dist/js/',
      files: [{
        destination: 'tokens.js',
        format: 'javascript/es6'
      }]
    },
    
    // iOS Swift 출력
    ios: {
      transformGroup: 'ios',
      buildPath: 'dist/ios/',
      files: [{
        destination: 'Tokens.swift',
        format: 'ios/swift/class',
        className: 'DesignTokens'
      }]
    },
    
    // Android 출력
    android: {
      transformGroup: 'android',
      buildPath: 'dist/android/',
      files: [{
        destination: 'tokens.xml',
        format: 'android/resources'
      }]
    }
  }
}).buildAllPlatforms();
```

### 실제 사용 예시
```css
/* 생성된 CSS 변수 */
:root {
  /* Colors */
  --color-primary: #3B82F6;
  --color-secondary: #737373;
  
  /* Typography */
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --line-height-normal: 1.5;
  
  /* Spacing */
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
}

/* 다크모드 */
[data-theme="dark"] {
  --color-primary: #60A5FA;
  --bg-primary: #171717;
  --text-primary: #FAFAFA;
}

/* 컴포넌트에서 사용 */
.button {
  background: var(--color-primary);
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-base);
  border-radius: var(--radius-md);
}
```

## 🔄 토큰 워크플로우

### 디자인에서 개발까지
```
📋 토큰 파이프라인

1. Design (Figma)
   ↓ Figma Tokens 플러그인
2. Tokens (JSON)
   ↓ Style Dictionary
3. Platform Files
   ├── tokens.css
   ├── tokens.js
   ├── tokens.swift
   └── tokens.xml
   ↓ CI/CD
4. Production
   └── 자동 배포
```

### GitHub Actions 자동화
```yaml
# .github/workflows/design-tokens.yml
name: Build Design Tokens

on:
  push:
    paths:
      - 'tokens/**'
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build tokens
        run: npm run build-tokens
      
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add -A
          git commit -m "🎨 Update design tokens" || true
      
      - name: Push changes
        uses: ad-m/github-push-action@master
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

## 🎯 컴포넌트 토큰 실전

### 버튼 컴포넌트 토큰
```javascript
// Button 토큰 정의
const buttonTokens = {
  // Sizes
  size: {
    sm: {
      height: '32px',
      paddingX: '$spacing-3',
      fontSize: '$fontSize-sm',
    },
    md: {
      height: '40px',
      paddingX: '$spacing-4',
      fontSize: '$fontSize-base',
    },
    lg: {
      height: '48px',
      paddingX: '$spacing-6',
      fontSize: '$fontSize-lg',
    }
  },
  
  // Variants
  variant: {
    primary: {
      background: '$color-primary',
      color: 'white',
      border: 'none',
      hover: {
        background: '$color-primary-dark',
      }
    },
    secondary: {
      background: 'transparent',
      color: '$color-primary',
      border: '1px solid $color-primary',
      hover: {
        background: '$color-primary-light',
      }
    },
    ghost: {
      background: 'transparent',
      color: '$text-secondary',
      border: 'none',
      hover: {
        background: '$bg-hover',
      }
    }
  }
};
```

### 카드 컴포넌트 토큰
```javascript
// Card 토큰 정의
const cardTokens = {
  base: {
    padding: '$spacing-6',
    borderRadius: '$radius-lg',
    background: '$bg-surface',
    border: '1px solid $border-default',
  },
  
  elevation: {
    flat: {
      boxShadow: 'none',
    },
    raised: {
      boxShadow: '$shadow-sm',
    },
    floating: {
      boxShadow: '$shadow-md',
    }
  },
  
  interactive: {
    hover: {
      transform: 'translateY(-2px)',
      boxShadow: '$shadow-lg',
      transition: 'all $duration-normal $easing-out',
    }
  }
};
```

## 🌍 멀티 브랜드 전략

### 브랜드별 토큰 관리
```javascript
// 멀티 브랜드 토큰 구조
const brands = {
  // Brand A
  brandA: {
    color: {
      primary: '#007AFF',
      secondary: '#5856D6',
    },
    font: {
      family: 'SF Pro Display',
    },
    radius: {
      default: '12px',
    }
  },
  
  // Brand B
  brandB: {
    color: {
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
    },
    font: {
      family: 'Roboto',
    },
    radius: {
      default: '4px',
    }
  },
  
  // Brand C (미니멀)
  brandC: {
    color: {
      primary: '#000000',
      secondary: '#666666',
    },
    font: {
      family: 'Helvetica Neue',
    },
    radius: {
      default: '0px',
    }
  }
};
```

## 📱 반응형 토큰

### 브레이크포인트 토큰
```javascript
// 반응형 토큰 시스템
const responsive = {
  screens: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // 반응형 타이포그래피
  fontSize: {
    heading: {
      base: '1.5rem',
      md: '2rem',
      lg: '2.5rem',
      xl: '3rem',
    },
    body: {
      base: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
    }
  },
  
  // 반응형 스페이싱
  spacing: {
    section: {
      base: '$spacing-8',
      md: '$spacing-12',
      lg: '$spacing-16',
      xl: '$spacing-20',
    }
  }
};
```

## 🔍 토큰 문서화

### 자동 문서 생성
```javascript
// 토큰 문서 생성 스크립트
const generateDocs = (tokens) => {
  return `
# Design Token Documentation

## Color Palette

${Object.entries(tokens.color).map(([name, value]) => `
### ${name}
- Value: \`${value}\`
- Usage: ${getUsageDescription(name)}
- Example: <div style="background: ${value}; width: 50px; height: 50px;"></div>
`).join('\n')}

## Typography Scale

${Object.entries(tokens.fontSize).map(([name, value]) => `
- **${name}**: ${value} (${pxValue(value)})
`).join('\n')}

## Spacing System

${Object.entries(tokens.spacing).map(([name, value]) => `
- **${name}**: ${value} (${pxValue(value)})
`).join('\n')}
  `;
};
```

## 💡 베스트 프랙티스

### 토큰 네이밍 규칙
```
✅ 좋은 네이밍
• color-primary
• spacing-medium
• font-size-body
• shadow-card
• radius-button

❌ 나쁜 네이밍
• blue
• 16px
• big-text
• shadow1
• rounded
```

### 토큰 관리 원칙
```
📋 토큰 관리 10계명

1. 의미 있는 이름 사용
2. 일관된 네이밍 규칙
3. 과도한 토큰 생성 자제
4. 문서화 필수
5. 버전 관리
6. 팀 전체 교육
7. 정기적 리뷰
8. 자동화 구축
9. 플랫폼 독립적 설계
10. 점진적 도입
```

## 📚 추가 학습 자료

### 도구 및 리소스
- [Figma Tokens](https://www.figma.com/community/plugin/843461159747178978)
- [Style Dictionary](https://amzn.github.io/style-dictionary/)
- [Design Tokens W3C](https://www.w3.org/community/design-tokens/)
- [Theo by Salesforce](https://github.com/salesforce-ux/theo)

### 실습 프로젝트
1. 기본 색상 토큰 시스템 구축
2. 다크모드 토큰 매핑
3. Figma to Code 파이프라인 구축

## 💡 핵심 정리

> "디자인 토큰은 디자인과 개발의 공통 언어다"

1. **단일 진실 공급원**: 한 곳에서 관리, 모든 곳에서 사용
2. **자동화가 핵심**: 수동 작업 최소화
3. **의미 중심 네이밍**: blue-500보다 primary가 낫다
4. **점진적 도입**: 색상부터 시작해서 확장
5. **팀 교육 필수**: 모두가 이해하고 사용해야 성공

디자인 토큰은 단순한 변수가 아니라 디자인 시스템의 기초입니다. 잘 구축된 토큰 시스템은 일관성, 확장성, 효율성을 모두 잡을 수 있게 해줍니다!