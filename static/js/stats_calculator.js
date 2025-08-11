/**
 * StatsCalculator - 통계 계산 모듈 (레고블록 2)
 * 075번 문서 V1.3 + 분산형 레고블록 개발 방법론 적용
 * 
 * 핵심 기능:
 * - calculateProgressStats(): 전체 진도 통계 계산
 * - calculateTodayStats(): 오늘 학습 통계 계산
 * - calculateCategoryStats(): 카테고리별 통계 계산
 */

class StatsCalculator {
    constructor() {
        this.progressManager = null; // ProgressManager 인스턴스 참조
    }

    /**
     * ProgressManager 설정
     */
    setProgressManager(progressManager) {
        this.progressManager = progressManager;
    }

    /**
     * 전체 진도 통계 계산
     */
    calculateProgressStats() {
        if (!this.progressManager) {
            console.error('ProgressManager not set');
            return null;
        }

        const progress = this.progressManager.getProgress();
        
        // 기본학습 통계
        const basicStats = {
            lastQuestion: progress.basicLearning.lastQuestion,
            totalAttempted: progress.basicLearning.totalAttempted,
            totalCorrect: progress.basicLearning.totalCorrect,
            todayAttempted: progress.basicLearning.todayAttempted,
            todayCorrect: progress.basicLearning.todayCorrect,
            accuracy: progress.basicLearning.totalAttempted > 0 
                ? Math.round((progress.basicLearning.totalCorrect / progress.basicLearning.totalAttempted) * 100)
                : 0,
            todayAccuracy: progress.basicLearning.todayAttempted > 0
                ? Math.round((progress.basicLearning.todayCorrect / progress.basicLearning.todayAttempted) * 100)
                : 0,
            progressPercent: Math.round((progress.basicLearning.lastQuestion / 789) * 100)
        };

        // 카테고리별 통계
        const categoryStats = {};
        for (const [category, data] of Object.entries(progress.categories)) {
            categoryStats[category] = {
                lastQuestion: data.lastQuestion,
                totalAttempted: data.totalAttempted,
                totalCorrect: data.totalCorrect,
                todayAttempted: data.todayAttempted,
                todayCorrect: data.todayCorrect,
                accuracy: data.totalAttempted > 0
                    ? Math.round((data.totalCorrect / data.totalAttempted) * 100)
                    : 0,
                todayAccuracy: data.todayAttempted > 0
                    ? Math.round((data.todayCorrect / data.todayAttempted) * 100)
                    : 0,
                progressPercent: Math.round((data.lastQuestion / data.maxQuestions) * 100)
            };
        }

        return {
            basic: basicStats,
            categories: categoryStats,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 오늘 학습 통계 계산
     */
    calculateTodayStats() {
        if (!this.progressManager) {
            console.error('ProgressManager not set');
            return null;
        }

        const progress = this.progressManager.getProgress();
        
        // 기본학습 오늘 통계
        const basicToday = {
            attempted: progress.basicLearning.todayAttempted,
            correct: progress.basicLearning.todayCorrect,
            accuracy: progress.basicLearning.todayAttempted > 0
                ? Math.round((progress.basicLearning.todayCorrect / progress.basicLearning.todayAttempted) * 100)
                : 0
        };

        // 카테고리별 오늘 통계
        const categoryToday = {};
        for (const [category, data] of Object.entries(progress.categories)) {
            categoryToday[category] = {
                attempted: data.todayAttempted,
                correct: data.todayCorrect,
                accuracy: data.todayAttempted > 0
                    ? Math.round((data.todayCorrect / data.todayAttempted) * 100)
                    : 0
            };
        }

        // 전체 오늘 통계
        const totalAttempted = basicToday.attempted + 
            Object.values(categoryToday).reduce((sum, cat) => sum + cat.attempted, 0);
        const totalCorrect = basicToday.correct + 
            Object.values(categoryToday).reduce((sum, cat) => sum + cat.correct, 0);

        return {
            basic: basicToday,
            categories: categoryToday,
            total: {
                attempted: totalAttempted,
                correct: totalCorrect,
                accuracy: totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0
            },
            date: new Date().toISOString().split('T')[0]
        };
    }

    /**
     * 카테고리별 통계 계산
     */
    calculateCategoryStats(category) {
        if (!this.progressManager) {
            console.error('ProgressManager not set');
            return null;
        }

        const progress = this.progressManager.getProgress();
        
        if (!progress.categories[category]) {
            console.error(`Category not found: ${category}`);
            return null;
        }

        const data = progress.categories[category];
        
        return {
            category: category,
            lastQuestion: data.lastQuestion,
            totalAttempted: data.totalAttempted,
            totalCorrect: data.totalCorrect,
            todayAttempted: data.todayAttempted,
            todayCorrect: data.todayCorrect,
            maxQuestions: data.maxQuestions,
            accuracy: data.totalAttempted > 0
                ? Math.round((data.totalCorrect / data.totalAttempted) * 100)
                : 0,
            todayAccuracy: data.todayAttempted > 0
                ? Math.round((data.todayCorrect / data.todayAttempted) * 100)
                : 0,
            progressPercent: Math.round((data.lastQuestion / data.maxQuestions) * 100),
            remainingQuestions: data.maxQuestions - data.lastQuestion
        };
    }

    /**
     * 간단한 진행률 텍스트 생성
     */
    generateProgressText(mode) {
        if (!this.progressManager) {
            return '진행률 정보를 불러올 수 없습니다.';
        }

        const progress = this.progressManager.getProgress();
        
        if (mode === 'basic') {
            const data = progress.basicLearning;
            const accuracy = data.totalAttempted > 0 
                ? Math.round((data.totalCorrect / data.totalAttempted) * 100)
                : 0;
            
            return `기본학습: ${data.lastQuestion}번 문제까지 완료 (${Math.round((data.lastQuestion / 789) * 100)}%) | 정답률: ${accuracy}%`;
        } else {
            const data = progress.categories[mode];
            if (!data) return '카테고리 정보를 찾을 수 없습니다.';
            
            const accuracy = data.totalAttempted > 0
                ? Math.round((data.totalCorrect / data.totalAttempted) * 100)
                : 0;
            
            return `${mode}: ${data.lastQuestion}번 문제까지 완료 (${Math.round((data.lastQuestion / data.maxQuestions) * 100)}%) | 정답률: ${accuracy}%`;
        }
    }

    /**
     * 오늘 학습 요약 생성
     */
    generateTodaySummary() {
        const todayStats = this.calculateTodayStats();
        if (!todayStats) return '오늘 학습 정보를 불러올 수 없습니다.';

        const total = todayStats.total;
        
        if (total.attempted === 0) {
            return '오늘은 아직 학습하지 않았습니다.';
        }

        return `오늘 학습: ${total.attempted}문제 시도, ${total.correct}문제 정답 (정답률: ${total.accuracy}%)`;
    }

    /**
     * 다음 문제 안내 텍스트 생성
     */
    generateNextQuestionText(mode) {
        if (!this.progressManager) {
            return '다음 문제 정보를 불러올 수 없습니다.';
        }

        const nextQuestion = this.progressManager.getNextQuestion(mode);
        
        if (mode === 'basic') {
            return `다음 문제: ${nextQuestion}번`;
        } else {
            return `${mode} 다음 문제: ${nextQuestion}번`;
        }
    }

    /**
     * 모듈 테스트 함수
     */
    testModule() {
        console.log('=== StatsCalculator 모듈 테스트 시작 ===');
        
        // ProgressManager가 설정되지 않은 경우 테스트
        const stats1 = this.calculateProgressStats();
        console.log('✅ ProgressManager 미설정 테스트:', stats1 === null);
        
        // ProgressManager 설정 후 테스트
        if (typeof progressManager !== 'undefined') {
            this.setProgressManager(progressManager);
            
            // 1. 전체 통계 계산 테스트
            const progressStats = this.calculateProgressStats();
            console.log('✅ 전체 통계 계산:', progressStats ? '성공' : '실패');
            
            // 2. 오늘 통계 계산 테스트
            const todayStats = this.calculateTodayStats();
            console.log('✅ 오늘 통계 계산:', todayStats ? '성공' : '실패');
            
            // 3. 카테고리별 통계 계산 테스트
            const categoryStats = this.calculateCategoryStats('재산보험');
            console.log('✅ 카테고리별 통계 계산:', categoryStats ? '성공' : '실패');
            
            // 4. 진행률 텍스트 생성 테스트
            const progressText = this.generateProgressText('basic');
            console.log('✅ 진행률 텍스트 생성:', progressText);
            
            // 5. 오늘 요약 생성 테스트
            const todaySummary = this.generateTodaySummary();
            console.log('✅ 오늘 요약 생성:', todaySummary);
            
            // 6. 다음 문제 안내 생성 테스트
            const nextQuestionText = this.generateNextQuestionText('basic');
            console.log('✅ 다음 문제 안내 생성:', nextQuestionText);
        } else {
            console.log('⚠️ ProgressManager 인스턴스를 찾을 수 없습니다.');
        }
        
        console.log('=== StatsCalculator 모듈 테스트 완료 ===');
        return true;
    }
}

// 전역 인스턴스 생성
const statsCalculator = new StatsCalculator();

// 모듈 테스트 실행 (개발 모드에서만)
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // 페이지 로드 후 테스트 실행
    window.addEventListener('load', () => {
        setTimeout(() => {
            statsCalculator.testModule();
        }, 2000); // ProgressManager 테스트 후 실행
    });
}
