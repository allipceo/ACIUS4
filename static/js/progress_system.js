/**
 * ProgressSystem - 통합 시스템 (3개 레고블록 통합)
 * 075번 문서 V1.3 + 분산형 레고블록 개발 방법론 적용
 * 
 * 통합 기능:
 * - 모든 모듈 초기화 및 의존성 설정
 * - 통합 테스트 및 검증
 * - 전체 시스템 상태 관리
 */

class ProgressSystem {
    constructor() {
        this.progressManager = null;
        this.statsCalculator = null;
        this.uiUpdater = null;
        this.isInitialized = false;
    }

    /**
     * 시스템 초기화
     */
    initialize() {
        console.log('🚀 ProgressSystem 초기화 시작...');
        
        try {
            // 1. 모듈 인스턴스 확인
            if (typeof progressManager === 'undefined') {
                throw new Error('ProgressManager 모듈을 찾을 수 없습니다.');
            }
            
            if (typeof statsCalculator === 'undefined') {
                throw new Error('StatsCalculator 모듈을 찾을 수 없습니다.');
            }
            
            if (typeof uiUpdater === 'undefined') {
                throw new Error('UIUpdater 모듈을 찾을 수 없습니다.');
            }

            // 2. 인스턴스 설정
            this.progressManager = progressManager;
            this.statsCalculator = statsCalculator;
            this.uiUpdater = uiUpdater;

            // 3. 의존성 설정
            this.statsCalculator.setProgressManager(this.progressManager);
            this.uiUpdater.setDependencies(this.progressManager, this.statsCalculator);

            // 4. 초기화 완료
            this.isInitialized = true;
            
            console.log('✅ ProgressSystem 초기화 완료');
            return true;
            
        } catch (error) {
            console.error('❌ ProgressSystem 초기화 실패:', error);
            this.isInitialized = false;
            return false;
        }
    }

    /**
     * 시스템 상태 확인
     */
    getSystemStatus() {
        return {
            isInitialized: this.isInitialized,
            progressManager: this.progressManager !== null,
            statsCalculator: this.statsCalculator !== null,
            uiUpdater: this.uiUpdater !== null,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 진도 저장 (통합 함수)
     */
    saveProgress(mode, questionNumber, isCorrect) {
        if (!this.isInitialized) {
            console.error('ProgressSystem이 초기화되지 않았습니다.');
            return false;
        }

        try {
            // 1. 진도 저장
            const saveResult = this.progressManager.saveProgress(mode, questionNumber, isCorrect);
            
            if (saveResult) {
                // 2. 통계 업데이트
                this.updateStats(mode);
                console.log(`✅ 진도 저장 및 통계 업데이트 완료: ${mode} - Q${questionNumber}`);
            }
            
            return saveResult;
            
        } catch (error) {
            console.error('Error in saveProgress:', error);
            return false;
        }
    }

    /**
     * 통계 업데이트 (통합 함수)
     */
    updateStats(mode = null) {
        if (!this.isInitialized) {
            console.error('ProgressSystem이 초기화되지 않았습니다.');
            return false;
        }

        try {
            if (mode === null) {
                // 모든 통계 업데이트
                return this.uiUpdater.updateAllStats();
            } else if (mode === 'basic') {
                // 기본학습 통계만 업데이트
                return this.uiUpdater.updateBasicLearningStats();
            } else {
                // 특정 카테고리 통계 업데이트
                return this.uiUpdater.updateCategoryStats(mode);
            }
            
        } catch (error) {
            console.error('Error in updateStats:', error);
            return false;
        }
    }

    /**
     * 다음 문제 조회 (통합 함수)
     */
    getNextQuestion(mode) {
        if (!this.isInitialized) {
            console.error('ProgressSystem이 초기화되지 않았습니다.');
            return 1;
        }

        return this.progressManager.getNextQuestion(mode);
    }

    /**
     * 진도 조회 (통합 함수)
     */
    getProgress() {
        if (!this.isInitialized) {
            console.error('ProgressSystem이 초기화되지 않았습니다.');
            return null;
        }

        return this.progressManager.getProgress();
    }

    /**
     * 통계 조회 (통합 함수)
     */
    getStats(mode = null) {
        if (!this.isInitialized) {
            console.error('ProgressSystem이 초기화되지 않았습니다.');
            return null;
        }

        try {
            if (mode === null) {
                return this.statsCalculator.calculateProgressStats();
            } else if (mode === 'today') {
                return this.statsCalculator.calculateTodayStats();
            } else {
                return this.statsCalculator.calculateCategoryStats(mode);
            }
            
        } catch (error) {
            console.error('Error in getStats:', error);
            return null;
        }
    }

    /**
     * 시스템 테스트 (통합 테스트)
     */
    testSystem() {
        console.log('🧪 ProgressSystem 통합 테스트 시작...');
        
        const results = {
            initialization: false,
            progressManager: false,
            statsCalculator: false,
            uiUpdater: false,
            integration: false
        };

        try {
            // 1. 초기화 테스트
            results.initialization = this.initialize();
            console.log('✅ 초기화 테스트:', results.initialization ? '성공' : '실패');

            if (!results.initialization) {
                throw new Error('시스템 초기화 실패');
            }

            // 2. ProgressManager 테스트
            const progress = this.getProgress();
            results.progressManager = progress !== null;
            console.log('✅ ProgressManager 테스트:', results.progressManager ? '성공' : '실패');

            // 3. StatsCalculator 테스트
            const stats = this.getStats();
            results.statsCalculator = stats !== null;
            console.log('✅ StatsCalculator 테스트:', results.statsCalculator ? '성공' : '실패');

            // 4. UIUpdater 테스트
            const updateResult = this.updateStats();
            results.uiUpdater = updateResult !== false;
            console.log('✅ UIUpdater 테스트:', results.uiUpdater ? '성공' : '실패');

            // 5. 통합 기능 테스트
            const saveResult = this.saveProgress('basic', 1, true);
            const nextQuestion = this.getNextQuestion('basic');
            const todayStats = this.getStats('today');
            
            results.integration = saveResult && nextQuestion > 0 && todayStats !== null;
            console.log('✅ 통합 기능 테스트:', results.integration ? '성공' : '실패');

            // 6. 전체 결과
            const allPassed = Object.values(results).every(result => result === true);
            console.log('🎯 전체 테스트 결과:', allPassed ? '모든 테스트 통과' : '일부 테스트 실패');
            
            return results;

        } catch (error) {
            console.error('❌ 시스템 테스트 실패:', error);
            return results;
        }
    }

    /**
     * 시스템 리셋 (테스트용)
     */
    resetSystem() {
        if (!this.isInitialized) {
            console.error('ProgressSystem이 초기화되지 않았습니다.');
            return false;
        }

        try {
            // LocalStorage 초기화
            localStorage.removeItem('aicu_progress');
            console.log('✅ 시스템 리셋 완료');
            return true;
            
        } catch (error) {
            console.error('Error in resetSystem:', error);
            return false;
        }
    }

    /**
     * 시스템 정보 출력
     */
    printSystemInfo() {
        const status = this.getSystemStatus();
        console.log('📊 ProgressSystem 상태:', status);
        
        if (this.isInitialized) {
            const progress = this.getProgress();
            console.log('📈 현재 진도:', progress ? progress.basicLearning.lastQuestion : 'N/A');
            
            const stats = this.getStats();
            console.log('📊 현재 통계:', stats ? '로드됨' : 'N/A');
        }
    }
}

// 전역 인스턴스 생성
const progressSystem = new ProgressSystem();

// 시스템 초기화 및 테스트 (개발 모드에서만)
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // 페이지 로드 후 시스템 초기화 및 테스트 실행
    window.addEventListener('load', () => {
        setTimeout(() => {
            console.log('🎯 ProgressSystem 자동 초기화 및 테스트 시작...');
            progressSystem.testSystem();
            progressSystem.printSystemInfo();
        }, 4000); // 모든 모듈 테스트 후 실행
    });
}

// 전역 함수로 노출 (다른 스크립트에서 사용 가능)
window.progressSystem = progressSystem;
