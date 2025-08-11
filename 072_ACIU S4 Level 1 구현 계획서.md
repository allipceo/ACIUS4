# ACIU S4 Level 1 구현 계획서

**프로젝트**: ACIU 시즌4 통계 기능 구현  
**버전**: Level 1 - 무료 기본버전  
**목표**: 3일 완성  
**철학**: 레고블럭 방식 - 최소 기능 우선 완성  
**작성**: 2025년 8월 11일 23:12 KST

---

## 🎯 **Level 1 핵심 목표**

### **"이어풀기만 완벽하게!"**
- ✅ 기본학습 이어풀기 (1-789번 정확 추적)
- ✅ 대분류학습 이어풀기 (4개 카테고리 독립)
- ✅ 대문 3개 기본 통계 (진도율, 정답률, 금일현황)
- ✅ 간단한 진도 저장/복원

### **구현 방식**
- LocalStorage 기반 (복잡한 statistics.json 없이)
- 최소한의 데이터 구조
- 복잡한 분석 기능 완전 제외

---

## 📅 **3일 개발 일정**

### **Day 1: 이어풀기 핵심 로직 (8시간)**

#### **오전 (4시간): 데이터 구조 설계**
```javascript
// localStorage 기반 단순 진도 추적 스키마
const progressTracker = {
    // 사용자 등록 정보
    userInfo: {
        registrationDate: '2025-08-11T23:12:00.000Z',
        userName: '김철수',
        examDate: '2025-12-15'
    },
    
    // 기본학습 진도
    basicLearning: {
        lastQuestion: 0,        // 마지막 푼 문제 번호 (0~789)
        totalAttempted: 0,      // 총 시도한 문제수
        totalCorrect: 0,        // 총 정답수
        todayAttempted: 0,      // 오늘 시도한 문제수
        todayCorrect: 0,        // 오늘 정답수
        lastStudyDate: '2025-08-11'
    },
    
    // 대분류학습 진도 (4개 카테고리 독립)
    largeCategory: {
        재산보험: {
            lastQuestion: 0,
            totalAttempted: 0,
            totalCorrect: 0,
            todayAttempted: 0,
            todayCorrect: 0,
            totalQuestions: 197  // 카테고리별 전체 문제수
        },
        특종보험: {
            lastQuestion: 0,
            totalAttempted: 0,
            totalCorrect: 0,
            todayAttempted: 0,
            todayCorrect: 0,
            totalQuestions: 263
        },
        배상보험: {
            lastQuestion: 0,
            totalAttempted: 0,
            totalCorrect: 0,
            todayAttempted: 0,
            todayCorrect: 0,
            totalQuestions: 197
        },
        해상보험: {
            lastQuestion: 0,
            totalAttempted: 0,
            totalCorrect: 0,
            todayAttempted: 0,
            todayCorrect: 0,
            totalQuestions: 132
        }
    }
};
```

#### **오후 (4시간): 핵심 함수 구현**
```javascript
// 1. 진도 저장 함수
function saveProgress(mode, questionId, isCorrect) {
    const progress = getProgressData();
    const today = new Date().toISOString().split('T')[0];
    
    if (mode === 'basicLearning') {
        progress.basicLearning.lastQuestion = questionId;
        progress.basicLearning.totalAttempted++;
        if (isCorrect) progress.basicLearning.totalCorrect++;
        
        // 날짜가 바뀌면 오늘 통계 초기화
        if (progress.basicLearning.lastStudyDate !== today) {
            progress.basicLearning.todayAttempted = 0;
            progress.basicLearning.todayCorrect = 0;
            progress.basicLearning.lastStudyDate = today;
        }
        
        progress.basicLearning.todayAttempted++;
        if (isCorrect) progress.basicLearning.todayCorrect++;
        
    } else if (mode.startsWith('largeCategory')) {
        const category = mode.split('-')[1]; // 예: 'largeCategory-재산보험'
        progress.largeCategory[category].lastQuestion = questionId;
        progress.largeCategory[category].totalAttempted++;
        if (isCorrect) progress.largeCategory[category].totalCorrect++;
        
        progress.largeCategory[category].todayAttempted++;
        if (isCorrect) progress.largeCategory[category].todayCorrect++;
    }
    
    localStorage.setItem('aicu_progress', JSON.stringify(progress));
}

// 2. 이어풀기 다음 문제 조회 함수
function getNextQuestion(mode) {
    const progress = getProgressData();
    
    if (mode === 'basicLearning') {
        const nextQuestionId = progress.basicLearning.lastQuestion + 1;
        if (nextQuestionId > 789) {
            return { completed: true, message: '모든 문제를 완료했습니다!' };
        }
        return { questionId: nextQuestionId, total: 789 };
        
    } else if (mode.startsWith('largeCategory')) {
        const category = mode.split('-')[1];
        const categoryData = progress.largeCategory[category];
        const nextQuestionId = categoryData.lastQuestion + 1;
        
        if (nextQuestionId > categoryData.totalQuestions) {
            return { completed: true, message: `${category} 모든 문제를 완료했습니다!` };
        }
        return { questionId: nextQuestionId, total: categoryData.totalQuestions };
    }
}

// 3. 진도 데이터 조회 함수
function getProgressData() {
    const stored = localStorage.getItem('aicu_progress');
    if (stored) {
        return JSON.parse(stored);
    }
    
    // 초기 데이터 생성
    const initialData = progressTracker;
    localStorage.setItem('aicu_progress', JSON.stringify(initialData));
    return initialData;
}
```

### **Day 2: 대문 3개 통계 박스 (8시간)**

#### **오전 (4시간): 통계 계산 로직**
```javascript
// 홈화면 통계 계산 함수
function calculateHomeStatistics() {
    const progress = getProgressData();
    
    // 전체 통계 (기본학습 + 대분류학습 통합)
    let totalAttempted = progress.basicLearning.totalAttempted;
    let totalCorrect = progress.basicLearning.totalCorrect;
    let todayAttempted = progress.basicLearning.todayAttempted;
    let todayCorrect = progress.basicLearning.todayCorrect;
    
    // 대분류 통계 합산
    Object.values(progress.largeCategory).forEach(category => {
        totalAttempted += category.totalAttempted;
        totalCorrect += category.totalCorrect;
        todayAttempted += category.todayAttempted;
        todayCorrect += category.todayCorrect;
    });
    
    return {
        // 박스 1: 보유 문제수
        totalQuestions: 789,
        
        // 박스 2: 학습 진도 현황
        progressRate: totalAttempted > 0 ? ((totalAttempted / 789) * 100).toFixed(1) : 0,
        totalAttempted: totalAttempted,
        accuracyRate: totalAttempted > 0 ? ((totalCorrect / totalAttempted) * 100).toFixed(1) : 0,
        
        // 박스 3: 금일 학습 현황
        todayAttempted: todayAttempted,
        todayAccuracyRate: todayAttempted > 0 ? ((todayCorrect / todayAttempted) * 100).toFixed(1) : 0
    };
}

// 홈화면 통계 업데이트 함수
function updateHomeStatistics() {
    const stats = calculateHomeStatistics();
    
    // 박스 1: 보유 문제수
    document.getElementById('question-count-box').innerHTML = `
        <div class="text-center p-4 bg-blue-100 rounded-lg">
            <h3 class="text-lg font-bold text-blue-800">보유 문제수</h3>
            <p class="text-2xl font-bold text-blue-600">${stats.totalQuestions}개</p>
            <p class="text-sm text-gray-600">인스교재 기준</p>
        </div>
    `;
    
    // 박스 2: 학습 진도 현황
    document.getElementById('progress-box').innerHTML = `
        <div class="text-center p-4 bg-green-100 rounded-lg">
            <h3 class="text-lg font-bold text-green-800">학습 진도</h3>
            <p class="text-2xl font-bold text-green-600">${stats.progressRate}%</p>
            <p class="text-sm text-gray-600">${stats.totalAttempted}/${stats.totalQuestions}문제</p>
            <p class="text-sm text-gray-600">정답률 ${stats.accuracyRate}%</p>
        </div>
    `;
    
    // 박스 3: 금일 학습 현황
    document.getElementById('daily-box').innerHTML = `
        <div class="text-center p-4 bg-orange-100 rounded-lg">
            <h3 class="text-lg font-bold text-orange-800">오늘 학습</h3>
            <p class="text-2xl font-bold text-orange-600">${stats.todayAttempted}문제</p>
            <p class="text-sm text-gray-600">정답률 ${stats.todayAccuracyRate}%</p>
        </div>
    `;
}
```

#### **오후 (4시간): 모드별 통계 표시**
```javascript
// 기본학습 화면 통계 표시
function updateBasicLearningStats() {
    const progress = getProgressData();
    const basic = progress.basicLearning;
    
    document.getElementById('basic-stats').innerHTML = `
        <div class="bg-gray-100 p-3 rounded mb-4">
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <strong>누적 현황:</strong> 
                    ${basic.totalAttempted}문제 풀이, 
                    ${basic.totalCorrect}개 정답, 
                    ${basic.totalAttempted > 0 ? ((basic.totalCorrect / basic.totalAttempted) * 100).toFixed(1) : 0}%
                </div>
                <div>
                    <strong>금일 현황:</strong> 
                    ${basic.todayAttempted}문제 풀이, 
                    ${basic.todayCorrect}개 정답, 
                    ${basic.todayAttempted > 0 ? ((basic.todayCorrect / basic.todayAttempted) * 100).toFixed(1) : 0}%
                </div>
            </div>
        </div>
    `;
}

// 대분류 학습 화면 통계 표시
function updateLargeCategoryStats() {
    const progress = getProgressData();
    const categories = ['재산보험', '특종보험', '배상보험', '해상보험'];
    
    const tabsHTML = categories.map(category => {
        const data = progress.largeCategory[category];
        const progressRate = ((data.totalAttempted / data.totalQuestions) * 100).toFixed(1);
        const accuracyRate = data.totalAttempted > 0 ? ((data.totalCorrect / data.totalAttempted) * 100).toFixed(1) : 0;
        
        return `
            <div class="tab-content" id="${category}-stats">
                <div class="bg-gray-100 p-3 rounded mb-4">
                    <h4 class="font-bold mb-2">${category} 통계</h4>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <strong>누적:</strong> ${data.totalAttempted}/${data.totalQuestions}문제 (${progressRate}%), 정답률 ${accuracyRate}%
                        </div>
                        <div>
                            <strong>금일:</strong> ${data.todayAttempted}문제, 정답률 ${data.todayAttempted > 0 ? ((data.todayCorrect / data.todayAttempted) * 100).toFixed(1) : 0}%
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('category-stats').innerHTML = tabsHTML;
}
```

### **Day 3: 완성 및 테스트 (8시간)**

#### **오전 (4시간): 이어풀기 UI 완성**
```javascript
// 이어풀기 버튼 표시 로직
function updateContinueButtons() {
    const progress = getProgressData();
    
    // 기본학습 이어풀기 버튼
    const basicNext = getNextQuestion('basicLearning');
    const basicButton = document.getElementById('continue-basic');
    if (basicNext.completed) {
        basicButton.innerHTML = '✅ 기본학습 완료';
        basicButton.disabled = true;
    } else {
        basicButton.innerHTML = `${basicNext.questionId}번부터 계속하기`;
        basicButton.onclick = () => startBasicLearning(basicNext.questionId);
    }
    
    // 대분류학습 이어풀기 버튼들
    ['재산보험', '특종보험', '배상보험', '해상보험'].forEach(category => {
        const categoryNext = getNextQuestion(`largeCategory-${category}`);
        const button = document.getElementById(`continue-${category}`);
        
        if (categoryNext.completed) {
            button.innerHTML = `✅ ${category} 완료`;
            button.disabled = true;
        } else {
            button.innerHTML = `${categoryNext.questionId}번부터 계속하기`;
            button.onclick = () => startCategoryLearning(category, categoryNext.questionId);
        }
    });
}
```

#### **오후 (4시간): 통합 테스트 및 버그 수정**

---

## 🎯 **Level 1 성공 기준**

### **필수 기능 체크리스트**
- [ ] 기본학습 1번부터 789번까지 순차적 이어풀기
- [ ] 대분류 4개 카테고리별 독립적 이어풀기
- [ ] 대문 3개 통계 박스 실시간 업데이트
- [ ] 앱 재시작 후 진도 정확히 복원
- [ ] 날짜 변경 시 오늘 통계 자동 초기화

### **사용자 시나리오 테스트**
1. **신규 사용자**: 설정 등록 → 기본학습 1번부터 시작
2. **기존 사용자**: 앱 시작 → 21번부터 이어풀기
3. **다음날 접속**: 오늘 통계 0으로 초기화, 누적 통계 유지
4. **카테고리 전환**: 재산보험 10번까지 → 특종보험 1번부터

---

## 🚀 **Level 2, 3 예고**

### **Level 2: 유료 표준버전 (추후 개발)**
- statistics.json 기반 상세 데이터 수집
- 학습 패턴 분석 (일별, 시간대별)
- 취약점 분석 및 추천 문제 제시
- 상세 통계 차트 및 그래프

### **Level 3: 프리미엄 고급버전 (미래 확장)**
- AI 기반 시험 점수 예측
- 합격 확률 계산 및 학습 플랜 제공
- 실시간 전국 순위 시스템
- 그룹 스터디 및 경쟁 기능

---

## 📞 **일일 진행 보고**

### **매일 18:00 체크포인트**
- [ ] 금일 목표 달성률
- [ ] 발견된 이슈 및 해결책
- [ ] 내일 작업 계획
- [ ] 조대표님 검수 필요 사항

### **최종 완성 기준**
**"조대표님이 직접 테스트해서 완벽한 이어풀기 동작 확인"**

---

**Level 1 개발 시작 준비 완료!** 🚀  
**목표**: 3일 후 완벽한 기본 기능 구현  
**다음 단계**: 사용자 피드백 → Level 2 개발 결정