// ===== ACIU S4 기본학습 시스템 - UI 모듈 =====

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
    document.getElementById('question-code').textContent = question.QCODE || 'Q???';
    document.getElementById('question-type').textContent = question.TYPE || '진위형';
    document.getElementById('layer-info').textContent = `${question.LAYER1 || ''} > ${question.LAYER2 || ''}`;
    document.getElementById('question-text').textContent = question.QUESTION || '문제를 불러올 수 없습니다.';
    document.getElementById('progress-info').textContent = `${currentQuestionIndex + 1} / ${currentQuestionData.length}`;
    
    // 답안 버튼 생성
    createAnswerButtons(question);
    
    // 상태 초기화
    selectedAnswer = null;
    isAnswerChecked = false;
    document.getElementById('result-area').classList.add('hidden');
    document.getElementById('check-button').textContent = '정답 확인';
    
    console.log(`문제 표시: ${question.QCODE}, 진도: ${currentQuestionIndex + 1}/${currentQuestionData.length}`);
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
            button.onclick = () => basicLearningSystem.selectAnswer(answer);
            buttonsContainer.appendChild(button);
        });
    } else {
        // 선택형 버튼 (1, 2, 3, 4)
        for (let i = 1; i <= 4; i++) {
            const button = document.createElement('button');
            button.className = 'bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg mr-2 mb-2 transition-all';
            button.textContent = `${i}번`;
            button.setAttribute('data-answer', i.toString());
            button.onclick = () => basicLearningSystem.selectAnswer(i.toString());
            buttonsContainer.appendChild(button);
        }
    }
}

// API 모드용 문제 표시 함수
function displayAPIQuestion(questionData) {
    console.log('📋 API 문제 표시:', questionData);
    
    // 기존 DOM 업데이트 (API 데이터 형식에 맞게)
    document.getElementById('question-code').textContent = questionData.q_code || 'Q???';
    document.getElementById('question-type').textContent = questionData.question_type || '진위형';
    document.getElementById('layer-info').textContent = `${questionData.category || ''} > ${questionData.subcategory || ''}`;
    document.getElementById('question-text').textContent = questionData.question || '문제를 불러올 수 없습니다.';
    document.getElementById('progress-info').textContent = `${questionData.current_index + 1} / ${questionData.total_questions}`;
    
    // 답안 버튼 생성 (기존 방식과 동일)
    createAnswerButtons({
        TYPE: questionData.question_type,
        ANSWER: questionData.correct_answer
    });
    
    // 상태 초기화
    selectedAnswer = null;
    isAnswerChecked = false;
    document.getElementById('result-area').classList.add('hidden');
    document.getElementById('check-button').textContent = '정답 확인';
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

// BasicLearningSystem 클래스에 통계 표시 함수 추가
if (typeof BasicLearningSystem !== 'undefined') {
    BasicLearningSystem.prototype.updateStatisticsDisplay = updateStatisticsDisplay;
}

console.log('✅ UI 모듈 로드 완료');
