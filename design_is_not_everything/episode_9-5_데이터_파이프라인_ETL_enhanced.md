# Episode 9-5: 데이터 파이프라인, Raw 데이터가 인사이트가 되기까지

## 🎬 Scene: 대시보드가 멈춘 날

```
월요일 아침, 경영진 회의

CEO: "주말 매출이 왜 0원이죠?"
데이터팀: "대시보드 확인해보겠습니다"

[조사 결과]
- 금요일 밤: API 형식 변경
- 토요일 새벽: ETL 파이프라인 실패
- 주말 내내: 데이터 수집 중단
- 월요일: 잘못된 대시보드

데이터 엔지니어: "파이프라인이 깨졌어요"
PM: "파이프라인이 뭔데요?"
데이터 엔지니어: "데이터가 흐르는 파이프예요"

[긴급 복구]
1. 파이프라인 수정
2. 누락 데이터 백필(backfill)
3. 데이터 검증
4. 알림 시스템 구축

교훈: "데이터도 배관이 필요하다"
```

**데이터 파이프라인은 정보의 수도관입니다.**

## Part 1: ETL의 이해

### 🔄 ETL vs ELT

```
ETL (Extract → Transform → Load):
전통적 방식

Source → Extract → Transform → Load → Data Warehouse
         (추출)     (변환)      (적재)

장점:
- 정제된 데이터만 저장
- 저장 공간 절약
- 일관된 스키마

단점:
- 원본 데이터 손실
- 변환 로직 수정 어려움
- 처리 시간 김

ELT (Extract → Load → Transform):
현대적 방식

Source → Extract → Load → Data Lake → Transform → Analytics
         (추출)     (적재)            (변환)

장점:
- 원본 데이터 보존
- 유연한 변환
- 빠른 수집

단점:
- 스토리지 비용
- 복잡한 쿼리
- 거버넌스 어려움

선택 기준:
데이터 양 적음 + 정형 데이터 → ETL
데이터 양 많음 + 비정형 데이터 → ELT
```

### 📊 데이터 파이프라인 아키텍처

```
실시간 vs 배치:

배치 파이프라인:
매일 새벽 2시 실행
┌─────────┐    ┌─────────┐    ┌──────────┐
│ Sources │───▶│  ETL    │───▶│   DW     │
│         │    │ (Daily) │    │          │
└─────────┘    └─────────┘    └──────────┘

실시간 파이프라인:
이벤트 발생 즉시
┌─────────┐    ┌─────────┐    ┌──────────┐
│ Stream  │───▶│ Process │───▶│ Real-time│
│         │    │(Instant)│    │ Analytics│
└─────────┘    └─────────┘    └──────────┘

Lambda Architecture:
배치 + 실시간 혼합
         ┌─── Batch Layer ───▶ Serving ─┐
Source ──┤                              ├──▶ Query
         └─── Speed Layer ───▶ Layer  ──┘
```

## Part 2: 데이터 수집 (Extract)

### 🎣 다양한 데이터 소스

```python
# 1. Database 추출
import psycopg2
import pandas as pd

def extract_from_postgres():
    conn = psycopg2.connect(
        host="localhost",
        database="production",
        user="etl_user",
        password="secret"
    )
    
    query = """
    SELECT * FROM orders 
    WHERE created_at >= CURRENT_DATE - INTERVAL '1 day'
    """
    
    df = pd.read_sql(query, conn)
    conn.close()
    return df

# 2. API 추출
import requests

def extract_from_api():
    response = requests.get(
        'https://api.example.com/data',
        headers={'Authorization': 'Bearer token'},
        params={'date': '2024-03-01'}
    )
    return response.json()

# 3. 파일 추출 (S3)
import boto3

def extract_from_s3():
    s3 = boto3.client('s3')
    obj = s3.get_object(
        Bucket='data-lake',
        Key='raw/2024/03/01/events.json'
    )
    return pd.read_json(obj['Body'])

# 4. 스트리밍 데이터 (Kafka)
from kafka import KafkaConsumer

def extract_from_kafka():
    consumer = KafkaConsumer(
        'user-events',
        bootstrap_servers=['localhost:9092'],
        value_deserializer=lambda m: json.loads(m.decode('utf-8'))
    )
    
    for message in consumer:
        yield message.value

# 5. 웹 스크래핑
from bs4 import BeautifulSoup

def extract_from_web():
    response = requests.get('https://example.com/data')
    soup = BeautifulSoup(response.text, 'html.parser')
    
    data = []
    for row in soup.find_all('tr'):
        cols = row.find_all('td')
        data.append([col.text for col in cols])
    
    return pd.DataFrame(data)
```

### 🔧 증분 추출 전략

```python
# 증분 추출 (Incremental Extract)

class IncrementalExtractor:
    def __init__(self, source_table, watermark_column):
        self.source_table = source_table
        self.watermark_column = watermark_column
        self.last_watermark = self.get_last_watermark()
    
    def get_last_watermark(self):
        # 마지막 처리 지점 조회
        query = f"""
        SELECT MAX({self.watermark_column}) 
        FROM etl_watermarks 
        WHERE table_name = '{self.source_table}'
        """
        return execute_query(query)[0][0]
    
    def extract(self):
        # 새로운 데이터만 추출
        query = f"""
        SELECT * FROM {self.source_table}
        WHERE {self.watermark_column} > '{self.last_watermark}'
        ORDER BY {self.watermark_column}
        """
        
        data = pd.read_sql(query, connection)
        
        if not data.empty:
            # 새로운 watermark 저장
            new_watermark = data[self.watermark_column].max()
            self.update_watermark(new_watermark)
        
        return data
    
    def update_watermark(self, new_watermark):
        query = f"""
        UPDATE etl_watermarks 
        SET watermark = '{new_watermark}',
            updated_at = NOW()
        WHERE table_name = '{self.source_table}'
        """
        execute_query(query)

# CDC (Change Data Capture)
# Debezium 설정 예시
{
  "name": "inventory-connector",
  "config": {
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "database.hostname": "mysql",
    "database.port": "3306",
    "database.user": "debezium",
    "database.password": "dbz",
    "database.server.id": "184054",
    "database.server.name": "dbserver1",
    "database.whitelist": "inventory",
    "database.history.kafka.bootstrap.servers": "kafka:9092",
    "database.history.kafka.topic": "schema-changes.inventory"
  }
}
```

## Part 3: 데이터 변환 (Transform)

### 🔨 데이터 정제와 변환

```python
# 데이터 변환 파이프라인

class DataTransformer:
    def __init__(self, df):
        self.df = df
    
    def clean_data(self):
        """데이터 정제"""
        # 1. 중복 제거
        self.df = self.df.drop_duplicates()
        
        # 2. 결측값 처리
        self.df['amount'].fillna(0, inplace=True)
        self.df['category'].fillna('Unknown', inplace=True)
        
        # 3. 이상치 제거
        Q1 = self.df['amount'].quantile(0.25)
        Q3 = self.df['amount'].quantile(0.75)
        IQR = Q3 - Q1
        
        self.df = self.df[
            (self.df['amount'] >= Q1 - 1.5 * IQR) &
            (self.df['amount'] <= Q3 + 1.5 * IQR)
        ]
        
        return self
    
    def normalize_data(self):
        """데이터 정규화"""
        # 1. 날짜 형식 통일
        self.df['date'] = pd.to_datetime(self.df['date'])
        
        # 2. 텍스트 정규화
        self.df['email'] = self.df['email'].str.lower().str.strip()
        
        # 3. 카테고리 매핑
        category_map = {
            'elec': 'Electronics',
            'electronics': 'Electronics',
            'cloth': 'Clothing',
            'clothing': 'Clothing'
        }
        self.df['category'] = self.df['category'].map(
            lambda x: category_map.get(x.lower(), x)
        )
        
        return self
    
    def aggregate_data(self):
        """데이터 집계"""
        # 일별 매출 집계
        daily_revenue = self.df.groupby(
            pd.Grouper(key='date', freq='D')
        ).agg({
            'amount': 'sum',
            'order_id': 'count',
            'customer_id': 'nunique'
        }).rename(columns={
            'amount': 'total_revenue',
            'order_id': 'order_count',
            'customer_id': 'unique_customers'
        })
        
        return daily_revenue
    
    def enrich_data(self):
        """데이터 보강"""
        # 1. 파생 변수 생성
        self.df['order_month'] = self.df['date'].dt.month
        self.df['order_dayofweek'] = self.df['date'].dt.dayofweek
        self.df['is_weekend'] = self.df['order_dayofweek'].isin([5, 6])
        
        # 2. 외부 데이터 조인
        customer_data = pd.read_sql(
            "SELECT customer_id, segment, lifetime_value FROM customers",
            connection
        )
        self.df = self.df.merge(customer_data, on='customer_id', how='left')
        
        # 3. 계산 필드
        self.df['average_order_value'] = (
            self.df['amount'] / self.df['quantity']
        )
        
        return self

# 사용 예시
transformer = DataTransformer(raw_data)
clean_data = (transformer
    .clean_data()
    .normalize_data()
    .enrich_data()
    .df)
```

### 🏗 데이터 모델링

```sql
-- Star Schema (별 스키마)

-- Fact Table (사실 테이블)
CREATE TABLE fact_sales (
    sale_id BIGINT PRIMARY KEY,
    date_id INT,
    product_id INT,
    customer_id INT,
    store_id INT,
    quantity INT,
    amount DECIMAL(10,2),
    discount DECIMAL(10,2),
    FOREIGN KEY (date_id) REFERENCES dim_date(date_id),
    FOREIGN KEY (product_id) REFERENCES dim_product(product_id),
    FOREIGN KEY (customer_id) REFERENCES dim_customer(customer_id),
    FOREIGN KEY (store_id) REFERENCES dim_store(store_id)
);

-- Dimension Tables (차원 테이블)
CREATE TABLE dim_date (
    date_id INT PRIMARY KEY,
    date DATE,
    year INT,
    quarter INT,
    month INT,
    week INT,
    day_of_week INT,
    is_weekend BOOLEAN,
    is_holiday BOOLEAN
);

CREATE TABLE dim_product (
    product_id INT PRIMARY KEY,
    product_name VARCHAR(255),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    brand VARCHAR(100),
    price DECIMAL(10,2)
);

-- Slowly Changing Dimensions (SCD)
-- Type 2: 이력 관리
CREATE TABLE dim_customer (
    customer_key INT PRIMARY KEY,
    customer_id INT,
    customer_name VARCHAR(255),
    email VARCHAR(255),
    segment VARCHAR(50),
    valid_from DATE,
    valid_to DATE,
    is_current BOOLEAN
);
```

## Part 4: 데이터 적재 (Load)

### 📦 데이터 웨어하우스

```python
# 다양한 적재 방법

# 1. Bulk Insert
def bulk_load_postgres(df, table_name):
    from io import StringIO
    
    # DataFrame을 CSV 문자열로 변환
    output = StringIO()
    df.to_csv(output, sep='\t', header=False, index=False)
    output.seek(0)
    
    # COPY 명령으로 빠른 적재
    with psycopg2.connect(conn_string) as conn:
        with conn.cursor() as cur:
            cur.copy_from(output, table_name, columns=df.columns)
            conn.commit()

# 2. BigQuery 적재
def load_to_bigquery(df, dataset_id, table_id):
    from google.cloud import bigquery
    
    client = bigquery.Client()
    table_ref = client.dataset(dataset_id).table(table_id)
    
    job_config = bigquery.LoadJobConfig(
        schema_update_options=[
            bigquery.SchemaUpdateOption.ALLOW_FIELD_ADDITION
        ],
        write_disposition="WRITE_APPEND"
    )
    
    job = client.load_table_from_dataframe(
        df, table_ref, job_config=job_config
    )
    job.result()  # 완료 대기

# 3. Snowflake 적재
def load_to_snowflake(df, table_name):
    from snowflake.connector import connect
    from snowflake.connector.pandas_tools import write_pandas
    
    conn = connect(
        user='ETL_USER',
        password='password',
        account='myaccount',
        warehouse='ETL_WH',
        database='ANALYTICS',
        schema='PUBLIC'
    )
    
    success, nchunks, nrows, _ = write_pandas(
        conn, df, table_name,
        auto_create_table=True,
        overwrite=False
    )

# 4. Upsert (Insert or Update)
def upsert_data(df, table_name, unique_key):
    temp_table = f"{table_name}_temp"
    
    # 임시 테이블에 적재
    df.to_sql(temp_table, connection, if_exists='replace')
    
    # Merge 쿼리
    merge_query = f"""
    MERGE {table_name} AS target
    USING {temp_table} AS source
    ON target.{unique_key} = source.{unique_key}
    WHEN MATCHED THEN
        UPDATE SET 
            {', '.join([f"{col} = source.{col}" for col in df.columns])}
    WHEN NOT MATCHED THEN
        INSERT ({', '.join(df.columns)})
        VALUES ({', '.join([f"source.{col}" for col in df.columns])})
    """
    
    execute_query(merge_query)
    execute_query(f"DROP TABLE {temp_table}")
```

## Part 5: 오케스트레이션

### 🎼 Apache Airflow

```python
# Airflow DAG 예시

from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.postgres.operators.postgres import PostgresOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'data-team',
    'depends_on_past': False,
    'start_date': datetime(2024, 3, 1),
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 2,
    'retry_delay': timedelta(minutes=5)
}

dag = DAG(
    'sales_etl_pipeline',
    default_args=default_args,
    description='Daily sales data ETL',
    schedule_interval='0 2 * * *',  # 매일 새벽 2시
    catchup=False
)

# Tasks
def extract_task(**context):
    """데이터 추출"""
    execution_date = context['ds']
    df = extract_sales_data(execution_date)
    df.to_parquet(f'/tmp/sales_{execution_date}.parquet')
    return f'/tmp/sales_{execution_date}.parquet'

def transform_task(**context):
    """데이터 변환"""
    file_path = context['task_instance'].xcom_pull(task_ids='extract')
    df = pd.read_parquet(file_path)
    
    transformer = DataTransformer(df)
    transformed = transformer.clean_data().normalize_data().df
    
    transformed.to_parquet(f'/tmp/transformed_{context["ds"]}.parquet')
    return f'/tmp/transformed_{context["ds"]}.parquet'

def load_task(**context):
    """데이터 적재"""
    file_path = context['task_instance'].xcom_pull(task_ids='transform')
    df = pd.read_parquet(file_path)
    
    load_to_warehouse(df, 'fact_sales')

def validate_task(**context):
    """데이터 검증"""
    checks = [
        "SELECT COUNT(*) FROM fact_sales WHERE date = CURRENT_DATE",
        "SELECT COUNT(*) FROM fact_sales WHERE amount < 0",
        "SELECT COUNT(DISTINCT customer_id) FROM fact_sales"
    ]
    
    for check in checks:
        result = execute_query(check)
        if not validate_result(result):
            raise ValueError(f"Validation failed: {check}")

# Task 정의
extract = PythonOperator(
    task_id='extract',
    python_callable=extract_task,
    dag=dag
)

transform = PythonOperator(
    task_id='transform',
    python_callable=transform_task,
    dag=dag
)

load = PythonOperator(
    task_id='load',
    python_callable=load_task,
    dag=dag
)

validate = PythonOperator(
    task_id='validate',
    python_callable=validate_task,
    dag=dag
)

# Dependencies
extract >> transform >> load >> validate
```

### 📊 모니터링과 알림

```python
# 파이프라인 모니터링

class PipelineMonitor:
    def __init__(self):
        self.metrics = {}
        self.alerts = []
    
    def track_metric(self, name, value):
        """메트릭 추적"""
        self.metrics[name] = {
            'value': value,
            'timestamp': datetime.now()
        }
        
        # CloudWatch로 전송
        cloudwatch = boto3.client('cloudwatch')
        cloudwatch.put_metric_data(
            Namespace='ETL/Pipeline',
            MetricData=[{
                'MetricName': name,
                'Value': value,
                'Timestamp': datetime.now()
            }]
        )
    
    def check_sla(self, pipeline_name, duration):
        """SLA 체크"""
        sla_config = {
            'sales_etl': 3600,  # 1시간
            'user_etl': 1800,   # 30분
        }
        
        if duration > sla_config.get(pipeline_name, 7200):
            self.send_alert(
                f"Pipeline {pipeline_name} exceeded SLA: {duration}s"
            )
    
    def check_data_quality(self, table_name):
        """데이터 품질 체크"""
        checks = {
            'completeness': f"""
                SELECT COUNT(*) as null_count
                FROM {table_name}
                WHERE critical_column IS NULL
            """,
            'freshness': f"""
                SELECT MAX(updated_at) as last_update
                FROM {table_name}
            """,
            'uniqueness': f"""
                SELECT COUNT(*) - COUNT(DISTINCT id) as duplicates
                FROM {table_name}
            """
        }
        
        for check_name, query in checks.items():
            result = execute_query(query)
            if not self.validate_check(check_name, result):
                self.send_alert(f"Data quality issue in {table_name}: {check_name}")
    
    def send_alert(self, message):
        """알림 발송"""
        # Slack
        slack_webhook = os.environ['SLACK_WEBHOOK']
        requests.post(slack_webhook, json={
            'text': f'🚨 ETL Alert: {message}'
        })
        
        # PagerDuty
        if 'CRITICAL' in message:
            trigger_pagerduty_incident(message)
```

## 🎁 Bonus: 실시간 스트리밍

### 🌊 Kafka 스트리밍 파이프라인

```python
# Kafka Streams 처리

from pyspark.sql import SparkSession
from pyspark.sql.functions import *

spark = SparkSession.builder \
    .appName("RealTimeETL") \
    .getOrCreate()

# Kafka에서 스트림 읽기
df = spark \
    .readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "localhost:9092") \
    .option("subscribe", "user-events") \
    .load()

# 데이터 변환
events = df.select(
    col("key").cast("string"),
    from_json(col("value").cast("string"), event_schema).alias("data")
).select("data.*")

# 윈도우 집계
windowed_counts = events \
    .withWatermark("timestamp", "10 minutes") \
    .groupBy(
        window("timestamp", "5 minutes"),
        "event_type"
    ) \
    .count()

# 결과 저장
query = windowed_counts \
    .writeStream \
    .outputMode("append") \
    .format("parquet") \
    .option("path", "/data/stream-output") \
    .option("checkpointLocation", "/checkpoint") \
    .trigger(processingTime='1 minute') \
    .start()

query.awaitTermination()
```

## 💡 핵심 메시지

> "데이터 파이프라인은 원유를 정제하는 정유소입니다.
> Raw 데이터를 비즈니스 가치로 변환합니다.
> 
> 좋은 파이프라인은 보이지 않습니다.
> 매일 조용히, 확실하게 작동합니다.
> 
> 데이터의 품질은 파이프라인의 품질을 넘을 수 없습니다."

**기억하세요:**
- Extract → Transform → Load
- 증분 처리 > 전체 처리
- 모니터링은 필수
- 실패에 대비한 설계

## 🚀 다음 에피소드 예고

**"Episode 11-1: 애자일과 스크럼 실전"**

진짜 애자일이란:
- 스프린트 운영
- 백로그 관리
- 회고와 개선
- 칸반 vs 스크럼

"애자일은 빠르게가 아니라 자주 배우기"

---

*"Without data, you're just another person with an opinion."
- W. Edwards Deming*

**#ETL #데이터파이프라인 #Airflow #DataEngineering #BigData**