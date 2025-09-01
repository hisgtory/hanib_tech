# Episode 10-4: 자연어 처리, AI가 언어를 이해하는 법

## 🎬 Scene: 챗봇이 이해한 순간

```
고객 서비스 개선 프로젝트

Before (규칙 기반 챗봇):
고객: "배송이 너무 느려서 화가 나요"
챗봇: "배송에 대해 문의하셨군요. 배송 조회는..."
고객: "아니, 불만을 말하는 거예요!"
챗봇: "죄송합니다. 이해하지 못했습니다."

After (NLP 챗봇):
고객: "배송이 너무 느려서 화가 나요"
챗봇: "배송 지연으로 불편을 드려 죄송합니다 😔
       주문번호를 알려주시면 즉시 확인해드리겠습니다.
       보상으로 다음 배송비를 무료로 해드릴게요."

차이점:
- 감정 인식: 화남 (부정 0.92)
- 의도 파악: 불만 제기
- 핵심 추출: 배송 지연
- 적절한 대응: 사과 + 해결책

고객 만족도: 45% → 87%
```

**NLP는 텍스트를 이해가 아닌 계산 가능한 형태로 바꾸는 기술입니다.**

## Part 1: NLP 기초

### 📝 텍스트 전처리

```python
# NLP 파이프라인 시작

import nltk
import spacy
from konlpy.tag import Okt  # 한국어

class TextPreprocessor:
    def __init__(self, language='ko'):
        if language == 'ko':
            self.tokenizer = Okt()
        else:
            self.nlp = spacy.load('en_core_web_sm')
    
    def clean_text(self, text):
        """텍스트 정제"""
        # 1. 소문자 변환
        text = text.lower()
        
        # 2. 특수문자 제거
        import re
        text = re.sub(r'[^가-힣a-zA-Z0-9\s]', '', text)
        
        # 3. 공백 정규화
        text = ' '.join(text.split())
        
        return text
    
    def tokenize(self, text):
        """토큰화"""
        # 한국어
        if hasattr(self, 'tokenizer'):
            tokens = self.tokenizer.morphs(text)
            # "나는 학교에 간다" → ["나", "는", "학교", "에", "가", "ㄴ다"]
        
        # 영어
        else:
            doc = self.nlp(text)
            tokens = [token.text for token in doc]
            # "I am going to school" → ["I", "am", "going", "to", "school"]
        
        return tokens
    
    def remove_stopwords(self, tokens):
        """불용어 제거"""
        stopwords_ko = ['은', '는', '이', '가', '을', '를', '의', '에']
        stopwords_en = ['the', 'is', 'at', 'which', 'on']
        
        filtered = [t for t in tokens if t not in stopwords_ko + stopwords_en]
        return filtered
    
    def lemmatize(self, tokens):
        """원형 복원"""
        # going → go, went → go, better → good
        if hasattr(self, 'nlp'):
            doc = self.nlp(' '.join(tokens))
            return [token.lemma_ for token in doc]
        return tokens
    
    def pos_tagging(self, text):
        """품사 태깅"""
        if hasattr(self, 'tokenizer'):
            pos = self.tokenizer.pos(text)
            # [('나', 'Noun'), ('는', 'Josa'), ('학교', 'Noun')]
        else:
            doc = self.nlp(text)
            pos = [(token.text, token.pos_) for token in doc]
            # [('I', 'PRON'), ('am', 'AUX'), ('going', 'VERB')]
        
        return pos

# 사용 예시
processor = TextPreprocessor('ko')
text = "오늘 날씨가 정말 좋네요! 공원에 가고 싶어요."
tokens = processor.tokenize(processor.clean_text(text))
print(tokens)
# ['오늘', '날씨', '가', '정말', '좋', '네요', '공원', '에', '가', '고', '싶', '어요']
```

### 🔢 텍스트 벡터화

```python
# 텍스트를 숫자로 변환

# 1. Bag of Words (BoW)
from sklearn.feature_extraction.text import CountVectorizer

texts = [
    "나는 사과를 좋아한다",
    "나는 바나나를 좋아한다",
    "사과는 빨간색이다"
]

vectorizer = CountVectorizer()
bow_matrix = vectorizer.fit_transform(texts)
print(vectorizer.get_feature_names_out())
# ['나는', '바나나를', '빨간색이다', '사과는', '사과를', '좋아한다']
print(bow_matrix.toarray())
# [[1, 0, 0, 0, 1, 1],  # 첫 번째 문장
#  [1, 1, 0, 0, 0, 1],  # 두 번째 문장
#  [0, 0, 1, 1, 0, 0]]  # 세 번째 문장

# 2. TF-IDF
from sklearn.feature_extraction.text import TfidfVectorizer

tfidf = TfidfVectorizer()
tfidf_matrix = tfidf.fit_transform(texts)
# 자주 나오는 단어는 가중치 낮게, 특별한 단어는 높게

# 3. Word2Vec
from gensim.models import Word2Vec

sentences = [text.split() for text in texts]
model = Word2Vec(sentences, vector_size=100, window=5, min_count=1)

# 단어 벡터
vector = model.wv['사과']  # 100차원 벡터
similar = model.wv.most_similar('사과', topn=3)
# [('바나나', 0.92), ('과일', 0.88), ('빨간색', 0.75)]

# 4. 사전학습 임베딩
import torch
from transformers import BertTokenizer, BertModel

tokenizer = BertTokenizer.from_pretrained('bert-base-multilingual-cased')
model = BertModel.from_pretrained('bert-base-multilingual-cased')

inputs = tokenizer("안녕하세요", return_tensors='pt')
outputs = model(**inputs)
embeddings = outputs.last_hidden_state  # 768차원
```

## Part 2: 주요 NLP 태스크

### 💭 감정 분석 (Sentiment Analysis)

```python
# 감정 분석 구현

class SentimentAnalyzer:
    def __init__(self):
        from transformers import pipeline
        self.analyzer = pipeline(
            "sentiment-analysis",
            model="nlptown/bert-base-multilingual-uncased-sentiment"
        )
    
    def analyze(self, text):
        """감정 분석"""
        result = self.analyzer(text)[0]
        
        # 세부 감정 분류
        emotions = self.detect_emotions(text)
        
        return {
            'sentiment': result['label'],
            'confidence': result['score'],
            'emotions': emotions
        }
    
    def detect_emotions(self, text):
        """세부 감정 감지"""
        emotion_words = {
            'joy': ['행복', '기쁨', '좋아', '최고', '사랑'],
            'anger': ['화남', '짜증', '싫어', '최악', '분노'],
            'sadness': ['슬픔', '우울', '외로움', '눈물'],
            'fear': ['무서움', '두려움', '걱정', '불안'],
            'surprise': ['놀라움', '깜짝', '대박', '헐']
        }
        
        detected = {}
        for emotion, words in emotion_words.items():
            score = sum(1 for word in words if word in text)
            if score > 0:
                detected[emotion] = score / len(words)
        
        return detected

# 리뷰 감정 분석
analyzer = SentimentAnalyzer()

reviews = [
    "이 제품 정말 최고예요! 강력 추천합니다!",
    "배송이 너무 늦고 품질도 별로네요",
    "그냥 그래요. 쓸만한 정도?"
]

for review in reviews:
    result = analyzer.analyze(review)
    print(f"{review[:20]}... -> {result['sentiment']} ({result['confidence']:.2f})")
```

### 🎯 개체명 인식 (NER)

```python
# Named Entity Recognition

class NERExtractor:
    def __init__(self):
        import spacy
        self.nlp = spacy.load("ko_core_news_sm")  # 한국어 모델
    
    def extract_entities(self, text):
        """개체명 추출"""
        doc = self.nlp(text)
        
        entities = {
            'PERSON': [],
            'ORG': [],
            'LOC': [],
            'DATE': [],
            'MONEY': [],
            'PRODUCT': []
        }
        
        for ent in doc.ents:
            if ent.label_ in entities:
                entities[ent.label_].append(ent.text)
        
        return entities
    
    def extract_custom_entities(self, text):
        """커스텀 개체 추출"""
        import re
        
        # 이메일
        emails = re.findall(r'[\w\.-]+@[\w\.-]+', text)
        
        # 전화번호
        phones = re.findall(r'\d{3}-\d{4}-\d{4}', text)
        
        # 주문번호
        orders = re.findall(r'ORD\d{10}', text)
        
        return {
            'emails': emails,
            'phones': phones,
            'orders': orders
        }

# 사용 예시
ner = NERExtractor()
text = """
삼성전자의 이재용 부회장이 2024년 3월 15일 
서울 강남구에서 열린 행사에 참석했습니다.
문의: support@samsung.com, 010-1234-5678
"""

entities = ner.extract_entities(text)
print(entities)
# {'PERSON': ['이재용'], 'ORG': ['삼성전자'], 'LOC': ['서울', '강남구'], 
#  'DATE': ['2024년 3월 15일'], 'MONEY': [], 'PRODUCT': []}
```

### 💬 의도 분류 (Intent Classification)

```python
# 챗봇 의도 분류

class IntentClassifier:
    def __init__(self):
        self.intents = {
            'greeting': ['안녕', '하이', 'hello', '반가워'],
            'goodbye': ['잘가', '바이', '다음에', '안녕히'],
            'order_status': ['주문', '배송', '언제', '도착'],
            'refund': ['환불', '반품', '교환', '취소'],
            'complaint': ['불만', '화남', '짜증', '최악'],
            'praise': ['좋아', '최고', '만족', '추천']
        }
    
    def classify(self, text):
        """의도 분류"""
        text_lower = text.lower()
        scores = {}
        
        for intent, keywords in self.intents.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                scores[intent] = score
        
        if not scores:
            return 'unknown'
        
        return max(scores, key=scores.get)
    
    def extract_slots(self, text, intent):
        """슬롯 추출"""
        slots = {}
        
        if intent == 'order_status':
            # 주문번호 추출
            import re
            order_match = re.search(r'\d{10}', text)
            if order_match:
                slots['order_id'] = order_match.group()
        
        elif intent == 'refund':
            # 제품명 추출
            # 실제로는 NER이나 더 복잡한 로직 필요
            slots['product'] = self.extract_product(text)
        
        return slots

# 챗봇 응답 생성
def generate_response(intent, slots):
    responses = {
        'greeting': "안녕하세요! 무엇을 도와드릴까요?",
        'order_status': f"주문번호 {slots.get('order_id', '')}의 배송 상태를 확인하겠습니다.",
        'refund': "환불 절차를 안내해드리겠습니다.",
        'complaint': "불편을 드려 죄송합니다. 자세한 내용을 말씀해주세요.",
        'unknown': "죄송합니다. 이해하지 못했습니다. 다시 말씀해주세요."
    }
    
    return responses.get(intent, responses['unknown'])
```

## Part 3: 고급 NLP

### 🤖 Question Answering

```python
# 질의응답 시스템

from transformers import pipeline

class QASystem:
    def __init__(self):
        self.qa_pipeline = pipeline(
            "question-answering",
            model="klue/bert-base"  # 한국어 모델
        )
    
    def answer(self, context, question):
        """문서에서 답변 찾기"""
        result = self.qa_pipeline(
            question=question,
            context=context
        )
        
        return {
            'answer': result['answer'],
            'confidence': result['score'],
            'start': result['start'],
            'end': result['end']
        }
    
    def multi_hop_qa(self, documents, question):
        """여러 문서에서 답변 찾기"""
        candidates = []
        
        for doc in documents:
            result = self.answer(doc, question)
            candidates.append(result)
        
        # 가장 신뢰도 높은 답변 선택
        best = max(candidates, key=lambda x: x['confidence'])
        return best

# 사용 예시
qa = QASystem()
context = """
아이폰 15는 2023년 9월에 출시되었습니다.
가격은 128GB 모델 기준 125만원부터 시작합니다.
새로운 A17 Pro 칩셋을 탑재했으며, 
USB-C 포트를 처음으로 채택했습니다.
"""

questions = [
    "아이폰 15는 언제 출시되었나요?",
    "가격은 얼마인가요?",
    "어떤 포트를 사용하나요?"
]

for q in questions:
    answer = qa.answer(context, q)
    print(f"Q: {q}")
    print(f"A: {answer['answer']} (신뢰도: {answer['confidence']:.2f})\n")
```

### 📝 텍스트 요약

```python
# 문서 요약

class TextSummarizer:
    def __init__(self):
        from transformers import pipeline
        self.summarizer = pipeline(
            "summarization",
            model="gogamza/kobart-summarization"
        )
    
    def extractive_summary(self, text, num_sentences=3):
        """추출 요약: 중요한 문장 선택"""
        from sklearn.feature_extraction.text import TfidfVectorizer
        import numpy as np
        
        sentences = text.split('.')
        if len(sentences) <= num_sentences:
            return text
        
        # TF-IDF로 문장 중요도 계산
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(sentences)
        
        # 문장 점수 계산
        scores = np.sum(tfidf_matrix.toarray(), axis=1)
        
        # 상위 n개 문장 선택
        top_indices = np.argsort(scores)[-num_sentences:]
        top_indices.sort()
        
        summary = '. '.join([sentences[i] for i in top_indices])
        return summary + '.'
    
    def abstractive_summary(self, text, max_length=150):
        """생성 요약: 새로운 문장 생성"""
        result = self.summarizer(
            text,
            max_length=max_length,
            min_length=30,
            do_sample=False
        )
        
        return result[0]['summary_text']

# 긴 문서 요약
long_text = """
[긴 뉴스 기사나 보고서 내용]
"""

summarizer = TextSummarizer()
summary = summarizer.abstractive_summary(long_text)
print("요약:", summary)
```

## Part 4: 한국어 NLP

### 🇰🇷 한국어 특수성

```python
# 한국어 NLP 도전과제

class KoreanNLP:
    def __init__(self):
        from konlpy.tag import Okt, Komoran, Kkma
        self.okt = Okt()
        self.komoran = Komoran()
    
    def handle_spacing(self, text):
        """띄어쓰기 교정"""
        from pykospacing import Spacing
        spacing = Spacing()
        corrected = spacing(text)
        return corrected
        # "아버지가방에들어가신다" → "아버지가 방에 들어가신다"
    
    def handle_typos(self, text):
        """맞춤법 교정"""
        from hanspell import spell_checker
        result = spell_checker.check(text)
        return result.checked
        # "맞춤뻡이 틀렸습니다" → "맞춤법이 틀렸습니다"
    
    def extract_keywords(self, text):
        """한국어 키워드 추출"""
        from krwordrank.word import KRWordRank
        
        wordrank = KRWordRank(
            min_count=2,
            max_length=10
        )
        
        keywords = wordrank.extract(text, beta=0.85, max_iter=10)
        return keywords
    
    def analyze_morphology(self, text):
        """형태소 분석 비교"""
        results = {
            'Okt': self.okt.pos(text),
            'Komoran': self.komoran.pos(text)
        }
        
        return results
    
    def handle_neologism(self, text):
        """신조어 처리"""
        slang_dict = {
            'ㅇㅈ': '인정',
            'ㄹㅇ': '리얼',
            '갑분싸': '갑자기 분위기 싸해짐',
            '별다줄': '별걸 다 줄인다'
        }
        
        for slang, meaning in slang_dict.items():
            text = text.replace(slang, meaning)
        
        return text

# 한국어 처리 예시
knlp = KoreanNLP()

text = "아버지가방에들어가신다"
corrected = knlp.handle_spacing(text)
print(f"원문: {text}")
print(f"교정: {corrected}")

# 형태소 분석 차이
text = "롯데마트에서 우유를 샀다"
morphs = knlp.analyze_morphology(text)
for analyzer, result in morphs.items():
    print(f"{analyzer}: {result}")
```

## Part 5: 실전 응용

### 💼 비즈니스 응용

```python
# 고객 리뷰 분석 시스템

class ReviewAnalyzer:
    def __init__(self):
        self.sentiment_analyzer = SentimentAnalyzer()
        self.ner_extractor = NERExtractor()
        
    def analyze_reviews(self, reviews):
        """리뷰 종합 분석"""
        results = {
            'total': len(reviews),
            'positive': 0,
            'negative': 0,
            'neutral': 0,
            'keywords': {},
            'issues': [],
            'features': {}
        }
        
        for review in reviews:
            # 감정 분석
            sentiment = self.sentiment_analyzer.analyze(review)
            if sentiment['confidence'] > 0.7:
                if sentiment['sentiment'] in ['4 stars', '5 stars']:
                    results['positive'] += 1
                elif sentiment['sentiment'] in ['1 star', '2 stars']:
                    results['negative'] += 1
                else:
                    results['neutral'] += 1
            
            # 키워드 추출
            self.extract_keywords(review, results['keywords'])
            
            # 문제점 추출
            if '문제' in review or '불편' in review:
                results['issues'].append(review[:50])
            
            # 기능별 평가
            self.analyze_features(review, results['features'])
        
        return results
    
    def generate_insights(self, analysis):
        """인사이트 생성"""
        insights = []
        
        # 감정 분포
        total = analysis['total']
        pos_ratio = analysis['positive'] / total
        
        if pos_ratio < 0.5:
            insights.append("⚠️ 부정 리뷰가 50% 이상입니다. 개선이 필요합니다.")
        elif pos_ratio > 0.8:
            insights.append("✅ 긍정 리뷰가 80% 이상입니다. 훌륭합니다!")
        
        # 주요 이슈
        if analysis['issues']:
            top_issues = analysis['issues'][:3]
            insights.append(f"주요 문제점: {', '.join(top_issues)}")
        
        # 개선 제안
        if '배송' in analysis['keywords'] and analysis['keywords']['배송'] > 10:
            insights.append("배송 관련 언급이 많습니다. 물류 개선을 고려하세요.")
        
        return insights

# 실제 사용
analyzer = ReviewAnalyzer()
reviews = load_reviews_from_db()
analysis = analyzer.analyze_reviews(reviews)
insights = analyzer.generate_insights(analysis)

print("=== 리뷰 분석 리포트 ===")
print(f"총 리뷰: {analysis['total']}")
print(f"긍정: {analysis['positive']} ({analysis['positive']/analysis['total']*100:.1f}%)")
print(f"부정: {analysis['negative']} ({analysis['negative']/analysis['total']*100:.1f}%)")
print("\n인사이트:")
for insight in insights:
    print(f"  {insight}")
```

## 🎁 Bonus: LLM 활용

### 🚀 Large Language Models

```python
# GPT 활용 예시

import openai

class LLMAssistant:
    def __init__(self, api_key):
        openai.api_key = api_key
    
    def generate_product_description(self, product_info):
        """제품 설명 생성"""
        prompt = f"""
        제품 정보를 바탕으로 매력적인 설명을 작성해주세요:
        제품명: {product_info['name']}
        카테고리: {product_info['category']}
        특징: {', '.join(product_info['features'])}
        타겟: {product_info['target']}
        
        톤: 친근하고 신뢰감 있게
        길이: 100-150자
        """
        
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200,
            temperature=0.7
        )
        
        return response.choices[0].message.content
    
    def improve_ux_writing(self, original_text, context):
        """UX 라이팅 개선"""
        prompt = f"""
        다음 UI 텍스트를 개선해주세요:
        원문: {original_text}
        컨텍스트: {context}
        
        개선 방향:
        - 더 명확하게
        - 더 친근하게
        - 더 간결하게
        """
        
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        
        return response.choices[0].message.content

# 활용 예시
assistant = LLMAssistant(api_key="your-key")

product = {
    'name': '스마트 무드등',
    'category': '조명',
    'features': ['음성 제어', '1600만 컬러', '타이머 기능'],
    'target': '20-30대'
}

description = assistant.generate_product_description(product)
print("생성된 설명:", description)
```

## 💡 핵심 메시지

> "NLP는 언어를 이해하는 것이 아니라
> 패턴을 찾아 계산하는 것입니다.
> 
> 완벽한 이해는 불가능하지만,
> 충분히 유용한 근사치는 가능합니다.
> 
> 언어의 복잡성을 수학으로 풀어내는 것,
> 그것이 NLP의 마법입니다."

**기억하세요:**
- 전처리가 성능의 절반
- 언어별 특성 고려
- 컨텍스트가 핵심
- 평가 지표 설정

## 🚀 다음 에피소드 예고

**"Episode 11-1: 애자일과 스크럼 실전"**

진짜 애자일 이해하기:
- 스프린트 플래닝
- 데일리 스크럼
- 회고와 개선
- 칸반 vs 스크럼

"애자일은 문서가 아니라 문화입니다"

---

*"Language is the dress of thought."
- Samuel Johnson*

**#NLP #자연어처리 #ChatGPT #TextAnalysis #AI**