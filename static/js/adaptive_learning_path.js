// 적응형 학습 경로 관리 - 고급통계 기능 2단계
class AdaptiveLearningPath {
    constructor() {
        this.isInitialized = false;
        this.currentPath = null;
        this.pathHistory = [];
        this.milestones = [];
        this.performanceMetrics = {};
        console.log('=== 적응형 학습 경로 관리 시스템 초기화 ===');
    }

    async initialize() {
        try {
            console.log('🎯 적응형 학습 경로 초기화 시작...');
            
            // 사용자 정보 로드
            await this.loadUserInfo();
            
            // 기존 학습 경로 로드
            await this.loadCurrentPath();
            
            // 경로 히스토리 로드
            await this.loadPathHistory();
            
            // 성과 지표 초기화
            await this.initializePerformanceMetrics();
            
            this.isInitialized = true;
            console.log('✅ 적응형 학습 경로 초기화 완료');
            
            return { success: true, message: '적응형 학습 경로가 성공적으로 초기화되었습니다.' };
        } catch (error) {
            console.error('❌ 적응형 학습 경로 초기화 실패:', error);
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

    async loadCurrentPath() {
        try {
            const pathData = localStorage.getItem('aicu_adaptive_learning_path');
            if (pathData) {
                this.currentPath = JSON.parse(pathData);
            } else {
                this.currentPath = await this.generatePersonalizedPath(this.userInfo.userName, this.userInfo.examDate);
            }
            console.log('✅ 현재 학습 경로 로드 완료:', this.currentPath);
        } catch (error) {
            console.error('❌ 현재 학습 경로 로드 실패:', error);
            this.currentPath = await this.generatePersonalizedPath(this.userInfo.userName, this.userInfo.examDate);
        }
    }

    async loadPathHistory() {
        try {
            const history = localStorage.getItem('aicu_path_history');
            if (history) {
                this.pathHistory = JSON.parse(history);
            }
            console.log('✅ 경로 히스토리 로드 완료:', this.pathHistory.length, '개');
        } catch (error) {
            console.error('❌ 경로 히스토리 로드 실패:', error);
            this.pathHistory = [];
        }
    }

    async initializePerformanceMetrics() {
        try {
            const metrics = localStorage.getItem('aicu_performance_metrics');
            if (metrics) {
                this.performanceMetrics = JSON.parse(metrics);
            } else {
                this.performanceMetrics = this.createDefaultPerformanceMetrics();
            }
            console.log('✅ 성과 지표 초기화 완료:', this.performanceMetrics);
        } catch (error) {
            console.error('❌ 성과 지표 초기화 실패:', error);
            this.performanceMetrics = this.createDefaultPerformanceMetrics();
        }
    }

    // 개인별 학습 경로 생성
    async generatePersonalizedPath(userId, targetDate) {
        try {
            console.log('🎯 개인별 학습 경로 생성 시작...');
            
            const examDate = new Date(targetDate);
            const today = new Date();
            const daysUntilExam = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
            
            // 기본 학습 단계 정의
            const phases = this.defineLearningPhases(daysUntilExam);
            
            // 사용자 현재 수준 평가
            const currentLevel = await this.assessCurrentLevel(userId);
            
            // 개인화된 마일스톤 생성
            const milestones = this.generateMilestones(phases, currentLevel, daysUntilExam);
            
            const personalizedPath = {
                userId: userId,
                targetDate: targetDate,
                daysUntilExam: daysUntilExam,
                currentPhase: 1,
                phases: phases,
                milestones: milestones,
                currentFocus: {
                    category: this.determineCurrentFocusCategory(),
                    difficulty: this.determineCurrentDifficulty(currentLevel),
                    priority: 'high'
                },
                progress: {
                    overallProgress: 0,
                    phaseProgress: 0,
                    milestoneProgress: 0
                },
                lastUpdated: new Date().toISOString()
            };
            
            // 경로 저장
            localStorage.setItem('aicu_adaptive_learning_path', JSON.stringify(personalizedPath));
            
            console.log('✅ 개인별 학습 경로 생성 완료:', personalizedPath);
            return personalizedPath;
            
        } catch (error) {
            console.error('❌ 개인별 학습 경로 생성 실패:', error);
            return this.createDefaultPath(userId, targetDate);
        }
    }

    // 실시간 경로 조정
    async adjustPathBasedOnPerformance(userId, recentResults) {
        try {
            console.log('🎯 실시간 경로 조정 시작...');
            
            if (!this.currentPath) {
                throw new Error('현재 학습 경로가 없습니다.');
            }
            
            // 최근 성과 분석
            const performanceAnalysis = this.analyzeRecentPerformance(recentResults);
            
            // 경로 조정 결정
            const adjustment = this.determinePathAdjustment(performanceAnalysis);
            
            if (adjustment.needsAdjustment) {
                // 경로 조정 실행
                this.applyPathAdjustment(adjustment);
                
                // 조정 히스토리 기록
                this.recordPathAdjustment(adjustment);
                
                // 업데이트된 경로 저장
                localStorage.setItem('aicu_adaptive_learning_path', JSON.stringify(this.currentPath));
                
                console.log('✅ 경로 조정 완료:', adjustment);
                return { success: true, adjustment: adjustment };
            } else {
                console.log('✅ 경로 조정 불필요');
                return { success: true, adjustment: null };
            }
            
        } catch (error) {
            console.error('❌ 실시간 경로 조정 실패:', error);
            return { success: false, message: error.message };
        }
    }

    // 목표 달성률 계산
    calculateGoalAchievement(userId, period = 'current') {
        try {
            console.log('🎯 목표 달성률 계산 시작...');
            
            if (!this.currentPath) {
                return { success: false, message: '학습 경로가 없습니다.' };
            }
            
            const progressData = this.getProgressData();
            const achievements = {};
            
            // 전체 목표 달성률
            achievements.overall = this.calculateOverallAchievement(progressData);
            
            // 단계별 목표 달성률
            achievements.phase = this.calculatePhaseAchievement(progressData);
            
            // 마일스톤별 목표 달성률
            achievements.milestone = this.calculateMilestoneAchievement(progressData);
            
            // 카테고리별 목표 달성률
            achievements.category = this.calculateCategoryAchievement(progressData);
            
            // 기간별 목표 달성률
            achievements.period = this.calculatePeriodAchievement(progressData, period);
            
            console.log('✅ 목표 달성률 계산 완료:', achievements);
            return { success: true, achievements: achievements };
            
        } catch (error) {
            console.error('❌ 목표 달성률 계산 실패:', error);
            return { success: false, message: error.message };
        }
    }

    // 동적 목표 재설정
    async resetGoalsDynamically(userId, performance) {
        try {
            console.log('🎯 동적 목표 재설정 시작...');
            
            if (!this.currentPath) {
                throw new Error('학습 경로가 없습니다.');
            }
            
            // 성과 분석
            const performanceAnalysis = this.analyzePerformance(performance);
            
            // 목표 재설정 필요성 판단
            const needsReset = this.determineGoalResetNecessity(performanceAnalysis);
            
            if (needsReset) {
                // 새로운 목표 생성
                const newGoals = this.generateNewGoals(performanceAnalysis);
                
                // 기존 목표 업데이트
                this.updateCurrentGoals(newGoals);
                
                // 목표 재설정 히스토리 기록
                this.recordGoalReset(newGoals, performanceAnalysis);
                
                // 업데이트된 경로 저장
                localStorage.setItem('aicu_adaptive_learning_path', JSON.stringify(this.currentPath));
                
                console.log('✅ 동적 목표 재설정 완료:', newGoals);
                return { success: true, newGoals: newGoals };
            } else {
                console.log('✅ 목표 재설정 불필요');
                return { success: true, newGoals: null };
            }
            
        } catch (error) {
            console.error('❌ 동적 목표 재설정 실패:', error);
            return { success: false, message: error.message };
        }
    }

    // 학습 단계 정의
    defineLearningPhases(daysUntilExam) {
        const phases = [];
        
        if (daysUntilExam > 180) {
            // 6개월 이상 남은 경우
            phases.push(
                { id: 1, name: '기초 개념 학습', duration: 60, targetQuestions: 200, weight: 0.2 },
                { id: 2, name: '핵심 이론 정리', duration: 60, targetQuestions: 300, weight: 0.3 },
                { id: 3, name: '실전 문제 연습', duration: 60, targetQuestions: 400, weight: 0.3 },
                { id: 4, name: '최종 점검 및 보완', duration: 30, targetQuestions: 200, weight: 0.2 }
            );
        } else if (daysUntilExam > 90) {
            // 3개월 이상 남은 경우
            phases.push(
                { id: 1, name: '핵심 이론 정리', duration: 45, targetQuestions: 300, weight: 0.4 },
                { id: 2, name: '실전 문제 연습', duration: 45, targetQuestions: 400, weight: 0.4 },
                { id: 3, name: '최종 점검 및 보완', duration: 20, targetQuestions: 200, weight: 0.2 }
            );
        } else {
            // 3개월 미만 남은 경우
            phases.push(
                { id: 1, name: '집중 실전 연습', duration: daysUntilExam - 30, targetQuestions: 600, weight: 0.7 },
                { id: 2, name: '최종 점검 및 보완', duration: 30, targetQuestions: 200, weight: 0.3 }
            );
        }
        
        return phases;
    }

    // 현재 수준 평가
    async assessCurrentLevel(userId) {
        try {
            const progressData = this.getProgressData();
            const totalAttempted = progressData.basicLearning?.totalAttempted || 0;
            const totalCorrect = progressData.basicLearning?.totalCorrect || 0;
            
            let level = 'beginner';
            
            if (totalAttempted > 0) {
                const accuracy = (totalCorrect / totalAttempted) * 100;
                
                if (totalAttempted >= 200 && accuracy >= 80) {
                    level = 'advanced';
                } else if (totalAttempted >= 100 && accuracy >= 70) {
                    level = 'intermediate';
                } else if (totalAttempted >= 50 && accuracy >= 60) {
                    level = 'beginner_plus';
                } else {
                    level = 'beginner';
                }
            }
            
            return level;
        } catch (error) {
            console.error('❌ 현재 수준 평가 실패:', error);
            return 'beginner';
        }
    }

    // 마일스톤 생성
    generateMilestones(phases, currentLevel, daysUntilExam) {
        const milestones = [];
        let currentDate = new Date();
        
        for (const phase of phases) {
            const phaseEndDate = new Date(currentDate);
            phaseEndDate.setDate(currentDate.getDate() + phase.duration);
            
            milestones.push({
                id: phase.id,
                title: phase.name,
                targetQuestions: phase.targetQuestions,
                completedQuestions: 0,
                deadline: phaseEndDate.toISOString().split('T')[0],
                weight: phase.weight,
                status: 'pending'
            });
            
            currentDate = phaseEndDate;
        }
        
        return milestones;
    }

    // 현재 집중 카테고리 결정
    determineCurrentFocusCategory() {
        try {
            const progressData = this.getProgressData();
            const categories = ['재산보험', '특종보험', '배상보험', '해상보험'];
            let focusCategory = '재산보험';
            let minAccuracy = 100;
            
            for (const category of categories) {
                const categoryData = progressData.largeCategory[category];
                if (categoryData && categoryData.totalAttempted > 0) {
                    const accuracy = (categoryData.totalCorrect / categoryData.totalAttempted) * 100;
                    if (accuracy < minAccuracy) {
                        minAccuracy = accuracy;
                        focusCategory = category;
                    }
                }
            }
            
            return focusCategory;
        } catch (error) {
            console.error('❌ 현재 집중 카테고리 결정 실패:', error);
            return '재산보험';
        }
    }

    // 현재 난이도 결정
    determineCurrentDifficulty(currentLevel) {
        const difficultyMap = {
            'beginner': 'easy',
            'beginner_plus': 'easy',
            'intermediate': 'medium',
            'advanced': 'hard'
        };
        
        return difficultyMap[currentLevel] || 'medium';
    }

    // 최근 성과 분석
    analyzeRecentPerformance(recentResults) {
        const analysis = {
            accuracy: 0,
            speed: 0,
            consistency: 0,
            trend: 'stable'
        };
        
        if (recentResults && recentResults.length > 0) {
            const totalQuestions = recentResults.length;
            const correctAnswers = recentResults.filter(r => r.isCorrect).length;
            analysis.accuracy = (correctAnswers / totalQuestions) * 100;
            
            // 평균 풀이 시간 계산 (더미 데이터)
            analysis.speed = 120; // 초 단위
            
            // 일관성 계산
            analysis.consistency = this.calculateConsistency(recentResults);
            
            // 트렌드 분석
            analysis.trend = this.analyzeTrend(recentResults);
        }
        
        return analysis;
    }

    // 경로 조정 결정
    determinePathAdjustment(performanceAnalysis) {
        const adjustment = {
            needsAdjustment: false,
            type: null,
            reason: null,
            changes: {}
        };
        
        // 정확도 기반 조정
        if (performanceAnalysis.accuracy < 50) {
            adjustment.needsAdjustment = true;
            adjustment.type = 'difficulty_reduction';
            adjustment.reason = '정확도가 낮아 난이도를 낮춥니다.';
            adjustment.changes.difficulty = 'easy';
        } else if (performanceAnalysis.accuracy > 90) {
            adjustment.needsAdjustment = true;
            adjustment.type = 'difficulty_increase';
            adjustment.reason = '정확도가 높아 난이도를 높입니다.';
            adjustment.changes.difficulty = 'hard';
        }
        
        // 트렌드 기반 조정
        if (performanceAnalysis.trend === 'declining') {
            adjustment.needsAdjustment = true;
            adjustment.type = 'focus_adjustment';
            adjustment.reason = '성과가 감소하여 집중 영역을 조정합니다.';
            adjustment.changes.focus = 'weak_areas';
        }
        
        return adjustment;
    }

    // 경로 조정 적용
    applyPathAdjustment(adjustment) {
        if (adjustment.changes.difficulty) {
            this.currentPath.currentFocus.difficulty = adjustment.changes.difficulty;
        }
        
        if (adjustment.changes.focus) {
            this.currentPath.currentFocus.category = this.determineCurrentFocusCategory();
        }
        
        this.currentPath.lastUpdated = new Date().toISOString();
    }

    // 경로 조정 기록
    recordPathAdjustment(adjustment) {
        const record = {
            timestamp: new Date().toISOString(),
            type: adjustment.type,
            reason: adjustment.reason,
            changes: adjustment.changes
        };
        
        this.pathHistory.push(record);
        
        // 최근 20개만 유지
        if (this.pathHistory.length > 20) {
            this.pathHistory = this.pathHistory.slice(-20);
        }
        
        localStorage.setItem('aicu_path_history', JSON.stringify(this.pathHistory));
    }

    // 전체 목표 달성률 계산
    calculateOverallAchievement(progressData) {
        const totalAttempted = progressData.basicLearning?.totalAttempted || 0;
        const targetTotal = 789; // 전체 문제 수
        
        return Math.min((totalAttempted / targetTotal) * 100, 100);
    }

    // 단계별 목표 달성률 계산
    calculatePhaseAchievement(progressData) {
        if (!this.currentPath) return {};
        
        const phaseAchievements = {};
        for (const phase of this.currentPath.phases) {
            const phaseProgress = this.calculatePhaseProgress(phase, progressData);
            phaseAchievements[phase.id] = phaseProgress;
        }
        
        return phaseAchievements;
    }

    // 마일스톤별 목표 달성률 계산
    calculateMilestoneAchievement(progressData) {
        if (!this.currentPath) return {};
        
        const milestoneAchievements = {};
        for (const milestone of this.currentPath.milestones) {
            const progress = (milestone.completedQuestions / milestone.targetQuestions) * 100;
            milestoneAchievements[milestone.id] = Math.min(progress, 100);
        }
        
        return milestoneAchievements;
    }

    // 카테고리별 목표 달성률 계산
    calculateCategoryAchievement(progressData) {
        const categories = ['재산보험', '특종보험', '배상보험', '해상보험'];
        const categoryAchievements = {};
        
        for (const category of categories) {
            const categoryData = progressData.largeCategory[category];
            if (categoryData && categoryData.totalAttempted > 0) {
                const accuracy = (categoryData.totalCorrect / categoryData.totalAttempted) * 100;
                categoryAchievements[category] = accuracy;
            } else {
                categoryAchievements[category] = 0;
            }
        }
        
        return categoryAchievements;
    }

    // 기간별 목표 달성률 계산
    calculatePeriodAchievement(progressData, period) {
        // 더미 데이터 - 실제로는 기간별 데이터 분석 필요
        return {
            daily: 75,
            weekly: 68,
            monthly: 82
        };
    }

    // 성과 분석
    analyzePerformance(performance) {
        return {
            accuracy: performance.accuracy || 0,
            speed: performance.speed || 0,
            consistency: performance.consistency || 0,
            trend: performance.trend || 'stable'
        };
    }

    // 목표 재설정 필요성 판단
    determineGoalResetNecessity(performanceAnalysis) {
        // 정확도가 50% 미만이거나 95% 초과인 경우
        if (performanceAnalysis.accuracy < 50 || performanceAnalysis.accuracy > 95) {
            return true;
        }
        
        // 트렌드가 지속적으로 감소하는 경우
        if (performanceAnalysis.trend === 'declining') {
            return true;
        }
        
        return false;
    }

    // 새로운 목표 생성
    generateNewGoals(performanceAnalysis) {
        const newGoals = {
            daily: { target: 50, achieved: 0 },
            weekly: { target: 350, achieved: 0 },
            monthly: { target: 1400, achieved: 0 }
        };
        
        // 성과에 따른 목표 조정
        if (performanceAnalysis.accuracy < 60) {
            newGoals.daily.target = Math.max(30, newGoals.daily.target * 0.8);
            newGoals.weekly.target = Math.max(200, newGoals.weekly.target * 0.8);
        } else if (performanceAnalysis.accuracy > 90) {
            newGoals.daily.target = Math.min(80, newGoals.daily.target * 1.2);
            newGoals.weekly.target = Math.min(500, newGoals.weekly.target * 1.2);
        }
        
        return newGoals;
    }

    // 현재 목표 업데이트
    updateCurrentGoals(newGoals) {
        if (this.currentPath && newGoals) {
            this.currentPath.goals = newGoals;
        }
    }

    // 목표 재설정 기록
    recordGoalReset(newGoals, performanceAnalysis) {
        const record = {
            timestamp: new Date().toISOString(),
            type: 'goal_reset',
            newGoals: newGoals,
            performanceAnalysis: performanceAnalysis
        };
        
        this.pathHistory.push(record);
        localStorage.setItem('aicu_path_history', JSON.stringify(this.pathHistory));
    }

    // 유틸리티 메서드들
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

    createDefaultPerformanceMetrics() {
        return {
            daily: { accuracy: 0, questions: 0, time: 0 },
            weekly: { accuracy: 0, questions: 0, time: 0 },
            monthly: { accuracy: 0, questions: 0, time: 0 }
        };
    }

    createDefaultPath(userId, targetDate) {
        return {
            userId: userId,
            targetDate: targetDate,
            daysUntilExam: 240,
            currentPhase: 1,
            phases: [
                { id: 1, name: '기초 개념 학습', duration: 60, targetQuestions: 200, weight: 0.2 }
            ],
            milestones: [
                {
                    id: 1,
                    title: '기초 개념 학습',
                    targetQuestions: 200,
                    completedQuestions: 0,
                    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    weight: 0.2,
                    status: 'pending'
                }
            ],
            currentFocus: {
                category: '재산보험',
                difficulty: 'medium',
                priority: 'high'
            },
            progress: {
                overallProgress: 0,
                phaseProgress: 0,
                milestoneProgress: 0
            },
            lastUpdated: new Date().toISOString()
        };
    }

    calculateConsistency(results) {
        if (results.length < 2) return 100;
        
        const accuracies = results.map(r => r.isCorrect ? 100 : 0);
        const mean = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
        const variance = accuracies.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / accuracies.length;
        const stdDev = Math.sqrt(variance);
        
        return Math.max(0, 100 - stdDev);
    }

    analyzeTrend(results) {
        if (results.length < 5) return 'stable';
        
        const recent = results.slice(-5);
        const earlier = results.slice(-10, -5);
        
        const recentAccuracy = recent.filter(r => r.isCorrect).length / recent.length;
        const earlierAccuracy = earlier.filter(r => r.isCorrect).length / earlier.length;
        
        if (recentAccuracy > earlierAccuracy + 0.1) return 'improving';
        if (recentAccuracy < earlierAccuracy - 0.1) return 'declining';
        return 'stable';
    }

    calculatePhaseProgress(phase, progressData) {
        const totalAttempted = progressData.basicLearning?.totalAttempted || 0;
        return Math.min((totalAttempted / phase.targetQuestions) * 100, 100);
    }

    // 공개 API 메서드들
    async getCurrentPath(userId) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        return this.currentPath;
    }

    async getPathHistory(userId) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        return this.pathHistory;
    }

    async getMilestones(userId) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        return this.currentPath?.milestones || [];
    }

    async getPerformanceMetrics(userId) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        return this.performanceMetrics;
    }

    async updateMilestoneProgress(milestoneId, completedQuestions) {
        if (this.currentPath) {
            const milestone = this.currentPath.milestones.find(m => m.id === milestoneId);
            if (milestone) {
                milestone.completedQuestions = completedQuestions;
                if (completedQuestions >= milestone.targetQuestions) {
                    milestone.status = 'completed';
                }
                localStorage.setItem('aicu_adaptive_learning_path', JSON.stringify(this.currentPath));
            }
        }
    }
}

// 전역 인스턴스 생성
window.adaptiveLearningPath = new AdaptiveLearningPath();
console.log('🎯 적응형 학습 경로 관리 시스템 모듈 로드 완료');









