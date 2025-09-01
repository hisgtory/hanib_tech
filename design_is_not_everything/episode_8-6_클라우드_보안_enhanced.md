# Episode 8-6: 클라우드 보안, 남의 컴퓨터를 안전하게 쓰는 법

## 🎬 Scene: 10억원이 날아간 아침

```
월요일 아침, AWS 비용 알림

"이번 달 AWS 비용: $900,000"

CTO: "뭐?! 평소에 $3,000인데?"
DevOps: "해킹당했습니다. 비트코인 채굴에..."

[조사 결과]
- S3 버킷: Public으로 열려있음
- Access Key: GitHub에 노출
- EC2: 수백 대 인스턴스 생성
- 리전: 전 세계 16개 리전

원인:
개발자: "테스트하려고 잠깐 public으로..."
신입: "편하게 하려고 키를 코드에..."

결과:
- 직접 손실: 10억원
- 복구 시간: 72시간
- 데이터 유출: 고객 10만명
- 신뢰도: 회복 불가능

교훈: "클라우드는 남의 컴퓨터, 하지만 책임은 내 것"
```

**클라우드 보안은 공동 책임입니다.**

## Part 1: 클라우드 보안 모델

### ☁️ 공동 책임 모델

```
Shared Responsibility Model:

클라우드 제공자 책임 (OF the Cloud):
├─ 물리적 보안 (데이터센터)
├─ 하드웨어 (서버, 스토리지)
├─ 네트워크 인프라
├─ 가상화 레이어
└─ 호스트 OS

경계선 ─────────────────────

고객 책임 (IN the Cloud):
├─ 데이터 암호화
├─ IAM (계정 관리)
├─ 네트워크 설정
├─ OS 패치
├─ 애플리케이션 보안
└─ 방화벽 규칙

서비스별 책임:
IaaS (EC2): 고객 90% / AWS 10%
PaaS (Elastic Beanstalk): 고객 50% / AWS 50%
SaaS (Gmail): 고객 10% / Google 90%

실수 사례:
"AWS가 다 알아서 하겠지" → 10억 날림
"보안은 AWS 책임이야" → 데이터 유출
"기본 설정이면 안전해" → 해킹 당함
```

### 🔐 IAM (Identity and Access Management)

```json
// IAM 정책 예시

{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::123456789012:user/developer"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::my-bucket/dev/*",
      "Condition": {
        "IpAddress": {
          "aws:SourceIp": "203.0.113.0/24"
        },
        "DateGreaterThan": {
          "aws:CurrentTime": "2024-01-01T00:00:00Z"
        }
      }
    }
  ]
}

// 최소 권한 원칙
// ❌ Bad: Admin 권한 남발
{
  "Effect": "Allow",
  "Action": "*",
  "Resource": "*"
}

// ✅ Good: 필요한 권한만
{
  "Effect": "Allow",
  "Action": [
    "s3:GetObject"
  ],
  "Resource": [
    "arn:aws:s3:::my-bucket/public/*"
  ]
}
```

## Part 2: 계정과 접근 관리

### 👤 Multi-Account 전략

```
AWS Organizations 구조:

Root Organization
├── Security OU
│   ├── Audit Account (로그 수집)
│   └── Log Archive Account (장기 보관)
├── Production OU
│   ├── Prod-App Account
│   └── Prod-Data Account
├── Development OU
│   ├── Dev Account
│   └── Staging Account
└── Sandbox OU
    └── Individual Sandboxes

계정 분리 이유:
1. Blast Radius 제한 (피해 최소화)
2. 비용 추적 용이
3. 규정 준수
4. 권한 분리

Cross-Account Access:
// AssumeRole을 통한 접근
aws sts assume-role \
  --role-arn "arn:aws:iam::ACCOUNT-B:role/ReadOnly" \
  --role-session-name "CrossAccountSession"

// Switch Role in Console
1. 콘솔 우측 상단 계정 클릭
2. Switch Role
3. Account ID와 Role Name 입력
4. 색상 지정 (구분용)
```

### 🔑 Secrets 관리

```python
# AWS Secrets Manager 사용

import boto3
import json

class SecretManager:
    def __init__(self):
        self.client = boto3.client('secretsmanager')
    
    def create_secret(self, name, secret_dict):
        """비밀 정보 생성"""
        secret_string = json.dumps(secret_dict)
        
        response = self.client.create_secret(
            Name=name,
            SecretString=secret_string,
            Tags=[
                {'Key': 'Environment', 'Value': 'Production'},
                {'Key': 'Application', 'Value': 'MyApp'}
            ]
        )
        
        # 자동 로테이션 설정
        self.client.rotate_secret(
            SecretId=response['ARN'],
            RotationLambdaARN='arn:aws:lambda:...',
            RotationRules={
                'AutomaticallyAfterDays': 30
            }
        )
        
        return response['ARN']
    
    def get_secret(self, secret_name):
        """비밀 정보 조회"""
        try:
            response = self.client.get_secret_value(
                SecretId=secret_name
            )
            return json.loads(response['SecretString'])
        except Exception as e:
            # CloudWatch에 로깅
            print(f"Failed to retrieve secret: {e}")
            raise

# 환경 변수 대신 Secrets Manager 사용
# ❌ Bad
DB_PASSWORD = os.environ['DB_PASSWORD']

# ✅ Good
secret_manager = SecretManager()
db_config = secret_manager.get_secret('prod/database/credentials')
DB_PASSWORD = db_config['password']

# Parameter Store (간단한 설정값)
ssm = boto3.client('ssm')
parameter = ssm.get_parameter(
    Name='/myapp/prod/api_endpoint',
    WithDecryption=True
)
API_ENDPOINT = parameter['Parameter']['Value']
```

## Part 3: 네트워크 보안

### 🌐 VPC 설계

```
안전한 VPC 아키텍처:

VPC (10.0.0.0/16)
├── Public Subnet (10.0.1.0/24)
│   ├── NAT Gateway
│   ├── ALB
│   └── Bastion Host
├── Private Subnet (10.0.10.0/24)
│   ├── EC2 Instances
│   └── ECS Tasks
└── Database Subnet (10.0.20.0/24)
    └── RDS Instances

Security Groups (상태 유지 방화벽):
```yaml
# Web Server SG
Inbound:
  - Protocol: HTTPS (443)
    Source: 0.0.0.0/0
  - Protocol: HTTP (80)
    Source: 0.0.0.0/0
    
# App Server SG  
Inbound:
  - Protocol: Custom (8080)
    Source: WebServerSG
    
# Database SG
Inbound:
  - Protocol: MySQL (3306)
    Source: AppServerSG

# Bastion SG
Inbound:
  - Protocol: SSH (22)
    Source: MyOfficeIP/32
```

NACLs (무상태 방화벽):
- Subnet 레벨
- 규칙 번호 순서
- 명시적 거부 가능

```

### 🛡 WAF와 DDoS 방어

```javascript
// AWS WAF 규칙 설정

const wafRules = {
  // SQL Injection 방어
  sqlInjection: {
    name: 'SQLiRule',
    statement: {
      sqliMatchStatement: {
        fieldToMatch: {
          allQueryArguments: {}
        },
        textTransformations: [{
          priority: 0,
          type: 'URL_DECODE'
        }, {
          priority: 1,
          type: 'HTML_ENTITY_DECODE'
        }]
      }
    },
    action: { block: {} }
  },
  
  // Rate Limiting
  rateLimiting: {
    name: 'RateLimitRule',
    statement: {
      rateBasedStatement: {
        limit: 2000,  // 5분당 2000 요청
        aggregateKeyType: 'IP'
      }
    },
    action: { block: {} }
  },
  
  // Geo Blocking
  geoBlocking: {
    name: 'GeoBlockRule',
    statement: {
      geoMatchStatement: {
        countryCodes: ['CN', 'RU', 'KP']  // 차단 국가
      }
    },
    action: { block: {} }
  },
  
  // Custom Rules
  customRule: {
    name: 'BadBotBlock',
    statement: {
      byteMatchStatement: {
        fieldToMatch: {
          singleHeader: { name: 'user-agent' }
        },
        searchString: 'BadBot',
        textTransformations: [{
          priority: 0,
          type: 'LOWERCASE'
        }]
      }
    },
    action: { block: {} }
  }
};

// CloudFront + Shield 설정
const ddosProtection = {
  shield: {
    standard: 'Free',  // 기본 DDoS 방어
    advanced: {  // 유료 ($3000/월)
      features: [
        'DDoS Response Team',
        'Advanced Attack Diagnostics',
        'Real-time Metrics',
        'Cost Protection'
      ]
    }
  },
  cloudfront: {
    originShield: true,  // Origin 보호
    customErrorPages: true,  // 에러 페이지
    geoRestriction: true  // 지역 제한
  }
};
```

## Part 4: 데이터 보안

### 🔐 암호화 전략

```python
# 데이터 암호화 구현

class DataEncryption:
    def __init__(self):
        self.kms = boto3.client('kms')
        self.key_id = 'arn:aws:kms:region:account:key/xxx'
    
    def encrypt_at_rest(self):
        """저장 데이터 암호화"""
        # S3 암호화
        s3_encryption = {
            'Rules': [{
                'ApplyServerSideEncryptionByDefault': {
                    'SSEAlgorithm': 'aws:kms',
                    'KMSMasterKeyID': self.key_id
                }
            }]
        }
        
        # RDS 암호화
        rds_config = {
            'StorageEncrypted': True,
            'KmsKeyId': self.key_id
        }
        
        # EBS 암호화
        ebs_config = {
            'Encrypted': True,
            'KmsKeyId': self.key_id
        }
        
        return {
            's3': s3_encryption,
            'rds': rds_config,
            'ebs': ebs_config
        }
    
    def encrypt_in_transit(self):
        """전송 데이터 암호화"""
        # TLS/SSL 강제
        return {
            'alb': {
                'Protocol': 'HTTPS',
                'SslPolicy': 'ELBSecurityPolicy-TLS-1-2-2017-01',
                'Certificates': [{'CertificateArn': 'arn:aws:acm:...'}]
            },
            's3': {
                'aws:SecureTransport': 'true'  # HTTPS만 허용
            },
            'rds': {
                'ForceSSL': True
            }
        }
    
    def client_side_encryption(self, data):
        """클라이언트 측 암호화"""
        # KMS로 데이터 키 생성
        response = self.kms.generate_data_key(
            KeyId=self.key_id,
            KeySpec='AES_256'
        )
        
        # 데이터 암호화
        from cryptography.fernet import Fernet
        cipher = Fernet(response['Plaintext'])
        encrypted_data = cipher.encrypt(data.encode())
        
        return {
            'encrypted_data': encrypted_data,
            'encrypted_key': response['CiphertextBlob']
        }
```

### 📊 로깅과 모니터링

```yaml
# CloudTrail 설정
CloudTrail:
  Trail:
    Name: organization-trail
    S3BucketName: audit-logs-bucket
    IncludeGlobalServiceEvents: true
    IsMultiRegionTrail: true
    EnableLogFileValidation: true
    EventSelectors:
      - ReadWriteType: All
        IncludeManagementEvents: true
        DataResources:
          - Type: AWS::S3::Object
            Values: ["arn:aws:s3:::*/*"]
          - Type: AWS::RDS::DBCluster
            Values: ["arn:aws:rds:*:*:cluster/*"]

# CloudWatch Alarms
Alarms:
  - UnauthorizedAPICalls:
      MetricName: UnauthorizedAPICalls
      Threshold: 1
      Actions: [SNS-SecurityTeam]
      
  - RootAccountUsage:
      MetricName: RootAccountUsage
      Threshold: 1
      Actions: [SNS-CriticalAlert]
      
  - IAMPolicyChanges:
      MetricName: IAMPolicyEventCount
      Threshold: 1
      Actions: [SNS-SecurityTeam]

# Config Rules
ConfigRules:
  - s3-bucket-public-read-prohibited
  - encrypted-volumes
  - iam-password-policy
  - mfa-enabled-for-iam-console-access
  - restricted-ssh
  - rds-encryption-enabled
```

## Part 5: 컴플라이언스

### 📋 규정 준수

```
주요 컴플라이언스:

GDPR (유럽):
□ 개인정보 처리 동의
□ 데이터 이동권
□ 삭제권 (잊혀질 권리)
□ 72시간 내 침해 통지
□ DPO 지정

HIPAA (의료):
□ PHI 암호화
□ 접근 제어
□ 감사 로그
□ BAA 체결

PCI DSS (결제):
□ 카드 데이터 암호화
□ 네트워크 분리
□ 정기 스캔
□ 접근 제한

국내 규정:
□ 개인정보보호법
□ 정보통신망법
□ 전자금융거래법
□ 클라우드 보안 인증

AWS 지원:
- Artifact (규정 문서)
- Compliance Center
- Well-Architected Tool
- Security Hub
```

## Part 6: 인시던트 대응

### 🚨 보안 사고 대응

```python
# 자동화된 인시던트 대응

class IncidentResponse:
    def __init__(self):
        self.sns = boto3.client('sns')
        self.ec2 = boto3.client('ec2')
        self.iam = boto3.client('iam')
    
    def detect_suspicious_activity(self, event):
        """의심 활동 탐지"""
        if event['eventName'] in ['RunInstances', 'CreateAccessKey']:
            if event['sourceIPAddress'] not in WHITELIST_IPS:
                self.respond_to_incident(event)
    
    def respond_to_incident(self, event):
        """인시던트 대응"""
        incident_id = str(uuid.uuid4())
        
        # 1. 격리
        if event['eventName'] == 'RunInstances':
            instance_id = event['responseElements']['instancesSet']['items'][0]['instanceId']
            self.isolate_instance(instance_id)
        
        # 2. 알림
        self.notify_security_team(incident_id, event)
        
        # 3. 증거 수집
        self.collect_evidence(incident_id, event)
        
        # 4. 차단
        if event['userIdentity']['type'] == 'IAMUser':
            self.disable_user(event['userIdentity']['userName'])
        
        return incident_id
    
    def isolate_instance(self, instance_id):
        """인스턴스 격리"""
        # 보안 그룹 변경 (모든 트래픽 차단)
        self.ec2.modify_instance_attribute(
            InstanceId=instance_id,
            Groups=['sg-isolation']  # 격리용 SG
        )
        
        # 스냅샷 생성 (증거 보존)
        self.ec2.create_snapshot(
            Description=f'Incident snapshot for {instance_id}',
            VolumeId=self.get_volume_id(instance_id)
        )
    
    def runbook(self):
        """인시던트 대응 플레이북"""
        return """
        1. 탐지 (5분 이내)
           - CloudWatch 알람
           - GuardDuty 알림
           - 수동 발견
        
        2. 분석 (15분 이내)
           - 영향 범위 파악
           - 공격 벡터 확인
           - 심각도 평가
        
        3. 격리 (30분 이내)
           - 영향받은 리소스 격리
           - 네트워크 차단
           - 계정 비활성화
        
        4. 제거 (2시간 이내)
           - 악성 코드 제거
           - 백도어 확인
           - 설정 복구
        
        5. 복구 (4시간 이내)
           - 백업에서 복원
           - 서비스 재개
           - 모니터링 강화
        
        6. 사후 분석 (48시간 이내)
           - 원인 분석
           - 교훈 도출
           - 프로세스 개선
        """
```

## 🎁 Bonus: 비용 최적화와 보안

### 💰 보안과 비용의 균형

```
비용 효율적인 보안:

1. 자동 정리
- 미사용 리소스 제거
- 오래된 스냅샷 삭제
- 임시 권한 자동 회수

2. Reserved Instances
- 보안 도구용 RI 구매
- Savings Plans 활용

3. Spot Instances
- 개발/테스트 환경
- 배치 처리
- 단, 중요 데이터 주의

4. 계층화
- Hot: 자주 접근 (표준)
- Warm: 가끔 접근 (IA)
- Cold: 아카이브 (Glacier)

월 보안 비용 예산:
- 소규모: $500-1,000
- 중규모: $2,000-5,000
- 대규모: $10,000+

ROI:
보안 투자 $1 = 침해 비용 $6 절감
```

## 💡 핵심 메시지

> "클라우드는 남의 컴퓨터지만,
> 데이터와 책임은 여전히 우리 것입니다.
> 
> 클라우드 제공자는 'OF the Cloud' 보안을,
> 우리는 'IN the Cloud' 보안을 책임집니다.
> 
> 기본 설정을 믿지 말고,
> 최소 권한 원칙을 지키세요."

**기억하세요:**
- Shared Responsibility
- Least Privilege
- Defense in Depth
- Automate Everything

## 🚀 다음 에피소드 예고

**"Episode 7-1: 프로그래밍 언어 선택"**

어떤 언어를 배워야 할까:
- 언어별 특징
- 용도별 추천
- 학습 곡선
- 커리어 영향

"첫 언어가 평생을 좌우한다?"

---

*"There is no cloud, it's just someone else's computer."*

**#클라우드보안 #AWS #IAM #ZeroTrust #DevSecOps**