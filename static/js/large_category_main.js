// ===== ACIU S4 대분류 학습 시스템 - 메인 모듈 =====

// 대분류 학습 모드 선택 함수
async function selectLargeCategoryMode(categoryName) {
    console.log(`=== 대분류 학습 모드 선택: ${categoryName} ===`);
    
    learningMode = 'large_category';
    selectedCategory = categoryName;
    
    // 상태 업데이트
    const categoryNames = {
        '재산보험': '재산보험',
        '특종보험': '특종보험',
        '배상책임보험': '배상책임보험',
        '해상보험': '해상보험'
    };
    
    largeCategorySystem.updateStatus(`대분류 학습 - ${categoryNames[categoryName]} 카테고리로 시작합니다.`);
    
    // 데이터 로드
    await loadLargeCategoryData(categoryName);
}

// 대분류 데이터 로드 함수
async function loadLargeCategoryData(categoryName) {
    try {
        console.log(`=== 대분류 데이터 로드: ${categoryName} ===`);
        
        // 데이터 필터링 모듈 사용
        const convertedData = await filterQuestionsByCategory(categoryName);
        
        // 대분류 학습용 데이터 설정
        currentQuestionData = [...convertedData];
        currentQuestionIndex = 0;
        
        // 첫 번째 문제 표시
        if (currentQuestionData.length > 0) {
            displayLargeCategoryQuestion();
            largeCategorySystem.updateStatus(`${categoryName} 카테고리 ${currentQuestionData.length}개 문제 로드 완료.`, 'green');
        } else {
            largeCategorySystem.updateStatus(`${categoryName} 카테고리에 문제가 없습니다.`, 'red');
        }
        
    } catch (error) {
        console.error('대분류 데이터 로드 실패:', error);
        largeCategorySystem.updateStatus('데이터 로드에 실패했습니다.', 'red');
    }
}

// 대분류 문제 표시 함수
function displayLargeCategoryQuestion() {
    if (!currentQuestionData || currentQuestionData.length === 0) {
        largeCategorySystem.updateStatus('문제 데이터가 없습니다.', 'red');
        return;
    }
    
    if (currentQuestionIndex >= currentQuestionData.length) {
        largeCategorySystem.updateStatus('모든 문제를 완료했습니다! 🎉', 'green');
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
    createLargeCategoryAnswerButtons(question);
    
    // 상태 초기화
    selectedAnswer = null;
    isAnswerChecked = false;
    document.getElementById('result-area').classList.add('hidden');
    document.getElementById('check-button').textContent = '정답 확인';
    
    console.log(`대분류 문제 표시: ${question.QCODE}, 진도: ${currentQuestionIndex + 1}/${currentQuestionData.length}`);
}

// 대분류 답안 버튼 생성 함수
function createLargeCategoryAnswerButtons(question) {
    const buttonsContainer = document.getElementById('answer-buttons');
    buttonsContainer.innerHTML = '';
    
    if (question.TYPE === '진위형') {
        // O/X 버튼
        ['O', 'X'].forEach(answer => {
            const button = document.createElement('button');
            button.className = 'bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg mr-4 transition-all';
            button.textContent = answer === 'O' ? '⭕ 맞다 (O)' : '❌ 틀리다 (X)';
            button.setAttribute('data-answer', answer);
            button.onclick = () => largeCategorySystem.selectAnswer(answer);
            buttonsContainer.appendChild(button);
        });
    } else {
        // 선택형 버튼 (1, 2, 3, 4)
        for (let i = 1; i <= 4; i++) {
            const button = document.createElement('button');
            button.className = 'bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg mr-2 mb-2 transition-all';
            button.textContent = `${i}번`;
            button.setAttribute('data-answer', i.toString());
            button.onclick = () => largeCategorySystem.selectAnswer(i.toString());
            buttonsContainer.appendChild(button);
        }
    }
}

// 대분류 학습 시스템 초기화
function initializeLargeCategorySystem() {
    console.log('=== 대분류 학습 시스템 초기화 ===');
    
    // 전역 변수 초기화
    currentQuestionData = [];
    currentQuestionIndex = 0;
    selectedAnswer = null;
    isAnswerChecked = false;
    selectedCategory = null;
    
    // 사용자 통계 로드
    loadUserStatistics();
    
    // 데이터 필터링 모듈 초기화
    initializeDataFilteringModule();
    
    // 키보드 이벤트 리스너
    document.addEventListener('keydown', handleLargeCategoryKeyPress);
    
    console.log('대분류 학습 시스템 초기화 완료');
}

// 대분류 키보드 이벤트 처리
function handleLargeCategoryKeyPress(event) {
    if (document.getElementById('large-category-question-area').classList.contains('hidden')) {
        return;
    }
    
    switch(event.key) {
        case 'o':
        case 'O':
            largeCategorySystem.selectAnswer('O');
            break;
        case 'x':
        case 'X':
            largeCategorySystem.selectAnswer('X');
            break;
        case '1':
        case '2':
        case '3':
        case '4':
            largeCategorySystem.selectAnswer(event.key);
            break;
        case 'Enter':
            if (!isAnswerChecked) {
                largeCategorySystem.checkAnswer();
            } else {
                largeCategorySystem.nextQuestion();
            }
            break;
        case 'ArrowLeft':
            largeCategorySystem.prevQuestion();
            break;
        case 'ArrowRight':
            largeCategorySystem.nextQuestion();
            break;
    }
}

// 대분류 학습 시스템 객체
const largeCategorySystem = {
    selectAnswer: function(answer) {
        if (isAnswerChecked) return;
        
        selectedAnswer = answer;
        
        // 기존 선택 해제
        document.querySelectorAll('#answer-buttons button').forEach(btn => {
            btn.classList.remove('bg-blue-500', 'text-white');
            btn.classList.add('bg-gray-200', 'text-gray-800');
        });
        
        // 선택된 답안 하이라이트
        const selectedButton = document.querySelector(`[data-answer="${answer}"]`);
        if (selectedButton) {
            selectedButton.classList.remove('bg-gray-200', 'text-gray-800');
            selectedButton.classList.add('bg-blue-500', 'text-white');
        }
        
        document.getElementById('check-button').disabled = false;
        console.log(`답안 선택: ${answer}`);
    },
    
    checkAnswer: function() {
        if (!selectedAnswer || isAnswerChecked) return;
        
        const question = currentQuestionData[currentQuestionIndex];
        const isCorrect = selectedAnswer === question.ANSWER;
        
        // 결과 표시
        const resultArea = document.getElementById('result-area');
        const resultMessage = document.getElementById('result-message');
        
        if (isCorrect) {
            resultMessage.className = 'p-3 rounded font-medium bg-green-100 text-green-800 border border-green-300';
            resultMessage.textContent = '✅ 정답입니다!';
        } else {
            resultMessage.className = 'p-3 rounded font-medium bg-red-100 text-red-800 border border-red-300';
            resultMessage.textContent = `❌ 오답입니다. 정답은 "${question.ANSWER}"입니다.`;
        }
        
        resultArea.classList.remove('hidden');
        isAnswerChecked = true;
        document.getElementById('check-button').textContent = '다음 문제';
        
        // 통계 업데이트
        updateLargeCategoryStatistics(isCorrect);
        
        console.log(`답안 확인: ${selectedAnswer}, 정답: ${question.ANSWER}, 결과: ${isCorrect ? '정답' : '오답'}`);
    },
    
    nextQuestion: function() {
        if (!isAnswerChecked) return;
        
        currentQuestionIndex++;
        if (currentQuestionIndex >= currentQuestionData.length) {
            largeCategorySystem.updateStatus('모든 문제를 완료했습니다! 🎉', 'green');
            return;
        }
        
        displayLargeCategoryQuestion();
        console.log(`다음 문제로 이동: ${currentQuestionIndex + 1}/${currentQuestionData.length}`);
    },
    
    prevQuestion: function() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayLargeCategoryQuestion();
            console.log(`이전 문제로 이동: ${currentQuestionIndex + 1}/${currentQuestionData.length}`);
        }
    },
    
    updateStatus: function(message, color = 'blue') {
        const statusElement = document.getElementById('status');
        statusElement.textContent = message;
        statusElement.className = `text-center text-${color}-600 mb-4 font-semibold`;
        console.log(`상태 업데이트: ${message}`);
    }
};

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeLargeCategorySystem();
});
