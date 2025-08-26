# Episode 7-6. 빌드와 컴파일의 차이점 [Exclusive]

개발자들이 "빌드하다", "컴파일하다"라는 말을 혼용해서 쓰는데, 실제로는 다른 의미입니다.

## 🔧 컴파일 (Compile)

**코드를 기계어로 번역하는 과정**

```
source.c → [컴파일러] → object.o (기계어)
```

- 한 파일씩 개별적으로 처리
- 문법 검사와 최적화 수행
- 아직 실행할 수 없는 상태

## 🏗️ 빌드 (Build)  

**실행 가능한 프로그램을 만드는 전체 과정**

```
1. 컴파일: source.c → object.o
2. 링킹: object.o + library.a → program.exe  
3. 패키징: program.exe + resources → installer.msi
```

<callout>
🍳 **요리로 비유하면**
- 컴파일 = 재료 손질 (당근 썰기, 양파 다지기)
- 빌드 = 완성된 요리 (재료 볶고, 양념하고, 플레이팅)
</callout>

## ⚙️ 빌드에 포함되는 작업들

1. **소스코드 컴파일**
2. **의존성 해결** (라이브러리 연결)
3. **리소스 포함** (이미지, 설정 파일)
4. **테스트 실행**
5. **패키징** (설치 파일 생성)

## 🛠️ 빌드 도구들

- **Make**: C/C++의 전통적인 빌드 도구
- **Maven/Gradle**: Java 생태계
- **npm/yarn**: JavaScript/Node.js
- **pip**: Python 패키지 관리

<hl>컴파일은 빌드의 한 단계일 뿐입니다!</hl>

## 🚀 CI/CD와 빌드

현대 개발에서는 자동화된 빌드가 핵심:

```yaml
# GitHub Actions 예시
- name: Build
  run: |
    npm install    # 의존성 설치
    npm run build  # 빌드 실행
    npm test       # 테스트 실행
```

**개발자와 소통할 때**: "빌드 시간이 얼마나 걸리나요?"라고 물어보면 전체 개발 프로세스의 효율성을 알 수 있습니다.