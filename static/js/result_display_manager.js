// ===== ACIU S4 정답 결과 표시 관리자 - 공통 컴포넌트 =====
// 중앙아키텍처 기반 인라인 정답 결과 표시 통합 관리

class ResultDisplayManager {
    constructor() {
        this.resultContainer = null;
        this.currentResult = null;
        
        // 중앙 데이터 시스템과 연동
        this.initializeCentralIntegration();
    }
    
    // 중앙 데이터 시스템 초기화
    initializeCentralIntegration() {
        try {
            console.log('🔗 ResultDisplayManager - 중앙 데이터 시스템 연동 초기화');
            
            // 중앙 데이터 관리자 확인
            if (window.CentralDataManager) {
                console.log('✅ CentralDataManager 연동 준비 완료');
            } else {
                console.warn('⚠️ CentralDataManager를 찾을 수 없습니다');
            }
            
        } catch (error) {
            console.error('❌ 중앙 데이터 시스템 연동 초기화 실패:', error);
        }
    }
    
    // 인라인 정답 결과 표시 (공통 함수)
    showInlineResult(userAnswer, correctAnswer, question, options = {}) {
        try {
            console.log('📊 ResultDisplayManager - 인라인 정답 결과 표시 시작');
            
            const isCorrect = userAnswer === correctAnswer;
            this.currentResult = {
                userAnswer,
                correctAnswer,
                isCorrect,
                question,
                timestamp: new Date().toISOString()
            };
            
            // 결과 컨테이너 찾기 또는 생성
            this.ensureResultContainer();
            
            // 결과 메시지 생성
            const resultMessage = this.createResultMessage(userAnswer, correctAnswer, isCorrect);
            
            // 결과 표시
            this.displayResult(resultMessage, isCorrect);
            
            // 중앙 데이터 시스템에 결과 전송
            this.sendResultToCentralSystem();
            
            // 이벤트 발생
            this.dispatchResultShownEvent();
            
            console.log('✅ 인라인 정답 결과 표시 완료');
            
        } catch (error) {
            console.error('❌ 인라인 정답 결과 표시 실패:', error);
        }
    }
    
    // 결과 컨테이너 확인 및 생성
    ensureResultContainer() {
        try {
            // 기존 결과 컨테이너 찾기
            this.resultContainer = document.getElementById('inline-result-container');
            
            if (!this.resultContainer) {
                // 결과 컨테이너가 없으면 생성
                this.createResultContainer();
            }
            
        } catch (error) {
            console.error('❌ 결과 컨테이너 확인 실패:', error);
        }
    }
    
    // 결과 컨테이너 생성
    createResultContainer() {
        try {
            console.log('📦 결과 컨테이너 생성');
            
            // 선택지 컨테이너 찾기
            const answerButtonsContainer = document.getElementById('answer-buttons');
            if (!answerButtonsContainer) {
                throw new Error('선택지 컨테이너를 찾을 수 없습니다');
            }
            
            // 결과 컨테이너 생성
            this.resultContainer = document.createElement('div');
            this.resultContainer.id = 'inline-result-container';
            this.resultContainer.className = 'mt-4 p-4 rounded-lg border-2 transition-all duration-300 transform';
            
            // 선택지 컨테이너 다음에 삽입
            answerButtonsContainer.parentNode.insertBefore(this.resultContainer, answerButtonsContainer.nextSibling);
            
            console.log('✅ 결과 컨테이너 생성 완료');
            
        } catch (error) {
            console.error('❌ 결과 컨테이너 생성 실패:', error);
        }
    }
    
    // 결과 메시지 생성
    createResultMessage(userAnswer, correctAnswer, isCorrect) {
        try {
            let message = '';
            
            if (isCorrect) {
                message = `
                    <div class="flex items-center space-x-3">
                        <div class="flex-shrink-0">
                            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                </svg>
                            </div>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-green-800">정답입니다!</h3>
                            <p class="text-sm text-green-600">선택한 답: <span class="font-medium">${this.getAnswerText(userAnswer)}</span> | 정답: <span class="font-medium">${this.getAnswerText(correctAnswer)}</span></p>
                        </div>
                    </div>
                `;
            } else {
                message = `
                    <div class="flex items-center space-x-3">
                        <div class="flex-shrink-0">
                            <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                                </svg>
                            </div>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-red-800">틀렸습니다</h3>
                            <p class="text-sm text-red-600">선택한 답: <span class="font-medium">${this.getAnswerText(userAnswer)}</span> | 정답: <span class="font-medium">${this.getAnswerText(correctAnswer)}</span></p>
                        </div>
                    </div>
                `;
            }
            
            return message;
            
        } catch (error) {
            console.error('❌ 결과 메시지 생성 실패:', error);
            return '<p class="text-gray-600">결과를 표시할 수 없습니다.</p>';
        }
    }
    
    // 답안 텍스트 변환
    getAnswerText(answer) {
        try {
            const answerMap = {
                'O': '맞음 (O)',
                'X': '틀림 (X)',
                '1': '1번',
                '2': '2번',
                '3': '3번',
                '4': '4번'
            };
            
            return answerMap[answer] || answer;
            
        } catch (error) {
            console.error('❌ 답안 텍스트 변환 실패:', error);
            return answer;
        }
    }
    
    // 결과 표시
    displayResult(message, isCorrect) {
        try {
            if (!this.resultContainer) {
                throw new Error('결과 컨테이너가 없습니다');
            }
            
            // 기존 내용 제거
            this.resultContainer.innerHTML = '';
            
            // 결과 메시지 설정
            this.resultContainer.innerHTML = message;
            
            // 스타일 적용
            if (isCorrect) {
                this.resultContainer.className = 'mt-4 p-4 rounded-lg border-2 border-green-200 bg-green-50 transition-all duration-300 transform';
            } else {
                this.resultContainer.className = 'mt-4 p-4 rounded-lg border-2 border-red-200 bg-red-50 transition-all duration-300 transform';
            }
            
            // 애니메이션 효과
            this.resultContainer.style.opacity = '0';
            this.resultContainer.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                this.resultContainer.style.opacity = '1';
                this.resultContainer.style.transform = 'translateY(0)';
            }, 100);
            
            console.log('✅ 결과 표시 완료');
            
        } catch (error) {
            console.error('❌ 결과 표시 실패:', error);
        }
    }
    
    // 중앙 데이터 시스템에 결과 전송
    sendResultToCentralSystem() {
        try {
            if (window.CentralDataManager && this.currentResult) {
                const { question, userAnswer, correctAnswer, isCorrect } = this.currentResult;
                
                // 중앙 데이터 관리자로 결과 전송
                window.CentralDataManager.recordQuizResult(
                    question.qcode || `question_${Date.now()}`,
                    'quiz',
                    isCorrect,
                    userAnswer,
                    correctAnswer
                );
                
                console.log('✅ 중앙 데이터 시스템에 결과 전송 완료');
            }
            
        } catch (error) {
            console.error('❌ 중앙 데이터 시스템 결과 전송 실패:', error);
        }
    }
    
    // 결과 숨기기
    hideResult() {
        try {
            if (this.resultContainer) {
                this.resultContainer.style.opacity = '0';
                this.resultContainer.style.transform = 'translateY(-10px)';
                
                setTimeout(() => {
                    this.resultContainer.style.display = 'none';
                }, 300);
                
                console.log('✅ 결과 숨기기 완료');
            }
            
        } catch (error) {
            console.error('❌ 결과 숨기기 실패:', error);
        }
    }
    
    // 결과 초기화
    resetResult() {
        try {
            if (this.resultContainer) {
                this.resultContainer.innerHTML = '';
                this.resultContainer.style.display = 'none';
            }
            
            this.currentResult = null;
            
            console.log('✅ 결과 초기화 완료');
            
        } catch (error) {
            console.error('❌ 결과 초기화 실패:', error);
        }
    }
    
    // 결과 표시 이벤트 발생
    dispatchResultShownEvent() {
        try {
            if (this.currentResult) {
                const event = new CustomEvent('resultShown', {
                    detail: {
                        userAnswer: this.currentResult.userAnswer,
                        correctAnswer: this.currentResult.correctAnswer,
                        isCorrect: this.currentResult.isCorrect,
                        questionId: this.currentResult.question?.qcode,
                        timestamp: this.currentResult.timestamp
                    }
                });
                
                document.dispatchEvent(event);
                console.log('📡 resultShown 이벤트 발생');
            }
            
        } catch (error) {
            console.error('❌ 결과 표시 이벤트 발생 실패:', error);
        }
    }
    
    // 현재 결과 반환
    getCurrentResult() {
        return this.currentResult;
    }
}

// 전역 인스턴스 생성
window.ResultDisplayManager = new ResultDisplayManager();

console.log('✅ ResultDisplayManager 로드 완료');
