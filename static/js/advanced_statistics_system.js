/**
 * AdvancedStatisticsSystem - 고도화된 통계 시스템 통합 관리자 (성능 최적화 버전)
 * 077번 계획서 기반 구현
 * Phase 3: 성능 최적화 적용
 */

class AdvancedStatisticsSystem {
    constructor() {
        this.progressManager = null;
        this.realTimeUpdater = null;
        this.isInitialized = false;
        this.initializationPromise = null; // 초기화 중복 방지
        this.updateQueue = []; // 업데이트 큐
        this.isProcessingQueue = false; // 큐 처리 상태
        
        // 성능 최적화: 디바운싱 설정
        this.updateDebounceTimer = null;
        this.updateDebounceDelay = 100; // 100ms 디바운싱
        
        console.log('AdvancedStatisticsSystem 초기화 시작 (성능 최적화 버전)');
    }
    
    // 시스템 초기화 (성능 최적화)
    async initialize() {
        // 중복 초기화 방지
        if (this.initializationPromise) {
            return this.initializationPromise;
        }
        
        this.initializationPromise = this._performInitialization();
        return this.initializationPromise;
    }
    
    // 실제 초기화 수행
    async _performInitialization() {
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
            
            // 3. 초기 통계 로드 (비동기)
            await this._loadInitialStatistics();
            
            this.isInitialized = true;
            console.log('✅ AdvancedStatisticsSystem 초기화 완료');
            
            return true;
        } catch (error) {
            console.error('❌ AdvancedStatisticsSystem 초기화 실패:', error);
            this.initializationPromise = null; // 재시도 허용
            return false;
        }
    }
    
    // 초기 통계 로드 (성능 최적화)
    async _loadInitialStatistics() {
        return new Promise((resolve) => {
            // 비동기로 통계 로드
            setTimeout(() => {
                try {
                    this.refreshAllStats();
                    resolve();
                } catch (error) {
                    console.error('초기 통계 로드 실패:', error);
                    resolve(); // 오류가 있어도 계속 진행
                }
            }, 50);
        });
    }
    
    // 문제 풀이 후 통합 업데이트 (성능 최적화)
    updateOnQuestionSolved(category, questionId, isCorrect) {
        if (!this.isInitialized) {
            console.error('시스템이 초기화되지 않았습니다.');
            return false;
        }
        
        // 업데이트 큐에 추가
        this.updateQueue.push({ category, questionId, isCorrect });
        
        // 디바운싱된 업데이트 실행
        this._debouncedProcessQueue();
        
        return true;
    }
    
    // 디바운싱된 큐 처리
    _debouncedProcessQueue() {
        if (this.updateDebounceTimer) {
            clearTimeout(this.updateDebounceTimer);
        }
        
        this.updateDebounceTimer = setTimeout(() => {
            this._processUpdateQueue();
        }, this.updateDebounceDelay);
    }
    
    // 업데이트 큐 처리
    async _processUpdateQueue() {
        if (this.isProcessingQueue || this.updateQueue.length === 0) {
            return;
        }
        
        this.isProcessingQueue = true;
        
        try {
            // 큐의 모든 업데이트를 배치로 처리
            const updates = [...this.updateQueue];
            this.updateQueue = [];
            
            console.log(`=== 배치 업데이트 처리: ${updates.length}개 항목 ===`);
            
            for (const update of updates) {
                await this._processSingleUpdate(update);
            }
            
            // UI 업데이트는 한 번만 실행
            this._updateUI();
            
        } catch (error) {
            console.error('❌ 업데이트 큐 처리 실패:', error);
        } finally {
            this.isProcessingQueue = false;
        }
    }
    
    // 단일 업데이트 처리
    async _processSingleUpdate(update) {
        try {
            const { category, questionId, isCorrect } = update;
            
            // 1. ProgressManager 업데이트 (진도 및 통계)
            this.progressManager.updateProgress(category, questionId, isCorrect);
            
            // 2. 실시간 업데이터에 업데이트 정보 전달
            const mode = category === 'basic_learning' ? 'basic_learning' : 'categories';
            this.realTimeUpdater.updateOnQuestionSolved(isCorrect, mode, category);
            
            // 3. 알림 시스템 통합 (Phase 3 추가)
            this._showUpdateNotification(category, questionId, isCorrect);
            
        } catch (error) {
            console.error('단일 업데이트 처리 실패:', error);
        }
    }
    
    // 업데이트 알림 표시
    _showUpdateNotification(category, questionId, isCorrect) {
        if (window.notificationSystem) {
            const categoryName = category === 'basic_learning' ? '기본학습' : category;
            const result = isCorrect ? '정답' : '오답';
            const message = `${categoryName} ${questionId}번 문제 ${result}!`;
            
            if (isCorrect) {
                window.notificationSystem.success(message, 2000);
            } else {
                window.notificationSystem.warning(message, 2000);
            }
        }
    }
    
    // UI 업데이트 (성능 최적화)
    _updateUI() {
        try {
            // 실시간 업데이터의 UI 업데이트 호출
            this.realTimeUpdater.updateHomeUI();
            
            // 현재 활성 페이지에 따른 UI 업데이트
            this._updateCurrentPageUI();
            
        } catch (error) {
            console.error('UI 업데이트 실패:', error);
        }
    }
    
    // 현재 페이지별 UI 업데이트
    _updateCurrentPageUI() {
        const currentPath = window.location.pathname;
        
        if (currentPath.includes('/basic-learning')) {
            // 기본학습 페이지 UI 업데이트
            if (typeof updateBasicLearningStats === 'function') {
                updateBasicLearningStats();
            }
        } else if (currentPath.includes('/large-category-learning')) {
            // 대분류 학습 페이지 UI 업데이트
            if (typeof updateLargeCategoryStats === 'function') {
                updateLargeCategoryStats();
            }
        } else if (currentPath.includes('/home') || currentPath === '/') {
            // 홈페이지 UI 업데이트
            if (typeof updateHomeStats === 'function') {
                updateHomeStats();
            }
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
            
            // 이어풀기 알림 표시 (Phase 3 추가)
            this._showContinueLearningNotification(category, nextQuestion);
            
            return nextQuestion;
        } catch (error) {
            console.error('❌ 다음 문제 가져오기 실패:', error);
            return 1; // 기본값
        }
    }
    
    // 이어풀기 알림 표시
    _showContinueLearningNotification(category, nextQuestion) {
        if (window.notificationSystem) {
            window.notificationSystem.showContinueLearningNotification(category, nextQuestion);
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
            
            // 4. 업데이트 큐 초기화
            this.updateQueue = [];
            
            // 5. 사용자 등록 알림 표시 (Phase 3 추가)
            this._showUserRegistrationNotification(realUserInfo.name);
            
            console.log('✅ 실제 사용자 등록 완료');
            return true;
        } catch (error) {
            console.error('❌ 실제 사용자 등록 실패:', error);
            return false;
        }
    }
    
    // 사용자 등록 알림 표시
    _showUserRegistrationNotification(userName) {
        if (window.notificationSystem) {
            window.notificationSystem.showUserRegistrationNotification(userName);
        }
    }
    
    // 모든 통계 새로고침 (성능 최적화)
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
            statistics: this.progressManager ? this.progressManager.statistics : null,
            queueLength: this.updateQueue.length,
            isProcessingQueue: this.isProcessingQueue
        };
    }
    
    // 성능 통계
    getPerformanceStats() {
        return {
            queueLength: this.updateQueue.length,
            isProcessingQueue: this.isProcessingQueue,
            updateDebounceDelay: this.updateDebounceDelay,
            memoryUsage: this._getMemoryUsage()
        };
    }
    
    // 메모리 사용량 추정
    _getMemoryUsage() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        return null;
    }
    
    // 성능 알림 표시
    _showPerformanceNotification(performanceTime, queueLength) {
        if (window.notificationSystem) {
            window.notificationSystem.showPerformanceNotification(performanceTime, queueLength);
        }
    }
    
    // 시스템 테스트 (성능 최적화 버전)
    async testSystem() {
        console.log('=== AdvancedStatisticsSystem 테스트 시작 (성능 최적화 버전) ===');
        
        try {
            // 1. 초기화 테스트
            const initResult = await this.initialize();
            if (!initResult) {
                throw new Error('시스템 초기화 실패');
            }
            
            // 2. 성능 테스트
            console.log('성능 테스트 시작');
            const startTime = performance.now();
            
            // 배치 업데이트 테스트
            for (let i = 1; i <= 10; i++) {
                this.updateOnQuestionSolved('basic_learning', i, Math.random() > 0.3);
            }
            
            // 큐 처리 대기
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const endTime = performance.now();
            const performanceTime = endTime - startTime;
            
            console.log(`성능 테스트 완료: ${performanceTime.toFixed(2)}ms`);
            
            // 성능 알림 표시 (Phase 3 추가)
            this._showPerformanceNotification(performanceTime, perfStats.queueLength);
            
            // 3. 시스템 상태 확인
            const status = this.getSystemStatus();
            const perfStats = this.getPerformanceStats();
            
            console.log('시스템 상태:', status);
            console.log('성능 통계:', perfStats);
            
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

// 페이지 로드 시 자동 초기화 (성능 최적화)
document.addEventListener('DOMContentLoaded', function() {
    console.log('페이지 로드 완료 - AdvancedStatisticsSystem 자동 초기화 시작 (성능 최적화 버전)');
    
    // 지연 초기화로 페이지 로드 성능 향상
    setTimeout(async () => {
        if (window.advancedStatisticsSystem) {
            await window.advancedStatisticsSystem.initialize();
        }
    }, 1000);
});
