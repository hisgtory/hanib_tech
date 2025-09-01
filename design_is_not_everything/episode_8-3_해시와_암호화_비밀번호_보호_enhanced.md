# Episode 8-3: 해시와 암호화, 비밀번호는 어떻게 보호되나

## 🎬 Scene: 비밀번호 찾기의 진실

```
금요일 오후, 비밀번호를 잊어버린 디자이너

디자이너: "비밀번호 좀 알려주세요!"
개발자: "저도 몰라요. 아무도 몰라요."
디자이너: "DB에 있잖아요?"
개발자: "네, 근데 이렇게 생겼어요:"

$2b$12$EXRkfkdmXn2gzds2SSitu.MW9.gAVqa9eLS1//RYtYCmB1eLHg.9q

디자이너: "이게 뭐예요?"
개발자: "당신의 비밀번호예요. bcrypt 해시값이죠."
디자이너: "원래 비밀번호로 돌릴 수 없나요?"
개발자: "그게 가능하면 보안이 아니죠!"

결국: 비밀번호 재설정 링크 발송
```

**좋은 서비스는 당신의 비밀번호를 모릅니다.**
**그래서 "찾기"가 아니라 "재설정"인 것입니다.**

## Part 1: 암호화 vs 해시

### 🔄 암호화 (Encryption)

```
암호화 = 양방향 변환
평문 → [암호화] → 암호문 → [복호화] → 평문

예시: 메시지 암호화
"안녕하세요" 
→ AES 암호화 (키: secret123)
→ "U2FsdGVkX1+..."
→ AES 복호화 (키: secret123)
→ "안녕하세요"

특징:
- 되돌릴 수 있음 (키가 있으면)
- 데이터 전송/저장용
- 대칭키/비대칭키

사용처:
- HTTPS 통신
- 파일 암호화
- 메시지 암호화
- 데이터베이스 암호화
```

### #️⃣ 해시 (Hash)

```
해시 = 단방향 변환
평문 → [해시 함수] → 해시값 → ❌ (복구 불가)

예시: 비밀번호 해시
"myPassword123!"
→ SHA-256
→ "5e884898da28047151d0e56f8dc62927..."
→ 원본 복구 불가능!

특징:
- 되돌릴 수 없음
- 같은 입력 = 같은 출력
- 고정 길이 출력
- 눈사태 효과 (1bit 변경 → 완전히 다른 해시)

사용처:
- 비밀번호 저장
- 파일 무결성 검증
- 디지털 서명
- 블록체인
```

## Part 2: 비밀번호 보호 메커니즘

### 🧂 Salt의 마법

```
Salt 없는 해시의 문제:

password123 → SHA-256 → 482c811da5d5b4bc...
password123 → SHA-256 → 482c811da5d5b4bc... (같음!)

해커: "아, 이 해시값은 password123이구나!"
→ Rainbow Table 공격 가능

Salt 추가:

User1: password123 + salt1 → 완전히 다른 해시
User2: password123 + salt2 → 또 다른 해시

같은 비밀번호도 다른 해시값!
```

### 🔐 bcrypt 작동 원리

```
bcrypt 해시 구조:
$2b$12$EXRkfkdmXn2gzds2SSitu.MW9.gAVqa9eLS1//RYtYCmB1eLHg.9q

분해:
$2b$ = bcrypt 버전
$12$ = cost factor (2^12 rounds)
$EXRkfkdmXn2gzds2SSitu = 22자 salt
.MW9.gAVqa9eLS1//RYtYCmB1eLHg.9q = 31자 해시

로그인 검증:
1. 사용자 입력: "myPassword"
2. DB에서 해시 가져오기
3. salt 추출
4. 입력 + salt로 해시 계산
5. 저장된 해시와 비교
6. 일치하면 로그인 성공!
```

## Part 3: 해시 알고리즘 비교

### 📊 알고리즘 선택 가이드

```
❌ 절대 사용 금지:
MD5: 32자, 충돌 발견, 1초에 수십억 개 계산
SHA-1: 40자, 구글이 충돌 생성, deprecated

⚠️ 비밀번호에 부적합:
SHA-256: 빠름 = 브루트포스 공격 취약
SHA-512: 더 빠름 = 더 취약

✅ 비밀번호 전용:
bcrypt: 
- 느림 (의도적)
- salt 자동 포함
- cost factor 조절 가능

scrypt:
- 메모리 하드
- ASIC 저항성
- 더 안전하지만 복잡

Argon2 (최신 표준):
- 2015 PHC 우승
- 메모리/시간 조절 가능
- 가장 안전

실무 추천:
스타트업: bcrypt (간단, 검증됨)
엔터프라이즈: Argon2 (최고 보안)
```

## Part 4: 실제 구현

### 💻 Node.js 예제

```javascript
// bcrypt 사용 예제
const bcrypt = require('bcrypt');

// 회원가입 시 비밀번호 해시
async function hashPassword(plainPassword) {
    const saltRounds = 12; // cost factor
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
    // 결과: $2b$12$...
}

// 로그인 시 비밀번호 검증
async function verifyPassword(plainPassword, hashedPassword) {
    const match = await bcrypt.compare(plainPassword, hashedPassword);
    return match; // true or false
}

// 실제 사용
const password = "디자이너123!";
const hash = await hashPassword(password);
console.log(hash); 
// $2b$12$EXRkfkdmXn2gzds2SSitu.MW9.gAVqa9eLS1//RYtYCmB1eLHg.9q

const isValid = await verifyPassword("디자이너123!", hash);
console.log(isValid); // true

const isInvalid = await verifyPassword("틀린비밀번호", hash);
console.log(isInvalid); // false
```

### 🛡 보안 체크리스트

```
비밀번호 정책:
□ 최소 8자 이상
□ 대소문자 + 숫자 + 특수문자
□ 일반적인 패턴 차단
□ 이전 비밀번호 재사용 금지
□ 정기 변경 (선택적)

저장 시:
□ bcrypt/scrypt/Argon2 사용
□ Salt rounds 12 이상
□ 평문 절대 저장 금지
□ 로그에 비밀번호 남기지 않기

전송 시:
□ HTTPS 필수
□ 비밀번호 마스킹 (••••••)
□ 자동완성 주의
□ 복사/붙여넣기 허용

추가 보안:
□ 2FA 구현
□ 로그인 시도 제한
□ 계정 잠금 기능
□ 비정상 로그인 알림
```

## Part 5: 해킹 시나리오와 방어

### 😈 공격 기법들

```
1. Brute Force (무차별 대입)
시도: aaaaaa, aaaaab, aaaaac...
방어: 
- 느린 해시 함수 (bcrypt)
- 로그인 시도 제한
- CAPTCHA

2. Dictionary Attack (사전 공격)
시도: password, 123456, qwerty...
방어:
- 복잡한 비밀번호 정책
- 일반적인 패턴 차단

3. Rainbow Table
미리 계산된 해시 테이블
방어:
- Salt 사용 (각 사용자마다 다른 salt)

4. Social Engineering
"비밀번호가 뭐였죠?"
방어:
- 교육
- 절대 비밀번호 요구 안 함
- 공식 채널만 사용

시간 비교:
MD5: 1초에 80억 개 시도
bcrypt (rounds=12): 1초에 10개 시도
= 8억 배 차이!
```

### 🔍 데이터 유출 시 대응

```
만약 DB가 해킹당했다면?

Salt 없는 MD5:
- 즉시 평문 복구 가능
- 대규모 피해
- 소송 위험

bcrypt with salt:
- 복구 매우 어려움
- 시간 벌기 가능
- 사용자에게 변경 안내

대응 프로세스:
1. 즉시 모든 세션 무효화
2. 비밀번호 강제 재설정
3. 사용자 통보
4. 보안 감사
5. 알고리즘 업그레이드
```

## 🎁 Bonus: 비밀번호 UX 개선

### 🎨 디자이너를 위한 팁

```html
<!-- 비밀번호 강도 표시 -->
<div class="password-strength">
  <div class="strength-bar" data-strength="weak"></div>
  <span>약함</span>
</div>

<!-- 비밀번호 보기 토글 -->
<div class="password-input">
  <input type="password" id="pwd">
  <button onclick="toggleVisibility()">👁</button>
</div>

<!-- 요구사항 실시간 체크 -->
<ul class="requirements">
  <li class="valid">✓ 8자 이상</li>
  <li class="invalid">✗ 대문자 포함</li>
  <li class="invalid">✗ 숫자 포함</li>
  <li class="invalid">✗ 특수문자 포함</li>
</ul>
```

### 🚀 대안 인증 방법

```
비밀번호의 미래:

1. Passwordless
- Magic Link (이메일)
- SMS OTP
- 생체 인증

2. OAuth/SSO
- Google 로그인
- Apple 로그인
- 기업 SSO

3. WebAuthn/FIDO2
- 하드웨어 키
- 플랫폼 인증
- 생체 인증

트렌드:
2020: 비밀번호 + 2FA
2023: Passwordless 옵션
2025: 비밀번호 없는 세상?
```

## 💡 핵심 메시지

> "좋은 서비스는 당신의 비밀번호를 모릅니다.
> 해시는 일방통행 도로입니다.
> 
> bcrypt가 느린 것은 버그가 아니라 기능입니다.
> 느릴수록 안전합니다."

**기억하세요:**
- 해시 ≠ 암호화
- Salt = 필수
- bcrypt > SHA
- 느림 = 안전

## 🚀 다음 에피소드 예고

**"Episode 8-4: 인증과 인가, 누가 무엇을 할 수 있나"**

JWT, OAuth, Session의 차이:
- 토큰 vs 세션
- Stateless vs Stateful
- 보안 vs 편의성
- 실제 구현

"왜 매번 다시 로그인해야 할까?"

---

*"비밀번호는 열쇠가 아니라 지문입니다.
복사할 수 없고, 되돌릴 수 없습니다."*

**#해시 #암호화 #bcrypt #비밀번호보안 #Salt**