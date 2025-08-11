/**
 * AdvancedStatisticsSystem - 고도화된 통계 시스템 통합 관리자
 * 077번 계획서 기반 구현
 */

class AdvancedStatisticsSystem {
    constructor() {
        this.progressManager = null;
        this.realTimeUpdater = null;
        this.isInitialized = false;
        
        console.log('AdvancedStatisticsSystem 초기화 시작');
    }
    
    // 시스템 초기화
    async initialize() {
        try {
            console.log('=== AdvancedStatisticsSystem 초기화 시작 ===');
            
            // 1. AdvancedProgressManager 초기화
            if (window.advancedProgressManager) {
                this.progressManager = window.advancedProgressManager;
                console.log('✅ AdvancedProgressManager 로드 완료');
            } else {
                throw new Error('AdvancedProgressManager가 로드되지 않았습니다.');
            }
            
            // 2. RealTimeStatsUpdater 초기화
            if (window.realTimeStatsUpdater) {
                this.realTimeUpdater = window.realTimeStatsUpdater;
                this.realTimeUpdater.setProgressManager(this.progressManager);
                console.log('✅ RealTimeStatsUpdater 로드 완료');
            } else {
                throw new Error('RealTimeStatsUpdater가 로드되지 않았습니다.');
            }
            
            // 3. 초기 통계 로드
            this.refreshAllStats();
            
            this.isInitialized = true;
            console.log('✅ AdvancedStatisticsSystem 초기화 완료');
            
            return true;
        } catch (error) {
            console.error('❌ AdvancedStatisticsSystem 초기화 실패:', error);
            return false;
        }
    }
    
    // 문제 풀이 후 통합 업데이트 (핵심 기능)
    updateOnQuestionSolved(category, questionId, isCorrect) {
        if (!this.isInitialized) {
            console.error('시스템이 초기화되지 않았습니다.');
            return false;
        }
        
        try {
            console.log(`=== 문제 풀이 업데이트: ${category} ${questionId}번, 정답: ${isCorrect} ===`);
            
            // 1. ProgressManager 업데이트 (진도 및 통계)
            this.progressManager.updateProgress(category, questionId, isCorrect);
            
            // 2. 실시간 UI 업데이트
            const mode = category === 'basic_learning' ? 'basic_learning' : 'categories';
            this.realTimeUpdater.updateOnQuestionSolved(isCorrect, mode, category);
            
            console.log('✅ 문제 풀이 업데이트 완료');
            return true;
        } catch (error) {
            console.error('❌ 문제 풀이 업데이트 실패:', error);
            return false;
        }
    }
    
    // 다음 문제 가져오기 (정확한 이어풀기)
    getNextQuestion(category) {
        if (!this.isInitialized) {
            console.error('시스템이 초기화되지 않았습니다.');
            return 1; // 기본값
        }
        
        try {
            const nextQuestion = this.progressManager.getNextQuestion(category);
            console.log(`${category} 다음 문제: ${nextQuestion}번`);
            return nextQuestion;
        } catch (error) {
            console.error('❌ 다음 문제 가져오기 실패:', error);
            return 1; // 기본값
        }
    }
    
    // 실제 사용자 등록
    registerRealUser(realUserInfo) {
        if (!this.isInitialized) {
            console.error('시스템이 초기화되지 않았습니다.');
            return false;
        }
        
        try {
            console.log('=== 실제 사용자 등록 시작 ===');
            
            // 1. ProgressManager에서 사용자 등록
            this.progressManager.registerRealUser(realUserInfo);
            
            // 2. 실시간 업데이터 초기화
            this.realTimeUpdater.resetTodayStats();
            
            // 3. 모든 통계 새로고침
            this.refreshAllStats();
            
            console.log('✅ 실제 사용자 등록 완료');
            return true;
        } catch (error) {
            console.error('❌ 실제 사용자 등록 실패:', error);
            return false;
        }
    }
    
    // 모든 통계 새로고침
    refreshAllStats() {
        if (!this.isInitialized) {
            console.error('시스템이 초기화되지 않았습니다.');
            return false;
        }
        
        try {
            console.log('=== 모든 통계 새로고침 ===');
            
            // 1. 실시간 업데이터 새로고침
            this.realTimeUpdater.refreshStats();
            
            // 2. 홈 화면 UI 업데이트
            this.updateHomeUI();
            
            console.log('✅ 모든 통계 새로고침 완료');
            return true;
        } catch (error) {
            console.error('❌ 통계 새로고침 실패:', error);
            return false;
        }
    }
    
    // 홈 화면 UI 업데이트
    updateHomeUI() {
        if (!this.isInitialized) return;
        
        try {
            // 사용자 정보 표시
            const userInfo = this.progressManager.userInfo;
            const userNameElement = document.getElementById('user-name');
            if (userNameElement) {
                userNameElement.textContent = userInfo.name;
            }
            
            const userModeElement = document.getElementById('user-mode');
            if (userModeElement) {
                userModeElement.textContent = userInfo.is_demo_mode ? '데모 모드' : '실제 등록';
            }
            
            // 통계 정보 표시
            const stats = this.progressManager.statistics;
            const totalSolvedElement = document.getElementById('total-solved');
            if (totalSolvedElement) {
                totalSolvedElement.textContent = stats.total_questions_solved;
            }
            
            const totalCorrectElement = document.getElementById('total-correct');
            if (totalCorrectElement) {
                totalCorrectElement.textContent = stats.total_correct_answers;
            }
            
            const accuracyElement = document.getElementById('overall-accuracy');
            if (accuracyElement) {
                accuracyElement.textContent = `${stats.overall_accuracy}%`;
            }
            
            console.log('홈 화면 UI 업데이트 완료');
        } catch (error) {
            console.error('홈 화면 UI 업데이트 실패:', error);
        }
    }
    
    // 시스템 상태 확인
    getSystemStatus() {
        return {
            isInitialized: this.isInitialized,
            progressManager: !!this.progressManager,
            realTimeUpdater: !!this.realTimeUpdater,
            userInfo: this.progressManager ? this.progressManager.userInfo : null,
            statistics: this.progressManager ? this.progressManager.statistics : null
        };
    }
    
    // 시스템 테스트
    async testSystem() {
        console.log('=== AdvancedStatisticsSystem 테스트 시작 ===');
        
        try {
            // 1. 초기화 테스트
            const initResult = await this.initialize();
            if (!initResult) {
                throw new Error('시스템 초기화 실패');
            }
            
            // 2. 문제 풀이 시뮬레이션
            console.log('문제 풀이 시뮬레이션 시작');
            
            // 기본학습 1-3번 풀이
            this.updateOnQuestionSolved('basic_learning', 1, true);
            this.updateOnQuestionSolved('basic_learning', 2, false);
            this.updateOnQuestionSolved('basic_learning', 3, true);
            
            // 해상보험 1-2번 풀이
            this.updateOnQuestionSolved('해상보험', 1, true);
            this.updateOnQuestionSolved('해상보험', 2, true);
            
            // 3. 이어풀기 테스트
            const nextBasic = this.getNextQuestion('basic_learning');
            const nextMarine = this.getNextQuestion('해상보험');
            
            console.log(`기본학습 다음 문제: ${nextBasic}번`);
            console.log(`해상보험 다음 문제: ${nextMarine}번`);
            
            // 4. 시스템 상태 확인
            const status = this.getSystemStatus();
            console.log('시스템 상태:', status);
            
            console.log('=== AdvancedStatisticsSystem 테스트 완료 ===');
            return true;
        } catch (error) {
            console.error('❌ 시스템 테스트 실패:', error);
            return false;
        }
    }
}

// 전역 인스턴스 생성
window.advancedStatisticsSystem = new AdvancedStatisticsSystem();

// 페이지 로드 시 자동 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('페이지 로드 완료 - AdvancedStatisticsSystem 자동 초기화 시작');
    
    setTimeout(async () => {
        if (window.advancedStatisticsSystem) {
            await window.advancedStatisticsSystem.initialize();
        }
    }, 1000);
});
