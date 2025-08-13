// static/js/basic_learning_stats.js
// 통계 처리 및 사용자 데이터 관리 모듈

// 사용자 통계 로딩 함수
async function loadUserStatistics() {
    try {
        if (isFlaskMode && currentUser) {
            // Flask 서버에서 통계 로드
            const response = await fetch(`/user/api/users/${currentUser.userId}/statistics`);
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    userStatistics = result.statistics;
                    updateStatisticsDisplay();
                    return;
                }
            }
        }
        
        // 로컬 모드 또는 Flask 실패 시
        const localStats = localStorage.getItem(`aciu_stats_${currentUser?.userId || 'default'}`);
        if (localStats) {
            userStatistics = JSON.parse(localStats);
        } else {
            // 초기 통계 생성
            userStatistics = createInitialStatistics();
            localStorage.setItem(`aciu_stats_${currentUser?.userId || 'default'}`, JSON.stringify(userStatistics));
        }
        
        updateStatisticsDisplay();
    } catch (error) {
        console.error('통계 로드 실패:', error);
        // 기본 통계 생성
        userStatistics = createInitialStatistics();
    }
}

// 초기 통계 생성 함수
function createInitialStatistics() {
    return {
        userId: currentUser?.userId || 'default',
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

// 통계 표시 업데이트 함수
function updateStatisticsDisplay() {
    if (!userStatistics) return;
    
    const basic = userStatistics.basicLearning;
    
    // 누적 현황 업데이트
    document.getElementById('cumulative-total').textContent = basic.cumulative.totalAttempted;
    document.getElementById('cumulative-correct').textContent = basic.cumulative.totalCorrect;
    document.getElementById('cumulative-accuracy').textContent = basic.cumulative.accuracy.toFixed(1);
    
    // 금일 현황 업데이트 (날짜 확인)
    const today = new Date().toISOString().split('T')[0];
    if (basic.today.date !== today) {
        // 날짜가 바뀐 경우 금일 통계 초기화
        basic.today = {
            date: today,
            todayAttempted: 0,
            todayCorrect: 0,
            todayWrong: 0,
            accuracy: 0.0
        };
    }
    
    document.getElementById('today-total').textContent = basic.today.todayAttempted;
    document.getElementById('today-correct').textContent = basic.today.todayCorrect;
    document.getElementById('today-accuracy').textContent = basic.today.accuracy.toFixed(1);
    
    // 상세 통계 업데이트
    document.getElementById('total-questions').textContent = currentQuestionData.length;
    document.getElementById('correct-answers').textContent = basic.cumulative.totalCorrect;
    document.getElementById('wrong-answers').textContent = basic.cumulative.totalWrong;
    document.getElementById('current-streak').textContent = basic.streak || 0;
}

// 통계 초기화 함수
function resetStatistics() {
    if (currentUser) {
        userStatistics = createInitialStatistics();
        localStorage.setItem(`aciu_stats_${currentUser.userId}`, JSON.stringify(userStatistics));
        updateStatisticsDisplay();
        console.log('통계 초기화 완료');
    }
}

// 진도율 계산 함수
function calculateProgress() {
    if (!currentQuestionData || currentQuestionData.length === 0) return 0;
    return (currentQuestionIndex / currentQuestionData.length) * 100;
}

// 정답률 계산 함수
function calculateAccuracy(correct, total) {
    return total > 0 ? (correct / total) * 100 : 0;
}

// 현재 사용자 로딩 함수
async function loadCurrentUser() {
    try {
        if (isFlaskMode) {
            // Flask 서버에서 현재 사용자 정보 로드
            const response = await fetch('/user/api/users/current');
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    currentUser = result.userData;
                    await loadUserStatistics();
                    basicLearningSystem.updateStatus(`환영합니다, ${currentUser.userName}님!`);
                    return;
                }
            }
        }
        
        // 로컬 모드 또는 Flask 실패 시
        const localUser = localStorage.getItem('aciu_current_user');
        if (localUser) {
            currentUser = JSON.parse(localUser);
            await loadUserStatistics();
            basicLearningSystem.updateStatus(`환영합니다, ${currentUser.userName}님! (로컬 모드)`);
        } else {
            // 기본 사용자 생성
            currentUser = {
                userId: 'default_user',
                userName: '기본 사용자',
                email: 'default@example.com'
            };
            await loadUserStatistics();
            basicLearningSystem.updateStatus('기본 사용자로 로그인되었습니다.');
        }
    } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
        // 기본 사용자로 설정
        currentUser = {
            userId: 'default_user',
            userName: '기본 사용자',
            email: 'default@example.com'
        };
        await loadUserStatistics();
        basicLearningSystem.updateStatus('기본 사용자로 로그인되었습니다.');
    }
}

// ===== ACIU S4 기본학습 시스템 - 통계 모듈 =====

// 정답 확인 함수
async function checkAnswer() {
    if (!selectedAnswer) {
        alert('답안을 선택해주세요.');
        return;
    }
    
    if (isAnswerChecked) {
        // 이미 확인됨 - 다음 문제로
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
        
        // 정답 버튼 하이라이트
        const correctButton = document.querySelector(`#answer-buttons button[data-answer="${correctAnswer}"]`);
        if (correctButton) {
            correctButton.classList.add('bg-green-500', 'text-white', 'ring-4', 'ring-green-300');
        }
    }
    
    // 통계 업데이트
    await basicLearningSystem.updateLearningStatistics(isCorrect);
    
    // 상태 변경
    isAnswerChecked = true;
    document.getElementById('check-button').textContent = '다음 문제';
    
    console.log(`정답 확인: ${isCorrect ? '정답' : '오답'}, 선택: ${selectedAnswer}, 정답: ${correctAnswer}`);
}

// 다음 문제 함수
function nextQuestion() {
    if (currentQuestionIndex >= currentQuestionData.length - 1) {
        // 마지막 문제
        basicLearningSystem.updateStatus('🎉 모든 문제를 완료했습니다! 수고하셨습니다!', 'green');
        
        // 완료 통계 표시
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

// 이전 문제 함수
function prevQuestion() {
    if (currentQuestionIndex <= 0) {
        alert('첫 번째 문제입니다.');
        return;
    }
    
    currentQuestionIndex--;
    displayQuestion();
}

// 개선된 정답 확인 함수 (API/CSV 모드 모두 지원)
async function checkAnswerImproved() {
    if (!selectedAnswer) {
        alert('답안을 선택해주세요.');
        return;
    }
    
    if (isAnswerChecked) {
        nextQuestionImproved();
        return;
    }
    
    let isCorrect = false;
    let correctAnswer = '';
    
    if (window.useAPIMode && currentAPISession) {
        // API 모드: 서버로 답안 제출
        const result = await submitAnswerToAPI(currentAPISession, currentQuestionIndex, selectedAnswer);
        
        if (result) {
            isCorrect = result.correct;
            correctAnswer = result.correct_answer;
            
            // 다음 문제 미리 로드
            const nextQuestion = await loadQuestionFromAPI(currentAPISession, currentQuestionIndex + 1);
            if (nextQuestion) {
                window.nextAPIQuestion = nextQuestion;
            }
        } else {
            basicLearningSystem.updateStatus('답안 제출에 실패했습니다.', 'red');
            return;
        }
    } else {
        // CSV 모드: 기존 방식
        const question = currentQuestionData[currentQuestionIndex];
        correctAnswer = question.ANSWER;
        isCorrect = selectedAnswer === correctAnswer;
    }
    
    // 결과 표시 (기존 로직 유지)
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
    
    console.log(`정답 확인 (${window.useAPIMode ? 'API' : 'CSV'} 모드): ${isCorrect ? '정답' : '오답'}`);
}

// 개선된 다음 문제 함수
async function nextQuestionImproved() {
    if (window.useAPIMode && window.nextAPIQuestion) {
        // API 모드: 미리 로드된 문제 사용
        currentQuestionIndex++;
        displayAPIQuestion(window.nextAPIQuestion);
        window.nextAPIQuestion = null;
    } else if (window.useAPIMode && currentAPISession) {
        // API 모드: 실시간 로드
        currentQuestionIndex++;
        const nextQuestion = await loadQuestionFromAPI(currentAPISession, currentQuestionIndex);
        
        if (nextQuestion) {
            displayAPIQuestion(nextQuestion);
        } else {
            basicLearningSystem.updateStatus('🎉 모든 문제를 완료했습니다!', 'green');
        }
    } else {
        // CSV 모드: 기존 방식
        if (currentQuestionIndex >= currentQuestionData.length - 1) {
            basicLearningSystem.updateStatus('🎉 모든 문제를 완료했습니다!', 'green');
            return;
        }
        
        currentQuestionIndex++;
        displayQuestion();
    }
}

// 전역 함수로 노출
window.loadUserStatistics = loadUserStatistics;
window.updateStatisticsDisplay = updateStatisticsDisplay;
window.resetStatistics = resetStatistics;
window.loadCurrentUser = loadCurrentUser;
window.checkAnswer = checkAnswerImproved;
window.nextQuestion = nextQuestionImproved;
window.prevQuestion = prevQuestion;

console.log('✅ 기본학습 통계 모듈 로드 완료');
