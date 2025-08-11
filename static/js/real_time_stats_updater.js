/**
 * RealTimeStatsUpdater - 실시간 통계 업데이트 시스템
 * 077번 계획서 기반 구현
 */

class RealTimeStatsUpdater {
    constructor() {
        this.todayStats = {
            total_questions: 0,
            correct_answers: 0,
            accuracy: 0
        };
        this.overallStats = {
            total_questions: 0,
            correct_answers: 0,
            accuracy: 0
        };
        
        // AdvancedProgressManager 의존성 주입
        this.progressManager = null;
        
        console.log('RealTimeStatsUpdater 초기화 완료');
    }
    
    // 의존성 설정
    setProgressManager(progressManager) {
        this.progressManager = progressManager;
        console.log('ProgressManager 의존성 주입 완료');
    }
    
    // 문제 풀이 시 즉시 통계 업데이트
    updateOnQuestionSolved(isCorrect, mode, category) {
        console.log(`실시간 통계 업데이트: ${mode}/${category}, 정답: ${isCorrect}`);
        
        // 오늘 통계 업데이트
        this.todayStats.total_questions++;
        if (isCorrect) {
            this.todayStats.correct_answers++;
        }
        this.todayStats.accuracy = this.todayStats.total_questions > 0 ? 
            Math.round((this.todayStats.correct_answers / this.todayStats.total_questions) * 100) : 0;
        
        // 전체 통계 업데이트 (ProgressManager에서 가져옴)
        if (this.progressManager) {
            this.overallStats = {
                total_questions: this.progressManager.statistics.total_questions_solved,
                correct_answers: this.progressManager.statistics.total_correct_answers,
                accuracy: this.progressManager.statistics.overall_accuracy
            };
        }
        
        // UI 즉시 업데이트
        this.updateHomeUI();
        this.updateLearningUI(mode, category);
        
        console.log('실시간 통계 업데이트 완료:', {
            today: this.todayStats,
            overall: this.overallStats
        });
    }
    
    // 홈 화면 UI 업데이트
    updateHomeUI() {
        // 오늘 총 풀이 문제 수
        const todayTotalElement = document.getElementById('today-total-questions');
        if (todayTotalElement) {
            todayTotalElement.textContent = this.todayStats.total_questions;
        }
        
        // 완료된 문제 수 (전체 누적)
        const completedElement = document.getElementById('completed-questions');
        if (completedElement) {
            completedElement.textContent = this.overallStats.total_questions;
        }
        
        // 정답률
        const accuracyElement = document.getElementById('overall-accuracy');
        if (accuracyElement) {
            accuracyElement.textContent = `${this.overallStats.accuracy}%`;
        }
        
        // 오늘 정답률
        const todayAccuracyElement = document.getElementById('today-accuracy');
        if (todayAccuracyElement) {
            todayAccuracyElement.textContent = `${this.todayStats.accuracy}%`;
        }
        
        console.log('홈 화면 UI 업데이트 완료');
    }
    
    // 학습 화면 UI 업데이트
    updateLearningUI(mode, category) {
        if (!this.progressManager) return;
        
        const progress = this.progressManager.getProgressForCategory(category);
        
        // 해당 모드의 오늘 통계
        const todayAttemptedElement = document.getElementById(`${mode}-today-attempted`);
        if (todayAttemptedElement) {
            todayAttemptedElement.textContent = progress.today_attempted;
        }
        
        const todayCorrectElement = document.getElementById(`${mode}-today-correct`);
        if (todayCorrectElement) {
            todayCorrectElement.textContent = progress.today_correct;
        }
        
        // 해당 모드의 누적 통계
        const totalAttemptedElement = document.getElementById(`${mode}-total-attempted`);
        if (totalAttemptedElement) {
            totalAttemptedElement.textContent = progress.total_attempted;
        }
        
        const totalCorrectElement = document.getElementById(`${mode}-total-correct`);
        if (totalCorrectElement) {
            totalCorrectElement.textContent = progress.total_correct;
        }
        
        console.log(`${mode}/${category} 학습 화면 UI 업데이트 완료`);
    }
    
    // 통계 초기화 (새로운 날짜)
    resetTodayStats() {
        this.todayStats = {
            total_questions: 0,
            correct_answers: 0,
            accuracy: 0
        };
        console.log('오늘 통계 초기화 완료');
    }
    
    // 통계 새로고침 (외부에서 호출)
    refreshStats() {
        if (this.progressManager) {
            this.overallStats = {
                total_questions: this.progressManager.statistics.total_questions_solved,
                correct_answers: this.progressManager.statistics.total_correct_answers,
                accuracy: this.progressManager.statistics.overall_accuracy
            };
        }
        
        this.updateHomeUI();
        console.log('통계 새로고침 완료');
    }
    
    // 테스트 함수
    testModule() {
        console.log('=== RealTimeStatsUpdater 테스트 시작 ===');
        
        // 1. 기본 통계 업데이트 테스트
        this.updateOnQuestionSolved(true, 'basic_learning', 'basic_learning');
        this.updateOnQuestionSolved(false, 'basic_learning', 'basic_learning');
        
        // 2. 카테고리 통계 업데이트 테스트
        this.updateOnQuestionSolved(true, 'categories', '해상보험');
        this.updateOnQuestionSolved(true, 'categories', '해상보험');
        
        // 3. 통계 확인
        console.log('테스트 후 통계:', {
            today: this.todayStats,
            overall: this.overallStats
        });
        
        console.log('=== RealTimeStatsUpdater 테스트 완료 ===');
        return true;
    }
}

// 전역 인스턴스 생성
window.realTimeStatsUpdater = new RealTimeStatsUpdater();
