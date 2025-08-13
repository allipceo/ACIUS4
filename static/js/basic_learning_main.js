// ===== ACIU S4 기본학습 시스템 - 완전 단순화 버전 =====

// 전역 변수
let questionsData = [];
let currentQuestionIndex = 0;
let selectedAnswer = null; // 선택한 답안 저장

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
        
        return true;
    } catch (error) {
        log(`❌ 문제 로딩 실패: ${error.message}`);
        return false;
    }
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

// 페이지 로드 시 초기화 (문제 자동 표시하지 않음)
document.addEventListener('DOMContentLoaded', async function() {
    log('🚀 기본학습 시스템 시작');
    
    const success = await loadQuestions();
    
    if (success) {
        log('✅ 초기화 완료 - 문제 풀기 버튼을 클릭하세요!');
        // 문제는 자동으로 표시하지 않고, 사용자가 "문제 풀기" 버튼을 클릭할 때 표시
    } else {
        log('❌ 초기화 실패');
    }
});

console.log('✅ 완전 단순화된 기본학습 시스템 로드 완료');
