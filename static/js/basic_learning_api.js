// static/js/basic_learning_api.js
// API 통신 및 데이터 로딩 모듈

// Week2 API 연결 함수들
async function checkWeek2APIHealth() {
    try {
        const response = await fetch('/api/quiz/health');
        if (response.ok) {
            const result = await response.json();
            console.log('✔ Week2 API 연결 성공:', result);
            return result.success;
        }
    } catch (error) {
        console.log('✗ Week2 API 연결 실패:', error);
    }
    return false;
}

async function startWeek2Session(mode = 'continue', category = 'all') {
    try {
        const response = await fetch('/api/quiz/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mode: mode,
                category: category
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✔ Week2 세션 생성 성공:', result);
            return result.session_id;
        }
    } catch (error) {
        console.log('★ Week2 세션 생성 실패 :', error);
    }
    return null;
}

async function loadQuestionFromAPI(sessionId, questionIndex) {
    try {
        const response = await fetch(`/api/quiz/question?session_id=${sessionId}&question_index=${questionIndex}`);
        if (response.ok) {
            const result = await response.json();
            console.log('✔ Week2 문제 로딩 성공:', result);
            return result.question;
        }
    } catch (error) {
        console.log('★ Week2 문제 로딩 실패 :', error);
    }
    return null;
}

async function submitAnswerToAPI(sessionId, questionIndex, answer) {
    try {
        const response = await fetch('/api/quiz/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                session_id: sessionId,
                question_index: questionIndex,
                answer: answer
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✔ Week2 답안 제출 성공:', result);
            return result;
        }
    } catch (error) {
        console.log('★ Week2 답안 제출 실패 :', error);
    }
    return null;
}

// 기본학습 데이터 로딩 함수
async function loadBasicLearningData(mode = 'basic') {
    console.log('🔄 기본학습 데이터 로딩 시작...');
    
    // 1단계: Week2 API 연결 시도
    const apiHealthy = await checkWeek2APIHealth();
    if (apiHealthy) {
        console.log('Week2 API 모드로 시작');
        
        // API 세션 생성
        const sessionId = await startWeek2Session('continue', 'all');
        if (sessionId) {
            currentAPISession = sessionId;
            window.useAPIMode = true;
            
            // 첫 번째 문제 로드
            const firstQuestion = await loadQuestionFromAPI(sessionId, 0);
            if (firstQuestion) {
                displayAPIQuestion(firstQuestion);
                basicLearningSystem.updateStatus('Week2 API 모드로 학습을 시작합니다.', 'blue');
                return;
            }
        }
        
        console.log('≡ 기존 CSV 모드로 전환');
    }
    
    // 2단계: JSON 파일 로딩 (폴백)
    try {
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
    
    // 3단계: CSV 파일 로딩 (최종 폴백)
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

// 전역 함수로 노출
window.selectBasicLearningMode = selectBasicLearningMode;
window.loadBasicLearningData = loadBasicLearningData;

console.log('✅ 기본학습 API 모듈 로드 완료');
