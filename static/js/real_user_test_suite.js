/**
 * Real User Test Suite - Phase 4
 * 실제 사용자 테스트 스위트 - 서비스 시나리오 검증
 * 
 * 시나리오:
 * 1. 최초 앱 실행 시 임의의 사람(홍길동)으로 데모 모드 시작
 * 2. 사용자가 학습을 진행하면서 통계 데이터 축적
 * 3. 특정 시점에 사용자가 본인 정보를 등록
 * 4. 데모 데이터 초기화 후 실제 통계 시작
 */

class RealUserTestSuite {
    constructor() {
        this.testResults = [];
        this.startTime = null;
        this.endTime = null;
        this.demoData = null;
        this.realUserData = null;
        this.testCount = 0;
        this.passCount = 0;
        this.failCount = 0;
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

    // Phase 4 Day 1: 데모 모드 초기화 테스트
    async testDemoModeInitialization() {
        console.log('=== Phase 4 Day 1: 데모 모드 초기화 테스트 시작 ===');
        
        if (!window.advancedProgressManager) {
            return this.recordTest('데모 모드 초기화', false, 'AdvancedProgressManager가 로드되지 않음');
        }

        try {
            const manager = window.advancedProgressManager;
            
            // 1. 데모 모드 상태 확인
            const userInfo = manager.userInfo;
            const demoModeTest = userInfo.is_demo_mode === true && userInfo.name === "홍길동";
            this.recordTest('데모 모드 상태', demoModeTest, `데모 모드: ${userInfo.is_demo_mode}, 이름: ${userInfo.name}`);

            // 2. 기본 진도 데이터 확인
            const progressData = manager.progressData;
            const basicProgress = progressData.basic_learning;
            const initialProgressTest = basicProgress.last_question === 0 && basicProgress.total_attempted === 0;
            this.recordTest('초기 진도 데이터', initialProgressTest, `마지막 문제: ${basicProgress.last_question}, 총 풀이: ${basicProgress.total_attempted}`);

            // 3. 통계 데이터 초기화 확인
            const stats = manager.statistics;
            const initialStatsTest = stats.total_questions_solved === 0 && stats.total_correct_answers === 0;
            this.recordTest('초기 통계 데이터', initialStatsTest, `총 풀이: ${stats.total_questions_solved}, 총 정답: ${stats.total_correct_answers}`);

            return true;
        } catch (error) {
            return this.recordTest('데모 모드 초기화', false, `오류: ${error.message}`);
        }
    }

    // Phase 4 Day 2: 데모 학습 진행 테스트
    async testDemoLearningProgress() {
        console.log('=== Phase 4 Day 2: 데모 학습 진행 테스트 시작 ===');
        
        if (!window.advancedProgressManager) {
            return this.recordTest('데모 학습 진행', false, 'AdvancedProgressManager가 로드되지 않음');
        }

        try {
            const manager = window.advancedProgressManager;
            
            // 1. 데모 학습 시뮬레이션 (기본학습)
            console.log('데모 사용자 학습 시뮬레이션 시작...');
            for (let i = 1; i <= 10; i++) {
                manager.updateProgress('basic_learning', i, Math.random() > 0.3);
            }
            
            // 2. 카테고리별 학습 시뮬레이션
            for (let i = 1; i <= 5; i++) {
                manager.updateProgress('해상보험', i, Math.random() > 0.3);
            }
            
            // 3. 학습 진행 확인
            const progressData = manager.progressData;
            const basicProgress = progressData.basic_learning;
            const marineProgress = progressData.categories.해상보험;
            
            const basicProgressTest = basicProgress.last_question === 10 && basicProgress.total_attempted === 10;
            const marineProgressTest = marineProgress.last_question === 5 && marineProgress.total_attempted === 5;
            
            this.recordTest('기본학습 진행', basicProgressTest, `마지막 문제: ${basicProgress.last_question}, 총 풀이: ${basicProgress.total_attempted}`);
            this.recordTest('카테고리 학습 진행', marineProgressTest, `마지막 문제: ${marineProgress.last_question}, 총 풀이: ${marineProgress.total_attempted}`);

            // 4. 통계 업데이트 확인
            const stats = manager.statistics;
            const statsUpdateTest = stats.total_questions_solved === 15; // 10 + 5
            this.recordTest('통계 업데이트', statsUpdateTest, `총 풀이: ${stats.total_questions_solved}개`);

            // 데모 데이터 저장
            this.demoData = {
                userInfo: manager.userInfo,
                progressData: JSON.parse(JSON.stringify(manager.progressData)),
                statistics: JSON.parse(JSON.stringify(manager.statistics))
            };

            return true;
        } catch (error) {
            return this.recordTest('데모 학습 진행', false, `오류: ${error.message}`);
        }
    }

    // Phase 4 Day 3: 실제 사용자 등록 테스트
    async testRealUserRegistration() {
        console.log('=== Phase 4 Day 3: 실제 사용자 등록 테스트 시작 ===');
        
        if (!window.advancedProgressManager) {
            return this.recordTest('실제 사용자 등록', false, 'AdvancedProgressManager가 로드되지 않음');
        }

        try {
            const manager = window.advancedProgressManager;
            
            // 1. 실제 사용자 정보 설정
            const realUserInfo = {
                name: "김철수",
                exam_date: "2025-10-15",
                phone: "010-9876-5432"
            };
            
            // 2. 실제 사용자 등록
            manager.registerRealUser(realUserInfo);
            
            // 3. 등록 결과 확인
            const updatedUserInfo = manager.userInfo;
            const registrationTest = updatedUserInfo.is_demo_mode === false && updatedUserInfo.name === "김철수";
            this.recordTest('실제 사용자 등록', registrationTest, `등록된 사용자: ${updatedUserInfo.name}, 데모 모드: ${updatedUserInfo.is_demo_mode}`);

            // 4. 데모 데이터 초기화 확인
            const progressData = manager.progressData;
            const basicProgress = progressData.basic_learning;
            const marineProgress = progressData.categories.해상보험;
            
            const dataResetTest = basicProgress.last_question === 0 && basicProgress.total_attempted === 0 && 
                                marineProgress.last_question === 0 && marineProgress.total_attempted === 0;
            this.recordTest('데모 데이터 초기화', dataResetTest, '모든 진도 데이터가 초기화됨');

            // 5. 통계 초기화 확인
            const stats = manager.statistics;
            const statsResetTest = stats.total_questions_solved === 0 && stats.total_correct_answers === 0;
            this.recordTest('통계 초기화', statsResetTest, `총 풀이: ${stats.total_questions_solved}, 총 정답: ${stats.total_correct_answers}`);

            // 실제 사용자 데이터 저장
            this.realUserData = {
                userInfo: manager.userInfo,
                progressData: JSON.parse(JSON.stringify(manager.progressData)),
                statistics: JSON.parse(JSON.stringify(manager.statistics))
            };

            return true;
        } catch (error) {
            return this.recordTest('실제 사용자 등록', false, `오류: ${error.message}`);
        }
    }

    // Phase 4 Day 4: 실제 학습 진행 테스트
    async testRealLearningProgress() {
        console.log('=== Phase 4 Day 4: 실제 학습 진행 테스트 시작 ===');
        
        if (!window.advancedProgressManager) {
            return this.recordTest('실제 학습 진행', false, 'AdvancedProgressManager가 로드되지 않음');
        }

        try {
            const manager = window.advancedProgressManager;
            
            // 1. 실제 사용자 학습 시뮬레이션
            console.log('실제 사용자 학습 시뮬레이션 시작...');
            for (let i = 1; i <= 8; i++) {
                manager.updateProgress('basic_learning', i, Math.random() > 0.3);
            }
            
            for (let i = 1; i <= 3; i++) {
                manager.updateProgress('배상책임보험', i, Math.random() > 0.3);
            }
            
            // 2. 실제 학습 진행 확인
            const progressData = manager.progressData;
            const basicProgress = progressData.basic_learning;
            const liabilityProgress = progressData.categories.배상책임보험;
            
            const basicProgressTest = basicProgress.last_question === 8 && basicProgress.total_attempted === 8;
            const liabilityProgressTest = liabilityProgress.last_question === 3 && liabilityProgress.total_attempted === 3;
            
            this.recordTest('실제 기본학습 진행', basicProgressTest, `마지막 문제: ${basicProgress.last_question}, 총 풀이: ${basicProgress.total_attempted}`);
            this.recordTest('실제 카테고리 학습 진행', liabilityProgressTest, `마지막 문제: ${liabilityProgress.last_question}, 총 풀이: ${liabilityProgress.total_attempted}`);

            // 3. 실제 통계 업데이트 확인
            const stats = manager.statistics;
            const realStatsTest = stats.total_questions_solved === 11; // 8 + 3
            this.recordTest('실제 통계 업데이트', realStatsTest, `총 풀이: ${stats.total_questions_solved}개`);

            // 4. 사용자 정보 유지 확인
            const userInfo = manager.userInfo;
            const userInfoTest = userInfo.is_demo_mode === false && userInfo.name === "김철수";
            this.recordTest('사용자 정보 유지', userInfoTest, `사용자: ${userInfo.name}, 데모 모드: ${userInfo.is_demo_mode}`);

            return true;
        } catch (error) {
            return this.recordTest('실제 학습 진행', false, `오류: ${error.message}`);
        }
    }

    // Phase 4 Day 5: 데이터 지속성 및 이어풀기 테스트
    async testDataPersistenceAndContinueLearning() {
        console.log('=== Phase 4 Day 5: 데이터 지속성 및 이어풀기 테스트 시작 ===');
        
        if (!window.advancedProgressManager) {
            return this.recordTest('데이터 지속성 및 이어풀기', false, 'AdvancedProgressManager가 로드되지 않음');
        }

        try {
            const manager = window.advancedProgressManager;
            
            // 1. 데이터 저장 테스트
            const saveResult = manager.saveStatistics();
            this.recordTest('데이터 저장', saveResult, 'LocalStorage에 데이터 저장');

            // 2. 데이터 로드 테스트
            const loadResult = manager.loadStatistics();
            this.recordTest('데이터 로드', loadResult, 'LocalStorage에서 데이터 로드');

            // 3. 이어풀기 기능 테스트
            const nextBasicQuestion = manager.getNextQuestion('basic_learning');
            const nextLiabilityQuestion = manager.getNextQuestion('배상책임보험');
            
            const continueBasicTest = nextBasicQuestion === 9; // 이전에 8번까지 풀었으므로
            const continueLiabilityTest = nextLiabilityQuestion === 4; // 이전에 3번까지 풀었으므로
            
            this.recordTest('기본학습 이어풀기', continueBasicTest, `다음 문제: ${nextBasicQuestion}번`);
            this.recordTest('카테고리 이어풀기', continueLiabilityTest, `다음 문제: ${nextLiabilityQuestion}번`);

            // 4. 진도 독립성 확인
            const progressData = manager.progressData;
            const basicProgress = progressData.basic_learning;
            const liabilityProgress = progressData.categories.배상책임보험;
            
            const independenceTest = basicProgress.last_question === 8 && liabilityProgress.last_question === 3;
            this.recordTest('진도 독립성', independenceTest, '각 카테고리별 독립적 진도 관리');

            return true;
        } catch (error) {
            return this.recordTest('데이터 지속성 및 이어풀기', false, `오류: ${error.message}`);
        }
    }

    // 전체 테스트 실행
    async runAllTests() {
        console.log('🎯 Phase 4: 실제 사용자 테스트 시작...');
        this.startTime = performance.now();
        
        // 각 단계별 테스트 실행
        await this.testDemoModeInitialization();
        await this.testDemoLearningProgress();
        await this.testRealUserRegistration();
        await this.testRealLearningProgress();
        await this.testDataPersistenceAndContinueLearning();
        
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
            demoData: this.demoData,
            realUserData: this.realUserData,
            scenario: {
                phase1: "데모 모드 초기화 (홍길동으로 시작)",
                phase2: "데모 학습 진행 (기본학습 10문제, 해상보험 5문제)",
                phase3: "실제 사용자 등록 (김철수로 전환, 데모 데이터 초기화)",
                phase4: "실제 학습 진행 (기본학습 8문제, 배상책임보험 3문제)",
                phase5: "데이터 지속성 및 이어풀기 검증"
            }
        };

        console.log('📊 Phase 4 테스트 결과 요약:', report.summary);
        return report;
    }

    // 테스트 결과를 UI에 표시
    displayResults(report) {
        const resultsContainer = document.getElementById('real-user-test-results');
        if (!resultsContainer) return;

        const summary = report.summary;
        const details = report.details;
        const scenario = report.scenario;

        let html = `
            <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 class="text-xl font-semibold text-gray-800 mb-4">🎯 Phase 4: 실제 사용자 테스트 결과</h2>
                
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

                <div class="mb-6">
                    <div class="text-sm text-gray-600">총 소요 시간: ${summary.totalTime}ms</div>
                </div>

                <div class="mb-6">
                    <h3 class="font-semibold text-gray-800 mb-3">📋 서비스 시나리오:</h3>
                    <div class="space-y-2 text-sm">
                        <div class="p-2 bg-yellow-50 rounded">1️⃣ ${scenario.phase1}</div>
                        <div class="p-2 bg-yellow-50 rounded">2️⃣ ${scenario.phase2}</div>
                        <div class="p-2 bg-green-50 rounded">3️⃣ ${scenario.phase3}</div>
                        <div class="p-2 bg-green-50 rounded">4️⃣ ${scenario.phase4}</div>
                        <div class="p-2 bg-blue-50 rounded">5️⃣ ${scenario.phase5}</div>
                    </div>
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
window.realUserTestSuite = new RealUserTestSuite();

// 테스트 실행 함수
async function runRealUserTests() {
    console.log('🚀 Phase 4: 실제 사용자 테스트 시작...');
    
    const testSuite = window.realUserTestSuite;
    const report = await testSuite.runAllTests();
    testSuite.displayResults(report);
    
    return report;
}

console.log('✅ Real User Test Suite 로드 완료');
