# Episode 7-6: 빌드와 컴파일의 차이점

## 🎬 Scene: 빌드 실패의 공포

```
[스타트업 사무실, 금요일 오후 4시]

PM: "5시까지 배포해야 하는데 준비됐나요?"

주니어 개발자: "코드는 다 짰어요! 컴파일 중입니다."

[5분 후]

주니어: "컴파일은 성공했는데... 빌드가 실패했어요. 😰"

디자이너: "컴파일 성공했는데 빌드는 왜 실패해요? 
          같은 거 아니에요?"

시니어 개발자: "컴파일은 재료 손질이고, 
               빌드는 요리 완성이에요."

PM: "그럼 언제 끝나요?"

시니어: "의존성 문제네요. 라이브러리 버전이..."

[2시간 후]

시니어: "해결했습니다! 근데 테스트가 실패해서..."

PM: "테스트도 빌드에 포함이에요?"

시니어: "네, 빌드는 '배포 가능한 상태'를 만드는 
        모든 과정이니까요."

디자이너: "그럼 제가 에셋 하나만 바꿔도...?"

개발자들: "다시 빌드... 😭"

[밤 9시, 드디어 빌드 성공]

Warning: 빌드는 언제나 금요일 오후에 실패한다
```

**컴파일 1분, 빌드 1시간. 이것이 현실입니다.**

## Part 1: 컴파일과 빌드의 정확한 차이

### 🔄 전체 프로세스 이해하기

```
개발 프로세스 전체 흐름:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 코딩 (Writing)
   ├── 소스 코드 작성
   ├── 리소스 준비 (이미지, 설정)
   └── 문서 작성

2. 컴파일 (Compile) - 번역
   ├── 문법 검사 (Syntax Check)
   ├── 타입 검사 (Type Check)
   ├── 최적화 (Optimization)
   └── 중간 코드 생성 (Object File)

3. 링킹 (Linking) - 연결
   ├── 객체 파일 결합
   ├── 라이브러리 연결
   └── 심볼 해결

4. 빌드 (Build) - 전체 과정
   ├── 컴파일
   ├── 링킹
   ├── 리소스 번들링
   ├── 테스트 실행
   ├── 문서 생성
   └── 패키징

5. 배포 (Deploy)
   └── 최종 산출물 배포

컴파일 ⊂ 빌드 ⊂ CI/CD
```

### 🎯 구체적인 예시로 이해하기

```javascript
// JavaScript/React 프로젝트

// 1. 원본 코드 (TypeScript)
// Button.tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
  return <button onClick={onClick}>{label}</button>;
};

// 2. 컴파일 (TypeScript → JavaScript)
// tsc Button.tsx → Button.js
const Button = ({ label, onClick }) => {
  return React.createElement('button', { onClick }, label);
};

// 3. 빌드 프로세스 (npm run build)
┌─────────────────────────────────┐
│  1. Clean (이전 빌드 삭제)      │
│     rm -rf dist/                │
├─────────────────────────────────┤
│  2. Compile (TS → JS)           │
│     tsc --project tsconfig.json │
├─────────────────────────────────┤
│  3. Bundle (파일 합치기)        │
│     webpack --mode production   │
├─────────────────────────────────┤
│  4. Optimize (최적화)           │
│     - Tree Shaking             │
│     - Minification             │
│     - Code Splitting           │
├─────────────────────────────────┤
│  5. Assets (리소스 처리)        │
│     - 이미지 압축              │
│     - CSS 번들링               │
│     - 폰트 최적화              │
├─────────────────────────────────┤
│  6. Test (테스트 실행)          │
│     jest --coverage            │
├─────────────────────────────────┤
│  7. Generate (문서 생성)        │
│     - Source Map               │
│     - Type Definitions         │
└─────────────────────────────────┘

최종 산출물:
dist/
├── index.html
├── main.js (500KB)
├── vendor.js (200KB)
├── styles.css (50KB)
└── assets/
    ├── images/
    └── fonts/
```

## Part 2: 각 언어별 빌드 시스템

### ☕ Java의 빌드 과정

```java
// Java 빌드 프로세스

// 1. 소스 코드
// HelloWorld.java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}

// 2. 컴파일 (javac)
$ javac HelloWorld.java
→ HelloWorld.class (바이트코드)

// 3. 빌드 도구별 차이

// Maven (pom.xml)
<project>
  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-compiler-plugin</artifactId>
        <configuration>
          <source>17</source>
          <target>17</target>
        </configuration>
      </plugin>
    </plugins>
  </build>
</project>

$ mvn clean install
├── Clean: target/ 폴더 삭제
├── Compile: .java → .class
├── Test: 단위 테스트 실행
├── Package: JAR/WAR 생성
└── Install: 로컬 저장소에 설치

// Gradle (build.gradle)
plugins {
    id 'java'
    id 'application'
}

tasks.build {
    dependsOn 'clean'
    dependsOn 'compileJava'
    dependsOn 'test'
    dependsOn 'jar'
}

$ gradle build
├── :clean
├── :compileJava (컴파일)
├── :processResources
├── :classes
├── :jar (패키징)
├── :assemble
├── :compileTestJava
├── :test (테스트)
└── :build

빌드 시간 비교:
Hello World: 2초
중형 프로젝트 (1만 줄): 30초
대형 프로젝트 (10만 줄): 5분
```

### 🦀 C++의 복잡한 빌드

```cpp
// C++ 빌드 프로세스

// 1. 헤더 파일
// math.h
#ifndef MATH_H
#define MATH_H
int add(int a, int b);
#endif

// 2. 구현 파일
// math.cpp
#include "math.h"
int add(int a, int b) {
    return a + b;
}

// 3. 메인 파일
// main.cpp
#include <iostream>
#include "math.h"

int main() {
    std::cout << add(2, 3) << std::endl;
    return 0;
}

// 4. Makefile
CXX = g++
CXXFLAGS = -Wall -O2 -std=c++17
OBJS = main.o math.o
TARGET = calculator

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CXX) $(OBJS) -o $(TARGET)  # 링킹

main.o: main.cpp math.h
	$(CXX) $(CXXFLAGS) -c main.cpp  # 컴파일

math.o: math.cpp math.h
	$(CXX) $(CXXFLAGS) -c math.cpp  # 컴파일

clean:
	rm -f $(OBJS) $(TARGET)

// 5. 빌드 실행
$ make clean  # 이전 빌드 정리
$ make        # 빌드 실행

컴파일 단계:
main.cpp → main.o (2초)
math.cpp → math.o (1초)

링킹 단계:
main.o + math.o → calculator (1초)

전체: 4초

하지만 대형 프로젝트는...
Chrome 브라우저 빌드: 2-4시간
Windows OS 빌드: 8-12시간
```

### 🐍 Python은 빌드가 없다?

```python
# Python "빌드" 프로세스

# 1. 순수 Python (인터프리터)
# app.py
def main():
    print("Hello, World!")

if __name__ == "__main__":
    main()

# 실행: 빌드 없음!
$ python app.py

# 2. 하지만 배포할 때는?

# requirements.txt
flask==2.0.1
numpy==1.21.0
pandas==1.3.0

# 가상 환경 설정 (빌드와 유사)
$ python -m venv venv
$ source venv/bin/activate
$ pip install -r requirements.txt

# 3. 실행 파일로 만들기 (PyInstaller)
$ pyinstaller --onefile app.py

빌드 과정:
1. 의존성 분석
2. 바이트코드 컴파일 (.pyc)
3. 번들링 (Python 인터프리터 포함)
4. 실행 파일 생성

결과:
dist/app (50MB) - Python 없어도 실행 가능

# 4. Docker 이미지 빌드
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]

$ docker build -t myapp .
├── Base 이미지 다운로드
├── 의존성 설치
├── 소스 코드 복사
└── 이미지 생성 (500MB)
```

## Part 3: 현대적 빌드 시스템

### 🚀 CI/CD 파이프라인

```yaml
# GitHub Actions 예시
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    # 1. 코드 체크아웃
    - uses: actions/checkout@v2
    
    # 2. 환경 설정
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        cache: 'npm'
    
    # 3. 의존성 설치
    - name: Install Dependencies
      run: npm ci  # clean install
    
    # 4. 린트 (코드 스타일 검사)
    - name: Lint
      run: npm run lint
    
    # 5. 컴파일 (TypeScript)
    - name: Compile
      run: npm run compile
    
    # 6. 테스트
    - name: Test
      run: npm run test:coverage
    
    # 7. 빌드
    - name: Build
      run: npm run build
      env:
        NODE_ENV: production
    
    # 8. 빌드 산출물 업로드
    - name: Upload Artifacts
      uses: actions/upload-artifact@v2
      with:
        name: build-files
        path: dist/
    
    # 9. 배포
    - name: Deploy
      if: success()
      run: |
        aws s3 sync dist/ s3://my-bucket
        aws cloudfront create-invalidation

빌드 시간 분석:
━━━━━━━━━━━━━━━━━━━━━━━━━
체크아웃:        5초
환경 설정:      10초
의존성 설치:   1분 30초
린트:          20초
컴파일:        45초
테스트:       2분
빌드:         1분 30초
배포:          30초
━━━━━━━━━━━━━━━━━━━━━━━━━
총:           6분 50초
```

### 🏗️ 빌드 최적화 전략

```javascript
// 빌드 시간 단축 방법

// 1. 캐싱 활용
// package-lock.json 해시로 캐시 키 생성
- uses: actions/cache@v2
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

// 2. 병렬 처리
// webpack.config.js
module.exports = {
  parallel: true,  // 병렬 컴파일
  cache: {
    type: 'filesystem',  // 파일시스템 캐시
  }
};

// 3. 증분 빌드 (Incremental Build)
// tsconfig.json
{
  "compilerOptions": {
    "incremental": true,  // 변경된 파일만 컴파일
    "tsBuildInfoFile": ".tsbuildinfo"
  }
}

// 4. 빌드 분석
$ npm run build -- --analyze

Bundle Analyzer:
┌────────────────────────────┐
│ main.js (200KB)            │
│ ├── components (50KB)      │
│ ├── utils (30KB)           │
│ └── business logic (120KB) │
│                            │
│ vendor.js (800KB)          │
│ ├── react (130KB)          │
│ ├── lodash (70KB)          │
│ └── other libs (600KB)     │
└────────────────────────────┘

최적화 전후:
              Before   After
━━━━━━━━━━━━━━━━━━━━━━━━━━━
빌드 시간      5분      2분
번들 크기      3MB     1.2MB
캐시 히트율    0%      85%
```

## Part 4: 빌드 실패와 해결

### ❌ 흔한 빌드 실패 원인

```bash
# 1. 의존성 충돌
npm ERR! peer dep missing: react@^17.0.0, required by some-package@2.0.0
npm ERR! Found: react@18.0.0

해결:
$ npm install react@17.0.0
또는
$ npm install --force

# 2. 환경 변수 누락
Error: REACT_APP_API_URL is not defined

해결:
$ echo "REACT_APP_API_URL=https://api.example.com" > .env
$ npm run build

# 3. 메모리 부족
FATAL ERROR: Reached heap limit Allocation failed

해결:
$ NODE_OPTIONS="--max-old-space-size=4096" npm run build

# 4. 타입 에러 (TypeScript)
TS2322: Type 'string' is not assignable to type 'number'

해결: 코드 수정 필요

# 5. 테스트 실패
Test Suites: 1 failed, 4 passed
npm ERR! Test failed

해결:
$ npm run test -- --updateSnapshot
또는 테스트 코드 수정
```

### 🔧 디버깅 팁

```javascript
// 빌드 디버깅 전략

// 1. Verbose 모드
$ npm run build --verbose
// 상세한 로그 출력

// 2. 단계별 실행
$ npm run clean
$ npm run compile
$ npm run bundle
$ npm run optimize
// 어느 단계에서 실패하는지 확인

// 3. 로컬 vs CI 환경 차이
// CI 환경 재현
$ docker run -it node:18 bash
$ git clone repo
$ npm ci
$ npm run build

// 4. 의존성 트리 확인
$ npm ls
$ npm ls react  // 특정 패키지

// 5. 빌드 캐시 초기화
$ rm -rf node_modules package-lock.json
$ npm install
$ npm run build
```

## Part 5: 디자이너와 빌드

### 🎨 디자인 에셋과 빌드

```javascript
// 디자인 리소스가 빌드에 미치는 영향

// 1. 이미지 최적화
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: { quality: 65 },
              pngquant: { quality: [0.65, 0.90] },
              webp: { quality: 75 }
            }
          }
        ]
      }
    ]
  }
};

빌드 전후:
hero.png: 2MB → 200KB (90% 감소)
icons.svg: 100KB → 20KB (80% 감소)
전체 빌드 시간: -30초

// 2. 폰트 서브셋
// 한글 2350자만 포함
$ pip install fonttools
$ pyftsubset NotoSansKR.otf \
  --text-file=korean-chars.txt \
  --output-file=NotoSansKR-subset.woff2

결과:
원본: 11MB
서브셋: 600KB
절감: 95%

// 3. CSS 최적화
// PostCSS 설정
module.exports = {
  plugins: [
    require('autoprefixer'),  // 벤더 프리픽스
    require('cssnano'),       // 압축
    require('purgecss')       // 미사용 CSS 제거
  ]
};

PurgeCSS 결과:
Bootstrap 전체: 150KB
실제 사용: 12KB
절감: 92%
```

### 🚨 디자이너가 조심해야 할 것

```
빌드에 영향을 주는 디자인 결정:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 대용량 에셋
❌ 4K 배경 이미지 (5MB)
✅ 최적화된 WebP (500KB)
영향: 빌드 시간 +1분, 번들 크기 +4.5MB

2. 과도한 폰트
❌ 폰트 10종 전체 (50MB)
✅ Variable Font 1종 (2MB)
영향: 빌드 시간 +2분, 초기 로딩 +3초

3. 복잡한 애니메이션
❌ After Effects → Lottie (1MB)
✅ CSS 애니메이션 (5KB)
영향: 번들 크기 +995KB

4. 아이콘 시스템
❌ 아이콘 폰트 전체 (2MB)
✅ 사용하는 SVG만 (50KB)
영향: Tree Shaking 가능 여부

5. 컴포넌트 변형
❌ 버튼 스타일 100가지
✅ 기본 + 변형 조합
영향: CSS 크기, 빌드 복잡도
```

## 🎁 Bonus: 빌드 시간 벤치마크

### ⏱️ 실제 프로젝트 빌드 시간

```
오픈소스 프로젝트 빌드 시간:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

프로젝트         언어        첫 빌드   증분 빌드
────────────────────────────────────────────
React           JavaScript   3분       10초
Vue.js          JavaScript   2분       8초
Angular         TypeScript   5분       15초
Django          Python       0초       0초
Rails           Ruby         1분       5초
Spring Boot     Java         2분       10초
Express         JavaScript   5초       2초
Flutter         Dart         3분       20초
React Native    JavaScript   5분       30초
Electron (VSCode) TypeScript 15분      1분
Chrome          C++          2시간     5분
Linux Kernel    C            4시간     10분

팩터별 영향:
코드 크기: 70%
의존성 수: 20%
빌드 설정: 10%
```

## 💡 핵심 메시지

> "컴파일은 번역, 빌드는 출판입니다.
> 
> 책을 만들 때 원고를 번역(컴파일)하는 것과
> 편집, 디자인, 인쇄, 제본까지 완성(빌드)하는 것의 차이죠.
> 
> 디자이너로서 이를 이해하면
> '왜 작은 수정에도 시간이 걸리는지'
> '왜 금요일 오후 배포를 피하는지' 알 수 있습니다."

**기억하세요:**
- 컴파일 성공 ≠ 빌드 성공
- 빌드는 팀 전체의 작업 결과
- 빌드 시간 = 개발 생산성
- 작은 변경도 전체 빌드에 영향

## 🚀 다음 에피소드 예고

**"Episode 7-7: 버그는 어떻게 찾고 고치나요?"**

디버깅의 세계:
- 버그의 종류와 원인
- 디버깅 도구와 기법
- 로그 읽는 방법
- QA와 개발자의 협업

"버그 없는 소프트웨어는 없습니다"

---

*"It works on my machine"*
*- Every developer ever*

**#Build #Compile #CI/CD #DevOps #Automation**