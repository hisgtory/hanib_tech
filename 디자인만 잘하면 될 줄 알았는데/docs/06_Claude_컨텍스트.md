# Claude 컨텍스트 가이드

## 세션 시작시 확인 사항

### 1. 현재 상태 파악
```bash
# Git 상태
git status
git branch

# 서버 상태
lsof -i :3030  # 프론트엔드
lsof -i :3031  # 백엔드
```

### 2. 최근 작업 확인
```bash
# 최근 커밋
git log --oneline -5

# 변경된 파일
git diff --name-only
```

## 주요 파일 위치

### 에디터 도구
| 파일 | 용도 |
|------|------|
| `tools/hanib/cmd/server/main.go` | 백엔드 API |
| `tools/hanib/web/src/App.tsx` | 프론트 메인 |
| `tools/hanib/web/src/components/` | React 컴포넌트 |
| `tools/hanib/pkg/content/tree.go` | 콘텐츠 트리 파싱 |

### 콘텐츠
| 패턴 | 위치 |
|------|------|
| 에피소드 | `part*/week*/ep*/` |
| 변형 | `part*/week*/ep*/variants/` |
| 메타 | `*/meta.yaml` |

## 자주 쓰는 명령어

### 서버 관리
```bash
# 백엔드 시작
cd tools/hanib && go build -o hanib-server ./cmd/server && ./hanib-server &

# 프론트엔드 시작
cd tools/hanib/web && npm run dev &

# 포트 확인
lsof -i :3030
lsof -i :3031

# 프로세스 종료
kill <PID>
```

### Git 작업
```bash
# 브랜치 생성
git checkout -b feat/기능명

# 커밋
git add <files>
git commit -m "feat: 설명"

# 푸시
git push -u origin 브랜치명
```

### API 테스트
```bash
# 트리 조회
curl -s http://localhost:3031/api/tree | jq

# 파일 읽기
curl -s "http://localhost:3031/api/file?path=경로" | jq

# Claude 테스트
curl -s -X POST http://localhost:3031/api/claude \
  -H "Content-Type: application/json" \
  -d '{"prompt":"테스트","filePaths":[]}'
```

## 에러 대응

### React 에러 #31
- 객체를 직접 렌더링하려 할 때 발생
- JSX에서 `{object}` 대신 `{object.property}` 사용

### 포트 충돌
```bash
# 기존 프로세스 확인 및 종료
lsof -i :포트번호
kill <PID>
```

### Go 빌드 에러
```bash
# 의존성 정리
go mod tidy

# 재빌드
go build -o hanib-server ./cmd/server
```

## 세션 컨텍스트 유지

### 중요 변수
- `selectedPath`: 현재 선택된 파일 경로
- `content`: 에디터 내용
- `contextPaths`: Claude에 전달할 컨텍스트

### 상태 흐름
```
TreeView 파일 선택
→ loadFile() 호출
→ content 상태 업데이트
→ Editor + Preview 갱신
```

### Claude 연동 흐름
```
사용자 메시지 입력
→ /api/claude POST
→ SSE 스트리밍 응답
→ onFileChange 콜백
→ reloadCurrentFile()
```

## 작업 패턴

### 새 기능 추가시
1. 요청 이해
2. 관련 파일 읽기
3. 변경 계획 수립
4. 구현 (백엔드 → 프론트 순)
5. 테스트
6. 커밋

### 버그 수정시
1. 에러 메시지 분석
2. 관련 코드 위치 파악
3. 원인 분석
4. 수정
5. 테스트
6. 커밋

### 콘텐츠 작업시
1. 에피소드 위치 확인
2. 기존 파일 읽기
3. 수정/생성
4. 커밋

## 응답 포맷

### 결과 보고
```
완료.
- 변경: 파일1, 파일2
- 테스트: localhost:3030 접속
```

### 에러 보고
```
에러 발생: [에러 내용]
원인: [분석]
해결: [수정 내용]
```

### 선택 필요시
```
두 가지 방법이 있습니다:
1. A 방식 - 장점
2. B 방식 - 장점

어느 쪽을 선호하시나요?
```
