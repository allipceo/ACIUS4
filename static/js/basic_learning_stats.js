// static/js/basic_learning_stats.js
// 통계 처리 및 사용자 데이터 관리 모듈

// 사용자 통계 로딩 함수
async function loadUserStatistics() {
    try {
        if (isFlaskMode && currentUser) {
            // Flask 서버에서 통계 로드
            const response = await fetch(`/user/api/users/${currentUser.userId}/statistics`);
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    userStatistics = result.statistics;
                    updateStatisticsDisplay();
                    return;
                }
            }
        }
        
        // 로컬 모드 또는 Flask 실패 시
        const localStats = localStorage.getItem(`aciu_stats_${currentUser?.userId || 'default'}`);
        if (localStats) {
            userStatistics = JSON.parse(localStats);
        } else {
            // 초기 통계 생성
            userStatistics = createInitialStatistics();
            localStorage.setItem(`aciu_stats_${currentUser?.userId || 'default'}`, JSON.stringify(userStatistics));
        }
        
        updateStatisticsDisplay();
    } catch (error) {
        console.error('통계 로드 실패:', error);
        // 기본 통계 생성
        userStatistics = createInitialStatistics();
    }
}

// 초기 통계 생성 함수
function createInitialStatistics() {
    return {
        userId: currentUser?.userId || 'default',
        registeredAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        
        // 기본학습 통계
        basicLearning: {
            cumulative: {
                totalAttempted: 0,
                totalCorrect: 0,
                totalWrong: 0,
                accuracy: 0.0
            },
            today: {
                date: new Date().toISOString().split('T')[0],
                todayAttempted: 0,
                todayCorrect: 0,
                todayWrong: 0,
                accuracy: 0.0
            },
            currentIndex: 0,
            mode: 'continue',
            streak: 0
        }
    };
}

// 통계 표시 업데이트 함수
function updateStatisticsDisplay() {
    if (!userStatistics) return;
    
    const basic = userStatistics.basicLearning;
    
    // 누적 현황 업데이트
    document.getElementById('cumulative-total').textContent = basic.cumulative.totalAttempted;
    document.getElementById('cumulative-correct').textContent = basic.cumulative.totalCorrect;
    document.getElementById('cumulative-accuracy').textContent = basic.cumulative.accuracy.toFixed(1);
    
    // 금일 현황 업데이트 (날짜 확인)
    const today = new Date().toISOString().split('T')[0];
    if (basic.today.date !== today) {
        // 날짜가 바뀐 경우 금일 통계 초기화
        basic.today = {
            date: today,
            todayAttempted: 0,
            todayCorrect: 0,
            todayWrong: 0,
            accuracy: 0.0
        };
    }
    
    document.getElementById('today-total').textContent = basic.today.todayAttempted;
    document.getElementById('today-correct').textContent = basic.today.todayCorrect;
    document.getElementById('today-accuracy').textContent = basic.today.accuracy.toFixed(1);
    
    // 상세 통계 업데이트
    document.getElementById('total-questions').textContent = currentQuestionData.length;
    document.getElementById('correct-answers').textContent = basic.cumulative.totalCorrect;
    document.getElementById('wrong-answers').textContent = basic.cumulative.totalWrong;
    document.getElementById('current-streak').textContent = basic.streak || 0;
}

// 통계 초기화 함수
function resetStatistics() {
    if (currentUser) {
        userStatistics = createInitialStatistics();
        localStorage.setItem(`aciu_stats_${currentUser.userId}`, JSON.stringify(userStatistics));
        updateStatisticsDisplay();
        console.log('통계 초기화 완료');
    }
}

// 진도율 계산 함수
function calculateProgress() {
    if (!currentQuestionData || currentQuestionData.length === 0) return 0;
    return (currentQuestionIndex / currentQuestionData.length) * 100;
}

// 정답률 계산 함수
function calculateAccuracy(correct, total) {
    return total > 0 ? (correct / total) * 100 : 0;
}

// 현재 사용자 로딩 함수
async function loadCurrentUser() {
    try {
        if (isFlaskMode) {
            // Flask 서버에서 현재 사용자 정보 로드
            const response = await fetch('/user/api/users/current');
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    currentUser = result.userData;
                    await loadUserStatistics();
                    basicLearningSystem.updateStatus(`환영합니다, ${currentUser.userName}님!`);
                    return;
                }
            }
        }
        
        // 로컬 모드 또는 Flask 실패 시
        const localUser = localStorage.getItem('aciu_current_user');
        if (localUser) {
            currentUser = JSON.parse(localUser);
            await loadUserStatistics();
            basicLearningSystem.updateStatus(`환영합니다, ${currentUser.userName}님! (로컬 모드)`);
        } else {
            // 기본 사용자 생성
            currentUser = {
                userId: 'default_user',
                userName: '기본 사용자',
                email: 'default@example.com'
            };
            await loadUserStatistics();
            basicLearningSystem.updateStatus('기본 사용자로 로그인되었습니다.');
        }
    } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
        // 기본 사용자로 설정
        currentUser = {
            userId: 'default_user',
            userName: '기본 사용자',
            email: 'default@example.com'
        };
        await loadUserStatistics();
        basicLearningSystem.updateStatus('기본 사용자로 로그인되었습니다.');
    }
}

// 전역 함수로 노출
window.loadUserStatistics = loadUserStatistics;
window.updateStatisticsDisplay = updateStatisticsDisplay;
window.resetStatistics = resetStatistics;
window.loadCurrentUser = loadCurrentUser;

console.log('✅ 기본학습 통계 모듈 로드 완료');
