// ===== ACIU S4 선택지 버튼 관리자 - 공통 컴포넌트 =====
// 중앙아키텍처 기반 선택지 렌더링 통합 관리

class AnswerButtonManager {
    constructor() {
        this.selectedAnswer = null;
        this.currentQuestion = null;
        this.buttonsContainer = null;
        
        // 중앙 데이터 시스템과 연동
        this.initializeCentralIntegration();
    }
    
    // 중앙 데이터 시스템 초기화
    initializeCentralIntegration() {
        try {
            console.log('🔗 AnswerButtonManager - 중앙 데이터 시스템 연동 초기화');
            
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
    
    // 선택지 버튼 생성 (공통 함수)
    createAnswerButtons(question, containerId = 'answer-buttons') {
        try {
            console.log('🎯 AnswerButtonManager - 선택지 버튼 생성 시작');
            
            this.currentQuestion = question;
            this.selectedAnswer = null;
            
            // 컨테이너 찾기
            this.buttonsContainer = document.getElementById(containerId);
            if (!this.buttonsContainer) {
                throw new Error(`선택지 컨테이너를 찾을 수 없습니다: ${containerId}`);
            }
            
            // 기존 버튼 제거
            this.buttonsContainer.innerHTML = '';
            
            // 문제 타입에 따른 버튼 생성
            if (question.type === '진위형') {
                this.createTrueFalseButtons();
            } else {
                this.createMultipleChoiceButtons();
            }
            
            // 이벤트 발생
            this.dispatchAnswerButtonsCreatedEvent();
            
            console.log('✅ 선택지 버튼 생성 완료');
            
        } catch (error) {
            console.error('❌ 선택지 버튼 생성 실패:', error);
        }
    }
    
    // 진위형 버튼 생성 (1행 배치)
    createTrueFalseButtons() {
        try {
            console.log('🔘 진위형 버튼 생성');
            
            // 1행 플렉스 컨테이너 생성
            const flexContainer = document.createElement('div');
            flexContainer.className = 'flex justify-center space-x-6 mb-4';
            
            // O/X 버튼 생성
            ['O', 'X'].forEach(answer => {
                const button = document.createElement('button');
                button.className = 'bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105';
                button.textContent = answer === 'O' ? '⭕ 맞다 (O)' : '❌ 틀리다 (X)';
                button.dataset.answer = answer;
                button.onclick = () => this.selectAnswer(answer, button);
                
                flexContainer.appendChild(button);
            });
            
            this.buttonsContainer.appendChild(flexContainer);
            
        } catch (error) {
            console.error('❌ 진위형 버튼 생성 실패:', error);
        }
    }
    
    // 선택형 버튼 생성 (1행 배치)
    createMultipleChoiceButtons() {
        try {
            console.log('🔘 선택형 버튼 생성');
            
            // 1행 플렉스 컨테이너 생성
            const flexContainer = document.createElement('div');
            flexContainer.className = 'flex justify-center space-x-4 mb-4 flex-wrap';
            
            // 1, 2, 3, 4번 버튼 생성
            for (let i = 1; i <= 4; i++) {
                const button = document.createElement('button');
                button.className = 'bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 min-w-[80px]';
                button.textContent = `${i}번`;
                button.dataset.answer = i.toString();
                button.onclick = () => this.selectAnswer(i.toString(), button);
                
                flexContainer.appendChild(button);
            }
            
            this.buttonsContainer.appendChild(flexContainer);
            
        } catch (error) {
            console.error('❌ 선택형 버튼 생성 실패:', error);
        }
    }
    
    // 답안 선택
    selectAnswer(answer, button) {
        try {
            console.log(`🎯 답안 선택: ${answer}`);
            
            // 이전 선택 해제
            this.clearPreviousSelection();
            
            // 현재 선택 표시 (노란색으로 강조)
            button.className = button.className.replace('bg-gray-200 text-gray-800', 'bg-yellow-400 text-gray-800');
            button.className = button.className.replace('hover:bg-gray-300', 'hover:bg-yellow-500');
            
            // 선택한 답안 저장
            this.selectedAnswer = answer;
            
            // 이벤트 발생
            this.dispatchAnswerSelectedEvent(answer);
            
            console.log(`✅ 답안 선택 완료: ${answer}`);
            
        } catch (error) {
            console.error('❌ 답안 선택 실패:', error);
        }
    }
    
    // 이전 선택 해제
    clearPreviousSelection() {
        try {
            const allButtons = this.buttonsContainer.querySelectorAll('button');
            allButtons.forEach(btn => {
                btn.className = btn.className.replace('bg-yellow-400 text-gray-800', 'bg-gray-200 text-gray-800');
                btn.className = btn.className.replace('hover:bg-yellow-500', 'hover:bg-gray-300');
                btn.className = btn.className.replace('bg-green-500 text-white', 'bg-gray-200 text-gray-800');
                btn.className = btn.className.replace('hover:bg-green-600', 'hover:bg-gray-300');
                btn.className = btn.className.replace('bg-red-500 text-white', 'bg-gray-200 text-gray-800');
                btn.className = btn.className.replace('hover:bg-red-600', 'hover:bg-gray-300');
            });
            
        } catch (error) {
            console.error('❌ 이전 선택 해제 실패:', error);
        }
    }
    
    // 정답 표시 (색상 변경)
    showAnswerResult(correctAnswer) {
        try {
            console.log(`✅ 정답 표시: ${correctAnswer}`);
            
            const allButtons = this.buttonsContainer.querySelectorAll('button');
            allButtons.forEach(btn => {
                const btnAnswer = btn.dataset.answer;
                
                if (btnAnswer === correctAnswer) {
                    // 정답 버튼을 초록색으로 표시
                    btn.className = btn.className.replace('bg-yellow-400 text-gray-800', 'bg-green-500 text-white');
                    btn.className = btn.className.replace('bg-gray-200 text-gray-800', 'bg-green-500 text-white');
                    btn.className = btn.className.replace('hover:bg-yellow-500', 'hover:bg-green-600');
                    btn.className = btn.className.replace('hover:bg-gray-300', 'hover:bg-green-600');
                } else if (btnAnswer === this.selectedAnswer && this.selectedAnswer !== correctAnswer) {
                    // 오답 선택한 버튼을 빨간색으로 표시
                    btn.className = btn.className.replace('bg-yellow-400 text-gray-800', 'bg-red-500 text-white');
                    btn.className = btn.className.replace('bg-gray-200 text-gray-800', 'bg-red-500 text-white');
                    btn.className = btn.className.replace('hover:bg-yellow-500', 'hover:bg-red-600');
                    btn.className = btn.className.replace('hover:bg-gray-300', 'hover:bg-red-600');
                }
            });
            
            console.log('✅ 정답 표시 완료');
            
        } catch (error) {
            console.error('❌ 정답 표시 실패:', error);
        }
    }
    
    // 선택지 초기화
    resetButtons() {
        try {
            console.log('🔄 선택지 초기화');
            
            this.selectedAnswer = null;
            this.currentQuestion = null;
            
            if (this.buttonsContainer) {
                this.buttonsContainer.innerHTML = '';
            }
            
            console.log('✅ 선택지 초기화 완료');
            
        } catch (error) {
            console.error('❌ 선택지 초기화 실패:', error);
        }
    }
    
    // 답안 선택 이벤트 발생
    dispatchAnswerSelectedEvent(answer) {
        try {
            const event = new CustomEvent('answerSelected', {
                detail: {
                    answer: answer,
                    questionId: this.currentQuestion?.qcode,
                    questionType: this.currentQuestion?.type,
                    timestamp: new Date().toISOString()
                }
            });
            
            document.dispatchEvent(event);
            console.log('📡 answerSelected 이벤트 발생');
            
        } catch (error) {
            console.error('❌ 답안 선택 이벤트 발생 실패:', error);
        }
    }
    
    // 선택지 생성 이벤트 발생
    dispatchAnswerButtonsCreatedEvent() {
        try {
            const event = new CustomEvent('answerButtonsCreated', {
                detail: {
                    questionId: this.currentQuestion?.qcode,
                    questionType: this.currentQuestion?.type,
                    timestamp: new Date().toISOString()
                }
            });
            
            document.dispatchEvent(event);
            console.log('📡 answerButtonsCreated 이벤트 발생');
            
        } catch (error) {
            console.error('❌ 선택지 생성 이벤트 발생 실패:', error);
        }
    }
    
    // 현재 선택된 답안 반환
    getSelectedAnswer() {
        return this.selectedAnswer;
    }
    
    // 답안이 선택되었는지 확인
    isAnswerSelected() {
        return this.selectedAnswer !== null;
    }
}

// 전역 인스턴스 생성
window.AnswerButtonManager = new AnswerButtonManager();

console.log('✅ AnswerButtonManager 로드 완료');
