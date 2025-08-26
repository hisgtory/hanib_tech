# Episode 7-5. .exe 파일은 왜 Mac에서 안 돌아가나요?

Windows 프로그램(.exe)을 Mac에서 실행하려고 했다가 안 된 경험, 있으실 텐데요. 왜 그럴까요?

## 🏗️ CPU 아키텍처의 차이

컴퓨터는 서로 다른 "언어"를 사용합니다:

### x86-64 (Intel/AMD)
- 대부분의 Windows PC
- 일부 Mac (2020년 이전)

### ARM64 (Apple Silicon) 
- M1, M2, M3 Mac
- 대부분의 스마트폰

<callout>
🗣️ **언어로 비유하면**
.exe는 "영어"로 쓰인 책이고, Mac은 "프랑스어"만 읽을 수 있는 사람입니다. 번역기(에뮬레이터) 없이는 이해할 수 없죠.
</callout>

## 💻 운영체제별 시스템 콜

같은 작업도 OS마다 다르게 처리합니다:

**파일 열기**
- Windows: `CreateFile()` 
- macOS: `open()`
- Linux: `open()`

**메모리 할당**
- Windows: `VirtualAlloc()`
- Unix 계열: `mmap()`

## 🔄 크로스 플랫폼 솔루션들

### 1. 가상머신 (Java, C#)
```java
// Write Once, Run Anywhere
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

### 2. 웹 기술 (Electron)
- Discord, Slack, VS Code
- HTML/CSS/JavaScript로 개발
- 모든 OS에서 동일하게 작동

### 3. 컨테이너화 (Docker)
- 앱과 실행 환경을 함께 패키징
- "내 컴퓨터에서는 잘 되는데" 문제 해결

<hl>개발자들은 한 번 개발해서 모든 플랫폼에서 실행되기를 꿈꿉니다!</hl>

## 🚀 미래의 해결책

- **WebAssembly**: 웹 브라우저에서 네이티브 성능
- **Progressive Web Apps**: 웹앱이지만 네이티브앱처럼
- **Universal Apps**: 하나의 코드베이스, 모든 플랫폼

다음 시간에는 빌드와 컴파일의 차이점에 대해 알아보겠습니다! 🛠️