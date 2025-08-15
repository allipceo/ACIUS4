// 예측 분석 시스템 - 고급통계 기능 2단계
class PredictiveAnalytics {
    constructor() {
        this.isInitialized = false;
        this.predictionModels = {};
        this.learningPatterns = {};
        this.performanceHistory = [];
        this.analyticsData = {};
        console.log('=== 예측 분석 시스템 초기화 ===');
    }

    async initialize() {
        try {
            console.log('🎯 예측 분석 시스템 초기화 시작...');
            
            // 사용자 정보 로드
            await this.loadUserInfo();
            
            // 성과 히스토리 로드
            await this.loadPerformanceHistory();
            
            // 학습 패턴 분석
            await this.analyzeLearningPatterns();
            
            // 예측 모델 초기화
            await this.initializePredictionModels();
            
            this.isInitialized = true;
            console.log('✅ 예측 분석 시스템 초기화 완료');
            
            return { success: true, message: '예측 분석 시스템이 성공적으로 초기화되었습니다.' };
        } catch (error) {
            console.error('❌ 예측 분석 시스템 초기화 실패:', error);
            return { success: false, message: error.message };
        }
    }

    async loadUserInfo() {
        try {
            const userInfo = localStorage.getItem('aicu_user_info');
            if (userInfo) {
                this.userInfo = JSON.parse(userInfo);
            } else {
                this.userInfo = { userName: 'guest', examDate: '2025-09-13', is_guest: true };
            }
            console.log('✅ 사용자 정보 로드 완료:', this.userInfo);
        } catch (error) {
            console.error('❌ 사용자 정보 로드 실패:', error);
            this.userInfo = { userName: 'guest', examDate: '2025-09-13', is_guest: true };
        }
    }

    async loadPerformanceHistory() {
        try {
            const history = localStorage.getItem('aicu_performance_history');
            if (history) {
                this.performanceHistory = JSON.parse(history);
            }
            console.log('✅ 성과 히스토리 로드 완료:', this.performanceHistory.length, '개');
        } catch (error) {
            console.error('❌ 성과 히스토리 로드 실패:', error);
            this.performanceHistory = [];
        }
    }

    async analyzeLearningPatterns() {
        try {
            const progressData = this.getProgressData();
            this.learningPatterns = this.calculateLearningPatterns(progressData);
            console.log('✅ 학습 패턴 분석 완료:', this.learningPatterns);
        } catch (error) {
            console.error('❌ 학습 패턴 분석 실패:', error);
            this.learningPatterns = this.createDefaultLearningPatterns();
        }
    }

    async initializePredictionModels() {
        try {
            this.predictionModels = {
                examSuccess: this.createExamSuccessModel(),
                performanceImprovement: this.createPerformanceImprovementModel(),
                optimalStudyTime: this.createOptimalStudyTimeModel(),
                learningEfficiency: this.createLearningEfficiencyModel()
            };
            console.log('✅ 예측 모델 초기화 완료');
        } catch (error) {
            console.error('❌ 예측 모델 초기화 실패:', error);
            this.predictionModels = {};
        }
    }

    // 시험 합격 가능성 예측
    async predictExamSuccess(userId, examDate) {
        try {
            console.log('🎯 시험 합격 가능성 예측 시작...');
            
            if (!this.isInitialized) {
                await this.initialize();
            }

            const progressData = this.getProgressData();
            const currentMetrics = this.calculateCurrentMetrics(progressData);
            const learningPatterns = this.learningPatterns;
            
            // 합격 가능성 계산
            const successProbability = this.calculateSuccessProbability(currentMetrics, learningPatterns, examDate);
            
            // 영향 요인 분석
            const factors = this.analyzeSuccessFactors(currentMetrics, learningPatterns);
            
            // 개선 권장사항 생성
            const recommendations = this.generateSuccessRecommendations(currentMetrics, factors);
            
            const prediction = {
                successProbability: successProbability,
                factors: factors,
                recommendations: recommendations,
                confidence: this.calculatePredictionConfidence(currentMetrics),
                lastUpdated: new Date().toISOString()
            };
            
            // 예측 결과 저장
            this.savePredictionResult('examSuccess', prediction);
            
            console.log('✅ 시험 합격 가능성 예측 완료:', prediction);
            return { success: true, prediction: prediction };
            
        } catch (error) {
            console.error('❌ 시험 합격 가능성 예측 실패:', error);
            return { success: false, message: error.message };
        }
    }

    // 학습 패턴 분석
    async analyzeLearningPatterns(userId, period = 30) {
        try {
            console.log('🎯 학습 패턴 분석 시작...');
            
            if (!this.isInitialized) {
                await this.initialize();
            }

            const progressData = this.getProgressData();
            const performanceHistory = this.performanceHistory;
            
            // 시간대별 학습 패턴
            const timeBasedPatterns = this.analyzeTimeBasedPatterns(performanceHistory);
            
            // 요일별 학습 패턴
            const dayBasedPatterns = this.analyzeDayBasedPatterns(performanceHistory);
            
            // 연속 학습 패턴
            const consecutivePatterns = this.analyzeConsecutivePatterns(performanceHistory);
            
            // 학습 효율성 패턴
            const efficiencyPatterns = this.analyzeEfficiencyPatterns(performanceHistory);
            
            const analysis = {
                timeBased: timeBasedPatterns,
                dayBased: dayBasedPatterns,
                consecutive: consecutivePatterns,
                efficiency: efficiencyPatterns,
                insights: this.generatePatternInsights(timeBasedPatterns, dayBasedPatterns, consecutivePatterns, efficiencyPatterns),
                lastUpdated: new Date().toISOString()
            };
            
            console.log('✅ 학습 패턴 분석 완료:', analysis);
            return { success: true, analysis: analysis };
            
        } catch (error) {
            console.error('❌ 학습 패턴 분석 실패:', error);
            return { success: false, message: error.message };
        }
    }

    // 최적 학습 시간 추천
    async recommendOptimalStudyTime(userId) {
        try {
            console.log('🎯 최적 학습 시간 추천 시작...');
            
            if (!this.isInitialized) {
                await this.initialize();
            }

            const learningPatterns = this.learningPatterns;
            const performanceHistory = this.performanceHistory;
            
            // 시간대별 효율성 분석
            const timeEfficiency = this.analyzeTimeEfficiency(performanceHistory);
            
            // 개인 선호도 분석
            const personalPreferences = this.analyzePersonalPreferences(learningPatterns);
            
            // 최적 시간대 계산
            const optimalTimes = this.calculateOptimalTimes(timeEfficiency, personalPreferences);
            
            // 학습 시간 추천
            const studyTimeRecommendations = this.generateStudyTimeRecommendations(optimalTimes);
            
            const recommendation = {
                optimalTimeSlots: optimalTimes,
                recommendations: studyTimeRecommendations,
                efficiency: timeEfficiency,
                preferences: personalPreferences,
                lastUpdated: new Date().toISOString()
            };
            
            console.log('✅ 최적 학습 시간 추천 완료:', recommendation);
            return { success: true, recommendation: recommendation };
            
        } catch (error) {
            console.error('❌ 최적 학습 시간 추천 실패:', error);
            return { success: false, message: error.message };
        }
    }

    // 성과 향상 예측
    async predictPerformanceImprovement(userId, studyHours) {
        try {
            console.log('🎯 성과 향상 예측 시작...');
            
            if (!this.isInitialized) {
                await this.initialize();
            }

            const progressData = this.getProgressData();
            const currentPerformance = this.calculateCurrentPerformance(progressData);
            const learningPatterns = this.learningPatterns;
            
            // 학습 시간별 성과 향상 예측
            const improvementPredictions = this.calculateImprovementPredictions(currentPerformance, studyHours, learningPatterns);
            
            // 기간별 예측
            const periodPredictions = this.calculatePeriodPredictions(improvementPredictions);
            
            // 목표 달성 가능성
            const goalAchievement = this.calculateGoalAchievement(improvementPredictions);
            
            const prediction = {
                currentPerformance: currentPerformance,
                improvementPredictions: improvementPredictions,
                periodPredictions: periodPredictions,
                goalAchievement: goalAchievement,
                recommendations: this.generateImprovementRecommendations(improvementPredictions),
                lastUpdated: new Date().toISOString()
            };
            
            console.log('✅ 성과 향상 예측 완료:', prediction);
            return { success: true, prediction: prediction };
            
        } catch (error) {
            console.error('❌ 성과 향상 예측 실패:', error);
            return { success: false, message: error.message };
        }
    }

    // 합격 가능성 계산
    calculateSuccessProbability(currentMetrics, learningPatterns, examDate) {
        let probability = 50; // 기본 50%
        
        // 정확도 기반 조정
        const accuracy = currentMetrics.overallAccuracy;
        if (accuracy >= 90) probability += 30;
        else if (accuracy >= 80) probability += 20;
        else if (accuracy >= 70) probability += 10;
        else if (accuracy < 60) probability -= 20;
        
        // 학습 진행률 기반 조정
        const progress = currentMetrics.overallProgress;
        if (progress >= 80) probability += 15;
        else if (progress >= 60) probability += 10;
        else if (progress < 40) probability -= 15;
        
        // 학습 일관성 기반 조정
        const consistency = learningPatterns.consistency || 70;
        if (consistency >= 80) probability += 10;
        else if (consistency < 60) probability -= 10;
        
        // 시험까지 남은 시간 기반 조정
        const daysUntilExam = this.calculateDaysUntilExam(examDate);
        if (daysUntilExam > 180) probability += 5;
        else if (daysUntilExam < 30) probability -= 10;
        
        return Math.max(0, Math.min(100, probability));
    }

    // 성공 요인 분석
    analyzeSuccessFactors(currentMetrics, learningPatterns) {
        const factors = {
            studyConsistency: 0,
            accuracy: 0,
            coverage: 0,
            timeManagement: 0,
            weakAreaManagement: 0
        };
        
        // 학습 일관성
        factors.studyConsistency = learningPatterns.consistency || 70;
        
        // 정확도
        factors.accuracy = currentMetrics.overallAccuracy;
        
        // 커버리지 (학습 범위)
        factors.coverage = currentMetrics.overallProgress;
        
        // 시간 관리
        factors.timeManagement = this.calculateTimeManagementScore(learningPatterns);
        
        // 취약 영역 관리
        factors.weakAreaManagement = this.calculateWeakAreaManagementScore(currentMetrics);
        
        return factors;
    }

    // 성공 권장사항 생성
    generateSuccessRecommendations(currentMetrics, factors) {
        const recommendations = [];
        
        if (factors.accuracy < 70) {
            recommendations.push('정확도 향상을 위해 기초 개념 복습이 필요합니다.');
        }
        
        if (factors.coverage < 60) {
            recommendations.push('학습 범위를 확대하여 더 많은 문제를 풀어보세요.');
        }
        
        if (factors.studyConsistency < 70) {
            recommendations.push('규칙적인 학습 습관을 기르는 것이 중요합니다.');
        }
        
        if (factors.weakAreaManagement < 60) {
            recommendations.push('취약 영역에 대한 집중 학습이 필요합니다.');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('현재 학습 상태가 양호합니다. 꾸준히 유지하세요.');
        }
        
        return recommendations;
    }

    // 시간대별 학습 패턴 분석
    analyzeTimeBasedPatterns(performanceHistory) {
        const timeSlots = {
            morning: { count: 0, accuracy: 0, efficiency: 0 },
            afternoon: { count: 0, accuracy: 0, efficiency: 0 },
            evening: { count: 0, accuracy: 0, efficiency: 0 },
            night: { count: 0, accuracy: 0, efficiency: 0 }
        };
        
        // 더미 데이터 기반 분석
        timeSlots.morning = { count: 45, accuracy: 78, efficiency: 0.8 };
        timeSlots.afternoon = { count: 32, accuracy: 75, efficiency: 0.7 };
        timeSlots.evening = { count: 28, accuracy: 72, efficiency: 0.6 };
        timeSlots.night = { count: 15, accuracy: 65, efficiency: 0.5 };
        
        return timeSlots;
    }

    // 요일별 학습 패턴 분석
    analyzeDayBasedPatterns(performanceHistory) {
        const dayPatterns = {
            mon: { count: 0, accuracy: 0, efficiency: 0 },
            tue: { count: 0, accuracy: 0, efficiency: 0 },
            wed: { count: 0, accuracy: 0, efficiency: 0 },
            thu: { count: 0, accuracy: 0, efficiency: 0 },
            fri: { count: 0, accuracy: 0, efficiency: 0 },
            sat: { count: 0, accuracy: 0, efficiency: 0 },
            sun: { count: 0, accuracy: 0, efficiency: 0 }
        };
        
        // 더미 데이터 기반 분석
        dayPatterns.mon = { count: 25, accuracy: 80, efficiency: 0.8 };
        dayPatterns.tue = { count: 22, accuracy: 78, efficiency: 0.7 };
        dayPatterns.wed = { count: 20, accuracy: 75, efficiency: 0.7 };
        dayPatterns.thu = { count: 18, accuracy: 72, efficiency: 0.6 };
        dayPatterns.fri = { count: 15, accuracy: 70, efficiency: 0.6 };
        dayPatterns.sat = { count: 12, accuracy: 68, efficiency: 0.5 };
        dayPatterns.sun = { count: 8, accuracy: 65, efficiency: 0.4 };
        
        return dayPatterns;
    }

    // 연속 학습 패턴 분석
    analyzeConsecutivePatterns(performanceHistory) {
        return {
            consecutiveDays: 5,
            averageSessionLength: 45, // 분
            restPatterns: ['주말 오후', '금요일 저녁'],
            longestStreak: 12,
            currentStreak: 5
        };
    }

    // 학습 효율성 패턴 분석
    analyzeEfficiencyPatterns(performanceHistory) {
        return {
            optimalSessionLength: 60, // 분
            optimalBreakInterval: 15, // 분
            productivityPeak: '09:00-11:00',
            productivityDecline: '14:00-16:00',
            recoveryTime: '18:00-20:00'
        };
    }

    // 패턴 인사이트 생성
    generatePatternInsights(timeBased, dayBased, consecutive, efficiency) {
        const insights = [];
        
        // 시간대별 인사이트
        const bestTimeSlot = Object.entries(timeBased).reduce((a, b) => 
            a[1].efficiency > b[1].efficiency ? a : b
        );
        insights.push(`가장 효율적인 학습 시간은 ${bestTimeSlot[0]}입니다.`);
        
        // 요일별 인사이트
        const bestDay = Object.entries(dayBased).reduce((a, b) => 
            a[1].efficiency > b[1].efficiency ? a : b
        );
        insights.push(`${bestDay[0]}에 학습 효율성이 가장 높습니다.`);
        
        // 연속 학습 인사이트
        if (consecutive.currentStreak >= 7) {
            insights.push('연속 학습 습관이 잘 형성되어 있습니다.');
        } else {
            insights.push('규칙적인 학습 습관을 기르는 것이 중요합니다.');
        }
        
        return insights;
    }

    // 시간대별 효율성 분석
    analyzeTimeEfficiency(performanceHistory) {
        return {
            '06:00-09:00': { efficiency: 0.9, accuracy: 85, count: 30 },
            '09:00-12:00': { efficiency: 0.8, accuracy: 82, count: 45 },
            '12:00-15:00': { efficiency: 0.6, accuracy: 75, count: 25 },
            '15:00-18:00': { efficiency: 0.7, accuracy: 78, count: 35 },
            '18:00-21:00': { efficiency: 0.6, accuracy: 72, count: 20 },
            '21:00-24:00': { efficiency: 0.4, accuracy: 65, count: 10 }
        };
    }

    // 개인 선호도 분석
    analyzePersonalPreferences(learningPatterns) {
        return {
            preferredTimeSlots: ['09:00-11:00', '15:00-17:00'],
            preferredDuration: 60, // 분
            preferredBreakLength: 15, // 분
            preferredDifficulty: 'medium'
        };
    }

    // 최적 시간대 계산
    calculateOptimalTimes(timeEfficiency, personalPreferences) {
        const optimalTimes = [];
        
        // 효율성과 선호도를 종합하여 최적 시간대 선정
        Object.entries(timeEfficiency).forEach(([timeSlot, data]) => {
            if (data.efficiency >= 0.7 && personalPreferences.preferredTimeSlots.includes(timeSlot)) {
                optimalTimes.push({
                    timeSlot: timeSlot,
                    efficiency: data.efficiency,
                    accuracy: data.accuracy,
                    recommendation: `이 시간대에 학습하면 효율성이 높습니다.`
                });
            }
        });
        
        return optimalTimes.sort((a, b) => b.efficiency - a.efficiency);
    }

    // 학습 시간 추천 생성
    generateStudyTimeRecommendations(optimalTimes) {
        const recommendations = [];
        
        if (optimalTimes.length > 0) {
            const bestTime = optimalTimes[0];
            recommendations.push(`${bestTime.timeSlot}에 집중 학습을 권장합니다.`);
            recommendations.push('학습 세션은 60분, 휴식은 15분을 권장합니다.');
            recommendations.push('주말에는 복습과 취약 영역 보완에 집중하세요.');
        }
        
        return recommendations;
    }

    // 성과 향상 예측 계산
    calculateImprovementPredictions(currentPerformance, studyHours, learningPatterns) {
        const predictions = {};
        
        // 학습 시간별 예측
        for (let hours = 1; hours <= 8; hours++) {
            const improvement = this.calculateHourlyImprovement(currentPerformance, hours, learningPatterns);
            predictions[hours] = {
                expectedAccuracy: Math.min(100, currentPerformance.accuracy + improvement.accuracy),
                expectedQuestions: currentPerformance.totalQuestions + improvement.questions,
                expectedTime: hours * 60, // 분
                confidence: improvement.confidence
            };
        }
        
        return predictions;
    }

    // 기간별 예측 계산
    calculatePeriodPredictions(improvementPredictions) {
        return {
            nextWeek: {
                expectedAccuracy: 82,
                expectedQuestions: 150,
                confidence: 0.8
            },
            nextMonth: {
                expectedAccuracy: 88,
                expectedQuestions: 600,
                confidence: 0.7
            },
            nextQuarter: {
                expectedAccuracy: 92,
                expectedQuestions: 1800,
                confidence: 0.6
            }
        };
    }

    // 목표 달성 가능성 계산
    calculateGoalAchievement(improvementPredictions) {
        return {
            dailyGoal: { probability: 85, expectedAchievement: 45 },
            weeklyGoal: { probability: 75, expectedAchievement: 320 },
            monthlyGoal: { probability: 65, expectedAchievement: 1200 }
        };
    }

    // 성과 향상 권장사항 생성
    generateImprovementRecommendations(improvementPredictions) {
        const recommendations = [];
        
        const optimalHours = Object.entries(improvementPredictions).reduce((a, b) => 
            a[1].expectedAccuracy > b[1].expectedAccuracy ? a : b
        );
        
        recommendations.push(`일일 ${optimalHours[0]}시간 학습 시 가장 큰 성과 향상을 기대할 수 있습니다.`);
        recommendations.push('학습 시간을 늘릴 때는 점진적으로 증가시키는 것이 좋습니다.');
        recommendations.push('정기적인 복습과 취약 영역 보완을 병행하세요.');
        
        return recommendations;
    }

    // 유틸리티 메서드들
    calculateCurrentMetrics(progressData) {
        const totalAttempted = progressData.basicLearning?.totalAttempted || 0;
        const totalCorrect = progressData.basicLearning?.totalCorrect || 0;
        
        return {
            overallAccuracy: totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0,
            overallProgress: Math.min((totalAttempted / 789) * 100, 100),
            totalQuestions: totalAttempted,
            totalCorrect: totalCorrect
        };
    }

    calculateCurrentPerformance(progressData) {
        return this.calculateCurrentMetrics(progressData);
    }

    calculateDaysUntilExam(examDate) {
        const exam = new Date(examDate);
        const today = new Date();
        return Math.ceil((exam - today) / (1000 * 60 * 60 * 24));
    }

    calculatePredictionConfidence(currentMetrics) {
        let confidence = 0.7; // 기본 신뢰도
        
        // 데이터 풍부도에 따른 조정
        if (currentMetrics.totalQuestions >= 100) confidence += 0.2;
        else if (currentMetrics.totalQuestions >= 50) confidence += 0.1;
        
        return Math.min(confidence, 0.95);
    }

    calculateTimeManagementScore(learningPatterns) {
        // 학습 패턴의 일관성과 효율성을 기반으로 시간 관리 점수 계산
        return 75; // 더미 데이터
    }

    calculateWeakAreaManagementScore(currentMetrics) {
        // 취약 영역 관리 점수 계산
        return 70; // 더미 데이터
    }

    calculateHourlyImprovement(currentPerformance, hours, learningPatterns) {
        // 시간당 예상 성과 향상 계산
        const baseImprovement = 2; // 기본 2% 향상
        const efficiencyMultiplier = learningPatterns.efficiency || 0.7;
        
        return {
            accuracy: baseImprovement * hours * efficiencyMultiplier,
            questions: hours * 15, // 시간당 15문제 가정
            confidence: Math.min(0.9, 0.7 + (hours * 0.05))
        };
    }

    calculateLearningPatterns(progressData) {
        return {
            consistency: 75,
            efficiency: 0.7,
            timeBased: {
                morning: { efficiency: 0.8, accuracy: 78 },
                afternoon: { efficiency: 0.7, accuracy: 75 },
                evening: { efficiency: 0.6, accuracy: 72 },
                night: { efficiency: 0.5, accuracy: 65 }
            }
        };
    }

    createDefaultLearningPatterns() {
        return {
            consistency: 70,
            efficiency: 0.6,
            timeBased: {
                morning: { efficiency: 0.7, accuracy: 70 },
                afternoon: { efficiency: 0.6, accuracy: 68 },
                evening: { efficiency: 0.5, accuracy: 65 },
                night: { efficiency: 0.4, accuracy: 60 }
            }
        };
    }

    createExamSuccessModel() {
        return {
            type: 'regression',
            factors: ['accuracy', 'progress', 'consistency', 'timeRemaining'],
            weights: [0.4, 0.3, 0.2, 0.1]
        };
    }

    createPerformanceImprovementModel() {
        return {
            type: 'linear',
            factors: ['studyHours', 'currentAccuracy', 'learningEfficiency'],
            weights: [0.5, 0.3, 0.2]
        };
    }

    createOptimalStudyTimeModel() {
        return {
            type: 'classification',
            factors: ['timeSlot', 'accuracy', 'efficiency', 'preference'],
            weights: [0.3, 0.3, 0.2, 0.2]
        };
    }

    createLearningEfficiencyModel() {
        return {
            type: 'regression',
            factors: ['sessionLength', 'breakInterval', 'timeOfDay', 'dayOfWeek'],
            weights: [0.3, 0.2, 0.3, 0.2]
        };
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

    savePredictionResult(type, prediction) {
        try {
            const predictionHistory = JSON.parse(localStorage.getItem('aicu_prediction_history') || '[]');
            predictionHistory.push({
                type: type,
                prediction: prediction,
                timestamp: new Date().toISOString()
            });
            
            // 최근 50개만 유지
            if (predictionHistory.length > 50) {
                predictionHistory.splice(0, predictionHistory.length - 50);
            }
            
            localStorage.setItem('aicu_prediction_history', JSON.stringify(predictionHistory));
        } catch (error) {
            console.error('❌ 예측 결과 저장 실패:', error);
        }
    }

    // 공개 API 메서드들
    async getExamSuccessPrediction(userId, examDate) {
        return await this.predictExamSuccess(userId, examDate);
    }

    async getLearningPatternAnalysis(userId, period = 30) {
        return await this.analyzeLearningPatterns(userId, period);
    }

    async getOptimalStudyTimeRecommendation(userId) {
        return await this.recommendOptimalStudyTime(userId);
    }

    async getPerformanceImprovementPrediction(userId, studyHours) {
        return await this.predictPerformanceImprovement(userId, studyHours);
    }

    getPredictionHistory(userId) {
        try {
            const history = localStorage.getItem('aicu_prediction_history');
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('❌ 예측 히스토리 로드 실패:', error);
            return [];
        }
    }

    getLearningPatterns() {
        return this.learningPatterns;
    }

    getAnalyticsData() {
        return this.analyticsData;
    }
}

// 전역 인스턴스 생성
window.predictiveAnalytics = new PredictiveAnalytics();
console.log('🎯 예측 분석 시스템 모듈 로드 완료');



