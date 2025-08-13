/**
 * ProgressManager - 데이터 관리 모듈 (레고블록 1)
 * 075번 문서 V1.3 + 분산형 레고블록 개발 방법론 적용
 * 
 * 핵심 기능:
 * - saveProgress(): 진도 저장
 * - getProgress(): 진도 조회  
 * - getNextQuestion(): 다음 문제 번호 조회
 */

class ProgressManager {
    constructor() {
        this.storageKey = 'aicu_progress';
        this.maxQuestions = {
            basic: 789,
            '재산보험': 197,
            '특종보험': 263,
            '배상보험': 197,
            '해상보험': 132
        };
    }

    /**
     * 기본 진도 데이터 구조 생성
     */
    getDefaultProgressData() {
        return {
            version: '1.0',
            lastBackup: new Date().toISOString(),
            
            userInfo: {
                registrationDate: new Date().toISOString(),
                userName: '사용자',
                examDate: '2025-12-15',
                lastLoginDate: new Date().toISOString().split('T')[0]
            },
            
            basicLearning: {
                lastQuestion: 0,
                totalAttempted: 0,
                totalCorrect: 0,
                todayAttempted: 0,
                todayCorrect: 0,
                lastStudyDate: new Date().toISOString().split('T')[0]
            },
            
            categories: {
                '재산보험': {
                    lastQuestion: 0,
                    totalAttempted: 0,
                    totalCorrect: 0,
                    todayAttempted: 0,
                    todayCorrect: 0,
                    maxQuestions: 197
                },
                '특종보험': {
                    lastQuestion: 0,
                    totalAttempted: 0,
                    totalCorrect: 0,
                    todayAttempted: 0,
                    todayCorrect: 0,
                    maxQuestions: 263
                },
                '배상보험': {
                    lastQuestion: 0,
                    totalAttempted: 0,
                    totalCorrect: 0,
                    todayAttempted: 0,
                    todayCorrect: 0,
                    maxQuestions: 197
                },
                '해상보험': {
                    lastQuestion: 0,
                    totalAttempted: 0,
                    totalCorrect: 0,
                    todayAttempted: 0,
                    todayCorrect: 0,
                    maxQuestions: 132
                }
            },
            
            backup: {
                lastValidData: null,
                errorCount: 0
            }
        };
    }

    /**
     * 진도 데이터 검증
     */
    validateProgressData(data) {
        if (!data) return false;
        
        const required = ['basicLearning', 'categories', 'userInfo'];
        if (!required.every(field => data[field])) {
            return false;
        }
        
        // 기본학습 데이터 범위 검증
        if (data.basicLearning.lastQuestion < 0 || data.basicLearning.lastQuestion > this.maxQuestions.basic) {
            return false;
        }
        
        // 카테고리별 데이터 범위 검증
        for (const [category, maxQ] of Object.entries(this.maxQuestions)) {
            if (category === 'basic') continue;
            
            if (data.categories[category]) {
                if (data.categories[category].lastQuestion < 0 || 
                    data.categories[category].lastQuestion > maxQ) {
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * 진도 조회 (핵심 함수 1)
     */
    getProgress() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (!stored) {
                return this.getDefaultProgressData();
            }
            
            const data = JSON.parse(stored);
            
            // 데이터 검증
            if (!this.validateProgressData(data)) {
                console.warn('Invalid data structure, creating new');
                return this.getDefaultProgressData();
            }
            
            return data;
        } catch (error) {
            console.error('Error loading progress:', error);
            return this.getDefaultProgressData();
        }
    }

    /**
     * 진도 저장 (핵심 함수 2)
     */
    saveProgress(mode, questionNumber, isCorrect) {
        try {
            const progress = this.getProgress();
            
            // 데이터 검증
            if (!this.validateQuestionNumber(mode, questionNumber)) {
                throw new Error(`Invalid question number: ${questionNumber} for mode: ${mode}`);
            }
            
            // 백업 생성
            progress.backup.lastValidData = JSON.parse(JSON.stringify(progress));
            progress.backup.errorCount = 0;
            
            const today = new Date().toISOString().split('T')[0];
            
            if (mode === 'basic') {
                // 기본학습 진도 업데이트
                progress.basicLearning.lastQuestion = questionNumber;
                progress.basicLearning.totalAttempted++;
                progress.basicLearning.todayAttempted++;
                
                if (isCorrect) {
                    progress.basicLearning.totalCorrect++;
                    progress.basicLearning.todayCorrect++;
                }
                
                progress.basicLearning.lastStudyDate = today;
            } else {
                // 카테고리별 진도 업데이트
                const category = mode;
                if (progress.categories[category]) {
                    progress.categories[category].lastQuestion = questionNumber;
                    progress.categories[category].totalAttempted++;
                    progress.categories[category].todayAttempted++;
                    
                    if (isCorrect) {
                        progress.categories[category].totalCorrect++;
                        progress.categories[category].todayCorrect++;
                    }
                }
            }
            
            // LocalStorage에 저장
            localStorage.setItem(this.storageKey, JSON.stringify(progress));
            
            console.log(`Progress saved: ${mode} - Q${questionNumber} - ${isCorrect ? 'Correct' : 'Incorrect'}`);
            return true;
            
        } catch (error) {
            console.error('Error saving progress:', error);
            return false;
        }
    }

    /**
     * 다음 문제 번호 조회 (핵심 함수 3)
     */
    getNextQuestion(mode) {
        try {
            const progress = this.getProgress();
            
            if (mode === 'basic') {
                const nextQuestion = progress.basicLearning.lastQuestion + 1;
                return nextQuestion <= this.maxQuestions.basic ? nextQuestion : 1; // 순환
            } else {
                // 카테고리별 다음 문제
                const category = mode;
                if (progress.categories[category]) {
                    const nextQuestion = progress.categories[category].lastQuestion + 1;
                    return nextQuestion <= this.maxQuestions[category] ? nextQuestion : 1; // 순환
                }
            }
            
            return 1; // 기본값
        } catch (error) {
            console.error('Error getting next question:', error);
            return 1;
        }
    }

    /**
     * 문제 번호 검증
     */
    validateQuestionNumber(mode, questionNumber) {
        if (typeof questionNumber !== 'number' || questionNumber < 0) {
            return false;
        }
        
        if (mode === 'basic') {
            return questionNumber <= this.maxQuestions.basic;
        } else {
            return questionNumber <= this.maxQuestions[mode];
        }
    }

    /**
     * 오늘 날짜 초기화 (새로운 날짜 체크)
     */
    resetTodayStats() {
        const progress = this.getProgress();
        const today = new Date().toISOString().split('T')[0];
        
        let needsUpdate = false;
        
        // 기본학습 오늘 통계 초기화
        if (progress.basicLearning.lastStudyDate !== today) {
            progress.basicLearning.todayAttempted = 0;
            progress.basicLearning.todayCorrect = 0;
            progress.basicLearning.lastStudyDate = today;
            needsUpdate = true;
        }
        
        // 카테고리별 오늘 통계 초기화
        for (const category of Object.keys(progress.categories)) {
            if (progress.categories[category].lastStudyDate !== today) {
                progress.categories[category].todayAttempted = 0;
                progress.categories[category].todayCorrect = 0;
                progress.categories[category].lastStudyDate = today;
                needsUpdate = true;
            }
        }
        
        if (needsUpdate) {
            localStorage.setItem(this.storageKey, JSON.stringify(progress));
        }
        
        return progress;
    }

    /**
     * 모듈 테스트 함수
     */
    testModule() {
        console.log('=== ProgressManager 모듈 테스트 시작 ===');
        
        // 1. 기본 데이터 생성 테스트
        const defaultData = this.getDefaultProgressData();
        console.log('✅ 기본 데이터 생성:', defaultData.version);
        
        // 2. 진도 저장 테스트
        const saveResult1 = this.saveProgress('basic', 5, true);
        const saveResult2 = this.saveProgress('재산보험', 10, false);
        console.log('✅ 진도 저장 테스트:', saveResult1, saveResult2);
        
        // 3. 진도 조회 테스트
        const progress = this.getProgress();
        console.log('✅ 진도 조회 테스트:', progress.basicLearning.lastQuestion);
        
        // 4. 다음 문제 조회 테스트
        const nextBasic = this.getNextQuestion('basic');
        const nextCategory = this.getNextQuestion('재산보험');
        console.log('✅ 다음 문제 조회 테스트:', nextBasic, nextCategory);
        
        // 5. 데이터 검증 테스트
        const validation = this.validateProgressData(progress);
        console.log('✅ 데이터 검증 테스트:', validation);
        
        console.log('=== ProgressManager 모듈 테스트 완료 ===');
        return true;
    }
}

// 전역 인스턴스 생성
const progressManager = new ProgressManager();

// 모듈 테스트 실행 (개발 모드에서만)
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // 페이지 로드 후 테스트 실행
    window.addEventListener('load', () => {
        setTimeout(() => {
            progressManager.testModule();
        }, 1000);
    });
}
