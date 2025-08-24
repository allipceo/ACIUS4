// 고급 통계 기능 통합 관리자
// 파일: static/js/advanced_statistics_manager.js

class AdvancedStatisticsManager {
    constructor() {
        this.isInitialized = false;
        this.statisticsModules = {};
        this.init();
    }

    /**
     * 고급 통계 관리자 초기화
     */
    init() {
        console.log('=== 고급 통계 관리자 초기화 ===');
        
        try {
            // 중앙 데이터 관리 시스템 확인
            if (!window.CentralDataManager) {
                console.error('❌ CentralDataManager를 찾을 수 없습니다.');
                return;
            }

            // 기존 통계 모듈들 등록
            this.registerStatisticsModules();
            
            // 이벤트 리스너 설정
            this.setupEventListeners();
            
            // 초기 통계 업데이트
            this.updateAllStatistics();
            
            this.isInitialized = true;
            console.log('✅ 고급 통계 관리자 초기화 완료');
            
        } catch (error) {
            console.error('❌ 고급 통계 관리자 초기화 실패:', error);
        }
    }

    /**
     * 통계 모듈들 등록
     */
    registerStatisticsModules() {
        console.log('=== 통계 모듈 등록 ===');
        
        // 예상 점수 관리자
        if (window.PredictedScoresManager) {
            this.statisticsModules.predictedScores = window.PredictedScoresManager;
            console.log('✅ PredictedScoresManager 등록 완료');
        }
        
        // 오답 분석 관리자
        if (window.IncorrectAnalysisManager) {
            this.statisticsModules.incorrectAnalysis = window.IncorrectAnalysisManager;
            console.log('✅ IncorrectAnalysisManager 등록 완료');
        }
        
        // 성능 모니터
        if (window.PerformanceMonitor) {
            this.statisticsModules.performanceMonitor = window.PerformanceMonitor;
            console.log('✅ PerformanceMonitor 등록 완료');
        }
        
        // 롤백 관리자
        if (window.RollbackManager) {
            this.statisticsModules.rollbackManager = window.RollbackManager;
            console.log('✅ RollbackManager 등록 완료');
        }
        
        console.log('📊 등록된 통계 모듈:', Object.keys(this.statisticsModules));
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        console.log('=== 이벤트 리스너 설정 ===');
        
        // 데이터 업데이트 이벤트 리스너
        document.addEventListener('dataUpdated', (event) => {
            console.log('📊 데이터 업데이트 이벤트 수신:', event.detail);
            this.updateAllStatistics();
        });
        
        // 퀴즈 완료 이벤트 리스너
        document.addEventListener('quizCompleted', (event) => {
            console.log('📊 퀴즈 완료 이벤트 수신:', event.detail);
            this.updateAllStatistics();
        });
        
        // 페이지 포커스 이벤트 리스너
        window.addEventListener('focus', () => {
            console.log('📊 페이지 포커스 이벤트 수신');
            this.updateAllStatistics();
        });
        
        // 주기적 업데이트 (30초마다)
        setInterval(() => {
            if (this.isInitialized) {
                console.log('📊 주기적 통계 업데이트 실행');
                this.updateAllStatistics();
            }
        }, 30000);
        
        console.log('✅ 이벤트 리스너 설정 완료');
    }

    /**
     * 모든 통계 업데이트
     */
    updateAllStatistics() {
        console.log('=== 모든 통계 업데이트 시작 ===');
        
        try {
            // 예상 점수 업데이트
            if (this.statisticsModules.predictedScores) {
                this.statisticsModules.predictedScores.updateDisplay();
                console.log('✅ 예상 점수 업데이트 완료');
            }
            
            // 오답 분석 업데이트
            if (this.statisticsModules.incorrectAnalysis) {
                this.statisticsModules.incorrectAnalysis.updateDisplay();
                console.log('✅ 오답 분석 업데이트 완료');
            }
            
            // 성능 모니터링 업데이트
            if (this.statisticsModules.performanceMonitor) {
                this.statisticsModules.performanceMonitor.updateDisplay();
                console.log('✅ 성능 모니터링 업데이트 완료');
            }
            
            console.log('✅ 모든 통계 업데이트 완료');
            
        } catch (error) {
            console.error('❌ 통계 업데이트 실패:', error);
        }
    }

    /**
     * 특정 통계 모듈 업데이트
     */
    updateStatisticsModule(moduleName) {
        console.log(`=== ${moduleName} 모듈 업데이트 ===`);
        
        if (this.statisticsModules[moduleName]) {
            try {
                this.statisticsModules[moduleName].updateDisplay();
                console.log(`✅ ${moduleName} 업데이트 완료`);
            } catch (error) {
                console.error(`❌ ${moduleName} 업데이트 실패:`, error);
            }
        } else {
            console.warn(`⚠️ ${moduleName} 모듈을 찾을 수 없습니다.`);
        }
    }

    /**
     * 통계 데이터 내보내기
     */
    exportStatisticsData() {
        console.log('=== 통계 데이터 내보내기 ===');
        
        try {
            const exportData = {
                timestamp: new Date().toISOString(),
                predictedScores: this.statisticsModules.predictedScores ? 
                    this.statisticsModules.predictedScores.calculateScoresFromData() : null,
                incorrectAnalysis: this.statisticsModules.incorrectAnalysis ? 
                    this.statisticsModules.incorrectAnalysis.getStatisticsData() : null,
                performanceData: this.statisticsModules.performanceMonitor ? 
                    this.statisticsModules.performanceMonitor.getPerformanceData() : null,
                centralData: window.CentralDataManager ? 
                    window.CentralDataManager.getAllCategoryData() : null
            };
            
            console.log('📊 내보낼 통계 데이터:', exportData);
            return exportData;
            
        } catch (error) {
            console.error('❌ 통계 데이터 내보내기 실패:', error);
            return null;
        }
    }

    /**
     * 통계 시스템 상태 확인
     */
    getSystemStatus() {
        console.log('=== 통계 시스템 상태 확인 ===');
        
        const status = {
            isInitialized: this.isInitialized,
            modules: Object.keys(this.statisticsModules),
            centralDataManager: !!window.CentralDataManager,
            compatibilityLayer: !!window.CompatibilityLayer,
            quizDataCollector: !!window.QuizDataCollector,
            realtimeSyncManager: !!window.RealtimeSyncManager
        };
        
        console.log('📊 시스템 상태:', status);
        return status;
    }

    /**
     * 통계 시스템 재시작
     */
    restart() {
        console.log('=== 통계 시스템 재시작 ===');
        
        try {
            this.isInitialized = false;
            this.statisticsModules = {};
            this.init();
            console.log('✅ 통계 시스템 재시작 완료');
        } catch (error) {
            console.error('❌ 통계 시스템 재시작 실패:', error);
        }
    }
}

// 전역 인스턴스 생성
window.advancedStatisticsManager = new AdvancedStatisticsManager();
