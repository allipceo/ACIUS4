/**
 * 학습 성과 예측 시스템 - AI 기반 학습 성과 예측 및 최적화 전략
 * 시험 합격 가능성 예측, 학습 성과 향상 예측, 최적 학습 시간대 분석, 학습 전략 최적화
 */

class LearningOutcomePredictor {
    constructor() {
        this.systemName = "Learning Outcome Predictor";
        this.version = "1.0.0";
        this.isInitialized = false;
        this.predictionData = {};
        this.predictionModels = {};
        this.optimizationStrategies = {};
        
        console.log(`🔮 ${this.systemName} v${this.version} 초기화 중...`);
    }

    /**
     * 시스템 초기화
     */
    initialize() {
        try {
            this.loadPredictionData();
            this.initializePredictionModels();
            this.analyzeUserData();
            
            this.isInitialized = true;
            console.log(`✅ ${this.systemName} 초기화 완료`);
            return true;
        } catch (error) {
            console.error(`❌ ${this.systemName} 초기화 실패:`, error);
            return false;
        }
    }

    /**
     * 예측 데이터 로드
     */
    loadPredictionData() {
        try {
            const data = localStorage.getItem('aicu_learning_predictions');
            if (data) {
                this.predictionData = JSON.parse(data);
            } else {
                this.predictionData = this.createDefaultPredictionData();
                this.savePredictionData();
            }
            console.log(`📊 학습 예측 데이터 로드 완료`);
        } catch (error) {
            console.error(`❌ 학습 예측 데이터 로드 실패:`, error);
            this.predictionData = this.createDefaultPredictionData();
        }
    }

    /**
     * 기본 예측 데이터 생성
     */
    createDefaultPredictionData() {
        return {
            examSuccessProbability: 0.5,
            expectedScore: 60,
            timeToTarget: 90,
            optimalStudySchedule: {},
            recommendedStrategies: [],
            predictionHistory: [],
            performanceMetrics: {
                predictionAccuracy: 0,
                totalPredictions: 0,
                successfulPredictions: 0,
                averageDeviation: 0
            },
            userFactors: {
                currentLevel: "beginner",
                studyConsistency: 0.5,
                learningEfficiency: 0.5,
                motivationLevel: "medium",
                timeAvailability: 0.5
            }
        };
    }

    /**
     * 예측 모델 초기화
     */
    initializePredictionModels() {
        try {
            this.predictionModels = {
                examSuccess: this.createExamSuccessModel(),
                scorePrediction: this.createScorePredictionModel(),
                timeToTarget: this.createTimeToTargetModel(),
                optimalSchedule: this.createOptimalScheduleModel()
            };
            
            console.log(`🧠 예측 모델 초기화 완료`);
        } catch (error) {
            console.error(`❌ 예측 모델 초기화 실패:`, error);
        }
    }

    /**
     * 시험 합격 예측 모델 생성
     */
    createExamSuccessModel() {
        return {
            factors: {
                accuracy: { weight: 0.3, threshold: 0.7 },
                consistency: { weight: 0.25, threshold: 0.6 },
                studyTime: { weight: 0.2, threshold: 100 },
                motivation: { weight: 0.15, threshold: 0.7 },
                weakAreas: { weight: 0.1, threshold: 2 }
            },
            algorithm: "weighted_linear"
        };
    }

    /**
     * 점수 예측 모델 생성
     */
    createScorePredictionModel() {
        return {
            factors: {
                currentAccuracy: { weight: 0.4, baseline: 60 },
                improvementRate: { weight: 0.3, baseline: 0.1 },
                studyIntensity: { weight: 0.2, baseline: 0.5 },
                timeRemaining: { weight: 0.1, baseline: 90 }
            },
            algorithm: "regression"
        };
    }

    /**
     * 목표 달성 시간 예측 모델 생성
     */
    createTimeToTargetModel() {
        return {
            factors: {
                targetScore: { weight: 0.3, baseline: 80 },
                currentScore: { weight: 0.25, baseline: 60 },
                studyEfficiency: { weight: 0.25, baseline: 0.5 },
                dailyStudyTime: { weight: 0.2, baseline: 2 }
            },
            algorithm: "time_estimation"
        };
    }

    /**
     * 최적 스케줄 모델 생성
     */
    createOptimalScheduleModel() {
        return {
            factors: {
                peakHours: { weight: 0.3, default: [9, 14, 20] },
                studyDuration: { weight: 0.25, default: 45 },
                breakIntervals: { weight: 0.25, default: 15 },
                subjectRotation: { weight: 0.2, default: 4 }
            },
            algorithm: "optimization"
        };
    }

    /**
     * 사용자 데이터 분석
     */
    analyzeUserData() {
        try {
            const progressData = this.getProgressData();
            const userInfo = progressData?.userInfo || {};
            const statistics = progressData?.statistics || {};
            
            // 현재 수준 분석
            const currentLevel = this.analyzeCurrentLevel(statistics);
            
            // 학습 일관성 분석
            const studyConsistency = this.analyzeStudyConsistency(progressData);
            
            // 학습 효율성 분석
            const learningEfficiency = this.analyzeLearningEfficiency(statistics);
            
            // 동기 수준 분석
            const motivationLevel = this.analyzeMotivationLevel(progressData);
            
            // 시간 가용성 분석
            const timeAvailability = this.analyzeTimeAvailability(userInfo);
            
            this.predictionData.userFactors = {
                currentLevel,
                studyConsistency,
                learningEfficiency,
                motivationLevel,
                timeAvailability
            };
            
            console.log(`📈 사용자 데이터 분석 완료`);
        } catch (error) {
            console.error(`❌ 사용자 데이터 분석 실패:`, error);
        }
    }

    /**
     * 현재 수준 분석
     */
    analyzeCurrentLevel(statistics) {
        try {
            const totalAttempted = statistics.totalAttempted || 0;
            const totalCorrect = statistics.totalCorrect || 0;
            const accuracy = totalAttempted > 0 ? totalCorrect / totalAttempted : 0;
            
            if (totalAttempted < 50) return "beginner";
            else if (totalAttempted < 200) return accuracy > 0.7 ? "intermediate" : "beginner";
            else return accuracy > 0.85 ? "advanced" : (accuracy > 0.7 ? "intermediate" : "beginner");
        } catch (error) {
            console.error(`❌ 현재 수준 분석 실패:`, error);
            return "beginner";
        }
    }

    /**
     * 학습 일관성 분석
     */
    analyzeStudyConsistency(progressData) {
        try {
            const basicLearning = progressData?.basicLearning || {};
            const lastStudyDate = basicLearning.lastStudyDate;
            
            if (!lastStudyDate) return 0.3;
            
            const daysSinceLastStudy = Math.floor((Date.now() - new Date(lastStudyDate).getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysSinceLastStudy <= 1) return 0.9;
            else if (daysSinceLastStudy <= 3) return 0.7;
            else if (daysSinceLastStudy <= 7) return 0.5;
            else return 0.3;
        } catch (error) {
            console.error(`❌ 학습 일관성 분석 실패:`, error);
            return 0.5;
        }
    }

    /**
     * 학습 효율성 분석
     */
    analyzeLearningEfficiency(statistics) {
        try {
            const totalAttempted = statistics.totalAttempted || 0;
            const totalCorrect = statistics.totalCorrect || 0;
            const todayAttempted = statistics.todayAttempted || 0;
            const todayCorrect = statistics.todayCorrect || 0;
            
            if (totalAttempted === 0) return 0.5;
            
            const overallAccuracy = totalCorrect / totalAttempted;
            const todayAccuracy = todayAttempted > 0 ? todayCorrect / todayAttempted : 0;
            
            // 전반적 정확도와 오늘의 정확도를 종합하여 효율성 계산
            const efficiency = (overallAccuracy * 0.7 + todayAccuracy * 0.3);
            
            return Math.min(Math.max(efficiency, 0.1), 1.0);
        } catch (error) {
            console.error(`❌ 학습 효율성 분석 실패:`, error);
            return 0.5;
        }
    }

    /**
     * 동기 수준 분석
     */
    analyzeMotivationLevel(progressData) {
        try {
            const statistics = progressData?.statistics || {};
            const todayAttempted = statistics.todayAttempted || 0;
            const basicLearning = progressData?.basicLearning || {};
            const lastStudyDate = basicLearning.lastStudyDate;
            
            const daysSinceLastStudy = lastStudyDate ? 
                Math.floor((Date.now() - new Date(lastStudyDate).getTime()) / (1000 * 60 * 60 * 24)) : 7;
            
            if (todayAttempted > 20 && daysSinceLastStudy <= 1) return "high";
            else if (todayAttempted > 10 && daysSinceLastStudy <= 3) return "medium";
            else return "low";
        } catch (error) {
            console.error(`❌ 동기 수준 분석 실패:`, error);
            return "medium";
        }
    }

    /**
     * 시간 가용성 분석
     */
    analyzeTimeAvailability(userInfo) {
        try {
            // 기본적으로 중간 수준으로 가정
            return 0.5;
        } catch (error) {
            console.error(`❌ 시간 가용성 분석 실패:`, error);
            return 0.5;
        }
    }

    /**
     * 시험 합격 가능성 예측
     */
    predictExamSuccess() {
        try {
            const factors = this.predictionData.userFactors;
            const model = this.predictionModels.examSuccess;
            
            let probability = 0;
            
            // 정확도 점수
            const accuracyScore = factors.learningEfficiency;
            probability += accuracyScore * model.factors.accuracy.weight;
            
            // 일관성 점수
            const consistencyScore = factors.studyConsistency;
            probability += consistencyScore * model.factors.consistency.weight;
            
            // 학습 시간 점수 (기본값 사용)
            const studyTimeScore = 0.6; // 기본 학습 시간 가정
            probability += studyTimeScore * model.factors.studyTime.weight;
            
            // 동기 점수
            const motivationScore = this.convertMotivationToScore(factors.motivationLevel);
            probability += motivationScore * model.factors.motivation.weight;
            
            // 약점 영역 점수
            const weakAreasScore = this.calculateWeakAreasScore();
            probability += weakAreasScore * model.factors.weakAreas.weight;
            
            // 확률 정규화 (0-1 범위)
            probability = Math.min(Math.max(probability, 0), 1);
            
            this.predictionData.examSuccessProbability = Math.round(probability * 100) / 100;
            
            console.log(`🎯 시험 합격 가능성 예측: ${(probability * 100).toFixed(1)}%`);
            return this.predictionData.examSuccessProbability;
        } catch (error) {
            console.error(`❌ 시험 합격 가능성 예측 실패:`, error);
            return 0.5;
        }
    }

    /**
     * 동기를 점수로 변환
     */
    convertMotivationToScore(motivationLevel) {
        switch (motivationLevel) {
            case "high": return 0.9;
            case "medium": return 0.6;
            case "low": return 0.3;
            default: return 0.5;
        }
    }

    /**
     * 약점 영역 점수 계산
     */
    calculateWeakAreasScore() {
        try {
            const progressData = this.getProgressData();
            const largeCategory = progressData?.largeCategory || {};
            
            let weakAreaCount = 0;
            Object.keys(largeCategory).forEach(category => {
                const categoryData = largeCategory[category];
                const accuracy = categoryData.totalAttempted > 0 ? 
                    categoryData.totalCorrect / categoryData.totalAttempted : 0;
                
                if (accuracy < 0.6 && categoryData.totalAttempted > 10) {
                    weakAreaCount++;
                }
            });
            
            // 약점 영역이 적을수록 높은 점수
            return Math.max(0, 1 - (weakAreaCount * 0.2));
        } catch (error) {
            console.error(`❌ 약점 영역 점수 계산 실패:`, error);
            return 0.7;
        }
    }

    /**
     * 예상 점수 예측
     */
    predictExpectedScore() {
        try {
            const factors = this.predictionData.userFactors;
            const model = this.predictionModels.scorePrediction;
            
            let expectedScore = model.factors.currentAccuracy.baseline;
            
            // 현재 정확도 기반 점수
            const currentAccuracyScore = factors.learningEfficiency * 100;
            expectedScore += currentAccuracyScore * model.factors.currentAccuracy.weight;
            
            // 개선률 기반 점수
            const improvementRate = this.calculateImprovementRate();
            expectedScore += improvementRate * model.factors.improvementRate.weight * 100;
            
            // 학습 강도 기반 점수
            const studyIntensity = factors.studyConsistency;
            expectedScore += studyIntensity * model.factors.studyIntensity.weight * 20;
            
            // 남은 시간 기반 점수
            const timeRemaining = this.calculateTimeRemaining();
            expectedScore += timeRemaining * model.factors.timeRemaining.weight * 10;
            
            // 점수 정규화 (0-100 범위)
            expectedScore = Math.min(Math.max(expectedScore, 0), 100);
            
            this.predictionData.expectedScore = Math.round(expectedScore);
            
            console.log(`📊 예상 점수 예측: ${expectedScore.toFixed(1)}점`);
            return this.predictionData.expectedScore;
        } catch (error) {
            console.error(`❌ 예상 점수 예측 실패:`, error);
            return 60;
        }
    }

    /**
     * 개선률 계산
     */
    calculateImprovementRate() {
        try {
            const progressData = this.getProgressData();
            const statistics = progressData?.statistics || {};
            
            const totalAttempted = statistics.totalAttempted || 0;
            const totalCorrect = statistics.totalCorrect || 0;
            const todayAttempted = statistics.todayAttempted || 0;
            const todayCorrect = statistics.todayCorrect || 0;
            
            if (totalAttempted === 0 || todayAttempted === 0) return 0.1;
            
            const overallAccuracy = totalCorrect / totalAttempted;
            const todayAccuracy = todayCorrect / todayAttempted;
            
            // 오늘의 정확도가 전체 정확도보다 높으면 개선률 양수
            return Math.max(0, todayAccuracy - overallAccuracy);
        } catch (error) {
            console.error(`❌ 개선률 계산 실패:`, error);
            return 0.1;
        }
    }

    /**
     * 남은 시간 계산
     */
    calculateTimeRemaining() {
        try {
            const progressData = this.getProgressData();
            const userInfo = progressData?.userInfo || {};
            const examDate = userInfo.examDate;
            
            if (!examDate) return 0.5; // 기본값
            
            const examTime = new Date(examDate).getTime();
            const currentTime = Date.now();
            const daysRemaining = Math.floor((examTime - currentTime) / (1000 * 60 * 60 * 24));
            
            // 90일을 기준으로 정규화
            return Math.max(0, Math.min(1, daysRemaining / 90));
        } catch (error) {
            console.error(`❌ 남은 시간 계산 실패:`, error);
            return 0.5;
        }
    }

    /**
     * 목표 달성까지의 시간 예측
     */
    predictTimeToTarget() {
        try {
            const factors = this.predictionData.userFactors;
            const model = this.predictionModels.timeToTarget;
            
            const targetScore = 80; // 목표 점수
            const currentScore = this.predictionData.expectedScore;
            const studyEfficiency = factors.learningEfficiency;
            const dailyStudyTime = 2; // 일일 학습 시간 (시간)
            
            // 목표와 현재 점수 차이
            const scoreGap = targetScore - currentScore;
            
            // 학습 효율성과 일일 학습 시간을 고려한 시간 계산
            let timeToTarget = scoreGap / (studyEfficiency * dailyStudyTime * 0.1);
            
            // 최소 30일, 최대 180일로 제한
            timeToTarget = Math.min(Math.max(timeToTarget, 30), 180);
            
            this.predictionData.timeToTarget = Math.round(timeToTarget);
            
            console.log(`⏰ 목표 달성 시간 예측: ${timeToTarget.toFixed(0)}일`);
            return this.predictionData.timeToTarget;
        } catch (error) {
            console.error(`❌ 목표 달성 시간 예측 실패:`, error);
            return 90;
        }
    }

    /**
     * 최적 학습 스케줄 생성
     */
    generateOptimalStudySchedule() {
        try {
            const factors = this.predictionData.userFactors;
            const model = this.predictionModels.optimalSchedule;
            
            const schedule = {
                peakHours: this.identifyPeakHours(),
                studyDuration: this.calculateOptimalStudyDuration(factors),
                breakIntervals: this.calculateBreakIntervals(factors),
                subjectRotation: this.createSubjectRotation(),
                dailyPlan: this.createDailyPlan(factors)
            };
            
            this.predictionData.optimalStudySchedule = schedule;
            
            console.log(`📅 최적 학습 스케줄 생성 완료`);
            return schedule;
        } catch (error) {
            console.error(`❌ 최적 학습 스케줄 생성 실패:`, error);
            return {};
        }
    }

    /**
     * 피크 시간 식별
     */
    identifyPeakHours() {
        try {
            // 기본 피크 시간 (아침, 오후, 저녁)
            return [9, 14, 20];
        } catch (error) {
            console.error(`❌ 피크 시간 식별 실패:`, error);
            return [9, 14, 20];
        }
    }

    /**
     * 최적 학습 시간 계산
     */
    calculateOptimalStudyDuration(factors) {
        try {
            const baseDuration = 45; // 기본 45분
            const efficiencyMultiplier = factors.learningEfficiency;
            const motivationMultiplier = this.convertMotivationToScore(factors.motivationLevel);
            
            const optimalDuration = baseDuration * efficiencyMultiplier * motivationMultiplier;
            
            return Math.min(Math.max(optimalDuration, 30), 90); // 30-90분 범위
        } catch (error) {
            console.error(`❌ 최적 학습 시간 계산 실패:`, error);
            return 45;
        }
    }

    /**
     * 휴식 간격 계산
     */
    calculateBreakIntervals(factors) {
        try {
            const baseInterval = 15; // 기본 15분
            const concentrationMultiplier = factors.studyConsistency;
            
            const breakInterval = baseInterval / concentrationMultiplier;
            
            return Math.min(Math.max(breakInterval, 10), 30); // 10-30분 범위
        } catch (error) {
            console.error(`❌ 휴식 간격 계산 실패:`, error);
            return 15;
        }
    }

    /**
     * 과목 순환 계획 생성
     */
    createSubjectRotation() {
        try {
            return {
                재산보험: { frequency: 0.3, duration: 30 },
                특종보험: { frequency: 0.3, duration: 30 },
                배상보험: { frequency: 0.2, duration: 25 },
                해상보험: { frequency: 0.2, duration: 25 }
            };
        } catch (error) {
            console.error(`❌ 과목 순환 계획 생성 실패:`, error);
            return {};
        }
    }

    /**
     * 일일 계획 생성
     */
    createDailyPlan(factors) {
        try {
            const studyDuration = this.calculateOptimalStudyDuration(factors);
            const breakInterval = this.calculateBreakIntervals(factors);
            
            return {
                morning: {
                    time: "09:00-10:30",
                    subject: "재산보험",
                    duration: studyDuration,
                    focus: "개념 학습"
                },
                afternoon: {
                    time: "14:00-15:30",
                    subject: "특종보험",
                    duration: studyDuration,
                    focus: "문제 풀이"
                },
                evening: {
                    time: "20:00-21:30",
                    subject: "배상보험",
                    duration: studyDuration,
                    focus: "복습 및 정리"
                },
                breaks: {
                    interval: breakInterval,
                    activities: ["스트레칭", "간단한 운동", "명상"]
                }
            };
        } catch (error) {
            console.error(`❌ 일일 계획 생성 실패:`, error);
            return {};
        }
    }

    /**
     * 학습 전략 최적화 제안
     */
    generateOptimizationStrategies() {
        try {
            const strategies = [];
            const factors = this.predictionData.userFactors;
            
            // 정확도 개선 전략
            if (factors.learningEfficiency < 0.7) {
                strategies.push({
                    category: "정확도 개선",
                    strategy: "오답 노트 작성 및 정기적 복습",
                    priority: "high",
                    expectedImpact: "정확도 15% 향상"
                });
            }
            
            // 일관성 개선 전략
            if (factors.studyConsistency < 0.6) {
                strategies.push({
                    category: "학습 일관성",
                    strategy: "매일 같은 시간에 학습하는 습관 형성",
                    priority: "high",
                    expectedImpact: "일관성 25% 향상"
                });
            }
            
            // 동기 부여 전략
            if (factors.motivationLevel === "low") {
                strategies.push({
                    category: "동기 부여",
                    strategy: "작은 목표 설정 및 성취감 경험",
                    priority: "medium",
                    expectedImpact: "동기 수준 향상"
                });
            }
            
            // 시간 관리 전략
            strategies.push({
                category: "시간 관리",
                strategy: "피크 시간대 집중 학습 및 효율적 휴식",
                priority: "medium",
                expectedImpact: "학습 효율성 20% 향상"
            });
            
            // 약점 보완 전략
            const weakAreas = this.identifyWeakAreas();
            if (weakAreas.length > 0) {
                strategies.push({
                    category: "약점 보완",
                    strategy: `${weakAreas[0]} 영역 집중 학습`,
                    priority: "high",
                    expectedImpact: "전체 성과 10% 향상"
                });
            }
            
            this.predictionData.recommendedStrategies = strategies;
            
            console.log(`🎯 학습 전략 최적화 제안 생성: ${strategies.length}개`);
            return strategies;
        } catch (error) {
            console.error(`❌ 학습 전략 최적화 제안 생성 실패:`, error);
            return [];
        }
    }

    /**
     * 약점 영역 식별
     */
    identifyWeakAreas() {
        try {
            const progressData = this.getProgressData();
            const largeCategory = progressData?.largeCategory || {};
            const weakAreas = [];
            
            Object.keys(largeCategory).forEach(category => {
                const categoryData = largeCategory[category];
                const accuracy = categoryData.totalAttempted > 0 ? 
                    categoryData.totalCorrect / categoryData.totalAttempted : 0;
                
                if (accuracy < 0.6 && categoryData.totalAttempted > 10) {
                    weakAreas.push(category);
                }
            });
            
            return weakAreas;
        } catch (error) {
            console.error(`❌ 약점 영역 식별 실패:`, error);
            return [];
        }
    }

    /**
     * 종합 예측 생성
     */
    generateComprehensivePrediction() {
        try {
            const prediction = {
                examSuccess: this.predictExamSuccess(),
                expectedScore: this.predictExpectedScore(),
                timeToTarget: this.predictTimeToTarget(),
                optimalSchedule: this.generateOptimalStudySchedule(),
                strategies: this.generateOptimizationStrategies(),
                timestamp: new Date().toISOString(),
                confidence: this.calculatePredictionConfidence()
            };
            
            // 예측 히스토리에 추가
            this.predictionData.predictionHistory.push(prediction);
            
            // 최근 10개 예측만 유지
            if (this.predictionData.predictionHistory.length > 10) {
                this.predictionData.predictionHistory = this.predictionData.predictionHistory.slice(-10);
            }
            
            this.savePredictionData();
            console.log(`🔮 종합 예측 생성 완료`);
            return prediction;
        } catch (error) {
            console.error(`❌ 종합 예측 생성 실패:`, error);
            return {};
        }
    }

    /**
     * 예측 신뢰도 계산
     */
    calculatePredictionConfidence() {
        try {
            const factors = this.predictionData.userFactors;
            
            // 데이터 품질 기반 신뢰도
            const dataQuality = this.assessDataQuality();
            
            // 사용자 요인 기반 신뢰도
            const factorConfidence = (
                factors.studyConsistency * 0.3 +
                factors.learningEfficiency * 0.3 +
                this.convertMotivationToScore(factors.motivationLevel) * 0.2 +
                factors.timeAvailability * 0.2
            );
            
            const confidence = (dataQuality * 0.4 + factorConfidence * 0.6);
            
            return Math.round(confidence * 100) / 100;
        } catch (error) {
            console.error(`❌ 예측 신뢰도 계산 실패:`, error);
            return 0.7;
        }
    }

    /**
     * 데이터 품질 평가
     */
    assessDataQuality() {
        try {
            const progressData = this.getProgressData();
            const statistics = progressData?.statistics || {};
            
            const totalAttempted = statistics.totalAttempted || 0;
            const totalCorrect = statistics.totalCorrect || 0;
            
            // 데이터 양과 품질 평가
            if (totalAttempted < 10) return 0.3; // 데이터 부족
            else if (totalAttempted < 50) return 0.6; // 보통
            else if (totalAttempted < 200) return 0.8; // 양호
            else return 0.9; // 우수
            
        } catch (error) {
            console.error(`❌ 데이터 품질 평가 실패:`, error);
            return 0.5;
        }
    }

    /**
     * 진행 상황 데이터 가져오기
     */
    getProgressData() {
        try {
            const data = localStorage.getItem('aicu_progress');
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`❌ 진행 상황 데이터 로드 실패:`, error);
            return null;
        }
    }

    /**
     * 학습 예측 데이터 저장
     */
    savePredictionData() {
        try {
            localStorage.setItem('aicu_learning_predictions', JSON.stringify(this.predictionData));
            console.log(`💾 학습 예측 데이터 저장 완료`);
        } catch (error) {
            console.error(`❌ 학습 예측 데이터 저장 실패:`, error);
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
            userFactors: this.predictionData.userFactors,
            examSuccessProbability: this.predictionData.examSuccessProbability,
            expectedScore: this.predictionData.expectedScore,
            timeToTarget: this.predictionData.timeToTarget,
            predictionHistory: this.predictionData.predictionHistory.length
        };
    }

    /**
     * 데이터 초기화
     */
    resetPredictionData() {
        try {
            this.predictionData = this.createDefaultPredictionData();
            this.savePredictionData();
            console.log(`🔄 학습 예측 데이터 초기화 완료`);
        } catch (error) {
            console.error(`❌ 학습 예측 데이터 초기화 실패:`, error);
        }
    }
}

// 전역 인스턴스 생성
window.learningOutcomePredictor = new LearningOutcomePredictor();

// 자동 초기화
document.addEventListener('DOMContentLoaded', function() {
    if (window.learningOutcomePredictor && !window.learningOutcomePredictor.isInitialized) {
        window.learningOutcomePredictor.initialize();
    }
});

console.log(`🔮 학습 성과 예측 시스템 모듈 로드 완료`);











