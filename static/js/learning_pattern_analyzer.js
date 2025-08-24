// 학습 패턴 분석 관리자
// 파일: static/js/learning_pattern_analyzer.js

class LearningPatternAnalyzer {
    constructor() {
        this.isInitialized = false;
        this.patternData = {};
        this.analysisResults = {};
        this.init();
    }

    /**
     * 학습 패턴 분석 관리자 초기화
     */
    init() {
        console.log('=== 학습 패턴 분석 관리자 초기화 ===');
        
        try {
            // 기존 패턴 데이터 로드
            this.loadPatternData();
            
            // 이벤트 리스너 설정
            this.setupEventListeners();
            
            // 초기 분석 실행
            this.analyzeLearningPatterns();
            
            this.isInitialized = true;
            console.log('✅ 학습 패턴 분석 관리자 초기화 완료');
            
        } catch (error) {
            console.error('❌ 학습 패턴 분석 관리자 초기화 실패:', error);
        }
    }

    /**
     * 기존 패턴 데이터 로드
     */
    loadPatternData() {
        console.log('=== 기존 패턴 데이터 로드 ===');
        
        try {
            const savedData = localStorage.getItem('aicu_learning_patterns');
            if (savedData) {
                this.patternData = JSON.parse(savedData);
                console.log('✅ 기존 패턴 데이터 로드 완료:', this.patternData);
            } else {
                this.patternData = {
                    sessions: [],
                    dailyStats: {},
                    categoryPreferences: {},
                    timePatterns: {},
                    accuracyTrends: {},
                    lastUpdated: null
                };
                console.log('✅ 새로운 패턴 데이터 구조 생성');
            }
        } catch (error) {
            console.error('❌ 패턴 데이터 로드 실패:', error);
            this.patternData = {
                sessions: [],
                dailyStats: {},
                categoryPreferences: {},
                timePatterns: {},
                accuracyTrends: {},
                lastUpdated: null
            };
        }
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        console.log('=== 학습 패턴 이벤트 리스너 설정 ===');
        
        // 퀴즈 완료 이벤트 리스너
        document.addEventListener('quizCompleted', (event) => {
            console.log('📊 퀴즈 완료 이벤트 수신 (패턴 분석):', event.detail);
            this.recordQuizSession(event.detail);
        });
        
        // 학습 시작 이벤트 리스너
        document.addEventListener('quizStarted', (event) => {
            console.log('📊 학습 시작 이벤트 수신 (패턴 분석):', event.detail);
            this.recordLearningStart(event.detail);
        });
        
        // 카테고리 학습 시작 이벤트 리스너
        document.addEventListener('categoryLearningStarted', (event) => {
            console.log('📊 카테고리 학습 시작 이벤트 수신 (패턴 분석):', event.detail);
            this.recordCategoryPreference(event.detail);
        });
        
        // 페이지 포커스 이벤트 리스너 (학습 시간 추적)
        window.addEventListener('focus', () => {
            this.recordFocusTime();
        });
        
        // 주기적 분석 (5분마다)
        setInterval(() => {
            if (this.isInitialized) {
                console.log('📊 주기적 학습 패턴 분석 실행');
                this.analyzeLearningPatterns();
            }
        }, 300000); // 5분
        
        console.log('✅ 학습 패턴 이벤트 리스너 설정 완료');
    }

    /**
     * 퀴즈 세션 기록
     */
    recordQuizSession(quizData) {
        console.log('=== 퀴즈 세션 기록 ===');
        
        try {
            const session = {
                id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date().toISOString(),
                category: quizData.category || 'unknown',
                questionId: quizData.questionId,
                isCorrect: quizData.isCorrect,
                userAnswer: quizData.userAnswer,
                correctAnswer: quizData.correctAnswer,
                timeSpent: this.calculateTimeSpent(quizData.timestamp),
                sessionDuration: this.getCurrentSessionDuration()
            };
            
            this.patternData.sessions.push(session);
            
            // 일일 통계 업데이트
            this.updateDailyStats(session);
            
            // 카테고리 선호도 업데이트
            this.updateCategoryPreferences(session);
            
            // 시간 패턴 업데이트
            this.updateTimePatterns(session);
            
            // 정확도 트렌드 업데이트
            this.updateAccuracyTrends(session);
            
            // 데이터 저장
            this.savePatternData();
            
            console.log('✅ 퀴즈 세션 기록 완료:', session);
            
        } catch (error) {
            console.error('❌ 퀴즈 세션 기록 실패:', error);
        }
    }

    /**
     * 학습 시작 기록
     */
    recordLearningStart(learningData) {
        console.log('=== 학습 시작 기록 ===');
        
        try {
            const startSession = {
                id: `start_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date().toISOString(),
                category: learningData.category || 'unknown',
                mode: learningData.mode || 'unknown',
                startTime: Date.now()
            };
            
            // 현재 세션 시작 시간 저장
            this.patternData.currentSession = startSession;
            
            console.log('✅ 학습 시작 기록 완료:', startSession);
            
        } catch (error) {
            console.error('❌ 학습 시작 기록 실패:', error);
        }
    }

    /**
     * 카테고리 선호도 기록
     */
    recordCategoryPreference(categoryData) {
        console.log('=== 카테고리 선호도 기록 ===');
        
        try {
            const category = categoryData.category;
            
            if (!this.patternData.categoryPreferences[category]) {
                this.patternData.categoryPreferences[category] = {
                    visitCount: 0,
                    lastVisited: null,
                    averageAccuracy: 0,
                    totalQuestions: 0,
                    correctAnswers: 0
                };
            }
            
            this.patternData.categoryPreferences[category].visitCount += 1;
            this.patternData.categoryPreferences[category].lastVisited = new Date().toISOString();
            
            console.log('✅ 카테고리 선호도 기록 완료:', category);
            
        } catch (error) {
            console.error('❌ 카테고리 선호도 기록 실패:', error);
        }
    }

    /**
     * 포커스 시간 기록
     */
    recordFocusTime() {
        console.log('=== 포커스 시간 기록 ===');
        
        try {
            const now = new Date();
            const hour = now.getHours();
            const dayOfWeek = now.getDay();
            
            if (!this.patternData.timePatterns[dayOfWeek]) {
                this.patternData.timePatterns[dayOfWeek] = {};
            }
            
            if (!this.patternData.timePatterns[dayOfWeek][hour]) {
                this.patternData.timePatterns[dayOfWeek][hour] = 0;
            }
            
            this.patternData.timePatterns[dayOfWeek][hour] += 1;
            
            console.log('✅ 포커스 시간 기록 완료:', { dayOfWeek, hour });
            
        } catch (error) {
            console.error('❌ 포커스 시간 기록 실패:', error);
        }
    }

    /**
     * 일일 통계 업데이트
     */
    updateDailyStats(session) {
        const today = new Date().toISOString().split('T')[0];
        
        if (!this.patternData.dailyStats[today]) {
            this.patternData.dailyStats[today] = {
                totalQuestions: 0,
                correctAnswers: 0,
                accuracy: 0,
                categories: {},
                sessionCount: 0
            };
        }
        
        this.patternData.dailyStats[today].totalQuestions += 1;
        if (session.isCorrect) {
            this.patternData.dailyStats[today].correctAnswers += 1;
        }
        
        this.patternData.dailyStats[today].accuracy = 
            (this.patternData.dailyStats[today].correctAnswers / this.patternData.dailyStats[today].totalQuestions) * 100;
        
        // 카테고리별 통계
        if (!this.patternData.dailyStats[today].categories[session.category]) {
            this.patternData.dailyStats[today].categories[session.category] = {
                total: 0,
                correct: 0,
                accuracy: 0
            };
        }
        
        this.patternData.dailyStats[today].categories[session.category].total += 1;
        if (session.isCorrect) {
            this.patternData.dailyStats[today].categories[session.category].correct += 1;
        }
        
        this.patternData.dailyStats[today].categories[session.category].accuracy = 
            (this.patternData.dailyStats[today].categories[session.category].correct / 
             this.patternData.dailyStats[today].categories[session.category].total) * 100;
    }

    /**
     * 카테고리 선호도 업데이트
     */
    updateCategoryPreferences(session) {
        const category = session.category;
        
        if (!this.patternData.categoryPreferences[category]) {
            this.patternData.categoryPreferences[category] = {
                visitCount: 0,
                lastVisited: null,
                averageAccuracy: 0,
                totalQuestions: 0,
                correctAnswers: 0
            };
        }
        
        this.patternData.categoryPreferences[category].totalQuestions += 1;
        if (session.isCorrect) {
            this.patternData.categoryPreferences[category].correctAnswers += 1;
        }
        
        this.patternData.categoryPreferences[category].averageAccuracy = 
            (this.patternData.categoryPreferences[category].correctAnswers / 
             this.patternData.categoryPreferences[category].totalQuestions) * 100;
    }

    /**
     * 시간 패턴 업데이트
     */
    updateTimePatterns(session) {
        const timestamp = new Date(session.timestamp);
        const hour = timestamp.getHours();
        const dayOfWeek = timestamp.getDay();
        
        if (!this.patternData.timePatterns[dayOfWeek]) {
            this.patternData.timePatterns[dayOfWeek] = {};
        }
        
        if (!this.patternData.timePatterns[dayOfWeek][hour]) {
            this.patternData.timePatterns[dayOfWeek][hour] = 0;
        }
        
        this.patternData.timePatterns[dayOfWeek][hour] += 1;
    }

    /**
     * 정확도 트렌드 업데이트
     */
    updateAccuracyTrends(session) {
        const today = new Date().toISOString().split('T')[0];
        
        if (!this.patternData.accuracyTrends[today]) {
            this.patternData.accuracyTrends[today] = {
                total: 0,
                correct: 0,
                accuracy: 0,
                trend: 'stable'
            };
        }
        
        this.patternData.accuracyTrends[today].total += 1;
        if (session.isCorrect) {
            this.patternData.accuracyTrends[today].correct += 1;
        }
        
        this.patternData.accuracyTrends[today].accuracy = 
            (this.patternData.accuracyTrends[today].correct / this.patternData.accuracyTrends[today].total) * 100;
    }

    /**
     * 학습 패턴 분석 실행
     */
    analyzeLearningPatterns() {
        console.log('=== 학습 패턴 분석 실행 ===');
        
        try {
            const analysis = {
                timestamp: new Date().toISOString(),
                sessionAnalysis: this.analyzeSessions(),
                dailyAnalysis: this.analyzeDailyPatterns(),
                categoryAnalysis: this.analyzeCategoryPatterns(),
                timeAnalysis: this.analyzeTimePatterns(),
                accuracyAnalysis: this.analyzeAccuracyPatterns(),
                recommendations: this.generateRecommendations()
            };
            
            this.analysisResults = analysis;
            this.patternData.lastUpdated = new Date().toISOString();
            
            // 데이터 저장
            this.savePatternData();
            
            // 분석 결과 이벤트 발생
            this.dispatchAnalysisEvent(analysis);
            
            console.log('✅ 학습 패턴 분석 완료:', analysis);
            return analysis;
            
        } catch (error) {
            console.error('❌ 학습 패턴 분석 실패:', error);
            return null;
        }
    }

    /**
     * 세션 분석
     */
    analyzeSessions() {
        const sessions = this.patternData.sessions;
        const recentSessions = sessions.filter(s => {
            const sessionDate = new Date(s.timestamp);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return sessionDate > weekAgo;
        });
        
        return {
            totalSessions: sessions.length,
            recentSessions: recentSessions.length,
            averageSessionLength: this.calculateAverageSessionLength(sessions),
            mostActiveDay: this.findMostActiveDay(sessions),
            sessionFrequency: this.calculateSessionFrequency(sessions)
        };
    }

    /**
     * 일일 패턴 분석
     */
    analyzeDailyPatterns() {
        const dailyStats = this.patternData.dailyStats;
        const recentDays = Object.keys(dailyStats).slice(-7);
        
        return {
            recentDays: recentDays.length,
            averageDailyQuestions: this.calculateAverageDailyQuestions(dailyStats),
            bestDay: this.findBestDay(dailyStats),
            consistency: this.calculateConsistency(dailyStats)
        };
    }

    /**
     * 카테고리 패턴 분석
     */
    analyzeCategoryPatterns() {
        const preferences = this.patternData.categoryPreferences;
        
        return {
            favoriteCategory: this.findFavoriteCategory(preferences),
            weakestCategory: this.findWeakestCategory(preferences),
            categoryBalance: this.calculateCategoryBalance(preferences),
            improvementAreas: this.identifyImprovementAreas(preferences)
        };
    }

    /**
     * 시간 패턴 분석
     */
    analyzeTimePatterns() {
        const timePatterns = this.patternData.timePatterns;
        
        return {
            peakHours: this.findPeakHours(timePatterns),
            bestStudyTime: this.findBestStudyTime(timePatterns),
            weeklyPattern: this.analyzeWeeklyPattern(timePatterns),
            timeEfficiency: this.calculateTimeEfficiency(timePatterns)
        };
    }

    /**
     * 정확도 패턴 분석
     */
    analyzeAccuracyPatterns() {
        const accuracyTrends = this.patternData.accuracyTrends;
        
        return {
            overallTrend: this.calculateOverallTrend(accuracyTrends),
            improvementRate: this.calculateImprovementRate(accuracyTrends),
            consistency: this.calculateAccuracyConsistency(accuracyTrends),
            prediction: this.predictFutureAccuracy(accuracyTrends)
        };
    }

    /**
     * 학습 권장사항 생성
     */
    generateRecommendations() {
        const recommendations = [];
        
        // 카테고리별 권장사항
        const categoryAnalysis = this.analysisResults.categoryAnalysis;
        if (categoryAnalysis.weakestCategory) {
            recommendations.push({
                type: 'category',
                priority: 'high',
                message: `${categoryAnalysis.weakestCategory} 카테고리에 더 많은 시간을 투자하세요.`,
                action: `focus_on_${categoryAnalysis.weakestCategory}`
            });
        }
        
        // 시간 패턴 권장사항
        const timeAnalysis = this.analysisResults.timeAnalysis;
        if (timeAnalysis.bestStudyTime) {
            recommendations.push({
                type: 'time',
                priority: 'medium',
                message: `${timeAnalysis.bestStudyTime}에 학습하는 것이 가장 효율적입니다.`,
                action: 'schedule_study_time'
            });
        }
        
        // 정확도 권장사항
        const accuracyAnalysis = this.analysisResults.accuracyAnalysis;
        if (accuracyAnalysis.overallTrend === 'declining') {
            recommendations.push({
                type: 'accuracy',
                priority: 'high',
                message: '정확도가 감소하고 있습니다. 복습을 강화하세요.',
                action: 'increase_review'
            });
        }
        
        return recommendations;
    }

    /**
     * 분석 결과 이벤트 발생
     */
    dispatchAnalysisEvent(analysis) {
        const event = new CustomEvent('learningPatternAnalyzed', {
            detail: analysis
        });
        document.dispatchEvent(event);
        console.log('✅ 학습 패턴 분석 이벤트 발생');
    }

    /**
     * 패턴 데이터 저장
     */
    savePatternData() {
        try {
            localStorage.setItem('aicu_learning_patterns', JSON.stringify(this.patternData));
            console.log('✅ 패턴 데이터 저장 완료');
        } catch (error) {
            console.error('❌ 패턴 데이터 저장 실패:', error);
        }
    }

    /**
     * 유틸리티 함수들
     */
    calculateTimeSpent(startTimestamp) {
        const start = new Date(startTimestamp);
        const end = new Date();
        return Math.round((end - start) / 1000); // 초 단위
    }

    getCurrentSessionDuration() {
        if (this.patternData.currentSession) {
            const start = new Date(this.patternData.currentSession.startTime);
            const now = new Date();
            return Math.round((now - start) / 1000); // 초 단위
        }
        return 0;
    }

    calculateAverageSessionLength(sessions) {
        if (sessions.length === 0) return 0;
        const totalDuration = sessions.reduce((sum, session) => sum + (session.sessionDuration || 0), 0);
        return Math.round(totalDuration / sessions.length);
    }

    findMostActiveDay(sessions) {
        const dayCounts = {};
        sessions.forEach(session => {
            const day = new Date(session.timestamp).toLocaleDateString();
            dayCounts[day] = (dayCounts[day] || 0) + 1;
        });
        
        return Object.keys(dayCounts).reduce((a, b) => dayCounts[a] > dayCounts[b] ? a : b);
    }

    calculateSessionFrequency(sessions) {
        const recentSessions = sessions.filter(s => {
            const sessionDate = new Date(s.timestamp);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return sessionDate > weekAgo;
        });
        
        return recentSessions.length / 7; // 일일 평균 세션 수
    }

    calculateAverageDailyQuestions(dailyStats) {
        const days = Object.keys(dailyStats);
        if (days.length === 0) return 0;
        
        const totalQuestions = days.reduce((sum, day) => sum + dailyStats[day].totalQuestions, 0);
        return Math.round(totalQuestions / days.length);
    }

    findBestDay(dailyStats) {
        const days = Object.keys(dailyStats);
        if (days.length === 0) return null;
        
        return days.reduce((best, day) => {
            const currentAccuracy = dailyStats[day].accuracy;
            const bestAccuracy = dailyStats[best] ? dailyStats[best].accuracy : 0;
            return currentAccuracy > bestAccuracy ? day : best;
        });
    }

    calculateConsistency(dailyStats) {
        const accuracies = Object.values(dailyStats).map(day => day.accuracy);
        if (accuracies.length === 0) return 0;
        
        const mean = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
        const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - mean, 2), 0) / accuracies.length;
        const standardDeviation = Math.sqrt(variance);
        
        return Math.round((1 - standardDeviation / 100) * 100); // 일관성 점수 (0-100)
    }

    findFavoriteCategory(preferences) {
        const categories = Object.keys(preferences);
        if (categories.length === 0) return null;
        
        return categories.reduce((favorite, category) => {
            const currentVisits = preferences[category].visitCount;
            const favoriteVisits = preferences[favorite] ? preferences[favorite].visitCount : 0;
            return currentVisits > favoriteVisits ? category : favorite;
        });
    }

    findWeakestCategory(preferences) {
        const categories = Object.keys(preferences);
        if (categories.length === 0) return null;
        
        return categories.reduce((weakest, category) => {
            const currentAccuracy = preferences[category].averageAccuracy;
            const weakestAccuracy = preferences[weakest] ? preferences[weakest].averageAccuracy : 100;
            return currentAccuracy < weakestAccuracy ? category : weakest;
        });
    }

    calculateCategoryBalance(preferences) {
        const categories = Object.keys(preferences);
        if (categories.length === 0) return 0;
        
        const visitCounts = categories.map(cat => preferences[cat].visitCount);
        const mean = visitCounts.reduce((sum, count) => sum + count, 0) / visitCounts.length;
        const variance = visitCounts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / visitCounts.length;
        const standardDeviation = Math.sqrt(variance);
        
        return Math.round((1 - standardDeviation / mean) * 100); // 균형 점수 (0-100)
    }

    identifyImprovementAreas(preferences) {
        return Object.keys(preferences)
            .filter(category => preferences[category].averageAccuracy < 70)
            .sort((a, b) => preferences[a].averageAccuracy - preferences[b].averageAccuracy);
    }

    findPeakHours(timePatterns) {
        const allHours = {};
        Object.values(timePatterns).forEach(day => {
            Object.keys(day).forEach(hour => {
                allHours[hour] = (allHours[hour] || 0) + day[hour];
            });
        });
        
        return Object.keys(allHours)
            .sort((a, b) => allHours[b] - allHours[a])
            .slice(0, 3);
    }

    findBestStudyTime(timePatterns) {
        const allHours = {};
        Object.values(timePatterns).forEach(day => {
            Object.keys(day).forEach(hour => {
                allHours[hour] = (allHours[hour] || 0) + day[hour];
            });
        });
        
        const peakHour = Object.keys(allHours)
            .reduce((peak, hour) => allHours[hour] > allHours[peak] ? hour : peak);
        
        return `${peakHour}시`;
    }

    analyzeWeeklyPattern(timePatterns) {
        const weeklyStats = {};
        Object.keys(timePatterns).forEach(day => {
            const totalActivity = Object.values(timePatterns[day]).reduce((sum, count) => sum + count, 0);
            weeklyStats[day] = totalActivity;
        });
        
        return weeklyStats;
    }

    calculateTimeEfficiency(timePatterns) {
        const totalActivity = Object.values(timePatterns).reduce((sum, day) => {
            return sum + Object.values(day).reduce((daySum, count) => daySum + count, 0);
        }, 0);
        
        return Math.round(totalActivity / 7); // 일일 평균 활동량
    }

    calculateOverallTrend(accuracyTrends) {
        const days = Object.keys(accuracyTrends).sort();
        if (days.length < 2) return 'stable';
        
        const recentDays = days.slice(-3);
        const recentAccuracies = recentDays.map(day => accuracyTrends[day].accuracy);
        
        const firstHalf = recentAccuracies.slice(0, Math.ceil(recentAccuracies.length / 2));
        const secondHalf = recentAccuracies.slice(Math.ceil(recentAccuracies.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, acc) => sum + acc, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, acc) => sum + acc, 0) / secondHalf.length;
        
        if (secondAvg > firstAvg + 5) return 'improving';
        if (secondAvg < firstAvg - 5) return 'declining';
        return 'stable';
    }

    calculateImprovementRate(accuracyTrends) {
        const days = Object.keys(accuracyTrends).sort();
        if (days.length < 2) return 0;
        
        const firstAccuracy = accuracyTrends[days[0]].accuracy;
        const lastAccuracy = accuracyTrends[days[days.length - 1]].accuracy;
        
        return Math.round(lastAccuracy - firstAccuracy);
    }

    calculateAccuracyConsistency(accuracyTrends) {
        const accuracies = Object.values(accuracyTrends).map(day => day.accuracy);
        if (accuracies.length === 0) return 0;
        
        const mean = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
        const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - mean, 2), 0) / accuracies.length;
        const standardDeviation = Math.sqrt(variance);
        
        return Math.round((1 - standardDeviation / 100) * 100); // 일관성 점수 (0-100)
    }

    predictFutureAccuracy(accuracyTrends) {
        const days = Object.keys(accuracyTrends).sort();
        if (days.length < 3) return null;
        
        const recentAccuracies = days.slice(-3).map(day => accuracyTrends[day].accuracy);
        const trend = this.calculateOverallTrend(accuracyTrends);
        
        const currentAccuracy = recentAccuracies[recentAccuracies.length - 1];
        
        if (trend === 'improving') {
            return Math.min(100, currentAccuracy + 5);
        } else if (trend === 'declining') {
            return Math.max(0, currentAccuracy - 5);
        } else {
            return currentAccuracy;
        }
    }

    /**
     * 분석 결과 조회
     */
    getAnalysisResults() {
        return this.analysisResults;
    }

    /**
     * 패턴 데이터 조회
     */
    getPatternData() {
        return this.patternData;
    }

    /**
     * 시스템 상태 확인
     */
    getSystemStatus() {
        return {
            isInitialized: this.isInitialized,
            totalSessions: this.patternData.sessions.length,
            lastUpdated: this.patternData.lastUpdated,
            analysisResults: !!this.analysisResults
        };
    }
}

// 전역 인스턴스 생성
window.learningPatternAnalyzer = new LearningPatternAnalyzer();
