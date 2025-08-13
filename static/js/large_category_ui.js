// ===== ACIU S4 대분류 학습 시스템 - UI 모듈 =====

// 카테고리 탭 UI 생성 함수
function createCategorySelectionUI() {
    const categories = [
        { name: '재산보험', icon: '🏠', description: '재산 관련 보험 문제' },
        { name: '특종보험', icon: '🚗', description: '특수 종목 보험 문제' },
        { name: '배상책임보험', icon: '⚖️', description: '배상 책임 보험 문제' },
        { name: '해상보험', icon: '🚢', description: '해상 관련 보험 문제' }
    ];
    
    const container = document.getElementById('category-tab-container');
    container.innerHTML = '';
    
    categories.forEach((category, index) => {
        const tab = document.createElement('button');
        tab.className = 'flex-1 bg-gray-200 hover:bg-blue-100 text-gray-700 px-6 py-4 rounded-lg text-center transition-all border-2 border-transparent min-h-[80px]';
        tab.onclick = () => selectCategory(category.name);
        tab.setAttribute('data-category', category.name);
        
        tab.innerHTML = `
            <div class="flex flex-col items-center space-y-2">
                <span class="text-3xl">${category.icon}</span>
                <div class="text-center">
                    <div class="font-semibold text-base">${category.name}</div>
                    <div class="text-sm text-gray-500 mt-1" id="category-count-${category.name.replace(/\s+/g, '-')}">
                        로딩 중...
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(tab);
    });
    
    // 각 카테고리별 문제 수 로드
    loadCategoryQuestionCounts();
    
    // 첫 번째 카테고리를 기본 선택
    if (categories.length > 0) {
        selectCategory(categories[0].name);
    }
}

// 카테고리 선택 함수
function selectCategory(categoryName) {
    console.log(`카테고리 선택: ${categoryName}`);
    
    // 모든 카테고리 탭에서 선택 상태 제거
    document.querySelectorAll('#category-tab-container button').forEach(tab => {
        tab.classList.remove('bg-blue-500', 'text-white', 'border-blue-600');
        tab.classList.add('bg-gray-200', 'text-gray-700', 'border-transparent');
    });
    
    // 선택된 카테고리 탭 하이라이트
    const selectedTab = document.querySelector(`[data-category="${categoryName}"]`);
    if (selectedTab) {
        selectedTab.classList.remove('bg-gray-200', 'text-gray-700', 'border-transparent');
        selectedTab.classList.add('bg-blue-500', 'text-white', 'border-blue-600');
    }
    
    // 문제 영역 표시
    document.getElementById('large-category-question-area').classList.remove('hidden');
    
    // 대분류 학습 모드 시작
    selectLargeCategoryMode(categoryName);
}

// 카테고리별 문제 수 로드 함수
async function loadCategoryQuestionCounts() {
    try {
        const response = await fetch('/static/questions.json');
        const jsonData = await response.json();
        
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
            const count = jsonData.questions.filter(q => 
                q.layer1 === mappedCategoryName && q.qcode && q.question && q.answer
            ).length;
            
            const elementId = `category-count-${category.replace(/\s+/g, '-')}`;
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = `${count}개 문제`;
            }
        });
        
        console.log('카테고리별 문제 수 로드 완료');
        
    } catch (error) {
        console.error('카테고리별 문제 수 로드 실패:', error);
    }
}

// 대분류 문제 표시 함수
function displayLargeCategoryQuestion() {
    if (!currentQuestionData || currentQuestionData.length === 0) {
        largeCategorySystem.updateStatus('문제 데이터가 없습니다.', 'red');
        return;
    }
    
    if (currentQuestionIndex >= currentQuestionData.length) {
        largeCategorySystem.updateStatus('모든 문제를 완료했습니다! 🎉', 'green');
        return;
    }
    
    const question = currentQuestionData[currentQuestionIndex];
    
    // 문제 정보 표시
    document.getElementById('question-code').textContent = question.QCODE || 'Q???';
    document.getElementById('question-type').textContent = question.TYPE || '진위형';
    document.getElementById('layer-info').textContent = `${question.LAYER1 || ''} > ${question.LAYER2 || ''}`;
    document.getElementById('question-text').textContent = question.QUESTION || '문제를 불러올 수 없습니다.';
    document.getElementById('progress-info').textContent = `${currentQuestionIndex + 1} / ${currentQuestionData.length}`;
    
    // 답안 버튼 생성
    createLargeCategoryAnswerButtons(question);
    
    // 상태 초기화
    selectedAnswer = null;
    isAnswerChecked = false;
    document.getElementById('result-area').classList.add('hidden');
    document.getElementById('check-button').textContent = '정답 확인';
    
    console.log(`대분류 문제 표시: ${question.QCODE}, 진도: ${currentQuestionIndex + 1}/${currentQuestionData.length}`);
}

// 대분류 답안 버튼 생성 함수
function createLargeCategoryAnswerButtons(question) {
    const buttonsContainer = document.getElementById('answer-buttons');
    buttonsContainer.innerHTML = '';
    
    if (question.TYPE === '진위형') {
        // O/X 버튼
        ['O', 'X'].forEach(answer => {
            const button = document.createElement('button');
            button.className = 'bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg mr-4 transition-all';
            button.textContent = answer === 'O' ? '⭕ 맞다 (O)' : '❌ 틀리다 (X)';
            button.setAttribute('data-answer', answer);
            button.onclick = () => largeCategorySystem.selectAnswer(answer);
            buttonsContainer.appendChild(button);
        });
    } else {
        // 선택형 버튼 (1, 2, 3, 4)
        for (let i = 1; i <= 4; i++) {
            const button = document.createElement('button');
            button.className = 'bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg mr-2 mb-2 transition-all';
            button.textContent = `${i}번`;
            button.setAttribute('data-answer', i.toString());
            button.onclick = () => largeCategorySystem.selectAnswer(i.toString());
            buttonsContainer.appendChild(button);
        }
    }
}

// 대분류 통계 표시 업데이트 함수
function updateLargeCategoryStatisticsDisplay() {
    if (!userStatistics) return;
    
    const largeCategory = userStatistics.largeCategory;
    if (!largeCategory) return;
    
    // 누적 현황 업데이트
    document.getElementById('cumulative-total').textContent = largeCategory.cumulative.totalAttempted;
    document.getElementById('cumulative-correct').textContent = largeCategory.cumulative.totalCorrect;
    document.getElementById('cumulative-accuracy').textContent = largeCategory.cumulative.accuracy.toFixed(1);
    
    // 금일 현황 업데이트 (날짜 확인)
    const today = new Date().toISOString().split('T')[0];
    if (largeCategory.today.date !== today) {
        // 날짜가 바뀐 경우 금일 통계 초기화
        largeCategory.today = {
            date: today,
            todayAttempted: 0,
            todayCorrect: 0,
            todayWrong: 0,
            accuracy: 0.0
        };
    }
    
    document.getElementById('today-total').textContent = largeCategory.today.todayAttempted;
    document.getElementById('today-correct').textContent = largeCategory.today.todayCorrect;
    document.getElementById('today-accuracy').textContent = largeCategory.today.accuracy.toFixed(1);
    
    // 카테고리별 현황 업데이트
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

// 대분류 학습 완료 화면 표시
function showLargeCategoryCompletionScreen() {
    const questionArea = document.getElementById('large-category-question-area');
    questionArea.innerHTML = `
        <div class="text-center py-12">
            <div class="text-6xl mb-4">🎉</div>
            <h2 class="text-3xl font-bold text-green-600 mb-4">학습 완료!</h2>
            <p class="text-xl text-gray-600 mb-6">${selectedCategory} 카테고리의 모든 문제를 풀었습니다.</p>
            
            <div class="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200 mb-6">
                <h3 class="text-lg font-semibold mb-3">학습 결과</h3>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span class="font-medium">총 문제 수:</span>
                        <span class="ml-2 font-bold text-blue-600">${currentQuestionData.length}개</span>
                    </div>
                    <div>
                        <span class="font-medium">정답 수:</span>
                        <span class="ml-2 font-bold text-green-600">${userStatistics.largeCategory.cumulative.totalCorrect}개</span>
                    </div>
                    <div>
                        <span class="font-medium">정답률:</span>
                        <span class="ml-2 font-bold text-purple-600">${userStatistics.largeCategory.cumulative.accuracy.toFixed(1)}%</span>
                    </div>
                    <div>
                        <span class="font-medium">연속 정답:</span>
                        <span class="ml-2 font-bold text-orange-600">${userStatistics.largeCategory.streak}개</span>
                    </div>
                </div>
            </div>
            
            <div class="space-x-4">
                <button onclick="restartLargeCategoryLearning()" class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all">
                    다시 풀기
                </button>
                <button onclick="goToCategorySelection()" class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all">
                    다른 카테고리
                </button>
                <button onclick="goHome()" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all">
                    홈으로
                </button>
            </div>
        </div>
    `;
}

// 대분류 학습 다시 시작
function restartLargeCategoryLearning() {
    if (selectedCategory) {
        currentQuestionIndex = 0;
        displayLargeCategoryQuestion();
        largeCategorySystem.updateStatus(`${selectedCategory} 카테고리 다시 시작합니다.`, 'blue');
    }
}

// 카테고리 선택 화면으로 이동 (탭 형태에서는 불필요하지만 호환성을 위해 유지)
function goToCategorySelection() {
    // 탭 형태에서는 이미 모든 카테고리가 표시되므로 별도 처리 불필요
    largeCategorySystem.updateStatus('카테고리를 선택해주세요.');
}

// 홈으로 이동
function goHome() {
    window.location.href = '/';
}

// 대분류 학습 UI 초기화
function initializeLargeCategoryUI() {
    console.log('=== 대분류 학습 UI 초기화 ===');
    
    // 카테고리 탭 UI 생성
    createCategorySelectionUI();
    
    // 통계 표시 초기화
    updateLargeCategoryStatisticsDisplay();
    
    console.log('대분류 학습 UI 초기화 완료');
}
