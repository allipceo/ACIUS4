/**
 * UIUpdater - UI 업데이트 모듈 (레고블록 3)
 * 075번 문서 V1.3 + 분산형 레고블록 개발 방법론 적용
 * 
 * 핵심 기능:
 * - updateHomeStats(): 홈페이지 통계 업데이트
 * - updateBasicLearningStats(): 기본학습 통계 업데이트
 * - updateCategoryStats(): 카테고리별 통계 업데이트
 */

class UIUpdater {
    constructor() {
        this.progressManager = null;
        this.statsCalculator = null;
    }

    /**
     * 의존성 설정
     */
    setDependencies(progressManager, statsCalculator) {
        this.progressManager = progressManager;
        this.statsCalculator = statsCalculator;
    }

    /**
     * 홈페이지 통계 업데이트
     */
    updateHomeStats() {
        if (!this.progressManager || !this.statsCalculator) {
            console.error('Dependencies not set');
            return false;
        }

        try {
            // 오늘 날짜 초기화
            this.progressManager.resetTodayStats();
            
            // 통계 계산
            const progressStats = this.statsCalculator.calculateProgressStats();
            const todayStats = this.statsCalculator.calculateTodayStats();
            
            // 홈페이지 통계 박스 업데이트
            this.updateHomeProgressBox(progressStats);
            this.updateHomeTodayBox(todayStats);
            
            console.log('✅ 홈페이지 통계 업데이트 완료');
            return true;
            
        } catch (error) {
            console.error('Error updating home stats:', error);
            return false;
        }
    }

    /**
     * 홈페이지 진행률 박스 업데이트
     */
    updateHomeProgressBox(progressStats) {
        const progressBox = document.getElementById('home-progress-box');
        if (!progressBox) return;

        const basic = progressStats.basic;
        
        // 진행률 텍스트 업데이트
        const progressText = document.getElementById('home-progress-text');
        if (progressText) {
            progressText.textContent = `기본학습: ${basic.lastQuestion}번 문제까지 완료 (${basic.progressPercent}%)`;
        }

        // 정답률 텍스트 업데이트
        const accuracyText = document.getElementById('home-accuracy-text');
        if (accuracyText) {
            accuracyText.textContent = `전체 정답률: ${basic.accuracy}%`;
        }

        // 총 시도 문제수 업데이트
        const totalAttemptedText = document.getElementById('home-total-attempted');
        if (totalAttemptedText) {
            totalAttemptedText.textContent = `총 시도: ${basic.totalAttempted}문제`;
        }

        // 총 정답수 업데이트
        const totalCorrectText = document.getElementById('home-total-correct');
        if (totalCorrectText) {
            totalCorrectText.textContent = `총 정답: ${basic.totalCorrect}문제`;
        }
    }

    /**
     * 홈페이지 오늘 통계 박스 업데이트
     */
    updateHomeTodayBox(todayStats) {
        const todayBox = document.getElementById('home-today-box');
        if (!todayBox) return;

        const total = todayStats.total;
        
        // 오늘 요약 텍스트 업데이트
        const todaySummaryText = document.getElementById('home-today-summary');
        if (todaySummaryText) {
            if (total.attempted === 0) {
                todaySummaryText.textContent = '오늘은 아직 학습하지 않았습니다.';
            } else {
                todaySummaryText.textContent = `오늘 학습: ${total.attempted}문제 시도, ${total.correct}문제 정답 (정답률: ${total.accuracy}%)`;
            }
        }

        // 오늘 시도 문제수 업데이트
        const todayAttemptedText = document.getElementById('home-today-attempted');
        if (todayAttemptedText) {
            todayAttemptedText.textContent = `오늘 시도: ${total.attempted}문제`;
        }

        // 오늘 정답수 업데이트
        const todayCorrectText = document.getElementById('home-today-correct');
        if (todayCorrectText) {
            todayCorrectText.textContent = `오늘 정답: ${total.correct}문제`;
        }

        // 오늘 정답률 업데이트
        const todayAccuracyText = document.getElementById('home-today-accuracy');
        if (todayAccuracyText) {
            todayAccuracyText.textContent = `오늘 정답률: ${total.accuracy}%`;
        }
    }

    /**
     * 기본학습 통계 업데이트
     */
    updateBasicLearningStats() {
        if (!this.progressManager || !this.statsCalculator) {
            console.error('Dependencies not set');
            return false;
        }

        try {
            // 통계 계산
            const progressStats = this.statsCalculator.calculateProgressStats();
            const basic = progressStats.basic;
            
            // 기본학습 페이지 통계 업데이트
            this.updateBasicLearningProgressBox(basic);
            
            // 다음 문제 안내 업데이트
            const nextQuestion = this.progressManager.getNextQuestion('basic');
            this.updateNextQuestionBox(nextQuestion);
            
            console.log('✅ 기본학습 통계 업데이트 완료');
            return true;
            
        } catch (error) {
            console.error('Error updating basic learning stats:', error);
            return false;
        }
    }

    /**
     * 기본학습 진행률 박스 업데이트
     */
    updateBasicLearningProgressBox(basic) {
        const progressBox = document.getElementById('basic-progress-box');
        if (!progressBox) return;

        // 진행률 텍스트 업데이트
        const progressText = document.getElementById('basic-progress-text');
        if (progressText) {
            progressText.textContent = `${basic.lastQuestion}번 문제까지 완료 (${basic.progressPercent}%)`;
        }

        // 정답률 텍스트 업데이트
        const accuracyText = document.getElementById('basic-accuracy-text');
        if (accuracyText) {
            accuracyText.textContent = `정답률: ${basic.accuracy}%`;
        }

        // 오늘 정답률 텍스트 업데이트
        const todayAccuracyText = document.getElementById('basic-today-accuracy');
        if (todayAccuracyText) {
            todayAccuracyText.textContent = `오늘 정답률: ${basic.todayAccuracy}%`;
        }

        // 총 시도 문제수 업데이트
        const totalAttemptedText = document.getElementById('basic-total-attempted');
        if (totalAttemptedText) {
            totalAttemptedText.textContent = `총 시도: ${basic.totalAttempted}문제`;
        }

        // 총 정답수 업데이트
        const totalCorrectText = document.getElementById('basic-total-correct');
        if (totalCorrectText) {
            totalCorrectText.textContent = `총 정답: ${basic.totalCorrect}문제`;
        }
    }

    /**
     * 다음 문제 안내 박스 업데이트
     */
    updateNextQuestionBox(nextQuestion) {
        const nextQuestionBox = document.getElementById('next-question-box');
        if (!nextQuestionBox) return;

        const nextQuestionText = document.getElementById('next-question-text');
        if (nextQuestionText) {
            nextQuestionText.textContent = `다음 문제: ${nextQuestion}번`;
        }
    }

    /**
     * 카테고리별 통계 업데이트
     */
    updateCategoryStats(category) {
        if (!this.progressManager || !this.statsCalculator) {
            console.error('Dependencies not set');
            return false;
        }

        try {
            // 카테고리별 통계 계산
            const categoryStats = this.statsCalculator.calculateCategoryStats(category);
            if (!categoryStats) return false;
            
            // 카테고리 페이지 통계 업데이트
            this.updateCategoryProgressBox(categoryStats);
            
            // 다음 문제 안내 업데이트
            const nextQuestion = this.progressManager.getNextQuestion(category);
            this.updateCategoryNextQuestionBox(category, nextQuestion);
            
            console.log(`✅ ${category} 통계 업데이트 완료`);
            return true;
            
        } catch (error) {
            console.error(`Error updating ${category} stats:`, error);
            return false;
        }
    }

    /**
     * 카테고리 진행률 박스 업데이트
     */
    updateCategoryProgressBox(categoryStats) {
        const progressBox = document.getElementById(`${categoryStats.category}-progress-box`);
        if (!progressBox) return;

        // 진행률 텍스트 업데이트
        const progressText = document.getElementById(`${categoryStats.category}-progress-text`);
        if (progressText) {
            progressText.textContent = `${categoryStats.lastQuestion}번 문제까지 완료 (${categoryStats.progressPercent}%)`;
        }

        // 정답률 텍스트 업데이트
        const accuracyText = document.getElementById(`${categoryStats.category}-accuracy-text`);
        if (accuracyText) {
            accuracyText.textContent = `정답률: ${categoryStats.accuracy}%`;
        }

        // 오늘 정답률 텍스트 업데이트
        const todayAccuracyText = document.getElementById(`${categoryStats.category}-today-accuracy`);
        if (todayAccuracyText) {
            todayAccuracyText.textContent = `오늘 정답률: ${categoryStats.todayAccuracy}%`;
        }

        // 총 시도 문제수 업데이트
        const totalAttemptedText = document.getElementById(`${categoryStats.category}-total-attempted`);
        if (totalAttemptedText) {
            totalAttemptedText.textContent = `총 시도: ${categoryStats.totalAttempted}문제`;
        }

        // 총 정답수 업데이트
        const totalCorrectText = document.getElementById(`${categoryStats.category}-total-correct`);
        if (totalCorrectText) {
            totalCorrectText.textContent = `총 정답: ${categoryStats.totalCorrect}문제`;
        }
    }

    /**
     * 카테고리 다음 문제 안내 박스 업데이트
     */
    updateCategoryNextQuestionBox(category, nextQuestion) {
        const nextQuestionBox = document.getElementById(`${category}-next-question-box`);
        if (!nextQuestionBox) return;

        const nextQuestionText = document.getElementById(`${category}-next-question-text`);
        if (nextQuestionText) {
            nextQuestionText.textContent = `${category} 다음 문제: ${nextQuestion}번`;
        }
    }

    /**
     * 모든 통계 업데이트 (통합 함수)
     */
    updateAllStats() {
        console.log('🔄 모든 통계 업데이트 시작...');
        
        const results = {
            home: this.updateHomeStats(),
            basic: this.updateBasicLearningStats(),
            categories: {}
        };

        // 카테고리별 통계 업데이트
        const categories = ['재산보험', '특종보험', '배상보험', '해상보험'];
        for (const category of categories) {
            results.categories[category] = this.updateCategoryStats(category);
        }

        console.log('✅ 모든 통계 업데이트 완료:', results);
        return results;
    }

    /**
     * 모듈 테스트 함수
     */
    testModule() {
        console.log('=== UIUpdater 모듈 테스트 시작 ===');
        
        // 의존성이 설정되지 않은 경우 테스트
        const update1 = this.updateHomeStats();
        console.log('✅ 의존성 미설정 테스트:', update1 === false);
        
        // 의존성 설정 후 테스트
        if (typeof progressManager !== 'undefined' && typeof statsCalculator !== 'undefined') {
            this.setDependencies(progressManager, statsCalculator);
            
            // 1. 홈페이지 통계 업데이트 테스트
            const homeResult = this.updateHomeStats();
            console.log('✅ 홈페이지 통계 업데이트:', homeResult ? '성공' : '실패');
            
            // 2. 기본학습 통계 업데이트 테스트
            const basicResult = this.updateBasicLearningStats();
            console.log('✅ 기본학습 통계 업데이트:', basicResult ? '성공' : '실패');
            
            // 3. 카테고리별 통계 업데이트 테스트
            const categoryResult = this.updateCategoryStats('재산보험');
            console.log('✅ 카테고리별 통계 업데이트:', categoryResult ? '성공' : '실패');
            
            // 4. 모든 통계 업데이트 테스트
            const allResult = this.updateAllStats();
            console.log('✅ 모든 통계 업데이트:', allResult ? '성공' : '실패');
        } else {
            console.log('⚠️ ProgressManager 또는 StatsCalculator 인스턴스를 찾을 수 없습니다.');
        }
        
        console.log('=== UIUpdater 모듈 테스트 완료 ===');
        return true;
    }
}

// 전역 인스턴스 생성
const uiUpdater = new UIUpdater();

// 모듈 테스트 실행 (개발 모드에서만)
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // 페이지 로드 후 테스트 실행
    window.addEventListener('load', () => {
        setTimeout(() => {
            uiUpdater.testModule();
        }, 3000); // 다른 모듈 테스트 후 실행
    });
}
