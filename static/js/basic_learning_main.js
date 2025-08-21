// ===== ACIU S4 기본학습 시스템 - 완전 단순화 버전 =====

// 전역 변수
let questionsData = [];
let currentQuestionIndex = 0;
let selectedAnswer = null; // 선택한 답안 저장
let currentCategory = null; // 현재 선택된 카테고리
let isCategoryMode = false; // 카테고리 모드 여부

// 카테고리별 문제 수 정의 (JSON 파일 기준)
const categoryTotals = {
    '06재산보험': 169,
    '07특종보험': 182,
    '08배상책임보험': 268,
    '09해상보험': 170
};

// ===== 새로운 통계 시스템 =====

// 통계 데이터 복원 함수 (기존 데이터 보호)
function restoreExistingStatistics() {
    try {
        console.log('🔍 기존 통계 데이터 복원 시도...');
        
        // 이어풀기 데이터 확인
        const progressData = localStorage.getItem('aicu_quiz_progress');
        if (progressData) {
            const progress = JSON.parse(progressData);
            const currentQuestionIndex = progress.currentQuestionIndex || 0;
            console.log(`📊 이어풀기 데이터 발견: ${currentQuestionIndex}번 문제`);
            
            // 현재 통계 데이터 확인
            const currentData = localStorage.getItem('aicu_statistics');
            if (currentData) {
                const current = JSON.parse(currentData);
                const currentTotal = current.total_questions_attempted || 0;
                
                // 이어풀기가 더 많으면 통계를 이어풀기에 맞춤
                if (currentQuestionIndex > currentTotal) {
                    console.log(`⚠️ 이어풀기(${currentQuestionIndex}) > 통계(${currentTotal}). 통계 복원 진행...`);
                    
                    // 통계 데이터를 이어풀기에 맞춰 수정
                    current.total_questions_attempted = currentQuestionIndex;
                    current.accuracy_rate = current.total_correct_answers > 0 
                        ? Math.round((current.total_correct_answers / currentQuestionIndex) * 100)
                        : 0;
                    
                    // 오늘 통계도 조정 (등록일이 오늘이므로)
                    const today = new Date().toISOString().split('T')[0];
                    if (!current.daily_progress) current.daily_progress = {};
                    if (!current.daily_progress[today]) {
                        current.daily_progress[today] = {
                            attempted: currentQuestionIndex,
                            correct: current.total_correct_answers || 0,
                            accuracy: current.accuracy_rate
                        };
                    } else {
                        current.daily_progress[today].attempted = currentQuestionIndex;
                        current.daily_progress[today].correct = current.total_correct_answers || 0;
                        current.daily_progress[today].accuracy = current.accuracy_rate;
                    }
                    
                    // 수정된 통계 저장
                    localStorage.setItem('aicu_statistics', JSON.stringify(current));
                    console.log('✅ 통계 데이터 복원 완료:', current);
                    return true;
                }
            }
        }
        
        return false;
    } catch (error) {
        console.error('❌ 통계 복원 실패:', error);
        return false;
    }
}

// 통계 데이터 로드 및 표시 (기존 데이터 우선)
function loadAndDisplayStatistics() {
    try {
        console.log('📊 통계 데이터 로드 시작...');
        
        // 기존 통계 데이터 복원 시도
        restoreExistingStatistics();
        
        // LocalStorage에서 통계 데이터 로드 (기존 데이터 우선)
        const statsData = localStorage.getItem('aicu_statistics');
        let stats = {};
        
        if (statsData) {
            stats = JSON.parse(statsData);
            console.log('📊 로드된 기존 통계 데이터:', stats);
        } else {
            console.log('📊 통계 데이터 없음, 초기화 필요');
            stats = {
                total_questions_attempted: 0,
                total_correct_answers: 0,
                accuracy_rate: 0,
                daily_progress: {},
                last_updated: new Date().toISOString()
            };
        }
        
        // 기존 통계 데이터가 있으면 유지 (중요!)
        if (stats.total_questions_attempted > 0) {
            console.log(`📊 기존 누적 통계 발견: ${stats.total_questions_attempted}문제`);
        }
        
        // 통계 표시
        updateStatisticsDisplay(stats);
        
        console.log('✅ 기존 통계 데이터 로드 완료');
        
    } catch (error) {
        console.error('❌ 통계 로드 실패:', error);
        // 기본값으로 표시
        updateStatisticsDisplay({
            total_questions_attempted: 0,
            total_correct_answers: 0,
            accuracy_rate: 0,
            daily_progress: {}
        });
    }
}

// 통계 표시 업데이트 (기존 데이터와 새로운 UI 연동)
function updateStatisticsDisplay(stats) {
    try {
        console.log('📊 통계 표시 업데이트 시작:', stats);
        
        // 기존 통계 데이터에서 정보 추출
        let dailyStats, cumulativeStats;
        
        if (isCategoryMode && currentCategory) {
            // 카테고리 모드: 카테고리별 통계 표시
            const categoryStats = stats.categories && stats.categories[currentCategory] 
                ? stats.categories[currentCategory] 
                : { solved: 0, correct: 0, total: categoryTotals[currentCategory] || 200 };
            
            // 카테고리별 금일/누적 통계
            const today = new Date().toISOString().split('T')[0];
            const dailyProgress = categoryStats.daily_progress?.[today] || { solved: 0, correct: 0 };
            
            dailyStats = {
                questions_solved: dailyProgress.solved || 0,
                accuracy_rate: dailyProgress.solved > 0 ? Math.round((dailyProgress.correct / dailyProgress.solved) * 100) : 0
            };
            
            console.log(`📊 ${currentCategory} 금일 통계: ${dailyStats.questions_solved}문제, ${dailyStats.accuracy_rate}%`);
            
            cumulativeStats = {
                questions_solved: categoryStats.solved || 0,
                accuracy_rate: categoryStats.accuracy || 0
            };
            
            console.log(`📊 카테고리 모드: ${currentCategory} 통계 - 금일: ${dailyStats.questions_solved}문제, 누적: ${cumulativeStats.questions_solved}문제`);
        } else {
            // 일반 모드: 전체 통계 표시
            const today = new Date().toISOString().split('T')[0];
            const dailyProgress = stats.daily_progress?.[today] || { attempted: 0, correct: 0 };
            
            dailyStats = {
                questions_solved: dailyProgress.attempted || 0,
                accuracy_rate: dailyProgress.attempted > 0 ? Math.round((dailyProgress.correct / dailyProgress.attempted) * 100) : 0
            };
            
            cumulativeStats = {
                questions_solved: stats.total_questions_attempted || 0,
                accuracy_rate: stats.accuracy_rate || 0
            };
            
            console.log(`📊 일반 모드: 전체 통계 - 금일: ${dailyStats.questions_solved}문제, 누적: ${cumulativeStats.questions_solved}문제`);
        }
        
        // 새로운 DOM 요소들 업데이트
        updateDailyCumulativeDisplay(dailyStats, cumulativeStats);
        
        console.log(`✅ 통계 표시 완료: 금일 ${dailyStats.questions_solved}문제 ${dailyStats.accuracy_rate}%, 누적 ${cumulativeStats.questions_solved}문제 ${cumulativeStats.accuracy_rate}%`);
        
    } catch (error) {
        console.error('❌ 통계 표시 업데이트 실패:', error);
        // 기본값 표시
        updateDailyCumulativeDisplay(
            { questions_solved: 0, accuracy_rate: 0 },
            { questions_solved: 0, accuracy_rate: 0 }
        );
    }
}

// 금일/누적 통계 DOM 업데이트 함수
function updateDailyCumulativeDisplay(dailyStats, cumulativeStats) {
    try {
        // 금일 통계 업데이트
        const dailyQuestionsElement = document.getElementById('daily-questions-solved');
        const dailyAccuracyElement = document.getElementById('daily-accuracy');
        
        if (dailyQuestionsElement) {
            dailyQuestionsElement.textContent = dailyStats.questions_solved;
        }
        
        if (dailyAccuracyElement) {
            dailyAccuracyElement.textContent = `${dailyStats.accuracy_rate}%`;
        }
        
        // 누적 통계 업데이트
        const cumulativeQuestionsElement = document.getElementById('cumulative-questions-solved');
        const cumulativeAccuracyElement = document.getElementById('cumulative-accuracy');
        
        if (cumulativeQuestionsElement) {
            cumulativeQuestionsElement.textContent = cumulativeStats.questions_solved;
        }
        
        if (cumulativeAccuracyElement) {
            cumulativeAccuracyElement.textContent = `${cumulativeStats.accuracy_rate}%`;
        }
        
        console.log('✅ 금일/누적 통계 DOM 업데이트 완료');
        
    } catch (error) {
        console.error('❌ 금일/누적 통계 DOM 업데이트 실패:', error);
    }
}

// 통계 업데이트 (기존 데이터 우선)
function updateStatistics(question, userAnswer, isCorrect) {
    try {
        console.log('📊 통계 업데이트 시작...');
        console.log('문제:', question.qcode, '사용자 답안:', userAnswer, '정답:', question.answer, '정답여부:', isCorrect);
        
        // 현재 통계 로드
        const statsData = localStorage.getItem('aicu_statistics');
        let stats = {};
        
        if (statsData) {
            stats = JSON.parse(statsData);
        } else {
            // 통계 데이터가 없으면 초기화
            stats = {
                total_questions_attempted: 0,
                total_correct_answers: 0,
                accuracy_rate: 0,
                daily_progress: {},
                last_updated: new Date().toISOString()
            };
        }
        
        // 기존 통계 데이터 확인 및 로그
        console.log(`📊 현재 통계 상태: 총 ${stats.total_questions_attempted}문제, 정답 ${stats.total_correct_answers}개`);
        
        // daily_progress가 없으면 초기화
        if (!stats.daily_progress) {
            stats.daily_progress = {};
        }
        
        // 현재 시간
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        // 통계 업데이트 (기존 데이터 보호)
        const existingTotal = stats.total_questions_attempted || 0;
        const existingCorrect = stats.total_correct_answers || 0;
        
        stats.total_questions_attempted = existingTotal + 1;
        if (isCorrect) {
            stats.total_correct_answers = existingCorrect + 1;
        }
        
        // 정답률 계산
        stats.accuracy_rate = stats.total_questions_attempted > 0 
            ? Math.round((stats.total_correct_answers / stats.total_questions_attempted) * 100) 
            : 0;
        
        // 카테고리별 통계 업데이트 (카테고리 모드일 때)
        if (isCategoryMode && currentCategory) {
            if (!stats.categories) stats.categories = {};
            if (!stats.categories[currentCategory]) {
                stats.categories[currentCategory] = {
                    solved: 0,
                    correct: 0,
                    total: categoryTotals[currentCategory] || 200,
                    accuracy: 0,
                    current_question_index: 0,
                    daily_progress: {}
                };
            }
            
            // 카테고리별 통계 업데이트 (기존 데이터 보호)
            const existingSolved = stats.categories[currentCategory].solved || 0;
            const existingCorrect = stats.categories[currentCategory].correct || 0;
            
            stats.categories[currentCategory].solved = existingSolved + 1;
            if (isCorrect) {
                stats.categories[currentCategory].correct = existingCorrect + 1;
            }
            
            // 카테고리별 정답률 계산
            stats.categories[currentCategory].accuracy = stats.categories[currentCategory].solved > 0 
                ? Math.round((stats.categories[currentCategory].correct / stats.categories[currentCategory].solved) * 100) 
                : 0;
            
            // 현재 문제 인덱스 업데이트 (이어풀기용)
            stats.categories[currentCategory].current_question_index = currentQuestionIndex;
            
            // 카테고리별 일별 진행상황 업데이트
            if (!stats.categories[currentCategory].daily_progress) {
                stats.categories[currentCategory].daily_progress = {};
            }
            
            if (!stats.categories[currentCategory].daily_progress[today]) {
                stats.categories[currentCategory].daily_progress[today] = {
                    solved: 0,
                    correct: 0,
                    accuracy: 0
                };
            }
            
            // 금일 통계 업데이트 (기존 데이터 보호)
            const existingDailySolved = stats.categories[currentCategory].daily_progress[today].solved || 0;
            const existingDailyCorrect = stats.categories[currentCategory].daily_progress[today].correct || 0;
            
            stats.categories[currentCategory].daily_progress[today].solved = existingDailySolved + 1;
            if (isCorrect) {
                stats.categories[currentCategory].daily_progress[today].correct = existingDailyCorrect + 1;
            }
            
            stats.categories[currentCategory].daily_progress[today].accuracy = 
                stats.categories[currentCategory].daily_progress[today].solved > 0 
                    ? Math.round((stats.categories[currentCategory].daily_progress[today].correct / 
                                  stats.categories[currentCategory].daily_progress[today].solved) * 100) 
                    : 0;
            
            console.log(`📊 ${currentCategory} 카테고리 통계 업데이트: 누적 ${stats.categories[currentCategory].solved}문제, 금일 ${stats.categories[currentCategory].daily_progress[today].solved}문제`);
        }
        
        // 일별 진행상황 업데이트 (기존 데이터 보호)
        if (!stats.daily_progress[today]) {
            stats.daily_progress[today] = {
                attempted: 0,
                correct: 0,
                time: 0,
                accuracy: 0
            };
        }
        
        // 금일 통계 업데이트 (기존 데이터 보호)
        const existingDailyAttempted = stats.daily_progress[today].attempted || 0;
        const existingDailyCorrect = stats.daily_progress[today].correct || 0;
        
        stats.daily_progress[today].attempted = existingDailyAttempted + 1;
        if (isCorrect) {
            stats.daily_progress[today].correct = existingDailyCorrect + 1;
        }
        
        // 일별 정답률 계산
        stats.daily_progress[today].accuracy = stats.daily_progress[today].attempted > 0 
            ? Math.round((stats.daily_progress[today].correct / stats.daily_progress[today].attempted) * 100) 
            : 0;
        
        stats.last_updated = now.toISOString();
        
        // 기존 통계 데이터 보호 (중요!)
        const existingData = localStorage.getItem('aicu_statistics');
        if (existingData) {
            const existing = JSON.parse(existingData);
            if (existing.total_questions_attempted > stats.total_questions_attempted) {
                console.log('⚠️ 기존 데이터가 더 많음. 기존 데이터 유지');
                stats = existing;
            }
        }
        
        // 이어풀기 데이터와 동기화 확인
        const progressData = localStorage.getItem('aicu_quiz_progress');
        if (progressData) {
            const progress = JSON.parse(progressData);
            const currentQuestionIndex = progress.currentQuestionIndex || 0;
            
            // 통계가 이어풀기보다 적으면 이어풀기에 맞춤
            if (stats.total_questions_attempted < currentQuestionIndex) {
                console.log(`⚠️ 통계(${stats.total_questions_attempted}) < 이어풀기(${currentQuestionIndex}). 이어풀기에 맞춤`);
                stats.total_questions_attempted = currentQuestionIndex;
                stats.accuracy_rate = stats.total_correct_answers > 0 
                    ? Math.round((stats.total_correct_answers / currentQuestionIndex) * 100)
                    : 0;
            }
        }
        
        // LocalStorage에 저장
        localStorage.setItem('aicu_statistics', JSON.stringify(stats));
        
        console.log('✅ 통계 업데이트 완료:', stats);
        console.log(`📊 업데이트된 통계: 총 ${stats.total_questions_attempted}문제, 정답률 ${stats.accuracy_rate}%`);
        
        // 화면 즉시 업데이트
        updateStatisticsDisplay(stats);
        
        // 실시간 동기화 (중앙 아키텍처가 있는 경우)
        if (window.RealtimeSyncManager) {
            window.RealtimeSyncManager.syncStatistics(stats);
        }
        
    } catch (error) {
        console.error('❌ 통계 업데이트 실패:', error);
    }
}

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
        
        // 기본 데이터 필터링
        let filteredQuestions = jsonData.questions.filter(question =>
            question.qcode && question.question && question.answer && question.qcode.trim() !== ''
        );
        
        // 카테고리별 필터링 (카테고리 모드일 때)
        if (isCategoryMode && currentCategory) {
            log(`🔍 ${currentCategory} 카테고리 필터링 시작...`);
            
            // 카테고리별 필터링 로직 (JSON 파일의 layer1 필드 기준)
            filteredQuestions = filteredQuestions.filter(question => {
                const layer1 = question.layer1 || '';
                
                // 정확한 layer1 값으로 필터링
                switch (currentCategory) {
                    case '06재산보험':
                        return layer1 === '06재산보험';
                    case '07특종보험':
                        return layer1 === '07특종보험';
                    case '08배상책임보험':
                        return layer1 === '08배상책임보험';
                    case '09해상보험':
                        return layer1 === '09해상보험';
                    default:
                        return true;
                }
            });
            
            log(`✅ ${currentCategory} 카테고리 필터링 완료: ${filteredQuestions.length}개 문제`);
        }
        
        questionsData = filteredQuestions;
        log(`✅ 최종 필터링 완료: ${questionsData.length}개 문제`);
        log('🎯 문제 로딩 준비 완료!');
        
        return true;
    } catch (error) {
        log(`❌ 문제 로딩 실패: ${error.message}`);
        return false;
    }
}

// 문제 표시 함수 (공통 컴포넌트 사용)
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
    
    // 공통 컴포넌트를 사용하여 문제 표시
    if (window.QuestionDisplayManager) {
        window.QuestionDisplayManager.displayQuestion(question, index, questionsData.length, {
            isCategoryMode: isCategoryMode,
            currentCategory: currentCategory
        });
    }
    
    // 공통 컴포넌트를 사용하여 선택지 생성
    if (window.AnswerButtonManager) {
        window.AnswerButtonManager.createAnswerButtons(question, 'answer-buttons');
    }
    
    // V5.0 결과 표시 초기화
    resetV5Result();
    
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
        btn.className = btn.className.replace('bg-yellow-400 text-gray-800', 'bg-gray-200 text-gray-800');
        btn.className = btn.className.replace('hover:bg-yellow-500', 'hover:bg-gray-300');
    });
    
    // 현재 선택 표시 (선택한 답안을 노란색으로 강조)
    button.className = button.className.replace('bg-gray-200 text-gray-800', 'bg-yellow-400 text-gray-800');
    button.className = button.className.replace('hover:bg-gray-300', 'hover:bg-yellow-500');
    
    // 선택한 답안 저장
    selectedAnswer = answer;
    
    log(`✅ 답안 선택 완료: ${answer}`);
}

// 정답 표시
function showCorrectAnswer(correctAnswer) {
    // 선택한 답안과 정답 비교하여 친근한 메시지 생성
    let message = '';
    if (selectedAnswer === correctAnswer) {
        message = `🎉 네, 정답입니다! 정답은 "${correctAnswer}"입니다.`;
    } else {
        message = `😅 틀렸습니다... 정답은 "${correctAnswer}"입니다.`;
    }
    
    document.getElementById('correct-answer-text').textContent = message;
    document.getElementById('correct-answer').classList.remove('hidden');
    log(`✅ 정답 표시: ${message}`);
    
    // 선택한 답안과 정답 비교하여 색상 표시
    if (selectedAnswer !== null) {
        const allButtons = document.querySelectorAll('#answer-buttons button');
        allButtons.forEach(btn => {
            const btnAnswer = btn.dataset.answer;
            if (btnAnswer === correctAnswer) {
                // 정답 버튼을 초록색으로 표시
                btn.className = btn.className.replace('bg-yellow-400 text-gray-800', 'bg-green-500 text-white');
                btn.className = btn.className.replace('bg-blue-500 text-white', 'bg-green-500 text-white');
                btn.className = btn.className.replace('hover:bg-yellow-500', 'hover:bg-green-600');
                btn.className = btn.className.replace('hover:bg-blue-600', 'hover:bg-green-600');
            } else if (btnAnswer === selectedAnswer && selectedAnswer !== correctAnswer) {
                // 오답 선택한 버튼을 빨간색으로 표시
                btn.className = btn.className.replace('bg-yellow-400 text-gray-800', 'bg-red-500 text-white');
                btn.className = btn.className.replace('bg-blue-500 text-white', 'bg-red-500 text-white');
                btn.className = btn.className.replace('hover:bg-yellow-500', 'hover:bg-red-600');
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
        
        // 진행상황 저장
        saveProgress();
    } else {
        log('🎉 마지막 문제입니다!');
    }
}

// 진행상황 저장
function saveProgress() {
    try {
        const progressData = {
            currentQuestionIndex: currentQuestionIndex,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('aicu_quiz_progress', JSON.stringify(progressData));
        log(`💾 진행상황 저장: ${currentQuestionIndex + 1}번 문제`);
        
        // 카테고리별 진행상황 저장 (카테고리 모드일 때)
        if (isCategoryMode && currentCategory) {
            // 1. 카테고리별 진행상황 파일에 저장
            const categoryProgressData = localStorage.getItem('aicu_category_progress') || '{}';
            const categoryProgress = JSON.parse(categoryProgressData);
            
            categoryProgress[currentCategory] = {
                currentQuestionIndex: currentQuestionIndex,
                lastUpdated: new Date().toISOString()
            };
            
            localStorage.setItem('aicu_category_progress', JSON.stringify(categoryProgress));
            console.log(`💾 ${currentCategory} 카테고리 진행상황 저장: ${currentQuestionIndex + 1}번 문제`);
            
            // 2. 중앙 아키텍처에도 현재 문제 인덱스 저장
            const statsData = localStorage.getItem('aicu_statistics');
            if (statsData) {
                const stats = JSON.parse(statsData);
                if (!stats.categories) stats.categories = {};
                if (!stats.categories[currentCategory]) {
                    stats.categories[currentCategory] = {
                        solved: 0,
                        correct: 0,
                        total: categoryTotals[currentCategory] || 200,
                        accuracy: 0,
                        current_question_index: 0,
                        daily_progress: {}
                    };
                }
                
                stats.categories[currentCategory].current_question_index = currentQuestionIndex;
                localStorage.setItem('aicu_statistics', JSON.stringify(stats));
                console.log(`💾 중앙 아키텍처에 ${currentCategory} 현재 문제 인덱스 저장: ${currentQuestionIndex + 1}번`);
            }
        }
    } catch (error) {
        log(`❌ 진행상황 저장 실패: ${error.message}`);
    }
}

// 진행상황 복원 (중앙 아키텍처 우선)
function restoreProgress() {
    try {
        console.log('🔄 진행상황 복원 시작...');
        
        if (isCategoryMode && currentCategory) {
            // 카테고리별 진행상황 복원 (중앙 아키텍처 우선)
            console.log(`🔍 ${currentCategory} 카테고리 진행상황 복원 시도...`);
            
            // 1. 중앙 아키텍처에서 카테고리별 통계 확인
            const statsData = localStorage.getItem('aicu_statistics');
            if (statsData) {
                const stats = JSON.parse(statsData);
                if (stats.categories && stats.categories[currentCategory]) {
                    const categoryStats = stats.categories[currentCategory];
                    const lastQuestionIndex = categoryStats.current_question_index || 0;
                    
                    if (lastQuestionIndex > 0) {
                        currentQuestionIndex = lastQuestionIndex;
                        console.log(`✅ 중앙 아키텍처에서 ${currentCategory} 진행상황 복원: ${currentQuestionIndex + 1}번 문제`);
                        return;
                    }
                }
            }
            
            // 2. 카테고리별 진행상황 파일에서 복원
            const categoryProgressData = localStorage.getItem('aicu_category_progress');
            if (categoryProgressData) {
                const categoryProgress = JSON.parse(categoryProgressData);
                if (categoryProgress[currentCategory]) {
                    const savedIndex = categoryProgress[currentCategory].currentQuestionIndex || 0;
                    if (savedIndex > 0) {
                        currentQuestionIndex = savedIndex;
                        console.log(`✅ 카테고리 진행상황에서 ${currentCategory} 복원: ${currentQuestionIndex + 1}번 문제`);
                        return;
                    }
                }
            }
            
            console.log(`📝 ${currentCategory} 카테고리 진행상황 없음, 1번 문제부터 시작`);
            currentQuestionIndex = 0;
        } else {
            // 일반 진행상황 복원
            const progressData = localStorage.getItem('aicu_quiz_progress');
            if (progressData) {
                const progress = JSON.parse(progressData);
                const savedIndex = progress.currentQuestionIndex || 0;
                if (savedIndex > 0) {
                    currentQuestionIndex = savedIndex;
                    console.log(`✅ 일반 진행상황 복원: ${currentQuestionIndex + 1}번 문제`);
                } else {
                    console.log('🔄 저장된 진행상황 없음, 1번 문제부터 시작');
                    currentQuestionIndex = 0;
                }
            } else {
                console.log('🔄 저장된 진행상황 없음, 1번 문제부터 시작');
                currentQuestionIndex = 0;
            }
        }
        
    } catch (error) {
        console.error('❌ 진행상황 복원 실패:', error);
        currentQuestionIndex = 0;
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

// 정답 확인 (공통 컴포넌트 사용)
function checkAnswer() {
    if (questionsData && questionsData.length > 0 && currentQuestionIndex < questionsData.length) {
        // 공통 컴포넌트에서 선택된 답안 가져오기
        const userAnswer = window.AnswerButtonManager ? window.AnswerButtonManager.getSelectedAnswer() : selectedAnswer;
        
        if (userAnswer === null) {
            alert('답안을 먼저 선택해주세요!');
            return;
        }
        
        const currentQuestion = questionsData[currentQuestionIndex];
        const isCorrect = userAnswer === currentQuestion.answer;
        
        console.log('=== 기본학습 정답 확인 ===');
        console.log('문제:', currentQuestion.qcode, '사용자 답안:', userAnswer, '정답:', currentQuestion.answer, '정답여부:', isCorrect);
        
        // 중앙 데이터 관리자로 결과 전송
        if (window.CentralDataManager && typeof window.CentralDataManager.recordQuizResult === 'function') {
            window.CentralDataManager.recordQuizResult(
                currentQuestion.qcode || `basic_${currentQuestionIndex}`,
                'basic_learning',
                isCorrect,
                userAnswer,
                currentQuestion.answer
            );
            console.log('✅ 기본학습 중앙 데이터 업데이트 완료');
        } else {
            console.warn('⚠️ CentralDataManager를 찾을 수 없습니다.');
        }
        
        // 기본학습 상태 저장
        saveBasicLearningState(currentQuestionIndex, isCorrect);
        
        // 새로운 통계 업데이트 함수 호출 (기존 호환성 유지)
        updateStatistics(currentQuestion, userAnswer, isCorrect);
        
        // V5.0 결과 표시 영역에 정답 결과 표시
        showV5Result(userAnswer, currentQuestion.answer, isCorrect, currentQuestion);
        
        // 공통 컴포넌트를 사용하여 선택지 색상 변경
        if (window.AnswerButtonManager) {
            window.AnswerButtonManager.showAnswerResult(currentQuestion.answer);
        }
        
        // 정답 확인 시 진행상황 저장
        saveProgress();
    }
}

// V5.0 결과 표시 함수 (기존 DOM 구조 활용)
function showV5Result(userAnswer, correctAnswer, isCorrect, question) {
    try {
        console.log('🎯 V5.0 결과 표시 시작');
        
        // 결과 영역 찾기
        const resultArea = document.getElementById('result-area');
        const resultMessage = document.getElementById('result-message');
        const correctAnswerDiv = document.getElementById('correct-answer');
        const correctAnswerText = document.getElementById('correct-answer-text');
        
        if (!resultArea || !resultMessage) {
            console.error('❌ 결과 표시 영역을 찾을 수 없습니다');
            return;
        }
        
        // 결과 영역 표시
        resultArea.classList.remove('hidden');
        
        if (isCorrect) {
            // 정답인 경우
            resultMessage.className = 'p-4 rounded-lg font-medium border-l-4 bg-green-50 border-green-500 text-green-800';
            resultMessage.innerHTML = `
                <div class="flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    정답입니다! 🎉
                </div>
            `;
            
            // 정답 표시 숨기기 (정답이므로 불필요)
            if (correctAnswerDiv) {
                correctAnswerDiv.classList.add('hidden');
            }
        } else {
            // 오답인 경우
            resultMessage.className = 'p-4 rounded-lg font-medium border-l-4 bg-red-50 border-red-500 text-red-800';
            resultMessage.innerHTML = `
                <div class="flex items-center mb-2">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    틀렸습니다 😞
                </div>
                <p class="text-sm">선택한 답: <span class="font-bold">${getAnswerText(userAnswer)}</span></p>
            `;
            
            // 정답 표시
            if (correctAnswerDiv && correctAnswerText) {
                correctAnswerDiv.classList.remove('hidden');
                correctAnswerText.textContent = `정답: ${getAnswerText(correctAnswer)}`;
            }
        }
        
        console.log('✅ V5.0 결과 표시 완료');
        
    } catch (error) {
        console.error('❌ V5.0 결과 표시 실패:', error);
    }
}

// 답안 텍스트 변환 함수
function getAnswerText(answer) {
    const answerMap = {
        'O': '맞음 (O)',
        'X': '틀림 (X)',
        '1': '1번',
        '2': '2번',
        '3': '3번',
        '4': '4번'
    };
    return answerMap[answer] || answer;
}

// V5.0 결과 표시 초기화 함수
function resetV5Result() {
    try {
        console.log('🔄 V5.0 결과 표시 초기화');
        
        const resultArea = document.getElementById('result-area');
        const correctAnswerDiv = document.getElementById('correct-answer');
        
        // 결과 영역 숨기기
        if (resultArea) {
            resultArea.classList.add('hidden');
        }
        
        // 정답 표시 숨기기
        if (correctAnswerDiv) {
            correctAnswerDiv.classList.add('hidden');
        }
        
        console.log('✅ V5.0 결과 표시 초기화 완료');
        
    } catch (error) {
        console.error('❌ V5.0 결과 표시 초기화 실패:', error);
    }
}

// 기본학습 상태 저장 함수
function saveBasicLearningState(questionIndex, isCorrect) {
    try {
        console.log('=== 기본학습 상태 저장 ===');
        
        const realTimeData = JSON.parse(localStorage.getItem('aicu_real_time_data') || '{}');
        
        if (!realTimeData['basic_learning']) {
            realTimeData['basic_learning'] = {
                solved: 0,
                correct: 0,
                accuracy: 0,
                daily_progress: {},
                lastQuestionIndex: 0
            };
        }
        
        // 마지막 문제 인덱스 업데이트
        realTimeData['basic_learning'].lastQuestionIndex = questionIndex;
        
        // 학습 통계 업데이트
        realTimeData['basic_learning'].solved++;
        if (isCorrect) {
            realTimeData['basic_learning'].correct++;
        }
        realTimeData['basic_learning'].accuracy = (realTimeData['basic_learning'].correct / realTimeData['basic_learning'].solved * 100).toFixed(1);
        
        // 일일 진행률 업데이트
        const today = new Date().toISOString().split('T')[0];
        if (!realTimeData['basic_learning'].daily_progress[today]) {
            realTimeData['basic_learning'].daily_progress[today] = {
                solved: 0,
                correct: 0
            };
        }
        
        realTimeData['basic_learning'].daily_progress[today].solved++;
        if (isCorrect) {
            realTimeData['basic_learning'].daily_progress[today].correct++;
        }
        
        localStorage.setItem('aicu_real_time_data', JSON.stringify(realTimeData));
        
        // 이벤트 발생
        const event = new CustomEvent('basicLearningStateUpdated', {
            detail: {
                category: 'basic_learning',
                questionIndex: questionIndex,
                isCorrect: isCorrect
            }
        });
        
        document.dispatchEvent(event);
        console.log('✅ 기본학습 상태 저장 완료');
        
    } catch (error) {
        console.error('❌ 기본학습 상태 저장 실패:', error);
    }
}

// 카테고리 모드 초기화
function initializeCategoryMode() {
    try {
        console.log('🔍 카테고리 모드 초기화...');
        
        // URL 파라미터에서 카테고리 정보 확인
        const urlParams = new URLSearchParams(window.location.search);
        const categoryFromURL = urlParams.get('category');
        
        if (categoryFromURL) {
            currentCategory = categoryFromURL;
            isCategoryMode = true;
            console.log(`✅ 카테고리 모드 활성화: ${currentCategory}`);
            
            // LocalStorage에도 저장
            localStorage.setItem('aicu_current_category', currentCategory);
            
            // UI 업데이트
            updateCategoryUI();
        } else {
            // LocalStorage에서 카테고리 정보 확인 (이전 방식 호환성)
            const categoryData = localStorage.getItem('aicu_current_category');
            if (categoryData) {
                currentCategory = categoryData;
                isCategoryMode = true;
                console.log(`✅ 카테고리 모드 활성화 (LocalStorage): ${currentCategory}`);
                
                // UI 업데이트
                updateCategoryUI();
            } else {
                console.log('📝 일반 기본학습 모드');
                isCategoryMode = false;
            }
        }
        
    } catch (error) {
        console.error('❌ 카테고리 모드 초기화 실패:', error);
        isCategoryMode = false;
    }
}

// 카테고리 UI 업데이트
function updateCategoryUI() {
    try {
        // 카테고리 정보 표시
        const categoryInfo = document.getElementById('category-info');
        const categoryProgressInfo = document.getElementById('category-progress-info');
        const currentCategorySpan = document.getElementById('current-category');
        
        if (categoryInfo && categoryProgressInfo && currentCategorySpan) {
            categoryInfo.classList.remove('hidden');
            categoryProgressInfo.classList.remove('hidden');
            categoryInfo.textContent = `📚 ${currentCategory} 카테고리 학습`;
            currentCategorySpan.textContent = currentCategory;
        }
        
        // 상태 업데이트
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.textContent = `${currentCategory} 카테고리 학습 모드`;
        }
        
    } catch (error) {
        console.error('❌ 카테고리 UI 업데이트 실패:', error);
    }
}

// 전역 함수로 노출
window.nextQuestion = nextQuestion;
window.previousQuestion = previousQuestion;
window.checkAnswer = checkAnswer;
window.selectAnswer = selectAnswer;
window.displayQuestion = displayQuestion;

// 페이지 로드 시 자동 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 기본학습 시스템 자동 초기화 시작');
    
    // 카테고리 모드 초기화
    initializeCategoryMode();
    
    // 문제 데이터 로딩 및 첫 번째 문제 표시
    loadQuestions().then(() => {
        console.log('✅ 문제 데이터 로딩 완료');
        
        // 저장된 진행상황 복원
        restoreProgress();
        
        // 새로운 통계 시스템으로 데이터 로드 및 표시
        // 페이지 로드 시 통계 즉시 로드
        setTimeout(() => {
            loadAndDisplayStatistics();
        }, 100);
        
        // 첫 번째 문제 표시
        if (questionsData && questionsData.length > 0) {
            console.log('📋 첫 번째 문제 표시');
            displayQuestion(currentQuestionIndex);
        } else {
            console.log('❌ 문제 데이터가 없습니다');
        }
    }).catch(error => {
        console.error('❌ 문제 데이터 로딩 실패:', error);
    });
});

console.log('✅ 완전히 새로 작성된 기본학습 시스템 로드 완료');