// ===== ACIU S4 기본학습 시스템 - 코어 모듈 =====

// 전역 변수
let currentUser = null;
let currentQuestionIndex = 0;
let currentQuestionData = [];
let selectedAnswer = null;
let isAnswerChecked = false;
let learningMode = null;
let userStatistics = null;

// Flask 서버 연동 확인
let isFlaskMode = window.location.protocol !== 'file:';

// API 기본 설정
const API_BASE = '/api/quiz';
let currentAPISession = null;

// 기본학습 시스템 클래스
class BasicLearningSystem {
    constructor() {
        this.initializeEventListeners();
        this.loadCurrentUser();
    }
    
    initializeEventListeners() {
        // 키보드 이벤트 (O/X 진위형 문제용)
        document.addEventListener('keydown', (event) => {
            if (event.key === 'o' || event.key === 'O') {
                this.selectAnswer('O');
            } else if (event.key === 'x' || event.key === 'X') {
                this.selectAnswer('X');
            } else if (event.key === 'Enter') {
                if (!isAnswerChecked) {
                    checkAnswer('basic');
                } else {
                    nextQuestion('basic');
                }
            }
        });
    }
    
    async loadCurrentUser() {
        try {
            if (isFlaskMode) {
                // Flask 서버에서 현재 사용자 정보 로드
                const response = await fetch('/user/api/users/current');
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        currentUser = result.userData;
                        await this.loadUserStatistics();
                        this.updateStatus(`환영합니다, ${currentUser.userName}님!`);
                        return;
                    }
                }
            }
            
            // 로컬 모드 또는 Flask 실패 시
            const localUser = localStorage.getItem('aciu_current_user');
            if (localUser) {
                currentUser = JSON.parse(localUser);
                await this.loadUserStatistics();
                this.updateStatus(`환영합니다, ${currentUser.userName}님! (로컬 모드)`);
            } else {
                this.updateStatus('사용자 정보를 찾을 수 없습니다. 등록 페이지로 이동합니다.');
                setTimeout(() => {
                    window.location.href = isFlaskMode ? '/user/register' : 'user_registration.html';
                }, 2000);
            }
        } catch (error) {
            console.error('사용자 정보 로드 실패:', error);
            this.updateStatus('사용자 정보 로드 중 오류가 발생했습니다.');
        }
    }
    
    async loadUserStatistics() {
        try {
            if (isFlaskMode && currentUser) {
                // Flask 서버에서 통계 로드
                const response = await fetch(`/user/api/users/${currentUser.userId}/statistics`);
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        userStatistics = result.statistics;
                        this.updateStatisticsDisplay();
                        return;
                    }
                }
            }
            
            // 로컬 모드 또는 Flask 실패 시
            const localStats = localStorage.getItem(`aciu_stats_${currentUser.userId}`);
            if (localStats) {
                userStatistics = JSON.parse(localStats);
            } else {
                // 초기 통계 생성
                userStatistics = this.createInitialStatistics();
                localStorage.setItem(`aciu_stats_${currentUser.userId}`, JSON.stringify(userStatistics));
            }
            
            this.updateStatisticsDisplay();
        } catch (error) {
            console.error('통계 로드 실패:', error);
        }
    }
    
    createInitialStatistics() {
        return {
            userId: currentUser.userId,
            registeredAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            
            // 기본학습 통계
            basicLearning: {
                cumulative: {
                    totalAttempted: 0,
                    totalCorrect: 0,
                    totalWrong: 0,
                    accuracy: 0.0
                },
                today: {
                    date: new Date().toISOString().split('T')[0],
                    todayAttempted: 0,
                    todayCorrect: 0,
                    todayWrong: 0,
                    accuracy: 0.0
                },
                currentIndex: 0,
                mode: 'continue',
                streak: 0
            }
        };
    }
    
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
        basic.cumulative.accuracy = basic.cumulative.totalAttempted > 0 
            ? (basic.cumulative.totalCorrect / basic.cumulative.totalAttempted) * 100 
            : 0;
        
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
        basic.today.accuracy = basic.today.todayAttempted > 0 
            ? (basic.today.todayCorrect / basic.today.todayAttempted) * 100 
            : 0;
        
        // 현재 인덱스 업데이트
        basic.currentIndex = currentQuestionIndex;
        userStatistics.lastUpdated = new Date().toISOString();
        
        // 저장
        await this.saveUserStatistics();
        
        // 화면 업데이트
        this.updateStatisticsDisplay();
    }
    
    async saveUserStatistics() {
        try {
            if (isFlaskMode && currentUser) {
                // Flask 서버에 저장
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
            
            // 로컬 저장 (백업 또는 기본)
            localStorage.setItem(`aciu_stats_${currentUser.userId}`, JSON.stringify(userStatistics));
            console.log('로컬에 통계 저장 완료');
        } catch (error) {
            console.error('통계 저장 실패:', error);
        }
    }
    
    selectAnswer(answer) {
        selectedAnswer = answer;
        
        // 모든 답안 버튼 초기화
        const buttons = document.querySelectorAll('#answer-buttons button');
        buttons.forEach(btn => {
            btn.classList.remove('ring-4', 'ring-blue-300', 'bg-blue-600');
            btn.classList.add('bg-gray-200');
        });
        
        // 선택된 답안 하이라이트
        const selectedButton = document.querySelector(`#answer-buttons button[data-answer="${answer}"]`);
        if (selectedButton) {
            selectedButton.classList.remove('bg-gray-200');
            selectedButton.classList.add('bg-blue-600', 'text-white', 'ring-4', 'ring-blue-300');
        }
        
        console.log(`답안 선택: ${answer}`);
    }
    
    updateStatus(message, color = 'blue') {
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `text-center text-${color}-600 mb-4 font-semibold`;
        }
    }
}

// Week2 API 연결 시도 함수
async function connectToWeek2API() {
    try {
        console.log('🔗 Week2 API 연결 시도...');
        
        const response = await fetch(`${API_BASE}/health`);
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Week2 API 연결 성공:', data);
            return true;
        } else {
            console.log('⚠️ Week2 API 응답 오류:', response.status);
            return false;
        }
    } catch (error) {
        console.log('⚠️ Week2 API 연결 실패, 기존 방식 사용:', error.message);
        return false;
    }
}

// Week2 API로 퀴즈 세션 시작
async function startWeek2QuizSession(mode, category = 'all') {
    try {
        const response = await fetch(`${API_BASE}/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: currentUser?.userId || 'user_' + Date.now(),
                mode: mode,
                category: category
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        currentAPISession = data.session_id;
        console.log('✅ Week2 세션 생성 성공:', currentAPISession);
        return currentAPISession;
        
    } catch (error) {
        console.log('❌ Week2 세션 생성 실패:', error);
        return null;
    }
}

// Week2 API로 문제 조회
async function loadQuestionFromAPI(sessionId, questionIndex) {
    try {
        const response = await fetch(`${API_BASE}/question/${sessionId}/${questionIndex}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Week2 문제 로딩 성공:', data);
        return data;
        
    } catch (error) {
        console.log('❌ Week2 문제 로딩 실패:', error);
        return null;
    }
}

// Week2 API로 답안 제출
async function submitAnswerToAPI(sessionId, questionIndex, answer) {
    try {
        const response = await fetch(`${API_BASE}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                session_id: sessionId,
                question_index: questionIndex,
                answer: answer,
                user_id: currentUser?.userId || 'user_' + Date.now()
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Week2 답안 제출 성공:', result);
        return result;
        
    } catch (error) {
        console.log('❌ Week2 답안 제출 실패:', error);
        return null;
    }
}

// 홈으로 이동 함수
function goHome() {
    if (isFlaskMode) {
        window.location.href = '/home';
    } else {
        alert('홈 화면으로 이동합니다.');
        // 로컬 모드에서는 사용자 등록 화면으로
        window.location.href = 'user_registration.html';
    }
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
        basicLearningSystem.selectAnswer(correctAnswer);
        setTimeout(() => checkAnswer(), 500);
    }
}

function simulateWrongAnswer() {
    if (currentQuestionData.length > 0) {
        const correctAnswer = currentQuestionData[currentQuestionIndex].ANSWER;
        const wrongAnswer = correctAnswer === 'O' ? 'X' : 'O';
        basicLearningSystem.selectAnswer(wrongAnswer);
        setTimeout(() => checkAnswer(), 500);
    }
}

// 전역 함수로 노출
window.debugCurrentState = debugCurrentState;
window.simulateCorrectAnswer = simulateCorrectAnswer;
window.simulateWrongAnswer = simulateWrongAnswer;
window.goHome = goHome;

// 초기화
let basicLearningSystem;

console.log('✅ 코어 모듈 로드 완료');
