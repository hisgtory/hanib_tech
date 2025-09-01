# Episode 7-5: .exe 파일은 왜 Mac에서 안 돌아가나요?

## 🎬 Scene: 플랫폼 호환성의 악몽

```
[에이전시 사무실, 수요일 오전]

클라이언트: "우리 프로그램 Mac에서도 되죠?"

Windows 개발자: "아... Windows용으로 개발했는데요."

클라이언트: "디자이너들은 다 Mac 쓰는데?"

디자이너: "그냥 .exe 파일 실행하면 안 되나요?"

개발자: "Mac에서 .exe는... 한국어 책을 일본 사람이 
        읽으려는 것과 같아요."

PM: "그럼 처음부터 다시 개발해야 해요?"

시니어 개발자: "아니요, 방법이 있습니다. 
               처음부터 크로스 플랫폼을 고려했어야 했지만..."

[2주 후 - Electron으로 재개발]

디자이너: "앱이 왜 이렇게 무거워졌죠? 300MB?"

개발자: "Chrome 브라우저를 통째로 넣은 거라..."

디자이너: "네이티브 앱처럼 만들 순 없나요?"

개발자: "그럼 Swift로 Mac용, C#으로 Windows용, 
        각각 만들어야 해요."

PM: "예산이 2배로...? 😱"

교훈: Write Once, Debug Everywhere
```

**한 번 만들어 모든 곳에서 실행? 현실은 그리 간단하지 않습니다.**

## Part 1: 왜 .exe가 Mac에서 안 돌아갈까?

### 🧬 실행 파일의 구조

```
Windows .exe 파일 구조:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PE Header (Portable Executable)
├── DOS Header ("MZ" 시그니처)
├── PE Signature ("PE\0\0")
├── File Header
│   └── Machine Type: x86-64
├── Optional Header
│   └── Windows Subsystem
└── Section Headers
    ├── .text (실행 코드)
    ├── .data (초기화된 데이터)
    └── .rsrc (리소스: 아이콘, 이미지)

macOS 실행 파일 구조:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mach-O (Mach Object)
├── Mach Header
│   └── CPU Type: ARM64 or x86-64
├── Load Commands
│   ├── LC_SEGMENT_64
│   ├── LC_DYLD_INFO
│   └── LC_MAIN
└── Segments
    ├── __TEXT (실행 코드)
    ├── __DATA (데이터)
    └── __LINKEDIT (링킹 정보)

완전히 다른 형식!
.exe → Windows가 이해하는 형식
.app → macOS가 이해하는 형식
```

### 🏗️ CPU 아키텍처의 차이

```
Intel/AMD (x86-64) vs Apple Silicon (ARM64)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

x86-64 명령어 (Intel/AMD):
MOV RAX, 1        ; 레지스터에 1 저장
ADD RAX, RBX      ; 더하기
JMP 0x1000        ; 주소로 점프

ARM64 명령어 (Apple M1/M2/M3):
MOV X0, #1        ; 레지스터에 1 저장
ADD X0, X0, X1    ; 더하기
B 0x1000          ; 주소로 분기

같은 작업, 완전히 다른 명령어!

실제 성능 차이:
작업              x86-64    ARM64 (M2)
───────────────────────────────────
컴파일 시간        100%      70%
배터리 소모        100%      40%
발열              높음       낮음
성능/와트         1x         2.5x
```

### 🔧 운영체제 API의 차이

```c
// 같은 작업, 다른 시스템 콜

// Windows - 파일 생성
HANDLE hFile = CreateFile(
    "test.txt",
    GENERIC_WRITE,
    0,
    NULL,
    CREATE_NEW,
    FILE_ATTRIBUTE_NORMAL,
    NULL
);
WriteFile(hFile, data, size, &written, NULL);
CloseHandle(hFile);

// macOS/Linux - 파일 생성
int fd = open("test.txt", O_CREAT | O_WRONLY, 0644);
write(fd, data, size);
close(fd);

// 창 만들기 차이
// Windows (Win32 API)
HWND hwnd = CreateWindow(
    "BUTTON",
    "Click Me",
    WS_VISIBLE | WS_CHILD,
    10, 10, 100, 30,
    hWndParent,
    NULL,
    hInstance,
    NULL
);

// macOS (Cocoa)
NSButton *button = [[NSButton alloc] 
    initWithFrame:NSMakeRect(10, 10, 100, 30)];
[button setTitle:@"Click Me"];
[parentView addSubview:button];
```

## Part 2: 크로스 플랫폼 솔루션들

### ☕ Java - Write Once, Run Anywhere?

```java
// Java의 크로스 플랫폼 전략

Source Code (.java)
    ↓ javac
Bytecode (.class)
    ↓
JVM (Java Virtual Machine)
    ├── Windows JVM → Windows 명령어
    ├── macOS JVM → macOS 명령어
    └── Linux JVM → Linux 명령어

장점:
✅ 한 번 컴파일, 모든 OS 실행
✅ 플랫폼 독립적
✅ 자동 메모리 관리

단점:
❌ JVM 설치 필요 (200MB+)
❌ 네이티브보다 느림
❌ 메모리 사용량 많음
❌ UI가 네이티브답지 않음

실제 사례:
- IntelliJ IDEA (개발 도구)
- Minecraft Java Edition
- 기업용 백엔드 시스템
```

### ⚛️ Electron - 웹 기술로 데스크톱 앱

```javascript
// Electron 앱 구조

Your App
├── Chromium (렌더링 엔진) ~50MB
├── Node.js (JavaScript 런타임) ~20MB
└── Your Code ~5MB
= 총 75MB+ (빈 앱도!)

// main.js - 메인 프로세스
const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });
  
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

// 장단점 비교
Electron 앱:
✅ 웹 개발자도 데스크톱 앱 개발 가능
✅ 한 코드베이스로 Windows/Mac/Linux
✅ 빠른 개발 속도
✅ 풍부한 npm 생태계

❌ 큰 용량 (최소 50MB+)
❌ 메모리 사용량 많음 (Chrome 기반)
❌ 네이티브보다 느린 성능
❌ 배터리 소모 많음

성공 사례:
- VS Code (300MB)
- Discord (150MB)
- Slack (200MB)
- Figma Desktop (100MB)
- Notion (150MB)
```

### 🦀 새로운 접근: Tauri (Rust 기반)

```rust
// Tauri - 가벼운 크로스 플랫폼

Electron vs Tauri:
                Electron    Tauri
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
번들 크기        50MB+      8MB
메모리 사용      300MB+     50MB
렌더링 엔진      Chromium   OS WebView
백엔드 언어      JavaScript  Rust
성능            보통        빠름
보안            보통        높음

// Tauri 앱 구조
Your App
├── OS WebView (이미 설치됨) 0MB
├── Rust Runtime ~3MB
└── Your Code ~5MB
= 총 8MB

단점:
- Rust 학습 곡선
- 생태계가 아직 작음
- WebView 제약사항
```

## Part 3: 플랫폼별 개발 전략

### 🎯 네이티브 vs 크로스 플랫폼

```
네이티브 개발:
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Windows → C# (.NET) / C++
├── 장점: 최고 성능, 작은 용량, OS 통합
└── 단점: Windows만 지원

macOS → Swift / Objective-C
├── 장점: 최고 성능, 네이티브 UI, 앱스토어
└── 단점: Mac만 지원, Mac 필요

Linux → C++ / GTK / Qt
├── 장점: 오픈소스, 커스터마이징
└── 단점: 파편화, 배포 어려움

크로스 플랫폼:
━━━━━━━━━━━━━━━━━━━━━━━━━━━

React Native (모바일 + 데스크톱)
Flutter (구글)
.NET MAUI (마이크로소프트)
Qt (C++)

선택 기준:
1. 타겟 사용자가 주로 쓰는 OS는?
2. 성능이 중요한가? UI가 중요한가?
3. 개발 기간과 예산은?
4. 유지보수는 누가?
```

### 📱 모바일까지 고려한다면?

```javascript
// 플랫폼 매트릭스

플랫폼 지원 범위:
             Web  iOS  Android  Win  Mac  Linux
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Native        ❌   ✅    ✅      ✅   ✅    ✅
React Native  ❌   ✅    ✅      🔺   🔺    ❌
Flutter       🔺   ✅    ✅      ✅   ✅    ✅
Electron      ❌   ❌    ❌      ✅   ✅    ✅
PWA           ✅   🔺    🔺      🔺   🔺    🔺
Tauri         ❌   ❌    ❌      ✅   ✅    ✅

✅ = 완벽 지원
🔺 = 부분 지원
❌ = 미지원

코드 재사용률:
Native: 0% (각 플랫폼 별도)
React Native: 70-90%
Flutter: 80-95%
Electron/Tauri: 95-99%
PWA: 100%
```

## Part 4: 실제 사례와 해결책

### 💼 기업들의 선택

```
Adobe Creative Suite:
━━━━━━━━━━━━━━━━━━━━━
Before: 각 OS별 네이티브 (C++)
After: CEP (Common Extensibility Platform)
- 핵심: C++ (성능)
- UI: Web 기술 (HTML/JS)
- 플러그인: JavaScript

Microsoft Office:
━━━━━━━━━━━━━━━━━━━━━
Windows: 네이티브 Win32/UWP
Mac: 네이티브 Cocoa
Web: Office 365 (웹 기술)
Mobile: 각 플랫폼 네이티브

결과: 3개 코드베이스 유지
비용: 막대하지만 최고 품질

Spotify:
━━━━━━━━━━━━━━━━━━━━━
Desktop: Chromium Embedded Framework
Mobile: 네이티브 (Swift/Kotlin)
Web: React
Backend: 공통 (Python/Java)

Figma:
━━━━━━━━━━━━━━━━━━━━━
Web: WebAssembly + Canvas
Desktop: Electron (웹 래핑)
- 핵심 엔진: C++ → WASM
- UI: React
- 실시간 협업: WebSocket

VS Code:
━━━━━━━━━━━━━━━━━━━━━
Electron 성공 사례
- Monaco Editor: TypeScript
- 확장: JavaScript
- 성능 최적화: 레이지 로딩
```

### 🛠️ 개발자 도구와 플랫폼

```bash
# 크로스 플랫폼 빌드 예시

# Electron - package.json
{
  "scripts": {
    "build-win": "electron-builder --win",
    "build-mac": "electron-builder --mac",
    "build-linux": "electron-builder --linux"
  }
}

# 빌드 결과
dist/
├── MyApp-1.0.0.dmg          # Mac (80MB)
├── MyApp Setup 1.0.0.exe    # Windows (75MB)
└── MyApp-1.0.0.AppImage     # Linux (82MB)

# 네이티브 빌드는 각 OS에서
# Windows → Visual Studio
# Mac → Xcode
# Linux → GCC/Make
```

## Part 5: 디자이너가 알아야 할 플랫폼 차이

### 🎨 OS별 디자인 가이드라인

```
Windows 11 (Fluent Design):
━━━━━━━━━━━━━━━━━━━━━━━━━━
- 둥근 모서리 (8px)
- Acrylic 투명 효과
- 다크/라이트 모드
- 스냅 레이아웃
- 컨텍스트 메뉴 스타일

macOS (Human Interface):
━━━━━━━━━━━━━━━━━━━━━━━━━━
- 둥근 모서리 (6-10px)
- 반투명/블러 효과
- 신호등 버튼 (닫기/최소화/최대화)
- 메뉴바 통합
- SF 시스템 폰트

디자인 차이점:
              Windows         macOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
버튼 위치      우측 상단       좌측 상단
기본 폰트      Segoe UI       SF Pro
메뉴 위치      앱 내부        상단 메뉴바
단축키         Ctrl+C         Cmd+C
창 관리        스냅/태스크바   Mission Control
알림           액션 센터       알림 센터

크로스 플랫폼 앱의 딜레마:
1. 각 OS 가이드라인 따르기 (2배 작업)
2. 독자적 디자인 (일관성 vs 이질감)
3. 웹 스타일 (중립적이지만 네이티브답지 않음)
```

### 🚀 미래: 진정한 크로스 플랫폼

```
WebAssembly (WASM):
━━━━━━━━━━━━━━━━━━━━━━━
모든 언어 → WASM → 모든 브라우저

C++ → WASM
Rust → WASM  → Chrome/Safari/Firefox
Go → WASM

예시:
- Photoshop Web (C++ → WASM)
- Figma (C++ → WASM)
- AutoCAD Web (C++ → WASM)

Progressive Web Apps (PWA):
━━━━━━━━━━━━━━━━━━━━━━━━━
웹앱이지만 네이티브처럼

✅ 오프라인 작동
✅ 푸시 알림
✅ 홈 화면 설치
✅ 파일 시스템 접근
✅ 하드웨어 접근 (카메라, GPS)

성공 사례:
- Twitter PWA
- Pinterest PWA
- Starbucks PWA

Project Reunion (Windows App SDK):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Win32 + UWP + .NET 통합
한 번 작성 → 모든 Windows
```

## 🎁 Bonus: 플랫폼 에뮬레이션

### 🔄 다른 OS 앱 실행하기

```bash
# Mac에서 Windows 앱 실행

1. Parallels/VMware (가상머신)
   - 전체 Windows OS 실행
   - 리소스 많이 사용 (RAM 8GB+)
   - 거의 모든 앱 실행 가능

2. Wine (호환 레이어)
   - Windows API를 macOS API로 변환
   - 가볍고 빠름
   - 일부 앱만 지원

3. CrossOver (Wine 상용 버전)
   - 쉬운 설치
   - 더 많은 앱 지원
   - 유료

4. Boot Camp (Intel Mac만)
   - 네이티브 Windows 설치
   - 최고 성능
   - 재부팅 필요

# Windows에서 Mac 앱?
- 거의 불가능 (macOS 라이선스)
- Hackintosh (불법)
- macOS VM (느림)

# 개발자들의 선택
Docker: 개발 환경 통일
VM: 테스트용
CI/CD: 자동 빌드/배포
```

## 💡 핵심 메시지

> ".exe가 Mac에서 안 돌아가는 것은
> 한국 콘센트에 미국 플러그를 꽂으려는 것과 같습니다.
> 
> 변환 어댑터(Electron, Wine)를 쓸 수도 있고
> 범용 플러그(Java, Web)를 쓸 수도 있죠.
> 
> 디자이너로서 이를 이해하면
> '왜 모든 OS를 지원하는 게 어려운지'
> '왜 Mac 버전이 따로 필요한지' 알 수 있습니다."

**기억하세요:**
- 플랫폼 = 언어 + 문화
- 크로스 플랫폼 = 트레이드오프
- 완벽한 솔루션은 없다
- 사용자를 먼저 생각하라

## 🚀 다음 에피소드 예고

**"Episode 7-6: 오픈소스는 공짜인데 왜 기업은 돈을 낼까?"**

오픈소스의 경제학:
- 무료 vs 자유
- 라이선스의 종류와 의미
- 기업의 오픈소스 전략
- 개발자는 왜 공짜로 일할까?

"오픈소스를 이해하면 IT 생태계가 보입니다"

---

*"The best code is no code at all."*
*"The second best is code that runs everywhere."*

**#CrossPlatform #Windows #macOS #Electron #Native**