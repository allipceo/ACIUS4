/**
 * CompatibilityLayer - 호환성 레이어
 * 기존 완성된 기능들과의 충돌을 방지하고 안전한 마이그레이션을 지원
 */

class CompatibilityLayer {
    constructor() {
        this.isInitialized = false;
        this.backupData = {};
        this.migrationStatus = {};
        this.initialize();
    }

    /**
     * 초기화
     */
    initialize() {
        console.log('=== CompatibilityLayer 초기화 시작 ===');
        
        // 기존 데이터 백업
        this.backupExistingData();
        
        // 기존 기능들과의 호환성 확인
        this.checkCompatibility();
        
        // 마이그레이션 상태 초기화
        this.initializeMigrationStatus();
        
        // 기존 카운터 시스템 차단
        this.blockLegacyCounters();
        
        this.isInitialized = true;
        console.log('✅ CompatibilityLayer 초기화 완료');
    }

    /**
     * 기존 데이터 백업
     */
    backupExistingData() {
        console.log('=== 기존 데이터 백업 시작 ===');
        
        const backupKeys = [
            'aicu_user_info',
            'aicu_user_data', 
            'aicu_statistics',
            'aicu_category_statistics',
            'aicu_incorrect_statistics',
            'aicu_quiz_progress'
        ];

        backupKeys.forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                this.backupData[key] = {
                    data: data,
                    timestamp: new Date().toISOString(),
                    version: 'pre_central_data_manager'
                };
                console.log(`✅ ${key} 백업 완료`);
            }
        });

        // 백업 데이터를 별도 키에 저장
        localStorage.setItem('aicu_backup_data', JSON.stringify(this.backupData));
        console.log('✅ 모든 기존 데이터 백업 완료');
    }

    /**
     * 기존 기능들과의 호환성 확인
     */
    checkCompatibility() {
        console.log('=== 기존 기능 호환성 확인 ===');
        
        const compatibilityChecks = {
            'GuestModeManager': this.checkGuestModeManager(),
            'DDayCounter': this.checkDDayCounter(),
            'PredictedScoresManager': this.checkPredictedScoresManager(),
            'IncorrectAnalysisManager': this.checkIncorrectAnalysisManager(),
            'PerformanceMonitor': this.checkPerformanceMonitor(),
            'RollbackManager': this.checkRollbackManager()
        };

        console.log('호환성 확인 결과:', compatibilityChecks);
        
        // 호환성 문제가 있는 경우 경고
        const incompatibleFeatures = Object.entries(compatibilityChecks)
            .filter(([feature, status]) => !status.compatible)
            .map(([feature, status]) => feature);

        if (incompatibleFeatures.length > 0) {
            console.warn('⚠️ 호환성 문제 발견:', incompatibleFeatures);
        } else {
            console.log('✅ 모든 기존 기능과 호환성 확인 완료');
        }
    }

    /**
     * GuestModeManager 호환성 확인
     */
    checkGuestModeManager() {
        const isAvailable = window.GuestModeManager && typeof window.GuestModeManager === 'object';
        const hasRequiredMethods = isAvailable && 
            typeof window.GuestModeManager.applyDefaults === 'function' &&
            typeof window.GuestModeManager.initializeStatistics === 'function';
        
        return {
            compatible: isAvailable && hasRequiredMethods,
            available: isAvailable,
            hasRequiredMethods: hasRequiredMethods
        };
    }

    /**
     * DDayCounter 호환성 확인
     */
    checkDDayCounter() {
        const isAvailable = window.DDayCounter && typeof window.DDayCounter === 'object';
        const hasRequiredMethods = isAvailable && 
            typeof window.DDayCounter.updateDisplay === 'function';
        
        return {
            compatible: isAvailable && hasRequiredMethods,
            available: isAvailable,
            hasRequiredMethods: hasRequiredMethods
        };
    }

    /**
     * PredictedScoresManager 호환성 확인
     */
    checkPredictedScoresManager() {
        const isAvailable = window.PredictedScoresManager && typeof window.PredictedScoresManager === 'object';
        const hasRequiredMethods = isAvailable && 
            typeof window.PredictedScoresManager.calculatePredictedScores === 'function';
        
        return {
            compatible: isAvailable && hasRequiredMethods,
            available: isAvailable,
            hasRequiredMethods: hasRequiredMethods
        };
    }

    /**
     * IncorrectAnalysisManager 호환성 확인
     */
    checkIncorrectAnalysisManager() {
        const isAvailable = window.IncorrectAnalysisManager && typeof window.IncorrectAnalysisManager === 'object';
        const hasRequiredMethods = isAvailable && 
            typeof window.IncorrectAnalysisManager.analyzeIncorrectAnswers === 'function';
        
        return {
            compatible: isAvailable && hasRequiredMethods,
            available: isAvailable,
            hasRequiredMethods: hasRequiredMethods
        };
    }

    /**
     * PerformanceMonitor 호환성 확인
     */
    checkPerformanceMonitor() {
        const isAvailable = window.measurePerformance && typeof window.measurePerformance === 'function';
        
        return {
            compatible: isAvailable,
            available: isAvailable
        };
    }

    /**
     * RollbackManager 호환성 확인
     */
    checkRollbackManager() {
        const isAvailable = window.RollbackManager && typeof window.RollbackManager === 'object';
        const hasRequiredMethods = isAvailable && 
            typeof window.RollbackManager.createBackup === 'function' &&
            typeof window.RollbackManager.restoreBackup === 'function';
        
        return {
            compatible: isAvailable && hasRequiredMethods,
            available: isAvailable,
            hasRequiredMethods: hasRequiredMethods
        };
    }

    /**
     * 마이그레이션 상태 초기화
     */
    initializeMigrationStatus() {
        this.migrationStatus = {
            dataMigration: {
                completed: false,
                timestamp: null,
                errors: []
            },
            featureIntegration: {
                completed: false,
                timestamp: null,
                errors: []
            },
            compatibilityLayer: {
                completed: true,
                timestamp: new Date().toISOString(),
                errors: []
            }
        };

        localStorage.setItem('aicu_migration_status', JSON.stringify(this.migrationStatus));
        console.log('✅ 마이그레이션 상태 초기화 완료');
    }

    /**
     * 안전한 데이터 마이그레이션
     */
    safeDataMigration() {
        console.log('=== 안전한 데이터 마이그레이션 시작 ===');
        
        try {
            // 1. 기존 데이터 구조 확인
            const existingData = this.getExistingDataStructure();
            
            // 2. 새로운 데이터 구조와 병합
            const mergedData = this.mergeDataStructures(existingData);
            
            // 3. 병합된 데이터 저장
            this.saveMergedData(mergedData);
            
            // 4. 마이그레이션 상태 업데이트
            this.updateMigrationStatus('dataMigration', true);
            
            console.log('✅ 안전한 데이터 마이그레이션 완료');
            return true;
            
        } catch (error) {
            console.error('❌ 데이터 마이그레이션 실패:', error);
            this.updateMigrationStatus('dataMigration', false, error.message);
            return false;
        }
    }

    /**
     * 기존 데이터 구조 확인
     */
    getExistingDataStructure() {
        const existingData = {};
        
        // 기존 통계 데이터
        const oldStats = localStorage.getItem('aicu_statistics');
        if (oldStats) {
            existingData.statistics = JSON.parse(oldStats);
        }

        // 기존 카테고리 통계
        const oldCategoryStats = localStorage.getItem('aicu_category_statistics');
        if (oldCategoryStats) {
            existingData.categoryStatistics = JSON.parse(oldCategoryStats);
        }

        // 기존 오답 통계
        const oldIncorrectStats = localStorage.getItem('aicu_incorrect_statistics');
        if (oldIncorrectStats) {
            existingData.incorrectStatistics = JSON.parse(oldIncorrectStats);
        }

        return existingData;
    }

    /**
     * 데이터 구조 병합
     */
    mergeDataStructures(existingData) {
        const mergedData = {
            categoryStats: {},
            realTimeData: {},
            quizResults: {}
        };

        // 기존 카테고리 통계와 새로운 구조 병합
        if (existingData.categoryStatistics) {
            mergedData.categoryStats = existingData.categoryStatistics;
        }

        // 기존 통계 데이터를 실시간 데이터로 변환
        if (existingData.statistics) {
            mergedData.realTimeData = {
                total_attempts: existingData.statistics.total_attempts || 0,
                total_correct: existingData.statistics.total_correct || 0,
                overall_accuracy: existingData.statistics.overall_accuracy || 0,
                today_attempts: existingData.statistics.today_attempts || 0,
                today_correct: existingData.statistics.today_correct || 0,
                today_accuracy: existingData.statistics.today_accuracy || 0,
                last_updated: new Date().toISOString(),
                session_start: new Date().toISOString()
            };
        }

        // 기존 오답 통계를 문제 풀이 결과로 변환
        if (existingData.incorrectStatistics) {
            mergedData.quizResults = {
                results: existingData.incorrectStatistics.incorrect_answers || [],
                total_count: existingData.incorrectStatistics.total_count || 0,
                last_updated: new Date().toISOString()
            };
        }

        return mergedData;
    }

    /**
     * 병합된 데이터 저장
     */
    saveMergedData(mergedData) {
        if (mergedData.categoryStats) {
            localStorage.setItem('aicu_category_statistics', JSON.stringify(mergedData.categoryStats));
        }
        
        if (mergedData.realTimeData) {
            localStorage.setItem('aicu_real_time_data', JSON.stringify(mergedData.realTimeData));
        }
        
        if (mergedData.quizResults) {
            localStorage.setItem('aicu_quiz_results', JSON.stringify(mergedData.quizResults));
        }

        console.log('✅ 병합된 데이터 저장 완료');
    }

    /**
     * 마이그레이션 상태 업데이트
     */
    updateMigrationStatus(step, completed, error = null) {
        this.migrationStatus[step] = {
            completed: completed,
            timestamp: new Date().toISOString(),
            errors: error ? [error] : []
        };

        localStorage.setItem('aicu_migration_status', JSON.stringify(this.migrationStatus));
    }

    /**
     * 롤백 기능
     */
    rollback() {
        console.log('=== 롤백 시작 ===');
        
        try {
            // 백업 데이터 복원
            const backupData = JSON.parse(localStorage.getItem('aicu_backup_data') || '{}');
            
            Object.entries(backupData).forEach(([key, backup]) => {
                localStorage.setItem(key, backup.data);
                console.log(`✅ ${key} 롤백 완료`);
            });

            // 새로운 데이터 구조 삭제
            const newDataKeys = ['aicu_real_time_data', 'aicu_quiz_results'];
            newDataKeys.forEach(key => {
                localStorage.removeItem(key);
                console.log(`✅ ${key} 삭제 완료`);
            });

            console.log('✅ 롤백 완료');
            return true;
            
        } catch (error) {
            console.error('❌ 롤백 실패:', error);
            return false;
        }
    }

    /**
     * 호환성 레이어 상태 확인
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            migrationStatus: this.migrationStatus,
            backupData: Object.keys(this.backupData),
            compatibilityChecks: {
                'GuestModeManager': this.checkGuestModeManager(),
                'DDayCounter': this.checkDDayCounter(),
                'PredictedScoresManager': this.checkPredictedScoresManager(),
                'IncorrectAnalysisManager': this.checkIncorrectAnalysisManager(),
                'PerformanceMonitor': this.checkPerformanceMonitor(),
                'RollbackManager': this.checkRollbackManager()
            }
        };
    }

    /**
     * 디버그 정보 출력
     */
    debugInfo() {
        console.log('=== CompatibilityLayer 디버그 정보 ===');
        console.log('초기화 상태:', this.isInitialized);
        console.log('백업 데이터 키:', Object.keys(this.backupData));
        console.log('마이그레이션 상태:', this.migrationStatus);
        console.log('전체 상태:', this.getStatus());
    }

    // 기존 카운터 시스템 차단
    blockLegacyCounters() {
        console.log('=== 기존 카운터 시스템 차단 ===');
        
        // 기존 카운터 관련 함수들을 새로운 시스템으로 리다이렉트
        if (window.updateCategoryStatistics) {
            const originalUpdateCategoryStatistics = window.updateCategoryStatistics;
            window.updateCategoryStatistics = function(category, isCorrect) {
                console.log('⚠️ 기존 카운터 함수 차단됨, 새로운 시스템으로 리다이렉트');
                // 새로운 중앙 데이터 관리자로 리다이렉트
                if (window.CentralDataManager && typeof window.CentralDataManager.recordQuizResult === 'function') {
                    window.CentralDataManager.recordQuizResult(
                        `legacy_${category}_${Date.now()}`,
                        category,
                        isCorrect,
                        'legacy_migration',
                        'legacy_migration'
                    );
                }
            };
            console.log('✅ 기존 updateCategoryStatistics 함수 차단 완료');
        }
        
        // 기존 카운터 데이터 읽기 함수도 새로운 시스템으로 리다이렉트
        if (window.getCategoryStatistics) {
            const originalGetCategoryStatistics = window.getCategoryStatistics;
            window.getCategoryStatistics = function(category) {
                console.log('⚠️ 기존 카운터 읽기 함수 차단됨, 새로운 시스템에서 데이터 반환');
                // 새로운 시스템에서 데이터 반환
                if (window.CentralDataManager && typeof window.CentralDataManager.getCategoryData === 'function') {
                    return window.CentralDataManager.getCategoryData(category);
                }
                return { total: 0, correct: 0, incorrect: 0, accuracy: 0 };
            };
            console.log('✅ 기존 getCategoryStatistics 함수 차단 완료');
        }
        
        console.log('✅ 기존 카운터 시스템 차단 완료');
    }
}

// 전역 인스턴스 생성
window.CompatibilityLayer = new CompatibilityLayer();

console.log('🚀 CompatibilityLayer 로드 완료');
