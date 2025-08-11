// ===== ACIU S4 대분류 학습 시스템 - 데이터 필터링 모듈 =====

// 카테고리별 문제 데이터 캐시
let categoryDataCache = {
    '재산보험': null,
    '특종보험': null,
    '배상책임보험': null,
    '해상보험': null
};

// 전체 문제 데이터 캐시
let allQuestionsData = null;

// Layer1 기준 카테고리 필터링 함수
async function filterQuestionsByCategory(categoryName) {
    console.log(`=== 카테고리 필터링 시작: ${categoryName} ===`);
    
    try {
        // 캐시된 데이터가 있으면 사용
        if (categoryDataCache[categoryName]) {
            console.log(`${categoryName} 캐시된 데이터 사용: ${categoryDataCache[categoryName].length}개`);
            return categoryDataCache[categoryName];
        }
        
        // 전체 데이터가 없으면 로드
        if (!allQuestionsData) {
            console.log('전체 문제 데이터 로드 중...');
            const response = await fetch('/static/questions.json');
            allQuestionsData = await response.json();
            console.log(`전체 데이터 로드 완료: ${allQuestionsData.questions.length}개`);
        }
        
        // Layer1 기준으로 필터링 (실제 데이터 필드명 매핑)
        const startTime = performance.now();
        
        // 카테고리명 매핑
        const categoryMapping = {
            '재산보험': '06재산보험',
            '특종보험': '07특종보험',
            '배상책임보험': '08배상책임보험',
            '해상보험': '09해상보험'
        };
        
        const mappedCategoryName = categoryMapping[categoryName];
        
        const filteredData = allQuestionsData.questions.filter(question => {
            return question.qcode && 
                   question.question && 
                   question.answer && 
                   question.qcode.trim() !== '' && 
                   question.layer1 === mappedCategoryName;
        });
        
        const endTime = performance.now();
        const filterTime = endTime - startTime;
        
        console.log(`${categoryName} 필터링 완료: ${filteredData.length}개 문제 (${filterTime.toFixed(2)}ms)`);
        
        // 데이터 형식 변환
        const convertedData = filteredData.map(question => ({
            QCODE: question.qcode,
            QUESTION: question.question,
            ANSWER: question.answer,
            TYPE: question.type || '진위형',
            LAYER1: question.layer1 || '',
            LAYER2: question.layer2 || ''
        }));
        
        // 캐시에 저장
        categoryDataCache[categoryName] = convertedData;
        
        return convertedData;
        
    } catch (error) {
        console.error(`카테고리 필터링 실패 (${categoryName}):`, error);
        return [];
    }
}

// 모든 카테고리 데이터 사전 로드 (성능 최적화)
async function preloadAllCategoryData() {
    console.log('=== 모든 카테고리 데이터 사전 로드 ===');
    
    const categories = ['재산보험', '특종보험', '배상책임보험', '해상보험'];
    const startTime = performance.now();
    
    try {
        // 전체 데이터 로드
        const response = await fetch('/static/questions.json');
        allQuestionsData = await response.json();
        console.log(`전체 데이터 로드 완료: ${allQuestionsData.questions.length}개`);
        
        // 각 카테고리별 필터링 및 캐시
        const categoryMapping = {
            '재산보험': '06재산보험',
            '특종보험': '07특종보험',
            '배상책임보험': '08배상책임보험',
            '해상보험': '09해상보험'
        };
        
        for (const category of categories) {
            const mappedCategoryName = categoryMapping[category];
            const filteredData = allQuestionsData.questions.filter(question => {
                return question.qcode && 
                       question.question && 
                       question.answer && 
                       question.qcode.trim() !== '' && 
                       question.layer1 === mappedCategoryName;
            });
            
            const convertedData = filteredData.map(question => ({
                QCODE: question.qcode,
                QUESTION: question.question,
                ANSWER: question.answer,
                TYPE: question.type || '진위형',
                LAYER1: question.layer1 || '',
                LAYER2: question.layer2 || ''
            }));
            
            categoryDataCache[category] = convertedData;
            console.log(`${category}: ${convertedData.length}개 문제 캐시 완료`);
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        
        console.log(`모든 카테고리 데이터 사전 로드 완료: ${totalTime.toFixed(2)}ms`);
        
        // 카테고리별 문제 수 업데이트
        updateCategoryQuestionCounts();
        
    } catch (error) {
        console.error('카테고리 데이터 사전 로드 실패:', error);
    }
}

// 카테고리별 문제 수 업데이트
function updateCategoryQuestionCounts() {
    const categories = ['재산보험', '특종보험', '배상책임보험', '해상보험'];
    
    categories.forEach(category => {
        const count = categoryDataCache[category] ? categoryDataCache[category].length : 0;
        const elementId = `category-count-${category.replace(/\s+/g, '-')}`;
        const element = document.getElementById(elementId);
        
        if (element) {
            element.textContent = `문제 수: ${count}개`;
        }
    });
    
    console.log('카테고리별 문제 수 업데이트 완료');
}

// 카테고리별 통계 정보 조회
function getCategoryStatistics(categoryName) {
    if (!categoryDataCache[categoryName]) {
        return {
            totalQuestions: 0,
            questionTypes: {},
            layer2Distribution: {}
        };
    }
    
    const questions = categoryDataCache[categoryName];
    const stats = {
        totalQuestions: questions.length,
        questionTypes: {},
        layer2Distribution: {}
    };
    
    // 문제 유형별 통계
    questions.forEach(question => {
        const type = question.TYPE || '진위형';
        stats.questionTypes[type] = (stats.questionTypes[type] || 0) + 1;
        
        const layer2 = question.LAYER2 || '기타';
        stats.layer2Distribution[layer2] = (stats.layer2Distribution[layer2] || 0) + 1;
    });
    
    return stats;
}

// 전체 카테고리 통계 요약
function getAllCategoriesSummary() {
    const categories = ['재산보험', '특종보험', '배상책임보험', '해상보험'];
    const summary = {};
    
    categories.forEach(category => {
        summary[category] = {
            questionCount: categoryDataCache[category] ? categoryDataCache[category].length : 0,
            statistics: getCategoryStatistics(category)
        };
    });
    
    return summary;
}

// 캐시 초기화
function clearCategoryDataCache() {
    categoryDataCache = {
        '재산보험': null,
        '특종보험': null,
        '배상책임보험': null,
        '해상보험': null
    };
    allQuestionsData = null;
    console.log('카테고리 데이터 캐시 초기화 완료');
}

// 데이터 무결성 검증
function validateCategoryData(categoryName) {
    if (!categoryDataCache[categoryName]) {
        console.warn(`${categoryName} 데이터가 없습니다.`);
        return false;
    }
    
    const questions = categoryDataCache[categoryName];
    let validCount = 0;
    let invalidCount = 0;
    
    questions.forEach(question => {
        if (question.QCODE && question.QUESTION && question.ANSWER) {
            validCount++;
        } else {
            invalidCount++;
            console.warn(`무효한 문제 발견:`, question);
        }
    });
    
    console.log(`${categoryName} 데이터 검증 결과: 유효 ${validCount}개, 무효 ${invalidCount}개`);
    
    return invalidCount === 0;
}

// 성능 테스트 함수
async function testCategoryFilteringPerformance() {
    console.log('=== 카테고리 필터링 성능 테스트 ===');
    
    const categories = ['재산보험', '특종보험', '배상책임보험', '해상보험'];
    
    for (const category of categories) {
        const startTime = performance.now();
        const data = await filterQuestionsByCategory(category);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`${category}: ${data.length}개 문제, ${duration.toFixed(2)}ms`);
        
        // 성능 기준 확인 (2초 이내)
        if (duration > 2000) {
            console.warn(`⚠️ ${category} 필터링이 2초를 초과했습니다: ${duration.toFixed(2)}ms`);
        }
    }
}

// 데이터 필터링 모듈 초기화
function initializeDataFilteringModule() {
    console.log('=== 데이터 필터링 모듈 초기화 ===');
    
    // 페이지 로드 시 모든 카테고리 데이터 사전 로드
    preloadAllCategoryData();
    
    console.log('데이터 필터링 모듈 초기화 완료');
}

// 모듈 내보내기
window.largeCategoryDataFilter = {
    filterQuestionsByCategory,
    preloadAllCategoryData,
    getCategoryStatistics,
    getAllCategoriesSummary,
    clearCategoryDataCache,
    validateCategoryData,
    testCategoryFilteringPerformance,
    initializeDataFilteringModule
};
