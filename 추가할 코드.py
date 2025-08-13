// ===== Week2 API 연결 추가 코드 =====
        
        // API 기본 설정
        const API_BASE = '/api/quiz';
        let currentAPISession = null;
        
        // Week2 API 연결 시도 함수
        async function connectToWeek2API() {
            try {
                console.log('🔗 Week2 API 연결 시도...');
                
                const response = await fetch(`${API_BASE}/health`);
                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ Week2 API 연결 성공:', data);
                    return true;
                } else {
                    console.log('⚠️ Week2 API 응답 오류:', response.status);
                    return false;
                }
            } catch (error) {
                console.log('⚠️ Week2 API 연결 실패, 기존 방식 사용:', error.message);
                return false;
            }
        }
        
        // Week2 API로 퀴즈 세션 시작
        async function startWeek2QuizSession(mode, category = 'all') {
            try {
                const response = await fetch(`${API_BASE}/start`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: currentUser?.userId || 'user_' + Date.now(),
                        mode: mode,
                        category: category
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                currentAPISession = data.session_id;
                console.log('✅ Week2 세션 생성 성공:', currentAPISession);
                return currentAPISession;
                
            } catch (error) {
                console.log('❌ Week2 세션 생성 실패:', error);
                return null;
            }
        }
        
        // Week2 API로 문제 조회
        async function loadQuestionFromAPI(sessionId, questionIndex) {
            try {
                const response = await fetch(`${API_BASE}/question/${sessionId}/${questionIndex}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('✅ Week2 문제 로딩 성공:', data);
                return data;
                
            } catch (error) {
                console.log('❌ Week2 문제 로딩 실패:', error);
                return null;
            }
        }
        
        // Week2 API로 답안 제출
        async function submitAnswerToAPI(sessionId, questionIndex, answer) {
            try {
                const response = await fetch(`${API_BASE}/submit`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        session_id: sessionId,
                        question_index: questionIndex,
                        answer: answer,
                        user_id: currentUser?.userId || 'user_' + Date.now()
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('✅ Week2 답안 제출 성공:', result);
                return result;
                
            } catch (error) {
                console.log('❌ Week2 답안 제출 실패:', error);
                return null;
            }
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
                
                // 기존 CSV 로드 코드 실행 (원본 유지)
                const response = await fetch('ins_master_db.csv');
                const csvText = await response.text();
                
                Papa.parse(csvText, {
                    header: true,
                    complete: (results) => {
                        console.log(`CSV 데이터 로드 완료: ${results.data.length}개 문제`);
                        
                        const filteredData = results.data.filter(row =>
                            row.QCODE && row.QUESTION && row.ANSWER && row.QCODE.trim() !== ''
                        );
                        
                        console.log(`필터링 후 문제 수: ${filteredData.length}개`);
                        
                        if (mode === 'random') {
                            currentQuestionData = filteredData.sort(() => Math.random() - 0.5);
                            currentQuestionIndex = 0;
                        } else if (mode === 'restart') {
                            currentQuestionData = [...filteredData];
                            currentQuestionIndex = 0;
                        } else if (mode === 'continue') {
                            currentQuestionData = [...filteredData];
                            if (userStatistics && userStatistics.basicLearning) {
                                currentQuestionIndex = userStatistics.basicLearning.currentIndex || 0;
                            } else {
                                currentQuestionIndex = 0;
                            }
                        }
                        
                        displayQuestion();
                        basicLearningSystem.updateStatisticsDisplay();
                        basicLearningSystem.updateStatus('CSV 모드로 학습을 시작합니다.', 'blue');
                    },
                    error: (error) => {
                        console.error('CSV 로드 오류:', error);
                        basicLearningSystem.updateStatus('데이터 로드 중 오류가 발생했습니다.', 'red');
                    }
                });
                
            } catch (error) {
                console.error('데이터 로드 실패:', error);
                basicLearningSystem.updateStatus('데이터 로드 실패. 네트워크를 확인해주세요.', 'red');
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
        
        // 개선된 정답 확인 함수 (API/CSV 모드 모두 지원)
        async function checkAnswerImproved() {
            if (!selectedAnswer) {
                alert('답안을 선택해주세요.');
                return;
            }
            
            if (isAnswerChecked) {
                nextQuestionImproved();
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
                // CSV 모드: 기존 방식
                const question = currentQuestionData[currentQuestionIndex];
                correctAnswer = question.ANSWER;
                isCorrect = selectedAnswer === correctAnswer;
            }
            
            // 결과 표시 (기존 로직 유지)
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
            
            console.log(`정답 확인 (${window.useAPIMode ? 'API' : 'CSV'} 모드): ${isCorrect ? '정답' : '오답'}`);
        }
        
        // 개선된 다음 문제 함수
        async function nextQuestionImproved() {
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
                // CSV 모드: 기존 방식
                if (currentQuestionIndex >= currentQuestionData.length - 1) {
                    basicLearningSystem.updateStatus('🎉 모든 문제를 완료했습니다!', 'green');
                    return;
                }
                
                currentQuestionIndex++;
                displayQuestion();
            }
        }
        
        // 기존 함수들을 개선된 버전으로 연결
        window.checkAnswer = checkAnswerImproved;
        window.nextQuestion = nextQuestionImproved;
        
        console.log('✅ Week2 API 연결 코드 추가 완료');