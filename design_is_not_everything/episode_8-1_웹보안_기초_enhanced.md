# 에피소드 8-1: 웹 보안 기초 - 해커처럼 생각하고 방어하기

## 🎯 이 글을 읽으면 얻게 되는 것
- 주요 웹 보안 위협 이해
- OWASP Top 10 파악
- 기본적인 보안 대책 수립
- 보안 마인드셋 형성

## 🏰 보안을 성(城)으로 이해하기

### 중세 성과 웹 보안
```
🏰 웹사이트 = 디지털 성

성벽 = 방화벽
• 외부 침입 1차 방어
• 알려진 공격 차단

성문 = 로그인 시스템
• 인증된 사람만 입장
• 신원 확인 필수

경비병 = 모니터링
• 24시간 감시
• 이상 행동 탐지

보물창고 = 데이터베이스
• 가장 중요한 자산
• 다중 잠금 장치

핵심:
"한 곳만 뚫려도 전체가 위험하다"
```

## 🎭 해커의 관점으로 보기

### 공격자의 목적
```
💰 해커가 노리는 것

1. 돈 (90%)
   • 신용카드 정보
   • 계좌 정보
   • 암호화폐
   • 랜섬웨어

2. 정보 (7%)
   • 개인정보
   • 기업 기밀
   • 정부 문서

3. 파괴 (2%)
   • 서비스 마비
   • 데이터 삭제
   • 명예 실추

4. 재미 (1%)
   • 실력 과시
   • 호기심
```

### 공격 단계
```
🎯 해킹의 5단계

1. 정찰 (Reconnaissance)
   • 타겟 정보 수집
   • SNS, 구글링
   • 포트 스캔

2. 무기화 (Weaponization)
   • 취약점 찾기
   • 공격 도구 준비

3. 전달 (Delivery)
   • 피싱 이메일
   • 악성 링크
   • USB

4. 실행 (Exploitation)
   • 취약점 공격
   • 권한 획득

5. 목적 달성 (Action)
   • 데이터 탈취
   • 백도어 설치
   • 흔적 삭제
```

## 🔝 OWASP Top 10 (2024)

### 1. 인젝션 (Injection)
```sql
-- ❌ 취약한 코드
query = "SELECT * FROM users WHERE id = '" + userId + "'";
// userId = "1' OR '1'='1" 입력 시
// 모든 사용자 정보 노출!

-- ✅ 안전한 코드
query = "SELECT * FROM users WHERE id = ?";
preparedStatement.setString(1, userId);

예방법:
• Prepared Statement 사용
• 입력값 검증
• 최소 권한 원칙
```

### 2. 인증 실패 (Broken Authentication)
```javascript
// ❌ 취약한 인증
if (password === "admin123") {
  // 하드코딩된 비밀번호
}

// ❌ 세션 관리 실패
session.timeout = 999999; // 무제한

// ✅ 안전한 인증
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash(password, 10);

// ✅ 적절한 세션 관리
session.timeout = 30 * 60 * 1000; // 30분
```

### 3. XSS (Cross-Site Scripting)
```html
<!-- ❌ 취약한 코드 -->
<div>
  안녕하세요, <%= userName %>님!
  <!-- userName = <script>alert('해킹!')</script> -->
</div>

<!-- ✅ 안전한 코드 -->
<div>
  안녕하세요, <%= escapeHtml(userName) %>님!
</div>

예방법:
• 모든 출력 이스케이프
• Content Security Policy
• 입력값 필터링
```

### 4. 접근 제어 실패
```javascript
// ❌ 취약한 접근 제어
app.get('/admin', (req, res) => {
  // 권한 체크 없음
  res.render('admin-panel');
});

// ✅ 안전한 접근 제어
app.get('/admin', requireAuth, requireAdmin, (req, res) => {
  res.render('admin-panel');
});

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).send('Forbidden');
  }
  next();
}
```

### 5. 보안 설정 오류
```yaml
# ❌ 취약한 설정
debug: true
expose_errors: true
admin_password: admin
database_url: mongodb://localhost/myapp

# ✅ 안전한 설정
debug: false
expose_errors: false
admin_password: ${ADMIN_PASSWORD}
database_url: ${DATABASE_URL}
```

## 🛡️ 기본 보안 대책

### 1. HTTPS 필수
```
🔒 HTTP vs HTTPS

HTTP (평문 전송):
사용자 --[password123]--> 서버
       해커가 중간에서 훔쳐봄 👀

HTTPS (암호화 전송):
사용자 --[x#@$%^&*]--> 서버
       해커가 봐도 의미 없음 ❌

구현:
• Let's Encrypt (무료 SSL)
• 모든 페이지 HTTPS 적용
• HSTS 헤더 설정
```

### 2. 비밀번호 정책
```javascript
// 🔑 강력한 비밀번호 정책

const passwordPolicy = {
  minLength: 12,           // 최소 12자
  requireUppercase: true,  // 대문자 필수
  requireLowercase: true,  // 소문자 필수
  requireNumbers: true,    // 숫자 필수
  requireSymbols: true,    // 특수문자 필수
  preventCommon: true,     // 흔한 패스워드 금지
  preventReuse: 5,         // 최근 5개 재사용 금지
};

// 비밀번호 강도 측정
function checkPasswordStrength(password) {
  let strength = 0;
  
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  return strength; // 0-5
}
```

### 3. 2단계 인증 (2FA)
```
🔐 2FA 구현 방식

1. SMS OTP
   👍 쉬움
   👎 SIM 스와핑 위험

2. 앱 기반 (Google Authenticator)
   👍 안전
   👎 앱 설치 필요

3. 하드웨어 키 (YubiKey)
   👍 가장 안전
   👎 비용 발생

구현 예시:
1. 비밀번호 입력 ✓
2. 6자리 코드 전송
3. 30초 내 입력
4. 로그인 완료
```

## 🕵️ 보안 테스트

### 침투 테스트 도구
```
🔧 보안 테스트 도구

웹 스캐너:
• OWASP ZAP (무료)
• Burp Suite
• Nikto

취약점 스캐너:
• Nessus
• OpenVAS
• Qualys

코드 분석:
• SonarQube
• Snyk
• GitHub Security

네트워크:
• Nmap
• Wireshark
• Metasploit
```

### 보안 체크리스트
```
✅ 웹 애플리케이션 보안 체크리스트

인증/인가:
□ 강력한 비밀번호 정책
□ 2FA 구현
□ 세션 타임아웃
□ 브루트포스 방어

데이터 보호:
□ HTTPS 전체 적용
□ 민감정보 암호화
□ SQL 인젝션 방어
□ XSS 방어

서버 보안:
□ 최신 패치 적용
□ 불필요한 포트 차단
□ 에러 메시지 숨김
□ 로깅 및 모니터링

API 보안:
□ Rate Limiting
□ API 키 관리
□ CORS 설정
□ 입력값 검증
```

## 🎨 프론트엔드 보안

### 클라이언트 보안 원칙
```javascript
// ⚠️ 중요: 클라이언트는 신뢰할 수 없다!

// ❌ 나쁜 예: 클라이언트 검증만
function purchase() {
  if (userBalance >= itemPrice) {
    // 클라이언트에서만 체크
    buyItem();
  }
}

// ✅ 좋은 예: 서버 검증 필수
async function purchase() {
  const response = await fetch('/api/purchase', {
    method: 'POST',
    body: JSON.stringify({ itemId }),
  });
  // 서버에서 잔액 확인 후 처리
}

// 민감정보 숨기기
// ❌ 소스코드에 노출
const API_KEY = 'sk_live_abc123';

// ✅ 환경변수 사용
const API_KEY = process.env.REACT_APP_API_KEY;
```

### Content Security Policy
```html
<!-- CSP 헤더 설정 -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://cdn.example.com;
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               font-src 'self' data:;">

<!-- XSS 방어 -->
<script>
// 사용자 입력 이스케이프
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
</script>
```

## 🔐 백엔드 보안

### API 보안
```javascript
// Rate Limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100개 요청
  message: 'Too many requests'
});

app.use('/api/', limiter);

// API 키 검증
function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || !isValidApiKey(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  next();
}

// 입력 검증
const { body, validationResult } = require('express-validator');

app.post('/user',
  body('email').isEmail(),
  body('age').isInt({ min: 0, max: 120 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // 처리 로직
  }
);
```

### 데이터베이스 보안
```javascript
// 🔒 MongoDB 보안

// ❌ 취약한 쿼리
const user = await User.findOne({
  username: req.body.username,
  password: req.body.password  // 평문 비밀번호!
});

// ✅ 안전한 쿼리
const user = await User.findOne({ 
  username: req.body.username 
});

if (user && await bcrypt.compare(req.body.password, user.hashedPassword)) {
  // 로그인 성공
}

// 민감정보 제외
const userPublicData = await User.findById(id)
  .select('-password -creditCard -ssn');
```

## 🚨 보안 사고 대응

### 사고 대응 프로세스
```
🚨 보안 사고 발생 시

1. 탐지 (Detection)
   • 이상 징후 발견
   • 자동 알림
   • 사용자 신고

2. 격리 (Containment)
   • 영향 범위 파악
   • 추가 피해 방지
   • 서비스 격리

3. 조사 (Investigation)
   • 원인 분석
   • 침입 경로 파악
   • 피해 규모 산정

4. 복구 (Recovery)
   • 취약점 패치
   • 시스템 복원
   • 서비스 재개

5. 개선 (Improvement)
   • 사후 분석
   • 재발 방지책
   • 문서화
```

### 로깅과 모니터링
```javascript
// 📊 보안 로깅

const winston = require('winston');

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ 
      filename: 'security.log' 
    })
  ]
});

// 로그인 시도 기록
function logLoginAttempt(username, success, ip) {
  securityLogger.info({
    event: 'login_attempt',
    username,
    success,
    ip,
    timestamp: new Date().toISOString()
  });
  
  // 실패 횟수 체크
  if (!success) {
    checkBruteForce(username, ip);
  }
}

// 이상 행동 탐지
function detectAnomaly(userId, action) {
  // 비정상적 패턴 감지
  if (isSuspicious(action)) {
    alertSecurityTeam(userId, action);
  }
}
```

## 🔮 보안의 미래

### 2025-2030 보안 트렌드
```
🚀 차세대 보안 기술

1. AI 기반 보안
   • 이상 행동 자동 탐지
   • 예측적 위협 분석
   • 자동화된 대응

2. Zero Trust
   • "아무도 믿지 마라"
   • 지속적 검증
   • 최소 권한 원칙

3. 생체 인증
   • 얼굴 인식
   • 지문/홍채
   • 행동 패턴

4. 양자 암호화
   • 양자 컴퓨터 대응
   • 포스트 퀀텀 암호
   • 완벽한 보안

5. 블록체인 보안
   • 분산 인증
   • 변조 불가능
   • 투명한 감사
```

## 🎓 보안 교육과 문화

### 보안 인식 제고
```
📚 팀 보안 교육

정기 교육:
• 월 1회 보안 세미나
• 분기별 모의 훈련
• 연 1회 외부 교육

피싱 훈련:
1. 모의 피싱 메일 발송
2. 클릭률 측정
3. 클릭한 직원 교육
4. 개선도 추적

보안 문화:
• Clean Desk Policy
• 비밀번호 공유 금지
• 의심스러운 활동 신고
• 보안 우수 직원 포상
```

## 💬 자주 묻는 질문

### Q&A
```
Q: 완벽한 보안은 가능한가요?
A: 불가능합니다. 목표는 위험을 최소화하고
   공격 비용을 높이는 것입니다.

Q: 작은 사이트도 타겟이 되나요?
A: 네. 자동화된 공격은 규모를 가리지 않습니다.
   오히려 보안이 약한 작은 사이트를 노립니다.

Q: 보안과 사용성의 균형은?
A: 리스크 기반 접근. 중요도에 따라
   보안 수준을 차등 적용합니다.

Q: 개인정보 유출 시 대응은?
A: 72시간 내 신고 (GDPR)
   피해자 통지, 원인 분석, 재발 방지
```

## 📚 추가 학습 자료

### 추천 리소스
- [OWASP](https://owasp.org/) - 웹 보안 표준
- [Have I Been Pwned](https://haveibeenpwned.com/) - 데이터 유출 확인
- [Security Headers](https://securityheaders.com/) - 보안 헤더 검사
- [Web Security Academy](https://portswigger.net/web-security) - 실습

### 보안 자격증
- CompTIA Security+
- CEH (Certified Ethical Hacker)
- CISSP

## 💡 핵심 정리

> "보안은 가장 약한 고리만큼만 강하다"

1. **보안은 선택이 아닌 필수**: 처음부터 고려
2. **깊이 있는 방어**: 다층 보안 구조
3. **인간이 가장 큰 취약점**: 교육과 인식
4. **지속적인 개선**: 완벽은 없다
5. **사고 대응 준비**: 언제든 일어날 수 있다

보안은 한 번에 끝나는 것이 아니라 지속적인 과정입니다. 항상 경계하고, 학습하고, 개선해야 합니다!