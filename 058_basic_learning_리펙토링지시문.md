# 서대리 basic_learning.html 리팩토링 과업 지시서

**작성일**: 2025년 8월 11일 07:00 KST  
**작성자**: 노팀장  
**대상자**: 서대리  
**우선순위**: 최고 (즉시 착수)  
**목표**: basic_learning.html (963줄) → 5개 파일로 안전 분할  
**원칙**: 분할개발 원칙 준수 + 파일명 규칙 준수 + 기능 보존  
**소요시간**: 1-2시간 예상  

---

## 🎯 **리팩토링 개요**

### **현재 문제 상황**
- **파일**: `templates/basic_learning.html`
- **크기**: 963줄 (300줄 기준 대비 321% 초과)
- **구성**: HTML 150줄 + JavaScript 813줄
- **문제점**: 분할개발 원칙 심각 위반, 유지보수성 저하

### **목표 달성**
- **모든 파일 300줄 이하**: ✅ 분할개발 원칙 완전 준수
- **기능 완전 보존**: ✅ 현재 작동하는 모든 기능 유지
- **파일명 규칙 준수**: ✅ Python 호환 파일명 사용
- **안전한 백업**: ✅ 원본 파일 안전 보관

---

## 📋 **분할 전략 (5개 파일)**

### **분할 후 목표 구조**
```
현재: basic_learning.html (963줄)
↓ 안전 분할
목표:
├── templates/basic_learning_main.html (150줄) - HTML 구조
├── static/js/basic_learning_core.js (250줄) - 핵심 로직  
├── static/js/basic_learning_api.js (200줄) - API 통신
├── static/js/basic_learning_ui.js (200줄) - UI 조작
└── static/js/basic_learning_stats.js (163줄) - 통계 처리
```

### **파일명 규칙 준수**
- ✅ **언더스코어(_) 사용**: `basic_learning_core.js`
- ✅ **점(.) 금지**: `.`는 확장자에만 사용
- ✅ **소문자 사용**: 모든 파일명 소문자
- ✅ **의미 명확**: 파일 기능이 이름에서 명확히 드러남

---

## 🔧 **1단계: 안전 백업 (5분)**

### **백업 생성**
```bash
# 원본 파일 안전 백업
cp templates/basic_learning.html templates/basic_learning_original_backup.html

# 백업 확인
ls -la templates/basic_learning*

# 백업 파일 크기 확인
wc -l templates/basic_learning_original_backup.html
```

### **백업 검증**
- [ ] `basic_learning_original_backup.html` 파일 생성 확인
- [ ] 파일 크기 963줄 일치 확인
- [ ] 파일 내용 동일성 확인

---

## 📝 **2단계: HTML 구조 분리 (15분)**

### **새 HTML 파일 생성**
**파일명**: `templates/basic_learning_main.html`

### **HTML 구조 추출 작업**
```html
<!-- templates/basic_learning_main.html -->
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ACIU QUIZ - 기본학습</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js"></script>
</head>
<body class="bg-gray-100 min-h-screen">
    <!-- 기존 HTML 구조만 복사 -->
    <!-- JavaScript <script> 태그는 제외 -->
    
    <!-- JavaScript 파일들 로딩 (순서 중요!) -->
    <script src="/static/js/basic_learning_core.js"></script>
    <script src="/static/js/basic_learning_api.js"></script>
    <script src="/static/js/basic_learning_ui.js"></script>
    <script src="/static/js/basic_learning_stats.js"></script>
    
    <!-- 초기화 스크립트 -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            console.log('=== 분할 구조 basic_learning 초기화 ===');
            if (typeof initializeBasicLearning === 'function') {
                initializeBasicLearning();
            }
        });
    </script>
</body>
</html>
```

### **작업 포인트**
- [ ] `<script>` 태그 내부 JavaScript 코드 **모두 제거**
- [ ] HTML 구조만 유지 (div, form, button 등)
- [ ] 새로운 JavaScript 파일들 로딩 추가
- [ ] 총 라인 수 150줄 이하 확인

---

## 💻 **3단계: JavaScript 코어 모듈 (25분)**

### **파일 생성**
**파일명**: `static/js/basic_learning_core.js`

### **포함 기능**
```javascript
// static/js/basic_learning_core.js
// 파일 목표: 250줄 이하

/* 
 * 기본학습 핵심 로직 모듈
 * - 전역 변수 관리
 * - 모드 설정 관리 
 * - 기본 초기화 함수
 * - 데이터 구조 관리
 */

// 전역 변수 선언
let currentQuestionIndex = 0;
let questions = [];
let userAnswers = [];
let statistics = {
    total: 0,
    correct: 0,
    incorrect: 0
};

// 모드 설정 객체
const MODE_CONFIG = {
    // 기존 MODE_CONFIG 내용 복사
};

// 기본 학습 시스템 클래스
class BasicLearningSystem {
    constructor() {
        this.mode = null;
        this.questions = [];
        this.currentIndex = 0;
        // 기존 생성자 로직
    }
    
    // 핵심 메서드들
    selectMode(mode) {
        // 기존 selectBasicLearningMode 함수 내용
    }
    
    loadData(mode) {
        // 기존 loadBasicLearningData 함수 내용
    }
    
    // 기타 핵심 메서드들...
}

// 전역 인스턴스
let basicLearningSystem = null;

// 초기화 함수
function initializeBasicLearning() {
    console.log('기본학습 코어 모듈 초기화');
    basicLearningSystem = new BasicLearningSystem();
    // 기존 초기화 로직
}

// 모듈 익스포트 (다른 파일에서 사용 가능)
window.BasicLearningCore = {
    initializeBasicLearning,
    BasicLearningSystem,
    MODE_CONFIG
};
```

### **작업 지침**
- [ ] 기존 JavaScript에서 **핵심 로직 함수들** 추출
- [ ] 전역 변수 및 설정 객체들 포함
- [ ] 클래스 기반으로 구조화
- [ ] 다른 모듈에서 접근 가능하도록 window 객체에 등록
- [ ] 총 250줄 이하 확인

---

## 🌐 **4단계: API 통신 모듈 (20분)**

### **파일 생성**
**파일명**: `static/js/basic_learning_api.js`

### **포함 기능**
```javascript
// static/js/basic_learning_api.js
// 파일 목표: 200줄 이하

/*
 * API 통신 전담 모듈
 * - Week2 API 연결
 * - JSON 데이터 로딩
 * - 서버 통신 관리
 * - 에러 처리
 */

class BasicLearningAPI {
    constructor() {
        this.apiBaseUrl = '/api/quiz';
        this.useAPIMode = false;
    }
    
    // Week2 API 연결 확인
    async connectToWeek2API() {
        // 기존 connectToWeek2API 함수 내용
    }
    
    // 퀴즈 세션 시작
    async startWeek2QuizSession(mode) {
        // 기존 startWeek2QuizSession 함수 내용
    }
    
    // API에서 문제 로딩
    async loadQuestionFromAPI(sessionId, questionIndex) {
        // 기존 loadQuestionFromAPI 함수 내용
    }
    
    // JSON 파일에서 데이터 로딩
    async loadFromJSON() {
        // 기존 JSON 로딩 로직
    }
    
    // CSV 파일 로딩 (백업)
    async loadFromCSV(filename) {
        // 기존 CSV 로딩 로직 (Papa.parse 사용)
    }
    
    // 답안 제출
    async submitAnswer(sessionId, questionIndex, answer) {
        // 기존 답안 제출 로직
    }
}

// 전역 인스턴스
let basicLearningAPI = null;

// 초기화 함수
function initializeAPI() {
    console.log('기본학습 API 모듈 초기화');
    basicLearningAPI = new BasicLearningAPI();
}

// 모듈 익스포트
window.BasicLearningAPI = {
    initializeAPI,
    BasicLearningAPI
};

// 자동 초기화
document.addEventListener('DOMContentLoaded', initializeAPI);
```

### **작업 지침**
- [ ] API 관련 함수들만 분리
- [ ] `connectToWeek2API`, `startWeek2QuizSession` 등 포함
- [ ] JSON/CSV 로딩 로직 포함
- [ ] 에러 처리 로직 포함
- [ ] 총 200줄 이하 확인

---

## 🎨 **5단계: UI 조작 모듈 (20분)**

### **파일 생성**
**파일명**: `static/js/basic_learning_ui.js`

### **포함 기능**
```javascript
// static/js/basic_learning_ui.js
// 파일 목표: 200줄 이하

/*
 * UI 조작 전담 모듈
 * - 화면 전환 관리
 * - 문제 표시
 * - 버튼 이벤트 처리
 * - DOM 조작
 */

class BasicLearningUI {
    constructor() {
        this.currentScreen = 'home';
        this.setupEventListeners();
    }
    
    // 이벤트 리스너 설정
    setupEventListeners() {
        // 기존 이벤트 리스너들 설정
    }
    
    // 화면 전환
    showScreen(screenId) {
        // 기존 화면 전환 로직
    }
    
    // 문제 표시
    displayQuestion(question, index) {
        // 기존 displayQuestion 함수 내용
    }
    
    // 답안 버튼 생성
    createAnswerButtons(questionType) {
        // 기존 답안 버튼 생성 로직
    }
    
    // 결과 표시
    showResult(isCorrect, explanation) {
        // 기존 결과 표시 로직
    }
    
    // 진도 업데이트
    updateProgress(current, total) {
        // 기존 진도 업데이트 로직
    }
    
    // 모달 관리
    showModal(title, content) {
        // 기존 모달 표시 로직
    }
    
    hideModal() {
        // 기존 모달 숨김 로직
    }
}

// 전역 인스턴스
let basicLearningUI = null;

// 초기화 함수
function initializeUI() {
    console.log('기본학습 UI 모듈 초기화');
    basicLearningUI = new BasicLearningUI();
}

// 기존 함수들을 전역으로 유지 (호환성)
function goHome() {
    if (basicLearningUI) {
        basicLearningUI.showScreen('home');
    }
}

function selectBasicLearningMode(mode) {
    if (window.BasicLearningCore && window.BasicLearningCore.BasicLearningSystem) {
        // Core 모듈 호출
    }
}

// 모듈 익스포트
window.BasicLearningUI = {
    initializeUI,
    BasicLearningUI,
    goHome,
    selectBasicLearningMode
};

// 자동 초기화
document.addEventListener('DOMContentLoaded', initializeUI);
```

### **작업 지침**
- [ ] UI 관련 함수들만 분리
- [ ] `showScreen`, `displayQuestion`, `createAnswerButtons` 등 포함
- [ ] 기존 전역 함수들 호환성 유지
- [ ] DOM 조작 로직 포함
- [ ] 총 200줄 이하 확인

---

## 📊 **6단계: 통계 처리 모듈 (20분)**

### **파일 생성**
**파일명**: `static/js/basic_learning_stats.js`

### **포함 기능**
```javascript
// static/js/basic_learning_stats.js
// 파일 목표: 163줄 이하

/*
 * 통계 처리 전담 모듈
 * - 학습 통계 계산
 * - 데이터 저장/로딩
 * - 진도 관리
 * - 성과 분석
 */

class BasicLearningStats {
    constructor() {
        this.userStats = this.loadUserStats();
        this.dailyStats = this.loadDailyStats();
    }
    
    // 사용자 통계 로딩
    loadUserStats() {
        // 기존 통계 로딩 로직
    }
    
    // 일일 통계 로딩
    loadDailyStats() {
        // 기존 일일 통계 로직
    }
    
    // 통계 업데이트
    updateStats(isCorrect, questionData) {
        // 기존 통계 업데이트 로직
    }
    
    // 통계 표시 업데이트
    updateStatisticsDisplay() {
        // 기존 updateStatisticsDisplay 함수 내용
    }
    
    // 통계 저장
    saveStats() {
        // localStorage 저장 로직
    }
    
    // 통계 초기화
    resetStats() {
        // 통계 초기화 로직
    }
    
    // 진도율 계산
    calculateProgress() {
        // 진도율 계산 로직
    }
    
    // 정답률 계산
    calculateAccuracy() {
        // 정답률 계산 로직
    }
}

// 전역 인스턴스
let basicLearningStats = null;

// 초기화 함수
function initializeStats() {
    console.log('기본학습 통계 모듈 초기화');
    basicLearningStats = new BasicLearningStats();
}

// 기존 함수들 호환성 유지
function updateDetailedStatistics() {
    if (basicLearningStats) {
        basicLearningStats.updateStatisticsDisplay();
    }
}

// 모듈 익스포트
window.BasicLearningStats = {
    initializeStats,
    BasicLearningStats,
    updateDetailedStatistics
};

// 자동 초기화
document.addEventListener('DOMContentLoaded', initializeStats);
```

### **작업 지침**
- [ ] 통계 관련 함수들만 분리
- [ ] `updateStatisticsDisplay`, `calculateProgress` 등 포함
- [ ] localStorage 관련 로직 포함
- [ ] 기존 전역 함수들 호환성 유지
- [ ] 총 163줄 이하 확인

---

## 🔗 **7단계: 라우트 파일 업데이트 (10분)**

### **routes/learning_routes.py 수정**
```python
# routes/learning_routes.py에서 수정

@learning_bp.route('/basic-learning')
def basic_learning():
    """기본학습 페이지 - 분할 구조 적용"""
    print("=== 기본학습 페이지 접속 (분할 구조) ===")
    current_user_id = check_user_session()
    
    # 새로운 분할 템플릿 사용
    return render_template('basic_learning_main.html', user_id=current_user_id)
```

### **작업 지침**
- [ ] `basic_learning.html` → `basic_learning_main.html` 변경
- [ ] 기존 로직 유지
- [ ] 주석에 분할 구조 적용 명시

---

## ✅ **8단계: 테스트 및 검증 (15분)**

### **기능 테스트 체크리스트**
```bash
# 1. 서버 실행
python app_v2.0.py

# 2. 브라우저 접속
http://localhost:5000/basic-learning
```

### **검증 포인트**
- [ ] **페이지 로딩**: 정상적으로 로딩되는가?
- [ ] **JavaScript 로딩**: 브라우저 콘솔에 초기화 메시지 확인
- [ ] **기능 동작**: 학습 모드 선택 버튼 작동하는가?
- [ ] **문제 로딩**: 문제가 정상적으로 표시되는가?
- [ ] **통계 기능**: 상단 통계 박스가 작동하는가?
- [ ] **네비게이션**: 이전/다음 버튼이 작동하는가?

### **에러 체크**
- [ ] **브라우저 콘솔**: JavaScript 에러 없음 확인
- [ ] **네트워크 탭**: 모든 JS 파일 정상 로딩 확인
- [ ] **서버 로그**: 서버 측 에러 없음 확인

---

## 📊 **9단계: 파일 크기 검증 (5분)**

### **파일 크기 확인**
```bash
# 분할된 파일들 크기 확인
wc -l templates/basic_learning_main.html
wc -l static/js/basic_learning_core.js
wc -l static/js/basic_learning_api.js
wc -l static/js/basic_learning_ui.js
wc -l static/js/basic_learning_stats.js

# 총합 확인
find . -name "basic_learning_*" -exec wc -l {} +
```

### **목표 달성 확인**
- [ ] `basic_learning_main.html`: ≤ 150줄
- [ ] `basic_learning_core.js`: ≤ 250줄
- [ ] `basic_learning_api.js`: ≤ 200줄
- [ ] `basic_learning_ui.js`: ≤ 200줄
- [ ] `basic_learning_stats.js`: ≤ 163줄
- [ ] **모든 파일 300줄 이하**: ✅

---

## 🚨 **에러 발생 시 대응 방안**

### **문제 상황별 대응**

#### **JavaScript 에러 발생 시**
```javascript
// 임시 디버깅 코드 추가
console.log('=== 모듈 로딩 상태 확인 ===');
console.log('BasicLearningCore:', typeof window.BasicLearningCore);
console.log('BasicLearningAPI:', typeof window.BasicLearningAPI);
console.log('BasicLearningUI:', typeof window.BasicLearningUI);
console.log('BasicLearningStats:', typeof window.BasicLearningStats);
```

#### **함수 미정의 에러 시**
1. **원본 backup 파일에서 해당 함수 확인**
2. **올바른 모듈에 함수 추가**
3. **window 객체에 함수 등록 확인**

#### **페이지 로딩 실패 시**
```bash
# 즉시 롤백
cp templates/basic_learning_original_backup.html templates/basic_learning.html

# routes/learning_routes.py 원복
# 'basic_learning_main.html' → 'basic_learning.html'
```

### **긴급 롤백 절차**
```bash
# 1. 원본 파일 복원
cp templates/basic_learning_original_backup.html templates/basic_learning.html

# 2. 라우트 파일 원복
# routes/learning_routes.py에서 템플릿명 원복

# 3. 서버 재시작
# Ctrl+C 후 python app_v2.0.py 재실행

# 4. 기능 확인
# http://localhost:5000/basic-learning 접속 테스트
```

---

## 📋 **완료 보고서 양식**

### **작업 완료 시 보고 내용**
```
=== 리팩토링 완료 보고 ===
작업일: 2025년 8월 11일 XX:XX KST
작업자: 서대리

■ 분할 결과:
□ basic_learning_main.html: XXX줄 (목표: ≤150줄)
□ basic_learning_core.js: XXX줄 (목표: ≤250줄)
□ basic_learning_api.js: XXX줄 (목표: ≤200줄)
□ basic_learning_ui.js: XXX줄 (목표: ≤200줄)
□ basic_learning_stats.js: XXX줄 (목표: ≤163줄)

■ 기능 검증:
□ 페이지 로딩: 성공/실패
□ 학습 모드 선택: 성공/실패
□ 문제 표시: 성공/실패
□ 통계 기능: 성공/실패
□ 네비게이션: 성공/실패

■ 분할개발 원칙 준수:
□ 모든 파일 300줄 이하: ✅/❌
□ 파일명 규칙 준수: ✅/❌
□ 기능 완전 보존: ✅/❌
□ 안전 백업 완료: ✅/❌

■ 발생 이슈:
[이슈 내용 및 해결 방법]

■ 추가 개선 사항:
[향후 개선이 필요한 부분]
```

---

## ⏰ **작업 타임라인**

### **총 소요시간: 1-2시간**
```
1단계: 안전 백업 (5분)
2단계: HTML 구조 분리 (15분)
3단계: JavaScript 코어 모듈 (25분)
4단계: API 통신 모듈 (20분)
5단계: UI 조작 모듈 (20분)
6단계: 통계 처리 모듈 (20분)
7단계: 라우트 파일 업데이트 (10분)
8단계: 테스트 및 검증 (15분)
9단계: 파일 크기 검증 (5분)
---
총계: 135분 (2시간 15분)
```

### **우선순위 작업**
1. **안전 백업 필수** - 실패 시 즉시 복구 가능
2. **순차적 진행** - 각 단계 완료 후 다음 단계
3. **중간 검증** - 각 모듈 완성 후 동작 확인
4. **최종 테스트** - 전체 기능 통합 테스트

---

## 🎯 **성공 기준**

### **필수 달성 목표**
- ✅ **모든 파일 300줄 이하**
- ✅ **기존 기능 100% 보존**
- ✅ **파일명 규칙 완전 준수**
- ✅ **에러 없는 정상 작동**

### **추가 성과 목표**
- ✅ **유지보수성 극대화**
- ✅ **모듈 독립성 확보**
- ✅ **코드 가독성 향상**
- ✅ **향후 확장성 확보**

**서대리님, 위 지시서에 따라 안전하고 체계적인 리팩토링을 진행해 주세요!** 🚀

---

**최종 승인**: 조대표님  
**기술 검토**: 노팀장  
**실행 담당**: 서대리  
**완료 목표**: 2025년 8월 11일 09:00 KST