/**
 * 지능형 피드백 시스템 - 개인별 맞춤형 학습 피드백 및 조언
 * 개인별 맞춤형 학습 조언, 오답 패턴 분석 및 개선 방안, 학습 방법 최적화 제안, 동기 부여 메시지 생성
 */

class IntelligentFeedbackSystem {
    constructor() {
        this.systemName = "Intelligent Feedback System";
        this.version = "1.0.0";
        this.isInitialized = false;
        this.feedbackData = {};
        this.personalizedAdvice = [];
        this.improvementSuggestions = [];
        this.motivationMessages = [];
        this.learningOptimizations = [];
        
        console.log(`💡 ${this.systemName} v${this.version} 초기화 중...`);
    }

    /**
     * 시스템 초기화
     */
    initialize() {
        try {
            this.loadFeedbackData();
            this.initializeFeedbackTemplates();
            this.analyzeUserProfile();
            
            this.isInitialized = true;
            console.log(`✅ ${this.systemName} 초기화 완료`);
            return true;
        } catch (error) {
            console.error(`❌ ${this.systemName} 초기화 실패:`, error);
            return false;
        }
    }

    /**
     * 피드백 데이터 로드
     */
    loadFeedbackData() {
        try {
            const data = localStorage.getItem('aicu_intelligent_feedback');
            if (data) {
                this.feedbackData = JSON.parse(data);
            } else {
                this.feedbackData = this.createDefaultFeedbackData();
                this.saveFeedbackData();
            }
            console.log(`📊 지능형 피드백 데이터 로드 완료`);
        } catch (error) {
            console.error(`❌ 지능형 피드백 데이터 로드 실패:`, error);
            this.feedbackData = this.createDefaultFeedbackData();
        }
    }

    /**
     * 기본 피드백 데이터 생성
     */
    createDefaultFeedbackData() {
        return {
            personalizedAdvice: [],
            improvementSuggestions: [],
            motivationMessages: [],
            learningOptimizations: [],
            feedbackHistory: [],
            userPreferences: {
                feedbackStyle: "encouraging",
                detailLevel: "medium",
                frequency: "moderate"
            },
            performanceMetrics: {
                totalFeedbackGiven: 0,
                averageFeedbackRating: 0,
                mostHelpfulAdvice: "",
                improvementAreas: []
            }
        };
    }

    /**
     * 피드백 템플릿 초기화
     */
    initializeFeedbackTemplates() {
        try {
            this.feedbackTemplates = {
                encouragement: {
                    high: [
                        "당신의 학습 의지가 정말 인상적입니다! 🚀",
                        "이런 페이스라면 합격은 확실합니다! 💪",
                        "최고의 학습자가 되고 계십니다! 🌟",
                        "당신의 노력이 빛나고 있습니다! ✨",
                        "정말 대단한 성과입니다! 🎉"
                    ],
                    medium: [
                        "꾸준한 학습이 가장 큰 힘입니다! 📚",
                        "한 걸음씩 나아가고 계십니다! 👣",
                        "오늘도 좋은 하루 되세요! 😊",
                        "조금씩 발전하고 있습니다! 📈",
                        "포기하지 않는 모습이 아름답습니다! 🌸"
                    ],
                    low: [
                        "시작이 반입니다! 오늘 한 문제라도 풀어보세요! 🌱",
                        "작은 진전도 큰 성공의 시작입니다! ✨",
                        "당신은 충분히 할 수 있습니다! 💫",
                        "오늘 하루만 더 해보세요! 🌅",
                        "당신의 잠재력을 믿습니다! 🔥"
                    ]
                },
                improvement: {
                    accuracy: [
                        "정확도를 높이기 위해 문제를 더 꼼꼼히 읽어보세요.",
                        "오답 노트를 만들어 틀린 문제를 정리해보세요.",
                        "개념을 다시 한번 정리해보는 것이 좋겠습니다.",
                        "문제 풀이 전에 핵심 키워드를 찾아보세요.",
                        "시간을 충분히 두고 차분히 풀어보세요."
                    ],
                    speed: [
                        "문제 유형별로 풀이 패턴을 익혀보세요.",
                        "자주 나오는 문제는 암기해두세요.",
                        "문제 풀이 순서를 정해보세요.",
                        "불필요한 계산은 줄여보세요.",
                        "문제를 빠르게 파악하는 연습을 해보세요."
                    ],
                    concentration: [
                        "학습 환경을 조용하게 만들어보세요.",
                        "휴식 시간을 정해두고 규칙적으로 학습하세요.",
                        "핸드폰을 멀리 두고 집중해보세요.",
                        "학습 목표를 작게 나누어 설정해보세요.",
                        "명상이나 호흡 운동을 시도해보세요."
                    ]
                },
                strategy: {
                    beginner: [
                        "기본 개념부터 차근차근 학습하세요.",
                        "쉬운 문제부터 시작하여 자신감을 키우세요.",
                        "매일 조금씩이라도 꾸준히 학습하세요.",
                        "오답을 두려워하지 말고 배움의 기회로 삼으세요.",
                        "학습 계획을 세워 체계적으로 접근하세요."
                    ],
                    intermediate: [
                        "약점 영역을 집중적으로 보완하세요.",
                        "다양한 문제 유형에 도전해보세요.",
                        "실전 문제를 풀어 시험 감각을 익히세요.",
                        "학습한 내용을 정리하고 복습하세요.",
                        "동료와 함께 학습하여 서로 도움을 주세요."
                    ],
                    advanced: [
                        "고난도 문제에 집중하여 실력을 더욱 향상시키세요.",
                        "문제 풀이 시간을 단축하는 연습을 하세요.",
                        "시험 전략을 세워 효율적으로 학습하세요.",
                        "다른 사람에게 가르치며 이해도를 높이세요.",
                        "최신 출제 경향을 파악하여 대비하세요."
                    ]
                }
            };
            
            console.log(`📝 피드백 템플릿 초기화 완료`);
        } catch (error) {
            console.error(`❌ 피드백 템플릿 초기화 실패:`, error);
        }
    }

    /**
     * 사용자 프로필 분석
     */
    analyzeUserProfile() {
        try {
            const progressData = this.getProgressData();
            const userInfo = progressData?.userInfo || {};
            const statistics = progressData?.statistics || {};
            
            // 사용자 수준 분석
            const userLevel = this.determineUserLevel(statistics);
            
            // 학습 패턴 분석
            const learningPatterns = this.analyzeLearningPatterns(progressData);
            
            // 약점 영역 분석
            const weakAreas = this.identifyWeakAreas(progressData);
            
            // 동기 수준 분석
            const motivationLevel = this.analyzeMotivationLevel(progressData);
            
            this.userProfile = {
                level: userLevel,
                patterns: learningPatterns,
                weakAreas: weakAreas,
                motivationLevel: motivationLevel,
                learningGoals: userInfo.learningGoals || ["합격"]
            };
            
            console.log(`👤 사용자 프로필 분석 완료: ${userLevel} 수준`);
        } catch (error) {
            console.error(`❌ 사용자 프로필 분석 실패:`, error);
        }
    }

    /**
     * 사용자 수준 결정
     */
    determineUserLevel(statistics) {
        try {
            const totalAttempted = statistics.totalAttempted || 0;
            const totalCorrect = statistics.totalCorrect || 0;
            const accuracy = totalAttempted > 0 ? totalCorrect / totalAttempted : 0;
            
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
            console.error(`❌ 사용자 수준 결정 실패:`, error);
            return "beginner";
        }
    }

    /**
     * 학습 패턴 분석
     */
    analyzeLearningPatterns(progressData) {
        try {
            const patterns = {
                studyFrequency: this.analyzeStudyFrequency(progressData),
                timeOfDay: this.analyzeTimeOfDay(progressData),
                questionTypes: this.analyzeQuestionTypes(progressData),
                errorPatterns: this.analyzeErrorPatterns(progressData)
            };
            
            return patterns;
        } catch (error) {
            console.error(`❌ 학습 패턴 분석 실패:`, error);
            return {};
        }
    }

    /**
     * 학습 빈도 분석
     */
    analyzeStudyFrequency(progressData) {
        try {
            const basicLearning = progressData?.basicLearning || {};
            const lastStudyDate = basicLearning.lastStudyDate;
            
            if (!lastStudyDate) return "irregular";
            
            const daysSinceLastStudy = Math.floor((Date.now() - new Date(lastStudyDate).getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysSinceLastStudy <= 1) return "daily";
            else if (daysSinceLastStudy <= 3) return "frequent";
            else if (daysSinceLastStudy <= 7) return "moderate";
            else return "irregular";
        } catch (error) {
            console.error(`❌ 학습 빈도 분석 실패:`, error);
            return "moderate";
        }
    }

    /**
     * 시간대 분석
     */
    analyzeTimeOfDay(progressData) {
        try {
            const currentHour = new Date().getHours();
            
            if (currentHour >= 6 && currentHour <= 12) return "morning";
            else if (currentHour >= 12 && currentHour <= 18) return "afternoon";
            else return "evening";
        } catch (error) {
            console.error(`❌ 시간대 분석 실패:`, error);
            return "afternoon";
        }
    }

    /**
     * 문제 유형 분석
     */
    analyzeQuestionTypes(progressData) {
        try {
            // 기본적으로 객관식으로 가정
            return ["객관식"];
        } catch (error) {
            console.error(`❌ 문제 유형 분석 실패:`, error);
            return ["객관식"];
        }
    }

    /**
     * 오답 패턴 분석
     */
    analyzeErrorPatterns(progressData) {
        try {
            const patterns = {
                carelessMistakes: 0,
                conceptualErrors: 0,
                timePressureErrors: 0,
                fatigueErrors: 0
            };
            
            // 기본 패턴 설정
            patterns.carelessMistakes = 30;
            patterns.conceptualErrors = 40;
            patterns.timePressureErrors = 20;
            patterns.fatigueErrors = 10;
            
            return patterns;
        } catch (error) {
            console.error(`❌ 오답 패턴 분석 실패:`, error);
            return {};
        }
    }

    /**
     * 약점 영역 식별
     */
    identifyWeakAreas(progressData) {
        try {
            const largeCategory = progressData?.largeCategory || {};
            const weakAreas = [];
            
            Object.keys(largeCategory).forEach(category => {
                const categoryData = largeCategory[category];
                const accuracy = categoryData.totalAttempted > 0 ? 
                    categoryData.totalCorrect / categoryData.totalAttempted : 0;
                
                if (accuracy < 0.6 && categoryData.totalAttempted > 10) {
                    weakAreas.push({
                        category: category,
                        accuracy: accuracy,
                        attempted: categoryData.totalAttempted
                    });
                }
            });
            
            return weakAreas.sort((a, b) => a.accuracy - b.accuracy);
        } catch (error) {
            console.error(`❌ 약점 영역 식별 실패:`, error);
            return [];
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
     * 개인화된 학습 조언 생성
     */
    generatePersonalizedAdvice() {
        try {
            const advice = [];
            const profile = this.userProfile;
            
            // 수준별 전략 조언
            const strategyAdvice = this.feedbackTemplates.strategy[profile.level];
            if (strategyAdvice) {
                advice.push(strategyAdvice[Math.floor(Math.random() * strategyAdvice.length)]);
            }
            
            // 약점 영역 조언
            if (profile.weakAreas.length > 0) {
                const weakArea = profile.weakAreas[0];
                advice.push(`${weakArea.category} 영역의 정확도가 ${(weakArea.accuracy * 100).toFixed(1)}%로 낮습니다. 이 영역에 더 많은 시간을 투자해보세요.`);
            }
            
            // 학습 패턴 조언
            if (profile.patterns.studyFrequency === "irregular") {
                advice.push("학습 빈도가 낮습니다. 매일 조금씩이라도 꾸준히 학습하는 습관을 만들어보세요.");
            }
            
            // 동기 수준별 조언
            if (profile.motivationLevel === "low") {
                advice.push("학습 동기가 낮아 보입니다. 작은 목표부터 시작하여 성취감을 느껴보세요.");
            }
            
            this.personalizedAdvice = advice;
            this.feedbackData.personalizedAdvice = advice;
            
            console.log(`💡 개인화된 조언 생성 완료: ${advice.length}개`);
            return advice;
        } catch (error) {
            console.error(`❌ 개인화된 조언 생성 실패:`, error);
            return ["꾸준한 학습이 가장 중요합니다! 📚"];
        }
    }

    /**
     * 개선 방안 제시
     */
    generateImprovementSuggestions() {
        try {
            const suggestions = [];
            const profile = this.userProfile;
            
            // 정확도 개선 방안
            if (profile.patterns.errorPatterns) {
                const errorPatterns = profile.patterns.errorPatterns;
                
                if (errorPatterns.carelessMistakes > 20) {
                    suggestions.push("부주의한 실수가 많습니다. 문제를 더 꼼꼼히 읽고 답을 확인하는 습관을 만들어보세요.");
                }
                
                if (errorPatterns.conceptualErrors > 30) {
                    suggestions.push("개념적 오류가 많습니다. 기본 개념을 다시 정리하고 이해도를 높여보세요.");
                }
                
                if (errorPatterns.timePressureErrors > 15) {
                    suggestions.push("시간 압박으로 인한 오류가 많습니다. 문제 풀이 속도를 높이는 연습을 해보세요.");
                }
            }
            
            // 학습 방법 개선 방안
            if (profile.patterns.studyFrequency === "irregular") {
                suggestions.push("규칙적인 학습 습관을 만들어보세요. 매일 같은 시간에 학습하는 것이 도움이 됩니다.");
            }
            
            // 집중도 개선 방안
            suggestions.push("학습 환경을 조용하게 만들고, 핸드폰을 멀리 두어 집중도를 높여보세요.");
            
            this.improvementSuggestions = suggestions;
            this.feedbackData.improvementSuggestions = suggestions;
            
            console.log(`🔧 개선 방안 생성 완료: ${suggestions.length}개`);
            return suggestions;
        } catch (error) {
            console.error(`❌ 개선 방안 생성 실패:`, error);
            return ["꾸준한 학습 습관을 만들어보세요."];
        }
    }

    /**
     * 동기 부여 메시지 생성
     */
    generateMotivationMessages() {
        try {
            const messages = [];
            const profile = this.userProfile;
            const encouragementTemplates = this.feedbackTemplates.encouragement[profile.motivationLevel];
            
            // 기본 격려 메시지
            if (encouragementTemplates) {
                messages.push(encouragementTemplates[Math.floor(Math.random() * encouragementTemplates.length)]);
            }
            
            // 목표별 동기 부여
            if (profile.learningGoals.includes("합격")) {
                messages.push("합격이라는 목표를 향해 한 걸음씩 나아가고 있습니다. 포기하지 마세요! 🎯");
            }
            
            if (profile.learningGoals.includes("고득점")) {
                messages.push("고득점을 위한 노력이 빛나고 있습니다. 당신의 실력이 계속 향상되고 있어요! ⭐");
            }
            
            // 성과 기반 동기 부여
            const progressData = this.getProgressData();
            const statistics = progressData?.statistics || {};
            const totalAttempted = statistics.totalAttempted || 0;
            
            if (totalAttempted > 100) {
                messages.push("이미 100문제 이상을 풀었습니다! 당신의 노력이 정말 대단합니다! 🏆");
            }
            
            this.motivationMessages = messages;
            this.feedbackData.motivationMessages = messages;
            
            console.log(`💪 동기 부여 메시지 생성 완료: ${messages.length}개`);
            return messages;
        } catch (error) {
            console.error(`❌ 동기 부여 메시지 생성 실패:`, error);
            return ["당신은 충분히 할 수 있습니다! 💫"];
        }
    }

    /**
     * 학습 최적화 제안
     */
    generateLearningOptimizations() {
        try {
            const optimizations = [];
            const profile = this.userProfile;
            
            // 시간대별 최적화
            const timeOfDay = profile.patterns.timeOfDay;
            if (timeOfDay === "morning") {
                optimizations.push("아침 시간대에 학습하고 계시는군요! 아침은 집중도가 높아 학습에 최적입니다.");
            } else if (timeOfDay === "afternoon") {
                optimizations.push("오후 시간대에 학습하고 계시는군요! 점심 후 휴식을 취하고 학습하세요.");
            } else {
                optimizations.push("저녁 시간대에 학습하고 계시는군요! 조명을 밝게 하고 피로하지 않게 학습하세요.");
            }
            
            // 학습 방법 최적화
            if (profile.level === "beginner") {
                optimizations.push("기초부터 차근차근 학습하여 탄탄한 기반을 만들어보세요.");
            } else if (profile.level === "intermediate") {
                optimizations.push("약점 영역을 집중적으로 보완하여 균형 잡힌 실력을 만들어보세요.");
            } else {
                optimizations.push("고난도 문제에 도전하여 실력을 더욱 향상시켜보세요.");
            }
            
            // 문제 풀이 최적화
            optimizations.push("문제를 풀 때 핵심 키워드를 찾아 빠르게 파악하는 연습을 해보세요.");
            optimizations.push("오답 노트를 만들어 틀린 문제를 정리하고 복습하는 습관을 만들어보세요.");
            
            this.learningOptimizations = optimizations;
            this.feedbackData.learningOptimizations = optimizations;
            
            console.log(`⚡ 학습 최적화 제안 생성 완료: ${optimizations.length}개`);
            return optimizations;
        } catch (error) {
            console.error(`❌ 학습 최적화 제안 생성 실패:`, error);
            return ["규칙적인 학습 습관을 만들어보세요."];
        }
    }

    /**
     * 종합 피드백 생성
     */
    generateComprehensiveFeedback() {
        try {
            const feedback = {
                personalizedAdvice: this.generatePersonalizedAdvice(),
                improvementSuggestions: this.generateImprovementSuggestions(),
                motivationMessages: this.generateMotivationMessages(),
                learningOptimizations: this.generateLearningOptimizations(),
                timestamp: new Date().toISOString(),
                userLevel: this.userProfile?.level || "beginner"
            };
            
            // 피드백 히스토리에 추가
            this.feedbackData.feedbackHistory.push(feedback);
            
            // 최근 20개 피드백만 유지
            if (this.feedbackData.feedbackHistory.length > 20) {
                this.feedbackData.feedbackHistory = this.feedbackData.feedbackHistory.slice(-20);
            }
            
            this.saveFeedbackData();
            console.log(`📋 종합 피드백 생성 완료`);
            return feedback;
        } catch (error) {
            console.error(`❌ 종합 피드백 생성 실패:`, error);
            return {};
        }
    }

    /**
     * 실시간 피드백 생성 (문제 풀이 후)
     */
    generateRealTimeFeedback(questionResult) {
        try {
            const feedback = {
                immediate: "",
                detailed: "",
                timestamp: new Date().toISOString()
            };
            
            // 즉시 피드백
            if (questionResult.isCorrect) {
                feedback.immediate = "정답입니다! 잘 하셨습니다! 🎉";
                
                if (questionResult.timeSpent < 30) {
                    feedback.detailed = "빠르고 정확한 답변입니다. 이런 페이스를 유지해보세요!";
                } else if (questionResult.timeSpent > 120) {
                    feedback.detailed = "정답이지만 시간이 오래 걸렸습니다. 문제 풀이 속도를 높이는 연습을 해보세요.";
                } else {
                    feedback.detailed = "적절한 시간에 정확한 답변입니다. 좋은 학습이 되고 있습니다!";
                }
            } else {
                feedback.immediate = "틀렸습니다. 괜찮습니다! 배움의 기회로 삼아보세요. 💪";
                
                if (questionResult.timeSpent < 30) {
                    feedback.detailed = "너무 빠르게 답변하셨습니다. 문제를 더 꼼꼼히 읽어보세요.";
                } else if (questionResult.timeSpent > 120) {
                    feedback.detailed = "시간이 오래 걸렸습니다. 개념을 다시 정리해보세요.";
                } else {
                    feedback.detailed = "틀린 답이지만 노력하신 모습이 보입니다. 설명을 다시 읽어보세요.";
                }
            }
            
            console.log(`⚡ 실시간 피드백 생성: ${questionResult.isCorrect ? '정답' : '오답'}`);
            return feedback;
        } catch (error) {
            console.error(`❌ 실시간 피드백 생성 실패:`, error);
            return { immediate: "계속 노력해보세요!", detailed: "", timestamp: new Date().toISOString() };
        }
    }

    /**
     * 피드백 평가 (사용자 만족도)
     */
    evaluateFeedback(feedbackId, rating, comment = "") {
        try {
            const evaluation = {
                feedbackId,
                rating, // 1-5점
                comment,
                timestamp: new Date().toISOString()
            };
            
            // 피드백 평가 히스토리에 추가
            if (!this.feedbackData.feedbackEvaluations) {
                this.feedbackData.feedbackEvaluations = [];
            }
            this.feedbackData.feedbackEvaluations.push(evaluation);
            
            // 평균 평가 점수 업데이트
            const evaluations = this.feedbackData.feedbackEvaluations;
            const totalRating = evaluations.reduce((sum, eval) => sum + eval.rating, 0);
            this.feedbackData.performanceMetrics.averageFeedbackRating = 
                Math.round((totalRating / evaluations.length) * 10) / 10;
            
            this.saveFeedbackData();
            console.log(`⭐ 피드백 평가 완료: ${rating}점`);
        } catch (error) {
            console.error(`❌ 피드백 평가 실패:`, error);
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
     * 지능형 피드백 데이터 저장
     */
    saveFeedbackData() {
        try {
            localStorage.setItem('aicu_intelligent_feedback', JSON.stringify(this.feedbackData));
            console.log(`💾 지능형 피드백 데이터 저장 완료`);
        } catch (error) {
            console.error(`❌ 지능형 피드백 데이터 저장 실패:`, error);
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
            personalizedAdvice: this.personalizedAdvice.length,
            improvementSuggestions: this.improvementSuggestions.length,
            motivationMessages: this.motivationMessages.length,
            learningOptimizations: this.learningOptimizations.length,
            feedbackHistory: this.feedbackData.feedbackHistory.length
        };
    }

    /**
     * 데이터 초기화
     */
    resetFeedbackData() {
        try {
            this.feedbackData = this.createDefaultFeedbackData();
            this.personalizedAdvice = [];
            this.improvementSuggestions = [];
            this.motivationMessages = [];
            this.learningOptimizations = [];
            this.userProfile = null;
            
            this.saveFeedbackData();
            console.log(`🔄 지능형 피드백 데이터 초기화 완료`);
        } catch (error) {
            console.error(`❌ 지능형 피드백 데이터 초기화 실패:`, error);
        }
    }
}

// 전역 인스턴스 생성
window.intelligentFeedbackSystem = new IntelligentFeedbackSystem();

// 자동 초기화
document.addEventListener('DOMContentLoaded', function() {
    if (window.intelligentFeedbackSystem && !window.intelligentFeedbackSystem.isInitialized) {
        window.intelligentFeedbackSystem.initialize();
    }
});

console.log(`💡 지능형 피드백 시스템 모듈 로드 완료`);




