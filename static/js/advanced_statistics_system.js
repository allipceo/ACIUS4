// advanced_statistics_system.js - 고급 통계 시스템 (1단계)

class AdvancedStatisticsSystem {
    constructor() {
        this.isInitialized = false;
        this.basicSystem = null;
        this.advancedStats = null;
        
        console.log('=== 고급 통계 시스템 초기화 ===');
    }
    
    // 시스템 초기화
    async initialize() {
        try {
            console.log('🔧 고급 통계 시스템 초기화 시작...');
            
            // 기본 통계 시스템 확인
            if (!window.basicStatisticsSystem) {
                throw new Error('기본 통계 시스템이 초기화되지 않았습니다.');
            }
            
            this.basicSystem = window.basicStatisticsSystem;
            
            // 고급 통계 데이터 로드
            await this.loadAdvancedStats();
            
            // 고급 통계 계산
            this.calculateAdvancedStatistics();
            
            this.isInitialized = true;
            console.log('✅ 고급 통계 시스템 초기화 완료');
            
            return {
                success: true,
                message: '고급 통계 시스템이 성공적으로 초기화되었습니다.'
            };
            
        } catch (error) {
            console.error('❌ 고급 통계 시스템 초기화 실패:', error);
            return {
                success: false,
                message: '고급 통계 시스템 초기화에 실패했습니다: ' + error.message
            };
        }
    }
    
    // 고급 통계 데이터 로드
    async loadAdvancedStats() {
        try {
            // LocalStorage에서 고급 통계 데이터 확인
            const storedAdvancedStats = localStorage.getItem('aicu_advanced_stats');
            
            if (storedAdvancedStats) {
                this.advancedStats = JSON.parse(storedAdvancedStats);
                console.log('✅ 저장된 고급 통계 데이터 로드:', this.advancedStats);
            } else {
                // 기본 고급 통계 데이터 생성
                this.advancedStats = this.createDefaultAdvancedStats();
                
                // LocalStorage에 저장
                localStorage.setItem('aicu_advanced_stats', JSON.stringify(this.advancedStats));
                console.log('✅ 기본 고급 통계 데이터 생성:', this.advancedStats);
            }
            
        } catch (error) {
            console.error('❌ 고급 통계 데이터 로드 실패:', error);
            throw error;
        }
    }
    
    // 기본 고급 통계 데이터 생성
    createDefaultAdvancedStats() {
        const today = new Date().toISOString().split('T')[0];
        
        return {
            categoryDetailed: {
                재산보험: {
                    progressRate: 0,
                    accuracy: { total: 0, today: 0, weekly: 0 },
                    learningSpeed: 0,
                    strengths: [],
                    weaknesses: [],
                    goalAchievement: 0,
                    totalQuestions: 197
                },
                특종보험: {
                    progressRate: 0,
                    accuracy: { total: 0, today: 0, weekly: 0 },
                    learningSpeed: 0,
                    strengths: [],
                    weaknesses: [],
                    goalAchievement: 0,
                    totalQuestions: 263
                },
                배상보험: {
                    progressRate: 0,
                    accuracy: { total: 0, today: 0, weekly: 0 },
                    learningSpeed: 0,
                    strengths: [],
                    weaknesses: [],
                    goalAchievement: 0,
                    totalQuestions: 197
                },
                해상보험: {
                    progressRate: 0,
                    accuracy: { total: 0, today: 0, weekly: 0 },
                    learningSpeed: 0,
                    strengths: [],
                    weaknesses: [],
                    goalAchievement: 0,
                    totalQuestions: 132
                }
            },
            learningPatterns: {
                timeBased: { morning: 0, afternoon: 0, evening: 0, night: 0 },
                dayBased: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
                consecutiveDays: 0,
                restPatterns: [],
                lastStudyDate: today
            },
            goals: {
                daily: { target: 50, achieved: 0, rate: 0 },
                weekly: { target: 350, achieved: 0, rate: 0 },
                monthly: { target: 1400, achieved: 0, rate: 0 }
            },
            weakAreas: {
                frequentMistakes: [],
                improvementPriority: [],
                strengths: []
            }
        };
    }
    
    // 고급 통계 계산
    calculateAdvancedStatistics() {
        try {
            if (!this.basicSystem || !this.basicSystem.isInitialized) {
                throw new Error('기본 통계 시스템이 초기화되지 않았습니다.');
            }
            
            const basicStats = this.basicSystem.statistics;
            const progressData = this.basicSystem.progressData;
            
            // 카테고리별 상세 통계 계산
            this.calculateCategoryDetailedStats(progressData);
            
            // 학습 패턴 분석
            this.analyzeLearningPatterns(progressData);
            
            // 목표 달성률 계산
            this.calculateGoalAchievement(basicStats);
            
            // 취약 영역 분석
            this.analyzeWeakAreas(progressData);
            
            // LocalStorage에 저장
            localStorage.setItem('aicu_advanced_stats', JSON.stringify(this.advancedStats));
            
            console.log('✅ 고급 통계 계산 완료:', this.advancedStats);
            
        } catch (error) {
            console.error('❌ 고급 통계 계산 실패:', error);
            throw error;
        }
    }
    
    // 카테고리별 상세 통계 계산
    calculateCategoryDetailedStats(progressData) {
        const categories = ['재산보험', '특종보험', '배상보험', '해상보험'];
        
        categories.forEach(category => {
            const categoryData = progressData.largeCategory[category];
            const detailedStats = this.advancedStats.categoryDetailed[category];
            
            // 진도율 계산
            detailedStats.progressRate = ((categoryData.lastQuestion / detailedStats.totalQuestions) * 100).toFixed(1);
            
            // 정답률 계산
            detailedStats.accuracy.total = categoryData.totalAttempted > 0 ? 
                ((categoryData.totalCorrect / categoryData.totalAttempted) * 100).toFixed(1) : 0;
            detailedStats.accuracy.today = categoryData.todayAttempted > 0 ? 
                ((categoryData.todayCorrect / categoryData.todayAttempted) * 100).toFixed(1) : 0;
            
            // 주간 정답률 계산 (간단한 구현)
            detailedStats.accuracy.weekly = detailedStats.accuracy.today; // 임시로 오늘 정답률 사용
            
            // 학습 속도 계산 (일평균 문제 풀이 수)
            const daysSinceStart = this.calculateDaysSinceStart();
            detailedStats.learningSpeed = daysSinceStart > 0 ? 
                (categoryData.totalAttempted / daysSinceStart).toFixed(1) : 0;
            
            // 목표 달성률 계산
            const examDate = new Date(this.basicSystem.userInfo.examDate);
            const today = new Date();
            const daysUntilExam = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
            const targetProgress = daysUntilExam > 0 ? 
                Math.max(0, 100 - (daysUntilExam * 2)) : 100; // 시험일까지 2%씩 목표
            detailedStats.goalAchievement = Math.min(100, ((categoryData.lastQuestion / detailedStats.totalQuestions) * 100) / targetProgress * 100).toFixed(1);
        });
    }
    
    // 학습 패턴 분석
    analyzeLearningPatterns(progressData) {
        const today = new Date();
        const currentHour = today.getHours();
        const currentDay = today.getDay(); // 0: 일요일, 1: 월요일, ...
        
        // 시간대별 학습 패턴 업데이트
        if (currentHour >= 6 && currentHour < 12) {
            this.advancedStats.learningPatterns.timeBased.morning++;
        } else if (currentHour >= 12 && currentHour < 18) {
            this.advancedStats.learningPatterns.timeBased.afternoon++;
        } else if (currentHour >= 18 && currentHour < 24) {
            this.advancedStats.learningPatterns.timeBased.evening++;
        } else {
            this.advancedStats.learningPatterns.timeBased.night++;
        }
        
        // 요일별 학습 패턴 업데이트
        const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        this.advancedStats.learningPatterns.dayBased[dayNames[currentDay]]++;
        
        // 연속 학습일 계산
        const lastStudyDate = new Date(this.advancedStats.learningPatterns.lastStudyDate);
        const todayDate = new Date(today.toISOString().split('T')[0]);
        const daysDiff = Math.floor((todayDate - lastStudyDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
            // 연속 학습
            this.advancedStats.learningPatterns.consecutiveDays++;
        } else if (daysDiff > 1) {
            // 연속 학습 중단
            this.advancedStats.learningPatterns.consecutiveDays = 1;
        }
        
        this.advancedStats.learningPatterns.lastStudyDate = today.toISOString().split('T')[0];
    }
    
    // 목표 달성률 계산
    calculateGoalAchievement(basicStats) {
        // 일일 목표 달성률
        this.advancedStats.goals.daily.achieved = basicStats.todayAttempted;
        this.advancedStats.goals.daily.rate = this.advancedStats.goals.daily.target > 0 ? 
            ((this.advancedStats.goals.daily.achieved / this.advancedStats.goals.daily.target) * 100).toFixed(1) : 0;
        
        // 주간 목표 달성률 (간단한 구현)
        this.advancedStats.goals.weekly.achieved = basicStats.todayAttempted * 7; // 임시로 오늘 * 7
        this.advancedStats.goals.weekly.rate = this.advancedStats.goals.weekly.target > 0 ? 
            ((this.advancedStats.goals.weekly.achieved / this.advancedStats.goals.weekly.target) * 100).toFixed(1) : 0;
        
        // 월간 목표 달성률 (간단한 구현)
        this.advancedStats.goals.monthly.achieved = basicStats.todayAttempted * 30; // 임시로 오늘 * 30
        this.advancedStats.goals.monthly.rate = this.advancedStats.goals.monthly.target > 0 ? 
            ((this.advancedStats.goals.monthly.achieved / this.advancedStats.goals.monthly.target) * 100).toFixed(1) : 0;
    }
    
    // 취약 영역 분석
    analyzeWeakAreas(progressData) {
        const categories = ['재산보험', '특종보험', '배상보험', '해상보험'];
        const categoryAccuracies = [];
        
        // 카테고리별 정답률 계산
        categories.forEach(category => {
            const categoryData = progressData.largeCategory[category];
            const accuracy = categoryData.totalAttempted > 0 ? 
                (categoryData.totalCorrect / categoryData.totalAttempted) * 100 : 0;
            
            categoryAccuracies.push({
                category: category,
                accuracy: accuracy,
                totalAttempted: categoryData.totalAttempted
            });
        });
        
        // 정답률 기준으로 정렬
        categoryAccuracies.sort((a, b) => a.accuracy - b.accuracy);
        
        // 취약 영역 (정답률이 낮은 순)
        this.advancedStats.weakAreas.frequentMistakes = categoryAccuracies
            .filter(item => item.totalAttempted > 0)
            .slice(0, 2)
            .map(item => ({
                category: item.category,
                accuracy: item.accuracy.toFixed(1),
                improvement: '정답률 향상 필요'
            }));
        
        // 강점 영역 (정답률이 높은 순)
        this.advancedStats.weakAreas.strengths = categoryAccuracies
            .filter(item => item.totalAttempted > 0)
            .slice(-2)
            .reverse()
            .map(item => ({
                category: item.category,
                accuracy: item.accuracy.toFixed(1),
                strength: '우수한 성과'
            }));
        
        // 개선 우선순위
        this.advancedStats.weakAreas.improvementPriority = categoryAccuracies
            .filter(item => item.totalAttempted > 0)
            .map(item => ({
                category: item.category,
                priority: item.accuracy < 70 ? '높음' : item.accuracy < 85 ? '보통' : '낮음',
                recommendation: item.accuracy < 70 ? '집중 학습 필요' : 
                               item.accuracy < 85 ? '보완 학습 권장' : '유지 관리'
            }));
    }
    
    // 문제 풀이 결과 업데이트 (고급 통계 포함)
    updateOnQuestionSolved(category, questionId, isCorrect) {
        try {
            if (!this.isInitialized) {
                throw new Error('고급 통계 시스템이 초기화되지 않았습니다.');
            }
            
            // 기본 통계 시스템 업데이트
            const basicResult = this.basicSystem.updateOnQuestionSolved(category, questionId, isCorrect);
            
            if (basicResult.success) {
                // 고급 통계 재계산
                this.calculateAdvancedStatistics();
                
                console.log(`✅ 고급 통계 업데이트 완료: ${category} ${questionId}번 ${isCorrect ? '정답' : '오답'}`);
                
                return {
                    success: true,
                    message: '고급 통계가 업데이트되었습니다.',
                    basicResult: basicResult
                };
            } else {
                return basicResult;
            }
            
        } catch (error) {
            console.error('❌ 고급 통계 업데이트 실패:', error);
            return {
                success: false,
                message: '고급 통계 업데이트에 실패했습니다: ' + error.message
            };
        }
    }
    
    // 카테고리별 상세 통계 조회
    getCategoryDetailedStats(category) {
        if (!this.isInitialized) {
            return null;
        }
        
        return this.advancedStats.categoryDetailed[category] || null;
    }
    
    // 학습 패턴 조회
    getLearningPatterns() {
        if (!this.isInitialized) {
            return null;
        }
        
        return this.advancedStats.learningPatterns;
    }
    
    // 목표 달성률 조회
    getGoalAchievement() {
        if (!this.isInitialized) {
            return null;
        }
        
        return this.advancedStats.goals;
    }
    
    // 취약 영역 분석 조회
    getWeakAreas() {
        if (!this.isInitialized) {
            return null;
        }
        
        return this.advancedStats.weakAreas;
    }
    
    // 전체 고급 통계 조회
    getAdvancedStatistics() {
        if (!this.isInitialized) {
            return null;
        }
        
        return {
            categoryDetailed: this.advancedStats.categoryDetailed,
            learningPatterns: this.advancedStats.learningPatterns,
            goals: this.advancedStats.goals,
            weakAreas: this.advancedStats.weakAreas
        };
    }
    
    // 목표 설정
    setGoals(dailyTarget, weeklyTarget, monthlyTarget) {
        try {
            this.advancedStats.goals.daily.target = dailyTarget || 50;
            this.advancedStats.goals.weekly.target = weeklyTarget || 350;
            this.advancedStats.goals.monthly.target = monthlyTarget || 1400;
            
            // LocalStorage에 저장
            localStorage.setItem('aicu_advanced_stats', JSON.stringify(this.advancedStats));
            
            console.log('✅ 목표 설정 완료:', this.advancedStats.goals);
            
            return {
                success: true,
                message: '목표가 설정되었습니다.',
                goals: this.advancedStats.goals
            };
            
        } catch (error) {
            console.error('❌ 목표 설정 실패:', error);
            return {
                success: false,
                message: '목표 설정에 실패했습니다: ' + error.message
            };
        }
    }
    
    // 학습 패턴 기반 권장사항 생성
    generateRecommendations() {
        try {
            const patterns = this.advancedStats.learningPatterns;
            const weakAreas = this.advancedStats.weakAreas;
            const goals = this.advancedStats.goals;
            
            const recommendations = [];
            
            // 연속 학습 권장사항
            if (patterns.consecutiveDays < 3) {
                recommendations.push({
                    type: 'motivation',
                    title: '연속 학습 유지',
                    message: `현재 ${patterns.consecutiveDays}일 연속 학습 중입니다. 3일 이상 연속 학습을 목표로 해보세요!`,
                    priority: 'high'
                });
            }
            
            // 취약 영역 개선 권장사항
            if (weakAreas.frequentMistakes.length > 0) {
                const weakest = weakAreas.frequentMistakes[0];
                recommendations.push({
                    type: 'improvement',
                    title: '취약 영역 집중 학습',
                    message: `${weakest.category} 영역의 정답률이 ${weakest.accuracy}%로 낮습니다. 집중 학습을 권장합니다.`,
                    priority: 'high'
                });
            }
            
            // 목표 달성 권장사항
            if (parseFloat(goals.daily.rate) < 80) {
                recommendations.push({
                    type: 'goal',
                    title: '일일 목표 달성',
                    message: `오늘 목표 달성률이 ${goals.daily.rate}%입니다. 목표 달성을 위해 더 노력해보세요!`,
                    priority: 'medium'
                });
            }
            
            return recommendations;
            
        } catch (error) {
            console.error('❌ 권장사항 생성 실패:', error);
            return [];
        }
    }
    
    // 유틸리티 함수들
    calculateDaysSinceStart() {
        const startDate = new Date(this.basicSystem.userInfo.registrationDate);
        const today = new Date();
        return Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
    }
    
    // 시스템 리셋
    resetAdvancedStats() {
        try {
            this.advancedStats = this.createDefaultAdvancedStats();
            localStorage.setItem('aicu_advanced_stats', JSON.stringify(this.advancedStats));
            
            console.log('✅ 고급 통계 초기화 완료');
            
            return {
                success: true,
                message: '고급 통계가 초기화되었습니다.'
            };
            
        } catch (error) {
            console.error('❌ 고급 통계 초기화 실패:', error);
            return {
                success: false,
                message: '고급 통계 초기화에 실패했습니다: ' + error.message
            };
        }
    }
}

// 전역 인스턴스 생성
window.advancedStatisticsSystem = new AdvancedStatisticsSystem();

console.log('✅ 고급 통계 시스템 로드 완료');
