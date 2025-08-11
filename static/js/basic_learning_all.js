// ===== ACIU S4 기본학습 시스템 =====

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
    
    selectAnswer(answer) {
        selectedAnswer = answer;
        isAnswerChecked = false;
        
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
        
        // 정답확인 버튼 활성화
        const checkButton = document.getElementById('check-button');
        if (checkButton) {
            checkButton.textContent = '정답 확인';
            checkButton.disabled = false;
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
    
    calculateAccuracy(correct, total) {
        return total > 0 ? (correct / total) * 100 : 0;
    }
}

// 전역 인스턴스
let basicLearningSystem = null;

// 기본학습 데이터 로딩 함수
async function loadBasicLearningData(mode = 'basic') {
    console.log('🔄 기본학습 데이터 로딩 시작...');
    
    try {
        // JSON 파일 로딩
        console.log('📁 JSON 파일 로딩 시도...');
        const response = await fetch('/static/questions.json');
        
        if (response.ok) {
            const jsonData = await response.json();
            console.log('JSON 데이터 로드 완료:', jsonData.questions.length, '개 문제');
            
            // 문제 필터링 (기본학습용)
            const filteredQuestions = jsonData.questions.filter(q => 
                q.type === 'basic' || q.category === 'basic' || !q.type
            );
            console.log('필터링 후 문제 수:', filteredQuestions.length, '개');
            
            if (filteredQuestions.length > 0) {
                currentQuestionData = filteredQuestions;
                
                // 모드에 따른 인덱스 설정
                if (mode === 'continue') {
                    // 이어풀기: 저장된 인덱스 사용
                    const savedIndex = localStorage.getItem('basic_learning_index');
                    currentQuestionIndex = savedIndex ? parseInt(savedIndex) : 0;
                } else if (mode === 'restart') {
                    // 처음풀기: 0부터 시작
                    currentQuestionIndex = 0;
                } else if (mode === 'random') {
                    // 랜덤풀기: 무작위 인덱스
                    currentQuestionIndex = Math.floor(Math.random() * filteredQuestions.length);
                } else {
                    currentQuestionIndex = 0;
                }
                
                displayQuestion();
                basicLearningSystem.updateStatisticsDisplay();
                basicLearningSystem.updateStatus('JSON 모드로 학습을 시작합니다.', 'blue');
                return;
            }
        }
    } catch (error) {
        console.error('JSON 로딩 실패:', error);
    }
    
    // CSV 파일 로딩 (폴백)
    try {
        console.log('📄 CSV 파일 로딩 시도...');
        const response = await fetch('/data/ins_master_db.csv');
        
        if (response.ok) {
            const csvText = await response.text();
            const results = Papa.parse(csvText, { header: true });
            
            if (results.data && results.data.length > 0) {
                currentQuestionData = results.data.filter(row => 
                    row.QUESTION && row.ANSWER
                );
                console.log('CSV 데이터 로드 완료:', currentQuestionData.length, '개 문제');
                
                currentQuestionIndex = 0;
                displayQuestion();
                basicLearningSystem.updateStatisticsDisplay();
                basicLearningSystem.updateStatus('CSV 모드로 학습을 시작합니다.', 'blue');
                return;
            }
        }
    } catch (error) {
        console.error('CSV 로딩 실패:', error);
    }
    
    // 모든 로딩 실패
    basicLearningSystem.updateStatus('데이터 로드 실패. 네트워크를 확인해주세요.', 'red');
    throw new Error('모든 데이터 소스 로딩 실패');
}

// 모드 선택 함수
async function selectBasicLearningMode(mode) {
    console.log(`=== 기본학습 모드 선택: ${mode} ===`);
    
    learningMode = mode;
    
    // 모드 선택 영역 숨기기
    document.getElementById('mode-selection').classList.add('hidden');
    
    // 문제 표시 영역 표시
    document.getElementById('basic-question-area').classList.remove('hidden');
    
    // 상태 업데이트
    const modeNames = {
        'continue': '이어풀기',
        'restart': '처음풀기',
        'random': '랜덤풀기'
    };
    
    basicLearningSystem.updateStatus(`기본학습 - ${modeNames[mode]} 모드로 시작합니다.`);
    
    // 데이터 로드
    await loadBasicLearningData(mode);
}

// 문제 표시 함수
function displayQuestion() {
    if (!currentQuestionData || currentQuestionData.length === 0) {
        basicLearningSystem.updateStatus('문제 데이터가 없습니다.', 'red');
        return;
    }
    
    if (currentQuestionIndex >= currentQuestionData.length) {
        basicLearningSystem.updateStatus('모든 문제를 완료했습니다! 🎉', 'green');
        return;
    }
    
    const question = currentQuestionData[currentQuestionIndex];
    
    // 문제 정보 표시
    document.getElementById('question-code').textContent = question.QCODE || question.qcode || 'Q???';
    document.getElementById('question-type').textContent = question.TYPE || question.type || '진위형';
    document.getElementById('layer-info').textContent = `${question.LAYER1 || question.layer1 || ''} > ${question.LAYER2 || question.layer2 || ''}`;
    document.getElementById('question-text').textContent = question.QUESTION || question.question || '문제를 불러올 수 없습니다.';
    document.getElementById('progress-info').textContent = `${currentQuestionIndex + 1} / ${currentQuestionData.length}`;
    
    // 답안 버튼 생성
    createAnswerButtons(question);
    
    // 상태 초기화
    selectedAnswer = null;
    isAnswerChecked = false;
    document.getElementById('result-area').classList.add('hidden');
    document.getElementById('check-button').textContent = '정답 확인';
    
    console.log(`문제 표시: ${question.QCODE || question.qcode}, 진도: ${currentQuestionIndex + 1}/${currentQuestionData.length}`);
}

// 답안 버튼 생성 함수
function createAnswerButtons(question) {
    const buttonsContainer = document.getElementById('answer-buttons');
    buttonsContainer.innerHTML = '';
    
    if (question.TYPE === '진위형') {
        // O/X 버튼
        ['O', 'X'].forEach(answer => {
            const button = document.createElement('button');
            button.className = 'bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg mr-4 transition-all';
            button.textContent = answer === 'O' ? '⭕ 맞다 (O)' : '❌ 틀리다 (X)';
            button.setAttribute('data-answer', answer);
            button.onclick = () => {
                basicLearningSystem.selectAnswer(answer);
            };
            buttonsContainer.appendChild(button);
        });
    } else {
        // 선택형 버튼 (1, 2, 3, 4)
        for (let i = 1; i <= 4; i++) {
            const button = document.createElement('button');
            button.className = 'bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg mr-2 mb-2 transition-all';
            button.textContent = `${i}번`;
            button.setAttribute('data-answer', i.toString());
            button.onclick = () => {
                basicLearningSystem.selectAnswer(i.toString());
            };
            buttonsContainer.appendChild(button);
        }
    }
}

// 정답 확인 함수
async function checkAnswer() {
    if (!selectedAnswer) {
        alert('답안을 선택해주세요.');
        return;
    }
    
    if (isAnswerChecked) {
        nextQuestion();
        return;
    }
    
    const question = currentQuestionData[currentQuestionIndex];
    const correctAnswer = question.ANSWER;
    const isCorrect = selectedAnswer === correctAnswer;
    
    // 결과 표시
    const resultArea = document.getElementById('result-area');
    const resultMessage = document.getElementById('result-message');
    
    resultArea.classList.remove('hidden');
    
    if (isCorrect) {
        resultMessage.className = 'p-3 rounded font-medium bg-green-100 text-green-800';
        resultMessage.textContent = '🎉 정답입니다!';
    } else {
        resultMessage.className = 'p-3 rounded font-medium bg-red-100 text-red-800';
        resultMessage.textContent = `❌ 틀렸습니다. 정답은 "${correctAnswer}"입니다.`;
        
        const correctButton = document.querySelector(`#answer-buttons button[data-answer="${correctAnswer}"]`);
        if (correctButton) {
            correctButton.classList.add('bg-green-500', 'text-white', 'ring-4', 'ring-green-300');
        }
    }
    
    await basicLearningSystem.updateLearningStatistics(isCorrect);
    
    isAnswerChecked = true;
    document.getElementById('check-button').textContent = '다음 문제';
    
    console.log(`정답 확인: ${isCorrect ? '정답' : '오답'}`);
}

// 다음 문제 함수
function nextQuestion() {
    if (currentQuestionIndex >= currentQuestionData.length - 1) {
        basicLearningSystem.updateStatus('🎉 모든 문제를 완료했습니다!', 'green');
        return;
    }
    
    currentQuestionIndex++;
    displayQuestion();
    
    // 현재 인덱스 저장
    localStorage.setItem('basic_learning_index', currentQuestionIndex.toString());
}

// 이전 문제 함수
function prevQuestion() {
    if (currentQuestionIndex <= 0) {
        alert('첫 번째 문제입니다.');
        return;
    }
    
    currentQuestionIndex--;
    displayQuestion();
}

// 홈으로 이동 함수
function goHome() {
    if (isFlaskMode) {
        window.location.href = '/home';
    } else {
        alert('홈 화면으로 이동합니다.');
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
window.selectBasicLearningMode = selectBasicLearningMode;
window.loadBasicLearningData = loadBasicLearningData;
window.displayQuestion = displayQuestion;
window.createAnswerButtons = createAnswerButtons;
window.checkAnswer = checkAnswer;
window.nextQuestion = nextQuestion;
window.prevQuestion = prevQuestion;
window.goHome = goHome;
window.debugCurrentState = debugCurrentState;
window.simulateCorrectAnswer = simulateCorrectAnswer;
window.simulateWrongAnswer = simulateWrongAnswer;

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('ACIU S4 기본학습 시스템 초기화 시작');
    console.log('Flask 모드:', isFlaskMode);
    
    basicLearningSystem = new BasicLearningSystem();
    
    // 🚀 자동으로 기본학습 데이터 로드 시작
    console.log('🔄 자동 문제 로딩 시작...');
    loadBasicLearningData('basic').then(() => {
        console.log('✅ 자동 문제 로딩 완료');
    }).catch(error => {
        console.error('❌ 자동 문제 로딩 실패:', error);
    });
    
    console.log('기본학습 시스템 로드 완료');
    console.log('사용법:');
    console.log('- debugCurrentState() : 현재 상태 확인');
    console.log('- simulateCorrectAnswer() : 정답 자동 선택');
    console.log('- simulateWrongAnswer() : 오답 자동 선택');
    console.log('- 키보드: O/X 키로 답안 선택, Enter로 확인/다음');
});
