/**
 * 실시간 학습 분석 시스템 - 학습 과정의 실시간 모니터링 및 분석
 * 학습 과정 실시간 모니터링, 문제 풀이 패턴 분석, 학습 효율성 측정, 집중도 및 피로도 분석
 */

class RealTimeLearningAnalytics {
    constructor() {
        this.systemName = "Real-time Learning Analytics";
        this.version = "1.0.0";
        this.isInitialized = false;
        this.currentSession = null;
        this.learningPatterns = {};
        this.analyticsData = {};
        this.monitoringInterval = null;
        this.sessionStartTime = null;
        this.lastActivityTime = null;
        
        console.log(`📊 ${this.systemName} v${this.version} 초기화 중...`);
    }

    /**
     * 시스템 초기화
     */
    initialize() {
        try {
            this.loadAnalyticsData();
            this.initializeLearningPatterns();
            this.startSessionMonitoring();
            
            this.isInitialized = true;
            console.log(`✅ ${this.systemName} 초기화 완료`);
            return true;
        } catch (error) {
            console.error(`❌ ${this.systemName} 초기화 실패:`, error);
            return false;
        }
    }

    /**
     * 분석 데이터 로드
     */
    loadAnalyticsData() {
        try {
            const data = localStorage.getItem('aicu_realtime_analytics');
            if (data) {
                this.analyticsData = JSON.parse(data);
            } else {
                this.analyticsData = this.createDefaultAnalyticsData();
                this.saveAnalyticsData();
            }
            console.log(`📊 실시간 분석 데이터 로드 완료`);
        } catch (error) {
            console.error(`❌ 실시간 분석 데이터 로드 실패:`, error);
            this.analyticsData = this.createDefaultAnalyticsData();
        }
    }

    /**
     * 기본 분석 데이터 생성
     */
    createDefaultAnalyticsData() {
        return {
            currentSession: {
                startTime: null,
                questionsAttempted: 0,
                correctAnswers: 0,
                averageTimePerQuestion: 0,
                concentrationScore: 0,
                fatigueLevel: 0,
                sessionDuration: 0,
                lastActivityTime: null
            },
            learningPatterns: {
                timeOfDayPerformance: {},
                questionTypePerformance: {},
                difficultyProgression: {},
                errorPatterns: {},
                concentrationTrends: {},
                fatigueTrends: {}
            },
            sessionHistory: [],
            performanceMetrics: {
                totalSessions: 0,
                averageSessionDuration: 0,
                averageQuestionsPerSession: 0,
                averageAccuracy: 0,
                averageConcentration: 0
            }
        };
    }

    /**
     * 학습 패턴 초기화
     */
    initializeLearningPatterns() {
        try {
            this.learningPatterns = {
                timeOfDayPerformance: this.initializeTimeOfDayPerformance(),
                questionTypePerformance: this.initializeQuestionTypePerformance(),
                difficultyProgression: this.initializeDifficultyProgression(),
                errorPatterns: this.initializeErrorPatterns(),
                concentrationTrends: this.initializeConcentrationTrends(),
                fatigueTrends: this.initializeFatigueTrends()
            };
            
            console.log(`📈 학습 패턴 초기화 완료`);
        } catch (error) {
            console.error(`❌ 학습 패턴 초기화 실패:`, error);
        }
    }

    /**
     * 시간대별 성과 초기화
     */
    initializeTimeOfDayPerformance() {
        const timeSlots = {};
        for (let hour = 0; hour < 24; hour++) {
            timeSlots[hour] = {
                questionsAttempted: 0,
                correctAnswers: 0,
                averageTime: 0,
                concentrationScore: 0
            };
        }
        return timeSlots;
    }

    /**
     * 문제 유형별 성과 초기화
     */
    initializeQuestionTypePerformance() {
        return {
            객관식: { attempted: 0, correct: 0, averageTime: 0 },
            주관식: { attempted: 0, correct: 0, averageTime: 0 },
            서술형: { attempted: 0, correct: 0, averageTime: 0 }
        };
    }

    /**
     * 난이도 진행 초기화
     */
    initializeDifficultyProgression() {
        return {
            easy: { attempted: 0, correct: 0, averageTime: 0 },
            medium: { attempted: 0, correct: 0, averageTime: 0 },
            hard: { attempted: 0, correct: 0, averageTime: 0 }
        };
    }

    /**
     * 오답 패턴 초기화
     */
    initializeErrorPatterns() {
        return {
            carelessMistakes: 0,
            conceptualErrors: 0,
            timePressureErrors: 0,
            fatigueErrors: 0,
            patternErrors: 0
        };
    }

    /**
     * 집중도 트렌드 초기화
     */
    initializeConcentrationTrends() {
        return {
            high: 0,
            medium: 0,
            low: 0,
            trend: []
        };
    }

    /**
     * 피로도 트렌드 초기화
     */
    initializeFatigueTrends() {
        return {
            low: 0,
            medium: 0,
            high: 0,
            trend: []
        };
    }

    /**
     * 세션 모니터링 시작
     */
    startSessionMonitoring() {
        try {
            this.sessionStartTime = new Date();
            this.lastActivityTime = new Date();
            
            this.currentSession = {
                startTime: this.sessionStartTime.toISOString(),
                questionsAttempted: 0,
                correctAnswers: 0,
                averageTimePerQuestion: 0,
                concentrationScore: 0,
                fatigueLevel: 0,
                sessionDuration: 0,
                lastActivityTime: this.lastActivityTime.toISOString()
            };
            
            // 실시간 모니터링 시작 (30초마다 업데이트)
            this.monitoringInterval = setInterval(() => {
                this.updateSessionMetrics();
                this.analyzeConcentration();
                this.analyzeFatigue();
                this.updateLearningPatterns();
            }, 30000);
            
            console.log(`🔄 세션 모니터링 시작`);
        } catch (error) {
            console.error(`❌ 세션 모니터링 시작 실패:`, error);
        }
    }

    /**
     * 세션 메트릭 업데이트
     */
    updateSessionMetrics() {
        try {
            const now = new Date();
            const sessionDuration = Math.floor((now - this.sessionStartTime) / 1000 / 60); // 분 단위
            
            this.currentSession.sessionDuration = sessionDuration;
            this.currentSession.lastActivityTime = now.toISOString();
            
            // 평균 시간 계산
            if (this.currentSession.questionsAttempted > 0) {
                this.currentSession.averageTimePerQuestion = 
                    Math.round(sessionDuration * 60 / this.currentSession.questionsAttempted);
            }
            
            console.log(`⏱️ 세션 메트릭 업데이트: ${sessionDuration}분`);
        } catch (error) {
            console.error(`❌ 세션 메트릭 업데이트 실패:`, error);
        }
    }

    /**
     * 집중도 분석
     */
    analyzeConcentration() {
        try {
            const now = new Date();
            const timeSinceLastActivity = Math.floor((now - this.lastActivityTime) / 1000 / 60);
            
            let concentrationScore = 1.0;
            
            // 활동 간격에 따른 집중도 조정
            if (timeSinceLastActivity > 10) {
                concentrationScore = 0.3; // 10분 이상 비활동: 낮은 집중도
            } else if (timeSinceLastActivity > 5) {
                concentrationScore = 0.6; // 5-10분 비활동: 보통 집중도
            } else if (timeSinceLastActivity > 2) {
                concentrationScore = 0.8; // 2-5분 비활동: 높은 집중도
            }
            
            // 세션 시간에 따른 집중도 조정
            const sessionDuration = Math.floor((now - this.sessionStartTime) / 1000 / 60);
            if (sessionDuration > 120) {
                concentrationScore *= 0.8; // 2시간 이상: 집중도 감소
            } else if (sessionDuration > 60) {
                concentrationScore *= 0.9; // 1시간 이상: 약간 감소
            }
            
            this.currentSession.concentrationScore = Math.round(concentrationScore * 100) / 100;
            
            // 집중도 트렌드 업데이트
            this.updateConcentrationTrend(concentrationScore);
            
            console.log(`🎯 집중도 분석: ${(concentrationScore * 100).toFixed(1)}%`);
        } catch (error) {
            console.error(`❌ 집중도 분석 실패:`, error);
        }
    }

    /**
     * 피로도 분석
     */
    analyzeFatigue() {
        try {
            const now = new Date();
            const sessionDuration = Math.floor((now - this.sessionStartTime) / 1000 / 60);
            
            let fatigueLevel = 0.0;
            
            // 세션 시간에 따른 피로도 증가
            if (sessionDuration > 180) {
                fatigueLevel = 0.8; // 3시간 이상: 높은 피로도
            } else if (sessionDuration > 120) {
                fatigueLevel = 0.6; // 2-3시간: 보통 피로도
            } else if (sessionDuration > 60) {
                fatigueLevel = 0.3; // 1-2시간: 낮은 피로도
            }
            
            // 연속 문제 풀이에 따른 피로도 증가
            if (this.currentSession.questionsAttempted > 50) {
                fatigueLevel = Math.min(fatigueLevel + 0.2, 1.0);
            } else if (this.currentSession.questionsAttempted > 30) {
                fatigueLevel = Math.min(fatigueLevel + 0.1, 1.0);
            }
            
            // 정확도 하락에 따른 피로도 증가
            if (this.currentSession.questionsAttempted > 10) {
                const accuracy = this.currentSession.correctAnswers / this.currentSession.questionsAttempted;
                if (accuracy < 0.5) {
                    fatigueLevel = Math.min(fatigueLevel + 0.1, 1.0);
                }
            }
            
            this.currentSession.fatigueLevel = Math.round(fatigueLevel * 100) / 100;
            
            // 피로도 트렌드 업데이트
            this.updateFatigueTrend(fatigueLevel);
            
            console.log(`😴 피로도 분석: ${(fatigueLevel * 100).toFixed(1)}%`);
        } catch (error) {
            console.error(`❌ 피로도 분석 실패:`, error);
        }
    }

    /**
     * 집중도 트렌드 업데이트
     */
    updateConcentrationTrend(concentrationScore) {
        try {
            const trend = this.learningPatterns.concentrationTrends.trend;
            trend.push({
                timestamp: new Date().toISOString(),
                score: concentrationScore
            });
            
            // 최근 20개 데이터만 유지
            if (trend.length > 20) {
                trend.splice(0, trend.length - 20);
            }
            
            // 집중도 수준 분류
            if (concentrationScore > 0.8) {
                this.learningPatterns.concentrationTrends.high++;
            } else if (concentrationScore > 0.5) {
                this.learningPatterns.concentrationTrends.medium++;
            } else {
                this.learningPatterns.concentrationTrends.low++;
            }
            
        } catch (error) {
            console.error(`❌ 집중도 트렌드 업데이트 실패:`, error);
        }
    }

    /**
     * 피로도 트렌드 업데이트
     */
    updateFatigueTrend(fatigueLevel) {
        try {
            const trend = this.learningPatterns.fatigueTrends.trend;
            trend.push({
                timestamp: new Date().toISOString(),
                level: fatigueLevel
            });
            
            // 최근 20개 데이터만 유지
            if (trend.length > 20) {
                trend.splice(0, trend.length - 20);
            }
            
            // 피로도 수준 분류
            if (fatigueLevel > 0.7) {
                this.learningPatterns.fatigueTrends.high++;
            } else if (fatigueLevel > 0.3) {
                this.learningPatterns.fatigueTrends.medium++;
            } else {
                this.learningPatterns.fatigueTrends.low++;
            }
            
        } catch (error) {
            console.error(`❌ 피로도 트렌드 업데이트 실패:`, error);
        }
    }

    /**
     * 학습 패턴 업데이트
     */
    updateLearningPatterns() {
        try {
            // 시간대별 성과 업데이트
            this.updateTimeOfDayPerformance();
            
            // 문제 유형별 성과 업데이트
            this.updateQuestionTypePerformance();
            
            // 난이도 진행 업데이트
            this.updateDifficultyProgression();
            
            console.log(`📊 학습 패턴 업데이트 완료`);
        } catch (error) {
            console.error(`❌ 학습 패턴 업데이트 실패:`, error);
        }
    }

    /**
     * 시간대별 성과 업데이트
     */
    updateTimeOfDayPerformance() {
        try {
            const currentHour = new Date().getHours();
            const timePerformance = this.learningPatterns.timeOfDayPerformance[currentHour];
            
            if (timePerformance) {
                timePerformance.questionsAttempted = this.currentSession.questionsAttempted;
                timePerformance.correctAnswers = this.currentSession.correctAnswers;
                timePerformance.averageTime = this.currentSession.averageTimePerQuestion;
                timePerformance.concentrationScore = this.currentSession.concentrationScore;
            }
        } catch (error) {
            console.error(`❌ 시간대별 성과 업데이트 실패:`, error);
        }
    }

    /**
     * 문제 유형별 성과 업데이트
     */
    updateQuestionTypePerformance() {
        try {
            // 현재는 기본값으로 설정 (실제 구현에서는 문제 유형 정보 필요)
            const questionType = "객관식";
            const performance = this.learningPatterns.questionTypePerformance[questionType];
            
            if (performance) {
                performance.attempted = this.currentSession.questionsAttempted;
                performance.correct = this.currentSession.correctAnswers;
                performance.averageTime = this.currentSession.averageTimePerQuestion;
            }
        } catch (error) {
            console.error(`❌ 문제 유형별 성과 업데이트 실패:`, error);
        }
    }

    /**
     * 난이도 진행 업데이트
     */
    updateDifficultyProgression() {
        try {
            // 현재는 기본값으로 설정 (실제 구현에서는 난이도 정보 필요)
            const difficulty = "medium";
            const progression = this.learningPatterns.difficultyProgression[difficulty];
            
            if (progression) {
                progression.attempted = this.currentSession.questionsAttempted;
                progression.correct = this.currentSession.correctAnswers;
                progression.averageTime = this.currentSession.averageTimePerQuestion;
            }
        } catch (error) {
            console.error(`❌ 난이도 진행 업데이트 실패:`, error);
        }
    }

    /**
     * 문제 풀이 활동 기록
     */
    recordQuestionActivity(questionData, isCorrect, timeSpent) {
        try {
            this.lastActivityTime = new Date();
            
            // 세션 통계 업데이트
            this.currentSession.questionsAttempted++;
            if (isCorrect) {
                this.currentSession.correctAnswers++;
            }
            
            // 평균 시간 재계산
            const totalTime = this.currentSession.averageTimePerQuestion * (this.currentSession.questionsAttempted - 1) + timeSpent;
            this.currentSession.averageTimePerQuestion = Math.round(totalTime / this.currentSession.questionsAttempted);
            
            // 오답 패턴 분석
            if (!isCorrect) {
                this.analyzeErrorPattern(questionData, timeSpent);
            }
            
            console.log(`📝 문제 활동 기록: ${isCorrect ? '정답' : '오답'}, ${timeSpent}초`);
        } catch (error) {
            console.error(`❌ 문제 활동 기록 실패:`, error);
        }
    }

    /**
     * 오답 패턴 분석
     */
    analyzeErrorPattern(questionData, timeSpent) {
        try {
            const errorPatterns = this.learningPatterns.errorPatterns;
            
            if (timeSpent < 30) {
                // 빠른 오답: 부주의한 실수
                errorPatterns.carelessMistakes++;
            } else if (timeSpent > 120) {
                // 느린 오답: 시간 압박
                errorPatterns.timePressureErrors++;
            } else if (this.currentSession.fatigueLevel > 0.7) {
                // 피로도 높을 때: 피로 실수
                errorPatterns.fatigueErrors++;
            } else {
                // 개념적 오류
                errorPatterns.conceptualErrors++;
            }
            
            console.log(`🔍 오답 패턴 분석: ${Object.keys(errorPatterns).find(key => errorPatterns[key] > 0)}`);
        } catch (error) {
            console.error(`❌ 오답 패턴 분석 실패:`, error);
        }
    }

    /**
     * 학습 효율성 측정
     */
    calculateLearningEfficiency() {
        try {
            const session = this.currentSession;
            
            if (session.questionsAttempted === 0) {
                return {
                    efficiency: 0,
                    accuracy: 0,
                    speed: 0,
                    concentration: 0,
                    overall: 0
                };
            }
            
            // 정확도
            const accuracy = session.correctAnswers / session.questionsAttempted;
            
            // 속도 (문제당 평균 시간, 낮을수록 좋음)
            const speed = Math.max(0, 1 - (session.averageTimePerQuestion / 120)); // 2분을 기준으로 정규화
            
            // 집중도
            const concentration = session.concentrationScore;
            
            // 피로도 (낮을수록 좋음)
            const fatigue = Math.max(0, 1 - session.fatigueLevel);
            
            // 종합 효율성
            const efficiency = (accuracy * 0.4 + speed * 0.2 + concentration * 0.2 + fatigue * 0.2);
            
            return {
                efficiency: Math.round(efficiency * 100) / 100,
                accuracy: Math.round(accuracy * 100) / 100,
                speed: Math.round(speed * 100) / 100,
                concentration: Math.round(concentration * 100) / 100,
                fatigue: Math.round(fatigue * 100) / 100,
                overall: Math.round(efficiency * 100)
            };
        } catch (error) {
            console.error(`❌ 학습 효율성 측정 실패:`, error);
            return { efficiency: 0, accuracy: 0, speed: 0, concentration: 0, overall: 0 };
        }
    }

    /**
     * 학습 패턴 분석
     */
    analyzeLearningPatterns() {
        try {
            const patterns = {
                optimalTimeSlots: this.findOptimalTimeSlots(),
                preferredQuestionTypes: this.findPreferredQuestionTypes(),
                difficultyPreference: this.findDifficultyPreference(),
                commonErrorPatterns: this.findCommonErrorPatterns(),
                concentrationPatterns: this.analyzeConcentrationPatterns(),
                fatiguePatterns: this.analyzeFatiguePatterns()
            };
            
            console.log(`📊 학습 패턴 분석 완료`);
            return patterns;
        } catch (error) {
            console.error(`❌ 학습 패턴 분석 실패:`, error);
            return {};
        }
    }

    /**
     * 최적 시간대 찾기
     */
    findOptimalTimeSlots() {
        try {
            const timePerformance = this.learningPatterns.timeOfDayPerformance;
            const optimalSlots = [];
            
            Object.keys(timePerformance).forEach(hour => {
                const performance = timePerformance[hour];
                if (performance.questionsAttempted > 5) {
                    const accuracy = performance.correctAnswers / performance.questionsAttempted;
                    if (accuracy > 0.7) {
                        optimalSlots.push({
                            hour: parseInt(hour),
                            accuracy: accuracy,
                            concentration: performance.concentrationScore
                        });
                    }
                }
            });
            
            return optimalSlots.sort((a, b) => b.accuracy - a.accuracy);
        } catch (error) {
            console.error(`❌ 최적 시간대 분석 실패:`, error);
            return [];
        }
    }

    /**
     * 선호 문제 유형 찾기
     */
    findPreferredQuestionTypes() {
        try {
            const questionTypes = this.learningPatterns.questionTypePerformance;
            const preferences = [];
            
            Object.keys(questionTypes).forEach(type => {
                const performance = questionTypes[type];
                if (performance.attempted > 0) {
                    const accuracy = performance.correct / performance.attempted;
                    preferences.push({
                        type: type,
                        accuracy: accuracy,
                        averageTime: performance.averageTime
                    });
                }
            });
            
            return preferences.sort((a, b) => b.accuracy - a.accuracy);
        } catch (error) {
            console.error(`❌ 선호 문제 유형 분석 실패:`, error);
            return [];
        }
    }

    /**
     * 난이도 선호도 찾기
     */
    findDifficultyPreference() {
        try {
            const difficulties = this.learningPatterns.difficultyProgression;
            const preferences = [];
            
            Object.keys(difficulties).forEach(difficulty => {
                const performance = difficulties[difficulty];
                if (performance.attempted > 0) {
                    const accuracy = performance.correct / performance.attempted;
                    preferences.push({
                        difficulty: difficulty,
                        accuracy: accuracy,
                        averageTime: performance.averageTime
                    });
                }
            });
            
            return preferences.sort((a, b) => b.accuracy - a.accuracy);
        } catch (error) {
            console.error(`❌ 난이도 선호도 분석 실패:`, error);
            return [];
        }
    }

    /**
     * 일반적인 오답 패턴 찾기
     */
    findCommonErrorPatterns() {
        try {
            const errorPatterns = this.learningPatterns.errorPatterns;
            const totalErrors = Object.values(errorPatterns).reduce((sum, count) => sum + count, 0);
            
            if (totalErrors === 0) return [];
            
            const patterns = [];
            Object.keys(errorPatterns).forEach(pattern => {
                const count = errorPatterns[pattern];
                if (count > 0) {
                    patterns.push({
                        pattern: pattern,
                        count: count,
                        percentage: Math.round((count / totalErrors) * 100)
                    });
                }
            });
            
            return patterns.sort((a, b) => b.count - a.count);
        } catch (error) {
            console.error(`❌ 오답 패턴 분석 실패:`, error);
            return [];
        }
    }

    /**
     * 집중도 패턴 분석
     */
    analyzeConcentrationPatterns() {
        try {
            const trends = this.learningPatterns.concentrationTrends;
            const total = trends.high + trends.medium + trends.low;
            
            if (total === 0) return { high: 0, medium: 0, low: 0 };
            
            return {
                high: Math.round((trends.high / total) * 100),
                medium: Math.round((trends.medium / total) * 100),
                low: Math.round((trends.low / total) * 100)
            };
        } catch (error) {
            console.error(`❌ 집중도 패턴 분석 실패:`, error);
            return { high: 0, medium: 0, low: 0 };
        }
    }

    /**
     * 피로도 패턴 분석
     */
    analyzeFatiguePatterns() {
        try {
            const trends = this.learningPatterns.fatigueTrends;
            const total = trends.high + trends.medium + trends.low;
            
            if (total === 0) return { high: 0, medium: 0, low: 0 };
            
            return {
                high: Math.round((trends.high / total) * 100),
                medium: Math.round((trends.medium / total) * 100),
                low: Math.round((trends.low / total) * 100)
            };
        } catch (error) {
            console.error(`❌ 피로도 패턴 분석 실패:`, error);
            return { high: 0, medium: 0, low: 0 };
        }
    }

    /**
     * 세션 종료
     */
    endSession() {
        try {
            if (this.monitoringInterval) {
                clearInterval(this.monitoringInterval);
                this.monitoringInterval = null;
            }
            
            // 최종 세션 데이터 저장
            this.updateSessionMetrics();
            this.analyticsData.currentSession = { ...this.currentSession };
            
            // 세션 히스토리에 추가
            this.analyticsData.sessionHistory.push({
                ...this.currentSession,
                endTime: new Date().toISOString(),
                efficiency: this.calculateLearningEfficiency()
            });
            
            // 최근 50개 세션만 유지
            if (this.analyticsData.sessionHistory.length > 50) {
                this.analyticsData.sessionHistory = this.analyticsData.sessionHistory.slice(-50);
            }
            
            // 성과 메트릭 업데이트
            this.updatePerformanceMetrics();
            
            this.saveAnalyticsData();
            console.log(`🏁 세션 종료: ${this.currentSession.questionsAttempted}문제 풀이`);
            
        } catch (error) {
            console.error(`❌ 세션 종료 실패:`, error);
        }
    }

    /**
     * 성과 메트릭 업데이트
     */
    updatePerformanceMetrics() {
        try {
            const history = this.analyticsData.sessionHistory;
            const metrics = this.analyticsData.performanceMetrics;
            
            metrics.totalSessions = history.length;
            
            if (history.length > 0) {
                const totalDuration = history.reduce((sum, session) => sum + session.sessionDuration, 0);
                const totalQuestions = history.reduce((sum, session) => sum + session.questionsAttempted, 0);
                const totalCorrect = history.reduce((sum, session) => sum + session.correctAnswers, 0);
                const totalConcentration = history.reduce((sum, session) => sum + session.concentrationScore, 0);
                
                metrics.averageSessionDuration = Math.round(totalDuration / history.length);
                metrics.averageQuestionsPerSession = Math.round(totalQuestions / history.length);
                metrics.averageAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) / 100 : 0;
                metrics.averageConcentration = Math.round((totalConcentration / history.length) * 100) / 100;
            }
            
            console.log(`📈 성과 메트릭 업데이트 완료`);
        } catch (error) {
            console.error(`❌ 성과 메트릭 업데이트 실패:`, error);
        }
    }

    /**
     * 실시간 분석 데이터 저장
     */
    saveAnalyticsData() {
        try {
            localStorage.setItem('aicu_realtime_analytics', JSON.stringify(this.analyticsData));
            console.log(`💾 실시간 분석 데이터 저장 완료`);
        } catch (error) {
            console.error(`❌ 실시간 분석 데이터 저장 실패:`, error);
        }
    }

    /**
     * 시스템 정보 반환
     */
    getSystemInfo() {
        return {
            systemName: this.systemName,
            version: this.version,
            isInitialized: this.isInitialized,
            currentSession: this.currentSession,
            learningPatterns: this.learningPatterns,
            performanceMetrics: this.analyticsData.performanceMetrics,
            sessionHistory: this.analyticsData.sessionHistory.length
        };
    }

    /**
     * 데이터 초기화
     */
    resetAnalyticsData() {
        try {
            this.analyticsData = this.createDefaultAnalyticsData();
            this.learningPatterns = this.initializeLearningPatterns();
            this.currentSession = null;
            this.sessionStartTime = null;
            this.lastActivityTime = null;
            
            if (this.monitoringInterval) {
                clearInterval(this.monitoringInterval);
                this.monitoringInterval = null;
            }
            
            this.saveAnalyticsData();
            console.log(`🔄 실시간 분석 데이터 초기화 완료`);
        } catch (error) {
            console.error(`❌ 실시간 분석 데이터 초기화 실패:`, error);
        }
    }
}

// 전역 인스턴스 생성
window.realTimeLearningAnalytics = new RealTimeLearningAnalytics();

// 자동 초기화
document.addEventListener('DOMContentLoaded', function() {
    if (window.realTimeLearningAnalytics && !window.realTimeLearningAnalytics.isInitialized) {
        window.realTimeLearningAnalytics.initialize();
    }
});

console.log(`📊 실시간 학습 분석 시스템 모듈 로드 완료`);










