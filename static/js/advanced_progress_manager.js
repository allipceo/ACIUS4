/**
 * AdvancedProgressManager - 고도화된 진도 관리 시스템
 * 077번 계획서 기반 구현
 */

class AdvancedProgressManager {
    constructor() {
        this.statisticsFile = 'statistics.json';
        this.userInfo = this.getDefaultUserInfo();
        this.progressData = this.getDefaultProgressData();
        this.dailyLogs = [];
        this.statistics = this.getDefaultStatistics();
        
        // 초기화 시 저장된 데이터 로드
        this.loadStatistics();
        console.log('AdvancedProgressManager 초기화 완료');
    }
    
    // 자동 등록 시스템 - 기본값으로 시작
    getDefaultUserInfo() {
        return {
            name: "홍길동",
            registration_date: new Date().toISOString().split('T')[0],
            exam_name: "ACIU",
            exam_date: "2025-09-13",
            phone: "010-1234-5678",
            is_registered: false,
            is_demo_mode: true
        };
    }
    
    // 기본 진도 데이터 구조
    getDefaultProgressData() {
        return {
            basic_learning: {
                last_question: 0,
                total_attempted: 0,
                total_correct: 0,
                today_attempted: 0,
                today_correct: 0,
                last_study_date: null
            },
            categories: {
                해상보험: {
                    last_question: 0,
                    total_attempted: 0,
                    total_correct: 0,
                    today_attempted: 0,
                    today_correct: 0,
                    last_study_date: null
                },
                배상책임보험: {
                    last_question: 0,
                    total_attempted: 0,
                    total_correct: 0,
                    today_attempted: 0,
                    today_correct: 0,
                    last_study_date: null
                },
                재산보험: {
                    last_question: 0,
                    total_attempted: 0,
                    total_correct: 0,
                    today_attempted: 0,
                    today_correct: 0,
                    last_study_date: null
                },
                특종보험: {
                    last_question: 0,
                    total_attempted: 0,
                    total_correct: 0,
                    today_attempted: 0,
                    today_correct: 0,
                    last_study_date: null
                }
            }
        };
    }
    
    // 기본 통계 데이터 구조
    getDefaultStatistics() {
        return {
            total_questions_solved: 0,
            total_correct_answers: 0,
            overall_accuracy: 0,
            study_days: 0,
            current_streak: 0
        };
    }
    
    // 정확한 이어풀기 - 다음 문제 번호 반환
    getNextQuestion(category) {
        const progress = this.getProgressForCategory(category);
        const nextQuestion = progress.last_question + 1;
        console.log(`${category} 다음 문제: ${nextQuestion}번`);
        return nextQuestion;
    }
    
    // 카테고리별 진도 가져오기
    getProgressForCategory(category) {
        if (category === 'basic_learning') {
            return this.progressData.basic_learning;
        } else {
            return this.progressData.categories[category] || {
                last_question: 0,
                total_attempted: 0,
                total_correct: 0,
                today_attempted: 0,
                today_correct: 0,
                last_study_date: null
            };
        }
    }
    
    // 문제 풀이 후 진도 업데이트 (정확한 이어풀기 핵심)
    updateProgress(category, questionId, isCorrect) {
        const progress = this.getProgressForCategory(category);
        
        // 진도 업데이트
        progress.last_question = questionId;
        progress.total_attempted++;
        if (isCorrect) {
            progress.total_correct++;
        }
        
        // 오늘 통계 업데이트
        const today = new Date().toISOString().split('T')[0];
        if (progress.last_study_date !== today) {
            progress.today_attempted = 0;
            progress.today_correct = 0;
            progress.last_study_date = today;
        }
        
        progress.today_attempted++;
        if (isCorrect) {
            progress.today_correct++;
        }
        
        // 시간별 로그 기록
        this.logQuestionAttempt(questionId, category, isCorrect);
        
        // 통계 업데이트
        this.updateStatistics();
        
        // LocalStorage에 저장
        this.saveStatistics();
        
        console.log(`${category} ${questionId}번 완료, 다음 문제: ${questionId + 1}번`);
    }
    
    // 시간별 로그 시스템
    logQuestionAttempt(questionId, category, isCorrect) {
        const log = {
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString(),
            question_id: questionId,
            category: category,
            is_correct: isCorrect,
            session_id: this.generateSessionId()
        };
        this.dailyLogs.push(log);
        console.log('문제 풀이 로그 기록:', log);
    }
    
    // 세션 ID 생성
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // 통계 업데이트
    updateStatistics() {
        // 전체 통계 계산
        let totalSolved = 0;
        let totalCorrect = 0;
        
        // 기본학습 통계
        const basicProgress = this.progressData.basic_learning;
        totalSolved += basicProgress.total_attempted;
        totalCorrect += basicProgress.total_correct;
        
        // 카테고리별 통계
        Object.values(this.progressData.categories).forEach(category => {
            totalSolved += category.total_attempted;
            totalCorrect += category.total_correct;
        });
        
        // 통계 업데이트
        this.statistics.total_questions_solved = totalSolved;
        this.statistics.total_correct_answers = totalCorrect;
        this.statistics.overall_accuracy = totalSolved > 0 ? 
            Math.round((totalCorrect / totalSolved) * 100) : 0;
        
        console.log('통계 업데이트:', this.statistics);
    }
    
    // 실제 사용자 등록 시 데이터 초기화
    registerRealUser(realUserInfo) {
        console.log('실제 사용자 등록 시작:', realUserInfo);
        
        // 1. 기존 데이터 완전 초기화
        this.clearAllData();
        
        // 2. 실제 사용자 정보 설정
        this.userInfo = {
            ...realUserInfo,
            is_registered: true,
            is_demo_mode: false,
            registration_date: new Date().toISOString().split('T')[0]
        };
        
        // 3. 새로운 통계 시작
        this.initializeRealStatistics();
        
        // 4. 저장
        this.saveStatistics();
        
        console.log('실제 사용자 등록 완료:', this.userInfo);
    }
    
    // 기존 데이터 초기화
    clearAllData() {
        console.log('기존 데이터 초기화 시작');
        
        // LocalStorage 초기화
        localStorage.removeItem('aicu_statistics');
        localStorage.removeItem('aicu_progress');
        localStorage.removeItem('aicu_precise_progress');
        
        // 메모리 데이터 초기화
        this.progressData = this.getDefaultProgressData();
        this.dailyLogs = [];
        this.statistics = this.getDefaultStatistics();
        
        console.log('기존 데이터 초기화 완료');
    }
    
    // 실제 통계 초기화
    initializeRealStatistics() {
        this.statistics = {
            total_questions_solved: 0,
            total_correct_answers: 0,
            overall_accuracy: 0,
            study_days: 1,
            current_streak: 1
        };
    }
    
    // 통계 저장
    saveStatistics() {
        const data = {
            user_info: this.userInfo,
            progress_data: this.progressData,
            daily_logs: this.dailyLogs,
            statistics: this.statistics
        };
        
        try {
            localStorage.setItem('aicu_advanced_statistics', JSON.stringify(data));
            console.log('고도화된 통계 저장 완료');
            return true;
        } catch (error) {
            console.error('통계 저장 실패:', error);
            return false;
        }
    }
    
    // 통계 로드
    loadStatistics() {
        try {
            const savedData = localStorage.getItem('aicu_advanced_statistics');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.userInfo = data.user_info || this.getDefaultUserInfo();
                this.progressData = data.progress_data || this.getDefaultProgressData();
                this.dailyLogs = data.daily_logs || [];
                this.statistics = data.statistics || this.getDefaultStatistics();
                console.log('고도화된 통계 로드 완료');
                return true;
            }
        } catch (error) {
            console.error('통계 로드 실패:', error);
        }
        return false;
    }
    
    // 테스트 함수
    testModule() {
        console.log('=== AdvancedProgressManager 테스트 시작 ===');
        
        // 1. 기본 진도 테스트
        const nextQuestion = this.getNextQuestion('해상보험');
        console.log('해상보험 다음 문제:', nextQuestion);
        
        // 2. 진도 업데이트 테스트
        this.updateProgress('해상보험', 5, true);
        this.updateProgress('해상보험', 6, false);
        
        // 3. 다음 문제 확인
        const nextQuestion2 = this.getNextQuestion('해상보험');
        console.log('업데이트 후 해상보험 다음 문제:', nextQuestion2);
        
        // 4. 기본학습 진도 테스트
        this.updateProgress('basic_learning', 10, true);
        const nextBasic = this.getNextQuestion('basic_learning');
        console.log('기본학습 다음 문제:', nextBasic);
        
        console.log('=== AdvancedProgressManager 테스트 완료 ===');
        return true;
    }
}

// 전역 인스턴스 생성
window.advancedProgressManager = new AdvancedProgressManager();
