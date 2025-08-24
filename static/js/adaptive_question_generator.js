/**
 * 적응형 문제 생성 시스템 - 사용자 수준에 맞는 동적 문제 생성
 * 사용자 수준별 문제 난이도 조정, 약점 영역 집중 문제 생성, 학습 진도에 따른 문제 유형 선택
 */

class AdaptiveQuestionGenerator {
    constructor() {
        this.systemName = "Adaptive Question Generator";
        this.version = "1.0.0";
        this.isInitialized = false;
        this.currentUserLevel = "beginner";
        this.difficultyProgression = [0.3, 0.5, 0.7, 0.8, 0.9];
        this.performanceHistory = [];
        this.generatedQuestions = [];
        this.questionBank = this.createQuestionBank();
        
        console.log(`🎯 ${this.systemName} v${this.version} 초기화 중...`);
    }

    /**
     * 시스템 초기화
     */
    initialize() {
        try {
            this.loadAdaptiveData();
            this.analyzeUserPerformance();
            this.updateDifficultyProgression();
            
            this.isInitialized = true;
            console.log(`✅ ${this.systemName} 초기화 완료`);
            return true;
        } catch (error) {
            console.error(`❌ ${this.systemName} 초기화 실패:`, error);
            return false;
        }
    }

    /**
     * 적응형 데이터 로드
     */
    loadAdaptiveData() {
        try {
            const data = localStorage.getItem('aicu_adaptive_questions');
            if (data) {
                const adaptiveData = JSON.parse(data);
                this.currentUserLevel = adaptiveData.currentLevel || "beginner";
                this.difficultyProgression = adaptiveData.difficultyProgression || [0.3, 0.5, 0.7, 0.8, 0.9];
                this.performanceHistory = adaptiveData.performanceHistory || [];
                this.generatedQuestions = adaptiveData.generatedQuestions || [];
            }
            console.log(`📊 적응형 문제 데이터 로드 완료`);
        } catch (error) {
            console.error(`❌ 적응형 문제 데이터 로드 실패:`, error);
        }
    }

    /**
     * 문제 은행 생성
     */
    createQuestionBank() {
        return {
            재산보험: {
                beginner: [
                    {
                        id: "p1_b1",
                        question: "재산보험의 기본 원칙 중 하나는 무엇인가요?",
                        options: ["대물배상", "대인배상", "무과실책임", "과실책임"],
                        correct: 0,
                        difficulty: 0.3,
                        category: "재산보험",
                        explanation: "재산보험은 대물배상 원칙에 따라 보험사고로 인한 재산상의 손해를 보상합니다."
                    },
                    {
                        id: "p1_b2",
                        question: "재산보험의 보험료 산정 기준이 아닌 것은?",
                        options: ["보험가액", "위험률", "보험기간", "보험료율"],
                        correct: 3,
                        difficulty: 0.4,
                        category: "재산보험",
                        explanation: "보험료율은 보험료 산정의 결과물이지 기준이 아닙니다."
                    }
                ],
                intermediate: [
                    {
                        id: "p1_i1",
                        question: "재산보험에서 실제손해보상원칙의 예외가 아닌 것은?",
                        options: ["정액보험", "신가보험", "복구보험", "실손보험"],
                        correct: 2,
                        difficulty: 0.6,
                        category: "재산보험",
                        explanation: "복구보험은 실제손해보상원칙의 예외가 아닙니다."
                    }
                ],
                advanced: [
                    {
                        id: "p1_a1",
                        question: "재산보험의 위험선택에서 고려하지 않는 요소는?",
                        options: ["보험목적물의 상태", "보험계약자의 신용도", "보험목적물의 위치", "보험목적물의 용도"],
                        correct: 1,
                        difficulty: 0.8,
                        category: "재산보험",
                        explanation: "보험계약자의 신용도는 인보험에서 고려하는 요소입니다."
                    }
                ]
            },
            특종보험: {
                beginner: [
                    {
                        id: "s1_b1",
                        question: "특종보험의 특징이 아닌 것은?",
                        options: ["특수한 위험", "전문성", "고보험료", "표준화된 약관"],
                        correct: 3,
                        difficulty: 0.3,
                        category: "특종보험",
                        explanation: "특종보험은 표준화되지 않은 맞춤형 약관을 사용합니다."
                    }
                ],
                intermediate: [
                    {
                        id: "s1_i1",
                        question: "특종보험의 위험분산 방법이 아닌 것은?",
                        options: ["재보험", "공동보험", "분할보험", "표준보험"],
                        correct: 3,
                        difficulty: 0.6,
                        category: "특종보험",
                        explanation: "표준보험은 특종보험의 위험분산 방법이 아닙니다."
                    }
                ],
                advanced: [
                    {
                        id: "s1_a1",
                        question: "특종보험의 보험료 산정에서 가장 중요한 요소는?",
                        options: ["손해율", "경비율", "위험률", "이익률"],
                        correct: 2,
                        difficulty: 0.9,
                        category: "특종보험",
                        explanation: "특종보험에서는 위험률이 보험료 산정의 가장 중요한 요소입니다."
                    }
                ]
            },
            배상보험: {
                beginner: [
                    {
                        id: "l1_b1",
                        question: "배상보험의 기본 원칙은?",
                        options: ["대물배상", "대인배상", "무과실책임", "과실책임"],
                        correct: 1,
                        difficulty: 0.3,
                        category: "배상보험",
                        explanation: "배상보험은 대인배상 원칙에 따라 제3자에 대한 법적 배상책임을 보장합니다."
                    }
                ],
                intermediate: [
                    {
                        id: "l1_i1",
                        question: "배상보험의 보험사고 발생 시기 기준은?",
                        options: ["사고발생주의", "청구주의", "혼합주의", "계약주의"],
                        correct: 0,
                        difficulty: 0.6,
                        category: "배상보험",
                        explanation: "배상보험은 사고발생주의를 기본 원칙으로 합니다."
                    }
                ],
                advanced: [
                    {
                        id: "l1_a1",
                        question: "배상보험의 면책사유가 아닌 것은?",
                        options: ["고의사고", "전쟁", "지진", "자연재해"],
                        correct: 3,
                        difficulty: 0.8,
                        category: "배상보험",
                        explanation: "자연재해는 배상보험의 면책사유가 아닙니다."
                    }
                ]
            },
            해상보험: {
                beginner: [
                    {
                        id: "m1_b1",
                        question: "해상보험의 기본 원칙이 아닌 것은?",
                        options: ["보험의 이익", "최대선의", "실제손해보상", "대물배상"],
                        correct: 3,
                        difficulty: 0.3,
                        category: "해상보험",
                        explanation: "대물배상은 재산보험의 원칙이며, 해상보험의 기본 원칙이 아닙니다."
                    }
                ],
                intermediate: [
                    {
                        id: "m1_i1",
                        question: "해상보험의 위험개시 시점은?",
                        options: ["계약체결 시", "선박출항 시", "화물적재 시", "보험증권 발급 시"],
                        correct: 1,
                        difficulty: 0.6,
                        category: "해상보험",
                        explanation: "해상보험의 위험은 선박이 출항하는 시점부터 개시됩니다."
                    }
                ],
                advanced: [
                    {
                        id: "m1_a1",
                        question: "해상보험의 공동해손이 아닌 것은?",
                        options: ["선박의 의도적 침몰", "화물의 의도적 투기", "선박의 의도적 좌초", "자연재해"],
                        correct: 3,
                        difficulty: 0.9,
                        category: "해상보험",
                        explanation: "자연재해는 공동해손이 아닌 단독해손에 해당합니다."
                    }
                ]
            }
        };
    }

    /**
     * 사용자 성과 분석
     */
    analyzeUserPerformance() {
        try {
            const progressData = this.getProgressData();
            const statistics = progressData?.statistics || {};
            const largeCategory = progressData?.largeCategory || {};
            
            // 전체 성과 분석
            const totalAccuracy = statistics.totalAttempted > 0 ? 
                statistics.totalCorrect / statistics.totalAttempted : 0;
            
            // 카테고리별 성과 분석
            const categoryPerformance = {};
            Object.keys(largeCategory).forEach(category => {
                const categoryData = largeCategory[category];
                const accuracy = categoryData.totalAttempted > 0 ? 
                    categoryData.totalCorrect / categoryData.totalAttempted : 0;
                categoryPerformance[category] = {
                    accuracy,
                    attempted: categoryData.totalAttempted,
                    correct: categoryData.totalCorrect
                };
            });
            
            // 사용자 수준 업데이트
            this.updateUserLevel(totalAccuracy, statistics.totalAttempted);
            
            // 성과 이력 저장
            this.performanceHistory.push({
                timestamp: new Date().toISOString(),
                totalAccuracy,
                categoryPerformance,
                totalAttempted: statistics.totalAttempted,
                totalCorrect: statistics.totalCorrect
            });
            
            // 최근 10개 성과만 유지
            if (this.performanceHistory.length > 10) {
                this.performanceHistory = this.performanceHistory.slice(-10);
            }
            
            console.log(`📈 사용자 성과 분석 완료: ${this.currentUserLevel} 수준, 정확도 ${(totalAccuracy * 100).toFixed(1)}%`);
            
        } catch (error) {
            console.error(`❌ 사용자 성과 분석 실패:`, error);
        }
    }

    /**
     * 사용자 수준 업데이트
     */
    updateUserLevel(accuracy, totalAttempted) {
        try {
            let newLevel = this.currentUserLevel;
            
            // 문제 풀이 수와 정확도 기반 수준 판단
            if (totalAttempted < 50) {
                newLevel = "beginner";
            } else if (totalAttempted < 200) {
                if (accuracy > 0.8) newLevel = "intermediate";
                else if (accuracy < 0.5) newLevel = "beginner";
                else newLevel = "intermediate";
            } else {
                if (accuracy > 0.85) newLevel = "advanced";
                else if (accuracy > 0.7) newLevel = "intermediate";
                else newLevel = "beginner";
            }
            
            // 수준 변경 시 난이도 진행 조정
            if (newLevel !== this.currentUserLevel) {
                this.currentUserLevel = newLevel;
                this.updateDifficultyProgression();
                console.log(`🔄 사용자 수준 변경: ${this.currentUserLevel}`);
            }
            
        } catch (error) {
            console.error(`❌ 사용자 수준 업데이트 실패:`, error);
        }
    }

    /**
     * 난이도 진행 업데이트
     */
    updateDifficultyProgression() {
        try {
            switch (this.currentUserLevel) {
                case "beginner":
                    this.difficultyProgression = [0.2, 0.4, 0.6, 0.7, 0.8];
                    break;
                case "intermediate":
                    this.difficultyProgression = [0.3, 0.5, 0.7, 0.8, 0.9];
                    break;
                case "advanced":
                    this.difficultyProgression = [0.5, 0.7, 0.8, 0.9, 0.95];
                    break;
                default:
                    this.difficultyProgression = [0.3, 0.5, 0.7, 0.8, 0.9];
            }
            
            console.log(`📊 난이도 진행 업데이트: ${this.difficultyProgression.join(', ')}`);
            
        } catch (error) {
            console.error(`❌ 난이도 진행 업데이트 실패:`, error);
        }
    }

    /**
     * 적응형 문제 생성
     */
    generateAdaptiveQuestion(category = null, focusWeakAreas = true) {
        try {
            // 카테고리 선택
            const selectedCategory = category || this.selectCategory(focusWeakAreas);
            
            // 난이도 결정
            const difficulty = this.determineQuestionDifficulty(selectedCategory);
            
            // 문제 선택
            const question = this.selectQuestion(selectedCategory, difficulty);
            
            if (question) {
                // 생성된 문제 기록
                this.generatedQuestions.push({
                    id: question.id,
                    category: selectedCategory,
                    difficulty: difficulty,
                    timestamp: new Date().toISOString(),
                    userLevel: this.currentUserLevel
                });
                
                // 최근 50개 문제만 유지
                if (this.generatedQuestions.length > 50) {
                    this.generatedQuestions = this.generatedQuestions.slice(-50);
                }
                
                this.saveAdaptiveData();
                console.log(`🎯 적응형 문제 생성: ${selectedCategory}, 난이도 ${difficulty}`);
                
                return question;
            } else {
                console.warn(`⚠️ 적합한 문제를 찾을 수 없음: ${selectedCategory}, 난이도 ${difficulty}`);
                return this.generateFallbackQuestion(selectedCategory);
            }
            
        } catch (error) {
            console.error(`❌ 적응형 문제 생성 실패:`, error);
            return this.generateFallbackQuestion();
        }
    }

    /**
     * 카테고리 선택
     */
    selectCategory(focusWeakAreas) {
        try {
            const progressData = this.getProgressData();
            const largeCategory = progressData?.largeCategory || {};
            
            // 약점 영역 우선 선택
            if (focusWeakAreas) {
                const weakAreas = [];
                Object.keys(largeCategory).forEach(category => {
                    const categoryData = largeCategory[category];
                    const accuracy = categoryData.totalAttempted > 0 ? 
                        categoryData.totalCorrect / categoryData.totalAttempted : 0;
                    
                    if (accuracy < 0.6 && categoryData.totalAttempted > 10) {
                        weakAreas.push(category);
                    }
                });
                
                if (weakAreas.length > 0) {
                    // 약점 영역 중 랜덤 선택
                    return weakAreas[Math.floor(Math.random() * weakAreas.length)];
                }
            }
            
            // 모든 카테고리 중 랜덤 선택
            const categories = Object.keys(this.questionBank);
            return categories[Math.floor(Math.random() * categories.length)];
            
        } catch (error) {
            console.error(`❌ 카테고리 선택 실패:`, error);
            return "재산보험";
        }
    }

    /**
     * 문제 난이도 결정
     */
    determineQuestionDifficulty(category) {
        try {
            const progressData = this.getProgressData();
            const largeCategory = progressData?.largeCategory || {};
            const categoryData = largeCategory[category] || {};
            
            // 카테고리별 정확도 계산
            const accuracy = categoryData.totalAttempted > 0 ? 
                categoryData.totalCorrect / categoryData.totalAttempted : 0.5;
            
            // 최근 성과 기반 난이도 조정
            const recentPerformance = this.getRecentPerformance(category);
            
            // 난이도 결정 로직
            let difficulty;
            if (accuracy < 0.4) {
                // 낮은 정확도: 쉬운 문제
                difficulty = this.difficultyProgression[0];
            } else if (accuracy < 0.6) {
                // 보통 정확도: 중간 문제
                difficulty = this.difficultyProgression[1];
            } else if (accuracy < 0.8) {
                // 높은 정확도: 어려운 문제
                difficulty = this.difficultyProgression[2];
            } else {
                // 매우 높은 정확도: 매우 어려운 문제
                difficulty = this.difficultyProgression[3];
            }
            
            // 최근 성과에 따른 미세 조정
            if (recentPerformance > 0.9) {
                difficulty = Math.min(difficulty + 0.1, 0.95);
            } else if (recentPerformance < 0.3) {
                difficulty = Math.max(difficulty - 0.1, 0.2);
            }
            
            return Math.round(difficulty * 100) / 100;
            
        } catch (error) {
            console.error(`❌ 문제 난이도 결정 실패:`, error);
            return 0.5;
        }
    }

    /**
     * 최근 성과 가져오기
     */
    getRecentPerformance(category) {
        try {
            const recentHistory = this.performanceHistory.slice(-5);
            let totalAccuracy = 0;
            let count = 0;
            
            recentHistory.forEach(performance => {
                if (performance.categoryPerformance[category]) {
                    totalAccuracy += performance.categoryPerformance[category].accuracy;
                    count++;
                }
            });
            
            return count > 0 ? totalAccuracy / count : 0.5;
            
        } catch (error) {
            console.error(`❌ 최근 성과 계산 실패:`, error);
            return 0.5;
        }
    }

    /**
     * 문제 선택
     */
    selectQuestion(category, difficulty) {
        try {
            const categoryBank = this.questionBank[category];
            if (!categoryBank) {
                console.warn(`⚠️ 카테고리 ${category}의 문제 은행이 없습니다.`);
                return null;
            }
            
            // 사용자 수준에 맞는 문제 풀 선택
            const levelQuestions = categoryBank[this.currentUserLevel] || categoryBank.beginner;
            
            // 난이도에 맞는 문제 필터링
            const suitableQuestions = levelQuestions.filter(q => 
                Math.abs(q.difficulty - difficulty) <= 0.2
            );
            
            if (suitableQuestions.length === 0) {
                // 적합한 문제가 없으면 전체에서 선택
                return levelQuestions[Math.floor(Math.random() * levelQuestions.length)];
            }
            
            // 적합한 문제 중 랜덤 선택
            return suitableQuestions[Math.floor(Math.random() * suitableQuestions.length)];
            
        } catch (error) {
            console.error(`❌ 문제 선택 실패:`, error);
            return null;
        }
    }

    /**
     * 대체 문제 생성
     */
    generateFallbackQuestion(category = "재산보험") {
        try {
            const fallbackQuestion = {
                id: "fallback_1",
                question: "보험의 기본 원칙 중 하나는 무엇인가요?",
                options: ["대물배상", "대인배상", "무과실책임", "과실책임"],
                correct: 0,
                difficulty: 0.5,
                category: category,
                explanation: "보험의 기본 원칙 중 하나는 대물배상 원칙입니다."
            };
            
            console.log(`🔄 대체 문제 생성: ${category}`);
            return fallbackQuestion;
            
        } catch (error) {
            console.error(`❌ 대체 문제 생성 실패:`, error);
            return null;
        }
    }

    /**
     * 문제 풀이 결과 분석
     */
    analyzeQuestionResult(questionId, isCorrect, timeSpent) {
        try {
            // 문제 풀이 결과 기록
            const result = {
                questionId,
                isCorrect,
                timeSpent,
                timestamp: new Date().toISOString(),
                userLevel: this.currentUserLevel
            };
            
            // 성과 이력에 추가
            this.performanceHistory.push(result);
            
            // 난이도 조정
            this.adjustDifficulty(questionId, isCorrect, timeSpent);
            
            // 다음 문제 전략 업데이트
            this.updateNextQuestionStrategy(isCorrect);
            
            this.saveAdaptiveData();
            console.log(`📊 문제 풀이 결과 분석 완료: ${isCorrect ? '정답' : '오답'}`);
            
        } catch (error) {
            console.error(`❌ 문제 풀이 결과 분석 실패:`, error);
        }
    }

    /**
     * 난이도 조정
     */
    adjustDifficulty(questionId, isCorrect, timeSpent) {
        try {
            // 문제 정보 찾기
            const question = this.findQuestionById(questionId);
            if (!question) return;
            
            const currentDifficulty = question.difficulty;
            let newDifficulty = currentDifficulty;
            
            // 정답/오답에 따른 난이도 조정
            if (isCorrect) {
                if (timeSpent < 30) {
                    // 빠른 정답: 난이도 증가
                    newDifficulty = Math.min(currentDifficulty + 0.1, 0.95);
                } else if (timeSpent > 120) {
                    // 느린 정답: 난이도 유지
                    newDifficulty = currentDifficulty;
                } else {
                    // 보통 정답: 약간 증가
                    newDifficulty = Math.min(currentDifficulty + 0.05, 0.95);
                }
            } else {
                if (timeSpent < 30) {
                    // 빠른 오답: 난이도 감소
                    newDifficulty = Math.max(currentDifficulty - 0.1, 0.2);
                } else {
                    // 느린 오답: 난이도 감소
                    newDifficulty = Math.max(currentDifficulty - 0.05, 0.2);
                }
            }
            
            // 문제 난이도 업데이트
            question.difficulty = Math.round(newDifficulty * 100) / 100;
            
            console.log(`🔄 난이도 조정: ${currentDifficulty} → ${question.difficulty}`);
            
        } catch (error) {
            console.error(`❌ 난이도 조정 실패:`, error);
        }
    }

    /**
     * 문제 ID로 문제 찾기
     */
    findQuestionById(questionId) {
        try {
            for (const category in this.questionBank) {
                for (const level in this.questionBank[category]) {
                    const questions = this.questionBank[category][level];
                    const question = questions.find(q => q.id === questionId);
                    if (question) return question;
                }
            }
            return null;
        } catch (error) {
            console.error(`❌ 문제 검색 실패:`, error);
            return null;
        }
    }

    /**
     * 다음 문제 전략 업데이트
     */
    updateNextQuestionStrategy(isCorrect) {
        try {
            // 연속 정답/오답 패턴 분석
            const recentResults = this.performanceHistory.slice(-5);
            const correctCount = recentResults.filter(r => r.isCorrect).length;
            
            if (correctCount >= 4) {
                // 연속 정답: 난이도 증가
                this.nextQuestionStrategy = "increase_difficulty";
            } else if (correctCount <= 1) {
                // 연속 오답: 난이도 감소
                this.nextQuestionStrategy = "decrease_difficulty";
            } else {
                // 보통: 균형 유지
                this.nextQuestionStrategy = "maintain_balance";
            }
            
            console.log(`📋 다음 문제 전략: ${this.nextQuestionStrategy}`);
            
        } catch (error) {
            console.error(`❌ 다음 문제 전략 업데이트 실패:`, error);
        }
    }

    /**
     * 문제 세트 생성
     */
    generateQuestionSet(count = 10, category = null) {
        try {
            const questionSet = [];
            
            for (let i = 0; i < count; i++) {
                const question = this.generateAdaptiveQuestion(category, i < count * 0.6);
                if (question) {
                    questionSet.push(question);
                }
            }
            
            console.log(`📚 문제 세트 생성 완료: ${questionSet.length}개 문제`);
            return questionSet;
            
        } catch (error) {
            console.error(`❌ 문제 세트 생성 실패:`, error);
            return [];
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
     * 적응형 데이터 저장
     */
    saveAdaptiveData() {
        try {
            const adaptiveData = {
                currentLevel: this.currentUserLevel,
                difficultyProgression: this.difficultyProgression,
                performanceHistory: this.performanceHistory,
                generatedQuestions: this.generatedQuestions,
                nextQuestionStrategy: this.nextQuestionStrategy
            };
            
            localStorage.setItem('aicu_adaptive_questions', JSON.stringify(adaptiveData));
            console.log(`💾 적응형 문제 데이터 저장 완료`);
        } catch (error) {
            console.error(`❌ 적응형 문제 데이터 저장 실패:`, error);
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
            currentUserLevel: this.currentUserLevel,
            difficultyProgression: this.difficultyProgression,
            performanceHistory: this.performanceHistory,
            generatedQuestions: this.generatedQuestions,
            questionBankSize: this.getQuestionBankSize()
        };
    }

    /**
     * 문제 은행 크기 계산
     */
    getQuestionBankSize() {
        try {
            let totalQuestions = 0;
            for (const category in this.questionBank) {
                for (const level in this.questionBank[category]) {
                    totalQuestions += this.questionBank[category][level].length;
                }
            }
            return totalQuestions;
        } catch (error) {
            console.error(`❌ 문제 은행 크기 계산 실패:`, error);
            return 0;
        }
    }

    /**
     * 데이터 초기화
     */
    resetAdaptiveData() {
        try {
            this.currentUserLevel = "beginner";
            this.difficultyProgression = [0.3, 0.5, 0.7, 0.8, 0.9];
            this.performanceHistory = [];
            this.generatedQuestions = [];
            this.nextQuestionStrategy = "balanced";
            
            this.saveAdaptiveData();
            console.log(`🔄 적응형 문제 데이터 초기화 완료`);
        } catch (error) {
            console.error(`❌ 적응형 문제 데이터 초기화 실패:`, error);
        }
    }
}

// 전역 인스턴스 생성
window.adaptiveQuestionGenerator = new AdaptiveQuestionGenerator();

// 자동 초기화
document.addEventListener('DOMContentLoaded', function() {
    if (window.adaptiveQuestionGenerator && !window.adaptiveQuestionGenerator.isInitialized) {
        window.adaptiveQuestionGenerator.initialize();
    }
});

console.log(`🎯 적응형 문제 생성 시스템 모듈 로드 완료`);











