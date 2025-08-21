/**
 * CentralDataManager - 중앙 데이터 관리자
 * 모든 문제 풀이 데이터를 중앙에서 관리하고 실시간 동기화를 담당
 */

class CentralDataManager {
    constructor() {
        this.isInitialized = false;
        this.eventListeners = new Map();
        this.initialize();
    }

    /**
     * 초기화
     */
    initialize() {
        console.log('=== 중앙 데이터 관리자 초기화 ===');
        
        // 기존 카운터 시스템 비활성화
        this.disableLegacyCounters();
        
        // 새로운 시스템 초기화
        this.initializeNewSystem();
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
        
        // 전역 함수 노출
        this.exposeGlobalFunctions();
        
        console.log('✅ 중앙 데이터 관리자 초기화 완료');
    }

    /**
     * 데이터 구조 확인 및 초기화
     */
    ensureDataStructure() {
        // 기존 통계 데이터 확인
        let categoryStats = localStorage.getItem('aicu_category_statistics');
        if (!categoryStats) {
            console.log('⚠️ aicu_category_statistics가 없어 초기화합니다.');
            this.initializeCategoryStatistics();
        }

        // 실시간 데이터 구조 확인
        let realTimeData = localStorage.getItem('aicu_real_time_data');
        if (!realTimeData) {
            console.log('⚠️ aicu_real_time_data가 없어 초기화합니다.');
            this.initializeRealTimeData();
        }

        // 문제 풀이 결과 데이터 확인
        let quizResults = localStorage.getItem('aicu_quiz_results');
        if (!quizResults) {
            console.log('⚠️ aicu_quiz_results가 없어 초기화합니다.');
            this.initializeQuizResults();
        }
    }

    /**
     * 카테고리별 통계 초기화
     */
    initializeCategoryStatistics() {
        const categoryStats = {
            categories: {
                "06재산보험": {
                    total_questions: 169,
                    solved: 0,
                    correct: 0,
                    accuracy: 0,
                    current_question_index: 0,
                    daily_progress: {}
                },
                "07특종보험": {
                    total_questions: 182,
                    solved: 0,
                    correct: 0,
                    accuracy: 0,
                    current_question_index: 0,
                    daily_progress: {}
                },
                "08배상책임보험": {
                    total_questions: 268,
                    solved: 0,
                    correct: 0,
                    accuracy: 0,
                    current_question_index: 0,
                    daily_progress: {}
                },
                "09해상보험": {
                    total_questions: 170,
                    solved: 0,
                    correct: 0,
                    accuracy: 0,
                    current_question_index: 0,
                    daily_progress: {}
                }
            },
            last_updated: new Date().toISOString()
        };

        localStorage.setItem('aicu_category_statistics', JSON.stringify(categoryStats));
        console.log('✅ 카테고리별 통계 초기화 완료');
    }

    /**
     * 실시간 데이터 초기화
     */
    initializeRealTimeData() {
        const realTimeData = {
            total_attempts: 0,
            total_correct: 0,
            overall_accuracy: 0,
            today_attempts: 0,
            today_correct: 0,
            today_accuracy: 0,
            last_updated: new Date().toISOString(),
            session_start: new Date().toISOString(),
            // 시뮬레이션을 위한 시간대별 데이터 구조 추가
            time_based_sessions: {
                // 날짜별 시간대별 세션 기록
                // 예: "2025-01-15": { "10:00": {...}, "13:00": {...} }
            },
            current_session: {
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                session_id: this.generateSessionId()
            },
            // Continue Learning을 위한 시간대별 마지막 문제 번호
            last_question_per_session: {
                // 카테고리별 마지막 문제 번호 기록
                // 예: "06재산보험": { "2025-01-15_10:00": 20, "2025-01-15_13:00": 40 }
            }
        };

        localStorage.setItem('aicu_real_time_data', JSON.stringify(realTimeData));
        console.log('✅ 실시간 데이터 초기화 완료 (시간대별 구조 포함)');
    }

    /**
     * 세션 ID 생성 (시간대별 구분용)
     */
    generateSessionId() {
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        return `${date}_${time}`;
    }

    /**
     * 시간대별 세션 시작
     */
    startTimeBasedSession() {
        const realTimeData = JSON.parse(localStorage.getItem('aicu_real_time_data'));
        const currentDate = new Date().toISOString().split('T')[0];
        const currentTime = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        const sessionId = this.generateSessionId();

        // 현재 세션 정보 업데이트
        realTimeData.current_session = {
            date: currentDate,
            time: currentTime,
            session_id: sessionId
        };

        // 시간대별 세션 초기화 (없는 경우)
        if (!realTimeData.time_based_sessions[currentDate]) {
            realTimeData.time_based_sessions[currentDate] = {};
        }

        if (!realTimeData.time_based_sessions[currentDate][currentTime]) {
            realTimeData.time_based_sessions[currentDate][currentTime] = {
                session_id: sessionId,
                start_time: new Date().toISOString(),
                basic_learning: { attempts: 0, correct: 0, accuracy: 0 },
                categories: {
                    "06재산보험": { attempts: 0, correct: 0, accuracy: 0, last_question: 0 },
                    "07특종보험": { attempts: 0, correct: 0, accuracy: 0, last_question: 0 },
                    "08배상책임보험": { attempts: 0, correct: 0, accuracy: 0, last_question: 0 },
                    "09해상보험": { attempts: 0, correct: 0, accuracy: 0, last_question: 0 }
                },
                total_attempts: 0,
                total_correct: 0,
                total_accuracy: 0
            };
        }

        localStorage.setItem('aicu_real_time_data', JSON.stringify(realTimeData));
        console.log(`✅ 시간대별 세션 시작: ${currentDate} ${currentTime}`);
    }

    /**
     * 시간대별 문제 풀이 결과 저장
     */
    saveTimeBasedQuizResult(quizData) {
        const realTimeData = JSON.parse(localStorage.getItem('aicu_real_time_data'));
        const currentDate = realTimeData.current_session.date;
        const currentTime = realTimeData.current_session.time;
        const mappedCategory = this.mapCategoryToSystemName(quizData.category);

        // 시간대별 세션에 결과 저장
        if (realTimeData.time_based_sessions[currentDate] && 
            realTimeData.time_based_sessions[currentDate][currentTime]) {
            
            const session = realTimeData.time_based_sessions[currentDate][currentTime];
            
            // 기본학습 또는 카테고리별 학습 구분
            if (quizData.category === 'basic_learning' || !mappedCategory) {
                session.basic_learning.attempts += 1;
                if (quizData.isCorrect) {
                    session.basic_learning.correct += 1;
                }
                session.basic_learning.accuracy = session.basic_learning.attempts > 0 ? 
                    (session.basic_learning.correct / session.basic_learning.attempts) * 100 : 0;
            } else {
                // 카테고리별 학습
                if (session.categories[mappedCategory]) {
                    session.categories[mappedCategory].attempts += 1;
                    if (quizData.isCorrect) {
                        session.categories[mappedCategory].correct += 1;
                    }
                    session.categories[mappedCategory].accuracy = session.categories[mappedCategory].attempts > 0 ? 
                        (session.categories[mappedCategory].correct / session.categories[mappedCategory].attempts) * 100 : 0;
                    
                    // 마지막 문제 번호 업데이트
                    session.categories[mappedCategory].last_question = quizData.questionId || 
                        session.categories[mappedCategory].last_question + 1;
                }
            }

            // 전체 통계 업데이트
            session.total_attempts += 1;
            if (quizData.isCorrect) {
                session.total_correct += 1;
            }
            session.total_accuracy = session.total_attempts > 0 ? 
                (session.total_correct / session.total_attempts) * 100 : 0;

            // Continue Learning을 위한 마지막 문제 번호 저장
            const sessionKey = `${currentDate}_${currentTime}`;
            if (!realTimeData.last_question_per_session[mappedCategory]) {
                realTimeData.last_question_per_session[mappedCategory] = {};
            }
            realTimeData.last_question_per_session[mappedCategory][sessionKey] = 
                session.categories[mappedCategory]?.last_question || 0;
        }

        localStorage.setItem('aicu_real_time_data', JSON.stringify(realTimeData));
        console.log(`✅ 시간대별 문제 풀이 결과 저장: ${currentDate} ${currentTime} - ${quizData.category}`);
    }

    /**
     * Continue Learning을 위한 마지막 문제 번호 조회
     */
    getLastQuestionForContinueLearning(category, targetDate = null, targetTime = null) {
        const realTimeData = JSON.parse(localStorage.getItem('aicu_real_time_data'));
        const mappedCategory = this.mapCategoryToSystemName(category);
        
        if (!targetDate || !targetTime) {
            // 가장 최근 세션의 마지막 문제 번호 반환
            const categorySessions = realTimeData.last_question_per_session[mappedCategory] || {};
            const sessionKeys = Object.keys(categorySessions);
            
            if (sessionKeys.length > 0) {
                // 가장 최근 세션 키 찾기
                const latestSessionKey = sessionKeys.sort().pop();
                return categorySessions[latestSessionKey] || 0;
            }
            return 0;
        } else {
            // 특정 날짜/시간의 마지막 문제 번호 반환
            const sessionKey = `${targetDate}_${targetTime}`;
            return realTimeData.last_question_per_session[mappedCategory]?.[sessionKey] || 0;
        }
    }

    /**
     * 날짜별 시간대별 통계 조회
     */
    getTimeBasedStatistics(targetDate = null) {
        const realTimeData = JSON.parse(localStorage.getItem('aicu_real_time_data'));
        
        if (!targetDate) {
            targetDate = new Date().toISOString().split('T')[0];
        }

        const daySessions = realTimeData.time_based_sessions[targetDate] || {};
        
        // 해당 날짜의 모든 시간대별 세션 통계
        const timeBasedStats = {};
        let dayTotal = { attempts: 0, correct: 0, accuracy: 0 };

        Object.keys(daySessions).forEach(time => {
            const session = daySessions[time];
            timeBasedStats[time] = {
                basic_learning: session.basic_learning,
                categories: session.categories,
                total: {
                    attempts: session.total_attempts,
                    correct: session.total_correct,
                    accuracy: session.total_accuracy
                }
            };

            // 날짜별 총계 누적
            dayTotal.attempts += session.total_attempts;
            dayTotal.correct += session.total_correct;
        });

        dayTotal.accuracy = dayTotal.attempts > 0 ? (dayTotal.correct / dayTotal.attempts) * 100 : 0;

        return {
            date: targetDate,
            time_based_sessions: timeBasedStats,
            day_total: dayTotal
        };
    }

    /**
     * 시뮬레이션을 위한 시간대별 세션 설정
     */
    setSimulationTime(date, time) {
        const realTimeData = JSON.parse(localStorage.getItem('aicu_real_time_data'));
        
        realTimeData.current_session = {
            date: date,
            time: time,
            session_id: `${date}_${time}`
        };

        // 해당 시간대 세션이 없으면 초기화
        if (!realTimeData.time_based_sessions[date]) {
            realTimeData.time_based_sessions[date] = {};
        }

        if (!realTimeData.time_based_sessions[date][time]) {
            realTimeData.time_based_sessions[date][time] = {
                session_id: `${date}_${time}`,
                start_time: new Date().toISOString(),
                basic_learning: { attempts: 0, correct: 0, accuracy: 0 },
                categories: {
                    "06재산보험": { attempts: 0, correct: 0, accuracy: 0, last_question: 0 },
                    "07특종보험": { attempts: 0, correct: 0, accuracy: 0, last_question: 0 },
                    "08배상책임보험": { attempts: 0, correct: 0, accuracy: 0, last_question: 0 },
                    "09해상보험": { attempts: 0, correct: 0, accuracy: 0, last_question: 0 }
                },
                total_attempts: 0,
                total_correct: 0,
                total_accuracy: 0
            };
        }

        localStorage.setItem('aicu_real_time_data', JSON.stringify(realTimeData));
        console.log(`✅ 시뮬레이션 시간 설정: ${date} ${time}`);
    }

    /**
     * 시뮬레이션을 위한 일괄 문제 풀이 결과 저장
     */
    simulateBatchQuizResults(date, time, quizResults) {
        console.log(`=== 시뮬레이션 일괄 문제 풀이: ${date} ${time} ===`);
        
        // 시뮬레이션 시간 설정
        this.setSimulationTime(date, time);
        
        // 각 문제 풀이 결과를 순차적으로 처리
        quizResults.forEach((result, index) => {
            const quizData = {
                questionId: result.questionId || (index + 1),
                category: result.category,
                isCorrect: result.isCorrect,
                userAnswer: result.userAnswer || 'A',
                correctAnswer: result.correctAnswer || 'A',
                timestamp: new Date().toISOString()
            };
            
            // 시간대별 데이터 저장
            this.saveTimeBasedQuizResult(quizData);
            
            // 기존 통계 업데이트도 함께 수행
            this.saveQuizResult(quizData);
            this.updateCategoryStatistics(quizData);
            this.updateRealTimeData(quizData);
        });
        
        // 최종 통계 업데이트
        this.recalculatePredictedScores();
        this.broadcastDataUpdate();
        
        console.log(`✅ 시뮬레이션 일괄 문제 풀이 완료: ${quizResults.length}문제`);
    }

    /**
     * 시뮬레이션 결과 검증
     */
    validateSimulationResults(expectedResults) {
        console.log('=== 시뮬레이션 결과 검증 ===');
        
        const realTimeData = JSON.parse(localStorage.getItem('aicu_real_time_data'));
        const validationResults = {
            success: true,
            details: []
        };

        Object.keys(expectedResults).forEach(date => {
            const dayResults = expectedResults[date];
            const daySessions = realTimeData.time_based_sessions[date] || {};
            
            Object.keys(dayResults).forEach(time => {
                const expected = dayResults[time];
                const actual = daySessions[time];
                
                if (!actual) {
                    validationResults.success = false;
                    validationResults.details.push({
                        date, time, status: 'FAIL', reason: '세션 데이터 없음'
                    });
                    return;
                }

                // 기본학습 검증
                if (expected.basic_learning) {
                    const basicMatch = actual.basic_learning.attempts === expected.basic_learning.attempts &&
                                     actual.basic_learning.correct === expected.basic_learning.correct;
                    
                    if (!basicMatch) {
                        validationResults.success = false;
                        validationResults.details.push({
                            date, time, status: 'FAIL', 
                            reason: `기본학습 불일치: 예상(${expected.basic_learning.attempts}/${expected.basic_learning.correct}) vs 실제(${actual.basic_learning.attempts}/${actual.basic_learning.correct})`
                        });
                    } else {
                        validationResults.details.push({
                            date, time, status: 'PASS', 
                            reason: `기본학습 일치: ${actual.basic_learning.attempts}/${actual.basic_learning.correct}`
                        });
                    }
                }

                // 카테고리별 검증
                Object.keys(expected.categories || {}).forEach(category => {
                    const expectedCat = expected.categories[category];
                    const actualCat = actual.categories[category];
                    
                    if (!actualCat) {
                        validationResults.success = false;
                        validationResults.details.push({
                            date, time, category, status: 'FAIL', reason: '카테고리 데이터 없음'
                        });
                        return;
                    }

                    const catMatch = actualCat.attempts === expectedCat.attempts &&
                                   actualCat.correct === expectedCat.correct;
                    
                    if (!catMatch) {
                        validationResults.success = false;
                        validationResults.details.push({
                            date, time, category, status: 'FAIL',
                            reason: `카테고리 불일치: 예상(${expectedCat.attempts}/${expectedCat.correct}) vs 실제(${actualCat.attempts}/${actualCat.correct})`
                        });
                    } else {
                        validationResults.details.push({
                            date, time, category, status: 'PASS',
                            reason: `카테고리 일치: ${actualCat.attempts}/${actualCat.correct}`
                        });
                    }
                });
            });
        });

        console.log('✅ 시뮬레이션 결과 검증 완료:', validationResults);
        return validationResults;
    }

    /**
     * 시뮬레이션 전제조건 검증
     */
    validateSimulationPrerequisites() {
        console.log('=== 시뮬레이션 전제조건 검증 ===');
        
        const registrationCompleted = localStorage.getItem('aicu_registration_completed');
        const registrationTimestamp = localStorage.getItem('aicu_registration_timestamp');
        const userData = localStorage.getItem('aicu_user_data');
        
        console.log('📋 전제조건 확인:');
        console.log('  - 등록 완료 플래그:', registrationCompleted ? '✅ 있음' : '❌ 없음');
        console.log('  - 등록 시점:', registrationTimestamp || '❌ 없음');
        console.log('  - 사용자 데이터:', userData ? '✅ 있음' : '❌ 없음');
        
        if (!registrationCompleted || !registrationTimestamp || !userData) {
            const error = '게스트 등록이 완료되지 않았습니다. 먼저 등록을 완료해주세요.';
            console.error('❌ 시뮬레이션 전제조건 실패:', error);
            throw new Error(error);
        }
        
        const registration = JSON.parse(registrationCompleted);
        const user = JSON.parse(userData);
        
        console.log('✅ 시뮬레이션 전제조건 확인 완료:');
        console.log('  - 사용자:', user.name);
        console.log('  - 등록 타입:', registration.type);
        console.log('  - 등록 시점:', registrationTimestamp);
        console.log('  - 등록일:', registration.registration_date);
        
        return {
            user: user,
            registration: registration,
            registrationTimestamp: registrationTimestamp
        };
    }

    /**
     * 시뮬레이션 데이터 초기화
     */
    resetSimulationData() {
        console.log('=== 시뮬레이션 데이터 초기화 ===');
        
        const realTimeData = JSON.parse(localStorage.getItem('aicu_real_time_data'));
        
        // 시간대별 세션 데이터 초기화
        realTimeData.time_based_sessions = {};
        realTimeData.last_question_per_session = {};
        realTimeData.current_session = {
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            session_id: this.generateSessionId()
        };

        localStorage.setItem('aicu_real_time_data', JSON.stringify(realTimeData));
        console.log('✅ 시뮬레이션 데이터 초기화 완료');
    }

    /**
     * 문제 풀이 결과 데이터 초기화
     */
    initializeQuizResults() {
        const quizResults = {
            results: [],
            total_count: 0,
            last_updated: new Date().toISOString()
        };

        localStorage.setItem('aicu_quiz_results', JSON.stringify(quizResults));
        console.log('✅ 문제 풀이 결과 데이터 초기화 완료');
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 문제 풀이 완료 이벤트 리스너
        document.addEventListener('quizCompleted', (event) => {
            this.handleQuizCompleted(event.detail);
        });

        // 데이터 동기화 요청 이벤트 리스너
        document.addEventListener('syncDataRequested', (event) => {
            this.syncData();
        });

        console.log('✅ 이벤트 리스너 설정 완료');
    }

    /**
     * 문제 풀이 완료 처리
     */
    handleQuizCompleted(quizData) {
        console.log('=== 문제 풀이 완료 처리 ===', quizData);
        
        try {
            // 1. 문제 풀이 결과 저장
            this.saveQuizResult(quizData);
            
            // 2. 카테고리별 통계 업데이트
            this.updateCategoryStatistics(quizData);
            
            // 3. 실시간 데이터 업데이트
            this.updateRealTimeData(quizData);
            
            // 4. 시간대별 데이터 저장 (시뮬레이션 지원)
            this.saveTimeBasedQuizResult(quizData);
            
            // 5. 예상 점수 재계산
            this.recalculatePredictedScores();
            
            // 6. 이벤트 브로드캐스트
            this.broadcastDataUpdate();
            
            console.log('✅ 문제 풀이 완료 처리 완료 (시간대별 데이터 포함)');
            
        } catch (error) {
            console.error('❌ 문제 풀이 완료 처리 실패:', error);
        }
    }

    /**
     * 문제 풀이 결과 저장
     */
    saveQuizResult(quizData) {
        const quizResults = JSON.parse(localStorage.getItem('aicu_quiz_results') || '{"results": [], "total_count": 0}');
        
        const result = {
            questionId: quizData.questionId,
            category: quizData.category,
            isCorrect: quizData.isCorrect,
            userAnswer: quizData.userAnswer,
            correctAnswer: quizData.correctAnswer,
            timestamp: new Date().toISOString(),
            sessionId: this.getSessionId()
        };

        quizResults.results.push(result);
        quizResults.total_count = quizResults.results.length;
        quizResults.last_updated = new Date().toISOString();

        localStorage.setItem('aicu_quiz_results', JSON.stringify(quizResults));
        console.log('✅ 문제 풀이 결과 저장 완료:', result);
    }

    /**
     * 카테고리별 통계 업데이트
     */
    updateCategoryStatistics(quizData) {
        const categoryStats = JSON.parse(localStorage.getItem('aicu_category_statistics'));
        const mappedCategory = this.mapCategoryToSystemName(quizData.category);

        if (categoryStats.categories[mappedCategory]) {
            const cat = categoryStats.categories[mappedCategory];
            cat.solved += 1;
            
            if (quizData.isCorrect) {
                cat.correct += 1;
            }
            
            cat.accuracy = cat.solved > 0 ? (cat.correct / cat.solved) * 100 : 0;
            
            // 오늘 진행상황 업데이트
            const today = new Date().toISOString().split('T')[0];
            if (!cat.daily_progress[today]) {
                cat.daily_progress[today] = { attempts: 0, correct: 0 };
            }
            cat.daily_progress[today].attempts += 1;
            if (quizData.isCorrect) {
                cat.daily_progress[today].correct += 1;
            }
        }

        categoryStats.last_updated = new Date().toISOString();
        localStorage.setItem('aicu_category_statistics', JSON.stringify(categoryStats));
        console.log('✅ 카테고리별 통계 업데이트 완료:', quizData.category, '→', mappedCategory);
    }

    /**
     * 카테고리명 매핑 (사용자 표시명 → 시스템 내부명)
     */
    mapCategoryToSystemName(categoryName) {
        const categoryMapping = {
            '재산보험': '06재산보험',
            '특종보험': '07특종보험',
            '배상책임보험': '08배상책임보험',
            '해상보험': '09해상보험',
            // 시스템 내부명도 그대로 지원
            '06재산보험': '06재산보험',
            '07특종보험': '07특종보험',
            '08배상책임보험': '08배상책임보험',
            '09해상보험': '09해상보험'
        };
        
        const mappedCategory = categoryMapping[categoryName];
        console.log(`중앙 시스템 카테고리 매핑: ${categoryName} → ${mappedCategory || 'unknown'}`);
        return mappedCategory || categoryName;
    }

    /**
     * 실시간 데이터 업데이트
     */
    updateRealTimeData(quizData) {
        const realTimeData = JSON.parse(localStorage.getItem('aicu_real_time_data'));
        const mappedCategory = this.mapCategoryToSystemName(quizData.category);
        
        realTimeData.total_attempts += 1;
        if (quizData.isCorrect) {
            realTimeData.total_correct += 1;
        }
        
        realTimeData.overall_accuracy = realTimeData.total_attempts > 0 ? 
            (realTimeData.total_correct / realTimeData.total_attempts) * 100 : 0;

        // 카테고리별 데이터 업데이트
        if (!realTimeData.categories) {
            realTimeData.categories = {
                '06재산보험': { total: 0, correct: 0, incorrect: 0, accuracy: 0.0 },
                '07특종보험': { total: 0, correct: 0, incorrect: 0, accuracy: 0.0 },
                '08배상책임보험': { total: 0, correct: 0, incorrect: 0, accuracy: 0.0 },
                '09해상보험': { total: 0, correct: 0, incorrect: 0, accuracy: 0.0 }
            };
        }

        if (realTimeData.categories[mappedCategory]) {
            realTimeData.categories[mappedCategory].total += 1;
            if (quizData.isCorrect) {
                realTimeData.categories[mappedCategory].correct += 1;
            } else {
                realTimeData.categories[mappedCategory].incorrect += 1;
            }
            
            const cat = realTimeData.categories[mappedCategory];
            cat.accuracy = cat.total > 0 ? Math.round((cat.correct / cat.total) * 1000) / 10 : 0;
        }

        // 오늘 데이터 업데이트
        const today = new Date().toISOString().split('T')[0];
        const sessionStart = new Date(realTimeData.session_start).toISOString().split('T')[0];
        
        if (today === sessionStart) {
            realTimeData.today_attempts += 1;
            if (quizData.isCorrect) {
                realTimeData.today_correct += 1;
            }
            realTimeData.today_accuracy = realTimeData.today_attempts > 0 ? 
                (realTimeData.today_correct / realTimeData.today_attempts) * 100 : 0;
        } else {
            // 새로운 날짜면 오늘 데이터 초기화
            realTimeData.today_attempts = 1;
            realTimeData.today_correct = quizData.isCorrect ? 1 : 0;
            realTimeData.today_accuracy = quizData.isCorrect ? 100 : 0;
            realTimeData.session_start = new Date().toISOString();
        }

        realTimeData.last_updated = new Date().toISOString();
        localStorage.setItem('aicu_real_time_data', JSON.stringify(realTimeData));
        console.log('✅ 실시간 데이터 업데이트 완료:', quizData.category, '→', mappedCategory);
    }

    /**
     * 예상 점수 재계산
     */
    recalculatePredictedScores() {
        // PredictedScoresManager가 있으면 재계산 요청
        if (window.PredictedScoresManager && typeof window.PredictedScoresManager.calculatePredictedScores === 'function') {
            window.PredictedScoresManager.calculatePredictedScores();
            console.log('✅ 예상 점수 재계산 완료');
        } else {
            console.log('⚠️ PredictedScoresManager를 찾을 수 없습니다.');
        }
    }

    /**
     * 데이터 업데이트 브로드캐스트
     */
    broadcastDataUpdate() {
        const event = new CustomEvent('dataUpdated', {
            detail: {
                timestamp: new Date().toISOString(),
                source: 'CentralDataManager'
            }
        });
        
        document.dispatchEvent(event);
        console.log('✅ 데이터 업데이트 브로드캐스트 완료');
    }

    /**
     * 데이터 동기화
     */
    syncData() {
        console.log('=== 데이터 동기화 시작 ===');
        
        // 모든 페이지에서 최신 데이터 로드
        this.ensureDataStructure();
        
        // 예상 점수 재계산
        this.recalculatePredictedScores();
        
        // UI 업데이트 이벤트 발생
        this.broadcastDataUpdate();
        
        console.log('✅ 데이터 동기화 완료');
    }

    /**
     * 세션 ID 생성
     */
    getSessionId() {
        let sessionId = sessionStorage.getItem('aicu_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('aicu_session_id', sessionId);
        }
        return sessionId;
    }

    /**
     * 문제 풀이 완료 이벤트 발생 (외부에서 호출)
     */
    recordQuizResult(questionId, category, isCorrect, userAnswer, correctAnswer) {
        const quizData = {
            questionId: questionId,
            category: category,
            isCorrect: isCorrect,
            userAnswer: userAnswer,
            correctAnswer: correctAnswer,
            timestamp: new Date().toISOString()
        };

        // 이벤트 발생
        const event = new CustomEvent('quizCompleted', {
            detail: quizData
        });
        
        document.dispatchEvent(event);
        console.log('✅ 문제 풀이 완료 이벤트 발생:', quizData);
    }

    /**
     * 현재 통계 데이터 조회
     */
    getCurrentStatistics() {
        return {
            categoryStats: JSON.parse(localStorage.getItem('aicu_category_statistics') || '{}'),
            realTimeData: JSON.parse(localStorage.getItem('aicu_real_time_data') || '{}'),
            quizResults: JSON.parse(localStorage.getItem('aicu_quiz_results') || '{}')
        };
    }

    /**
     * 퀴즈 결과 데이터 조회
     */
    getQuizResults() {
        console.log('=== 퀴즈 결과 데이터 조회 ===');
        
        try {
            const quizResults = JSON.parse(localStorage.getItem('aicu_quiz_results') || '[]');
            console.log('✅ 퀴즈 결과 데이터 조회 성공:', quizResults);
            return quizResults;
        } catch (error) {
            console.error('❌ 퀴즈 결과 데이터 조회 실패:', error);
            return [];
        }
    }

    /**
     * 디버그 정보 출력
     */
    debugInfo() {
        console.log('=== CentralDataManager 디버그 정보 ===');
        console.log('초기화 상태:', this.isInitialized);
        console.log('현재 통계:', this.getCurrentStatistics());
        console.log('세션 ID:', this.getSessionId());
    }

    // 기존 카운터 시스템 비활성화 및 새로운 시스템 활성화
    disableLegacyCounters() {
        console.log('=== 기존 카운터 시스템 비활성화 ===');
        
        // 기존 카운터 관련 키들 제거
        const legacyKeys = [
            'aicu_category_statistics',  // 기존 카테고리 통계
            'aicu_old_quiz_data',        // 기존 퀴즈 데이터
            'aicu_legacy_counters'       // 기존 카운터들
        ];
        
        legacyKeys.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                console.log(`✅ 기존 카운터 제거: ${key}`);
            }
        });
        
        // 새로운 시스템만 활성화
        this.initializeNewSystem();
        console.log('✅ 새로운 중앙 데이터 관리 시스템만 활성화 완료');
    }
    
    // 새로운 시스템 초기화
    initializeNewSystem() {
        console.log('=== 새로운 중앙 데이터 관리 시스템 초기화 ===');
        
        // 새로운 데이터 구조만 사용
        if (!localStorage.getItem('aicu_real_time_data')) {
            localStorage.setItem('aicu_real_time_data', JSON.stringify({
                categories: {
                    '06재산보험': { total: 0, correct: 0, incorrect: 0, accuracy: 0 },
                    '07특종보험': { total: 0, correct: 0, incorrect: 0, accuracy: 0 },
                    '08배상책임보험': { total: 0, correct: 0, incorrect: 0, accuracy: 0 },
                    '09해상보험': { total: 0, correct: 0, incorrect: 0, accuracy: 0 }
                },
                lastUpdated: new Date().toISOString()
            }));
        }
        
        if (!localStorage.getItem('aicu_quiz_results')) {
            localStorage.setItem('aicu_quiz_results', JSON.stringify([]));
        }
        
        console.log('✅ 새로운 데이터 구조 초기화 완료');
    }

    // 카테고리 데이터 조회 (기존 카운터 호환성용)
    getCategoryData(category) {
        console.log(`=== 카테고리 데이터 조회: ${category} ===`);
        
        try {
            const realTimeData = JSON.parse(localStorage.getItem('aicu_real_time_data') || '{}');
            const categoryData = realTimeData.categories?.[category];
            
            if (categoryData) {
                console.log(`✅ 카테고리 데이터 조회 성공:`, categoryData);
                return {
                    total: categoryData.total || 0,
                    correct: categoryData.correct || 0,
                    incorrect: categoryData.incorrect || 0,
                    accuracy: categoryData.accuracy || 0
                };
            } else {
                console.log(`⚠️ 카테고리 데이터 없음: ${category}, 기본값 반환`);
                return { total: 0, correct: 0, incorrect: 0, accuracy: 0 };
            }
        } catch (error) {
            console.error(`❌ 카테고리 데이터 조회 오류:`, error);
            return { total: 0, correct: 0, incorrect: 0, accuracy: 0 };
        }
    }
    
    // 모든 카테고리 데이터 조회
    getAllCategoryData() {
        console.log('=== 모든 카테고리 데이터 조회 ===');
        
        try {
            const realTimeData = JSON.parse(localStorage.getItem('aicu_real_time_data') || '{}');
            const categories = realTimeData.categories || {};
            
            console.log('✅ 모든 카테고리 데이터 조회 성공:', categories);
            return categories;
        } catch (error) {
            console.error('❌ 모든 카테고리 데이터 조회 오류:', error);
            return {};
        }
    }

    // 전역 함수 노출
    exposeGlobalFunctions() {
        window.recordQuizResult = function(questionId, category, isCorrect, userAnswer, correctAnswer) {
            window.CentralDataManager.recordQuizResult(questionId, category, isCorrect, userAnswer, correctAnswer);
        };
        console.log('✅ 전역 함수 노출 완료');
    }

    /**
     * 기본학습 상태 저장
     */
    saveBasicLearningState(category, questionIndex, isCorrect) {
        console.log('=== 기본학습 상태 저장 ===');
        
        try {
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
            if (isCorrect !== undefined) {
                realTimeData['basic_learning'].solved++;
                if (isCorrect) {
                    realTimeData['basic_learning'].correct++;
                }
                realTimeData['basic_learning'].accuracy = (realTimeData['basic_learning'].correct / realTimeData['basic_learning'].solved * 100).toFixed(1);
                
                // 일일 진행률 업데이트
                this.updateDailyProgress(realTimeData['basic_learning'], isCorrect);
            }
            
            localStorage.setItem('aicu_real_time_data', JSON.stringify(realTimeData));
            
            // 이벤트 발생
            this.triggerDataUpdate('basicLearningStateUpdated', {
                category: category,
                questionIndex: questionIndex,
                isCorrect: isCorrect
            });
            
            console.log('✅ 기본학습 상태 저장 완료');
            
        } catch (error) {
            console.error('❌ 기본학습 상태 저장 실패:', error);
        }
    }
    
    /**
     * 기본학습 상태 복원
     */
    getBasicLearningState(category) {
        console.log('=== 기본학습 상태 복원 ===');
        
        try {
            const realTimeData = JSON.parse(localStorage.getItem('aicu_real_time_data') || '{}');
            const basicLearningData = realTimeData['basic_learning'];
            
            if (!basicLearningData) {
                console.log('⚠️ 기본학습 데이터가 없습니다. 기본값 반환');
                return {
                    lastQuestionIndex: 0,
                    solved: 0,
                    correct: 0,
                    accuracy: 0
                };
            }
            
            const state = {
                lastQuestionIndex: basicLearningData.lastQuestionIndex || 0,
                solved: basicLearningData.solved || 0,
                correct: basicLearningData.correct || 0,
                accuracy: basicLearningData.accuracy || 0
            };
            
            console.log('✅ 기본학습 상태 복원 완료:', state);
            return state;
            
        } catch (error) {
            console.error('❌ 기본학습 상태 복원 실패:', error);
            return {
                lastQuestionIndex: 0,
                solved: 0,
                correct: 0,
                accuracy: 0
            };
        }
    }
    
    /**
     * 일일 진행률 업데이트 (기본학습용)
     */
    updateDailyProgress(basicLearningData, isCorrect) {
        const today = new Date().toISOString().split('T')[0];
        
        if (!basicLearningData.daily_progress[today]) {
            basicLearningData.daily_progress[today] = {
                solved: 0,
                correct: 0
            };
        }
        
        basicLearningData.daily_progress[today].solved++;
        if (isCorrect) {
            basicLearningData.daily_progress[today].correct++;
        }
        
        console.log(`✅ 일일 진행률 업데이트: ${today} - ${basicLearningData.daily_progress[today].solved}문제, ${basicLearningData.daily_progress[today].correct}정답`);
    }

    /**
     * 금일/누적 통계 조회
     * @param {string} category - 카테고리 (선택사항)
     * @returns {Object} 금일/누적 통계 데이터
     */
    getDailyCumulativeStats(category = null) {
        try {
            console.log('📊 금일/누적 통계 조회 시작');
            
            const today = new Date().toISOString().split('T')[0];
            const statsData = localStorage.getItem('aicu_statistics') || '{}';
            const stats = JSON.parse(statsData);
            
            if (category && stats.categories && stats.categories[category]) {
                // 카테고리별 통계
                const categoryStats = stats.categories[category];
                const dailyProgress = categoryStats.daily_progress?.[today] || { solved: 0, correct: 0 };
                
                return {
                    today: {
                        date: today,
                        questions_solved: dailyProgress.solved || 0,
                        correct_answers: dailyProgress.correct || 0,
                        accuracy_rate: dailyProgress.solved > 0 ? Math.round((dailyProgress.correct / dailyProgress.solved) * 100) : 0
                    },
                    cumulative: {
                        total_questions_solved: categoryStats.solved || 0,
                        total_correct_answers: categoryStats.correct || 0,
                        accuracy_rate: categoryStats.accuracy || 0
                    }
                };
            } else {
                // 전체 통계
                const dailyProgress = stats.daily_progress?.[today] || { attempted: 0, correct: 0 };
                
                return {
                    today: {
                        date: today,
                        questions_solved: dailyProgress.attempted || 0,
                        correct_answers: dailyProgress.correct || 0,
                        accuracy_rate: dailyProgress.attempted > 0 ? Math.round((dailyProgress.correct / dailyProgress.attempted) * 100) : 0
                    },
                    cumulative: {
                        total_questions_solved: stats.total_questions_attempted || 0,
                        total_correct_answers: stats.total_correct_answers || 0,
                        accuracy_rate: stats.accuracy_rate || 0
                    }
                };
            }
            
        } catch (error) {
            console.error('❌ 금일/누적 통계 조회 실패:', error);
            return {
                today: { date: new Date().toISOString().split('T')[0], questions_solved: 0, correct_answers: 0, accuracy_rate: 0 },
                cumulative: { total_questions_solved: 0, total_correct_answers: 0, accuracy_rate: 0 }
            };
        }
    }
    
    /**
     * 금일/누적 통계 업데이트
     * @param {Object} questionData - 문제 데이터
     * @param {boolean} isCorrect - 정답 여부
     * @param {string} category - 카테고리 (선택사항)
     * @returns {boolean} 업데이트 성공 여부
     */
    updateDailyCumulativeStats(questionData, isCorrect, category = null) {
        try {
            console.log('📊 금일/누적 통계 업데이트 시작');
            
            const today = new Date().toISOString().split('T')[0];
            const statsData = localStorage.getItem('aicu_statistics') || '{}';
            const stats = JSON.parse(statsData);
            
            if (category && stats.categories && stats.categories[category]) {
                // 카테고리별 통계 업데이트
                if (!stats.categories[category].daily_progress) {
                    stats.categories[category].daily_progress = {};
                }
                
                if (!stats.categories[category].daily_progress[today]) {
                    stats.categories[category].daily_progress[today] = {
                        solved: 0,
                        correct: 0,
                        accuracy: 0
                    };
                }
                
                const dailyStats = stats.categories[category].daily_progress[today];
                dailyStats.solved += 1;
                if (isCorrect) {
                    dailyStats.correct += 1;
                }
                dailyStats.accuracy = Math.round((dailyStats.correct / dailyStats.solved) * 100);
                
                // 누적 통계 업데이트
                stats.categories[category].solved += 1;
                if (isCorrect) {
                    stats.categories[category].correct += 1;
                }
                stats.categories[category].accuracy = Math.round((stats.categories[category].correct / stats.categories[category].solved) * 100);
                
                console.log(`📊 ${category} 카테고리 통계 업데이트: 금일 ${dailyStats.solved}문제, 누적 ${stats.categories[category].solved}문제`);
                
            } else {
                // 전체 통계 업데이트
                if (!stats.daily_progress) {
                    stats.daily_progress = {};
                }
                
                if (!stats.daily_progress[today]) {
                    stats.daily_progress[today] = {
                        attempted: 0,
                        correct: 0,
                        accuracy: 0
                    };
                }
                
                const dailyStats = stats.daily_progress[today];
                dailyStats.attempted += 1;
                if (isCorrect) {
                    dailyStats.correct += 1;
                }
                dailyStats.accuracy = Math.round((dailyStats.correct / dailyStats.attempted) * 100);
                
                // 누적 통계 업데이트
                stats.total_questions_attempted += 1;
                if (isCorrect) {
                    stats.total_correct_answers += 1;
                }
                stats.accuracy_rate = Math.round((stats.total_correct_answers / stats.total_questions_attempted) * 100);
                
                console.log(`📊 전체 통계 업데이트: 금일 ${dailyStats.attempted}문제, 누적 ${stats.total_questions_attempted}문제`);
            }
            
            stats.last_updated = new Date().toISOString();
            localStorage.setItem('aicu_statistics', JSON.stringify(stats));
            
            // 실시간 동기화
            this.triggerStatisticsUpdate(stats);
            
            return true;
            
        } catch (error) {
            console.error('❌ 금일/누적 통계 업데이트 실패:', error);
            return false;
        }
    }
    
    /**
     * 통계 업데이트 이벤트 발생
     * @param {Object} stats - 업데이트된 통계 데이터
     */
    triggerStatisticsUpdate(stats) {
        try {
            const event = new CustomEvent('statisticsUpdated', {
                detail: {
                    stats: stats,
                    timestamp: new Date().toISOString()
                }
            });
            document.dispatchEvent(event);
            console.log('✅ 통계 업데이트 이벤트 발생');
        } catch (error) {
            console.error('❌ 통계 업데이트 이벤트 발생 실패:', error);
        }
    }
}

// 전역 인스턴스 생성
window.CentralDataManager = new CentralDataManager();

// 전역 함수로 노출
window.recordQuizResult = function(questionId, category, isCorrect, userAnswer, correctAnswer) {
    window.CentralDataManager.recordQuizResult(questionId, category, isCorrect, userAnswer, correctAnswer);
};

console.log('🚀 CentralDataManager 로드 완료');
