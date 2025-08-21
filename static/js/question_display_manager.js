// ===== ACIU S4 문제 표시 관리자 - 공통 컴포넌트 =====
// 중앙아키텍처 기반 문제 표시 통합 관리

class QuestionDisplayManager {
    constructor() {
        this.currentQuestion = null;
        this.currentQuestionIndex = 0;
        this.totalQuestions = 0;
        this.isCategoryMode = false;
        this.currentCategory = null;
        
        // 중앙 데이터 시스템과 연동
        this.initializeCentralIntegration();
    }
    
    // 중앙 데이터 시스템 초기화
    initializeCentralIntegration() {
        try {
            console.log('🔗 QuestionDisplayManager - 중앙 데이터 시스템 연동 초기화');
            
            // 중앙 데이터 관리자 확인
            if (window.CentralDataManager) {
                console.log('✅ CentralDataManager 연동 준비 완료');
            } else {
                console.warn('⚠️ CentralDataManager를 찾을 수 없습니다');
            }
            
            // 실시간 동기화 매니저 확인
            if (window.RealtimeSyncManager) {
                console.log('✅ RealtimeSyncManager 연동 준비 완료');
            } else {
                console.warn('⚠️ RealtimeSyncManager를 찾을 수 없습니다');
            }
            
        } catch (error) {
            console.error('❌ 중앙 데이터 시스템 연동 초기화 실패:', error);
        }
    }
    
    // 문제 표시 (공통 함수)
    displayQuestion(question, questionIndex, totalQuestions, options = {}) {
        try {
            console.log('📋 QuestionDisplayManager - 문제 표시 시작');
            
            this.currentQuestion = question;
            this.currentQuestionIndex = questionIndex;
            this.totalQuestions = totalQuestions;
            this.isCategoryMode = options.isCategoryMode || false;
            this.currentCategory = options.currentCategory || null;
            
            // 문제 정보 표시
            this.updateQuestionInfo();
            
            // 문제 텍스트 표시
            this.updateQuestionText();
            
            // 진도 정보 표시
            this.updateProgressInfo();
            
            // 카테고리 정보 표시 (카테고리 모드일 때)
            if (this.isCategoryMode && this.currentCategory) {
                this.updateCategoryInfo();
            }
            
            // 이벤트 발생
            this.dispatchQuestionDisplayedEvent();
            
            console.log('✅ 문제 표시 완료');
            
        } catch (error) {
            console.error('❌ 문제 표시 실패:', error);
        }
    }
    
    // 문제 정보 업데이트
    updateQuestionInfo() {
        try {
            const questionCodeElement = document.getElementById('question-code');
            const questionTypeElement = document.getElementById('question-type');
            const layerInfoElement = document.getElementById('layer-info');
            
            if (questionCodeElement) {
                questionCodeElement.textContent = this.currentQuestion.qcode || 'Q???';
            }
            
            if (questionTypeElement) {
                questionTypeElement.textContent = this.currentQuestion.type || '진위형';
            }
            
            if (layerInfoElement) {
                layerInfoElement.textContent = `${this.currentQuestion.layer1 || ''} > ${this.currentQuestion.layer2 || ''}`;
            }
            
        } catch (error) {
            console.error('❌ 문제 정보 업데이트 실패:', error);
        }
    }
    
    // 문제 텍스트 업데이트
    updateQuestionText() {
        try {
            const questionTextElement = document.getElementById('question-text');
            
            if (questionTextElement) {
                questionTextElement.textContent = this.currentQuestion.question || '문제를 불러올 수 없습니다.';
            }
            
        } catch (error) {
            console.error('❌ 문제 텍스트 업데이트 실패:', error);
        }
    }
    
    // 진도 정보 업데이트
    updateProgressInfo() {
        try {
            const progressInfoElement = document.getElementById('progress-info');
            
            if (progressInfoElement) {
                progressInfoElement.textContent = `${this.currentQuestionIndex + 1} / ${this.totalQuestions}`;
            }
            
        } catch (error) {
            console.error('❌ 진도 정보 업데이트 실패:', error);
        }
    }
    
    // 카테고리 정보 업데이트
    updateCategoryInfo() {
        try {
            const categoryInfoElement = document.getElementById('category-info');
            const categoryProgressInfoElement = document.getElementById('category-progress-info');
            const currentCategorySpan = document.getElementById('current-category');
            
            if (categoryInfoElement) {
                categoryInfoElement.textContent = `📚 ${this.currentCategory} 카테고리 학습`;
                categoryInfoElement.classList.remove('hidden');
            }
            
            if (categoryProgressInfoElement) {
                categoryProgressInfoElement.classList.remove('hidden');
            }
            
            if (currentCategorySpan) {
                currentCategorySpan.textContent = this.currentCategory;
            }
            
        } catch (error) {
            console.error('❌ 카테고리 정보 업데이트 실패:', error);
        }
    }
    
    // 문제 표시 이벤트 발생
    dispatchQuestionDisplayedEvent() {
        try {
            const event = new CustomEvent('questionDisplayed', {
                detail: {
                    questionId: this.currentQuestion.qcode,
                    questionIndex: this.currentQuestionIndex,
                    totalQuestions: this.totalQuestions,
                    category: this.currentCategory,
                    isCategoryMode: this.isCategoryMode,
                    timestamp: new Date().toISOString()
                }
            });
            
            document.dispatchEvent(event);
            console.log('📡 questionDisplayed 이벤트 발생');
            
        } catch (error) {
            console.error('❌ 문제 표시 이벤트 발생 실패:', error);
        }
    }
    
    // 문제 초기화
    resetQuestion() {
        try {
            console.log('🔄 QuestionDisplayManager - 문제 초기화');
            
            this.currentQuestion = null;
            this.currentQuestionIndex = 0;
            this.totalQuestions = 0;
            this.isCategoryMode = false;
            this.currentCategory = null;
            
            // 정답 표시 영역 숨기기
            const correctAnswerElement = document.getElementById('correct-answer');
            if (correctAnswerElement) {
                correctAnswerElement.classList.add('hidden');
            }
            
            console.log('✅ 문제 초기화 완료');
            
        } catch (error) {
            console.error('❌ 문제 초기화 실패:', error);
        }
    }
    
    // 현재 문제 정보 반환
    getCurrentQuestion() {
        return {
            question: this.currentQuestion,
            index: this.currentQuestionIndex,
            total: this.totalQuestions,
            category: this.currentCategory,
            isCategoryMode: this.isCategoryMode
        };
    }
}

// 전역 인스턴스 생성
window.QuestionDisplayManager = new QuestionDisplayManager();

console.log('✅ QuestionDisplayManager 로드 완료');
