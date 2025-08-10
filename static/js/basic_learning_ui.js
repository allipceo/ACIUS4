// static/js/basic_learning_ui.js
// UI 조작 및 문제 표시 모듈

// 문제 표시 함수 (기존 방식)
function displayQuestion() {
    if (!currentQuestionData || currentQuestionData.length === 0) {
        if (basicLearningSystem) {
            basicLearningSystem.updateStatus('문제 데이터가 없습니다.', 'red');
        }
        return;
    }
    
    if (currentQuestionIndex >= currentQuestionData.length) {
        if (basicLearningSystem) {
            basicLearningSystem.updateStatus('모든 문제를 완료했습니다! 🎉', 'green');
        }
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
                if (basicLearningSystem) {
                    basicLearningSystem.selectAnswer(answer);
                }
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
                if (basicLearningSystem) {
                    basicLearningSystem.selectAnswer(i.toString());
                }
            };
            buttonsContainer.appendChild(button);
        }
    }
}

// 정답 확인 함수 (개선된 버전)
async function checkAnswer() {
    if (!selectedAnswer) {
        alert('답안을 선택해주세요.');
        return;
    }
    
    if (isAnswerChecked) {
        nextQuestion();
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
        // JSON/CSV 모드: 기존 방식
        const question = currentQuestionData[currentQuestionIndex];
        correctAnswer = question.ANSWER;
        isCorrect = selectedAnswer === correctAnswer;
    }
    
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
    
    console.log(`정답 확인 (${window.useAPIMode ? 'API' : 'JSON/CSV'} 모드): ${isCorrect ? '정답' : '오답'}`);
}

// 다음 문제 함수 (개선된 버전)
async function nextQuestion() {
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
        // JSON/CSV 모드: 기존 방식
        if (currentQuestionIndex >= currentQuestionData.length - 1) {
            basicLearningSystem.updateStatus('🎉 모든 문제를 완료했습니다!', 'green');
            return;
        }
        
        currentQuestionIndex++;
        displayQuestion();
    }
    
    // 현재 인덱스 저장
    localStorage.setItem('basic_learning_index', currentQuestionIndex.toString());
}

// 전역 함수로 노출
window.displayQuestion = displayQuestion;
window.displayAPIQuestion = displayAPIQuestion;
window.createAnswerButtons = createAnswerButtons;
window.checkAnswer = checkAnswer;
window.nextQuestion = nextQuestion;

console.log('✅ 기본학습 UI 모듈 로드 완료');
