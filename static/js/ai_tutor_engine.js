/**
 * AI 튜터 엔진 - 개인화된 학습 경험 제공
 * 학습 프로필 분석, 맞춤형 학습 전략 수립, 학습 동기 부여 관리
 */

class AITutorEngine {
    constructor() {
        this.systemName = "AI Tutor Engine";
        this.version = "1.0.0";
        this.isInitialized = false;
        this.userProfile = null;
        this.learningStrategy = null;
        this.motivationSystem = null;
        
        console.log(`🤖 ${this.systemName} v${this.version} 초기화 중...`);
    }

    /**
     * 시스템 초기화
     */
    initialize() {
        try {
            this.loadTutoringData();
            this.analyzeUserProfile();
            this.generateLearningStrategy();
            this.initializeMotivationSystem();
            
            this.isInitialized = true;
            console.log(`✅ ${this.systemName} 초기화 완료`);
            return true;
        } catch (error) {
            console.error(`❌ ${this.systemName} 초기화 실패:`, error);
            return false;
        }
    }

    /**
     * AI 튜터링 데이터 로드
     */
    loadTutoringData() {
        try {
            const data = localStorage.getItem('aicu_ai_tutoring');
            if (data) {
                this.tutoringData = JSON.parse(data);
            } else {
                this.tutoringData = this.createDefaultTutoringData();
                this.saveTutoringData();
            }
            console.log(`📊 AI 튜터링 데이터 로드 완료`);
        } catch (error) {
            console.error(`❌ AI 튜터링 데이터 로드 실패:`, error);
            this.tutoringData = this.createDefaultTutoringData();
        }
    }

    /**
     * 기본 AI 튜터링 데이터 생성
     */
    createDefaultTutoringData() {
        return {
            userProfile: {
                learningStyle: "visual",
                cognitiveLevel: "beginner",
                motivationLevel: "medium",
                preferredTimeSlots: ["morning", "afternoon"],
                weakAreas: [],
                strongAreas: [],
                learningGoals: ["합격"],
                studyPatterns: {
                    averageStudyTime: 60,
                    preferredQuestionTypes: ["객관식"],
                    concentrationPeaks: ["09:00", "14:00"]
                }
            },
            adaptiveQuestions: {
                currentLevel: "beginner",
                difficultyProgression: [0.3, 0.5, 0.7, 0.8, 0.9],
                generatedQuestions: [],
                performanceHistory: [],
                nextQuestionStrategy: "balanced"
            },
            realtimeAnalytics: {
                currentSession: {
                    startTime: null,
                    questionsAttempted: 0,
                    correctAnswers: 0,
                    averageTimePerQuestion: 0,
                    concentrationScore: 0,
                    fatigueLevel: 0
                },
                learningPatterns: {
                    timeOfDayPerformance: {},
                    questionTypePerformance: {},
                    difficultyProgression: {},
                    errorPatterns: {}
                }
            },
            intelligentFeedback: {
                personalizedAdvice: [],
                improvementSuggestions: [],
                motivationMessages: [],
                learningOptimizations: []
            },
            learningPredictions: {
                examSuccessProbability: 0.5,
                expectedScore: 60,
                timeToTarget: 90,
                optimalStudySchedule: {},
                recommendedStrategies: []
            }
        };
    }

    /**
     * 사용자 프로필 분석
     */
    analyzeUserProfile() {
        try {
            // 기존 통계 데이터에서 사용자 정보 추출
            const progressData = this.getProgressData();
            const userInfo = progressData?.userInfo || {};
            
            // 학습 스타일 분석
            const learningStyle = this.analyzeLearningStyle(progressData);
            
            // 인지 수준 분석
            const cognitiveLevel = this.analyzeCognitiveLevel(progressData);
            
            // 동기 수준 분석
            const motivationLevel = this.analyzeMotivationLevel(progressData);
            
            // 약점/강점 영역 분석
            const { weakAreas, strongAreas } = this.analyzePerformanceAreas(progressData);
            
            // 학습 패턴 분석
            const studyPatterns = this.analyzeStudyPatterns(progressData);
            
            // 사용자 프로필 업데이트
            this.tutoringData.userProfile = {
                learningStyle,
                cognitiveLevel,
                motivationLevel,
                preferredTimeSlots: this.analyzePreferredTimeSlots(progressData),
                weakAreas,
                strongAreas,
                learningGoals: userInfo.learningGoals || ["합격"],
                studyPatterns
            };
            
            this.userProfile = this.tutoringData.userProfile;
            console.log(`👤 사용자 프로필 분석 완료: ${learningStyle} 스타일, ${cognitiveLevel} 수준`);
            
        } catch (error) {
            console.error(`❌ 사용자 프로필 분석 실패:`, error);
        }
    }

    /**
     * 학습 스타일 분석
     */
    analyzeLearningStyle(progressData) {
        try {
            const basicLearning = progressData?.basicLearning || {};
            const largeCategory = progressData?.largeCategory || {};
            
            // 문제 풀이 패턴 분석
            const questionPatterns = this.analyzeQuestionPatterns(progressData);
            
            // 시간대별 성과 분석
            const timePerformance = this.analyzeTimePerformance(progressData);
            
            // 오답 패턴 분석
            const errorPatterns = this.analyzeErrorPatterns(progressData);
            
            // 학습 스타일 결정 로직
            if (questionPatterns.visualPreference > 0.7) {
                return "visual";
            } else if (questionPatterns.auditoryPreference > 0.7) {
                return "auditory";
            } else if (questionPatterns.kinestheticPreference > 0.7) {
                return "kinesthetic";
            } else {
                return "balanced";
            }
        } catch (error) {
            console.error(`❌ 학습 스타일 분석 실패:`, error);
            return "visual";
        }
    }

    /**
     * 인지 수준 분석
     */
    analyzeCognitiveLevel(progressData) {
        try {
            const totalAttempted = progressData?.statistics?.totalAttempted || 0;
            const totalCorrect = progressData?.statistics?.totalCorrect || 0;
            const accuracy = totalAttempted > 0 ? totalCorrect / totalAttempted : 0;
            
            // 문제 풀이 수와 정확도 기반 수준 판단
            if (totalAttempted < 50) {
                return "beginner";
            } else if (totalAttempted < 200) {
                return accuracy > 0.7 ? "intermediate" : "beginner";
            } else {
                if (accuracy > 0.85) return "advanced";
                else if (accuracy > 0.7) return "intermediate";
                else return "beginner";
            }
        } catch (error) {
            console.error(`❌ 인지 수준 분석 실패:`, error);
            return "beginner";
        }
    }

    /**
     * 동기 수준 분석
     */
    analyzeMotivationLevel(progressData) {
        try {
            const todayAttempted = progressData?.statistics?.todayAttempted || 0;
            const lastStudyDate = progressData?.basicLearning?.lastStudyDate;
            const totalAttempted = progressData?.statistics?.totalAttempted || 0;
            
            // 최근 학습 활동 기반 동기 수준 판단
            const daysSinceLastStudy = lastStudyDate ? 
                Math.floor((Date.now() - new Date(lastStudyDate).getTime()) / (1000 * 60 * 60 * 24)) : 7;
            
            if (todayAttempted > 20 && daysSinceLastStudy <= 1) {
                return "high";
            } else if (todayAttempted > 10 && daysSinceLastStudy <= 3) {
                return "medium";
            } else {
                return "low";
            }
        } catch (error) {
            console.error(`❌ 동기 수준 분석 실패:`, error);
            return "medium";
        }
    }

    /**
     * 성과 영역 분석 (약점/강점)
     */
    analyzePerformanceAreas(progressData) {
        try {
            const largeCategory = progressData?.largeCategory || {};
            const weakAreas = [];
            const strongAreas = [];
            
            // 각 카테고리별 성과 분석
            Object.keys(largeCategory).forEach(category => {
                const categoryData = largeCategory[category];
                const accuracy = categoryData.totalAttempted > 0 ? 
                    categoryData.totalCorrect / categoryData.totalAttempted : 0;
                
                if (accuracy < 0.6 && categoryData.totalAttempted > 10) {
                    weakAreas.push(category);
                } else if (accuracy > 0.8 && categoryData.totalAttempted > 20) {
                    strongAreas.push(category);
                }
            });
            
            return { weakAreas, strongAreas };
        } catch (error) {
            console.error(`❌ 성과 영역 분석 실패:`, error);
            return { weakAreas: [], strongAreas: [] };
        }
    }

    /**
     * 학습 패턴 분석
     */
    analyzeStudyPatterns(progressData) {
        try {
            const basicLearning = progressData?.basicLearning || {};
            const totalAttempted = progressData?.statistics?.totalAttempted || 0;
            const totalCorrect = progressData?.statistics?.totalCorrect || 0;
            
            // 평균 학습 시간 추정 (문제당 2분 가정)
            const averageStudyTime = totalAttempted * 2;
            
            // 선호 문제 유형 분석
            const preferredQuestionTypes = this.analyzePreferredQuestionTypes(progressData);
            
            // 집중도 피크 시간 분석
            const concentrationPeaks = this.analyzeConcentrationPeaks(progressData);
            
            return {
                averageStudyTime: Math.min(averageStudyTime, 180), // 최대 3시간
                preferredQuestionTypes,
                concentrationPeaks
            };
        } catch (error) {
            console.error(`❌ 학습 패턴 분석 실패:`, error);
            return {
                averageStudyTime: 60,
                preferredQuestionTypes: ["객관식"],
                concentrationPeaks: ["09:00", "14:00"]
            };
        }
    }

    /**
     * 선호 시간대 분석
     */
    analyzePreferredTimeSlots(progressData) {
        try {
            // 현재 시간 기반 기본 추천
            const currentHour = new Date().getHours();
            const timeSlots = [];
            
            if (currentHour >= 6 && currentHour <= 12) {
                timeSlots.push("morning");
            }
            if (currentHour >= 12 && currentHour <= 18) {
                timeSlots.push("afternoon");
            }
            if (currentHour >= 18 || currentHour <= 6) {
                timeSlots.push("evening");
            }
            
            return timeSlots.length > 0 ? timeSlots : ["morning", "afternoon"];
        } catch (error) {
            console.error(`❌ 선호 시간대 분석 실패:`, error);
            return ["morning", "afternoon"];
        }
    }

    /**
     * 맞춤형 학습 전략 생성
     */
    generateLearningStrategy() {
        try {
            const profile = this.userProfile;
            const strategy = {
                focusAreas: this.determineFocusAreas(profile),
                studySchedule: this.generateStudySchedule(profile),
                questionStrategy: this.determineQuestionStrategy(profile),
                motivationTechniques: this.selectMotivationTechniques(profile),
                learningMethods: this.selectLearningMethods(profile)
            };
            
            this.learningStrategy = strategy;
            this.tutoringData.learningStrategy = strategy;
            console.log(`📋 맞춤형 학습 전략 생성 완료`);
            
        } catch (error) {
            console.error(`❌ 학습 전략 생성 실패:`, error);
        }
    }

    /**
     * 집중 영역 결정
     */
    determineFocusAreas(profile) {
        const focusAreas = [];
        
        // 약점 영역 우선 집중
        if (profile.weakAreas.length > 0) {
            focusAreas.push(...profile.weakAreas.slice(0, 2));
        }
        
        // 학습 목표에 따른 추가 영역
        if (profile.learningGoals.includes("고득점")) {
            focusAreas.push("배상보험", "해상보험");
        }
        
        return focusAreas.length > 0 ? focusAreas : ["재산보험", "특종보험"];
    }

    /**
     * 학습 스케줄 생성
     */
    generateStudySchedule(profile) {
        const schedule = {
            dailyGoal: this.calculateDailyGoal(profile),
            weeklyPlan: this.createWeeklyPlan(profile),
            breakIntervals: this.determineBreakIntervals(profile),
            reviewSchedule: this.createReviewSchedule(profile)
        };
        
        return schedule;
    }

    /**
     * 일일 목표 계산
     */
    calculateDailyGoal(profile) {
        const baseGoal = 20; // 기본 20문제
        const motivationMultiplier = {
            high: 1.5,
            medium: 1.0,
            low: 0.7
        };
        
        return Math.round(baseGoal * motivationMultiplier[profile.motivationLevel]);
    }

    /**
     * 주간 계획 생성
     */
    createWeeklyPlan(profile) {
        const dailyGoal = this.calculateDailyGoal(profile);
        const weeklyPlan = {
            monday: { target: dailyGoal, focus: profile.weakAreas[0] || "재산보험" },
            tuesday: { target: dailyGoal, focus: profile.weakAreas[1] || "특종보험" },
            wednesday: { target: dailyGoal, focus: "배상보험" },
            thursday: { target: dailyGoal, focus: "해상보험" },
            friday: { target: dailyGoal, focus: "종합복습" },
            saturday: { target: Math.round(dailyGoal * 0.8), focus: "약점보완" },
            sunday: { target: Math.round(dailyGoal * 0.5), focus: "휴식 및 복습" }
        };
        
        return weeklyPlan;
    }

    /**
     * 휴식 간격 결정
     */
    determineBreakIntervals(profile) {
        const baseInterval = 45; // 기본 45분
        const concentrationMultiplier = {
            high: 1.2,
            medium: 1.0,
            low: 0.8
        };
        
        return Math.round(baseInterval * concentrationMultiplier[profile.motivationLevel]);
    }

    /**
     * 복습 스케줄 생성
     */
    createReviewSchedule(profile) {
        return {
            daily: "오답 문제 복습",
            weekly: "주간 성과 점검 및 약점 보완",
            monthly: "월간 종합 평가 및 학습 전략 조정"
        };
    }

    /**
     * 문제 전략 결정
     */
    determineQuestionStrategy(profile) {
        const strategy = {
            difficultyProgression: this.calculateDifficultyProgression(profile),
            questionTypes: this.selectQuestionTypes(profile),
            focusRatio: this.calculateFocusRatio(profile)
        };
        
        return strategy;
    }

    /**
     * 난이도 진행 계산
     */
    calculateDifficultyProgression(profile) {
        const baseProgression = [0.3, 0.5, 0.7, 0.8, 0.9];
        
        if (profile.cognitiveLevel === "advanced") {
            return [0.5, 0.7, 0.8, 0.9, 0.95];
        } else if (profile.cognitiveLevel === "beginner") {
            return [0.2, 0.4, 0.6, 0.7, 0.8];
        }
        
        return baseProgression;
    }

    /**
     * 문제 유형 선택
     */
    selectQuestionTypes(profile) {
        const types = ["객관식"];
        
        if (profile.cognitiveLevel === "intermediate" || profile.cognitiveLevel === "advanced") {
            types.push("주관식");
        }
        
        return types;
    }

    /**
     * 집중 비율 계산
     */
    calculateFocusRatio(profile) {
        return {
            weakAreas: 0.6,
            strongAreas: 0.2,
            newAreas: 0.2
        };
    }

    /**
     * 동기 부여 기법 선택
     */
    selectMotivationTechniques(profile) {
        const techniques = [];
        
        if (profile.motivationLevel === "low") {
            techniques.push("small_wins", "progress_visualization", "encouragement");
        } else if (profile.motivationLevel === "medium") {
            techniques.push("goal_setting", "achievement_recognition", "challenge_creation");
        } else {
            techniques.push("advanced_challenges", "mastery_focus", "leadership_opportunities");
        }
        
        return techniques;
    }

    /**
     * 학습 방법 선택
     */
    selectLearningMethods(profile) {
        const methods = [];
        
        switch (profile.learningStyle) {
            case "visual":
                methods.push("diagrams", "charts", "mind_maps", "color_coding");
                break;
            case "auditory":
                methods.push("verbal_explanation", "discussion", "audio_summaries", "teaching_others");
                break;
            case "kinesthetic":
                methods.push("hands_on_practice", "simulation", "role_playing", "physical_activities");
                break;
            default:
                methods.push("mixed_approach", "adaptive_learning", "multimodal_presentation");
        }
        
        return methods;
    }

    /**
     * 동기 부여 시스템 초기화
     */
    initializeMotivationSystem() {
        this.motivationSystem = {
            currentStreak: 0,
            totalAchievements: 0,
            motivationLevel: this.userProfile?.motivationLevel || "medium",
            encouragementMessages: this.generateEncouragementMessages(),
            achievementSystem: this.createAchievementSystem()
        };
        
        console.log(`💪 동기 부여 시스템 초기화 완료`);
    }

    /**
     * 격려 메시지 생성
     */
    generateEncouragementMessages() {
        return {
            high: [
                "당신의 학습 의지가 정말 인상적입니다! 🚀",
                "이런 페이스라면 합격은 확실합니다! 💪",
                "최고의 학습자가 되고 계십니다! 🌟"
            ],
            medium: [
                "꾸준한 학습이 가장 큰 힘입니다! 📚",
                "한 걸음씩 나아가고 계십니다! 👣",
                "오늘도 좋은 하루 되세요! 😊"
            ],
            low: [
                "시작이 반입니다! 오늘 한 문제라도 풀어보세요! 🌱",
                "작은 진전도 큰 성공의 시작입니다! ✨",
                "당신은 충분히 할 수 있습니다! 💫"
            ]
        };
    }

    /**
     * 성취 시스템 생성
     */
    createAchievementSystem() {
        return {
            dailyGoals: {
                "첫 문제": { condition: "questions_solved >= 1", reward: "기념 배지" },
                "10문제 달성": { condition: "questions_solved >= 10", reward: "열심히 배지" },
                "20문제 달성": { condition: "questions_solved >= 20", reward: "성실 배지" }
            },
            weeklyGoals: {
                "주간 100문제": { condition: "weekly_questions >= 100", reward: "근면 배지" },
                "5일 연속 학습": { condition: "consecutive_days >= 5", reward: "꾸준함 배지" }
            },
            monthlyGoals: {
                "월간 500문제": { condition: "monthly_questions >= 500", reward: "달인 배지" },
                "정확도 80% 달성": { condition: "accuracy >= 0.8", reward: "정확성 배지" }
            }
        };
    }

    /**
     * 개인화된 학습 조언 생성
     */
    generatePersonalizedAdvice() {
        try {
            const profile = this.userProfile;
            const strategy = this.learningStrategy;
            const advice = [];
            
            // 학습 스타일별 조언
            switch (profile.learningStyle) {
                case "visual":
                    advice.push("📊 차트와 다이어그램을 활용하여 개념을 시각화해보세요.");
                    advice.push("🎨 색상 코딩을 사용하여 중요한 내용을 구분해보세요.");
                    break;
                case "auditory":
                    advice.push("🗣️ 문제를 풀 때 설명을 들으며 학습해보세요.");
                    advice.push("👥 다른 사람에게 가르치는 방식으로 복습해보세요.");
                    break;
                case "kinesthetic":
                    advice.push("✍️ 직접 필기하며 개념을 정리해보세요.");
                    advice.push("🎯 실습 문제를 많이 풀어보세요.");
                    break;
            }
            
            // 약점 영역 조언
            if (profile.weakAreas.length > 0) {
                advice.push(`🎯 ${profile.weakAreas[0]} 영역에 더 많은 시간을 투자해보세요.`);
            }
            
            // 동기 수준별 조언
            if (profile.motivationLevel === "low") {
                advice.push("🌟 작은 목표부터 시작하여 성취감을 느껴보세요.");
            }
            
            return advice;
        } catch (error) {
            console.error(`❌ 개인화된 조언 생성 실패:`, error);
            return ["꾸준한 학습이 가장 중요합니다! 📚"];
        }
    }

    /**
     * 학습 최적화 제안
     */
    generateLearningOptimizations() {
        try {
            const profile = this.userProfile;
            const optimizations = [];
            
            // 시간대별 최적화
            optimizations.push(`⏰ ${profile.preferredTimeSlots[0]} 시간대에 집중 학습을 해보세요.`);
            
            // 학습 방법 최적화
            const methods = this.selectLearningMethods(profile);
            optimizations.push(`📖 ${methods[0]} 방법을 활용해보세요.`);
            
            // 목표 설정 최적화
            const dailyGoal = this.calculateDailyGoal(profile);
            optimizations.push(`🎯 하루 ${dailyGoal}문제를 목표로 설정해보세요.`);
            
            return optimizations;
        } catch (error) {
            console.error(`❌ 학습 최적화 제안 생성 실패:`, error);
            return ["규칙적인 학습 습관을 만들어보세요! 📅"];
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
     * AI 튜터링 데이터 저장
     */
    saveTutoringData() {
        try {
            localStorage.setItem('aicu_ai_tutoring', JSON.stringify(this.tutoringData));
            console.log(`💾 AI 튜터링 데이터 저장 완료`);
        } catch (error) {
            console.error(`❌ AI 튜터링 데이터 저장 실패:`, error);
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
            userProfile: this.userProfile,
            learningStrategy: this.learningStrategy,
            motivationSystem: this.motivationSystem
        };
    }

    /**
     * 데이터 초기화
     */
    resetTutoringData() {
        try {
            this.tutoringData = this.createDefaultTutoringData();
            this.saveTutoringData();
            console.log(`🔄 AI 튜터링 데이터 초기화 완료`);
        } catch (error) {
            console.error(`❌ AI 튜터링 데이터 초기화 실패:`, error);
        }
    }
}

// 전역 인스턴스 생성
window.aiTutorEngine = new AITutorEngine();

// 자동 초기화
document.addEventListener('DOMContentLoaded', function() {
    if (window.aiTutorEngine && !window.aiTutorEngine.isInitialized) {
        window.aiTutorEngine.initialize();
    }
});

console.log(`🤖 AI 튜터 엔진 모듈 로드 완료`);


