# Episode 9-2: SQL 쿼리, 디자이너도 데이터를 직접 뽑을 수 있다

## 🎬 Scene: 데이터 요청의 굴레

```
월요일 아침, 급한 데이터가 필요한 순간

디자이너: "지난 주 신규 가입자 중 온보딩 완료율 좀..."
개발자: "지금 버그 수정 중이라... 오후에?"
데이터 분석가: "이번 주 금요일까지는..."

디자이너: (좌절) "그냥 제가 할게요!"

30분 후:
SELECT COUNT(*) 
FROM users 
WHERE created_at >= '2024-03-01'
AND onboarding_completed = true;

결과: 673명 (완료율 67.3%)

PM: "어떻게 한 거예요?"
디자이너: "SQL 배웠어요. 이제 데이터 자유자재로 뽑아요 😎"
```

**SQL을 아는 디자이너는 데이터 드리븐 디자인을 실현합니다.**

## Part 1: SQL이란? (5분 만에 이해하기)

### 📚 SQL = 데이터베이스와 대화하는 언어

```
SQL (Structured Query Language)
= 구조화된 질의 언어
= 데이터베이스에게 질문하는 방법

비유:
데이터베이스 = 거대한 엑셀 파일 모음
SQL = 엑셀 필터 + 함수 + 피벗테이블

엑셀: 수동으로 클릭클릭
SQL: 명령어 한 줄로 끝

예시:
"작년에 가입한 20대 여성 중 구매 경험 있는 사용자"

엑셀: 필터 5번 + 수동 계산
SQL: 
SELECT * FROM users 
WHERE age BETWEEN 20 AND 29 
AND gender = 'F'
AND created_at >= '2023-01-01'
AND purchase_count > 0;
```

### 🎯 디자이너가 SQL로 할 수 있는 것

```
1. 사용자 행동 분석
- 퍼널 분석
- 리텐션 확인
- 사용 패턴 파악

2. A/B 테스트 결과
- 전환율 비교
- 통계적 유의성
- 세그먼트별 분석

3. 디자인 성과 측정
- 클릭률
- 체류 시간
- 완료율

4. 리서치 데이터
- 사용자 세그먼트
- 페르소나 검증
- 행동 패턴

= 개발자 기다릴 필요 없음!
```

## Part 2: SELECT - 데이터 가져오기

### 📖 기본 문법

```sql
-- 기본 구조
SELECT 컬럼명
FROM 테이블명
WHERE 조건
ORDER BY 정렬
LIMIT 개수;

-- 실제 예시: 최근 가입한 사용자 10명
SELECT name, email, created_at
FROM users
WHERE created_at >= '2024-03-01'
ORDER BY created_at DESC
LIMIT 10;
```

### 🔍 WHERE 조건문 마스터

```sql
-- 같다
WHERE status = 'active'

-- 같지 않다
WHERE status != 'deleted'
WHERE status <> 'deleted'

-- 범위
WHERE age >= 20 AND age <= 30
WHERE age BETWEEN 20 AND 30

-- 여러 값 중 하나
WHERE country IN ('KR', 'JP', 'US')

-- 패턴 매칭 (LIKE)
WHERE email LIKE '%@gmail.com'  -- gmail 사용자
WHERE name LIKE '김%'           -- 김씨 성
WHERE phone LIKE '010-%'        -- 010으로 시작

-- NULL 체크
WHERE profile_image IS NULL     -- 프로필 없는 사용자
WHERE deleted_at IS NOT NULL    -- 탈퇴한 사용자

-- 복합 조건
WHERE (age >= 20 AND age <= 30) 
  AND gender = 'F'
  AND created_at >= '2024-01-01'
```

## Part 3: 집계 함수 - 통계 내기

### 📊 5대 집계 함수

```sql
-- 1. COUNT: 개수 세기
SELECT COUNT(*) as total_users
FROM users;
-- 결과: 10,234

-- 2. SUM: 합계
SELECT SUM(amount) as total_revenue
FROM payments
WHERE created_at >= '2024-03-01';
-- 결과: 125,000,000

-- 3. AVG: 평균
SELECT AVG(age) as average_age
FROM users
WHERE status = 'active';
-- 결과: 28.5

-- 4. MAX/MIN: 최대/최소
SELECT 
  MAX(amount) as highest_payment,
  MIN(amount) as lowest_payment
FROM payments;
-- 결과: 1,000,000 / 1,000

-- 5. GROUP BY: 그룹별 집계
SELECT 
  gender,
  COUNT(*) as count,
  AVG(age) as avg_age
FROM users
GROUP BY gender;
-- 결과:
-- M | 5,123 | 30.2
-- F | 5,111 | 26.8
```

### 🎯 실전 예제: 퍼널 분석

```sql
-- 온보딩 퍼널 분석
SELECT 
  COUNT(*) as total_users,
  SUM(CASE WHEN step_1_completed = 1 THEN 1 ELSE 0 END) as step_1,
  SUM(CASE WHEN step_2_completed = 1 THEN 1 ELSE 0 END) as step_2,
  SUM(CASE WHEN step_3_completed = 1 THEN 1 ELSE 0 END) as step_3,
  SUM(CASE WHEN onboarding_completed = 1 THEN 1 ELSE 0 END) as completed
FROM users
WHERE created_at >= '2024-03-01';

-- 결과:
-- total: 1000
-- step_1: 850 (85%)
-- step_2: 650 (65%)
-- step_3: 450 (45%)
-- completed: 400 (40%)

-- 인사이트: Step 2→3에서 이탈 심각!
```

## Part 4: JOIN - 테이블 연결하기

### 🔗 JOIN의 이해

```sql
-- users 테이블
| user_id | name    | age |
|---------|---------|-----|
| 1       | 김민수   | 28  |
| 2       | 이서연   | 25  |

-- orders 테이블
| order_id | user_id | amount |
|----------|---------|--------|
| 101      | 1       | 50000  |
| 102      | 1       | 30000  |
| 103      | 2       | 70000  |

-- JOIN으로 연결
SELECT 
  u.name,
  o.amount
FROM users u
JOIN orders o ON u.user_id = o.user_id;

-- 결과:
-- 김민수 | 50000
-- 김민수 | 30000
-- 이서연 | 70000
```

### 🎭 JOIN 종류별 사용법

```sql
-- INNER JOIN: 양쪽 다 있는 것만
SELECT u.name, o.amount
FROM users u
INNER JOIN orders o ON u.user_id = o.user_id;
-- 구매 이력 있는 사용자만

-- LEFT JOIN: 왼쪽 테이블 전체 + 오른쪽 매칭
SELECT u.name, o.amount
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id;
-- 모든 사용자 (구매 없어도)

-- 실전: 구매 안 한 사용자 찾기
SELECT u.name
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
WHERE o.order_id IS NULL;
```

## Part 5: 실전 쿼리 레시피

### 🎯 디자이너 필수 쿼리 10선

```sql
-- 1. DAU (일일 활성 사용자)
SELECT DATE(login_at) as date, COUNT(DISTINCT user_id) as dau
FROM user_sessions
WHERE login_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(login_at)
ORDER BY date DESC;

-- 2. 리텐션 (재방문율)
SELECT 
  DATE_TRUNC('week', u.created_at) as cohort_week,
  COUNT(DISTINCT u.user_id) as cohort_size,
  COUNT(DISTINCT s.user_id) as week_1_retained
FROM users u
LEFT JOIN user_sessions s 
  ON u.user_id = s.user_id 
  AND s.login_at BETWEEN u.created_at + INTERVAL '7 days' 
                     AND u.created_at + INTERVAL '14 days'
GROUP BY cohort_week;

-- 3. 기능별 사용률
SELECT 
  feature_name,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_clicks
FROM feature_events
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY feature_name
ORDER BY unique_users DESC;

-- 4. 전환율 (Conversion Rate)
SELECT 
  COUNT(DISTINCT user_id) as visitors,
  COUNT(DISTINCT CASE WHEN purchased = 1 THEN user_id END) as purchasers,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN purchased = 1 THEN user_id END) 
        / COUNT(DISTINCT user_id), 2) as conversion_rate
FROM user_events
WHERE event_date >= '2024-03-01';

-- 5. 평균 세션 시간
SELECT 
  AVG(EXTRACT(EPOCH FROM (logout_at - login_at))/60) as avg_session_minutes
FROM user_sessions
WHERE logout_at IS NOT NULL;
```

### 📊 A/B 테스트 분석

```sql
-- A/B 테스트 결과 분석
WITH test_results AS (
  SELECT 
    experiment_variant,
    COUNT(*) as users,
    SUM(converted) as conversions,
    AVG(converted) * 100 as conversion_rate
  FROM ab_test_results
  WHERE experiment_name = 'new_onboarding'
  GROUP BY experiment_variant
)
SELECT 
  *,
  conversion_rate - LAG(conversion_rate) OVER (ORDER BY experiment_variant) as lift
FROM test_results;

-- 결과:
-- A (Control) | 1000 | 100 | 10.0% | NULL
-- B (Test)    | 1000 | 150 | 15.0% | 5.0%
```

## Part 6: SQL 도구와 팁

### 🛠 추천 SQL 도구

```
초보자용:
1. TablePlus
   - 직관적 UI
   - 자동완성
   - 시각화

2. DBeaver
   - 무료
   - 모든 DB 지원
   - 쿼리 빌더

3. Metabase
   - 노코드 쿼리
   - 대시보드
   - 공유 쉬움

고급:
1. DataGrip
   - JetBrains 제품
   - 강력한 기능
   - 리팩토링

2. BigQuery (Google)
   - 빅데이터
   - 웹 기반
   - 빠른 속도
```

### 💡 SQL 작성 팁

```sql
-- 1. 항상 LIMIT로 시작
SELECT * FROM users LIMIT 10;
-- 전체 데이터 실수 방지

-- 2. 주석 활용
SELECT 
  user_id,
  name,
  -- 30일 이내 가입자를 신규로 정의
  CASE 
    WHEN created_at >= CURRENT_DATE - 30 THEN 'New'
    ELSE 'Existing'
  END as user_type
FROM users;

-- 3. WITH문으로 가독성 향상
WITH active_users AS (
  SELECT user_id 
  FROM users 
  WHERE status = 'active'
)
SELECT COUNT(*) FROM active_users;

-- 4. 날짜 다루기
-- 오늘
WHERE date = CURRENT_DATE
-- 지난 7일
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
-- 이번 달
WHERE DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)
```

## 🎁 Bonus: SQL 치트시트

### 📝 자주 쓰는 패턴

```sql
-- 중복 제거
SELECT DISTINCT category FROM products;

-- 순위 매기기
SELECT 
  name,
  score,
  RANK() OVER (ORDER BY score DESC) as ranking
FROM leaderboard;

-- 누적 합계
SELECT 
  date,
  revenue,
  SUM(revenue) OVER (ORDER BY date) as cumulative_revenue
FROM daily_revenue;

-- 전월 대비
SELECT 
  DATE_TRUNC('month', date) as month,
  SUM(revenue) as revenue,
  LAG(SUM(revenue)) OVER (ORDER BY DATE_TRUNC('month', date)) as prev_month
FROM sales
GROUP BY DATE_TRUNC('month', date);
```

## 📊 SQL 학습 로드맵

```
Week 1: SELECT 기초
- SELECT, FROM, WHERE
- ORDER BY, LIMIT
- 기본 집계 함수

Week 2: GROUP BY와 JOIN
- GROUP BY, HAVING
- INNER JOIN
- LEFT/RIGHT JOIN

Week 3: 고급 기능
- CASE WHEN
- Subquery
- Window Functions

Week 4: 실전 적용
- 실제 데이터 분석
- 대시보드 만들기
- 자동화 스크립트

학습 리소스:
- SQLBolt (무료 인터랙티브)
- Mode Analytics SQL Tutorial
- W3Schools SQL
- Codecademy SQL
```

## 💡 핵심 메시지

> "SQL은 디자이너의 초능력입니다.
> 데이터를 직접 다룰 수 있다는 것은
> 가설을 즉시 검증할 수 있다는 의미입니다.
> 
> 개발자를 기다리지 마세요.
> 직접 데이터와 대화하세요."

**기억하세요:**
- SQL = 질문하는 언어
- SELECT로 시작
- WHERE로 필터
- JOIN으로 연결

## 🚀 다음 에피소드 예고

**"Episode 9-3: 데이터 시각화, 숫자를 스토리로"**

데이터를 매력적으로 표현하기:
- 차트 선택법
- 대시보드 설계
- 인터랙티브 시각화
- 스토리텔링

"왜 어떤 대시보드는 한눈에 들어올까?"

---

*"데이터는 새로운 석유입니다.
SQL은 그것을 캐내는 도구입니다.
디자이너여, 데이터를 두려워하지 마세요."*

**#SQL #데이터분석 #데이터드리븐 #디자이너SQL #쿼리**