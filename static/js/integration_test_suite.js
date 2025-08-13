/**
 * Integration Test Suite - Phase 3 Day 3
 * 통합 테스트 스위트 - 모든 고도화된 통계 모듈 검증
 */

class IntegrationTestSuite {
    constructor() {
        this.testResults = [];
        this.startTime = null;
        this.endTime = null;
        this.modules = {
            advancedProgressManager: null,
            realTimeStatsUpdater: null,
            advancedStatisticsSystem: null,
            notificationSystem: null
        };
        this.testCount = 0;
        this.passCount = 0;
        this.failCount = 0;
    }

    // 모듈 로드 확인
    async loadModules() {
        console.log('🔧 모듈 로드 확인 중...');
        
        // 모듈 존재 확인
        this.modules.advancedProgressManager = window.advancedProgressManager;
        this.modules.realTimeStatsUpdater = window.realTimeStatsUpdater;
        this.modules.advancedStatisticsSystem = window.advancedStatisticsSystem;
        this.modules.notificationSystem = window.notificationSystem;

        const results = {
            advancedProgressManager: !!this.modules.advancedProgressManager,
            realTimeStatsUpdater: !!this.modules.realTimeStatsUpdater,
            advancedStatisticsSystem: !!this.modules.advancedStatisticsSystem,
            notificationSystem: !!this.modules.notificationSystem
        };

        console.log('📊 모듈 로드 결과:', results);
        return results;
    }

    // 테스트 결과 기록
    recordTest(testName, passed, details = '') {
        this.testCount++;
        if (passed) {
            this.passCount++;
        } else {
            this.failCount++;
        }

        const result = {
            testName,
            passed,
            details,
            timestamp: new Date().toISOString()
        };

        this.testResults.push(result);
        console.log(`${passed ? '✅' : '❌'} ${testName}: ${details}`);
        return result;
    }

    // 기본 기능 테스트
    async testBasicFunctionality() {
        console.log('🧪 기본 기능 테스트 시작...');
        
        if (!this.modules.advancedProgressManager) {
            return this.recordTest('기본 기능 테스트', false, 'AdvancedProgressManager가 로드되지 않음');
        }

        try {
            const manager = this.modules.advancedProgressManager;
            
            // 1. 초기화 테스트
            const initResult = manager.testModule();
            this.recordTest('모듈 초기화', initResult, '모듈 초기화 성공');

            // 2. 진도 저장 테스트
            manager.updateProgress('basic_learning', 1, true);
            const progress = manager.getProgressForCategory('basic_learning');
            const progressTest = progress.last_question === 1 && progress.total_attempted === 1;
            this.recordTest('진도 저장', progressTest, `마지막 문제: ${progress.last_question}, 총 풀이: ${progress.total_attempted}`);

            // 3. 다음 문제 조회 테스트
            const nextQuestion = manager.getNextQuestion('basic_learning');
            const nextQuestionTest = nextQuestion === 2;
            this.recordTest('다음 문제 조회', nextQuestionTest, `다음 문제: ${nextQuestion}번`);

            // 4. 통계 계산 테스트
            const stats = manager.statistics;
            const statsTest = stats.total_questions_solved >= 0;
            this.recordTest('통계 계산', statsTest, `총 풀이: ${stats.total_questions_solved}개`);

            return true;
        } catch (error) {
            return this.recordTest('기본 기능 테스트', false, `오류: ${error.message}`);
        }
    }

    // 이어풀기 기능 테스트
    async testContinueLearning() {
        console.log('🔄 이어풀기 기능 테스트 시작...');
        
        if (!this.modules.advancedProgressManager) {
            return this.recordTest('이어풀기 테스트', false, 'AdvancedProgressManager가 로드되지 않음');
        }

        try {
            const manager = this.modules.advancedProgressManager;
            
            // 1. 기본학습 진도 설정
            manager.updateProgress('basic_learning', 10, true);
            manager.updateProgress('basic_learning', 11, false);
            manager.updateProgress('basic_learning', 12, true);
            
            // 2. 카테고리별 진도 설정
            manager.updateProgress('해상보험', 5, true);
            manager.updateProgress('해상보험', 6, true);
            
            // 3. 이어풀기 테스트
            const nextBasic = manager.getNextQuestion('basic_learning');
            const nextMarine = manager.getNextQuestion('해상보험');
            
            const basicTest = nextBasic === 13;
            const marineTest = nextMarine === 7;
            
            this.recordTest('기본학습 이어풀기', basicTest, `다음 문제: ${nextBasic}번`);
            this.recordTest('카테고리 이어풀기', marineTest, `다음 문제: ${nextMarine}번`);

            // 4. 진도 독립성 테스트
            const basicProgress = manager.getProgressForCategory('basic_learning');
            const marineProgress = manager.getProgressForCategory('해상보험');
            
            const independenceTest = basicProgress.last_question === 12 && marineProgress.last_question === 6;
            this.recordTest('진도 독립성', independenceTest, '각 카테고리별 독립적 진도 관리');

            return true;
        } catch (error) {
            return this.recordTest('이어풀기 테스트', false, `오류: ${error.message}`);
        }
    }

    // 실시간 통계 업데이트 테스트
    async testRealTimeUpdates() {
        console.log('⚡ 실시간 통계 업데이트 테스트 시작...');
        
        if (!this.modules.realTimeStatsUpdater || !this.modules.advancedStatisticsSystem) {
            return this.recordTest('실시간 업데이트 테스트', false, '필요한 모듈이 로드되지 않음');
        }

        try {
            const updater = this.modules.realTimeStatsUpdater;
            const system = this.modules.advancedStatisticsSystem;
            
            // 1. 실시간 업데이트 테스트
            const initialStats = system.getStatistics();
            updater.updateStatistics('basic_learning', 20, true);
            
            // 약간의 지연 후 결과 확인
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const updatedStats = system.getStatistics();
            const updateTest = updatedStats.total_questions_solved > initialStats.total_questions_solved;
            this.recordTest('실시간 통계 업데이트', updateTest, `업데이트 전: ${initialStats.total_questions_solved}, 후: ${updatedStats.total_questions_solved}`);

            // 2. 성능 테스트
            const startTime = performance.now();
            for (let i = 1; i <= 10; i++) {
                updater.updateStatistics('basic_learning', 20 + i, Math.random() > 0.3);
            }
            const endTime = performance.now();
            const performanceTime = endTime - startTime;
            
            const performanceTest = performanceTime < 100; // 100ms 이내
            this.recordTest('성능 테스트', performanceTest, `10개 업데이트: ${performanceTime.toFixed(2)}ms`);

            return true;
        } catch (error) {
            return this.recordTest('실시간 업데이트 테스트', false, `오류: ${error.message}`);
        }
    }

    // 사용자 등록 및 데이터 지속성 테스트
    async testUserRegistrationAndPersistence() {
        console.log('👤 사용자 등록 및 데이터 지속성 테스트 시작...');
        
        if (!this.modules.advancedProgressManager) {
            return this.recordTest('사용자 등록 테스트', false, 'AdvancedProgressManager가 로드되지 않음');
        }

        try {
            const manager = this.modules.advancedProgressManager;
            
            // 1. 데모 모드 확인
            const initialUserInfo = manager.userInfo;
            const demoModeTest = initialUserInfo.is_demo_mode === true;
            this.recordTest('데모 모드 초기화', demoModeTest, `데모 모드: ${initialUserInfo.is_demo_mode}`);

            // 2. 실제 사용자 등록
            const realUserInfo = {
                name: "김철수",
                exam_date: "2025-10-15",
                phone: "010-9876-5432"
            };
            
            manager.registerRealUser(realUserInfo);
            const updatedUserInfo = manager.userInfo;
            const registrationTest = updatedUserInfo.is_demo_mode === false && updatedUserInfo.name === "김철수";
            this.recordTest('실제 사용자 등록', registrationTest, `등록된 사용자: ${updatedUserInfo.name}`);

            // 3. 데이터 저장 테스트
            const saveResult = manager.saveStatistics();
            this.recordTest('데이터 저장', saveResult, 'LocalStorage 저장 성공');

            // 4. 데이터 로드 테스트
            const loadResult = manager.loadStatistics();
            this.recordTest('데이터 로드', loadResult, 'LocalStorage 로드 성공');

            return true;
        } catch (error) {
            return this.recordTest('사용자 등록 테스트', false, `오류: ${error.message}`);
        }
    }

    // 알림 시스템 테스트
    async testNotificationSystem() {
        console.log('🔔 알림 시스템 테스트 시작...');
        
        if (!this.modules.notificationSystem) {
            return this.recordTest('알림 시스템 테스트', false, 'NotificationSystem이 로드되지 않음');
        }

        try {
            const notification = this.modules.notificationSystem;
            
            // 1. 시스템 초기화 테스트
            const initResult = notification.testSystem();
            this.recordTest('알림 시스템 초기화', initResult, '알림 시스템 초기화 성공');

            // 2. 알림 표시 테스트
            const showResult = notification.showNotification('테스트 알림', 'success');
            this.recordTest('알림 표시', showResult, '알림 표시 성공');

            // 3. 알림 상태 확인
            const status = notification.getStatus();
            const statusTest = status.isEnabled === true;
            this.recordTest('알림 상태 확인', statusTest, `알림 활성화: ${status.isEnabled}`);

            return true;
        } catch (error) {
            return this.recordTest('알림 시스템 테스트', false, `오류: ${error.message}`);
        }
    }

    // 통합 시스템 테스트
    async testIntegratedSystem() {
        console.log('🚀 통합 시스템 테스트 시작...');
        
        if (!this.modules.advancedStatisticsSystem) {
            return this.recordTest('통합 시스템 테스트', false, 'AdvancedStatisticsSystem이 로드되지 않음');
        }

        try {
            const system = this.modules.advancedStatisticsSystem;
            
            // 1. 시스템 초기화 테스트
            const initResult = await system.testSystem();
            this.recordTest('통합 시스템 초기화', initResult, '시스템 초기화 성공');

            // 2. 성능 통계 확인
            const perfStats = system.getPerformanceStats();
            const perfTest = perfStats.queueLength >= 0;
            this.recordTest('성능 통계', perfTest, `큐 길이: ${perfStats.queueLength}`);

            // 3. 시스템 상태 확인
            const status = system.getSystemStatus();
            const statusTest = status.isInitialized === true;
            this.recordTest('시스템 상태', statusTest, `초기화 완료: ${status.isInitialized}`);

            return true;
        } catch (error) {
            return this.recordTest('통합 시스템 테스트', false, `오류: ${error.message}`);
        }
    }

    // 전체 테스트 실행
    async runAllTests() {
        console.log('🎯 전체 통합 테스트 시작...');
        this.startTime = performance.now();
        
        // 모듈 로드 확인
        await this.loadModules();
        
        // 각 테스트 실행
        await this.testBasicFunctionality();
        await this.testContinueLearning();
        await this.testRealTimeUpdates();
        await this.testUserRegistrationAndPersistence();
        await this.testNotificationSystem();
        await this.testIntegratedSystem();
        
        this.endTime = performance.now();
        
        // 결과 요약
        return this.generateReport();
    }

    // 테스트 결과 보고서 생성
    generateReport() {
        const totalTime = this.endTime - this.startTime;
        const successRate = (this.passCount / this.testCount * 100).toFixed(1);
        
        const report = {
            summary: {
                totalTests: this.testCount,
                passed: this.passCount,
                failed: this.failCount,
                successRate: successRate,
                totalTime: totalTime.toFixed(2)
            },
            details: this.testResults,
            modules: {
                advancedProgressManager: !!this.modules.advancedProgressManager,
                realTimeStatsUpdater: !!this.modules.realTimeStatsUpdater,
                advancedStatisticsSystem: !!this.modules.advancedStatisticsSystem,
                notificationSystem: !!this.modules.notificationSystem
            }
        };

        console.log('📊 테스트 결과 요약:', report.summary);
        return report;
    }

    // 테스트 결과를 UI에 표시
    displayResults(report) {
        const resultsContainer = document.getElementById('integration-test-results');
        if (!resultsContainer) return;

        const summary = report.summary;
        const details = report.details;

        let html = `
            <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 class="text-xl font-semibold text-gray-800 mb-4">🎯 통합 테스트 결과</h2>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div class="text-center p-4 bg-blue-50 rounded-lg">
                        <div class="text-2xl font-bold text-blue-600">${summary.totalTests}</div>
                        <div class="text-sm text-blue-800">전체 테스트</div>
                    </div>
                    <div class="text-center p-4 bg-green-50 rounded-lg">
                        <div class="text-2xl font-bold text-green-600">${summary.passed}</div>
                        <div class="text-sm text-green-800">성공</div>
                    </div>
                    <div class="text-center p-4 bg-red-50 rounded-lg">
                        <div class="text-2xl font-bold text-red-600">${summary.failed}</div>
                        <div class="text-sm text-red-800">실패</div>
                    </div>
                    <div class="text-center p-4 bg-purple-50 rounded-lg">
                        <div class="text-2xl font-bold text-purple-600">${summary.successRate}%</div>
                        <div class="text-sm text-purple-800">성공률</div>
                    </div>
                </div>

                <div class="mb-4">
                    <div class="text-sm text-gray-600">총 소요 시간: ${summary.totalTime}ms</div>
                </div>

                <div class="space-y-2">
                    <h3 class="font-semibold text-gray-800">상세 결과:</h3>
        `;

        details.forEach(result => {
            const statusIcon = result.passed ? '✅' : '❌';
            const statusColor = result.passed ? 'text-green-600' : 'text-red-600';
            
            html += `
                <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div class="flex items-center">
                        <span class="mr-2">${statusIcon}</span>
                        <span class="font-medium">${result.testName}</span>
                    </div>
                    <div class="text-sm ${statusColor}">${result.details}</div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        resultsContainer.innerHTML = html;
    }
}

// 전역 인스턴스 생성
window.integrationTestSuite = new IntegrationTestSuite();

// 테스트 실행 함수
async function runIntegrationTests() {
    console.log('🚀 통합 테스트 시작...');
    
    const testSuite = window.integrationTestSuite;
    const report = await testSuite.runAllTests();
    testSuite.displayResults(report);
    
    return report;
}

console.log('✅ Integration Test Suite 로드 완료');
