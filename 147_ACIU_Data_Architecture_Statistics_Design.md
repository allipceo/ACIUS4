# 147. ACIU Data Architecture & Statistics Design

## 📋 개요

**작성일**: 2024년 12월 19일  
**작성자**: 서대리 (AI Assistant)  
**프로젝트**: ACIU S4 v4.12 → 보험중개사 시험 앱 개발 준비  
**목적**: LocalStorage 데이터 구조 설계, 통계 시스템 아키텍처, 데이터 무결성 보장 방법 정리  

---

## 🏗️ LocalStorage 데이터 구조 설계

### **1. 핵심 데이터 저장소 구조**

#### **1.1 중앙 데이터 관리 시스템**
```javascript
// LocalStorage 키별 역할 및 구조
const LocalStorageStructure = {
    // 실시간 통계 데이터 (메인)
    'aicu_real_time_data': {
        '06재산보험': {
            solved: 45,
            correct: 38,
            accuracy: '84.4',
            daily_progress: {
                '2024-12-19': { solved: 10, correct: 8 },
                '2024-12-18': { solved: 15, correct: 13 }
            },
            lastQuestionIndex: 45,
            last_updated: '2024-12-19T10:30:00.000Z'
        },
        '07특종보험': {
            solved: 32,
            correct: 28,
            accuracy: '87.5',
            daily_progress: {
                '2024-12-19': { solved: 8, correct: 7 }
            },
            lastQuestionIndex: 32,
            last_updated: '2024-12-19T10:30:00.000Z'
        },
        // 08배상책임보험, 09해상보험 동일 구조
        
        // 전체 통계 메타데이터
        meta: {
            total_attempts: 0,
            total_correct: 0,
            overall_accuracy: 0,
            today_attempts: 0,
            today_correct: 0,
            today_accuracy: 0,
            last_updated: new Date().toISOString(),
            session_start: new Date().toISOString()
        }
    },
    
    // 카테고리별 통계 (레거시 → 마이그레이션)
    'aicu_category_statistics': {
        '06재산보험': {
            total_questions: 789,
            completed_questions: 45,
            overall_accuracy: '84.4',
            study_time: 3600 // 초 단위
        }
    },
    
    // 사용자 정보
    'aicu_user_info': {
        user_type: 'guest',
        registration_date: '2024-12-19T10:30:00',
        exam_date: '2025-03-15',
        d_day: 86,
        name: '홍길동',
        phone: '010-1234-5678',
        exam_subject: 'AICU',
        registration_timestamp: '2024-12-19T10:30:00.000Z'
    },
    
    // 학습 로그
    'aicu_learning_log': {
        user_id: '게스트',
        registration_date: new Date().toISOString().split('T')[0],
        logs: [
            {
                timestamp: '2024-12-19T10:30:00.000Z',
                question_id: 'q001',
                category: '06재산보험',
                user_answer: 'A',
                correct_answer: 'A',
                is_correct: true,
                time_spent: 30 // 초
            }
        ],
        last_updated: new Date().toISOString()
    },
    
    // 문제 풀이 결과 히스토리
    'aicu_quiz_results': [
        {
            question_id: 'q001',
            category: '06재산보험',
            user_answer: 'A',
            correct_answer: 'A',
            is_correct: true,
            timestamp: '2024-12-19T10:30:00.000Z',
            time_spent: 30
        }
    ],
    
    // 오답 분석 데이터
    'aicu_incorrect_statistics': {
        '06재산보험': {
            wrong_once: 5,
            wrong_twice: 2,
            wrong_thrice: 1,
            wrong_more: 0
        }
    }
};
```

#### **1.2 데이터 구조 설계 원칙**
```javascript
// 데이터 구조 설계 원칙
const DataStructurePrinciples = {
    // 1. 단일 진실 공급원 (Single Source of Truth)
    centralizedData: {
        principle: "모든 통계 데이터는 중앙 집중식으로 관리",
        implementation: "aicu_real_time_data가 메인 데이터 저장소 역할",
        benefit: "데이터 일관성 보장, 중복 방지"
    },
    
    // 2. 계층적 데이터 구조
    hierarchicalStructure: {
        principle: "카테고리별 → 일별 → 세부 통계 순서",
        implementation: "category > daily_progress > detailed_stats",
        benefit: "효율적인 데이터 접근, 확장 가능성"
    },
    
    // 3. 타임스탬프 기반 추적
    timestampTracking: {
        principle: "모든 데이터 변경에 타임스탬프 기록",
        implementation: "last_updated, timestamp 필드 필수",
        benefit: "데이터 동기화, 디버깅 지원"
    },
    
    // 4. 점진적 업데이트
    incrementalUpdate: {
        principle: "전체 재계산 대신 점진적 업데이트",
        implementation: "solved++, correct++, accuracy 재계산",
        benefit: "성능 최적화, 실시간 반영"
    }
};
```

### **2. 중앙 데이터 관리 시스템 구현**

#### **2.1 CentralDataManager 클래스**
```javascript
class CentralDataManager {
    constructor() {
        this.isInitialized = false;
        this.initialize();
    }
    
    /**
     * 시스템 초기화
     */
    initialize() {
        if (this.isInitialized) return;
        
        this.initializeRealTimeData();
        this.initializeCategoryStatistics();
        this.setupEventListeners();
        
        this.isInitialized = true;
        console.log('✅ CentralDataManager 초기화 완료');
    }
    
    /**
     * 실시간 데이터 초기화
     */
    initializeRealTimeData() {
        const realTimeData = {
            // 카테고리별 데이터 구조
            '06재산보험': this.createCategoryStructure(),
            '07특종보험': this.createCategoryStructure(),
            '08배상책임보험': this.createCategoryStructure(),
            '09해상보험': this.createCategoryStructure(),
            
            // 전체 메타데이터
            meta: {
                total_attempts: 0,
                total_correct: 0,
                overall_accuracy: 0,
                today_attempts: 0,
                today_correct: 0,
                today_accuracy: 0,
                last_updated: new Date().toISOString(),
                session_start: new Date().toISOString(),
                // 시간대별 세션 데이터
                time_based_sessions: {},
                current_session: {
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toLocaleTimeString('ko-KR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    }),
                    session_id: this.generateSessionId()
                }
            }
        };
        
        localStorage.setItem('aicu_real_time_data', JSON.stringify(realTimeData));
        console.log('✅ 실시간 데이터 초기화 완료');
    }
    
    /**
     * 카테고리 데이터 구조 생성
     */
    createCategoryStructure() {
        return {
            solved: 0,
            correct: 0,
            accuracy: '0.0',
            daily_progress: {},
            lastQuestionIndex: 0,
            last_updated: new Date().toISOString(),
            // Continue Learning을 위한 세션별 마지막 문제 번호
            session_progress: {}
        };
    }
    
    /**
     * 세션 ID 생성
     */
    generateSessionId() {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        return `${dateStr}_${timeStr}`;
    }
    
    /**
     * 퀴즈 결과 기록
     */
    recordQuizResult(questionId, category, isCorrect, userAnswer, correctAnswer) {
        const realTimeData = JSON.parse(localStorage.getItem('aicu_real_time_data') || '{}');
        
        // 카테고리 데이터 초기화 (필요시)
        if (!realTimeData[category]) {
            realTimeData[category] = this.createCategoryStructure();
        }
        
        // 통계 업데이트
        realTimeData[category].solved++;
        if (isCorrect) {
            realTimeData[category].correct++;
        }
        realTimeData[category].accuracy = 
            (realTimeData[category].correct / realTimeData[category].solved * 100).toFixed(1);
        realTimeData[category].last_updated = new Date().toISOString();
        
        // 일별 진행상황 업데이트
        const today = new Date().toISOString().split('T')[0];
        if (!realTimeData[category].daily_progress[today]) {
            realTimeData[category].daily_progress[today] = { solved: 0, correct: 0 };
        }
        realTimeData[category].daily_progress[today].solved++;
        if (isCorrect) {
            realTimeData[category].daily_progress[today].correct++;
        }
        
        // 전체 메타데이터 업데이트
        realTimeData.meta.total_attempts++;
        if (isCorrect) {
            realTimeData.meta.total_correct++;
        }
        realTimeData.meta.overall_accuracy = 
            (realTimeData.meta.total_correct / realTimeData.meta.total_attempts * 100).toFixed(1);
        realTimeData.meta.last_updated = new Date().toISOString();
        
        // LocalStorage에 저장
        localStorage.setItem('aicu_real_time_data', JSON.stringify(realTimeData));
        
        // 학습 로그에 기록
        this.recordLearningLog(questionId, category, isCorrect, userAnswer, correctAnswer);
        
        // 이벤트 발생
        window.dispatchEvent(new CustomEvent('quizCompleted', {
            detail: { questionId, category, isCorrect, userAnswer, correctAnswer }
        }));
        
        console.log(`📊 퀴즈 결과 기록: ${category} - ${isCorrect ? '정답' : '오답'}`);
    }
    
    /**
     * 학습 로그 기록
     */
    recordLearningLog(questionId, category, isCorrect, userAnswer, correctAnswer) {
        let learningLog = JSON.parse(localStorage.getItem('aicu_learning_log') || '{}');
        
        if (!learningLog.logs) {
            learningLog = {
                user_id: '게스트',
                registration_date: new Date().toISOString().split('T')[0],
                logs: [],
                last_updated: new Date().toISOString()
            };
        }
        
        learningLog.logs.push({
            timestamp: new Date().toISOString(),
            question_id: questionId,
            category: category,
            user_answer: userAnswer,
            correct_answer: correctAnswer,
            is_correct: isCorrect,
            time_spent: 0 // TODO: 실제 시간 측정 구현
        });
        
        learningLog.last_updated = new Date().toISOString();
        
        localStorage.setItem('aicu_learning_log', JSON.stringify(learningLog));
    }
    
    /**
     * 통계 데이터 조회
     */
    getStatistics(category = null) {
        const realTimeData = JSON.parse(localStorage.getItem('aicu_real_time_data') || '{}');
        
        if (category) {
            return realTimeData[category] || this.createCategoryStructure();
        }
        
        return realTimeData;
    }
    
    /**
     * 이어풀기를 위한 마지막 문제 인덱스 업데이트
     */
    updateLastQuestionIndex(category, questionIndex) {
        const realTimeData = JSON.parse(localStorage.getItem('aicu_real_time_data') || '{}');
        
        if (realTimeData[category]) {
            realTimeData[category].lastQuestionIndex = questionIndex;
            realTimeData[category].last_updated = new Date().toISOString();
            
            localStorage.setItem('aicu_real_time_data', JSON.stringify(realTimeData));
        }
    }
}
```

### **3. 실시간 동기화 시스템**

#### **3.1 RealtimeSyncManager 클래스**
```javascript
class RealtimeSyncManager {
    constructor() {
        this.syncInterval = null;
        this.setupEventListeners();
        this.startSync();
    }
    
    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 퀴즈 완료 이벤트
        window.addEventListener('quizCompleted', (event) => {
            this.handleQuizCompleted(event.detail);
        });
        
        // 데이터 업데이트 이벤트
        window.addEventListener('dataUpdated', (event) => {
            this.handleDataUpdated(event.detail);
        });
        
        // 페이지 가시성 변경 이벤트
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.syncAllPages();
            }
        });
    }
    
    /**
     * 동기화 시작
     */
    startSync() {
        this.syncInterval = setInterval(() => {
            this.syncAllPages();
        }, 5000); // 5초마다 동기화
        
        console.log('✅ 실시간 동기화 시작');
    }
    
    /**
     * 퀴즈 완료 처리
     */
    handleQuizCompleted(detail) {
        const { questionId, category, isCorrect } = detail;
        
        // 모든 페이지에 업데이트 알림
        this.broadcastUpdate('quizResult', {
            category,
            isCorrect,
            timestamp: new Date().toISOString()
        });
        
        // UI 업데이트
        this.updateStatisticsUI();
    }
    
    /**
     * 데이터 업데이트 처리
     */
    handleDataUpdated(detail) {
        this.updateStatisticsUI();
        this.syncAllPages();
    }
    
    /**
     * 모든 페이지 동기화
     */
    syncAllPages() {
        const realTimeData = JSON.parse(localStorage.getItem('aicu_real_time_data') || '{}');
        
        // 홈페이지 통계 업데이트
        this.updateHomeStatistics(realTimeData);
        
        // 기본학습 페이지 통계 업데이트
        this.updateBasicLearningStatistics(realTimeData);
        
        // 대분류학습 페이지 통계 업데이트
        this.updateCategoryLearningStatistics(realTimeData);
        
        // 통계 페이지 업데이트
        this.updateStatisticsPage(realTimeData);
    }
    
    /**
     * 통계 UI 업데이트
     */
    updateStatisticsUI() {
        const realTimeData = JSON.parse(localStorage.getItem('aicu_real_time_data') || '{}');
        
        // 진행률 업데이트
        this.updateProgressRate(realTimeData);
        
        // 정답률 업데이트
        this.updateCorrectRate(realTimeData);
        
        // 오늘 진행상황 업데이트
        this.updateTodayProgress(realTimeData);
    }
    
    /**
     * 진행률 업데이트
     */
    updateProgressRate(data) {
        const totalSolved = Object.keys(data)
            .filter(key => key !== 'meta')
            .reduce((sum, category) => sum + (data[category].solved || 0), 0);
        
        const totalQuestions = 789; // 전체 문제 수
        const progressRate = ((totalSolved / totalQuestions) * 100).toFixed(1);
        
        const progressElements = document.querySelectorAll('.progress-rate');
        progressElements.forEach(element => {
            if (element) {
                element.textContent = `진행률: ${progressRate}% (${totalSolved}/${totalQuestions})`;
            }
        });
    }
    
    /**
     * 정답률 업데이트
     */
    updateCorrectRate(data) {
        const totalCorrect = Object.keys(data)
            .filter(key => key !== 'meta')
            .reduce((sum, category) => sum + (data[category].correct || 0), 0);
        
        const totalSolved = Object.keys(data)
            .filter(key => key !== 'meta')
            .reduce((sum, category) => sum + (data[category].solved || 0), 0);
        
        const correctRate = totalSolved > 0 ? ((totalCorrect / totalSolved) * 100).toFixed(1) : '0.0';
        
        const correctElements = document.querySelectorAll('.correct-rate');
        correctElements.forEach(element => {
            if (element) {
                element.textContent = `정답률: ${correctRate}%`;
            }
        });
    }
    
    /**
     * 오늘 진행상황 업데이트
     */
    updateTodayProgress(data) {
        const today = new Date().toISOString().split('T')[0];
        let todaySolved = 0;
        let todayCorrect = 0;
        
        Object.keys(data).forEach(category => {
            if (category !== 'meta' && data[category].daily_progress && data[category].daily_progress[today]) {
                todaySolved += data[category].daily_progress[today].solved || 0;
                todayCorrect += data[category].daily_progress[today].correct || 0;
            }
        });
        
        const todayRate = todaySolved > 0 ? ((todayCorrect / todaySolved) * 100).toFixed(1) : '0.0';
        
        const todayElements = document.querySelectorAll('.today-progress');
        todayElements.forEach(element => {
            if (element) {
                element.textContent = `오늘: ${todaySolved}문제 (정답률 ${todayRate}%)`;
            }
        });
    }
}
```

---

## 📊 통계 시스템 아키텍처

### **1. 고급 통계 관리 시스템**

#### **1.1 AdvancedStatisticsManager 클래스**
```javascript
class AdvancedStatisticsManager {
    constructor() {
        this.centralDataManager = new CentralDataManager();
        this.initialize();
    }
    
    /**
     * 고급 통계 초기화
     */
    initialize() {
        this.setupAdvancedCalculations();
        console.log('✅ 고급 통계 관리자 초기화 완료');
    }
    
    /**
     * 예상 점수 계산
     */
    calculateExpectedScores() {
        const realTimeData = this.centralDataManager.getStatistics();
        const expectedScores = {};
        
        // 카테고리별 예상 점수 계산
        Object.keys(realTimeData).forEach(category => {
            if (category !== 'meta') {
                const categoryData = realTimeData[category];
                const accuracy = parseFloat(categoryData.accuracy) || 0;
                
                // 100점 만점 기준으로 예상 점수 계산
                expectedScores[category] = Math.round(accuracy);
            }
        });
        
        // 전체 평균 점수 계산
        const categoryScores = Object.values(expectedScores);
        const averageScore = categoryScores.length > 0 
            ? Math.round(categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length)
            : 0;
        
        expectedScores['전체평균'] = averageScore;
        
        return expectedScores;
    }
    
    /**
     * 합격 확률 계산
     */
    calculatePassProbability() {
        const expectedScores = this.calculateExpectedScores();
        
        // 과목별 40점 이상 확인
        const categoryPassCount = Object.keys(expectedScores)
            .filter(category => category !== '전체평균')
            .filter(category => expectedScores[category] >= 40).length;
        
        // 전체 50점 이상 확인
        const overallPass = expectedScores['전체평균'] >= 50;
        
        // 합격 확률 계산 (과목별 40점 + 전체 50점)
        const totalCategories = Object.keys(expectedScores).length - 1; // 전체평균 제외
        const categoryPassRate = (categoryPassCount / totalCategories) * 100;
        const overallPassRate = overallPass ? 100 : 0;
        
        // 종합 합격 확률 (가중 평균)
        const passProbability = Math.round((categoryPassRate * 0.7) + (overallPassRate * 0.3));
        
        return {
            categoryPassCount,
            totalCategories,
            overallPass,
            passProbability,
            details: expectedScores
        };
    }
    
    /**
     * 오답 횟수별 분석
     */
    analyzeIncorrectAnswers() {
        const learningLog = JSON.parse(localStorage.getItem('aicu_learning_log') || '{}');
        const incorrectAnalysis = {};
        
        if (learningLog.logs) {
            // 문제별 오답 횟수 집계
            const questionAttempts = {};
            
            learningLog.logs.forEach(log => {
                if (!questionAttempts[log.question_id]) {
                    questionAttempts[log.question_id] = {
                        category: log.category,
                        attempts: 0,
                        incorrect_count: 0,
                        finally_correct: false
                    };
                }
                
                questionAttempts[log.question_id].attempts++;
                if (!log.is_correct) {
                    questionAttempts[log.question_id].incorrect_count++;
                } else {
                    questionAttempts[log.question_id].finally_correct = true;
                }
            });
            
            // 카테고리별 오답 횟수 분석
            Object.values(questionAttempts).forEach(attempt => {
                const category = attempt.category;
                if (!incorrectAnalysis[category]) {
                    incorrectAnalysis[category] = {
                        wrong_once: 0,
                        wrong_twice: 0,
                        wrong_thrice: 0,
                        wrong_more: 0,
                        never_wrong: 0
                    };
                }
                
                if (attempt.incorrect_count === 0) {
                    incorrectAnalysis[category].never_wrong++;
                } else if (attempt.incorrect_count === 1) {
                    incorrectAnalysis[category].wrong_once++;
                } else if (attempt.incorrect_count === 2) {
                    incorrectAnalysis[category].wrong_twice++;
                } else if (attempt.incorrect_count === 3) {
                    incorrectAnalysis[category].wrong_thrice++;
                } else {
                    incorrectAnalysis[category].wrong_more++;
                }
            });
        }
        
        return incorrectAnalysis;
    }
    
    /**
     * D-Day 계산
     */
    calculateDDay() {
        const userInfo = JSON.parse(localStorage.getItem('aicu_user_info') || '{}');
        
        if (userInfo.exam_date) {
            const today = new Date();
            const examDate = new Date(userInfo.exam_date);
            const diffTime = examDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > 0) {
                return `D-${diffDays}`;
            } else if (diffDays === 0) {
                return 'D-Day';
            } else {
                return `D+${Math.abs(diffDays)}`;
            }
        }
        
        return 'D-?';
    }
    
    /**
     * 종합 통계 보고서 생성
     */
    generateComprehensiveReport() {
        const expectedScores = this.calculateExpectedScores();
        const passProbability = this.calculatePassProbability();
        const incorrectAnalysis = this.analyzeIncorrectAnswers();
        const dDay = this.calculateDDay();
        const realTimeData = this.centralDataManager.getStatistics();
        
        return {
            timestamp: new Date().toISOString(),
            d_day: dDay,
            expected_scores: expectedScores,
            pass_probability: passProbability,
            incorrect_analysis: incorrectAnalysis,
            real_time_data: realTimeData,
            summary: {
                total_solved: Object.keys(realTimeData)
                    .filter(key => key !== 'meta')
                    .reduce((sum, category) => sum + (realTimeData[category].solved || 0), 0),
                overall_accuracy: passProbability.details['전체평균'],
                study_days: this.calculateStudyDays(),
                recommendation: this.generateRecommendation(passProbability, incorrectAnalysis)
            }
        };
    }
    
    /**
     * 학습 일수 계산
     */
    calculateStudyDays() {
        const userInfo = JSON.parse(localStorage.getItem('aicu_user_info') || '{}');
        
        if (userInfo.registration_date) {
            const registrationDate = new Date(userInfo.registration_date);
            const today = new Date();
            const diffTime = today - registrationDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
            
            return Math.max(1, diffDays);
        }
        
        return 1;
    }
    
    /**
     * 학습 추천사항 생성
     */
    generateRecommendation(passProbability, incorrectAnalysis) {
        const recommendations = [];
        
        // 합격 확률 기반 추천
        if (passProbability.passProbability < 70) {
            recommendations.push("전체적인 정답률 향상이 필요합니다. 기본학습을 통해 전 영역을 복습하세요.");
        }
        
        // 과목별 점수 기반 추천
        Object.keys(passProbability.details).forEach(category => {
            if (category !== '전체평균' && passProbability.details[category] < 40) {
                recommendations.push(`${category} 영역의 집중 학습이 필요합니다 (현재 예상점수: ${passProbability.details[category]}점).`);
            }
        });
        
        // 오답 분석 기반 추천
        Object.keys(incorrectAnalysis).forEach(category => {
            const analysis = incorrectAnalysis[category];
            if (analysis.wrong_thrice + analysis.wrong_more > 5) {
                recommendations.push(`${category} 영역에서 반복 오답이 많습니다. 해당 문제들을 다시 복습하세요.`);
            }
        });
        
        if (recommendations.length === 0) {
            recommendations.push("현재 학습 상태가 양호합니다. 꾸준히 학습을 계속하세요.");
        }
        
        return recommendations;
    }
}
```

### **2. 학습 패턴 분석 시스템**

#### **2.1 LearningPatternAnalyzer 클래스**
```javascript
class LearningPatternAnalyzer {
    constructor() {
        this.patterns = {};
        this.initialize();
    }
    
    /**
     * 학습 패턴 분석 초기화
     */
    initialize() {
        this.analyzeSessionPatterns();
        this.analyzeDailyPatterns();
        this.analyzeCategoryPatterns();
        this.analyzeTimePatterns();
        this.analyzeAccuracyPatterns();
        
        console.log('✅ 학습 패턴 분석기 초기화 완료');
    }
    
    /**
     * 세션 패턴 분석
     */
    analyzeSessionPatterns() {
        const learningLog = JSON.parse(localStorage.getItem('aicu_learning_log') || '{}');
        
        if (learningLog.logs && learningLog.logs.length > 0) {
            const sessions = this.groupBySession(learningLog.logs);
            
            this.patterns.session = {
                average_session_length: this.calculateAverageSessionLength(sessions),
                average_questions_per_session: this.calculateAverageQuestionsPerSession(sessions),
                most_productive_session_time: this.findMostProductiveSessionTime(sessions),
                session_accuracy_trend: this.calculateSessionAccuracyTrend(sessions)
            };
        }
    }
    
    /**
     * 일별 패턴 분석
     */
    analyzeDailyPatterns() {
        const realTimeData = JSON.parse(localStorage.getItem('aicu_real_time_data') || '{}');
        const dailyStats = {};
        
        Object.keys(realTimeData).forEach(category => {
            if (category !== 'meta' && realTimeData[category].daily_progress) {
                Object.keys(realTimeData[category].daily_progress).forEach(date => {
                    if (!dailyStats[date]) {
                        dailyStats[date] = { solved: 0, correct: 0 };
                    }
                    dailyStats[date].solved += realTimeData[category].daily_progress[date].solved || 0;
                    dailyStats[date].correct += realTimeData[category].daily_progress[date].correct || 0;
                });
            }
        });
        
        this.patterns.daily = {
            study_days: Object.keys(dailyStats).length,
            average_daily_questions: this.calculateAverageDailyQuestions(dailyStats),
            most_productive_day: this.findMostProductiveDay(dailyStats),
            consistency_score: this.calculateConsistencyScore(dailyStats)
        };
    }
    
    /**
     * 카테고리별 패턴 분석
     */
    analyzeCategoryPatterns() {
        const realTimeData = JSON.parse(localStorage.getItem('aicu_real_time_data') || '{}');
        const categoryPreferences = {};
        
        Object.keys(realTimeData).forEach(category => {
            if (category !== 'meta') {
                categoryPreferences[category] = {
                    solved: realTimeData[category].solved || 0,
                    accuracy: parseFloat(realTimeData[category].accuracy) || 0,
                    preference_score: this.calculatePreferenceScore(realTimeData[category])
                };
            }
        });
        
        this.patterns.category = {
            preferences: categoryPreferences,
            strongest_category: this.findStrongestCategory(categoryPreferences),
            weakest_category: this.findWeakestCategory(categoryPreferences),
            most_studied_category: this.findMostStudiedCategory(categoryPreferences)
        };
    }
    
    /**
     * 시간대별 패턴 분석
     */
    analyzeTimePatterns() {
        const learningLog = JSON.parse(localStorage.getItem('aicu_learning_log') || '{}');
        const timePatterns = {};
        
        if (learningLog.logs) {
            learningLog.logs.forEach(log => {
                const hour = new Date(log.timestamp).getHours();
                const timeSlot = this.getTimeSlot(hour);
                
                if (!timePatterns[timeSlot]) {
                    timePatterns[timeSlot] = { count: 0, correct: 0 };
                }
                
                timePatterns[timeSlot].count++;
                if (log.is_correct) {
                    timePatterns[timeSlot].correct++;
                }
            });
        }
        
        this.patterns.time = {
            time_preferences: timePatterns,
            most_active_time: this.findMostActiveTime(timePatterns),
            most_accurate_time: this.findMostAccurateTime(timePatterns)
        };
    }
    
    /**
     * 정확도 패턴 분석
     */
    analyzeAccuracyPatterns() {
        const learningLog = JSON.parse(localStorage.getItem('aicu_learning_log') || '{}');
        
        if (learningLog.logs && learningLog.logs.length > 0) {
            const accuracyTrend = this.calculateAccuracyTrend(learningLog.logs);
            const improvementRate = this.calculateImprovementRate(accuracyTrend);
            
            this.patterns.accuracy = {
                trend: accuracyTrend,
                improvement_rate: improvementRate,
                current_streak: this.calculateCurrentStreak(learningLog.logs),
                best_streak: this.calculateBestStreak(learningLog.logs)
            };
        }
    }
    
    /**
     * 종합 학습 패턴 보고서 생성
     */
    generatePatternReport() {
        return {
            timestamp: new Date().toISOString(),
            patterns: this.patterns,
            insights: this.generateInsights(),
            recommendations: this.generatePatternRecommendations()
        };
    }
    
    /**
     * 학습 인사이트 생성
     */
    generateInsights() {
        const insights = [];
        
        // 세션 패턴 인사이트
        if (this.patterns.session) {
            if (this.patterns.session.average_session_length > 30) {
                insights.push("집중력이 좋습니다. 긴 학습 세션을 잘 유지하고 있습니다.");
            }
        }
        
        // 일별 패턴 인사이트
        if (this.patterns.daily) {
            if (this.patterns.daily.consistency_score > 0.8) {
                insights.push("매우 일관된 학습 패턴을 보이고 있습니다.");
            }
        }
        
        // 카테고리 패턴 인사이트
        if (this.patterns.category) {
            const strongest = this.patterns.category.strongest_category;
            const weakest = this.patterns.category.weakest_category;
            
            if (strongest && weakest) {
                insights.push(`${strongest} 영역이 가장 강하고, ${weakest} 영역에서 개선이 필요합니다.`);
            }
        }
        
        return insights;
    }
    
    /**
     * 패턴 기반 추천사항 생성
     */
    generatePatternRecommendations() {
        const recommendations = [];
        
        // 시간대 기반 추천
        if (this.patterns.time && this.patterns.time.most_accurate_time) {
            recommendations.push(`${this.patterns.time.most_accurate_time} 시간대에 가장 높은 정확도를 보입니다. 이 시간대에 어려운 문제를 풀어보세요.`);
        }
        
        // 카테고리 기반 추천
        if (this.patterns.category && this.patterns.category.weakest_category) {
            recommendations.push(`${this.patterns.category.weakest_category} 영역의 집중 학습을 추천합니다.`);
        }
        
        return recommendations;
    }
    
    // 헬퍼 메서드들
    getTimeSlot(hour) {
        if (hour >= 6 && hour < 12) return '오전';
        if (hour >= 12 && hour < 18) return '오후';
        if (hour >= 18 && hour < 24) return '저녁';
        return '새벽';
    }
    
    calculatePreferenceScore(categoryData) {
        const solved = categoryData.solved || 0;
        const accuracy = parseFloat(categoryData.accuracy) || 0;
        return (solved * 0.6) + (accuracy * 0.4);
    }
    
    findStrongestCategory(preferences) {
        let strongest = null;
        let highestAccuracy = 0;
        
        Object.keys(preferences).forEach(category => {
            if (preferences[category].accuracy > highestAccuracy) {
                highestAccuracy = preferences[category].accuracy;
                strongest = category;
            }
        });
        
        return strongest;
    }
    
    findWeakestCategory(preferences) {
        let weakest = null;
        let lowestAccuracy = 100;
        
        Object.keys(preferences).forEach(category => {
            if (preferences[category].solved > 0 && preferences[category].accuracy < lowestAccuracy) {
                lowestAccuracy = preferences[category].accuracy;
                weakest = category;
            }
        });
        
        return weakest;
    }
}
```

---

## 🔒 데이터 무결성 보장 방법

### **1. 데이터 검증 시스템**

#### **1.1 DataIntegrityValidator 클래스**
```javascript
class DataIntegrityValidator {
    constructor() {
        this.validationRules = this.defineValidationRules();
    }
    
    /**
     * 검증 규칙 정의
     */
    defineValidationRules() {
        return {
            'aicu_real_time_data': {
                required_fields: ['meta'],
                category_structure: {
                    required_fields: ['solved', 'correct', 'accuracy', 'daily_progress', 'lastQuestionIndex'],
                    data_types: {
                        solved: 'number',
                        correct: 'number',
                        accuracy: 'string',
                        lastQuestionIndex: 'number'
                    },
                    constraints: {
                        solved: { min: 0 },
                        correct: { min: 0 },
                        accuracy: { pattern: /^\d+\.\d+$/ },
                        lastQuestionIndex: { min: 0 }
                    }
                }
            },
            'aicu_user_info': {
                required_fields: ['user_type', 'registration_date'],
                data_types: {
                    user_type: 'string',
                    registration_date: 'string',
                    exam_date: 'string'
                },
                constraints: {
                    user_type: { enum: ['guest', 'registered'] }
                }
            },
            'aicu_learning_log': {
                required_fields: ['user_id', 'logs'],
                data_types: {
                    user_id: 'string',
                    logs: 'array'
                }
            }
        };
    }
    
    /**
     * 전체 데이터 무결성 검사
     */
    validateAllData() {
        const results = {
            overall_status: 'unknown',
            validations: {},
            errors: [],
            warnings: [],
            recommendations: []
        };
        
        // 각 데이터 저장소 검증
        Object.keys(this.validationRules).forEach(key => {
            results.validations[key] = this.validateDataStore(key);
        });
        
        // 전체 상태 평가
        results.overall_status = this.evaluateOverallStatus(results.validations);
        
        // 오류 및 경고 수집
        this.collectIssues(results);
        
        // 추천사항 생성
        results.recommendations = this.generateRecommendations(results);
        
        console.log('📊 데이터 무결성 검사 완료:', results.overall_status);
        return results;
    }
    
    /**
     * 특정 데이터 저장소 검증
     */
    validateDataStore(storeName) {
        const validation = {
            store_name: storeName,
            exists: false,
            valid_json: false,
            structure_valid: false,
            data_valid: false,
            errors: [],
            warnings: []
        };
        
        try {
            // 데이터 존재 여부 확인
            const rawData = localStorage.getItem(storeName);
            if (!rawData) {
                validation.errors.push('데이터가 존재하지 않습니다');
                return validation;
            }
            validation.exists = true;
            
            // JSON 파싱 검증
            let data;
            try {
                data = JSON.parse(rawData);
                validation.valid_json = true;
            } catch (e) {
                validation.errors.push(`JSON 파싱 오류: ${e.message}`);
                return validation;
            }
            
            // 구조 검증
            const structureValidation = this.validateStructure(storeName, data);
            validation.structure_valid = structureValidation.valid;
            validation.errors.push(...structureValidation.errors);
            validation.warnings.push(...structureValidation.warnings);
            
            // 데이터 검증
            const dataValidation = this.validateData(storeName, data);
            validation.data_valid = dataValidation.valid;
            validation.errors.push(...dataValidation.errors);
            validation.warnings.push(...dataValidation.warnings);
            
        } catch (error) {
            validation.errors.push(`검증 중 오류 발생: ${error.message}`);
        }
        
        return validation;
    }
    
    /**
     * 데이터 구조 검증
     */
    validateStructure(storeName, data) {
        const result = { valid: true, errors: [], warnings: [] };
        const rules = this.validationRules[storeName];
        
        if (!rules) {
            result.warnings.push('검증 규칙이 정의되지 않았습니다');
            return result;
        }
        
        // 필수 필드 검증
        if (rules.required_fields) {
            rules.required_fields.forEach(field => {
                if (!(field in data)) {
                    result.errors.push(`필수 필드 누락: ${field}`);
                    result.valid = false;
                }
            });
        }
        
        // 카테고리별 구조 검증 (실시간 데이터용)
        if (storeName === 'aicu_real_time_data' && rules.category_structure) {
            const categories = ['06재산보험', '07특종보험', '08배상책임보험', '09해상보험'];
            categories.forEach(category => {
                if (data[category]) {
                    const categoryValidation = this.validateCategoryStructure(data[category], rules.category_structure);
                    if (!categoryValidation.valid) {
                        result.errors.push(`${category} 구조 오류: ${categoryValidation.errors.join(', ')}`);
                        result.valid = false;
                    }
                }
            });
        }
        
        return result;
    }
    
    /**
     * 카테고리 구조 검증
     */
    validateCategoryStructure(categoryData, rules) {
        const result = { valid: true, errors: [] };
        
        // 필수 필드 검증
        if (rules.required_fields) {
            rules.required_fields.forEach(field => {
                if (!(field in categoryData)) {
                    result.errors.push(`필수 필드 누락: ${field}`);
                    result.valid = false;
                }
            });
        }
        
        // 데이터 타입 검증
        if (rules.data_types) {
            Object.keys(rules.data_types).forEach(field => {
                if (field in categoryData) {
                    const expectedType = rules.data_types[field];
                    const actualType = typeof categoryData[field];
                    
                    if (expectedType === 'array' && !Array.isArray(categoryData[field])) {
                        result.errors.push(`${field}는 배열이어야 합니다`);
                        result.valid = false;
                    } else if (expectedType !== 'array' && actualType !== expectedType) {
                        result.errors.push(`${field}의 타입이 올바르지 않습니다 (기대: ${expectedType}, 실제: ${actualType})`);
                        result.valid = false;
                    }
                }
            });
        }
        
        // 제약 조건 검증
        if (rules.constraints) {
            Object.keys(rules.constraints).forEach(field => {
                if (field in categoryData) {
                    const constraint = rules.constraints[field];
                    const value = categoryData[field];
                    
                    // 최소값 검증
                    if (constraint.min !== undefined && value < constraint.min) {
                        result.errors.push(`${field}의 값이 최소값(${constraint.min})보다 작습니다`);
                        result.valid = false;
                    }
                    
                    // 패턴 검증
                    if (constraint.pattern && !constraint.pattern.test(value)) {
                        result.errors.push(`${field}의 값이 올바른 형식이 아닙니다`);
                        result.valid = false;
                    }
                    
                    // 열거값 검증
                    if (constraint.enum && !constraint.enum.includes(value)) {
                        result.errors.push(`${field}의 값이 허용된 값이 아닙니다`);
                        result.valid = false;
                    }
                }
            });
        }
        
        return result;
    }
    
    /**
     * 데이터 일관성 검증
     */
    validateData(storeName, data) {
        const result = { valid: true, errors: [], warnings: [] };
        
        if (storeName === 'aicu_real_time_data') {
            // 통계 일관성 검증
            Object.keys(data).forEach(category => {
                if (category !== 'meta') {
                    const categoryData = data[category];
                    
                    // solved >= correct 검증
                    if (categoryData.solved < categoryData.correct) {
                        result.errors.push(`${category}: 풀이한 문제 수가 정답 수보다 작습니다`);
                        result.valid = false;
                    }
                    
                    // 정답률 일관성 검증
                    if (categoryData.solved > 0) {
                        const calculatedAccuracy = ((categoryData.correct / categoryData.solved) * 100).toFixed(1);
                        if (Math.abs(parseFloat(categoryData.accuracy) - parseFloat(calculatedAccuracy)) > 0.1) {
                            result.warnings.push(`${category}: 정답률이 계산값과 일치하지 않습니다`);
                        }
                    }
                }
            });
        }
        
        return result;
    }
    
    /**
     * 전체 상태 평가
     */
    evaluateOverallStatus(validations) {
        let hasErrors = false;
        let hasWarnings = false;
        
        Object.values(validations).forEach(validation => {
            if (validation.errors.length > 0) {
                hasErrors = true;
            }
            if (validation.warnings.length > 0) {
                hasWarnings = true;
            }
        });
        
        if (hasErrors) return 'error';
        if (hasWarnings) return 'warning';
        return 'valid';
    }
    
    /**
     * 문제점 수집
     */
    collectIssues(results) {
        Object.values(results.validations).forEach(validation => {
            results.errors.push(...validation.errors);
            results.warnings.push(...validation.warnings);
        });
    }
    
    /**
     * 추천사항 생성
     */
    generateRecommendations(results) {
        const recommendations = [];
        
        if (results.overall_status === 'error') {
            recommendations.push('심각한 데이터 오류가 발견되었습니다. 데이터 초기화를 고려하세요.');
        } else if (results.overall_status === 'warning') {
            recommendations.push('데이터에 경고사항이 있습니다. 정기적인 데이터 정리를 권장합니다.');
        } else {
            recommendations.push('데이터 상태가 양호합니다.');
        }
        
        return recommendations;
    }
    
    /**
     * 자동 복구 시도
     */
    attemptAutoRepair() {
        const repairResults = {
            attempted: [],
            successful: [],
            failed: []
        };
        
        // 누락된 데이터 구조 복구
        this.repairMissingStructures(repairResults);
        
        // 잘못된 데이터 타입 복구
        this.repairDataTypes(repairResults);
        
        // 일관성 문제 복구
        this.repairInconsistencies(repairResults);
        
        console.log('🔧 자동 복구 완료:', repairResults);
        return repairResults;
    }
    
    /**
     * 누락된 구조 복구
     */
    repairMissingStructures(repairResults) {
        // aicu_real_time_data 초기화
        if (!localStorage.getItem('aicu_real_time_data')) {
            repairResults.attempted.push('aicu_real_time_data 초기화');
            try {
                const centralDataManager = new CentralDataManager();
                centralDataManager.initializeRealTimeData();
                repairResults.successful.push('aicu_real_time_data 초기화 성공');
            } catch (error) {
                repairResults.failed.push(`aicu_real_time_data 초기화 실패: ${error.message}`);
            }
        }
        
        // aicu_learning_log 초기화
        if (!localStorage.getItem('aicu_learning_log')) {
            repairResults.attempted.push('aicu_learning_log 초기화');
            try {
                const initialLearningLog = {
                    user_id: '게스트',
                    registration_date: new Date().toISOString().split('T')[0],
                    logs: [],
                    last_updated: new Date().toISOString()
                };
                localStorage.setItem('aicu_learning_log', JSON.stringify(initialLearningLog));
                repairResults.successful.push('aicu_learning_log 초기화 성공');
            } catch (error) {
                repairResults.failed.push(`aicu_learning_log 초기화 실패: ${error.message}`);
            }
        }
    }
    
    /**
     * 데이터 타입 복구
     */
    repairDataTypes(repairResults) {
        // 실시간 데이터의 숫자 타입 복구
        try {
            const realTimeData = JSON.parse(localStorage.getItem('aicu_real_time_data') || '{}');
            let repaired = false;
            
            Object.keys(realTimeData).forEach(category => {
                if (category !== 'meta') {
                    const categoryData = realTimeData[category];
                    
                    // 숫자 타입 복구
                    if (typeof categoryData.solved === 'string') {
                        categoryData.solved = parseInt(categoryData.solved) || 0;
                        repaired = true;
                    }
                    if (typeof categoryData.correct === 'string') {
                        categoryData.correct = parseInt(categoryData.correct) || 0;
                        repaired = true;
                    }
                    if (typeof categoryData.lastQuestionIndex === 'string') {
                        categoryData.lastQuestionIndex = parseInt(categoryData.lastQuestionIndex) || 0;
                        repaired = true;
                    }
                }
            });
            
            if (repaired) {
                localStorage.setItem('aicu_real_time_data', JSON.stringify(realTimeData));
                repairResults.successful.push('데이터 타입 복구 성공');
            }
        } catch (error) {
            repairResults.failed.push(`데이터 타입 복구 실패: ${error.message}`);
        }
    }
    
    /**
     * 일관성 문제 복구
     */
    repairInconsistencies(repairResults) {
        try {
            const realTimeData = JSON.parse(localStorage.getItem('aicu_real_time_data') || '{}');
            let repaired = false;
            
            Object.keys(realTimeData).forEach(category => {
                if (category !== 'meta') {
                    const categoryData = realTimeData[category];
                    
                    // solved < correct 문제 복구
                    if (categoryData.solved < categoryData.correct) {
                        categoryData.solved = categoryData.correct;
                        repaired = true;
                    }
                    
                    // 정답률 재계산
                    if (categoryData.solved > 0) {
                        const calculatedAccuracy = ((categoryData.correct / categoryData.solved) * 100).toFixed(1);
                        if (categoryData.accuracy !== calculatedAccuracy) {
                            categoryData.accuracy = calculatedAccuracy;
                            repaired = true;
                        }
                    } else {
                        categoryData.accuracy = '0.0';
                        repaired = true;
                    }
                }
            });
            
            if (repaired) {
                localStorage.setItem('aicu_real_time_data', JSON.stringify(realTimeData));
                repairResults.successful.push('일관성 문제 복구 성공');
            }
        } catch (error) {
            repairResults.failed.push(`일관성 문제 복구 실패: ${error.message}`);
        }
    }
}
```

### **2. 데이터 백업 및 복구 시스템**

#### **2.1 DataBackupManager 클래스**
```javascript
class DataBackupManager {
    constructor() {
        this.backupPrefix = 'aicu_backup_';
        this.maxBackups = 5;
    }
    
    /**
     * 전체 데이터 백업
     */
    createFullBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupKey = `${this.backupPrefix}${timestamp}`;
        
        const backupData = {
            timestamp: new Date().toISOString(),
            version: '4.12',
            data: {}
        };
        
        // 모든 AICU 관련 데이터 수집
        const aicuKeys = Object.keys(localStorage).filter(key => key.startsWith('aicu_'));
        aicuKeys.forEach(key => {
            backupData.data[key] = localStorage.getItem(key);
        });
        
        // 백업 저장
        try {
            localStorage.setItem(backupKey, JSON.stringify(backupData));
            this.cleanupOldBackups();
            
            console.log(`✅ 데이터 백업 완료: ${backupKey}`);
            return { success: true, backupKey, dataCount: aicuKeys.length };
        } catch (error) {
            console.error('❌ 백업 실패:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * 백업 목록 조회
     */
    getBackupList() {
        const backupKeys = Object.keys(localStorage)
            .filter(key => key.startsWith(this.backupPrefix))
            .sort()
            .reverse(); // 최신순 정렬
        
        return backupKeys.map(key => {
            try {
                const backupData = JSON.parse(localStorage.getItem(key));
                return {
                    key,
                    timestamp: backupData.timestamp,
                    version: backupData.version,
                    dataCount: Object.keys(backupData.data).length,
                    size: localStorage.getItem(key).length
                };
            } catch (error) {
                return {
                    key,
                    error: '백업 데이터 파싱 오류'
                };
            }
        });
    }
    
    /**
     * 백업에서 복원
     */
    restoreFromBackup(backupKey) {
        try {
            const backupData = JSON.parse(localStorage.getItem(backupKey));
            
            if (!backupData || !backupData.data) {
                throw new Error('유효하지 않은 백업 데이터');
            }
            
            // 현재 데이터 백업 (복원 전)
            const preRestoreBackup = this.createFullBackup();
            
            // 백업 데이터로 복원
            Object.keys(backupData.data).forEach(key => {
                localStorage.setItem(key, backupData.data[key]);
            });
            
            console.log(`✅ 데이터 복원 완료: ${backupKey}`);
            return { 
                success: true, 
                restoredCount: Object.keys(backupData.data).length,
                preRestoreBackup: preRestoreBackup.backupKey
            };
        } catch (error) {
            console.error('❌ 복원 실패:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * 오래된 백업 정리
     */
    cleanupOldBackups() {
        const backupKeys = Object.keys(localStorage)
            .filter(key => key.startsWith(this.backupPrefix))
            .sort();
        
        while (backupKeys.length > this.maxBackups) {
            const oldestBackup = backupKeys.shift();
            localStorage.removeItem(oldestBackup);
            console.log(`🗑️ 오래된 백업 삭제: ${oldestBackup}`);
        }
    }
    
    /**
     * 백업 데이터 내보내기 (JSON 파일)
     */
    exportBackup(backupKey) {
        try {
            const backupData = localStorage.getItem(backupKey);
            
            if (!backupData) {
                throw new Error('백업 데이터를 찾을 수 없습니다');
            }
            
            const blob = new Blob([backupData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `aicu_backup_${backupKey.replace(this.backupPrefix, '')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('✅ 백업 내보내기 완료');
            return { success: true };
        } catch (error) {
            console.error('❌ 내보내기 실패:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * 백업 데이터 가져오기 (JSON 파일)
     */
    importBackup(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const backupData = JSON.parse(e.target.result);
                    
                    // 백업 데이터 유효성 검사
                    if (!backupData.data || !backupData.timestamp) {
                        throw new Error('유효하지 않은 백업 파일 형식');
                    }
                    
                    // 백업 키 생성
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const backupKey = `${this.backupPrefix}imported_${timestamp}`;
                    
                    // LocalStorage에 저장
                    localStorage.setItem(backupKey, JSON.stringify(backupData));
                    
                    console.log('✅ 백업 가져오기 완료');
                    resolve({ success: true, backupKey });
                } catch (error) {
                    console.error('❌ 가져오기 실패:', error);
                    reject({ success: false, error: error.message });
                }
            };
            
            reader.onerror = () => {
                reject({ success: false, error: '파일 읽기 오류' });
            };
            
            reader.readAsText(file);
        });
    }
}
```

---

## 🎯 보험중개사 앱 적용 가이드

### **1. 보험중개사 앱 데이터 구조 설계**

#### **1.1 보험중개사 전용 데이터 구조**
```javascript
// 보험중개사 시험 앱 데이터 구조
const InsuranceExamDataStructure = {
    // 보험중개사 실시간 데이터
    'insurance_real_time_data': {
        '보험일반': {
            solved: 0,
            correct: 0,
            accuracy: '0.0',
            daily_progress: {},
            lastQuestionIndex: 0,
            expected_score: 0, // 예상 점수 (100점 만점)
            pass_threshold: 40, // 합격 기준점
            last_updated: new Date().toISOString()
        },
        '보험계약': {
            // 동일 구조
        },
        '보험금지급': {
            // 동일 구조
        },
        '보험업법': {
            // 동일 구조
        },
        
        // 전체 메타데이터
        meta: {
            total_attempts: 0,
            total_correct: 0,
            overall_accuracy: 0,
            overall_expected_score: 0, // 전체 평균 예상 점수
            pass_probability: 0, // 합격 확률 (%)
            exam_ready: false, // 시험 준비 완료 여부
            last_updated: new Date().toISOString()
        }
    },
    
    // 보험중개사 사용자 정보
    'insurance_user_info': {
        user_type: 'guest',
        name: '김보험',
        phone: '010-1234-5678',
        exam_type: '보험중개사',
        exam_date: '2025-03-15',
        d_day: 86,
        target_score: 60, // 목표 점수
        registration_date: '2024-12-19T10:30:00',
        study_start_date: '2024-12-19',
        study_goal: {
            daily_questions: 50,
            weekly_hours: 20,
            target_accuracy: 80
        }
    },
    
    // 보험중개사 학습 계획
    'insurance_study_plan': {
        total_questions: 1000, // 예상 총 문제 수
        daily_target: 50,
        weekly_target: 300,
        category_distribution: {
            '보험일반': 0.3,
            '보험계약': 0.25,
            '보험금지급': 0.25,
            '보험업법': 0.2
        },
        milestones: [
            {
                date: '2025-01-15',
                target: '전체 50% 완료',
                status: 'pending'
            },
            {
                date: '2025-02-15',
                target: '전체 80% 완료',
                status: 'pending'
            }
        ]
    },
    
    // 보험중개사 오답 노트
    'insurance_wrong_answers': {
        '보험일반': [
            {
                question_id: 'ins001',
                question_text: '보험의 정의에 관한 설명으로 옳은 것은?',
                user_answer: 'A',
                correct_answer: 'B',
                explanation: '보험은 우연한 사고로 인한 경제적 손실을 보상하는 제도입니다.',
                attempts: 2,
                last_attempt: '2024-12-19T10:30:00',
                mastered: false
            }
        ]
    }
};
```

#### **1.2 보험중개사 앱 중앙 데이터 관리자**
```javascript
class InsuranceCentralDataManager extends CentralDataManager {
    constructor() {
        super();
        this.examCategories = ['보험일반', '보험계약', '보험금지급', '보험업법'];
        this.passThreshold = 40; // 과목별 합격 기준
        this.overallPassThreshold = 50; // 전체 평균 합격 기준
    }
    
    /**
     * 보험중개사 데이터 초기화
     */
    initializeInsuranceData() {
        const insuranceData = {
            meta: {
                total_attempts: 0,
                total_correct: 0,
                overall_accuracy: 0,
                overall_expected_score: 0,
                pass_probability: 0,
                exam_ready: false,
                last_updated: new Date().toISOString()
            }
        };
        
        // 각 카테고리 초기화
        this.examCategories.forEach(category => {
            insuranceData[category] = {
                solved: 0,
                correct: 0,
                accuracy: '0.0',
                daily_progress: {},
                lastQuestionIndex: 0,
                expected_score: 0,
                pass_threshold: this.passThreshold,
                last_updated: new Date().toISOString()
            };
        });
        
        localStorage.setItem('insurance_real_time_data', JSON.stringify(insuranceData));
        console.log('✅ 보험중개사 데이터 초기화 완료');
    }
    
    /**
     * 보험중개사 퀴즈 결과 기록
     */
    recordInsuranceQuizResult(questionId, category, isCorrect, userAnswer, correctAnswer) {
        // 기본 퀴즈 결과 기록
        this.recordQuizResult(questionId, category, isCorrect, userAnswer, correctAnswer);
        
        // 보험중개사 전용 데이터 업데이트
        this.updateInsuranceSpecificData(category, isCorrect);
        
        // 오답 노트 업데이트
        if (!isCorrect) {
            this.updateWrongAnswersNote(questionId, category, userAnswer, correctAnswer);
        }
        
        // 예상 점수 및 합격 확률 재계산
        this.recalculateExamMetrics();
    }
    
    /**
     * 보험중개사 전용 데이터 업데이트
     */
    updateInsuranceSpecificData(category, isCorrect) {
        const insuranceData = JSON.parse(localStorage.getItem('insurance_real_time_data') || '{}');
        
        if (insuranceData[category]) {
            // 예상 점수 계산 (정답률 기반)
            const accuracy = parseFloat(insuranceData[category].accuracy) || 0;
            insuranceData[category].expected_score = Math.round(accuracy);
            
            // 메타데이터 업데이트
            insuranceData.meta.last_updated = new Date().toISOString();
            
            localStorage.setItem('insurance_real_time_data', JSON.stringify(insuranceData));
        }
    }
    
    /**
     * 오답 노트 업데이트
     */
    updateWrongAnswersNote(questionId, category, userAnswer, correctAnswer) {
        let wrongAnswers = JSON.parse(localStorage.getItem('insurance_wrong_answers') || '{}');
        
        if (!wrongAnswers[category]) {
            wrongAnswers[category] = [];
        }
        
        // 기존 오답 찾기
        const existingWrong = wrongAnswers[category].find(item => item.question_id === questionId);
        
        if (existingWrong) {
            // 기존 오답 업데이트
            existingWrong.attempts++;
            existingWrong.last_attempt = new Date().toISOString();
        } else {
            // 새 오답 추가
            wrongAnswers[category].push({
                question_id: questionId,
                question_text: '', // TODO: 실제 문제 텍스트 추가
                user_answer: userAnswer,
                correct_answer: correctAnswer,
                explanation: '', // TODO: 해설 추가
                attempts: 1,
                last_attempt: new Date().toISOString(),
                mastered: false
            });
        }
        
        localStorage.setItem('insurance_wrong_answers', JSON.stringify(wrongAnswers));
    }
    
    /**
     * 예상 점수 및 합격 확률 재계산
     */
    recalculateExamMetrics() {
        const insuranceData = JSON.parse(localStorage.getItem('insurance_real_time_data') || '{}');
        
        // 카테고리별 예상 점수 수집
        const categoryScores = [];
        let passCount = 0;
        
        this.examCategories.forEach(category => {
            if (insuranceData[category]) {
                const score = insuranceData[category].expected_score || 0;
                categoryScores.push(score);
                
                if (score >= this.passThreshold) {
                    passCount++;
                }
            }
        });
        
        // 전체 평균 점수 계산
        const overallScore = categoryScores.length > 0 
            ? Math.round(categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length)
            : 0;
        
        // 합격 확률 계산
        const categoryPassRate = (passCount / this.examCategories.length) * 100;
        const overallPassRate = overallScore >= this.overallPassThreshold ? 100 : 0;
        const passProbability = Math.round((categoryPassRate * 0.7) + (overallPassRate * 0.3));
        
        // 시험 준비 완료 여부
        const examReady = passProbability >= 80;
        
        // 메타데이터 업데이트
        insuranceData.meta.overall_expected_score = overallScore;
        insuranceData.meta.pass_probability = passProbability;
        insuranceData.meta.exam_ready = examReady;
        insuranceData.meta.last_updated = new Date().toISOString();
        
        localStorage.setItem('insurance_real_time_data', JSON.stringify(insuranceData));
        
        console.log(`📊 보험중개사 시험 메트릭 업데이트: 예상점수 ${overallScore}점, 합격확률 ${passProbability}%`);
    }
    
    /**
     * 학습 진도 분석
     */
    analyzeStudyProgress() {
        const insuranceData = JSON.parse(localStorage.getItem('insurance_real_time_data') || '{}');
        const studyPlan = JSON.parse(localStorage.getItem('insurance_study_plan') || '{}');
        
        const analysis = {
            overall_progress: 0,
            category_progress: {},
            daily_achievement: 0,
            recommendations: []
        };
        
        // 카테고리별 진도 분석
        let totalSolved = 0;
        this.examCategories.forEach(category => {
            if (insuranceData[category]) {
                const solved = insuranceData[category].solved || 0;
                totalSolved += solved;
                
                analysis.category_progress[category] = {
                    solved: solved,
                    accuracy: parseFloat(insuranceData[category].accuracy) || 0,
                    expected_score: insuranceData[category].expected_score || 0,
                    pass_ready: (insuranceData[category].expected_score || 0) >= this.passThreshold
                };
            }
        });
        
        // 전체 진도율 계산
        if (studyPlan.total_questions) {
            analysis.overall_progress = Math.round((totalSolved / studyPlan.total_questions) * 100);
        }
        
        // 일일 목표 달성도
        const today = new Date().toISOString().split('T')[0];
        let todaySolved = 0;
        this.examCategories.forEach(category => {
            if (insuranceData[category] && insuranceData[category].daily_progress[today]) {
                todaySolved += insuranceData[category].daily_progress[today].solved || 0;
            }
        });
        
        if (studyPlan.daily_target) {
            analysis.daily_achievement = Math.round((todaySolved / studyPlan.daily_target) * 100);
        }
        
        // 추천사항 생성
        analysis.recommendations = this.generateStudyRecommendations(analysis);
        
        return analysis;
    }
    
    /**
     * 학습 추천사항 생성
     */
    generateStudyRecommendations(analysis) {
        const recommendations = [];
        
        // 전체 진도 기반 추천
        if (analysis.overall_progress < 50) {
            recommendations.push("전체 진도가 50% 미만입니다. 학습 속도를 높여주세요.");
        }
        
        // 카테고리별 추천
        Object.keys(analysis.category_progress).forEach(category => {
            const progress = analysis.category_progress[category];
            
            if (!progress.pass_ready) {
                recommendations.push(`${category} 영역의 집중 학습이 필요합니다 (현재 예상점수: ${progress.expected_score}점).`);
            }
            
            if (progress.accuracy < 60) {
                recommendations.push(`${category} 영역의 정답률이 낮습니다 (${progress.accuracy}%). 기본 개념 복습을 권장합니다.`);
            }
        });
        
        // 일일 목표 기반 추천
        if (analysis.daily_achievement < 80) {
            recommendations.push("오늘의 학습 목표 달성률이 낮습니다. 추가 학습을 권장합니다.");
        }
        
        return recommendations;
    }
}
```

---

## 🎯 결론

### **데이터 아키텍처 및 통계 설계의 핵심 가치**

1. **중앙 집중식 데이터 관리**: 단일 진실 공급원을 통한 데이터 일관성 보장
2. **실시간 동기화**: 모든 페이지 간 즉시 데이터 동기화
3. **데이터 무결성**: 체계적인 검증 및 자동 복구 시스템
4. **확장 가능성**: 새로운 시험 유형에 쉽게 적용 가능한 구조

### **새 프로젝트 적용 시 주의사항**

1. **데이터 구조 설계**: 도메인에 맞는 적절한 데이터 구조 설계
2. **무결성 검증**: 정기적인 데이터 검증 및 자동 복구 시스템 구축
3. **백업 전략**: 안전한 데이터 백업 및 복구 시스템 구현
4. **성능 최적화**: LocalStorage 용량 제한 고려한 효율적인 데이터 관리

### **지속적 개선 방향**

1. **데이터 압축**: 대용량 데이터 효율적 저장
2. **클라우드 동기화**: 서버 기반 데이터 동기화 시스템
3. **AI 분석**: 학습 패턴 기반 지능형 분석
4. **실시간 협업**: 다중 사용자 실시간 학습 지원

이 데이터 아키텍처 및 통계 설계를 통해 **안정적이고 확장 가능한 학습 플랫폼**을 구축할 수 있을 것입니다.

---

**작성 완료**: 2024년 12월 19일  
**다음 단계**: 148번 문서 (ACIU_Implementation_Guides.md) 작성
