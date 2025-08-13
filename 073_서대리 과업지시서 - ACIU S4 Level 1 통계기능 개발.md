# 서대리 과업지시서 - ACIU S4 Level 1 통계기능 개발

**발령일**: 2025년 8월 11일 23:30 KST  
**지시자**: 조대표님  
**수행자**: 서대리  
**지원**: 노팀장 (기술자문)  
**목표**: Level 1 무료 기본버전 3일 완성  

---

## 🎯 **핵심 미션**

**"이어풀기만 완벽하게 구현하라!"**

- 복잡한 statistics.json 구조 **금지**
- LocalStorage 기반 **단순 구조**로만 구현
- 고급 분석 기능 **완전 제외**
- 3일 내 **완벽 작동** 목표

---

## 📋 **Day 1 과업 (내일 완료)**

### **A. 데이터 구조 설계 (4시간)**

#### **LocalStorage 스키마 확정**
```javascript
// 키: 'aicu_progress_v1'
const progressData = {
    // 사용자 기본 정보
    userInfo: {
        registrationDate: '2025-08-11T23:30:00.000Z',
        userName: '김철수',
        examDate: '2025-12-15',
        lastLoginDate: '2025-08-11'
    },
    
    // 기본학습 진도 (핵심: lastQuestion으로 이어풀기)
    basicLearning: {
        lastQuestion: 0,        // 마지막 푼 문제 번호 (0~789)
        totalAttempted: 0,      // 총 시도 문제수
        totalCorrect: 0,        // 총 정답수
        todayAttempted: 0,      // 오늘 시도 문제수
        todayCorrect: 0,        // 오늘 정답수
        lastStudyDate: '2025-08-11'
    },
    
    // 대분류 진도 (카테고리별 독립 이어풀기)
    categories: {
        재산보험: {
            lastQuestion: 0,
            totalAttempted: 0,
            totalCorrect: 0,
            todayAttempted: 0,
            todayCorrect: 0,
            maxQuestions: 197
        },
        특종보험: {
            lastQuestion: 0,
            totalAttempted: 0,
            totalCorrect: 0,
            todayAttempted: 0,
            todayCorrect: 0,
            maxQuestions: 263
        },
        배상보험: {
            lastQuestion: 0,
            totalAttempted: 0,
            totalCorrect: 0,
            todayAttempted: 0,
            todayCorrect: 0,
            maxQuestions: 197
        },
        해상보험: {
            lastQuestion: 0,
            totalAttempted: 0,
            totalCorrect: 0,
            todayAttempted: 0,
            todayCorrect: 0,
            maxQuestions: 132
        }
    }
};
```

#### **필수 함수 3개 구현**
```javascript
// 1. 진도 저장 함수 (가장 중요!)
function saveProgress(mode, questionNumber, isCorrect) {
    // mode: 'basic' 또는 'category-재산보험' 형태
    // questionNumber: 현재 푼 문제 번호
    // isCorrect: 정답 여부
}

// 2. 다음 문제 조회 함수 (이어풀기 핵심!)
function getNextQuestion(mode) {
    // return: { questionNumber: 21, message: "21번부터 계속하기" }
    // 또는: { completed: true, message: "모든 문제 완료!" }
}

// 3. 진도 조회 함수
function getProgress() {
    // return: localStorage에서 진도 데이터 반환
}
```

### **B. 핵심 로직 구현 (4시간)**

#### **이어풀기 정확성 테스트 시나리오**
```javascript
// 테스트 1: 기본학습 이어풀기
// 1-10번 풀이 → getNextQuestion('basic') → 11 반환
// 11-20번 풀이 → getNextQuestion('basic') → 21 반환

// 테스트 2: 대분류 이어풀기
// 재산보험 1-5번 풀이 → getNextQuestion('category-재산보험') → 6 반환
// 특종보험 1-3번 풀이 → getNextQuestion('category-특종보험') → 4 반환

// 테스트 3: 날짜 변경 시
// 어제 20번까지 → 오늘 접속 → todayAttempted = 0, lastQuestion = 20 유지
```

---

## 📋 **Day 2 과업**

### **A. 대문 3개 통계 박스 (4시간)**

#### **박스 1: 보유 문제수**
```javascript
// 고정값으로 단순화
const TOTAL_QUESTIONS = 789; // 기본학습 기준
const CATEGORY_QUESTIONS = {
    재산보험: 197,
    특종보험: 263, 
    배상보험: 197,
    해상보험: 132
};
```

#### **박스 2: 학습 진도**
```javascript
function calculateProgressStats() {
    const progress = getProgress();
    const basic = progress.basicLearning;
    
    // 통합 통계 (기본학습 + 대분류 합산)
    let totalAttempted = basic.totalAttempted;
    let totalCorrect = basic.totalCorrect;
    
    Object.values(progress.categories).forEach(cat => {
        totalAttempted += cat.totalAttempted;
        totalCorrect += cat.totalCorrect;
    });
    
    return {
        progressRate: ((totalAttempted / 789) * 100).toFixed(1),
        accuracyRate: totalAttempted > 0 ? ((totalCorrect / totalAttempted) * 100).toFixed(1) : 0
    };
}
```

#### **박스 3: 오늘 학습**
```javascript
function calculateTodayStats() {
    const progress = getProgress();
    const today = new Date().toISOString().split('T')[0];
    
    // 날짜가 바뀌면 오늘 통계 초기화
    if (progress.basicLearning.lastStudyDate !== today) {
        resetTodayStats();
    }
    
    // 오늘 통계 합산
    let todayTotal = progress.basicLearning.todayAttempted;
    let todayCorrect = progress.basicLearning.todayCorrect;
    
    Object.values(progress.categories).forEach(cat => {
        todayTotal += cat.todayAttempted;
        todayCorrect += cat.todayCorrect;
    });
    
    return {
        todayAttempted: todayTotal,
        todayAccuracyRate: todayTotal > 0 ? ((todayCorrect / todayTotal) * 100).toFixed(1) : 0
    };
}
```

### **B. 실시간 UI 업데이트 (4시간)**
- 문제 풀이 후 즉시 통계 박스 갱신
- 이어풀기 버튼 텍스트 실시간 변경
- "21번부터 계속하기" 정확한 표시

---

## 📋 **Day 3 과업**

### **A. 모든 화면 통계 표시 (4시간)**

#### **기본학습 화면 2줄 통계**
```html
<div id="basic-learning-stats" class="bg-gray-100 p-3 rounded mb-4">
    <div class="text-sm">
        <div><strong>누적:</strong> <span id="basic-total">0</span>문제, 
             <span id="basic-correct">0</span>개 정답, 
             <span id="basic-accuracy">0</span>%</div>
        <div><strong>오늘:</strong> <span id="basic-today">0</span>문제, 
             <span id="basic-today-correct">0</span>개 정답, 
             <span id="basic-today-accuracy">0</span>%</div>
    </div>
</div>
```

#### **대분류 화면 카테고리별 탭**
```html
<div class="category-tabs">
    <div class="tab" data-category="재산보험">
        재산보험 <span class="progress">0/197</span>
    </div>
    <div class="tab" data-category="특종보험">
        특종보험 <span class="progress">0/263</span>
    </div>
    <!-- 나머지 카테고리들... -->
</div>
```

### **B. 최종 테스트 및 버그 수정 (4시간)**

#### **조대표님 테스트 시나리오**
1. **신규 사용자**: 설정 등록 → 기본학습 1번부터 시작 확인
2. **이어풀기 테스트**: 10번까지 풀이 → 앱 재시작 → 11번부터 시작 확인
3. **카테고리 전환**: 재산보험 5번까지 → 특종보험 1번부터 → 재산보험 6번부터 확인
4. **날짜 변경 테스트**: 오늘 통계 0 초기화, 누적 통계 유지 확인
5. **통계 정확성**: 모든 박스 수치 수동 계산과 일치 확인

---

## 🚨 **금지사항 (절대 하지 말 것)**

### ❌ **복잡한 구조 금지**
- statistics.json 파일 생성 **금지**
- 서버 API 연동 **금지**
- 복잡한 데이터베이스 구조 **금지**

### ❌ **고급 기능 금지**
- 학습 패턴 분석 **금지**
- 차트/그래프 **금지**
- 예측/추천 기능 **금지**

### ❌ **오버엔지니어링 금지**
- 200줄 넘는 함수 **금지**
- 복잡한 알고리즘 **금지**
- 미래 확장성 고려 **금지**

---

## ✅ **필수 준수사항**

### 🎯 **핵심 원칙**
1. **단순함이 최고**: localStorage만 사용
2. **이어풀기 최우선**: 정확한 위치 추적
3. **실시간 업데이트**: 클릭 즉시 반영
4. **3일 완성**: 완벽한 작동 상태

### 📊 **성공 기준**
- [ ] 기본학습 이어풀기 100% 정확
- [ ] 4개 카테고리 독립 이어풀기
- [ ] 대문 3개 박스 실시간 업데이트
- [ ] 앱 재시작 후 진도 완벽 복원
- [ ] 날짜 변경 시 오늘 통계 초기화

---

## 📞 **일일 보고 의무**

### **매일 18:00 보고 내용**
1. **금일 완료 사항**: 구체적 기능 목록
2. **테스트 결과**: 성공/실패 여부
3. **발견된 이슈**: 문제점 및 해결 방안
4. **내일 계획**: 구체적 작업 목록

### **막힘 발생 시 즉시 보고**
- 기술적 문제: 노팀장에게 즉시 요청
- 요구사항 불명확: 조대표님께 즉시 질의
- 일정 지연 우려: 즉시 상황 보고

---

## 🚀 **최종 목표**

**"조대표님이 직접 테스트해서 완벽한 이어풀기 동작을 확인할 수 있는 제품"**

### **완성 기준**
- 조대표님 테스트 시나리오 100% 통과
- 모든 기능 버그 없이 작동
- 3일 내 완전한 제품 완성

### **성공 시 보상**
- Level 2, 3 개발 기회 제공
- 기술팀 내 평가 상승
- 다음 프로젝트 우선 배정

---

**서대리, 이 과업지시서를 정확히 숙지하고 즉시 개발에 착수하라!**  
**Level 1 성공이 전체 프로젝트의 성패를 좌우한다!** 🚀

---

**발령**: 2025년 8월 11일 23:30 KST  
**완료 기한**: 2025년 8월 14일 18:00 KST  
**책임자**: 서대리  
**검수자**: 조대표님