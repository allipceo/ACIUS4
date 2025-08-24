// 개인 맞춤 추천 시스템
// 파일: static/js/personalized_recommendation_system.js

class PersonalizedRecommendationSystem {
    constructor() {
        this.isInitialized = false;
        this.recommendationData = {};
        this.recommendationEngine = {};
        this.init();
    }

    /**
     * 개인 맞춤 추천 시스템 초기화
     */
    init() {
        console.log('=== 개인 맞춤 추천 시스템 초기화 ===');
        
        try {
            // 기존 추천 데이터 로드
            this.loadRecommendationData();
            
            // 추천 엔진 초기화
            this.initializeRecommendationEngine();
            
            // 이벤트 리스너 설정
            this.setupEventListeners();
            
            // 초기 추천 생성
            this.generateRecommendations();
            
            this.isInitialized = true;
            console.log('✅ 개인 맞춤 추천 시스템 초기화 완료');
            
        } catch (error) {
            console.error('❌ 개인 맞춤 추천 시스템 초기화 실패:', error);
        }
    }

    /**
     * 기존 추천 데이터 로드
     */
    loadRecommendationData() {
        console.log('=== 기존 추천 데이터 로드 ===');
        
        try {
            const savedData = localStorage.getItem('aicu_recommendations');
            if (savedData) {
                this.recommendationData = JSON.parse(savedData);
                console.log('✅ 기존 추천 데이터 로드 완료:', this.recommendationData);
            } else {
                this.recommendationData = {
                    userProfile: {},
                    questionScores: {},
                    categoryPreferences: {},
                    difficultyLevels: {},
                    learningPaths: {},
                    recommendationHistory: [],
                    lastUpdated: null
                };
                console.log('✅ 새로운 추천 데이터 구조 생성');
            }
        } catch (error) {
            console.error('❌ 추천 데이터 로드 실패:', error);
            this.recommendationData = {
                userProfile: {},
                questionScores: {},
                categoryPreferences: {},
                difficultyLevels: {},
                learningPaths: {},
                recommendationHistory: [],
                lastUpdated: null
            };
        }
    }

    /**
     * 추천 엔진 초기화
     */
    initializeRecommendationEngine() {
        console.log('=== 추천 엔진 초기화 ===');
        
        this.recommendationEngine = {
            // 협업 필터링 (Collaborative Filtering)
            collaborativeFiltering: this.collaborativeFiltering.bind(this),
            
            // 콘텐츠 기반 필터링 (Content-based Filtering)
            contentBasedFiltering: this.contentBasedFiltering.bind(this),
            
            // 하이브리드 추천 (Hybrid Recommendation)
            hybridRecommendation: this.hybridRecommendation.bind(this),
            
            // 딥러닝 기반 추천 (Deep Learning Recommendation)
            deepLearningRecommendation: this.deepLearningRecommendation.bind(this),
            
            // 실시간 적응형 추천 (Real-time Adaptive Recommendation)
            adaptiveRecommendation: this.adaptiveRecommendation.bind(this)
        };
        
        console.log('✅ 추천 엔진 초기화 완료');
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        console.log('=== 추천 시스템 이벤트 리스너 설정 ===');
        
        // 학습 패턴 분석 이벤트 리스너
        document.addEventListener('learningPatternAnalyzed', (event) => {
            console.log('📊 학습 패턴 분석 이벤트 수신 (추천 시스템):', event.detail);
            this.updateUserProfile(event.detail);
        });
        
        // 퀴즈 완료 이벤트 리스너
        document.addEventListener('quizCompleted', (event) => {
            console.log('📊 퀴즈 완료 이벤트 수신 (추천 시스템):', event.detail);
            this.updateQuestionScores(event.detail);
        });
        
        // 카테고리 학습 시작 이벤트 리스너
        document.addEventListener('categoryLearningStarted', (event) => {
            console.log('📊 카테고리 학습 시작 이벤트 수신 (추천 시스템):', event.detail);
            this.updateCategoryPreferences(event.detail);
        });
        
        // 추천 요청 이벤트 리스너
        document.addEventListener('recommendationRequested', (event) => {
            console.log('📊 추천 요청 이벤트 수신:', event.detail);
            this.generateRecommendations(event.detail);
        });
        
        // 주기적 추천 업데이트 (10분마다)
        setInterval(() => {
            if (this.isInitialized) {
                console.log('📊 주기적 추천 업데이트 실행');
                this.generateRecommendations();
            }
        }, 600000); // 10분
        
        console.log('✅ 추천 시스템 이벤트 리스너 설정 완료');
    }

    /**
     * 사용자 프로필 업데이트
     */
    updateUserProfile(patternAnalysis) {
        console.log('=== 사용자 프로필 업데이트 ===');
        
        try {
            const profile = {
                timestamp: new Date().toISOString(),
                learningStyle: this.analyzeLearningStyle(patternAnalysis),
                strengths: this.identifyStrengths(patternAnalysis),
                weaknesses: this.identifyWeaknesses(patternAnalysis),
                preferences: this.analyzePreferences(patternAnalysis),
                progress: this.analyzeProgress(patternAnalysis),
                goals: this.inferGoals(patternAnalysis)
            };
            
            this.recommendationData.userProfile = profile;
            
            console.log('✅ 사용자 프로필 업데이트 완료:', profile);
            
        } catch (error) {
            console.error('❌ 사용자 프로필 업데이트 실패:', error);
        }
    }

    /**
     * 문제 점수 업데이트
     */
    updateQuestionScores(quizData) {
        console.log('=== 문제 점수 업데이트 ===');
        
        try {
            const questionId = quizData.questionId;
            const category = quizData.category;
            
            if (!this.recommendationData.questionScores[questionId]) {
                this.recommendationData.questionScores[questionId] = {
                    attempts: 0,
                    correct: 0,
                    incorrect: 0,
                    accuracy: 0,
                    difficulty: this.calculateDifficulty(quizData),
                    lastAttempted: null,
                    timeSpent: [],
                    category: category
                };
            }
            
            const questionScore = this.recommendationData.questionScores[questionId];
            questionScore.attempts += 1;
            
            if (quizData.isCorrect) {
                questionScore.correct += 1;
            } else {
                questionScore.incorrect += 1;
            }
            
            questionScore.accuracy = (questionScore.correct / questionScore.attempts) * 100;
            questionScore.lastAttempted = new Date().toISOString();
            
            if (quizData.timeSpent) {
                questionScore.timeSpent.push(quizData.timeSpent);
            }
            
            console.log('✅ 문제 점수 업데이트 완료:', questionId, questionScore);
            
        } catch (error) {
            console.error('❌ 문제 점수 업데이트 실패:', error);
        }
    }

    /**
     * 카테고리 선호도 업데이트
     */
    updateCategoryPreferences(categoryData) {
        console.log('=== 카테고리 선호도 업데이트 ===');
        
        try {
            const category = categoryData.category;
            
            if (!this.recommendationData.categoryPreferences[category]) {
                this.recommendationData.categoryPreferences[category] = {
                    visitCount: 0,
                    lastVisited: null,
                    averageAccuracy: 0,
                    totalQuestions: 0,
                    correctAnswers: 0,
                    timeSpent: 0,
                    difficulty: 'medium'
                };
            }
            
            const preference = this.recommendationData.categoryPreferences[category];
            preference.visitCount += 1;
            preference.lastVisited = new Date().toISOString();
            
            console.log('✅ 카테고리 선호도 업데이트 완료:', category, preference);
            
        } catch (error) {
            console.error('❌ 카테고리 선호도 업데이트 실패:', error);
        }
    }

    /**
     * 추천 생성
     */
    generateRecommendations(requestData = {}) {
        console.log('=== 추천 생성 ===');
        
        try {
            const recommendations = {
                timestamp: new Date().toISOString(),
                personalizedQuestions: this.generatePersonalizedQuestions(),
                categoryRecommendations: this.generateCategoryRecommendations(),
                difficultyRecommendations: this.generateDifficultyRecommendations(),
                learningPathRecommendations: this.generateLearningPathRecommendations(),
                adaptiveRecommendations: this.generateAdaptiveRecommendations(),
                priorityRecommendations: this.generatePriorityRecommendations()
            };
            
            // 추천 히스토리에 추가
            this.recommendationData.recommendationHistory.push({
                timestamp: new Date().toISOString(),
                recommendations: recommendations,
                requestData: requestData
            });
            
            // 최근 50개만 유지
            if (this.recommendationData.recommendationHistory.length > 50) {
                this.recommendationData.recommendationHistory = 
                    this.recommendationData.recommendationHistory.slice(-50);
            }
            
            this.recommendationData.lastUpdated = new Date().toISOString();
            
            // 데이터 저장
            this.saveRecommendationData();
            
            // 추천 결과 이벤트 발생
            this.dispatchRecommendationEvent(recommendations);
            
            console.log('✅ 추천 생성 완료:', recommendations);
            return recommendations;
            
        } catch (error) {
            console.error('❌ 추천 생성 실패:', error);
            return null;
        }
    }

    /**
     * 개인 맞춤 문제 추천 생성
     */
    generatePersonalizedQuestions() {
        console.log('=== 개인 맞춤 문제 추천 생성 ===');
        
        try {
            const userProfile = this.recommendationData.userProfile;
            const questionScores = this.recommendationData.questionScores;
            
            // 협업 필터링 기반 추천
            const collaborativeQuestions = this.recommendationEngine.collaborativeFiltering();
            
            // 콘텐츠 기반 필터링 기반 추천
            const contentBasedQuestions = this.recommendationEngine.contentBasedFiltering();
            
            // 하이브리드 추천
            const hybridQuestions = this.recommendationEngine.hybridRecommendation();
            
            // 딥러닝 기반 추천
            const deepLearningQuestions = this.recommendationEngine.deepLearningRecommendation();
            
            // 실시간 적응형 추천
            const adaptiveQuestions = this.recommendationEngine.adaptiveRecommendation();
            
            const personalizedQuestions = {
                collaborative: collaborativeQuestions,
                contentBased: contentBasedQuestions,
                hybrid: hybridQuestions,
                deepLearning: deepLearningQuestions,
                adaptive: adaptiveQuestions,
                combined: this.combineRecommendations([
                    collaborativeQuestions,
                    contentBasedQuestions,
                    hybridQuestions,
                    deepLearningQuestions,
                    adaptiveQuestions
                ])
            };
            
            console.log('✅ 개인 맞춤 문제 추천 생성 완료:', personalizedQuestions);
            return personalizedQuestions;
            
        } catch (error) {
            console.error('❌ 개인 맞춤 문제 추천 생성 실패:', error);
            return {};
        }
    }

    /**
     * 카테고리 추천 생성
     */
    generateCategoryRecommendations() {
        console.log('=== 카테고리 추천 생성 ===');
        
        try {
            const preferences = this.recommendationData.categoryPreferences;
            const userProfile = this.recommendationData.userProfile;
            
            const recommendations = {
                focusCategory: this.identifyFocusCategory(preferences, userProfile),
                balanceCategories: this.suggestBalancedCategories(preferences),
                improvementCategories: this.identifyImprovementCategories(preferences),
                masteryCategories: this.identifyMasteryCategories(preferences),
                nextSteps: this.suggestNextSteps(preferences, userProfile)
            };
            
            console.log('✅ 카테고리 추천 생성 완료:', recommendations);
            return recommendations;
            
        } catch (error) {
            console.error('❌ 카테고리 추천 생성 실패:', error);
            return {};
        }
    }

    /**
     * 난이도 추천 생성
     */
    generateDifficultyRecommendations() {
        console.log('=== 난이도 추천 생성 ===');
        
        try {
            const userProfile = this.recommendationData.userProfile;
            const questionScores = this.recommendationData.questionScores;
            
            const recommendations = {
                currentLevel: this.assessCurrentLevel(userProfile, questionScores),
                recommendedLevel: this.suggestOptimalLevel(userProfile, questionScores),
                progressionPath: this.createProgressionPath(userProfile, questionScores),
                challengeLevel: this.suggestChallengeLevel(userProfile, questionScores),
                reviewLevel: this.suggestReviewLevel(userProfile, questionScores)
            };
            
            console.log('✅ 난이도 추천 생성 완료:', recommendations);
            return recommendations;
            
        } catch (error) {
            console.error('❌ 난이도 추천 생성 실패:', error);
            return {};
        }
    }

    /**
     * 학습 경로 추천 생성
     */
    generateLearningPathRecommendations() {
        console.log('=== 학습 경로 추천 생성 ===');
        
        try {
            const userProfile = this.recommendationData.userProfile;
            const preferences = this.recommendationData.categoryPreferences;
            
            const recommendations = {
                shortTermPath: this.createShortTermPath(userProfile, preferences),
                mediumTermPath: this.createMediumTermPath(userProfile, preferences),
                longTermPath: this.createLongTermPath(userProfile, preferences),
                adaptivePath: this.createAdaptivePath(userProfile, preferences),
                milestonePath: this.createMilestonePath(userProfile, preferences)
            };
            
            console.log('✅ 학습 경로 추천 생성 완료:', recommendations);
            return recommendations;
            
        } catch (error) {
            console.error('❌ 학습 경로 추천 생성 실패:', error);
            return {};
        }
    }

    /**
     * 적응형 추천 생성
     */
    generateAdaptiveRecommendations() {
        console.log('=== 적응형 추천 생성 ===');
        
        try {
            const userProfile = this.recommendationData.userProfile;
            const recentHistory = this.recommendationData.recommendationHistory.slice(-5);
            
            const recommendations = {
                realTimeAdjustments: this.calculateRealTimeAdjustments(userProfile, recentHistory),
                performanceBased: this.generatePerformanceBasedRecommendations(userProfile),
                timeBased: this.generateTimeBasedRecommendations(userProfile),
                moodBased: this.generateMoodBasedRecommendations(userProfile),
                contextAware: this.generateContextAwareRecommendations(userProfile)
            };
            
            console.log('✅ 적응형 추천 생성 완료:', recommendations);
            return recommendations;
            
        } catch (error) {
            console.error('❌ 적응형 추천 생성 실패:', error);
            return {};
        }
    }

    /**
     * 우선순위 추천 생성
     */
    generatePriorityRecommendations() {
        console.log('=== 우선순위 추천 생성 ===');
        
        try {
            const userProfile = this.recommendationData.userProfile;
            const questionScores = this.recommendationData.questionScores;
            const preferences = this.recommendationData.categoryPreferences;
            
            const recommendations = {
                highPriority: this.identifyHighPriorityItems(userProfile, questionScores, preferences),
                mediumPriority: this.identifyMediumPriorityItems(userProfile, questionScores, preferences),
                lowPriority: this.identifyLowPriorityItems(userProfile, questionScores, preferences),
                urgentItems: this.identifyUrgentItems(userProfile, questionScores, preferences),
                strategicItems: this.identifyStrategicItems(userProfile, questionScores, preferences)
            };
            
            console.log('✅ 우선순위 추천 생성 완료:', recommendations);
            return recommendations;
            
        } catch (error) {
            console.error('❌ 우선순위 추천 생성 실패:', error);
            return {};
        }
    }

    /**
     * 추천 엔진 메서드들
     */
    
    // 협업 필터링
    collaborativeFiltering() {
        console.log('=== 협업 필터링 실행 ===');
        
        // 사용자 간 유사도 기반 추천 (시뮬레이션)
        const similarUsers = this.findSimilarUsers();
        const recommendations = similarUsers.map(user => ({
            questionId: `collab_${Math.random().toString(36).substr(2, 9)}`,
            category: this.getRandomCategory(),
            confidence: Math.random() * 0.5 + 0.5,
            reason: '유사한 학습 패턴을 가진 사용자들이 선호한 문제'
        }));
        
        return recommendations.slice(0, 5);
    }
    
    // 콘텐츠 기반 필터링
    contentBasedFiltering() {
        console.log('=== 콘텐츠 기반 필터링 실행 ===');
        
        const userProfile = this.recommendationData.userProfile;
        const preferences = this.recommendationData.categoryPreferences;
        
        const recommendations = Object.keys(preferences).map(category => ({
            questionId: `content_${Math.random().toString(36).substr(2, 9)}`,
            category: category,
            confidence: preferences[category].averageAccuracy / 100,
            reason: `${category} 카테고리에서 높은 성과를 보이는 문제`
        }));
        
        return recommendations.slice(0, 5);
    }
    
    // 하이브리드 추천
    hybridRecommendation() {
        console.log('=== 하이브리드 추천 실행 ===');
        
        const collaborative = this.recommendationEngine.collaborativeFiltering();
        const contentBased = this.recommendationEngine.contentBasedFiltering();
        
        // 두 추천 결과를 결합
        const combined = [...collaborative, ...contentBased];
        const weighted = combined.map(item => ({
            ...item,
            confidence: item.confidence * 0.7 + Math.random() * 0.3
        }));
        
        return weighted.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
    }
    
    // 딥러닝 기반 추천
    deepLearningRecommendation() {
        console.log('=== 딥러닝 기반 추천 실행 ===');
        
        // 딥러닝 모델 시뮬레이션
        const userProfile = this.recommendationData.userProfile;
        const questionScores = this.recommendationData.questionScores;
        
        const recommendations = Object.keys(questionScores).map(questionId => {
            const score = questionScores[questionId];
            const predictedAccuracy = this.predictAccuracy(score, userProfile);
            
            return {
                questionId: questionId,
                category: score.category,
                confidence: predictedAccuracy / 100,
                reason: '딥러닝 모델이 예측한 높은 성공 확률'
            };
        });
        
        return recommendations.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
    }
    
    // 실시간 적응형 추천
    adaptiveRecommendation() {
        console.log('=== 실시간 적응형 추천 실행 ===');
        
        const recentHistory = this.recommendationData.recommendationHistory.slice(-3);
        const userProfile = this.recommendationData.userProfile;
        
        // 최근 성과에 따른 적응형 추천
        const recommendations = recentHistory.map(history => ({
            questionId: `adaptive_${Math.random().toString(36).substr(2, 9)}`,
            category: this.getRandomCategory(),
            confidence: 0.8 + Math.random() * 0.2,
            reason: '최근 학습 패턴에 기반한 적응형 추천'
        }));
        
        return recommendations.slice(0, 5);
    }

    /**
     * 유틸리티 메서드들
     */
    
    // 학습 스타일 분석
    analyzeLearningStyle(patternAnalysis) {
        const sessionAnalysis = patternAnalysis.sessionAnalysis;
        const timeAnalysis = patternAnalysis.timeAnalysis;
        
        if (sessionAnalysis.averageSessionLength > 1800) { // 30분 이상
            return 'deep_learner';
        } else if (sessionAnalysis.sessionFrequency > 3) {
            return 'frequent_learner';
        } else if (timeAnalysis.peakHours.includes('22') || timeAnalysis.peakHours.includes('23')) {
            return 'night_learner';
        } else {
            return 'balanced_learner';
        }
    }
    
    // 강점 식별
    identifyStrengths(patternAnalysis) {
        const categoryAnalysis = patternAnalysis.categoryAnalysis;
        const accuracyAnalysis = patternAnalysis.accuracyAnalysis;
        
        const strengths = [];
        
        if (categoryAnalysis.favoriteCategory) {
            strengths.push(categoryAnalysis.favoriteCategory);
        }
        
        if (accuracyAnalysis.overallTrend === 'improving') {
            strengths.push('continuous_improvement');
        }
        
        return strengths;
    }
    
    // 약점 식별
    identifyWeaknesses(patternAnalysis) {
        const categoryAnalysis = patternAnalysis.categoryAnalysis;
        const accuracyAnalysis = patternAnalysis.accuracyAnalysis;
        
        const weaknesses = [];
        
        if (categoryAnalysis.weakestCategory) {
            weaknesses.push(categoryAnalysis.weakestCategory);
        }
        
        if (accuracyAnalysis.overallTrend === 'declining') {
            weaknesses.push('declining_performance');
        }
        
        return weaknesses;
    }
    
    // 선호도 분석
    analyzePreferences(patternAnalysis) {
        const categoryAnalysis = patternAnalysis.categoryAnalysis;
        const timeAnalysis = patternAnalysis.timeAnalysis;
        
        return {
            favoriteCategory: categoryAnalysis.favoriteCategory,
            bestStudyTime: timeAnalysis.bestStudyTime,
            learningFrequency: patternAnalysis.sessionAnalysis.sessionFrequency
        };
    }
    
    // 진행 상황 분석
    analyzeProgress(patternAnalysis) {
        const accuracyAnalysis = patternAnalysis.accuracyAnalysis;
        const dailyAnalysis = patternAnalysis.dailyAnalysis;
        
        return {
            improvementRate: accuracyAnalysis.improvementRate,
            consistency: dailyAnalysis.consistency,
            averageDailyQuestions: dailyAnalysis.averageDailyQuestions
        };
    }
    
    // 목표 추론
    inferGoals(patternAnalysis) {
        const accuracyAnalysis = patternAnalysis.accuracyAnalysis;
        const categoryAnalysis = patternAnalysis.categoryAnalysis;
        
        const goals = [];
        
        if (accuracyAnalysis.overallTrend === 'improving') {
            goals.push('maintain_improvement');
        }
        
        if (categoryAnalysis.weakestCategory) {
            goals.push(`improve_${categoryAnalysis.weakestCategory}`);
        }
        
        return goals;
    }
    
    // 난이도 계산
    calculateDifficulty(quizData) {
        // 실제 구현에서는 문제의 복잡도, 정답률 등을 고려
        return Math.random() > 0.5 ? 'hard' : 'medium';
    }
    
    // 유사 사용자 찾기
    findSimilarUsers() {
        // 실제 구현에서는 사용자 데이터베이스에서 유사한 패턴을 가진 사용자들을 찾음
        return [
            { id: 'user1', similarity: 0.85 },
            { id: 'user2', similarity: 0.72 },
            { id: 'user3', similarity: 0.68 }
        ];
    }
    
    // 랜덤 카테고리 반환
    getRandomCategory() {
        const categories = ['06재산보험', '07특종보험', '08배상책임보험', '09해상보험'];
        return categories[Math.floor(Math.random() * categories.length)];
    }
    
    // 정확도 예측
    predictAccuracy(score, userProfile) {
        // 실제 구현에서는 머신러닝 모델을 사용
        const baseAccuracy = score.accuracy || 50;
        const learningStyleBonus = userProfile.learningStyle === 'deep_learner' ? 10 : 0;
        return Math.min(100, baseAccuracy + learningStyleBonus + Math.random() * 20);
    }
    
    // 추천 결과 결합
    combineRecommendations(recommendationLists) {
        const combined = [];
        const seen = new Set();
        
        recommendationLists.forEach(list => {
            list.forEach(item => {
                if (!seen.has(item.questionId)) {
                    combined.push(item);
                    seen.add(item.questionId);
                }
            });
        });
        
        return combined.sort((a, b) => b.confidence - a.confidence).slice(0, 10);
    }
    
    // 포커스 카테고리 식별
    identifyFocusCategory(preferences, userProfile) {
        const weaknesses = userProfile.weaknesses || [];
        if (weaknesses.length > 0) {
            return weaknesses[0];
        }
        
        const categories = Object.keys(preferences);
        if (categories.length > 0) {
            return categories.reduce((min, cat) => 
                preferences[cat].averageAccuracy < preferences[min].averageAccuracy ? cat : min
            );
        }
        
        return null;
    }
    
    // 균형 잡힌 카테고리 제안
    suggestBalancedCategories(preferences) {
        const categories = Object.keys(preferences);
        const avgAccuracy = categories.reduce((sum, cat) => 
            sum + preferences[cat].averageAccuracy, 0) / categories.length;
        
        return categories.filter(cat => 
            Math.abs(preferences[cat].averageAccuracy - avgAccuracy) < 10
        );
    }
    
    // 개선이 필요한 카테고리 식별
    identifyImprovementCategories(preferences) {
        return Object.keys(preferences).filter(cat => 
            preferences[cat].averageAccuracy < 70
        );
    }
    
    // 숙달된 카테고리 식별
    identifyMasteryCategories(preferences) {
        return Object.keys(preferences).filter(cat => 
            preferences[cat].averageAccuracy > 90
        );
    }
    
    // 다음 단계 제안
    suggestNextSteps(preferences, userProfile) {
        const steps = [];
        
        if (userProfile.weaknesses && userProfile.weaknesses.length > 0) {
            steps.push(`Focus on ${userProfile.weaknesses[0]}`);
        }
        
        if (userProfile.goals && userProfile.goals.includes('maintain_improvement')) {
            steps.push('Continue current learning pattern');
        }
        
        return steps;
    }
    
    // 현재 수준 평가
    assessCurrentLevel(userProfile, questionScores) {
        const accuracies = Object.values(questionScores).map(q => q.accuracy);
        const avgAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
        
        if (avgAccuracy > 90) return 'expert';
        if (avgAccuracy > 80) return 'advanced';
        if (avgAccuracy > 70) return 'intermediate';
        if (avgAccuracy > 60) return 'beginner';
        return 'novice';
    }
    
    // 최적 수준 제안
    suggestOptimalLevel(userProfile, questionScores) {
        const currentLevel = this.assessCurrentLevel(userProfile, questionScores);
        const levelMap = {
            'novice': 'beginner',
            'beginner': 'intermediate',
            'intermediate': 'advanced',
            'advanced': 'expert',
            'expert': 'expert'
        };
        
        return levelMap[currentLevel] || 'intermediate';
    }
    
    // 진행 경로 생성
    createProgressionPath(userProfile, questionScores) {
        const currentLevel = this.assessCurrentLevel(userProfile, questionScores);
        const levels = ['novice', 'beginner', 'intermediate', 'advanced', 'expert'];
        const currentIndex = levels.indexOf(currentLevel);
        
        return levels.slice(currentIndex + 1);
    }
    
    // 도전 수준 제안
    suggestChallengeLevel(userProfile, questionScores) {
        const currentLevel = this.assessCurrentLevel(userProfile, questionScores);
        const levels = ['novice', 'beginner', 'intermediate', 'advanced', 'expert'];
        const currentIndex = levels.indexOf(currentLevel);
        
        return levels[Math.min(currentIndex + 2, levels.length - 1)];
    }
    
    // 복습 수준 제안
    suggestReviewLevel(userProfile, questionScores) {
        const currentLevel = this.assessCurrentLevel(userProfile, questionScores);
        const levels = ['novice', 'beginner', 'intermediate', 'advanced', 'expert'];
        const currentIndex = levels.indexOf(currentLevel);
        
        return levels[Math.max(currentIndex - 1, 0)];
    }
    
    // 단기 경로 생성
    createShortTermPath(userProfile, preferences) {
        return {
            duration: '1-2 weeks',
            focus: userProfile.weaknesses?.[0] || 'general_improvement',
            targetQuestions: 50,
            expectedImprovement: '5-10%'
        };
    }
    
    // 중기 경로 생성
    createMediumTermPath(userProfile, preferences) {
        return {
            duration: '1-2 months',
            focus: 'balanced_development',
            targetQuestions: 200,
            expectedImprovement: '15-25%'
        };
    }
    
    // 장기 경로 생성
    createLongTermPath(userProfile, preferences) {
        return {
            duration: '3-6 months',
            focus: 'mastery_achievement',
            targetQuestions: 500,
            expectedImprovement: '30-50%'
        };
    }
    
    // 적응형 경로 생성
    createAdaptivePath(userProfile, preferences) {
        return {
            duration: 'flexible',
            focus: 'adaptive_learning',
            targetQuestions: 'dynamic',
            expectedImprovement: 'continuous'
        };
    }
    
    // 마일스톤 경로 생성
    createMilestonePath(userProfile, preferences) {
        return {
            milestones: [
                { name: 'Basic Mastery', target: '70% accuracy' },
                { name: 'Advanced Level', target: '85% accuracy' },
                { name: 'Expert Level', target: '95% accuracy' }
            ]
        };
    }
    
    // 실시간 조정 계산
    calculateRealTimeAdjustments(userProfile, recentHistory) {
        return {
            difficultyAdjustment: Math.random() > 0.5 ? 'increase' : 'decrease',
            categoryAdjustment: 'focus_on_weakest',
            paceAdjustment: 'maintain_current'
        };
    }
    
    // 성과 기반 추천 생성
    generatePerformanceBasedRecommendations(userProfile) {
        return {
            highPerformers: 'challenge_with_harder_questions',
            lowPerformers: 'focus_on_basics',
            improving: 'maintain_momentum',
            declining: 'review_fundamentals'
        };
    }
    
    // 시간 기반 추천 생성
    generateTimeBasedRecommendations(userProfile) {
        return {
            morning: 'focus_on_new_concepts',
            afternoon: 'practice_applications',
            evening: 'review_and_consolidate',
            weekend: 'comprehensive_review'
        };
    }
    
    // 기분 기반 추천 생성
    generateMoodBasedRecommendations(userProfile) {
        return {
            energetic: 'challenge_problems',
            tired: 'review_easy_problems',
            stressed: 'familiar_problems',
            focused: 'complex_problems'
        };
    }
    
    // 상황 인식 추천 생성
    generateContextAwareRecommendations(userProfile) {
        return {
            shortTime: 'quick_review',
            longTime: 'deep_learning',
            examNear: 'exam_preparation',
            relaxed: 'exploration_learning'
        };
    }
    
    // 고우선순위 항목 식별
    identifyHighPriorityItems(userProfile, questionScores, preferences) {
        const highPriority = [];
        
        if (userProfile.weaknesses && userProfile.weaknesses.length > 0) {
            highPriority.push({
                type: 'category',
                item: userProfile.weaknesses[0],
                reason: '가장 약한 카테고리',
                priority: 'high'
            });
        }
        
        return highPriority;
    }
    
    // 중우선순위 항목 식별
    identifyMediumPriorityItems(userProfile, questionScores, preferences) {
        return [
            {
                type: 'skill',
                item: 'problem_solving_speed',
                reason: '문제 해결 속도 개선',
                priority: 'medium'
            }
        ];
    }
    
    // 저우선순위 항목 식별
    identifyLowPriorityItems(userProfile, questionScores, preferences) {
        return [
            {
                type: 'skill',
                item: 'advanced_techniques',
                reason: '고급 기법 학습',
                priority: 'low'
            }
        ];
    }
    
    // 긴급 항목 식별
    identifyUrgentItems(userProfile, questionScores, preferences) {
        const urgent = [];
        
        if (userProfile.accuracyAnalysis?.overallTrend === 'declining') {
            urgent.push({
                type: 'performance',
                item: 'accuracy_decline',
                reason: '정확도 감소 중',
                priority: 'urgent'
            });
        }
        
        return urgent;
    }
    
    // 전략적 항목 식별
    identifyStrategicItems(userProfile, questionScores, preferences) {
        return [
            {
                type: 'strategy',
                item: 'exam_preparation',
                reason: '시험 준비',
                priority: 'strategic'
            }
        ];
    }

    /**
     * 추천 결과 이벤트 발생
     */
    dispatchRecommendationEvent(recommendations) {
        const event = new CustomEvent('recommendationsGenerated', {
            detail: recommendations
        });
        document.dispatchEvent(event);
        console.log('✅ 추천 결과 이벤트 발생');
    }

    /**
     * 추천 데이터 저장
     */
    saveRecommendationData() {
        try {
            localStorage.setItem('aicu_recommendations', JSON.stringify(this.recommendationData));
            console.log('✅ 추천 데이터 저장 완료');
        } catch (error) {
            console.error('❌ 추천 데이터 저장 실패:', error);
        }
    }

    /**
     * 추천 결과 조회
     */
    getRecommendations() {
        return this.recommendationData.recommendationHistory.slice(-1)[0]?.recommendations || null;
    }

    /**
     * 사용자 프로필 조회
     */
    getUserProfile() {
        return this.recommendationData.userProfile;
    }

    /**
     * 시스템 상태 확인
     */
    getSystemStatus() {
        return {
            isInitialized: this.isInitialized,
            totalRecommendations: this.recommendationData.recommendationHistory.length,
            lastUpdated: this.recommendationData.lastUpdated,
            userProfile: !!this.recommendationData.userProfile
        };
    }
}

// 전역 인스턴스 생성
window.personalizedRecommendationSystem = new PersonalizedRecommendationSystem();
