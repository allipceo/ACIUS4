// ===== ACIU S4 대분류 학습 시스템 - 완전 단순화 버전 =====

// 전역 변수
let questionsData = [];
let currentQuestionIndex = 0;
let selectedAnswer = null; // 선택한 답안 저장
let selectedCategory = null; // 선택된 카테고리

// 로그 출력 함수
function log(message) {
    console.log(message);
}

// JSON 파일 로드
async function loadQuestions() {
    try {
        log('📁 JSON 파일 로딩 시작...');
        const response = await fetch('/static/questions.json');
        
        if (!response.ok) {
            throw new Error(`JSON 파일 로드 실패: ${response.status}`);
        }
        
        const jsonData = await response.json();
        log(`✅ JSON 데이터 로드 완료: ${jsonData.questions.length}개 문제`);
        
        // 데이터 필터링
        questionsData = jsonData.questions.filter(question =>
            question.qcode && question.question && question.answer && question.qcode.trim() !== ''
        );
        
        log(`✅ 필터링 완료: ${questionsData.length}개 문제`);
        log('🎯 문제 로딩 준비 완료!');
        
        // 카테고리별 문제 수 업데이트
        updateCategoryQuestionCounts();
        
        return true;
    } catch (error) {
        log(`❌ 문제 로딩 실패: ${error.message}`);
        return false;
    }
}

// 카테고리별 문제 수 업데이트
function updateCategoryQuestionCounts() {
    const categories = ['재산보험', '특종보험', '배상책임보험', '해상보험'];
    
    // 카테고리명 매핑
    const categoryMapping = {
        '재산보험': '06재산보험',
        '특종보험': '07특종보험',
        '배상책임보험': '08배상책임보험',
        '해상보험': '09해상보험'
    };
    
    categories.forEach(category => {
        const mappedCategoryName = categoryMapping[category];
        const count = questionsData.filter(q => 
            q.layer1 === mappedCategoryName
        ).length;
        
        const element = document.getElementById(`category-count-${category}`);
        if (element) {
            element.textContent = `${count}개 문제`;
        }
    });
    
    log('✅ 카테고리별 문제 수 업데이트 완료');
}

// 카테고리별 문제 로드
async function loadCategoryQuestions(categoryName) {
    log(`🎯 카테고리 문제 로딩: ${categoryName}`);
    
    selectedCategory = categoryName;
    
    // 카테고리명 매핑
    const categoryMapping = {
        '재산보험': '06재산보험',
        '특종보험': '07특종보험',
        '배상책임보험': '08배상책임보험',
        '해상보험': '09해상보험'
    };
    
    const mappedCategoryName = categoryMapping[categoryName];
    
    // 해당 카테고리의 문제만 필터링
    const categoryQuestions = questionsData.filter(question =>
        question.layer1 === mappedCategoryName
    );
    
    log(`✅ ${categoryName} 카테고리 문제 필터링 완료: ${categoryQuestions.length}개`);
    
    if (categoryQuestions.length === 0) {
        log('❌ 해당 카테고리에 문제가 없습니다.');
        return;
    }
    
    // 전역 변수 업데이트
    questionsData = categoryQuestions;
    currentQuestionIndex = 0;
    
    // 첫 번째 문제 표시
    displayQuestion(0);
}

// 문제 표시 함수
function displayQuestion(index) {
    if (!questionsData || questionsData.length === 0) {
        log('❌ 문제 데이터가 없습니다.');
        return;
    }
    
    if (index >= questionsData.length) {
        log('❌ 문제 인덱스가 범위를 벗어났습니다.');
        return;
    }
    
    const question = questionsData[index];
    log(`📋 문제 ${index + 1} 표시: ${question.qcode}`);
    
    // 문제 정보 표시
    document.getElementById('question-code').textContent = question.qcode || 'Q???';
    document.getElementById('question-type').textContent = question.type || '진위형';
    document.getElementById('layer-info').textContent = `${question.layer1 || ''} > ${question.layer2 || ''}`;
    document.getElementById('question-text').textContent = question.question || '문제를 불러올 수 없습니다.';
    document.getElementById('progress-info').textContent = `${index + 1} / ${questionsData.length}`;
    
    // 답안 버튼 생성
    createAnswerButtons(question);
    
    // 정답 숨기기
    document.getElementById('correct-answer').classList.add('hidden');
    
    // 선택한 답안 초기화
    selectedAnswer = null;
    
    log(`✅ 문제 ${index + 1} 표시 완료`);
}

// 답안 버튼 생성
function createAnswerButtons(question) {
    const buttonsContainer = document.getElementById('answer-buttons');
    buttonsContainer.innerHTML = '';
    
    if (question.type === '진위형') {
        // O/X 버튼
        ['O', 'X'].forEach(answer => {
            const button = document.createElement('button');
            button.className = 'bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg mr-4 transition-all';
            button.textContent = answer === 'O' ? '⭕ 맞다 (O)' : '❌ 틀리다 (X)';
            button.dataset.answer = answer;
            button.onclick = () => selectAnswer(answer, button);
            buttonsContainer.appendChild(button);
        });
    } else {
        // 선택형 버튼 (1, 2, 3, 4)
        for (let i = 1; i <= 4; i++) {
            const button = document.createElement('button');
            button.className = 'bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg mr-2 mb-2 transition-all';
            button.textContent = `${i}번`;
            button.dataset.answer = i.toString();
            button.onclick = () => selectAnswer(i.toString(), button);
            buttonsContainer.appendChild(button);
        }
    }
    
    log(`✅ 답안 버튼 생성 완료 (${question.type})`);
}

// 답안 선택 함수
function selectAnswer(answer, button) {
    log(`🎯 답안 선택: ${answer}`);
    
    // 이전 선택 해제
    const allButtons = document.querySelectorAll('#answer-buttons button');
    allButtons.forEach(btn => {
        btn.className = btn.className.replace('bg-blue-500 text-white', 'bg-gray-200 text-gray-800');
        btn.className = btn.className.replace('hover:bg-blue-600', 'hover:bg-gray-300');
    });
    
    // 현재 선택 표시
    button.className = button.className.replace('bg-gray-200 text-gray-800', 'bg-blue-500 text-white');
    button.className = button.className.replace('hover:bg-gray-300', 'hover:bg-blue-600');
    
    // 선택한 답안 저장
    selectedAnswer = answer;
    
    log(`✅ 답안 선택 완료: ${answer}`);
}

// 정답 표시
function showCorrectAnswer(correctAnswer) {
    document.getElementById('correct-answer-text').textContent = correctAnswer;
    document.getElementById('correct-answer').classList.remove('hidden');
    log(`✅ 정답 표시: ${correctAnswer}`);
    
    // 선택한 답안과 정답 비교하여 색상 표시
    if (selectedAnswer !== null) {
        const allButtons = document.querySelectorAll('#answer-buttons button');
        allButtons.forEach(btn => {
            const btnAnswer = btn.dataset.answer;
            if (btnAnswer === correctAnswer) {
                // 정답 버튼을 초록색으로 표시
                btn.className = btn.className.replace('bg-blue-500 text-white', 'bg-green-500 text-white');
                btn.className = btn.className.replace('hover:bg-blue-600', 'hover:bg-green-600');
            } else if (btnAnswer === selectedAnswer && selectedAnswer !== correctAnswer) {
                // 오답 선택한 버튼을 빨간색으로 표시
                btn.className = btn.className.replace('bg-blue-500 text-white', 'bg-red-500 text-white');
                btn.className = btn.className.replace('hover:bg-blue-600', 'hover:bg-red-600');
            }
        });
    }
}

// 다음 문제 로드
function nextQuestion() {
    if (currentQuestionIndex < questionsData.length - 1) {
        currentQuestionIndex++;
        displayQuestion(currentQuestionIndex);
    } else {
        log('🎉 마지막 문제입니다!');
    }
}

// 이전 문제 로드
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion(currentQuestionIndex);
    } else {
        log('📌 첫 번째 문제입니다.');
    }
}

// 정답 확인
function checkAnswer() {
    if (questionsData && questionsData.length > 0 && currentQuestionIndex < questionsData.length) {
        if (selectedAnswer === null) {
            alert('답안을 먼저 선택해주세요!');
            return;
        }
        
        const currentQuestion = questionsData[currentQuestionIndex];
        showCorrectAnswer(currentQuestion.answer);
    }
}

// 전역 함수로 노출
window.nextQuestion = nextQuestion;
window.previousQuestion = previousQuestion;
window.checkAnswer = checkAnswer;
window.selectAnswer = selectAnswer;
window.displayQuestion = displayQuestion;
window.loadCategoryQuestions = loadCategoryQuestions;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async function() {
    log('🚀 대분류 학습 시스템 시작');
    
    const success = await loadQuestions();
    
    if (success) {
        log('✅ 초기화 완료 - 카테고리를 선택하세요!');
    } else {
        log('❌ 초기화 실패');
    }
});

console.log('✅ 완전 단순화된 대분류 학습 시스템 로드 완료');
