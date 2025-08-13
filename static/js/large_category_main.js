// large_category_main.js - 대분류 학습 메인 로직
// 🔧 v3.2 수정: JavaScript 에러 해결

console.log('=== 대분류 학습 시스템 초기화 ===');

// 전역 변수들
let currentQuestionData = [];
let currentQuestionIndex = 0;
let selectedAnswer = null;
let isAnswerChecked = false;
let selectedCategory = null;

// 🔧 v3.2 수정: todayCorrect 변수 중복 선언 방지
let largeCategoryTodayCorrect = 0;

// 대분류 학습 시스템 초기화
function initializeLargeCategorySystem() {
    console.log('대분류 학습 시스템 초기화 시작');
    
    // UI 초기화
    initializeLargeCategoryUI();
    
    // 카테고리 목록 로드
    loadLargeCategoryList();
    
    // 선택된 카테고리 초기화
    selectedCategory = null;
    
    // 🔧 v3.2 수정: loadUserStatistics 함수 존재 여부 확인 후 호출
    if (typeof loadUserStatistics === 'function') {
        loadUserStatistics();
    } else {
        console.log('⚠️ loadUserStatistics 함수가 정의되지 않았습니다. 통계 로딩을 건너뜁니다.');
    }
    
    // 데이터 필터링 모듈 초기화
    if (typeof initializeDataFilteringModule === 'function') {
        initializeDataFilteringModule();
    } else {
        console.log('⚠️ initializeDataFilteringModule 함수가 정의되지 않았습니다.');
    }
    
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
        if (typeof updateLargeCategoryStatistics === 'function') {
            updateLargeCategoryStatistics(isCorrect);
        } else {
            console.log('⚠️ updateLargeCategoryStatistics 함수가 정의되지 않았습니다.');
        }
        
        console.log(`답안 확인: ${selectedAnswer}, 정답: ${question.ANSWER}, 결과: ${isCorrect ? '정답' : '오답'}`);
    },
    
    nextQuestion: function() {
        if (!isAnswerChecked) return;
        
        currentQuestionIndex++;
        if (currentQuestionIndex >= currentQuestionData.length) {
            largeCategorySystem.updateStatus('모든 문제를 완료했습니다! 🎉', 'green');
            return;
        }
        
        if (typeof displayLargeCategoryQuestion === 'function') {
            displayLargeCategoryQuestion();
        } else {
            console.log('⚠️ displayLargeCategoryQuestion 함수가 정의되지 않았습니다.');
        }
        console.log(`다음 문제로 이동: ${currentQuestionIndex + 1}/${currentQuestionData.length}`);
    },
    
    prevQuestion: function() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            if (typeof displayLargeCategoryQuestion === 'function') {
                displayLargeCategoryQuestion();
            } else {
                console.log('⚠️ displayLargeCategoryQuestion 함수가 정의되지 않았습니다.');
            }
            console.log(`이전 문제로 이동: ${currentQuestionIndex + 1}/${currentQuestionData.length}`);
        }
    },
    
    updateStatus: function(message, color = 'blue') {
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `text-center text-${color}-600 mb-4 font-semibold`;
            console.log(`상태 업데이트: ${message}`);
        }
    }
};

// 🔧 v3.2 수정: 에러 처리 강화된 초기화
function safeInitializeLargeCategorySystem() {
    try {
        initializeLargeCategorySystem();
    } catch (error) {
        console.error('❌ 대분류 학습 시스템 초기화 실패:', error);
        console.log('▶ 시스템이 초기화되지 않았습니다.');
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    safeInitializeLargeCategorySystem();
});
