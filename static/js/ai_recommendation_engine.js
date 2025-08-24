// AI 추천 엔진 - 고급통계 기능 2단계
class AIRecommendationEngine {
    constructor() {
        this.isInitialized = false;
        this.userPreferences = {};
        this.recommendationHistory = [];
        this.weakAreas = [];
        this.learningPatterns = {};
        console.log('=== AI 추천 엔진 초기화 ===');
    }

    async initialize() {
        try {
            console.log('🎯 AI 추천 엔진 초기화 시작...');
            
            // 사용자 기본 정보 로드
            await this.loadUserPreferences();
            
            // 추천 히스토리 로드
            await this.loadRecommendationHistory();
            
            // 취약 영역 분석
            await this.analyzeWeakAreas();
            
            // 학습 패턴 분석
            await this.analyzeLearningPatterns();
            
            this.isInitialized = true;
            console.log('✅ AI 추천 엔진 초기화 완료');
            
            return { success: true, message: 'AI 추천 엔진이 성공적으로 초기화되었습니다.' };
        } catch (error) {
            console.error('❌ AI 추천 엔진 초기화 실패:', error);
            return { success: false, message: error.message };
        }
    }

    async loadUserPreferences() {
        try {
            const userInfo = localStorage.getItem('aicu_user_info');
            if (userInfo) {
                const userData = JSON.parse(userInfo);
                this.userPreferences = {
                    userId: userData.userName || 'guest',
                    preferredTime: this.detectPreferredTime(),
                    preferredDifficulty: this.detectPreferredDifficulty(),
                    preferredCategory: this.detectPreferredCategory(),
                    studyDuration: this.detectStudyDuration(),
                    examDate: userData.examDate || '2025-09-13'
                };
            }
            console.log('✅ 사용자 선호도 로드 완료:', this.userPreferences);
        } catch (error) {
            console.error('❌ 사용자 선호도 로드 실패:', error);
            this.userPreferences = this.getDefaultPreferences();
        }
    }

    async loadRecommendationHistory() {
        try {
            const history = localStorage.getItem('aicu_ai_recommendations');
            if (history) {
                this.recommendationHistory = JSON.parse(history);
            }
            console.log('✅ 추천 히스토리 로드 완료:', this.recommendationHistory.length, '개');
        } catch (error) {
            console.error('❌ 추천 히스토리 로드 실패:', error);
            this.recommendationHistory = [];
        }
    }

    async analyzeWeakAreas() {
        try {
            const progressData = localStorage.getItem('aicu_progress');
            if (progressData) {
                const progress = JSON.parse(progressData);
                this.weakAreas = this.calculateWeakAreas(progress);
            }
            console.log('✅ 취약 영역 분석 완료:', this.weakAreas);
        } catch (error) {
            console.error('❌ 취약 영역 분석 실패:', error);
            this.weakAreas = [];
        }
    }

    async analyzeLearningPatterns() {
        try {
            const progressData = localStorage.getItem('aicu_progress');
            if (progressData) {
                const progress = JSON.parse(progressData);
                this.learningPatterns = this.calculateLearningPatterns(progress);
            }
            console.log('✅ 학습 패턴 분석 완료:', this.learningPatterns);
        } catch (error) {
            console.error('❌ 학습 패턴 분석 실패:', error);
            this.learningPatterns = {};
        }
    }

    // 개인화된 문제 추천
    async recommendNextQuestions(userId, category = null, count = 5) {
        try {
            console.log('🎯 개인화된 문제 추천 시작...');
            
            if (!this.isInitialized) {
                await this.initialize();
            }

            const recommendations = [];
            const progressData = this.getProgressData();
            
            // 1. 취약 영역 우선 추천 (40%)
            const weakAreaCount = Math.ceil(count * 0.4);
            const weakAreaQuestions = this.recommendWeakAreaQuestions(userId, weakAreaCount);
            recommendations.push(...weakAreaQuestions);

            // 2. 학습 패턴 기반 추천 (30%)
            const patternCount = Math.ceil(count * 0.3);
            const patternQuestions = this.recommendByLearningPattern(userId, this.userPreferences.preferredTime, patternCount);
            recommendations.push(...patternQuestions);

            // 3. 난이도별 추천 (20%)
            const difficultyCount = Math.ceil(count * 0.2);
            const difficultyQuestions = this.recommendByDifficulty(userId, this.userPreferences.preferredDifficulty, difficultyCount);
            recommendations.push(...difficultyQuestions);

            // 4. 카테고리별 균형 추천 (10%)
            const balanceCount = count - recommendations.length;
            if (balanceCount > 0) {
                const balanceQuestions = this.recommendByCategoryBalance(userId, balanceCount);
                recommendations.push(...balanceQuestions);
            }

            // 중복 제거 및 정렬
            const uniqueRecommendations = this.removeDuplicates(recommendations);
            const finalRecommendations = uniqueRecommendations.slice(0, count);

            // 추천 히스토리에 저장
            this.saveRecommendation(userId, finalRecommendations, '개인화된 추천', category);

            console.log('✅ 개인화된 문제 추천 완료:', finalRecommendations);
            return {
                success: true,
                recommendations: finalRecommendations,
                reason: '개인화된 학습 패턴 및 취약 영역 기반 추천',
                confidence: this.calculateRecommendationConfidence(finalRecommendations)
            };

        } catch (error) {
            console.error('❌ 개인화된 문제 추천 실패:', error);
            return { success: false, message: error.message };
        }
    }

    // 취약 영역 기반 추천
    recommendWeakAreaQuestions(userId, count = 3) {
        try {
            const recommendations = [];
            const progressData = this.getProgressData();
            
            // 취약 영역별로 문제 추천
            for (const weakArea of this.weakAreas.slice(0, count)) {
                const questions = this.getQuestionsByCategory(weakArea.category, count);
                recommendations.push(...questions);
            }

            return recommendations.slice(0, count);
        } catch (error) {
            console.error('❌ 취약 영역 추천 실패:', error);
            return [];
        }
    }

    // 난이도별 추천
    recommendByDifficulty(userId, difficulty, count = 5) {
        try {
            const recommendations = [];
            const progressData = this.getProgressData();
            
            // 난이도별 문제 풀링
            const difficultyQuestions = this.getQuestionsByDifficulty(difficulty, count * 2);
            
            // 사용자의 성과를 고려한 선택
            const userPerformance = this.getUserPerformanceByDifficulty(difficulty);
            
            for (const question of difficultyQuestions) {
                if (recommendations.length >= count) break;
                
                // 성과가 낮은 경우 쉬운 문제 우선, 높은 경우 어려운 문제 우선
                if (userPerformance < 60 && question.difficulty === 'easy') {
                    recommendations.push(question);
                } else if (userPerformance > 80 && question.difficulty === 'hard') {
                    recommendations.push(question);
                } else if (question.difficulty === difficulty) {
                    recommendations.push(question);
                }
            }

            return recommendations.slice(0, count);
        } catch (error) {
            console.error('❌ 난이도별 추천 실패:', error);
            return [];
        }
    }

    // 학습 패턴 기반 추천
    recommendByLearningPattern(userId, timeSlot, count = 3) {
        try {
            const recommendations = [];
            const pattern = this.learningPatterns[timeSlot] || {};
            
            // 시간대별 학습 효율성에 따른 추천
            const efficiency = pattern.efficiency || 0.7;
            const preferredCategories = pattern.preferredCategories || [];
            
            for (const category of preferredCategories) {
                if (recommendations.length >= count) break;
                
                const questions = this.getQuestionsByCategory(category, Math.ceil(count / preferredCategories.length));
                recommendations.push(...questions);
            }

            // 효율성이 높은 시간대면 더 많은 문제 추천
            if (efficiency > 0.8 && recommendations.length < count) {
                const additionalQuestions = this.getRandomQuestions(count - recommendations.length);
                recommendations.push(...additionalQuestions);
            }

            return recommendations.slice(0, count);
        } catch (error) {
            console.error('❌ 학습 패턴 추천 실패:', error);
            return [];
        }
    }

    // 카테고리 균형 추천
    recommendByCategoryBalance(userId, count) {
        try {
            const recommendations = [];
            const categories = ['재산보험', '특종보험', '배상보험', '해상보험'];
            const questionsPerCategory = Math.ceil(count / categories.length);
            
            for (const category of categories) {
                const questions = this.getQuestionsByCategory(category, questionsPerCategory);
                recommendations.push(...questions);
            }

            return recommendations.slice(0, count);
        } catch (error) {
            console.error('❌ 카테고리 균형 추천 실패:', error);
            return [];
        }
    }

    // 추천 정확도 계산
    calculateRecommendationConfidence(recommendations) {
        try {
            let confidence = 0.7; // 기본 신뢰도
            
            // 사용자 데이터 풍부도에 따른 조정
            const dataRichness = this.calculateDataRichness();
            confidence += dataRichness * 0.2;
            
            // 추천 히스토리 피드백에 따른 조정
            const feedbackScore = this.calculateFeedbackScore();
            confidence += feedbackScore * 0.1;
            
            return Math.min(confidence, 0.95); // 최대 95%
        } catch (error) {
            console.error('❌ 추천 정확도 계산 실패:', error);
            return 0.7;
        }
    }

    // 추천 히스토리 저장
    saveRecommendation(userId, questions, reason, category) {
        try {
            const recommendation = {
                timestamp: new Date().toISOString(),
                userId: userId,
                questions: questions.map(q => q.id || q),
                reason: reason,
                category: category,
                count: questions.length
            };

            this.recommendationHistory.push(recommendation);
            
            // 최근 50개만 유지
            if (this.recommendationHistory.length > 50) {
                this.recommendationHistory = this.recommendationHistory.slice(-50);
            }

            localStorage.setItem('aicu_ai_recommendations', JSON.stringify(this.recommendationHistory));
            console.log('✅ 추천 히스토리 저장 완료');
        } catch (error) {
            console.error('❌ 추천 히스토리 저장 실패:', error);
        }
    }

    // 추천 피드백 처리
    processRecommendationFeedback(userId, questions, accuracy, feedback) {
        try {
            const lastRecommendation = this.recommendationHistory[this.recommendationHistory.length - 1];
            if (lastRecommendation) {
                lastRecommendation.accuracy = accuracy;
                lastRecommendation.feedback = feedback;
                lastRecommendation.processedAt = new Date().toISOString();
                
                localStorage.setItem('aicu_ai_recommendations', JSON.stringify(this.recommendationHistory));
                console.log('✅ 추천 피드백 처리 완료');
            }
        } catch (error) {
            console.error('❌ 추천 피드백 처리 실패:', error);
        }
    }

    // 유틸리티 메서드들
    detectPreferredTime() {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 18) return 'afternoon';
        if (hour >= 18 && hour < 22) return 'evening';
        return 'night';
    }

    detectPreferredDifficulty() {
        const progressData = this.getProgressData();
        const overallAccuracy = this.calculateOverallAccuracy(progressData);
        
        if (overallAccuracy < 60) return 'easy';
        if (overallAccuracy > 80) return 'hard';
        return 'medium';
    }

    detectPreferredCategory() {
        const progressData = this.getProgressData();
        const categories = ['재산보험', '특종보험', '배상보험', '해상보험'];
        let preferredCategory = '재산보험';
        let maxAttempted = 0;
        
        for (const category of categories) {
            const attempted = progressData.largeCategory[category]?.totalAttempted || 0;
            if (attempted > maxAttempted) {
                maxAttempted = attempted;
                preferredCategory = category;
            }
        }
        
        return preferredCategory;
    }

    detectStudyDuration() {
        const progressData = this.getProgressData();
        const todayAttempted = progressData.basicLearning?.todayAttempted || 0;
        
        // 평균적으로 문제 1개당 2분 소요 가정
        return Math.max(30, Math.min(120, todayAttempted * 2));
    }

    getDefaultPreferences() {
        return {
            userId: 'guest',
            preferredTime: 'morning',
            preferredDifficulty: 'medium',
            preferredCategory: '재산보험',
            studyDuration: 60,
            examDate: '2025-09-13'
        };
    }

    calculateWeakAreas(progressData) {
        const weakAreas = [];
        const categories = ['재산보험', '특종보험', '배상보험', '해상보험'];
        
        for (const category of categories) {
            const categoryData = progressData.largeCategory[category];
            if (categoryData && categoryData.totalAttempted > 0) {
                const accuracy = (categoryData.totalCorrect / categoryData.totalAttempted) * 100;
                if (accuracy < 70) {
                    weakAreas.push({
                        category: category,
                        accuracy: accuracy,
                        priority: 70 - accuracy // 낮을수록 높은 우선순위
                    });
                }
            }
        }
        
        return weakAreas.sort((a, b) => a.priority - b.priority);
    }

    calculateLearningPatterns(progressData) {
        const patterns = {
            morning: { efficiency: 0.8, preferredCategories: ['재산보험', '특종보험'] },
            afternoon: { efficiency: 0.7, preferredCategories: ['배상보험', '해상보험'] },
            evening: { efficiency: 0.6, preferredCategories: ['재산보험', '배상보험'] },
            night: { efficiency: 0.5, preferredCategories: ['특종보험'] }
        };
        
        return patterns;
    }

    getProgressData() {
        try {
            const progressData = localStorage.getItem('aicu_progress');
            return progressData ? JSON.parse(progressData) : this.createDefaultProgressData();
        } catch (error) {
            console.error('❌ 진행 데이터 로드 실패:', error);
            return this.createDefaultProgressData();
        }
    }

    createDefaultProgressData() {
        return {
            userInfo: { userName: 'guest', is_guest: true },
            basicLearning: { totalAttempted: 0, totalCorrect: 0 },
            largeCategory: {
                재산보험: { totalAttempted: 0, totalCorrect: 0 },
                특종보험: { totalAttempted: 0, totalCorrect: 0 },
                배상보험: { totalAttempted: 0, totalCorrect: 0 },
                해상보험: { totalAttempted: 0, totalCorrect: 0 }
            }
        };
    }

    getQuestionsByCategory(category, count) {
        // 실제 구현에서는 문제 데이터베이스에서 가져와야 함
        // 현재는 더미 데이터 반환
        const questions = [];
        for (let i = 1; i <= count; i++) {
            questions.push({
                id: `${category}_Q${String(i).padStart(3, '0')}`,
                category: category,
                difficulty: this.getRandomDifficulty(),
                title: `${category} 문제 ${i}`
            });
        }
        return questions;
    }

    getQuestionsByDifficulty(difficulty, count) {
        const questions = [];
        const categories = ['재산보험', '특종보험', '배상보험', '해상보험'];
        
        for (let i = 1; i <= count; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            questions.push({
                id: `${category}_${difficulty}_Q${String(i).padStart(3, '0')}`,
                category: category,
                difficulty: difficulty,
                title: `${category} ${difficulty} 문제 ${i}`
            });
        }
        return questions;
    }

    getRandomQuestions(count) {
        const questions = [];
        const categories = ['재산보험', '특종보험', '배상보험', '해상보험'];
        
        for (let i = 1; i <= count; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const difficulty = this.getRandomDifficulty();
            questions.push({
                id: `${category}_RND_Q${String(i).padStart(3, '0')}`,
                category: category,
                difficulty: difficulty,
                title: `${category} 랜덤 문제 ${i}`
            });
        }
        return questions;
    }

    getRandomDifficulty() {
        const difficulties = ['easy', 'medium', 'hard'];
        return difficulties[Math.floor(Math.random() * difficulties.length)];
    }

    getUserPerformanceByDifficulty(difficulty) {
        // 실제 구현에서는 사용자의 난이도별 성과를 계산
        return 70; // 기본값
    }

    calculateOverallAccuracy(progressData) {
        const totalAttempted = progressData.basicLearning?.totalAttempted || 0;
        const totalCorrect = progressData.basicLearning?.totalCorrect || 0;
        
        if (totalAttempted === 0) return 0;
        return (totalCorrect / totalAttempted) * 100;
    }

    calculateDataRichness() {
        const progressData = this.getProgressData();
        const totalAttempted = progressData.basicLearning?.totalAttempted || 0;
        
        if (totalAttempted < 10) return 0.3;
        if (totalAttempted < 50) return 0.6;
        if (totalAttempted < 100) return 0.8;
        return 1.0;
    }

    calculateFeedbackScore() {
        if (this.recommendationHistory.length === 0) return 0;
        
        const recentFeedback = this.recommendationHistory
            .filter(r => r.feedback)
            .slice(-10);
        
        if (recentFeedback.length === 0) return 0;
        
        const positiveFeedback = recentFeedback.filter(r => r.feedback === 'positive').length;
        return positiveFeedback / recentFeedback.length;
    }

    removeDuplicates(recommendations) {
        const seen = new Set();
        return recommendations.filter(rec => {
            const key = rec.id || rec;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    // 공개 API 메서드들
    async getRecommendations(userId, category = null, count = 5) {
        return await this.recommendNextQuestions(userId, category, count);
    }

    async getWeakAreaRecommendations(userId, count = 3) {
        return this.recommendWeakAreaQuestions(userId, count);
    }

    async getDifficultyRecommendations(userId, difficulty, count = 5) {
        return this.recommendByDifficulty(userId, difficulty, count);
    }

    async getPatternRecommendations(userId, timeSlot, count = 3) {
        return this.recommendByLearningPattern(userId, timeSlot, count);
    }

    getRecommendationHistory(userId) {
        return this.recommendationHistory.filter(r => r.userId === userId);
    }

    getWeakAreas() {
        return this.weakAreas;
    }

    getLearningPatterns() {
        return this.learningPatterns;
    }

    getUserPreferences() {
        return this.userPreferences;
    }
}

// 전역 인스턴스 생성
window.aiRecommendationEngine = new AIRecommendationEngine();
console.log('🎯 AI 추천 엔진 모듈 로드 완료');









