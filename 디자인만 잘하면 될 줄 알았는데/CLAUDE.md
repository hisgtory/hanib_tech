# 디자인만 잘하면 될 줄 알았는데 - 프로젝트 가이드

## 프로젝트 구조

```
디자인만 잘하면 될 줄 알았는데/
├── CLAUDE.md                    # 이 파일
├── _templates/                  # 템플릿 디렉터리
│   ├── part.yaml
│   ├── week.yaml
│   └── episode.yaml
├── part{NN}_{제목}/             # 파트 폴더
│   ├── meta.yaml               # 파트 메타데이터
│   └── week{NN}_{제목}/        # 주차 폴더
│       ├── meta.yaml           # 주차 메타데이터
│       ├── intro.md            # 주차 인트로
│       └── ep{NN}_{제목}/      # 에피소드 폴더
│           ├── meta.yaml       # 에피소드 메타데이터
│           ├── conversation.md # 대화형 콘텐츠
│           ├── yama.md         # 핵심 메시지/요약
│           ├── body.md         # 본문 설명
│           └── variants/       # 변형 버전들
│               └── v{N}/       # 버전별 폴더
│                   ├── conversation.md
│                   ├── yama.md
│                   └── body.md
```

## 파일 포맷

### meta.yaml 구조

```yaml
# part meta.yaml
title: "제품을 만들기 전"
order: 1
description: "제품 기획 단계에서 알아야 할 것들"

# week meta.yaml
title: "무엇을 만들지 찾아가기"
order: 1
part: 1
keywords: ["린 스타트업", "애자일", "MVP"]

# episode meta.yaml
title: "린 스타트업"
order: 1
week: 1
part: 1
status: "draft" | "review" | "final"
selected_variant: null  # variants 중 선택된 버전, null이면 기본 파일 사용
```

### 마크다운 확장 문법

#### 하이라이트 (강조 텍스트)
```markdown
==이것은 하이라이트 텍스트입니다==
```

#### 콜아웃 박스
```markdown
:::callout[타입]
콜아웃 내용
:::

타입: tip, warning, quote, important
```

#### 대화 블록
```markdown
:::conversation
**한입**: 대사 내용
**N**: 대사 내용
:::
```

#### 핵심 메시지 (Yama)
```markdown
:::yama
핵심 메시지 내용
:::
```

#### 일러스트 지시
```markdown
[illust: ID="P1-W1-E02-01" DESC="일러스트 설명"]
```

**ID 체계:**
- WEEK 표지: `P{파트}-W{주차}-COVER` (예: P1-W1-COVER)
- 본문 그래픽: `P{파트}-W{주차}-E{에피소드}-{순번}` (예: P1-W1-E02-01)

**편집 방침:**
- 일러스트는 WEEK 표지와 본문 중간중간의 이해를 돕는 그래픽에만 사용
- 대화(conversation)는 채팅 UI로 표현되므로 별도 일러스트 불필요

## 콘텐츠 구성 요소

### conversation.md
등장인물 간의 대화로 개념을 설명하는 스토리텔링 콘텐츠

### yama.md
- 에피소드의 핵심 메시지
- 한 줄 요약
- 기억해야 할 포인트

### body.md
- 개념 설명
- 실전 팁
- 예시와 체크리스트

## 변형(Variants) 관리

`variants/` 폴더에는 같은 에피소드의 다른 버전들을 저장합니다:
- 톤앤매너 변형 (더 캐주얼, 더 전문적)
- 길이 변형 (짧은 버전, 상세 버전)
- 매체별 변형 (인스타그램용, 블로그용)

최종 버전은 `meta.yaml`의 `selected_variant`로 지정하거나,
variants를 취합하여 기본 파일(conversation.md, yama.md, body.md)에 저장합니다.

## 빌드 규칙

1. 각 에피소드의 최종 콘텐츠는 기본 파일에 저장
2. variants는 작업 히스토리 및 대안으로 보관
3. `status: final`인 에피소드만 출판용으로 취합
4. 취합 순서: part → week (intro 포함) → episodes (order 순)

## 네이밍 컨벤션

- 폴더명: `{타입}{NN}_{제목}` (예: `part01_제품을_만들기_전`)
- 숫자는 2자리 패딩 (01, 02, ...)
- 한글 제목 사용, 공백은 언더스코어로
- 특수문자 제외

## CLI 도구 (hanib)

### 설치

```bash
cd tools/hanib-cli
make build      # 빌드
make link       # 전역 심볼릭 링크 생성 (/usr/local/bin)
# 또는
make install    # 전역 설치 (복사)
```

### 사용법

```bash
# 구조 보기
hanib list

# 파트 추가
hanib add part "제품을 만든 후"

# 주차 추가
hanib add week <part-num> "<title>"
hanib add week 1 "회의에서 한번쯤 들어본 용어들"

# 에피소드 추가
hanib add ep <part-num> <week-num> "<title>"
hanib add ep 1 1 "린 스타트업"

# 변형 추가
hanib add var <episode-path> [version]
hanib add var part01_.../ep01_린_스타트업 v2
```

### Makefile 타겟

| 명령 | 설명 |
|------|------|
| `make build` | 빌드 |
| `make clean` | 빌드 결과물 삭제 |
| `make install` | 전역 설치 (/usr/local/bin에 복사) |
| `make uninstall` | 전역 제거 |
| `make link` | 심볼릭 링크 생성 (개발용) |
| `make unlink` | 심볼릭 링크 제거 |
| `make test` | 테스트 실행 |
| `make deps` | 의존성 설치 |
