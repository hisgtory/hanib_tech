# Episode 8-4: 인증과 인가, 누가 무엇을 할 수 있나

## 🎬 Scene: 권한 없음의 당황

```
신입 디자이너의 첫 출근

디자이너: "어드민 페이지 디자인 확인하려는데 안 들어가져요"
개발자: "권한이 없으시네요. 인가 처리가..."
디자이너: "로그인은 했는데요?"
개발자: "인증은 되셨는데 인가가 안 되신 거예요"
디자이너: "인증? 인가? 뭐가 다른가요?"

개발자의 설명:
인증(Authentication) = 당신이 누구인지 확인
인가(Authorization) = 당신이 뭘 할 수 있는지 확인

비유:
인증 = 신분증 확인 (입장)
인가 = 출입 권한 확인 (특정 구역)

디자이너: "아! 콘서트장 입장 vs VIP 라운지 입장!"
개발자: "정확해요!"
```

**인증은 신원 확인, 인가는 권한 확인입니다.**

## Part 1: 인증 (Authentication)

### 🔑 세션 기반 인증

```
세션 인증 플로우:

1. 로그인 요청
User → Server: ID/PW 전송

2. 세션 생성
Server: 검증 → 세션 ID 생성
세션 저장소: {sessionId: userData}

3. 쿠키 전달
Server → User: Set-Cookie: sessionId=abc123

4. 인증된 요청
User → Server: Cookie: sessionId=abc123
Server: 세션 확인 → 사용자 식별

장점:
- 서버가 상태 관리
- 강제 로그아웃 가능
- 보안 제어 용이

단점:
- 서버 메모리 사용
- 확장성 문제 (서버 여러대)
- 모바일 앱 불편

구현 예:
// Express + express-session
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // HTTPS only
    httpOnly: true, // XSS 방지
    maxAge: 1000 * 60 * 60 // 1시간
  }
}));

app.post('/login', (req, res) => {
  // 인증 로직
  req.session.userId = user.id;
  res.send('Logged in');
});
```

### 🎫 토큰 기반 인증 (JWT)

```
JWT (JSON Web Token) 구조:

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

세 부분:
1. Header: 알고리즘, 타입
2. Payload: 사용자 정보
3. Signature: 검증용 서명

JWT 플로우:
1. 로그인 → JWT 발급
2. 클라이언트가 토큰 저장
3. 요청 시 토큰 포함
4. 서버가 토큰 검증

장점:
- Stateless (서버 부담 없음)
- 확장성 좋음
- 모바일 친화적

단점:
- 토큰 탈취 시 위험
- 크기가 큼
- 강제 로그아웃 어려움

구현:
const jwt = require('jsonwebtoken');

// 토큰 생성
const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

// 토큰 검증
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

## Part 2: 인가 (Authorization)

### 🎭 역할 기반 접근 제어 (RBAC)

```
RBAC 구조:

User → Role → Permission → Resource

예시: 이커머스 플랫폼
┌─────────┬──────────┬────────────────┐
│  User   │   Role   │   Permissions  │
├─────────┼──────────┼────────────────┤
│ Alice   │  Admin   │ ALL            │
│ Bob     │  Editor  │ READ, WRITE    │
│ Carol   │  Viewer  │ READ           │
└─────────┴──────────┴────────────────┘

역할 정의:
const roles = {
  admin: {
    can: ['read', 'write', 'delete', 'manage_users']
  },
  editor: {
    can: ['read', 'write']
  },
  viewer: {
    can: ['read']
  }
};

권한 체크:
function authorize(user, action, resource) {
  const role = user.role;
  const permissions = roles[role].can;
  
  if (permissions.includes(action)) {
    return true;
  }
  
  throw new Error('Unauthorized');
}

// 미들웨어
app.delete('/api/posts/:id', 
  authenticate, // 인증 확인
  authorize('delete', 'post'), // 인가 확인
  (req, res) => {
    // 삭제 로직
  }
);
```

### 🔐 OAuth 2.0

```
OAuth 2.0 플로우:

"구글로 로그인" 동작 과정:

1. 인증 요청
User → Your App: "구글로 로그인"
Your App → Google: "이 사용자 인증해주세요"

2. 사용자 동의
Google → User: "○○앱이 프로필 접근 허용?"
User → Google: "허용"

3. 인증 코드
Google → Your App: "인증 코드: xyz789"

4. 액세스 토큰 교환
Your App → Google: "코드 xyz789 → 토큰 주세요"
Google → Your App: "액세스 토큰: bearer abc123"

5. API 호출
Your App → Google API: "토큰 abc123으로 프로필 요청"
Google API → Your App: {name: "홍길동", email: "..."}

토큰 종류:
- Access Token: API 접근용 (짧은 수명)
- Refresh Token: 토큰 갱신용 (긴 수명)
- ID Token: 사용자 정보 (OpenID Connect)

스코프 (권한 범위):
scope: "email profile photos.read"
= 이메일, 프로필, 사진 읽기 권한
```

## Part 3: 실전 구현

### 💻 인증 시스템 설계

```javascript
// 완전한 인증/인가 시스템

class AuthService {
  // 회원가입
  async register(email, password) {
    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // 사용자 생성
    const user = await User.create({
      email,
      password: hashedPassword,
      role: 'viewer' // 기본 역할
    });
    
    // 환영 이메일
    await sendWelcomeEmail(email);
    
    return user;
  }
  
  // 로그인
  async login(email, password) {
    const user = await User.findOne({ email });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const valid = await bcrypt.compare(password, user.password);
    
    if (!valid) {
      throw new Error('Invalid password');
    }
    
    // JWT 생성
    const token = this.generateToken(user);
    
    // Refresh Token 저장
    const refreshToken = this.generateRefreshToken();
    await this.saveRefreshToken(user.id, refreshToken);
    
    return { token, refreshToken };
  }
  
  // 토큰 생성
  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
  }
  
  // 토큰 갱신
  async refreshToken(refreshToken) {
    const stored = await RefreshToken.findOne({ 
      token: refreshToken 
    });
    
    if (!stored || stored.expiresAt < Date.now()) {
      throw new Error('Invalid refresh token');
    }
    
    const user = await User.findById(stored.userId);
    return this.generateToken(user);
  }
}
```

### 🛡 보안 베스트 프랙티스

```
인증/인가 보안 체크리스트:

패스워드:
□ bcrypt/argon2 사용 (절대 평문 저장 금지)
□ 최소 8자, 복잡도 요구
□ 비밀번호 재사용 방지
□ 브루트포스 방어 (rate limiting)

세션/토큰:
□ HTTPS 전용
□ HttpOnly, Secure 쿠키
□ CSRF 토큰 사용
□ 짧은 만료 시간 (15-30분)
□ Refresh Token 별도 관리

2단계 인증 (2FA):
□ TOTP (Google Authenticator)
□ SMS (보안 약함)
□ 백업 코드 제공
□ 기기 등록

로그인 시도:
□ 5회 실패 시 계정 잠금
□ CAPTCHA 적용
□ 이상 로그인 알림
□ IP 기반 제한

구현 예:
// Rate Limiting
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 최대 5회
  message: 'Too many login attempts'
});

app.post('/login', loginLimiter, async (req, res) => {
  // 로그인 로직
});

// CSRF Protection
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.get('/form', csrfProtection, (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});
```

## Part 4: SSO와 통합 인증

### 🌐 Single Sign-On

```
SSO 아키텍처:

여러 서비스, 한 번의 로그인

         ┌──────────┐
         │   IdP    │ (Identity Provider)
         │  (인증)   │
         └─────┬────┘
               │
    ┌──────────┼──────────┐
    ↓          ↓          ↓
┌────────┐ ┌────────┐ ┌────────┐
│ App A  │ │ App B  │ │ App C  │
└────────┘ └────────┘ └────────┘

SAML vs OAuth vs OpenID Connect:

SAML (기업용):
- XML 기반
- 복잡하지만 안전
- Active Directory 연동

OAuth 2.0 (인가):
- API 접근 권한
- "○○앱이 사진 접근 허용?"

OpenID Connect (인증):
- OAuth 2.0 + 인증
- "당신이 누구인지 확인"
- Google, Facebook 로그인

구현 (Passport.js):
// Google OAuth
passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  // 사용자 찾기 또는 생성
  let user = await User.findOne({ googleId: profile.id });
  
  if (!user) {
    user = await User.create({
      googleId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName
    });
  }
  
  return done(null, user);
}));
```

### 🔄 마이크로서비스 인증

```
마이크로서비스 환경:

API Gateway 패턴:
Client → API Gateway → Service A
                    → Service B
                    → Service C

1. 중앙 인증:
- Gateway에서 인증
- 내부는 신뢰
- JWT로 정보 전달

2. 서비스 메시:
- 각 서비스가 검증
- mTLS 사용
- Zero Trust

Service Mesh (Istio):
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: frontend-policy
spec:
  selector:
    matchLabels:
      app: frontend
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/default/sa/backend"]
    to:
    - operation:
        methods: ["GET", "POST"]
```

## Part 5: UX와 보안의 균형

### 🎨 인증 UX 디자인

```
좋은 인증 UX:

1. 패스워드리스 옵션
- Magic Link (이메일)
- 생체 인증 (FaceID, 지문)
- Passkeys (WebAuthn)

2. 소셜 로그인
- 원클릭 로그인
- 권한 요청 최소화
- 프로필 자동 완성

3. 프로그레시브 프로파일링
처음: 이메일만
나중: 추가 정보 요청
= 진입 장벽 낮추기

4. 세션 관리 UX
- "로그인 유지" 옵션
- 다른 기기 로그인 알림
- 활성 세션 목록

디자인 패턴:
// 로그인 폼
<form>
  <input type="email" 
         autocomplete="email"
         placeholder="이메일">
  
  <input type="password"
         autocomplete="current-password"
         placeholder="비밀번호">
  
  <button type="button" 
          onclick="togglePassword()">
    👁 보기
  </button>
  
  <div class="options">
    <label>
      <input type="checkbox"> 로그인 유지
    </label>
    <a href="/forgot">비밀번호 찾기</a>
  </div>
  
  <button type="submit">로그인</button>
  
  <div class="divider">또는</div>
  
  <button class="oauth google">
    Google로 계속하기
  </button>
</form>
```

## 🎁 Bonus: 미래의 인증

### 🔮 차세대 인증 기술

```
WebAuthn / Passkeys:
- 비밀번호 없음
- 생체인증 or 하드웨어 키
- 피싱 불가능
- Apple, Google, MS 지원

구현:
// 등록
const credential = await navigator.credentials.create({
  publicKey: {
    challenge: new Uint8Array(32),
    rp: { name: "Example Corp" },
    user: {
      id: new TextEncoder().encode(user.id),
      name: user.email,
      displayName: user.name
    },
    pubKeyCredParams: [
      { alg: -7, type: "public-key" }
    ],
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      userVerification: "required"
    }
  }
});

Zero Knowledge Proof:
- 비밀번호를 알려주지 않고 증명
- 블록체인 활용
- 프라이버시 보장

Behavioral Biometrics:
- 타이핑 패턴
- 마우스 움직임
- 스크롤 패턴
- 지속적 인증
```

## 💡 핵심 메시지

> "인증은 '당신이 누구인가',
> 인가는 '무엇을 할 수 있는가'입니다.
> 
> 좋은 보안은 사용자가 느끼지 못하는 보안입니다.
> UX와 보안의 균형이 핵심입니다."

**기억하세요:**
- 인증 ≠ 인가
- 세션 vs JWT 트레이드오프
- 2FA는 필수
- UX를 희생하지 않는 보안

## 🚀 다음 에피소드 예고

**"Episode 8-5: 웹 보안, XSS와 CSRF 막기"**

웹 공격과 방어:
- XSS 공격 원리
- CSRF 방어
- SQL Injection
- 보안 헤더

"해커는 어떻게 공격할까?"

---

*"보안은 가장 약한 고리만큼만 강합니다.
인증과 인가는 그 첫 번째 방어선입니다."*

**#인증 #인가 #JWT #OAuth #SSO**