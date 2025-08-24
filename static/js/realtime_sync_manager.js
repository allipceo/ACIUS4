/**
 * RealtimeSyncManager - 실시간 데이터 동기화 매니저
 * 수집된 데이터를 모든 페이지에 실시간으로 전파하는 이벤트 기반 시스템
 */

class RealtimeSyncManager {
    constructor() {
        this.isInitialized = false;
        this.syncHistory = [];
        this.subscribers = new Map();
        this.syncInterval = null;
        this.lastSyncTime = null;
        this.initialize();
    }

    /**
     * 초기화
     */
    initialize() {
        console.log('=== RealtimeSyncManager 초기화 시작 ===');
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
        
        // 동기화 히스토리 초기화
        this.initializeSyncHistory();
        
        // 실시간 동기화 시작
        this.startRealtimeSync();
        
        this.isInitialized = true;
        console.log('✅ RealtimeSyncManager 초기화 완료');
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 데이터 업데이트 이벤트 리스너
        document.addEventListener('dataUpdated', (event) => {
            this.handleDataUpdate(event.detail);
        });

        // 기본학습 상태 업데이트 이벤트 리스너
        document.addEventListener('basicLearningStateUpdated', (event) => {
            this.handleBasicLearningUpdate(event.detail);
        });

        // 기본학습 문제 로드 이벤트 리스너
        document.addEventListener('basicLearningQuestionLoaded', (event) => {
            this.handleBasicLearningQuestionLoad(event.detail);
        });

        // 페이지 포커스 이벤트 리스너 (페이지 전환 시 동기화)
        window.addEventListener('focus', () => {
            this.syncOnPageFocus();
        });

        // 페이지 가시성 변경 이벤트 리스너
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // 온라인/오프라인 상태 변경 이벤트 리스너
        window.addEventListener('online', () => {
            this.handleOnlineStatusChange(true);
        });

        window.addEventListener('offline', () => {
            this.handleOnlineStatusChange(false);
        });

        console.log('✅ 이벤트 리스너 설정 완료');
    }

    /**
     * 실시간 동기화 시작
     */
    startRealtimeSync() {
        // 5초마다 자동 동기화
        this.syncInterval = setInterval(() => {
            this.performAutoSync();
        }, 5000);

        console.log('✅ 실시간 동기화 시작 (5초 간격)');
    }

    /**
     * 데이터 업데이트 처리
     */
    handleDataUpdate(updateData) {
        console.log('=== 데이터 업데이트 처리 ===', updateData);
        
        try {
            // 1. 동기화 히스토리에 기록
            this.recordSyncEvent('data_update', updateData);
            
            // 2. 모든 구독자에게 브로드캐스트
            this.broadcastToSubscribers(updateData);
            
            // 3. UI 업데이트 트리거
            this.triggerUIUpdates(updateData);
            
            // 4. 예상 점수 재계산 트리거
            this.triggerScoreRecalculation();
            
            console.log('✅ 데이터 업데이트 처리 완료');
            
        } catch (error) {
            console.error('❌ 데이터 업데이트 처리 실패:', error);
        }
    }

    /**
     * 기본학습 상태 업데이트 처리
     */
    handleBasicLearningUpdate(updateData) {
        console.log('=== 기본학습 상태 업데이트 처리 ===', updateData);
        
        try {
            // 1. 동기화 히스토리에 기록
            this.recordSyncEvent('basic_learning_update', updateData);
            
            // 2. 기본학습 UI 업데이트
            this.updateBasicLearningUI(updateData);
            
            // 3. 홈페이지 통계 업데이트
            this.updateHomepageStats();
            
            // 4. 모든 구독자에게 브로드캐스트
            this.broadcastToSubscribers(updateData);
            
            console.log('✅ 기본학습 상태 업데이트 처리 완료');
            
        } catch (error) {
            console.error('❌ 기본학습 상태 업데이트 처리 실패:', error);
        }
    }

    /**
     * 기본학습 문제 로드 처리
     */
    handleBasicLearningQuestionLoad(loadData) {
        console.log('=== 기본학습 문제 로드 처리 ===', loadData);
        
        try {
            // 1. 동기화 히스토리에 기록
            this.recordSyncEvent('basic_learning_question_load', loadData);
            
            // 2. 기본학습 진행률 업데이트
            this.updateBasicLearningProgress(loadData);
            
            console.log('✅ 기본학습 문제 로드 처리 완료');
            
        } catch (error) {
            console.error('❌ 기본학습 문제 로드 처리 실패:', error);
        }
    }

    /**
     * 기본학습 UI 업데이트
     */
    updateBasicLearningUI(data) {
        console.log('=== 기본학습 UI 업데이트 ===', data);
        
        try {
            // 진행률 표시 업데이트
            this.updateProgressDisplay(data.category, data.questionIndex);
            
            // 통계 표시 업데이트
            this.updateStatisticsDisplay(data.category);
            
            // 실시간 동기화 이벤트 발생
            const event = new CustomEvent('basicLearningUIUpdated', {
                detail: data
            });
            
            document.dispatchEvent(event);
            console.log('✅ 기본학습 UI 업데이트 완료');
            
        } catch (error) {
            console.error('❌ 기본학습 UI 업데이트 실패:', error);
        }
    }

    /**
     * 기본학습 진행률 업데이트
     */
    updateBasicLearningProgress(data) {
        console.log('=== 기본학습 진행률 업데이트 ===', data);
        
        try {
            // 진행률 정보 업데이트
            const progressElement = document.getElementById('basic-progress-text');
            if (progressElement) {
                const progressRate = ((data.questionIndex + 1) / 789 * 100).toFixed(1);
                progressElement.textContent = `${progressRate}% (${data.questionIndex + 1}/789)`;
            }
            
            console.log('✅ 기본학습 진행률 업데이트 완료');
            
        } catch (error) {
            console.error('❌ 기본학습 진행률 업데이트 실패:', error);
        }
    }

    /**
     * 진행률 표시 업데이트
     */
    updateProgressDisplay(category, questionIndex) {
        try {
            const progressElement = document.getElementById('basic-progress-text');
            if (progressElement) {
                const progressRate = ((questionIndex + 1) / 789 * 100).toFixed(1);
                progressElement.textContent = `${progressRate}% (${questionIndex + 1}/789)`;
            }
        } catch (error) {
            console.error('❌ 진행률 표시 업데이트 실패:', error);
        }
    }

    /**
     * 통계 표시 업데이트
     */
    updateStatisticsDisplay(category) {
        try {
            // 중앙 데이터에서 통계 가져오기
            const realTimeData = JSON.parse(localStorage.getItem('aicu_real_time_data') || '{}');
            const basicLearningData = realTimeData['basic_learning'] || {};
            
            // 정답률 업데이트
            const accuracyElement = document.getElementById('basic-accuracy-text');
            if (accuracyElement) {
                const accuracy = basicLearningData.accuracy || 0;
                accuracyElement.textContent = `${accuracy}%`;
            }
            
            // 오늘 정답률 업데이트
            const todayAccuracyElement = document.getElementById('basic-today-accuracy');
            if (todayAccuracyElement) {
                const today = new Date().toISOString().split('T')[0];
                const todayData = basicLearningData.daily_progress?.[today] || { solved: 0, correct: 0 };
                const todayAccuracy = todayData.solved > 0 ? (todayData.correct / todayData.solved * 100).toFixed(1) : 0;
                todayAccuracyElement.textContent = `${todayAccuracy}%`;
            }
            
        } catch (error) {
            console.error('❌ 통계 표시 업데이트 실패:', error);
        }
    }

    /**
     * 홈페이지 통계 업데이트
     */
    updateHomepageStats() {
        try {
            // 홈페이지 통계 업데이트 이벤트 발생
            const event = new CustomEvent('homepageStatsUpdated', {
                detail: { source: 'basic_learning' }
            });
            
            document.dispatchEvent(event);
            console.log('✅ 홈페이지 통계 업데이트 이벤트 발생');
            
        } catch (error) {
            console.error('❌ 홈페이지 통계 업데이트 실패:', error);
        }
    }

    /**
     * 구독자에게 브로드캐스트
     */
    broadcastToSubscribers(updateData) {
        this.subscribers.forEach((callback, subscriberId) => {
            try {
                callback(updateData);
                console.log(`✅ 구독자 ${subscriberId}에게 브로드캐스트 완료`);
            } catch (error) {
                console.error(`❌ 구독자 ${subscriberId} 브로드캐스트 실패:`, error);
            }
        });
    }

    /**
     * UI 업데이트 트리거
     */
    triggerUIUpdates(updateData) {
        // 예상 점수 컨테이너 업데이트
        const predictedScoresContainer = document.getElementById('predicted-scores-container');
        if (predictedScoresContainer) {
            this.updatePredictedScoresDisplay();
        }

        // 합격 확률 컨테이너 업데이트
        const passProbabilityContainer = document.getElementById('pass-probability-container');
        if (passProbabilityContainer) {
            this.updatePassProbabilityDisplay();
        }

        // 오답 분석 컨테이너 업데이트
        const incorrectAnalysisContainer = document.getElementById('incorrect-analysis-container');
        if (incorrectAnalysisContainer) {
            this.updateIncorrectAnalysisDisplay();
        }

        console.log('✅ UI 업데이트 트리거 완료');
    }

    /**
     * 예상 점수 재계산 트리거
     */
    triggerScoreRecalculation() {
        if (window.PredictedScoresManager && typeof window.PredictedScoresManager.calculatePredictedScores === 'function') {
            window.PredictedScoresManager.calculatePredictedScores();
            console.log('✅ 예상 점수 재계산 트리거 완료');
        }

        if (window.IncorrectAnalysisManager && typeof window.IncorrectAnalysisManager.analyzeIncorrectAnswers === 'function') {
            window.IncorrectAnalysisManager.analyzeIncorrectAnswers();
            console.log('✅ 오답 분석 재계산 트리거 완료');
        }
    }

    /**
     * 예상 점수 표시 업데이트
     */
    updatePredictedScoresDisplay() {
        if (window.PredictedScoresManager && typeof window.PredictedScoresManager.updateDisplay === 'function') {
            window.PredictedScoresManager.updateDisplay();
        }
    }

    /**
     * 합격 확률 표시 업데이트
     */
    updatePassProbabilityDisplay() {
        if (window.PredictedScoresManager && typeof window.PredictedScoresManager.updatePassProbabilityDisplay === 'function') {
            window.PredictedScoresManager.updatePassProbabilityDisplay();
        }
    }

    /**
     * 오답 분석 표시 업데이트
     */
    updateIncorrectAnalysisDisplay() {
        if (window.IncorrectAnalysisManager && typeof window.IncorrectAnalysisManager.updateDisplay === 'function') {
            window.IncorrectAnalysisManager.updateDisplay();
        }
    }

    /**
     * 페이지 포커스 시 동기화
     */
    syncOnPageFocus() {
        console.log('=== 페이지 포커스 시 동기화 ===');
        
        // 마지막 동기화 시간 확인
        const now = Date.now();
        const timeSinceLastSync = this.lastSyncTime ? now - this.lastSyncTime : Infinity;
        
        // 10초 이상 지났으면 동기화 수행
        if (timeSinceLastSync > 10000) {
            this.performManualSync();
        }
    }

    /**
     * 페이지 가시성 변경 처리
     */
    handleVisibilityChange() {
        if (document.visibilityState === 'visible') {
            console.log('=== 페이지 가시성 변경: 보임 ===');
            this.syncOnPageFocus();
        } else {
            console.log('=== 페이지 가시성 변경: 숨김 ===');
        }
    }

    /**
     * 온라인/오프라인 상태 변경 처리
     */
    handleOnlineStatusChange(isOnline) {
        if (isOnline) {
            console.log('=== 온라인 상태 복구 ===');
            this.performManualSync();
        } else {
            console.log('=== 오프라인 상태 감지 ===');
        }
    }

    /**
     * 자동 동기화 수행
     */
    performAutoSync() {
        console.log('=== 자동 동기화 수행 ===');
        
        try {
            // 1. 중앙 데이터 관리자에서 최신 데이터 가져오기
            if (window.CentralDataManager) {
                const latestData = window.CentralDataManager.getCurrentStatistics();
                
                // 2. 데이터 변경 사항 확인
                if (this.hasDataChanged(latestData)) {
                    this.handleDataUpdate({
                        type: 'auto_sync',
                        data: latestData,
                        timestamp: new Date().toISOString()
                    });
                }
            }
            
            this.lastSyncTime = Date.now();
            this.recordSyncEvent('auto_sync', { timestamp: new Date().toISOString() });
            
        } catch (error) {
            console.error('❌ 자동 동기화 실패:', error);
        }
    }

    /**
     * 수동 동기화 수행
     */
    performManualSync() {
        console.log('=== 수동 동기화 수행 ===');
        
        try {
            // 1. 중앙 데이터 관리자 동기화 요청
            if (window.CentralDataManager && typeof window.CentralDataManager.syncData === 'function') {
                window.CentralDataManager.syncData();
            }
            
            // 2. 모든 UI 컴포넌트 강제 업데이트
            this.forceUIUpdate();
            
            this.lastSyncTime = Date.now();
            this.recordSyncEvent('manual_sync', { timestamp: new Date().toISOString() });
            
            console.log('✅ 수동 동기화 완료');
            
        } catch (error) {
            console.error('❌ 수동 동기화 실패:', error);
        }
    }

    /**
     * 데이터 변경 사항 확인
     */
    hasDataChanged(latestData) {
        // 간단한 해시 기반 변경 감지
        const currentHash = JSON.stringify(latestData);
        const lastHash = this.lastDataHash;
        
        this.lastDataHash = currentHash;
        return currentHash !== lastHash;
    }

    /**
     * UI 강제 업데이트
     */
    forceUIUpdate() {
        // D-day 카운터 업데이트
        if (window.DDayCounter && typeof window.DDayCounter.updateDisplay === 'function') {
            window.DDayCounter.updateDisplay();
        }

        // 예상 점수 업데이트
        this.updatePredictedScoresDisplay();
        
        // 합격 확률 업데이트
        this.updatePassProbabilityDisplay();
        
        // 오답 분석 업데이트
        this.updateIncorrectAnalysisDisplay();
        
        console.log('✅ UI 강제 업데이트 완료');
    }

    /**
     * 구독자 등록
     */
    subscribe(subscriberId, callback) {
        this.subscribers.set(subscriberId, callback);
        console.log(`✅ 구독자 ${subscriberId} 등록 완료`);
    }

    /**
     * 구독자 해제
     */
    unsubscribe(subscriberId) {
        this.subscribers.delete(subscriberId);
        console.log(`✅ 구독자 ${subscriberId} 해제 완료`);
    }

    /**
     * 동기화 히스토리 초기화
     */
    initializeSyncHistory() {
        try {
            const existingHistory = localStorage.getItem('aicu_sync_history');
            if (existingHistory) {
                this.syncHistory = JSON.parse(existingHistory);
                // 배열이 아닌 경우 배열로 초기화
                if (!Array.isArray(this.syncHistory)) {
                    this.syncHistory = [];
                }
            } else {
                this.syncHistory = [];
            }
            console.log('✅ 동기화 히스토리 초기화 완료');
        } catch (error) {
            console.error('❌ 동기화 히스토리 초기화 실패:', error);
            this.syncHistory = [];
        }
    }

    /**
     * 동기화 이벤트 기록
     */
    recordSyncEvent(eventType, eventData) {
        try {
            // syncHistory가 배열이 아닌 경우 초기화
            if (!Array.isArray(this.syncHistory)) {
                this.syncHistory = [];
            }
            
            const syncEvent = {
                type: eventType,
                data: eventData,
                timestamp: new Date().toISOString(),
                pageUrl: window.location.href
            };

            this.syncHistory.push(syncEvent);
            
            // 히스토리 크기 제한 (최근 50개만 유지)
            if (this.syncHistory.length > 50) {
                this.syncHistory = this.syncHistory.slice(-50);
            }

            localStorage.setItem('aicu_sync_history', JSON.stringify(this.syncHistory));
            console.log('✅ 동기화 이벤트 기록 완료:', eventType);
        } catch (error) {
            console.error('❌ 동기화 이벤트 기록 실패:', error);
            // 오류 발생 시 syncHistory 재초기화
            this.syncHistory = [];
        }
    }

    /**
     * 동기화 히스토리 조회
     */
    getSyncHistory() {
        return this.syncHistory;
    }

    /**
     * 동기화 히스토리 초기화
     */
    clearSyncHistory() {
        this.syncHistory = [];
        localStorage.removeItem('aicu_sync_history');
        console.log('✅ 동기화 히스토리 초기화 완료');
    }

    /**
     * 실시간 동기화 중지
     */
    stopRealtimeSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            console.log('✅ 실시간 동기화 중지 완료');
        }
    }

    /**
     * 동기화 상태 조회
     */
    getSyncStatus() {
        return {
            isInitialized: this.isInitialized,
            isOnline: navigator.onLine,
            lastSyncTime: this.lastSyncTime,
            subscriberCount: this.subscribers.size,
            syncHistoryCount: this.syncHistory.length,
            syncInterval: this.syncInterval ? 'running' : 'stopped'
        };
    }

    /**
     * 디버그 정보 출력
     */
    debugInfo() {
        console.log('=== RealtimeSyncManager 디버그 정보 ===');
        console.log('초기화 상태:', this.isInitialized);
        console.log('동기화 상태:', this.getSyncStatus());
        console.log('구독자 수:', this.subscribers.size);
        console.log('동기화 히스토리 개수:', this.syncHistory.length);
        console.log('최근 동기화 이벤트:', this.syncHistory.slice(-5));
    }
}

// 전역 인스턴스 생성
window.RealtimeSyncManager = new RealtimeSyncManager();

// 전역 함수로 노출
window.performManualSync = function() {
    window.RealtimeSyncManager.performManualSync();
};

window.subscribeToDataUpdates = function(subscriberId, callback) {
    window.RealtimeSyncManager.subscribe(subscriberId, callback);
};

window.unsubscribeFromDataUpdates = function(subscriberId) {
    window.RealtimeSyncManager.unsubscribe(subscriberId);
};

console.log('🚀 RealtimeSyncManager 로드 완료');
