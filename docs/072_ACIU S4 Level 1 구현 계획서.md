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
- ✅ **사용자 등록 및 관리 시스템**

### **구현 방식**
- LocalStorage 기반 (복잡한 statistics.json 없이)
- 최소한의 데이터 구조
- 복잡한 분석 기능 완전 제외

---

## 👤 **사용자 등록 해결방안**

### **시작화면 설계 원칙**
1. **"3초 등록"**: 최소한의 정보로 즉시 시작
2. **"기존 사용자 우선"**: 등록된 사용자는 바로 홈화면
3. **"게스트 모드 제공"**: 즉시 체험 가능한 진입 장벽 제거
4. **"수정 가능"**: 언제든지 정보 변경 가능

### **시작화면 플로우**
```
앱 시작 → 사용자 등록 여부 확인 → 분기
    ↓
기존 사용자: 바로 대문
신규 사용자: 등록 선택 화면
    ↓
게스트 등록: 기본값으로 즉시 대문
사용자 등록: 정보 입력 후 대문
```

### **등록 선택 화면 설계**
```html
<!-- 등록 선택 화면 HTML 구조 -->
<div id="registration-choice-screen" class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div class="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <!-- 로고 및 제목 -->
        <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-gray-800">ACIU S4</h1>
            <p class="text-gray-600">보험계리사 학습 도우미</p>
        </div>
        
        <!-- 환영 메시지 -->
        <div class="text-center mb-6">
            <h2 class="text-lg font-semibold text-gray-700 mb-2">환영합니다!</h2>
            <p class="text-sm text-gray-600">학습을 시작하기 위해 등록 방법을 선택해주세요.</p>
        </div>
        
        <!-- 등록 선택 버튼들 -->
        <div class="space-y-4">
            <!-- 게스트 등록 버튼 -->
            <button id="guest-registration-btn" 
                    class="w-full p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <div class="text-left">
                    <h3 class="font-semibold text-gray-800">게스트로 시작하기</h3>
                    <p class="text-sm text-gray-600">기본 설정으로 즉시 학습 시작</p>
                    <p class="text-xs text-gray-500 mt-1">• 성명: 게스트</p>
                    <p class="text-xs text-gray-500">• 시험일: 2025년 9월 13일</p>
                </div>
            </button>
            
            <!-- 사용자 등록 버튼 -->
            <button id="user-registration-btn" 
                    class="w-full p-4 border-2 border-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div class="text-left">
                    <h3 class="font-semibold text-blue-800">사용자 등록하기</h3>
                    <p class="text-sm text-blue-600">개인 정보를 입력하여 맞춤 학습</p>
                    <p class="text-xs text-blue-500 mt-1">• 이름과 시험일 설정</p>
                    <p class="text-xs text-blue-500">• 개인화된 학습 경험</p>
                </div>
            </button>
        </div>
    </div>
</div>
```

### **사용자 등록 폼 설계**
```html
<!-- 사용자 등록 폼 HTML 구조 -->
<div id="user-registration-screen" class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div class="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <!-- 헤더 -->
        <div class="text-center mb-6">
            <button id="back-to-choice-btn" class="absolute top-4 left-4 text-gray-600 hover:text-gray-800">
                ← 뒤로가기
            </button>
            <h1 class="text-2xl font-bold text-gray-800">사용자 등록</h1>
            <p class="text-gray-600">개인 정보를 입력해주세요</p>
        </div>
        
        <!-- 사용자 등록 폼 -->
        <form id="user-registration-form" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <input type="text" id="userName" required 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="홍길동">
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">시험일</label>
                <input type="date" id="examDate" required 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       min="2025-01-01">
            </div>
            
            <button type="submit" 
                    class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                학습 시작하기
            </button>
        </form>
    </div>
</div>
```

### **업데이트된 JavaScript 로직**
```javascript
// 앱 시작 시 실행 함수
function initializeApp() {
    const existingUser = checkExistingUser();
    
    if (existingUser) {
        // 기존 사용자는 바로 홈화면
        showHomeScreen();
    } else {
        // 신규 사용자는 등록 선택 화면
        showRegistrationChoiceScreen();
    }
}

// 등록 선택 화면 표시
function showRegistrationChoiceScreen() {
    hideAllScreens();
    document.getElementById('registration-choice-screen').style.display = 'flex';
    
    // 이벤트 리스너 등록
    document.getElementById('guest-registration-btn').addEventListener('click', handleGuestRegistration);
    document.getElementById('user-registration-btn').addEventListener('click', showUserRegistrationScreen);
}

// 사용자 등록 화면 표시
function showUserRegistrationScreen() {
    hideAllScreens();
    document.getElementById('user-registration-screen').style.display = 'flex';
    
    // 이벤트 리스너 등록
    document.getElementById('back-to-choice-btn').addEventListener('click', showRegistrationChoiceScreen);
    document.getElementById('user-registration-form').addEventListener('submit', handleUserRegistration);
}

// 게스트 등록 처리
function handleGuestRegistration() {
    const guestData = {
        userInfo: {
            registrationDate: '2025-08-12T00:00:00.000Z',
            userName: '게스트',
            examDate: '2025-09-13',
            userType: 'guest'
        },
        basicLearning: {
            lastQuestion: 0,
            totalAttempted: 0,
            totalCorrect: 0,
            todayAttempted: 0,
            todayCorrect: 0,
            lastStudyDate: new Date().toISOString().split('T')[0]
        },
        largeCategory: {
            재산보험: { lastQuestion: 0, totalAttempted: 0, totalCorrect: 0, todayAttempted: 0, todayCorrect: 0, totalQuestions: 197 },
            특종보험: { lastQuestion: 0, totalAttempted: 0, totalCorrect: 0, todayAttempted: 0, todayCorrect: 0, totalQuestions: 263 },
            배상보험: { lastQuestion: 0, totalAttempted: 0, totalCorrect: 0, todayAttempted: 0, todayCorrect: 0, totalQuestions: 197 },
            해상보험: { lastQuestion: 0, totalAttempted: 0, totalCorrect: 0, todayAttempted: 0, todayCorrect: 0, totalQuestions: 132 }
        }
    };
    
    localStorage.setItem('aicu_progress', JSON.stringify(guestData));
    showHomeScreen();
}

// 사용자 등록 처리 함수 (업데이트)
function handleUserRegistration(event) {
    event.preventDefault();
    
    const userName = document.getElementById('userName').value.trim();
    const examDate = document.getElementById('examDate').value;
    
    // 입력값 검증
    if (!userName || userName.length < 2) {
        alert('이름을 2글자 이상 입력해주세요.');
        return;
    }
    
    if (!examDate) {
        alert('시험일을 선택해주세요.');
        return;
    }
    
    // 시험일 유효성 검증 (오늘 이후)
    const today = new Date();
    const selectedDate = new Date(examDate);
    if (selectedDate <= today) {
        alert('시험일은 오늘 이후로 설정해주세요.');
        return;
    }
    
    // 사용자 정보 저장
    const userData = {
        userInfo: {
            registrationDate: new Date().toISOString(),
            userName: userName,
            examDate: examDate,
            userType: 'registered'
        },
        basicLearning: {
            lastQuestion: 0,
            totalAttempted: 0,
            totalCorrect: 0,
            todayAttempted: 0,
            todayCorrect: 0,
            lastStudyDate: new Date().toISOString().split('T')[0]
        },
        largeCategory: {
            재산보험: { lastQuestion: 0, totalAttempted: 0, totalCorrect: 0, todayAttempted: 0, todayCorrect: 0, totalQuestions: 197 },
            특종보험: { lastQuestion: 0, totalAttempted: 0, totalCorrect: 0, todayAttempted: 0, todayCorrect: 0, totalQuestions: 263 },
            배상보험: { lastQuestion: 0, totalAttempted: 0, totalCorrect: 0, todayAttempted: 0, todayCorrect: 0, totalQuestions: 197 },
            해상보험: { lastQuestion: 0, totalAttempted: 0, totalCorrect: 0, todayAttempted: 0, todayCorrect: 0, totalQuestions: 132 }
        }
    };
    
    localStorage.setItem('aicu_progress', JSON.stringify(userData));
    showHomeScreen();
}

// 기존 사용자 확인 함수 (업데이트)
function checkExistingUser() {
    const progress = localStorage.getItem('aicu_progress');
    if (progress) {
        const data = JSON.parse(progress);
        if (data.userInfo && data.userInfo.userName) {
            return data.userInfo;
        }
    }
    return null;
}

// 모든 화면 숨기기
function hideAllScreens() {
    const screens = [
        'registration-choice-screen',
        'user-registration-screen',
        'home-screen'
    ];
    
    screens.forEach(screenId => {
        const screen = document.getElementById(screenId);
        if (screen) screen.style.display = 'none';
    });
}

// 홈화면 표시 (업데이트)
function showHomeScreen() {
    hideAllScreens();
    document.getElementById('home-screen').style.display = 'block';
    
    // 홈화면 초기화
    displayUserInfo();
    updateHomeStatistics();
    updateContinueButtons();
}

// 홈화면 사용자 정보 표시 (업데이트)
function displayUserInfo() {
    const progress = getProgressData();
    const user = progress.userInfo;
    
    const userTypeBadge = user.userType === 'guest' 
        ? '<span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">게스트</span>'
        : '<span class="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">등록 사용자</span>';
    
    const userInfoHTML = `
        <div class="bg-white p-4 rounded-lg shadow mb-4">
            <div class="flex justify-between items-center">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <h3 class="font-bold text-gray-800">${user.userName}님</h3>
                        ${userTypeBadge}
                    </div>
                    <p class="text-sm text-gray-600">시험일: ${user.examDate}</p>
                    <p class="text-xs text-gray-500">등록일: ${new Date(user.registrationDate).toLocaleDateString()}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="showUserEditModal()" class="text-blue-600 hover:underline text-sm">
                        정보 수정
                    </button>
                    <button onclick="showDataResetModal()" class="text-red-600 hover:underline text-sm">
                        데이터 초기화
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('user-info-section').innerHTML = userInfoHTML;
}

// 데이터 초기화 모달
function showDataResetModal() {
    const modal = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
                <h3 class="text-lg font-bold mb-4 text-red-600">데이터 초기화</h3>
                <p class="text-gray-600 mb-4">모든 학습 데이터가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.</p>
                <div class="flex space-x-3">
                    <button onclick="resetAllData()" class="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700">
                        초기화
                    </button>
                    <button onclick="closeModal()" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400">
                        취소
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modal);
}

// 모든 데이터 초기화
function resetAllData() {
    localStorage.removeItem('aicu_progress');
    closeModal();
    showRegistrationChoiceScreen();
}
```

### **사용자 정보 수정 기능**
```javascript
// 홈화면에 사용자 정보 표시 및 수정 기능
function displayUserInfo() {
    const progress = getProgressData();
    const user = progress.userInfo;
    
    const userInfoHTML = `
        <div class="bg-white p-4 rounded-lg shadow mb-4">
            <div class="flex justify-between items-center">
                <div>
                    <h3 class="font-bold text-gray-800">${user.userName}님</h3>
                    <p class="text-sm text-gray-600">시험일: ${user.examDate}</p>
                    <p class="text-xs text-gray-500">등록일: ${new Date(user.registrationDate).toLocaleDateString()}</p>
                </div>
                <button onclick="showUserEditModal()" class="text-blue-600 hover:underline text-sm">
                    정보 수정
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('user-info-section').innerHTML = userInfoHTML;
}

// 사용자 정보 수정 모달
function showUserEditModal() {
    const progress = getProgressData();
    const user = progress.userInfo;
    
    const modal = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
                <h3 class="text-lg font-bold mb-4">사용자 정보 수정</h3>
                <form id="user-edit-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">이름</label>
                        <input type="text" id="editUserName" value="${user.userName}" required 
                               class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">시험일</label>
                        <input type="date" id="editExamDate" value="${user.examDate}" required 
                               class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    </div>
                    <div class="flex space-x-3">
                        <button type="submit" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                            저장
                        </button>
                        <button type="button" onclick="closeModal()" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400">
                            취소
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
    
    // 수정 폼 이벤트 리스너
    document.getElementById('user-edit-form').addEventListener('submit', handleUserEdit);
}

// 사용자 정보 수정 처리
function handleUserEdit(event) {
    event.preventDefault();
    
    const userName = document.getElementById('editUserName').value.trim();
    const examDate = document.getElementById('editExamDate').value;
    
    // 검증 로직 (등록과 동일)
    if (!userName || userName.length < 2) {
        alert('이름을 2글자 이상 입력해주세요.');
        return;
    }
    
    if (!examDate) {
        alert('시험일을 선택해주세요.');
        return;
    }
    
    // 데이터 업데이트
    const progress = getProgressData();
    progress.userInfo.userName = userName;
    progress.userInfo.examDate = examDate;
    
    localStorage.setItem('aicu_progress', JSON.stringify(progress));
    
    // UI 업데이트
    closeModal();
    displayUserInfo();
}
```

---

## 📅 **3일 개발 일정**

### **Day 1: 사용자 등록 + 이어풀기 핵심 로직 (8시간)**

#### **오전 (4시간): 사용자 등록 시스템 + 데이터 구조 설계**
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

#### **오후 (4시간): 사용자 등록 UI + 핵심 함수 구현**
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

#### **오전 (4시간): 사용자 정보 표시 + 이어풀기 UI 완성**
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

// 홈화면 사용자 정보 표시
function displayUserInfo() {
    const progress = getProgressData();
    const user = progress.userInfo;
    
    const userInfoHTML = `
        <div class="bg-white p-4 rounded-lg shadow mb-4">
            <div class="flex justify-between items-center">
                <div>
                    <h3 class="font-bold text-gray-800">${user.userName}님</h3>
                    <p class="text-sm text-gray-600">시험일: ${user.examDate}</p>
                    <p class="text-xs text-gray-500">등록일: ${new Date(user.registrationDate).toLocaleDateString()}</p>
                </div>
                <button onclick="showUserEditModal()" class="text-blue-600 hover:underline text-sm">
                    정보 수정
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('user-info-section').innerHTML = userInfoHTML;
}
```

#### **오후 (4시간): 통합 테스트 및 버그 수정**

---

## 🎯 **Level 1 성공 기준**

### **필수 기능 체크리스트**
- [ ] 사용자 등록 및 정보 수정 기능
- [ ] 기본학습 1번부터 789번까지 순차적 이어풀기
- [ ] 대분류 4개 카테고리별 독립적 이어풀기
- [ ] 대문 3개 통계 박스 실시간 업데이트
- [ ] 앱 재시작 후 진도 정확히 복원
- [ ] 날짜 변경 시 오늘 통계 자동 초기화

### **사용자 시나리오 테스트**
1. **신규 사용자 - 게스트**: 앱 시작 → 등록 선택 화면 → 게스트 등록 → 바로 대문
2. **신규 사용자 - 등록**: 앱 시작 → 등록 선택 화면 → 사용자 등록 → 정보 입력 → 대문
3. **기존 사용자**: 앱 시작 → 바로 대문 → 21번부터 이어풀기
4. **정보 수정**: 대문 → 정보 수정 → 변경사항 반영
5. **데이터 초기화**: 대문 → 데이터 초기화 → 등록 선택 화면으로 복귀
6. **다음날 접속**: 오늘 통계 0으로 초기화, 누적 통계 유지
7. **카테고리 전환**: 재산보험 10번까지 → 특종보험 1번부터

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