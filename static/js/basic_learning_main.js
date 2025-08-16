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

// 통계 데이터 로드 및 표시 (완전히 새로 작성)
function loadAndDisplayStatistics() {
    try {
        console.log('📊 새로운 통계 시스템 - 데이터 로드 시작...');
        
        // 기존 통계 데이터 복원 시도
        restoreExistingStatistics();
        
        // LocalStorage에서 통계 데이터 로드
        const statsData = localStorage.getItem('aicu_statistics');
        let stats = {};
        
        if (statsData) {
            stats = JSON.parse(statsData);
            console.log('📊 로드된 통계 데이터:', stats);
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

// 통계 표시 업데이트 (완전히 새로 작성)
function updateStatisticsDisplay(stats) {
    try {
        console.log('📊 통계 표시 업데이트 시작:', stats);

        // 중앙 데이터에서 기본학습 통계 가져오기
        const realTimeData = JSON.parse(localStorage.getItem('aicu_real_time_data') || '{}');
        const basicLearningData = realTimeData['basic_learning'] || {};

        let totalQuestions, totalAttempted, totalCorrect, accuracyRate;

        if (isCategoryMode && currentCategory) {
            // 카테고리 모드: 카테고리별 통계 표시
            const categoryStats = stats.categories && stats.categories[currentCategory] 
                ? stats.categories[currentCategory] 
                : { solved: 0, correct: 0, total: categoryTotals[currentCategory] || 200 };
            
            totalQuestions = categoryStats.total || categoryTotals[currentCategory] || 200;
            totalAttempted = categoryStats.solved || 0;
            totalCorrect = categoryStats.correct || 0;
            accuracyRate = categoryStats.accuracy || 0;
            
            console.log(`📊 카테고리 모드: ${currentCategory} 통계`);
        } else {
            // 일반 모드: 중앙 데이터의 기본학습 통계 표시
            totalQuestions = 789;
            totalAttempted = basicLearningData.solved || 0;
            totalCorrect = basicLearningData.correct || 0;
            accuracyRate = basicLearningData.accuracy || 0;
            
            console.log('📊 일반 모드: 중앙 데이터 기본학습 통계');
        }
        
        // 오늘 통계 계산 (중앙 데이터 사용)
        const today = new Date().toISOString().split('T')[0];
        const todayData = basicLearningData.daily_progress?.[today] || { solved: 0, correct: 0 };
        const todayAttempted = todayData.solved || 0;
        const todayAccuracy = todayData.solved > 0 ? (todayData.correct / todayData.solved * 100).toFixed(1) : 0;
        
        // 진행률 계산
        const progressRate = totalQuestions > 0 
            ? ((totalAttempted / totalQuestions) * 100).toFixed(1) 
            : 0;
        
        // 화면에 표시
        const progressElement = document.getElementById('basic-progress-text');
        const accuracyElement = document.getElementById('basic-accuracy-text');
        const todayAccuracyElement = document.getElementById('basic-today-accuracy');
        
        if (progressElement) {
            progressElement.textContent = `${progressRate}% (${totalAttempted}/${totalQuestions})`;
        }
        
        if (accuracyElement) {
            accuracyElement.textContent = `${accuracyRate}%`;
        }
        
        if (todayAccuracyElement) {
            todayAccuracyElement.textContent = `${todayAccuracy}%`;
        }
        
        console.log(`✅ 통계 표시 완료: 진행률 ${progressRate}%, 정답률 ${accuracyRate}%, 오늘 정답률 ${todayAccuracy}%`);
        console.log(`📊 상세 통계: 총 ${totalAttempted}문제 풀이, 정답 ${totalCorrect}개, 오늘 ${todayAttempted}문제`);
        
    } catch (error) {
        console.error('❌ 통계 표시 업데이트 실패:', error);
        // 기본값 표시
        const progressElement = document.getElementById('basic-progress-text');
        const accuracyElement = document.getElementById('basic-accuracy-text');
        const todayAccuracyElement = document.getElementById('basic-today-accuracy');
        
        if (progressElement) progressElement.textContent = '0.0% (0/789)';
        if (accuracyElement) accuracyElement.textContent = '0%';
        if (todayAccuracyElement) todayAccuracyElement.textContent = '0%';
    }
}

// 통계 업데이트 (완전히 새로 작성)
function updateStatistics(question, userAnswer, isCorrect) {
    try {
        console.log('📊 새로운 통계 시스템 - 업데이트 시작...');
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
        
        // 통계 업데이트
        stats.total_questions_attempted += 1;
        if (isCorrect) {
            stats.total_correct_answers += 1;
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
            
            // 카테고리별 통계 업데이트
            stats.categories[currentCategory].solved += 1;
            if (isCorrect) {
                stats.categories[currentCategory].correct += 1;
            }
            
            // 카테고리별 정답률 계산
            stats.categories[currentCategory].accuracy = stats.categories[currentCategory].solved > 0 
                ? Math.round((stats.categories[currentCategory].correct / stats.categories[currentCategory].solved) * 100) 
                : 0;
            
            // 카테고리별 일별 진행상황 업데이트
            if (!stats.categories[currentCategory].daily_progress) {
                stats.categories[currentCategory].daily_progress = {};
            }
            
            if (!stats.categories[currentCategory].daily_progress[today]) {
                stats.categories[currentCategory].daily_progress[today] = {
                    attempted: 0,
                    correct: 0,
                    accuracy: 0
                };
            }
            
            stats.categories[currentCategory].daily_progress[today].attempted += 1;
            if (isCorrect) {
                stats.categories[currentCategory].daily_progress[today].correct += 1;
            }
            
            stats.categories[currentCategory].daily_progress[today].accuracy = 
                stats.categories[currentCategory].daily_progress[today].attempted > 0 
                    ? Math.round((stats.categories[currentCategory].daily_progress[today].correct / 
                                  stats.categories[currentCategory].daily_progress[today].attempted) * 100) 
                    : 0;
            
            console.log(`📊 ${currentCategory} 카테고리 통계 업데이트: ${stats.categories[currentCategory].solved}문제, 정답률 ${stats.categories[currentCategory].accuracy}%`);
        }
        
        // 일별 진행상황 업데이트
        if (!stats.daily_progress[today]) {
            stats.daily_progress[today] = {
                attempted: 0,
                correct: 0,
                time: 0,
                accuracy: 0
            };
        }
        
        stats.daily_progress[today].attempted += 1;
        if (isCorrect) {
            stats.daily_progress[today].correct += 1;
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
        
        // 화면 업데이트
        updateStatisticsDisplay(stats);
        
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
            const categoryProgressData = localStorage.getItem('aicu_category_progress') || '{}';
            const categoryProgress = JSON.parse(categoryProgressData);
            
            categoryProgress[currentCategory] = {
                currentQuestionIndex: currentQuestionIndex,
                lastUpdated: new Date().toISOString()
            };
            
            localStorage.setItem('aicu_category_progress', JSON.stringify(categoryProgress));
            log(`💾 ${currentCategory} 카테고리 진행상황 저장: ${currentQuestionIndex + 1}번 문제`);
        }
    } catch (error) {
        log(`❌ 진행상황 저장 실패: ${error.message}`);
    }
}

// 진행상황 복원
function restoreProgress() {
    try {
        if (isCategoryMode && currentCategory) {
            // 카테고리별 진행상황 복원
            const categoryProgressData = localStorage.getItem('aicu_category_progress');
            if (categoryProgressData) {
                const categoryProgress = JSON.parse(categoryProgressData);
                if (categoryProgress[currentCategory]) {
                    currentQuestionIndex = categoryProgress[currentCategory].currentQuestionIndex || 0;
                    log(`🔄 ${currentCategory} 카테고리 진행상황 복원: ${currentQuestionIndex + 1}번 문제`);
                    return;
                }
            }
        }
        
        // 일반 진행상황 복원
        const progressData = localStorage.getItem('aicu_quiz_progress');
        if (progressData) {
            const progress = JSON.parse(progressData);
            currentQuestionIndex = progress.currentQuestionIndex || 0;
            log(`🔄 진행상황 복원: ${currentQuestionIndex + 1}번 문제`);
        } else {
            log('🔄 저장된 진행상황 없음, 1번 문제부터 시작');
        }
    } catch (error) {
        log(`❌ 진행상황 복원 실패: ${error.message}`);
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

// 정답 확인
function checkAnswer() {
    if (questionsData && questionsData.length > 0 && currentQuestionIndex < questionsData.length) {
        if (selectedAnswer === null) {
            alert('답안을 먼저 선택해주세요!');
            return;
        }
        
        const currentQuestion = questionsData[currentQuestionIndex];
        const isCorrect = selectedAnswer === currentQuestion.answer;
        
        console.log('=== 기본학습 정답 확인 ===');
        console.log('문제:', currentQuestion.qcode, '사용자 답안:', selectedAnswer, '정답:', currentQuestion.answer, '정답여부:', isCorrect);
        
        // 중앙 데이터 관리자로 결과 전송
        if (window.CentralDataManager && typeof window.CentralDataManager.recordQuizResult === 'function') {
            window.CentralDataManager.recordQuizResult(
                currentQuestion.qcode || `basic_${currentQuestionIndex}`,
                'basic_learning',
                isCorrect,
                selectedAnswer,
                currentQuestion.answer
            );
            console.log('✅ 기본학습 중앙 데이터 업데이트 완료');
        } else {
            console.warn('⚠️ CentralDataManager를 찾을 수 없습니다.');
        }
        
        // 기본학습 상태 저장
        saveBasicLearningState(currentQuestionIndex, isCorrect);
        
        // 새로운 통계 업데이트 함수 호출 (기존 호환성 유지)
        updateStatistics(currentQuestion, selectedAnswer, isCorrect);
        
        showCorrectAnswer(currentQuestion.answer);
        
        // 정답 확인 시 진행상황 저장
        saveProgress();
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

// 전역 함수로 노출
window.nextQuestion = nextQuestion;
window.previousQuestion = previousQuestion;
window.checkAnswer = checkAnswer;
window.selectAnswer = selectAnswer;
window.displayQuestion = displayQuestion;

// 페이지 로드 시 초기화 (문제 자동 표시하지 않음)
document.addEventListener('DOMContentLoaded', async function() {
    log('🚀 기본학습 시스템 시작');
    
    // 카테고리 모드 초기화
    initializeCategoryMode();
    
    const success = await loadQuestions();
    
    if (success) {
        log('✅ 초기화 완료 - 문제 풀기 버튼을 클릭하세요!');
        
        // 저장된 진행상황 복원
        restoreProgress();
        
        // 새로운 통계 시스템으로 데이터 로드 및 표시
        loadAndDisplayStatistics();
        // 문제는 자동으로 표시하지 않고, 사용자가 "문제 풀기" 버튼을 클릭할 때 표시
    } else {
        log('❌ 초기화 실패');
    }
});

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

console.log('✅ 완전히 새로 작성된 기본학습 시스템 로드 완료');
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

// 정답 표시 함수 (중복 제거 후 정리)
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

            const categoryProgressData = localStorage.getItem('aicu_category_progress') || '{}';

            const categoryProgress = JSON.parse(categoryProgressData);

            

            categoryProgress[currentCategory] = {

                currentQuestionIndex: currentQuestionIndex,

                lastUpdated: new Date().toISOString()

            };

            

            localStorage.setItem('aicu_category_progress', JSON.stringify(categoryProgress));

            log(`💾 ${currentCategory} 카테고리 진행상황 저장: ${currentQuestionIndex + 1}번 문제`);

        }

    } catch (error) {

        log(`❌ 진행상황 저장 실패: ${error.message}`);

    }

}



// 진행상황 복원

function restoreProgress() {

    try {

        if (isCategoryMode && currentCategory) {

            // 카테고리별 진행상황 복원

            const categoryProgressData = localStorage.getItem('aicu_category_progress');

            if (categoryProgressData) {

                const categoryProgress = JSON.parse(categoryProgressData);

                if (categoryProgress[currentCategory]) {

                    currentQuestionIndex = categoryProgress[currentCategory].currentQuestionIndex || 0;

                    log(`🔄 ${currentCategory} 카테고리 진행상황 복원: ${currentQuestionIndex + 1}번 문제`);

                    return;

                }

            }

        }

        

        // 일반 진행상황 복원

        const progressData = localStorage.getItem('aicu_quiz_progress');

        if (progressData) {

            const progress = JSON.parse(progressData);

            currentQuestionIndex = progress.currentQuestionIndex || 0;

            log(`🔄 진행상황 복원: ${currentQuestionIndex + 1}번 문제`);

        } else {

            log('🔄 저장된 진행상황 없음, 1번 문제부터 시작');

        }

    } catch (error) {

        log(`❌ 진행상황 복원 실패: ${error.message}`);

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



// 정답 확인

function checkAnswer() {

    if (questionsData && questionsData.length > 0 && currentQuestionIndex < questionsData.length) {

        if (selectedAnswer === null) {

            alert('답안을 먼저 선택해주세요!');

            return;

        }

        

        const currentQuestion = questionsData[currentQuestionIndex];

        const isCorrect = selectedAnswer === currentQuestion.answer;

        

        // 새로운 통계 업데이트 함수 호출

        updateStatistics(currentQuestion, selectedAnswer, isCorrect);

        

        showCorrectAnswer(currentQuestion.answer);

        

        // 정답 확인 시 진행상황 저장

        saveProgress();

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

    

    // 카테고리 모드 초기화

    initializeCategoryMode();

    

    const success = await loadQuestions();

    

    if (success) {

        log('✅ 초기화 완료 - 문제 풀기 버튼을 클릭하세요!');

        

        // 저장된 진행상황 복원

        restoreProgress();

        

        // 새로운 통계 시스템으로 데이터 로드 및 표시

        loadAndDisplayStatistics();

        // 문제는 자동으로 표시하지 않고, 사용자가 "문제 풀기" 버튼을 클릭할 때 표시

    } else {

        log('❌ 초기화 실패');

    }

});



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



console.log('✅ 완전히 새로 작성된 기본학습 시스템 로드 완료');

// 페이지 로드 시 자동 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 기본학습 시스템 자동 초기화 시작');
    
    // 문제 데이터 로딩
    loadQuestions().then(() => {
        console.log('✅ 문제 데이터 로딩 완료');
        
        // 첫 번째 문제 표시
        if (questionsData && questionsData.length > 0) {
            console.log('📋 첫 번째 문제 표시');
            displayQuestion(0);
        } else {
            console.log('❌ 문제 데이터가 없습니다');
        }
    }).catch(error => {
        console.error('❌ 문제 데이터 로딩 실패:', error);
    });
});