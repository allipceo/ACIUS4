// static/js/basic_learning_core.js
// 핵심 로직 및 전역 변수 관리

// 전역 변수
let currentUser = null;
let currentQuestionData = [];
let currentQuestionIndex = 0;
let selectedAnswer = null;
let isAnswerChecked = false;
let learningMode = 'continue';
let userStatistics = null;
let isFlaskMode = true;
let basicLearningSystem = null;

// API 관련 변수
let currentAPISession = null;
let window = window || {};

// 기본학습 시스템 클래스
class BasicLearningSystem {
    constructor() {
        this.currentMode = 'basic';
        this.setupEventListeners();
    }
    
    // 이벤트 리스너 설정
    setupEventListeners() {
        // 키보드 이벤트
        document.addEventListener('keydown', (e) => {
            if (e.key === 'O' || e.key === 'o') {
                this.selectAnswer('O');
            } else if (e.key === 'X' || e.key === 'x') {
                this.selectAnswer('X');
            } else if (e.key === 'Enter') {
                if (isAnswerChecked) {
                    nextQuestion();
                } else {
                    checkAnswer();
                }
            }
        });
    }
    
    // 답안 선택
    selectAnswer(answer) {
        selectedAnswer = answer;
        isAnswerChecked = false;
        
        // 버튼 스타일 변경
        document.querySelectorAll('#answer-buttons button').forEach(btn => {
            btn.classList.remove('bg-blue-600', 'text-white');
            btn.classList.add('bg-gray-200', 'text-gray-800');
        });
        
        const selectedButton = document.querySelector(`#answer-buttons button[data-answer="${answer}"]`);
        if (selectedButton) {
            selectedButton.classList.remove('bg-gray-200', 'text-gray-800');
            selectedButton.classList.add('bg-blue-600', 'text-white');
        }
        
        // 정답확인 버튼 활성화
        const checkButton = document.getElementById('check-button');
        if (checkButton) {
            checkButton.textContent = '정답 확인';
            checkButton.disabled = false;
        }
        
        console.log('답안 선택:', answer);
    }
    
    // 상태 업데이트
    updateStatus(message, color = 'blue') {
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `text-center text-${color}-600 mb-4 font-semibold`;
        }
    }
    
    // 통계 표시 업데이트
    updateStatisticsDisplay() {
        if (!userStatistics) return;
        
        const basic = userStatistics.basicLearning;
        
        // 누적 현황 업데이트
        document.getElementById('cumulative-total').textContent = basic.cumulative.totalAttempted;
        document.getElementById('cumulative-correct').textContent = basic.cumulative.totalCorrect;
        document.getElementById('cumulative-accuracy').textContent = basic.cumulative.accuracy.toFixed(1);
        
        // 금일 현황 업데이트
        document.getElementById('today-total').textContent = basic.today.todayAttempted;
        document.getElementById('today-correct').textContent = basic.today.todayCorrect;
        document.getElementById('today-accuracy').textContent = basic.today.accuracy.toFixed(1);
        
        // 상세 통계 업데이트
        document.getElementById('total-questions').textContent = currentQuestionData.length;
        document.getElementById('correct-answers').textContent = basic.cumulative.totalCorrect;
        document.getElementById('wrong-answers').textContent = basic.cumulative.totalWrong;
        document.getElementById('current-streak').textContent = basic.streak || 0;
    }
    
    // 학습 통계 업데이트
    async updateLearningStatistics(isCorrect) {
        if (!userStatistics) return;
        
        const basic = userStatistics.basicLearning;
        const today = new Date().toISOString().split('T')[0];
        
        // 누적 통계 업데이트
        basic.cumulative.totalAttempted++;
        if (isCorrect) {
            basic.cumulative.totalCorrect++;
            basic.streak = (basic.streak || 0) + 1;
        } else {
            basic.cumulative.totalWrong++;
            basic.streak = 0;
        }
        basic.cumulative.accuracy = this.calculateAccuracy(
            basic.cumulative.totalCorrect, 
            basic.cumulative.totalAttempted
        );
        
        // 금일 통계 업데이트
        if (basic.today.date !== today) {
            basic.today = {
                date: today,
                todayAttempted: 0,
                todayCorrect: 0,
                todayWrong: 0,
                accuracy: 0.0
            };
        }
        
        basic.today.todayAttempted++;
        if (isCorrect) {
            basic.today.todayCorrect++;
        } else {
            basic.today.todayWrong++;
        }
        basic.today.accuracy = this.calculateAccuracy(
            basic.today.todayCorrect, 
            basic.today.todayAttempted
        );
        
        // 현재 인덱스 업데이트
        basic.currentIndex = currentQuestionIndex;
        userStatistics.lastUpdated = new Date().toISOString();
        
        // 저장
        await this.saveStatistics();
        
        // 화면 업데이트
        this.updateStatisticsDisplay();
    }
    
    // 통계 저장
    async saveStatistics() {
        try {
            if (isFlaskMode && currentUser) {
                const response = await fetch(`/user/api/users/${currentUser.userId}/statistics`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ statistics: userStatistics })
                });
                
                if (response.ok) {
                    console.log('서버에 통계 저장 완료');
                    return;
                }
            }
            
            // 로컬 저장
            localStorage.setItem(`aciu_stats_${currentUser.userId}`, JSON.stringify(userStatistics));
            console.log('로컬에 통계 저장 완료');
        } catch (error) {
            console.error('통계 저장 실패:', error);
        }
    }
    
    // 정답률 계산
    calculateAccuracy(correct, total) {
        return total > 0 ? (correct / total) * 100 : 0;
    }
}

// 전역 함수들
function goHome() {
    if (isFlaskMode) {
        window.location.href = '/home';
    } else {
        alert('홈 화면으로 이동합니다.');
        window.location.href = 'user_registration.html';
    }
}

function prevQuestion() {
    if (currentQuestionIndex <= 0) {
        alert('첫 번째 문제입니다.');
        return;
    }
    
    currentQuestionIndex--;
    displayQuestion();
}

function nextQuestion() {
    if (currentQuestionIndex >= currentQuestionData.length - 1) {
        if (basicLearningSystem) {
            basicLearningSystem.updateStatus('🎉 모든 문제를 완료했습니다! 수고하셨습니다!', 'green');
        }
        
        if (userStatistics && userStatistics.basicLearning) {
            const basic = userStatistics.basicLearning;
            setTimeout(() => {
                alert(`학습 완료!\n\n누적 통계:\n- 총 문제: ${basic.cumulative.totalAttempted}개\n- 정답: ${basic.cumulative.totalCorrect}개\n- 정답률: ${basic.cumulative.accuracy.toFixed(1)}%\n\n금일 통계:\n- 금일 문제: ${basic.today.todayAttempted}개\n- 정답: ${basic.today.todayCorrect}개\n- 정답률: ${basic.today.accuracy.toFixed(1)}%`);
            }, 1000);
        }
        return;
    }
    
    currentQuestionIndex++;
    displayQuestion();
}

// 디버깅 함수들
function debugCurrentState() {
    console.log('=== 현재 상태 ===');
    console.log('현재 사용자:', currentUser);
    console.log('현재 문제 인덱스:', currentQuestionIndex);
    console.log('전체 문제 수:', currentQuestionData.length);
    console.log('학습 모드:', learningMode);
    console.log('선택된 답안:', selectedAnswer);
    console.log('답안 확인 여부:', isAnswerChecked);
    console.log('사용자 통계:', userStatistics);
    console.log('Flask 모드:', isFlaskMode);
}

function simulateCorrectAnswer() {
    if (currentQuestionData.length > 0) {
        const correctAnswer = currentQuestionData[currentQuestionIndex].ANSWER;
        if (basicLearningSystem) {
            basicLearningSystem.selectAnswer(correctAnswer);
        }
        setTimeout(() => checkAnswer(), 500);
    }
}

function simulateWrongAnswer() {
    if (currentQuestionData.length > 0) {
        const correctAnswer = currentQuestionData[currentQuestionIndex].ANSWER;
        const wrongAnswer = correctAnswer === 'O' ? 'X' : 'O';
        if (basicLearningSystem) {
            basicLearningSystem.selectAnswer(wrongAnswer);
        }
        setTimeout(() => checkAnswer(), 500);
    }
}

// 전역 함수로 노출
window.goHome = goHome;
window.prevQuestion = prevQuestion;
window.nextQuestion = nextQuestion;
window.debugCurrentState = debugCurrentState;
window.simulateCorrectAnswer = simulateCorrectAnswer;
window.simulateWrongAnswer = simulateWrongAnswer;

console.log('✅ 기본학습 코어 모듈 로드 완료');
