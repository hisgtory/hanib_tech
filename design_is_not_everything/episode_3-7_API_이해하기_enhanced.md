# 에피소드 3-7: API가 뭐예요? - 디지털 세계의 웨이터

## 🎯 이 글을 읽으면 얻게 되는 것
- API의 개념과 작동 원리 완벽 이해
- REST API vs GraphQL 비교
- API 문서 읽는 방법
- 실제 API 활용 사례

## 🍽️ API를 레스토랑으로 이해하기

### 완벽한 비유
```
🏪 API = 레스토랑의 웨이터

손님 (클라이언트):
"스테이크 하나 주세요"

웨이터 (API):
"네, 주방에 전달하겠습니다"
→ 주문을 정해진 형식으로 전달

주방 (서버):
스테이크 조리

웨이터 (API):
"주문하신 스테이크 나왔습니다"
→ 요리를 손님에게 전달

핵심:
• 손님은 주방에 직접 못 들어감
• 웨이터를 통해서만 소통
• 정해진 메뉴(API 명세)만 주문 가능
```

### API의 정의
```
📖 API (Application Programming Interface)

쉬운 정의:
"프로그램들이 서로 대화하는 방법"

기술적 정의:
"소프트웨어 컴포넌트들이 서로 통신하기 위한 
 규약과 도구의 집합"

실생활 예시:
• 콘센트 = 전기 API
• 리모컨 = TV API  
• ATM = 은행 API
• 배달앱 = 음식점 API
```

## 🌍 API의 종류

### API 분류 체계
```
📊 API 유형별 분류
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
유형        | 설명              | 예시
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Public     | 누구나 사용 가능   | 날씨 API
Private    | 내부용            | 회사 내부 API
Partner    | 파트너사만        | B2B API
Composite  | 여러 API 조합     | 매시업 API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

프로토콜별 분류:
• REST API (80% 시장 점유)
• GraphQL (15%)
• SOAP (레거시)
• gRPC (고성능)
• WebSocket (실시간)
```

## 🔄 REST API 완벽 이해

### REST 원칙
```
🎯 RESTful API 6원칙

1. Client-Server 분리
   클라이언트와 서버는 독립적

2. Stateless (무상태)
   요청마다 필요한 모든 정보 포함

3. Cacheable (캐시 가능)
   응답은 캐싱 가능 여부 명시

4. Uniform Interface (일관된 인터페이스)
   표준화된 방식으로 통신

5. Layered System (계층 구조)
   여러 계층으로 구성 가능

6. Code on Demand (선택적)
   실행 가능한 코드 전송 가능
```

### REST API 구조
```
🏗️ REST API URL 구조

https://api.example.com/v1/users/123/posts?sort=date&limit=10
└─────────────────────┘ └┘ └───┘ └─┘ └───┘ └───────────────┘
      Base URL         버전 리소스 ID 하위리소스  쿼리 파라미터

메서드별 동작:
• GET /users       → 모든 사용자 조회
• GET /users/123   → 특정 사용자 조회
• POST /users      → 새 사용자 생성
• PUT /users/123   → 사용자 정보 수정
• DELETE /users/123 → 사용자 삭제
```

### 실제 API 호출 예시
```javascript
// JavaScript로 API 호출하기

// 1. 사용자 목록 가져오기
fetch('https://api.example.com/users')
  .then(response => response.json())
  .then(users => {
    console.log('사용자 목록:', users);
  });

// 2. 새 사용자 생성
fetch('https://api.example.com/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123'
  },
  body: JSON.stringify({
    name: '홍길동',
    email: 'hong@example.com'
  })
})
.then(response => response.json())
.then(newUser => {
  console.log('생성된 사용자:', newUser);
});

// 3. 사용자 정보 수정
fetch('https://api.example.com/users/123', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: '김철수'
  })
});
```

## 📊 API 요청과 응답

### Request (요청) 구조
```
📤 API 요청 해부하기

POST https://api.shop.com/orders HTTP/1.1
Host: api.shop.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
X-API-Key: abc123xyz

{
  "customer_id": "user_456",
  "items": [
    {
      "product_id": "prod_789",
      "quantity": 2,
      "price": 29900
    }
  ],
  "shipping_address": {
    "street": "강남대로 123",
    "city": "서울",
    "zip": "06234"
  }
}

구성 요소:
• Method: POST (생성)
• URL: 주문 엔드포인트
• Headers: 인증, 콘텐츠 타입
• Body: 주문 데이터
```

### Response (응답) 구조
```
📥 API 응답 해부하기

HTTP/1.1 201 Created
Content-Type: application/json
X-RateLimit-Remaining: 999
X-Response-Time: 145ms

{
  "status": "success",
  "data": {
    "order_id": "ord_20240315_001",
    "total_amount": 59800,
    "status": "pending",
    "created_at": "2024-03-15T10:30:00Z",
    "estimated_delivery": "2024-03-18"
  },
  "message": "주문이 성공적으로 생성되었습니다"
}

상태 코드:
• 2xx: 성공
• 3xx: 리다이렉션
• 4xx: 클라이언트 에러
• 5xx: 서버 에러
```

## 🆚 REST vs GraphQL

### 비교 분석
```
⚔️ REST API vs GraphQL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
특징        | REST            | GraphQL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
데이터 페칭  | 과다/부족 가능   | 정확히 필요한 것만
엔드포인트   | 여러 개         | 단일 엔드포인트
학습 곡선    | 낮음           | 높음
캐싱        | 간단           | 복잡
파일 업로드  | 쉬움           | 어려움
실시간      | 별도 구현       | Subscription
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### GraphQL 예시
```graphql
# GraphQL 쿼리 예시

# REST는 3번 호출 필요
# GraphQL은 1번에 해결

query GetUserWithPosts {
  user(id: "123") {
    name
    email
    posts(limit: 5) {
      title
      content
      comments {
        author
        text
      }
    }
  }
}

# 응답
{
  "data": {
    "user": {
      "name": "홍길동",
      "email": "hong@example.com",
      "posts": [
        {
          "title": "첫 번째 포스트",
          "content": "내용...",
          "comments": [
            {
              "author": "김철수",
              "text": "좋은 글이네요!"
            }
          ]
        }
      ]
    }
  }
}
```

## 🔑 API 인증과 보안

### 인증 방식들
```
🔐 API 인증 방법
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
방식         | 보안 수준 | 사용 예시
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API Key     | 낮음     | 공개 API
Basic Auth  | 보통     | 내부 시스템
OAuth 2.0   | 높음     | 소셜 로그인
JWT Token   | 높음     | 모던 웹앱
mTLS        | 매우높음  | 금융/의료
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### API 키 사용 예시
```javascript
// API 키 사용 패턴

// 1. 헤더에 포함
fetch('https://api.example.com/data', {
  headers: {
    'X-API-Key': 'your-api-key-here'
  }
});

// 2. 쿼리 파라미터로
fetch('https://api.example.com/data?api_key=your-api-key');

// 3. Bearer 토큰
fetch('https://api.example.com/data', {
  headers: {
    'Authorization': 'Bearer your-token-here'
  }
});

// ⚠️ 주의사항
// API 키는 절대 GitHub에 올리지 마세요!
// 환경 변수로 관리하세요
const API_KEY = process.env.API_KEY;
```

## 📖 API 문서 읽는 법

### Swagger/OpenAPI 문서
```
📚 API 문서 구성 요소

1. Overview (개요)
   - API 목적과 기능
   - 버전 정보
   - Base URL

2. Authentication (인증)
   - 인증 방식
   - API 키 발급 방법
   - 토큰 갱신

3. Endpoints (엔드포인트)
   - 각 API 경로
   - HTTP 메서드
   - 파라미터 설명
   - 응답 형식

4. Examples (예제)
   - 실제 요청/응답
   - 각 언어별 코드
   - 에러 케이스

5. Rate Limiting (사용 제한)
   - 분당/시간당 호출 제한
   - 제한 초과 시 대응

6. Error Codes (에러 코드)
   - 에러 유형
   - 해결 방법
```

### API 문서 예시
```yaml
# OpenAPI 3.0 명세 예시
openapi: 3.0.0
info:
  title: 쇼핑몰 API
  version: 1.0.0
  
paths:
  /products:
    get:
      summary: 상품 목록 조회
      parameters:
        - name: category
          in: query
          required: false
          schema:
            type: string
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        200:
          description: 성공
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Product'
```

## 🌟 실제 API 활용 사례

### 인기 Public API
```
🎯 무료로 사용 가능한 API

날씨 정보:
• OpenWeatherMap API
• 실시간 날씨, 예보
• 무료 플랜: 분당 60회

지도/위치:
• Google Maps API
• 지도, 경로, 장소 검색
• 무료 한도: 월 $200

번역:
• Google Translate API
• DeepL API
• 무료 한도 있음

결제:
• Stripe API
• PayPal API
• 거래 수수료만

소셜 미디어:
• Twitter API
• Instagram Basic API
• YouTube Data API
```

### 실전 프로젝트: 날씨 앱
```javascript
// 날씨 API 활용 예시
class WeatherApp {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }
  
  // 현재 날씨 가져오기
  async getCurrentWeather(city) {
    const url = `${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      return {
        temperature: data.main.temp,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed
      };
    } catch (error) {
      console.error('날씨 정보 가져오기 실패:', error);
    }
  }
  
  // 5일 예보
  async getForecast(city) {
    const url = `${this.baseUrl}/forecast?q=${city}&appid=${this.apiKey}`;
    const response = await fetch(url);
    return response.json();
  }
}

// 사용
const weather = new WeatherApp('your-api-key');
weather.getCurrentWeather('Seoul').then(data => {
  console.log(`서울 현재 온도: ${data.temperature}°C`);
});
```

## 🚀 API 설계 베스트 프랙티스

### 좋은 API 설계 원칙
```
✅ API 설계 10계명

1. 직관적인 URL
   /users/123/orders ✅
   /getUserOrders?id=123 ❌

2. 적절한 HTTP 메서드 사용
   GET = 조회, POST = 생성
   PUT = 수정, DELETE = 삭제

3. 일관된 네이밍
   snake_case 또는 camelCase 통일

4. 버전 관리
   /v1/users, /v2/users

5. 페이지네이션
   ?page=2&limit=20

6. 필터링과 정렬
   ?sort=created_at&order=desc

7. 명확한 에러 메시지
   { "error": "사용자를 찾을 수 없습니다" }

8. HATEOAS (링크 제공)
   응답에 관련 리소스 링크 포함

9. 압축 사용
   gzip으로 응답 크기 줄이기

10. 문서화
    Swagger, Postman 문서 제공
```

## 🔧 API 테스트 도구

### 개발자 도구들
```
🛠️ API 테스트 도구
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
도구        | 특징           | 사용 난이도
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Postman    | GUI 기반       | 쉬움
Insomnia   | 깔끔한 UI      | 쉬움
cURL       | 커맨드라인     | 중간
HTTPie     | 간단한 CLI     | 쉬움
Thunder    | VS Code 확장   | 쉬움
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Postman 사용법
```
📮 Postman 기본 사용법

1. 요청 생성
   - New → Request
   - 이름 지정

2. 요청 구성
   - Method 선택 (GET, POST 등)
   - URL 입력
   - Headers 추가
   - Body 작성 (POST인 경우)

3. 환경 변수
   {{base_url}}/users
   변수로 URL 관리

4. 테스트 작성
   pm.test("Status is 200", () => {
     pm.response.to.have.status(200);
   });

5. 컬렉션 저장
   팀과 공유 가능
```

## 💰 API 비즈니스 모델

### API 수익화 전략
```
💵 API 요금 모델
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
모델         | 설명           | 예시
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Freemium    | 기본 무료      | GitHub API
Pay-per-use | 사용량 과금    | AWS API
Tiered      | 단계별 요금    | Stripe API
Subscription| 월정액         | Algolia API
Revenue Share| 수익 공유     | 광고 API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

일반적인 제한:
• Rate Limiting: 시간당 호출 횟수
• Quota: 월별 총 사용량
• Concurrent: 동시 접속 수
• Bandwidth: 데이터 전송량
```

## 🔮 API의 미래

### 2025-2030 트렌드
```
🚀 차세대 API 기술

1. AI-Powered API
   - 자연어로 API 호출
   - 자동 에러 수정
   - 지능형 응답 최적화

2. Event-Driven API
   - 실시간 이벤트 스트리밍
   - WebSocket 확산
   - Server-Sent Events

3. Serverless API
   - 사용한 만큼만 비용
   - 자동 확장
   - 인프라 관리 불필요

4. API Mesh
   - 마이크로서비스 통합
   - 자동 라우팅
   - 서비스 디스커버리

5. Blockchain API
   - 분산 API
   - 스마트 컨트랙트 연동
   - 탈중앙화 인증
```

## 💬 자주 묻는 질문

### Q&A
```
Q: API와 라이브러리의 차이는?
A: API는 네트워크를 통한 통신,
   라이브러리는 코드를 직접 포함

Q: API 키는 어디서 받나요?
A: 각 서비스 개발자 포털에서 가입 후 발급

Q: Rate Limit 초과하면?
A: 429 에러 발생, 잠시 후 재시도
   또는 유료 플랜 업그레이드

Q: API 응답이 느려요
A: 캐싱, CDN, 데이터 압축,
   페이지네이션 활용

Q: CORS 에러가 뭔가요?
A: 브라우저 보안 정책,
   서버에서 허용 설정 필요
```

## 📚 추가 학습 자료

### 추천 리소스
- [MDN Web API](https://developer.mozilla.org/ko/docs/Web/API)
- [REST API Tutorial](https://restfulapi.net/)
- [Public APIs](https://github.com/public-apis/public-apis)
- [Swagger Editor](https://editor.swagger.io/)

### 실습 프로젝트
1. 날씨 정보 대시보드 만들기
2. 번역 API로 다국어 지원
3. 지도 API로 매장 찾기

## 💡 핵심 정리

> "API는 프로그램들이 대화하는 언어다"

1. **API = 인터페이스**: 시스템 간 통신 규약
2. **REST가 대세**: 간단하고 직관적
3. **문서가 중요**: API 문서 읽기는 필수 스킬
4. **보안 우선**: API 키 관리 철저히
5. **실습이 답**: 직접 호출해보며 배우기

API를 이해하면 다양한 서비스를 연결하고 조합하여 강력한 애플리케이션을 만들 수 있습니다. 디지털 세계의 레고 블록, API를 마스터하세요!