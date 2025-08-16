/**
 * QuizDataCollector - 문제 풀이 데이터 수집 어댑터
 * 모든 문제 풀이 완료 시 데이터를 수집하고 중앙 데이터 관리자로 전송
 */

class QuizDataCollector {
    constructor() {
        this.isInitialized = false;
        this.collectionHistory = [];
        this.initialize();
    }

    /**
     * 초기화
     */
    initialize() {
        console.log('=== QuizDataCollector 초기화 시작 ===');
        
        // 기존 문제 풀이 이벤트 리스너 등록
        this.setupEventListeners();
        
        // 데이터 수집 히스토리 초기화
        this.initializeCollectionHistory();
        
        this.isInitialized = true;
        console.log('✅ QuizDataCollector 초기화 완료');
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 기존 문제 풀이 완료 이벤트 감지
        this.detectExistingQuizEvents();
        
        // 새로운 문제 풀이 완료 이벤트 리스너
        document.addEventListener('quizCompleted', (event) => {
            this.handleQuizCompletion(event.detail);
        });

        // 문제 풀이 시작 이벤트 리스너
        document.addEventListener('quizStarted', (event) => {
            this.handleQuizStart(event.detail);
        });

        console.log('✅ 이벤트 리스너 설정 완료');
    }

    /**
     * 기존 문제 풀이 이벤트 감지
     */
    detectExistingQuizEvents() {
        // 기존 문제 풀이 완료 함수들을 후킹
        this.hookExistingQuizFunctions();
        
        // 기존 문제 풀이 버튼들을 모니터링
        this.monitorExistingQuizButtons();
        
        console.log('✅ 기존 문제 풀이 이벤트 감지 설정 완료');
    }

    /**
     * 기존 문제 풀이 함수들을 후킹
     */
    hookExistingQuizFunctions() {
        // 기존 문제 풀이 완료 함수가 있는지 확인하고 후킹
        if (typeof window.checkAnswer === 'function') {
            const originalCheckAnswer = window.checkAnswer;
            window.checkAnswer = (...args) => {
                const result = originalCheckAnswer.apply(this, args);
                this.collectQuizDataFromCheckAnswer(args, result);
                return result;
            };
            console.log('✅ checkAnswer 함수 후킹 완료');
        }

        if (typeof window.submitAnswer === 'function') {
            const originalSubmitAnswer = window.submitAnswer;
            window.submitAnswer = (...args) => {
                const result = originalSubmitAnswer.apply(this, args);
                this.collectQuizDataFromSubmitAnswer(args, result);
                return result;
            };
            console.log('✅ submitAnswer 함수 후킹 완료');
        }

        if (typeof window.processAnswer === 'function') {
            const originalProcessAnswer = window.processAnswer;
            window.processAnswer = (...args) => {
                const result = originalProcessAnswer.apply(this, args);
                this.collectQuizDataFromProcessAnswer(args, result);
                return result;
            };
            console.log('✅ processAnswer 함수 후킹 완료');
        }
    }

    /**
     * 기존 문제 풀이 버튼들을 모니터링
     */
    monitorExistingQuizButtons() {
        // 문제 풀이 관련 버튼들을 찾아서 이벤트 리스너 추가
        const quizButtons = document.querySelectorAll('button[onclick*="check"], button[onclick*="submit"], button[onclick*="answer"]');
        
        quizButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                this.handleQuizButtonClick(event);
            });
        });

        // 동적으로 추가되는 버튼들도 모니터링
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const newButtons = node.querySelectorAll('button[onclick*="check"], button[onclick*="submit"], button[onclick*="answer"]');
                        newButtons.forEach(button => {
                            button.addEventListener('click', (event) => {
                                this.handleQuizButtonClick(event);
                            });
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('✅ 문제 풀이 버튼 모니터링 설정 완료');
    }

    /**
     * 문제 풀이 시작 처리
     */
    handleQuizStart(quizData) {
        console.log('=== 문제 풀이 시작 ===', quizData);
        
        const startData = {
            questionId: quizData.questionId || this.extractQuestionId(),
            category: quizData.category || this.extractCategory(),
            timestamp: new Date().toISOString(),
            eventType: 'quiz_start'
        };

        this.collectionHistory.push(startData);
        console.log('✅ 문제 풀이 시작 데이터 수집 완료:', startData);
    }

    /**
     * 문제 풀이 완료 처리
     */
    handleQuizCompletion(quizData) {
        console.log('=== 문제 풀이 완료 처리 ===', quizData);
        
        try {
            // 1. 문제 풀이 데이터 수집
            const collectedData = this.collectQuizData(quizData);
            
            // 2. 중앙 데이터 관리자로 전송
            this.sendToCentralManager(collectedData);
            
            // 3. 수집 히스토리에 기록
            this.recordCollection(collectedData);
            
            console.log('✅ 문제 풀이 완료 처리 완료');
            
        } catch (error) {
            console.error('❌ 문제 풀이 완료 처리 실패:', error);
        }
    }

    /**
     * 문제 풀이 데이터 수집
     */
    collectQuizData(quizData) {
        const collectedData = {
            questionId: quizData.questionId || this.extractQuestionId(),
            category: quizData.category || this.extractCategory(),
            isCorrect: quizData.isCorrect || this.extractIsCorrect(),
            userAnswer: quizData.userAnswer || this.extractUserAnswer(),
            correctAnswer: quizData.correctAnswer || this.extractCorrectAnswer(),
            timestamp: new Date().toISOString(),
            sessionId: this.getSessionId(),
            pageUrl: window.location.href,
            userAgent: navigator.userAgent
        };

        return collectedData;
    }

    /**
     * 중앙 데이터 관리자로 전송
     */
    sendToCentralManager(collectedData) {
        if (window.CentralDataManager && typeof window.CentralDataManager.recordQuizResult === 'function') {
            window.CentralDataManager.recordQuizResult(
                collectedData.questionId,
                collectedData.category,
                collectedData.isCorrect,
                collectedData.userAnswer,
                collectedData.correctAnswer
            );
            console.log('✅ 중앙 데이터 관리자로 전송 완료');
        } else {
            console.warn('⚠️ CentralDataManager를 찾을 수 없습니다.');
        }
    }

    /**
     * 수집 히스토리에 기록
     */
    recordCollection(collectedData) {
        this.collectionHistory.push({
            ...collectedData,
            eventType: 'quiz_completion'
        });

        // 히스토리 크기 제한 (최근 100개만 유지)
        if (this.collectionHistory.length > 100) {
            this.collectionHistory = this.collectionHistory.slice(-100);
        }

        localStorage.setItem('aicu_collection_history', JSON.stringify(this.collectionHistory));
    }

    /**
     * 기존 함수들에서 데이터 수집
     */
    collectQuizDataFromCheckAnswer(args, result) {
        console.log('=== checkAnswer에서 데이터 수집 ===', args, result);
        this.extractAndSendQuizData('checkAnswer', args, result);
    }

    collectQuizDataFromSubmitAnswer(args, result) {
        console.log('=== submitAnswer에서 데이터 수집 ===', args, result);
        this.extractAndSendQuizData('submitAnswer', args, result);
    }

    collectQuizDataFromProcessAnswer(args, result) {
        console.log('=== processAnswer에서 데이터 수집 ===', args, result);
        this.extractAndSendQuizData('processAnswer', args, result);
    }

    /**
     * 기존 함수에서 데이터 추출 및 전송
     */
    extractAndSendQuizData(functionName, args, result) {
        try {
            const quizData = {
                questionId: this.extractQuestionId(),
                category: this.extractCategory(),
                isCorrect: this.extractIsCorrect(),
                userAnswer: this.extractUserAnswer(),
                correctAnswer: this.extractCorrectAnswer(),
                functionName: functionName,
                args: args,
                result: result,
                timestamp: new Date().toISOString()
            };

            this.sendToCentralManager(quizData);
            console.log('✅ 기존 함수에서 데이터 수집 완료:', quizData);
            
        } catch (error) {
            console.error('❌ 기존 함수에서 데이터 수집 실패:', error);
        }
    }

    /**
     * 문제 풀이 버튼 클릭 처리
     */
    handleQuizButtonClick(event) {
        console.log('=== 문제 풀이 버튼 클릭 ===', event);
        
        // 버튼 클릭 후 잠시 대기하여 결과 확인
        setTimeout(() => {
            this.extractAndSendQuizData('buttonClick', event, null);
        }, 100);
    }

    /**
     * 수집 히스토리 초기화
     */
    initializeCollectionHistory() {
        const existingHistory = localStorage.getItem('aicu_collection_history');
        if (existingHistory) {
            this.collectionHistory = JSON.parse(existingHistory);
        } else {
            this.collectionHistory = [];
        }
        console.log('✅ 수집 히스토리 초기화 완료');
    }

    /**
     * 문제 ID 추출
     */
    extractQuestionId() {
        // DOM에서 문제 ID 추출 시도
        const questionElement = document.querySelector('[data-question-id], .question-id, #question-id');
        if (questionElement) {
            return questionElement.getAttribute('data-question-id') || questionElement.textContent;
        }

        // URL에서 문제 ID 추출 시도
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('question') || urlParams.get('id') || 'unknown';
    }

    /**
     * 카테고리 추출
     */
    extractCategory() {
        // DOM에서 카테고리 추출 시도
        const categoryElement = document.querySelector('[data-category], .category, #category');
        if (categoryElement) {
            const domCategory = categoryElement.getAttribute('data-category') || categoryElement.textContent;
            return this.mapCategoryName(domCategory);
        }

        // URL에서 카테고리 추출 시도
        const urlParams = new URLSearchParams(window.location.search);
        const urlCategory = urlParams.get('category');
        
        if (urlCategory) {
            return this.mapCategoryName(urlCategory);
        }

        return 'unknown';
    }

    /**
     * 카테고리명 매핑 (시스템 내부명 → 사용자 표시명)
     */
    mapCategoryName(categoryName) {
        const categoryMapping = {
            '06재산보험': '재산보험',
            '07특종보험': '특종보험',
            '08배상책임보험': '배상책임보험',
            '09해상보험': '해상보험',
            // 역방향 매핑도 지원
            '재산보험': '재산보험',
            '특종보험': '특종보험',
            '배상책임보험': '배상책임보험',
            '해상보험': '해상보험'
        };
        
        const mappedCategory = categoryMapping[categoryName];
        console.log(`카테고리 매핑: ${categoryName} → ${mappedCategory || 'unknown'}`);
        return mappedCategory || categoryName;
    }

    /**
     * 정답 여부 추출
     */
    extractIsCorrect() {
        // DOM에서 정답 여부 추출 시도
        const resultElement = document.querySelector('.result, .answer-result, .correct-answer');
        if (resultElement) {
            const text = resultElement.textContent.toLowerCase();
            return text.includes('정답') || text.includes('correct') || text.includes('맞음');
        }

        return false; // 기본값
    }

    /**
     * 사용자 답안 추출
     */
    extractUserAnswer() {
        // 선택된 답안 추출 시도
        const selectedAnswer = document.querySelector('input[type="radio"]:checked, input[type="checkbox"]:checked');
        if (selectedAnswer) {
            return selectedAnswer.value || selectedAnswer.getAttribute('data-answer');
        }

        // 텍스트 입력 답안 추출 시도
        const textAnswer = document.querySelector('input[type="text"], textarea');
        if (textAnswer) {
            return textAnswer.value;
        }

        return 'unknown';
    }

    /**
     * 정답 추출
     */
    extractCorrectAnswer() {
        // DOM에서 정답 추출 시도
        const correctAnswerElement = document.querySelector('.correct-answer, .answer, [data-correct]');
        if (correctAnswerElement) {
            return correctAnswerElement.getAttribute('data-correct') || correctAnswerElement.textContent;
        }

        return 'unknown';
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
     * 수동으로 문제 풀이 데이터 수집 (외부에서 호출)
     */
    manualCollectQuizData(questionId, category, isCorrect, userAnswer, correctAnswer) {
        const quizData = {
            questionId: questionId,
            category: category,
            isCorrect: isCorrect,
            userAnswer: userAnswer,
            correctAnswer: correctAnswer,
            timestamp: new Date().toISOString(),
            manual: true
        };

        this.sendToCentralManager(quizData);
        console.log('✅ 수동 데이터 수집 완료:', quizData);
    }

    /**
     * 수집 히스토리 조회
     */
    getCollectionHistory() {
        return this.collectionHistory;
    }

    /**
     * 수집 히스토리 초기화
     */
    clearCollectionHistory() {
        this.collectionHistory = [];
        localStorage.removeItem('aicu_collection_history');
        console.log('✅ 수집 히스토리 초기화 완료');
    }

    /**
     * 디버그 정보 출력
     */
    debugInfo() {
        console.log('=== QuizDataCollector 디버그 정보 ===');
        console.log('초기화 상태:', this.isInitialized);
        console.log('수집 히스토리 개수:', this.collectionHistory.length);
        console.log('최근 수집 데이터:', this.collectionHistory.slice(-5));
    }
}

// 전역 인스턴스 생성
window.QuizDataCollector = new QuizDataCollector();

// 전역 함수로 노출
window.manualCollectQuizData = function(questionId, category, isCorrect, userAnswer, correctAnswer) {
    window.QuizDataCollector.manualCollectQuizData(questionId, category, isCorrect, userAnswer, correctAnswer);
};

console.log('🚀 QuizDataCollector 로드 완료');
