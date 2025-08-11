// ===== ACIU S4 기본학습 시스템 - 메인 모듈 =====

// 기본학습 모드 선택 함수
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

// 기존 함수 개선: API 우선, CSV 백업
async function loadBasicLearningData(mode) {
    try {
        console.log(`=== 개선된 데이터 로드: ${mode} ===`);
        
        // 1. Week2 API 연결 시도
        const apiConnected = await connectToWeek2API();
        
        if (apiConnected) {
            console.log('🚀 Week2 API 모드로 시작');
            
            // API로 세션 시작
            const sessionId = await startWeek2QuizSession(mode);
            
            if (sessionId) {
                // API에서 첫 번째 문제 로드
                const firstQuestion = await loadQuestionFromAPI(sessionId, 0);
                
                if (firstQuestion) {
                    // API 모드로 설정
                    window.useAPIMode = true;
                    currentQuestionIndex = 0;
                    
                    // 문제 표시 (API 데이터 형식에 맞게)
                    displayAPIQuestion(firstQuestion);
                    basicLearningSystem.updateStatus('Week2 API 모드로 학습을 시작합니다.', 'green');
                    return;
                }
            }
        }
        
        // 2. API 실패 시 기존 CSV 방식 사용
        console.log('📄 기존 CSV 모드로 전환');
        window.useAPIMode = false;
        
        // 검증된 JSON 파일 로드
        const response = await fetch('/static/questions.json');
        const jsonData = await response.json();
       
        console.log(`JSON 데이터 로드 완료: ${jsonData.questions.length}개 문제`);
        
        // 데이터 필터링 - 유효한 문제만 선택
        const filteredData = jsonData.questions.filter(question =>
            question.qcode && question.question && question.answer && question.qcode.trim() !== ''
        );
      
        console.log(`필터링 후 문제 수: ${filteredData.length}개`);
        
        // JSON 데이터를 기존 형식으로 변환
        const convertedData = filteredData.map(question => ({
            QCODE: question.qcode,
            QUESTION: question.question,
            ANSWER: question.answer,
            TYPE: question.type || '진위형',
            LAYER1: question.layer1 || '',
            LAYER2: question.layer2 || ''
        }));
        
        if (mode === 'random') {
            currentQuestionData = convertedData.sort(() => Math.random() - 0.5);
            currentQuestionIndex = 0;
        } else if (mode === 'restart') {
            currentQuestionData = [...convertedData];
            currentQuestionIndex = 0;
        } else if (mode === 'continue') {
            currentQuestionData = [...convertedData];
            if (userStatistics && userStatistics.basicLearning) {
                currentQuestionIndex = userStatistics.basicLearning.currentIndex || 0;
            } else {
                currentQuestionIndex = 0;
            }
        }
        
        displayQuestion();
        basicLearningSystem.updateStatisticsDisplay();
        basicLearningSystem.updateStatus('JSON 모드로 학습을 시작합니다.', 'blue');
       
    } catch (error) {
        console.error('데이터 로드 실패:', error);
        basicLearningSystem.updateStatus('데이터 로드 실패. 네트워크를 확인해주세요.', 'red');
    }
}

// 전역 함수로 노출
window.selectBasicLearningMode = selectBasicLearningMode;

// 초기화 함수
function initializeBasicLearningSystem() {
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
}

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeBasicLearningSystem();
});

console.log('✅ 메인 모듈 로드 완료');
