/**
 * CentralDataManager - 중앙 데이터 관리자
 * 모든 문제 풀이 데이터를 중앙에서 관리하고 실시간 동기화를 담당
 */

class CentralDataManager {
    constructor() {
        this.isInitialized = false;
        this.eventListeners = new Map();
        this.initialize();
    }

    /**
     * 초기화
     */
    initialize() {
        console.log('=== 중앙 데이터 관리자 초기화 ===');
        
        // 기존 카운터 시스템 비활성화
        this.disableLegacyCounters();
        
        // 새로운 시스템 초기화
        this.initializeNewSystem();
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
        
        // 전역 함수 노출
        this.exposeGlobalFunctions();
        
        console.log('✅ 중앙 데이터 관리자 초기화 완료');
    }

    /**
     * 데이터 구조 확인 및 초기화
     */
    ensureDataStructure() {
        // 기존 통계 데이터 확인
        let categoryStats = localStorage.getItem('aicu_category_statistics');
        if (!categoryStats) {
            console.log('⚠️ aicu_category_statistics가 없어 초기화합니다.');
            this.initializeCategoryStatistics();
        }

        // 실시간 데이터 구조 확인
        let realTimeData = localStorage.getItem('aicu_real_time_data');
        if (!realTimeData) {
            console.log('⚠️ aicu_real_time_data가 없어 초기화합니다.');
            this.initializeRealTimeData();
        }

        // 문제 풀이 결과 데이터 확인
        let quizResults = localStorage.getItem('aicu_quiz_results');
        if (!quizResults) {
            console.log('⚠️ aicu_quiz_results가 없어 초기화합니다.');
            this.initializeQuizResults();
        }
    }

    /**
     * 카테고리별 통계 초기화
     */
    initializeCategoryStatistics() {
        const categoryStats = {
            categories: {
                "06재산보험": {
                    total_questions: 169,
                    solved: 0,
                    correct: 0,
                    accuracy: 0,
                    current_question_index: 0,
                    daily_progress: {}
                },
                "07특종보험": {
                    total_questions: 182,
                    solved: 0,
                    correct: 0,
                    accuracy: 0,
                    current_question_index: 0,
                    daily_progress: {}
                },
                "08배상책임보험": {
                    total_questions: 268,
                    solved: 0,
                    correct: 0,
                    accuracy: 0,
                    current_question_index: 0,
                    daily_progress: {}
                },
                "09해상보험": {
                    total_questions: 170,
                    solved: 0,
                    correct: 0,
                    accuracy: 0,
                    current_question_index: 0,
                    daily_progress: {}
                }
            },
            last_updated: new Date().toISOString()
        };

        localStorage.setItem('aicu_category_statistics', JSON.stringify(categoryStats));
        console.log('✅ 카테고리별 통계 초기화 완료');
    }

    /**
     * 실시간 데이터 초기화
     */
    initializeRealTimeData() {
        const realTimeData = {
            total_attempts: 0,
            total_correct: 0,
            overall_accuracy: 0,
            today_attempts: 0,
            today_correct: 0,
            today_accuracy: 0,
            last_updated: new Date().toISOString(),
            session_start: new Date().toISOString()
        };

        localStorage.setItem('aicu_real_time_data', JSON.stringify(realTimeData));
        console.log('✅ 실시간 데이터 초기화 완료');
    }

    /**
     * 문제 풀이 결과 데이터 초기화
     */
    initializeQuizResults() {
        const quizResults = {
            results: [],
            total_count: 0,
            last_updated: new Date().toISOString()
        };

        localStorage.setItem('aicu_quiz_results', JSON.stringify(quizResults));
        console.log('✅ 문제 풀이 결과 데이터 초기화 완료');
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 문제 풀이 완료 이벤트 리스너
        document.addEventListener('quizCompleted', (event) => {
            this.handleQuizCompleted(event.detail);
        });

        // 데이터 동기화 요청 이벤트 리스너
        document.addEventListener('syncDataRequested', (event) => {
            this.syncData();
        });

        console.log('✅ 이벤트 리스너 설정 완료');
    }

    /**
     * 문제 풀이 완료 처리
     */
    handleQuizCompleted(quizData) {
        console.log('=== 문제 풀이 완료 처리 ===', quizData);
        
        try {
            // 1. 문제 풀이 결과 저장
            this.saveQuizResult(quizData);
            
            // 2. 카테고리별 통계 업데이트
            this.updateCategoryStatistics(quizData);
            
            // 3. 실시간 데이터 업데이트
            this.updateRealTimeData(quizData);
            
            // 4. 예상 점수 재계산
            this.recalculatePredictedScores();
            
            // 5. 이벤트 브로드캐스트
            this.broadcastDataUpdate();
            
            console.log('✅ 문제 풀이 완료 처리 완료');
            
        } catch (error) {
            console.error('❌ 문제 풀이 완료 처리 실패:', error);
        }
    }

    /**
     * 문제 풀이 결과 저장
     */
    saveQuizResult(quizData) {
        const quizResults = JSON.parse(localStorage.getItem('aicu_quiz_results') || '{"results": [], "total_count": 0}');
        
        const result = {
            questionId: quizData.questionId,
            category: quizData.category,
            isCorrect: quizData.isCorrect,
            userAnswer: quizData.userAnswer,
            correctAnswer: quizData.correctAnswer,
            timestamp: new Date().toISOString(),
            sessionId: this.getSessionId()
        };

        quizResults.results.push(result);
        quizResults.total_count = quizResults.results.length;
        quizResults.last_updated = new Date().toISOString();

        localStorage.setItem('aicu_quiz_results', JSON.stringify(quizResults));
        console.log('✅ 문제 풀이 결과 저장 완료:', result);
    }

    /**
     * 카테고리별 통계 업데이트
     */
    updateCategoryStatistics(quizData) {
        const categoryStats = JSON.parse(localStorage.getItem('aicu_category_statistics'));
        const mappedCategory = this.mapCategoryToSystemName(quizData.category);

        if (categoryStats.categories[mappedCategory]) {
            const cat = categoryStats.categories[mappedCategory];
            cat.solved += 1;
            
            if (quizData.isCorrect) {
                cat.correct += 1;
            }
            
            cat.accuracy = cat.solved > 0 ? (cat.correct / cat.solved) * 100 : 0;
            
            // 오늘 진행상황 업데이트
            const today = new Date().toISOString().split('T')[0];
            if (!cat.daily_progress[today]) {
                cat.daily_progress[today] = { attempts: 0, correct: 0 };
            }
            cat.daily_progress[today].attempts += 1;
            if (quizData.isCorrect) {
                cat.daily_progress[today].correct += 1;
            }
        }

        categoryStats.last_updated = new Date().toISOString();
        localStorage.setItem('aicu_category_statistics', JSON.stringify(categoryStats));
        console.log('✅ 카테고리별 통계 업데이트 완료:', quizData.category, '→', mappedCategory);
    }

    /**
     * 카테고리명 매핑 (사용자 표시명 → 시스템 내부명)
     */
    mapCategoryToSystemName(categoryName) {
        const categoryMapping = {
            '재산보험': '06재산보험',
            '특종보험': '07특종보험',
            '배상책임보험': '08배상책임보험',
            '해상보험': '09해상보험',
            // 시스템 내부명도 그대로 지원
            '06재산보험': '06재산보험',
            '07특종보험': '07특종보험',
            '08배상책임보험': '08배상책임보험',
            '09해상보험': '09해상보험'
        };
        
        const mappedCategory = categoryMapping[categoryName];
        console.log(`중앙 시스템 카테고리 매핑: ${categoryName} → ${mappedCategory || 'unknown'}`);
        return mappedCategory || categoryName;
    }

    /**
     * 실시간 데이터 업데이트
     */
    updateRealTimeData(quizData) {
        const realTimeData = JSON.parse(localStorage.getItem('aicu_real_time_data'));
        const mappedCategory = this.mapCategoryToSystemName(quizData.category);
        
        realTimeData.total_attempts += 1;
        if (quizData.isCorrect) {
            realTimeData.total_correct += 1;
        }
        
        realTimeData.overall_accuracy = realTimeData.total_attempts > 0 ? 
            (realTimeData.total_correct / realTimeData.total_attempts) * 100 : 0;

        // 카테고리별 데이터 업데이트
        if (!realTimeData.categories) {
            realTimeData.categories = {
                '06재산보험': { total: 0, correct: 0, incorrect: 0, accuracy: 0.0 },
                '07특종보험': { total: 0, correct: 0, incorrect: 0, accuracy: 0.0 },
                '08배상책임보험': { total: 0, correct: 0, incorrect: 0, accuracy: 0.0 },
                '09해상보험': { total: 0, correct: 0, incorrect: 0, accuracy: 0.0 }
            };
        }

        if (realTimeData.categories[mappedCategory]) {
            realTimeData.categories[mappedCategory].total += 1;
            if (quizData.isCorrect) {
                realTimeData.categories[mappedCategory].correct += 1;
            } else {
                realTimeData.categories[mappedCategory].incorrect += 1;
            }
            
            const cat = realTimeData.categories[mappedCategory];
            cat.accuracy = cat.total > 0 ? Math.round((cat.correct / cat.total) * 1000) / 10 : 0;
        }

        // 오늘 데이터 업데이트
        const today = new Date().toISOString().split('T')[0];
        const sessionStart = new Date(realTimeData.session_start).toISOString().split('T')[0];
        
        if (today === sessionStart) {
            realTimeData.today_attempts += 1;
            if (quizData.isCorrect) {
                realTimeData.today_correct += 1;
            }
            realTimeData.today_accuracy = realTimeData.today_attempts > 0 ? 
                (realTimeData.today_correct / realTimeData.today_attempts) * 100 : 0;
        } else {
            // 새로운 날짜면 오늘 데이터 초기화
            realTimeData.today_attempts = 1;
            realTimeData.today_correct = quizData.isCorrect ? 1 : 0;
            realTimeData.today_accuracy = quizData.isCorrect ? 100 : 0;
            realTimeData.session_start = new Date().toISOString();
        }

        realTimeData.last_updated = new Date().toISOString();
        localStorage.setItem('aicu_real_time_data', JSON.stringify(realTimeData));
        console.log('✅ 실시간 데이터 업데이트 완료:', quizData.category, '→', mappedCategory);
    }

    /**
     * 예상 점수 재계산
     */
    recalculatePredictedScores() {
        // PredictedScoresManager가 있으면 재계산 요청
        if (window.PredictedScoresManager && typeof window.PredictedScoresManager.calculatePredictedScores === 'function') {
            window.PredictedScoresManager.calculatePredictedScores();
            console.log('✅ 예상 점수 재계산 완료');
        } else {
            console.log('⚠️ PredictedScoresManager를 찾을 수 없습니다.');
        }
    }

    /**
     * 데이터 업데이트 브로드캐스트
     */
    broadcastDataUpdate() {
        const event = new CustomEvent('dataUpdated', {
            detail: {
                timestamp: new Date().toISOString(),
                source: 'CentralDataManager'
            }
        });
        
        document.dispatchEvent(event);
        console.log('✅ 데이터 업데이트 브로드캐스트 완료');
    }

    /**
     * 데이터 동기화
     */
    syncData() {
        console.log('=== 데이터 동기화 시작 ===');
        
        // 모든 페이지에서 최신 데이터 로드
        this.ensureDataStructure();
        
        // 예상 점수 재계산
        this.recalculatePredictedScores();
        
        // UI 업데이트 이벤트 발생
        this.broadcastDataUpdate();
        
        console.log('✅ 데이터 동기화 완료');
    }

    /**
     * 세션 ID 생성
     */
    getSessionId() {
        let sessionId = sessionStorage.getItem('aicu_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('aicu_session_id', sessionId);
        }
        return sessionId;
    }

    /**
     * 문제 풀이 완료 이벤트 발생 (외부에서 호출)
     */
    recordQuizResult(questionId, category, isCorrect, userAnswer, correctAnswer) {
        const quizData = {
            questionId: questionId,
            category: category,
            isCorrect: isCorrect,
            userAnswer: userAnswer,
            correctAnswer: correctAnswer,
            timestamp: new Date().toISOString()
        };

        // 이벤트 발생
        const event = new CustomEvent('quizCompleted', {
            detail: quizData
        });
        
        document.dispatchEvent(event);
        console.log('✅ 문제 풀이 완료 이벤트 발생:', quizData);
    }

    /**
     * 현재 통계 데이터 조회
     */
    getCurrentStatistics() {
        return {
            categoryStats: JSON.parse(localStorage.getItem('aicu_category_statistics') || '{}'),
            realTimeData: JSON.parse(localStorage.getItem('aicu_real_time_data') || '{}'),
            quizResults: JSON.parse(localStorage.getItem('aicu_quiz_results') || '{}')
        };
    }

    /**
     * 퀴즈 결과 데이터 조회
     */
    getQuizResults() {
        console.log('=== 퀴즈 결과 데이터 조회 ===');
        
        try {
            const quizResults = JSON.parse(localStorage.getItem('aicu_quiz_results') || '[]');
            console.log('✅ 퀴즈 결과 데이터 조회 성공:', quizResults);
            return quizResults;
        } catch (error) {
            console.error('❌ 퀴즈 결과 데이터 조회 실패:', error);
            return [];
        }
    }

    /**
     * 디버그 정보 출력
     */
    debugInfo() {
        console.log('=== CentralDataManager 디버그 정보 ===');
        console.log('초기화 상태:', this.isInitialized);
        console.log('현재 통계:', this.getCurrentStatistics());
        console.log('세션 ID:', this.getSessionId());
    }

    // 기존 카운터 시스템 비활성화 및 새로운 시스템 활성화
    disableLegacyCounters() {
        console.log('=== 기존 카운터 시스템 비활성화 ===');
        
        // 기존 카운터 관련 키들 제거
        const legacyKeys = [
            'aicu_category_statistics',  // 기존 카테고리 통계
            'aicu_old_quiz_data',        // 기존 퀴즈 데이터
            'aicu_legacy_counters'       // 기존 카운터들
        ];
        
        legacyKeys.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                console.log(`✅ 기존 카운터 제거: ${key}`);
            }
        });
        
        // 새로운 시스템만 활성화
        this.initializeNewSystem();
        console.log('✅ 새로운 중앙 데이터 관리 시스템만 활성화 완료');
    }
    
    // 새로운 시스템 초기화
    initializeNewSystem() {
        console.log('=== 새로운 중앙 데이터 관리 시스템 초기화 ===');
        
        // 새로운 데이터 구조만 사용
        if (!localStorage.getItem('aicu_real_time_data')) {
            localStorage.setItem('aicu_real_time_data', JSON.stringify({
                categories: {
                    '06재산보험': { total: 0, correct: 0, incorrect: 0, accuracy: 0 },
                    '07특종보험': { total: 0, correct: 0, incorrect: 0, accuracy: 0 },
                    '08배상책임보험': { total: 0, correct: 0, incorrect: 0, accuracy: 0 },
                    '09해상보험': { total: 0, correct: 0, incorrect: 0, accuracy: 0 }
                },
                lastUpdated: new Date().toISOString()
            }));
        }
        
        if (!localStorage.getItem('aicu_quiz_results')) {
            localStorage.setItem('aicu_quiz_results', JSON.stringify([]));
        }
        
        console.log('✅ 새로운 데이터 구조 초기화 완료');
    }

    // 카테고리 데이터 조회 (기존 카운터 호환성용)
    getCategoryData(category) {
        console.log(`=== 카테고리 데이터 조회: ${category} ===`);
        
        try {
            const realTimeData = JSON.parse(localStorage.getItem('aicu_real_time_data') || '{}');
            const categoryData = realTimeData.categories?.[category];
            
            if (categoryData) {
                console.log(`✅ 카테고리 데이터 조회 성공:`, categoryData);
                return {
                    total: categoryData.total || 0,
                    correct: categoryData.correct || 0,
                    incorrect: categoryData.incorrect || 0,
                    accuracy: categoryData.accuracy || 0
                };
            } else {
                console.log(`⚠️ 카테고리 데이터 없음: ${category}, 기본값 반환`);
                return { total: 0, correct: 0, incorrect: 0, accuracy: 0 };
            }
        } catch (error) {
            console.error(`❌ 카테고리 데이터 조회 오류:`, error);
            return { total: 0, correct: 0, incorrect: 0, accuracy: 0 };
        }
    }
    
    // 모든 카테고리 데이터 조회
    getAllCategoryData() {
        console.log('=== 모든 카테고리 데이터 조회 ===');
        
        try {
            const realTimeData = JSON.parse(localStorage.getItem('aicu_real_time_data') || '{}');
            const categories = realTimeData.categories || {};
            
            console.log('✅ 모든 카테고리 데이터 조회 성공:', categories);
            return categories;
        } catch (error) {
            console.error('❌ 모든 카테고리 데이터 조회 오류:', error);
            return {};
        }
    }

    // 전역 함수 노출
    exposeGlobalFunctions() {
        window.recordQuizResult = function(questionId, category, isCorrect, userAnswer, correctAnswer) {
            window.CentralDataManager.recordQuizResult(questionId, category, isCorrect, userAnswer, correctAnswer);
        };
        console.log('✅ 전역 함수 노출 완료');
    }

    /**
     * 기본학습 상태 저장
     */
    saveBasicLearningState(category, questionIndex, isCorrect) {
        console.log('=== 기본학습 상태 저장 ===');
        
        try {
            const realTimeData = JSON.parse(localStorage.getItem('aicu_real_time_data') || '{}');
            
            if (!realTimeData['basic_learning']) {
                realTimeData['basic_learning'] = {
                    solved: 0,
                    correct: 0,
                    accuracy: 0,
                    daily_progress: {},
                    lastQuestionIndex: 0
                };
            }
            
            // 마지막 문제 인덱스 업데이트
            realTimeData['basic_learning'].lastQuestionIndex = questionIndex;
            
            // 학습 통계 업데이트
            if (isCorrect !== undefined) {
                realTimeData['basic_learning'].solved++;
                if (isCorrect) {
                    realTimeData['basic_learning'].correct++;
                }
                realTimeData['basic_learning'].accuracy = (realTimeData['basic_learning'].correct / realTimeData['basic_learning'].solved * 100).toFixed(1);
                
                // 일일 진행률 업데이트
                this.updateDailyProgress(realTimeData['basic_learning'], isCorrect);
            }
            
            localStorage.setItem('aicu_real_time_data', JSON.stringify(realTimeData));
            
            // 이벤트 발생
            this.triggerDataUpdate('basicLearningStateUpdated', {
                category: category,
                questionIndex: questionIndex,
                isCorrect: isCorrect
            });
            
            console.log('✅ 기본학습 상태 저장 완료');
            
        } catch (error) {
            console.error('❌ 기본학습 상태 저장 실패:', error);
        }
    }
    
    /**
     * 기본학습 상태 복원
     */
    getBasicLearningState(category) {
        console.log('=== 기본학습 상태 복원 ===');
        
        try {
            const realTimeData = JSON.parse(localStorage.getItem('aicu_real_time_data') || '{}');
            const basicLearningData = realTimeData['basic_learning'];
            
            if (!basicLearningData) {
                console.log('⚠️ 기본학습 데이터가 없습니다. 기본값 반환');
                return {
                    lastQuestionIndex: 0,
                    solved: 0,
                    correct: 0,
                    accuracy: 0
                };
            }
            
            const state = {
                lastQuestionIndex: basicLearningData.lastQuestionIndex || 0,
                solved: basicLearningData.solved || 0,
                correct: basicLearningData.correct || 0,
                accuracy: basicLearningData.accuracy || 0
            };
            
            console.log('✅ 기본학습 상태 복원 완료:', state);
            return state;
            
        } catch (error) {
            console.error('❌ 기본학습 상태 복원 실패:', error);
            return {
                lastQuestionIndex: 0,
                solved: 0,
                correct: 0,
                accuracy: 0
            };
        }
    }
    
    /**
     * 일일 진행률 업데이트 (기본학습용)
     */
    updateDailyProgress(basicLearningData, isCorrect) {
        const today = new Date().toISOString().split('T')[0];
        
        if (!basicLearningData.daily_progress[today]) {
            basicLearningData.daily_progress[today] = {
                solved: 0,
                correct: 0
            };
        }
        
        basicLearningData.daily_progress[today].solved++;
        if (isCorrect) {
            basicLearningData.daily_progress[today].correct++;
        }
        
        console.log(`✅ 일일 진행률 업데이트: ${today} - ${basicLearningData.daily_progress[today].solved}문제, ${basicLearningData.daily_progress[today].correct}정답`);
    }
}

// 전역 인스턴스 생성
window.CentralDataManager = new CentralDataManager();

// 전역 함수로 노출
window.recordQuizResult = function(questionId, category, isCorrect, userAnswer, correctAnswer) {
    window.CentralDataManager.recordQuizResult(questionId, category, isCorrect, userAnswer, correctAnswer);
};

console.log('🚀 CentralDataManager 로드 완료');
