// ===== ACIU S4 대분류 학습 시스템 - 통계 모듈 =====

// 대분류 학습 통계 업데이트 함수
function updateLargeCategoryStatistics(isCorrect) {
    if (!userStatistics) {
        userStatistics = createInitialLargeCategoryStatistics();
    }
    
    // 대분류 학습 통계 초기화 (없으면 생성)
    if (!userStatistics.largeCategory) {
        userStatistics.largeCategory = {
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
            categories: {
                '재산보험': { attempted: 0, correct: 0, accuracy: 0.0 },
                '특종보험': { attempted: 0, correct: 0, accuracy: 0.0 },
                '배상책임보험': { attempted: 0, correct: 0, accuracy: 0.0 },
                '해상보험': { attempted: 0, correct: 0, accuracy: 0.0 }
            },
            currentIndex: 0,
            currentCategory: selectedCategory,
            streak: 0
        };
    }
    
    const largeCategory = userStatistics.largeCategory;
    
    // 누적 통계 업데이트
    largeCategory.cumulative.totalAttempted++;
    if (isCorrect) {
        largeCategory.cumulative.totalCorrect++;
        largeCategory.streak++;
    } else {
        largeCategory.cumulative.totalWrong++;
        largeCategory.streak = 0;
    }
    largeCategory.cumulative.accuracy = calculateAccuracy(largeCategory.cumulative.totalCorrect, largeCategory.cumulative.totalAttempted);
    
    // 금일 통계 업데이트
    const today = new Date().toISOString().split('T')[0];
    if (largeCategory.today.date !== today) {
        largeCategory.today = {
            date: today,
            todayAttempted: 0,
            todayCorrect: 0,
            todayWrong: 0,
            accuracy: 0.0
        };
    }
    
    largeCategory.today.todayAttempted++;
    if (isCorrect) {
        largeCategory.today.todayCorrect++;
    } else {
        largeCategory.today.todayWrong++;
    }
    largeCategory.today.accuracy = calculateAccuracy(largeCategory.today.todayCorrect, largeCategory.today.todayAttempted);
    
    // 카테고리별 통계 업데이트
    if (selectedCategory && largeCategory.categories[selectedCategory]) {
        const categoryStats = largeCategory.categories[selectedCategory];
        categoryStats.attempted++;
        if (isCorrect) {
            categoryStats.correct++;
        }
        categoryStats.accuracy = calculateAccuracy(categoryStats.correct, categoryStats.attempted);
    }
    
    // 현재 인덱스 업데이트
    largeCategory.currentIndex = currentQuestionIndex;
    largeCategory.currentCategory = selectedCategory;
    
    // 통계 저장
    saveLargeCategoryStatistics();
    
    // 화면 업데이트
    updateLargeCategoryStatisticsDisplay();
    
    console.log(`대분류 통계 업데이트: ${isCorrect ? '정답' : '오답'}, 카테고리: ${selectedCategory}`);
}

// 대분류 학습 초기 통계 생성
function createInitialLargeCategoryStatistics() {
    return {
        userId: currentUser?.userId || 'default',
        registeredAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        
        // 대분류 학습 통계
        largeCategory: {
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
            categories: {
                '재산보험': { attempted: 0, correct: 0, accuracy: 0.0 },
                '특종보험': { attempted: 0, correct: 0, accuracy: 0.0 },
                '배상책임보험': { attempted: 0, correct: 0, accuracy: 0.0 },
                '해상보험': { attempted: 0, correct: 0, accuracy: 0.0 }
            },
            currentIndex: 0,
            currentCategory: null,
            streak: 0
        }
    };
}

// 대분류 학습 통계 저장
async function saveLargeCategoryStatistics() {
    try {
        if (isFlaskMode && currentUser) {
            // Flask 서버에 통계 저장
            const response = await fetch(`/user/api/users/${currentUser.userId}/statistics`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ statistics: userStatistics })
            });
            
            if (response.ok) {
                console.log('Flask 서버에 대분류 통계 저장 완료');
                return;
            }
        }
        
        // 로컬 모드 또는 Flask 실패 시
        localStorage.setItem(`aciu_stats_${currentUser?.userId || 'default'}`, JSON.stringify(userStatistics));
        console.log('로컬에 대분류 통계 저장 완료');
        
    } catch (error) {
        console.error('대분류 통계 저장 실패:', error);
    }
}

// 대분류 학습 통계 표시 업데이트
function updateLargeCategoryStatisticsDisplay() {
    if (!userStatistics || !userStatistics.largeCategory) return;
    
    const largeCategory = userStatistics.largeCategory;
    
    // 누적 현황 업데이트
    document.getElementById('cumulative-total').textContent = largeCategory.cumulative.totalAttempted;
    document.getElementById('cumulative-correct').textContent = largeCategory.cumulative.totalCorrect;
    document.getElementById('cumulative-accuracy').textContent = largeCategory.cumulative.accuracy.toFixed(1);
    
    // 금일 현황 업데이트
    document.getElementById('today-total').textContent = largeCategory.today.todayAttempted;
    document.getElementById('today-correct').textContent = largeCategory.today.todayCorrect;
    document.getElementById('today-accuracy').textContent = largeCategory.today.accuracy.toFixed(1);
    
    // 카테고리별 현황 업데이트 (있는 경우)
    if (selectedCategory && largeCategory.categories[selectedCategory]) {
        const categoryStats = largeCategory.categories[selectedCategory];
        const categoryProgressElement = document.getElementById('category-progress');
        if (categoryProgressElement) {
            categoryProgressElement.textContent = `${selectedCategory}: ${categoryStats.attempted}문제 중 ${categoryStats.correct}개 정답 (${categoryStats.accuracy.toFixed(1)}%)`;
        }
    }
    
    // 상세 통계 업데이트
    document.getElementById('total-questions').textContent = currentQuestionData.length;
    document.getElementById('correct-answers').textContent = largeCategory.cumulative.totalCorrect;
    document.getElementById('wrong-answers').textContent = largeCategory.cumulative.totalWrong;
    document.getElementById('current-streak').textContent = largeCategory.streak || 0;
}

// 대분류 학습 통계 리셋
function resetLargeCategoryStatistics() {
    if (confirm('대분류 학습 통계를 초기화하시겠습니까?')) {
        userStatistics.largeCategory = {
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
            categories: {
                '재산보험': { attempted: 0, correct: 0, accuracy: 0.0 },
                '특종보험': { attempted: 0, correct: 0, accuracy: 0.0 },
                '배상책임보험': { attempted: 0, correct: 0, accuracy: 0.0 },
                '해상보험': { attempted: 0, correct: 0, accuracy: 0.0 }
            },
            currentIndex: 0,
            currentCategory: null,
            streak: 0
        };
        
        saveLargeCategoryStatistics();
        updateLargeCategoryStatisticsDisplay();
        largeCategorySystem.updateStatus('대분류 학습 통계가 초기화되었습니다.', 'blue');
    }
}

// 대분류 학습 진행률 계산
function calculateLargeCategoryProgress() {
    if (!currentQuestionData || currentQuestionData.length === 0) return 0;
    return ((currentQuestionIndex + 1) / currentQuestionData.length) * 100;
}

// 정확도 계산 함수
function calculateAccuracy(correct, total) {
    if (total === 0) return 0.0;
    return (correct / total) * 100;
}

// 대분류 학습 카테고리별 통계 조회
function getCategoryStatistics(categoryName) {
    if (!userStatistics || !userStatistics.largeCategory) {
        return { attempted: 0, correct: 0, accuracy: 0.0 };
    }
    
    return userStatistics.largeCategory.categories[categoryName] || { attempted: 0, correct: 0, accuracy: 0.0 };
}

// 대분류 학습 전체 통계 요약
function getLargeCategoryStatisticsSummary() {
    if (!userStatistics || !userStatistics.largeCategory) {
        return {
            totalAttempted: 0,
            totalCorrect: 0,
            overallAccuracy: 0.0,
            categoryStats: {}
        };
    }
    
    const largeCategory = userStatistics.largeCategory;
    const categoryStats = {};
    
    // 카테고리별 통계 정리
    Object.keys(largeCategory.categories).forEach(category => {
        const stats = largeCategory.categories[category];
        categoryStats[category] = {
            attempted: stats.attempted,
            correct: stats.correct,
            accuracy: stats.accuracy
        };
    });
    
    return {
        totalAttempted: largeCategory.cumulative.totalAttempted,
        totalCorrect: largeCategory.cumulative.totalCorrect,
        overallAccuracy: largeCategory.cumulative.accuracy,
        categoryStats: categoryStats
    };
}

// 대분류 학습 통계 내보내기
function exportLargeCategoryStatistics() {
    const summary = getLargeCategoryStatisticsSummary();
    const dataStr = JSON.stringify(summary, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `large_category_statistics_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    largeCategorySystem.updateStatus('대분류 학습 통계가 내보내기되었습니다.', 'green');
}

// 대분류 학습 통계 초기화 (페이지 로드 시)
function initializeLargeCategoryStatistics() {
    console.log('=== 대분류 학습 통계 초기화 ===');
    
    // 기존 통계 로드
    loadUserStatistics();
    
    // 통계 표시 초기화
    updateLargeCategoryStatisticsDisplay();
    
    console.log('대분류 학습 통계 초기화 완료');
}

