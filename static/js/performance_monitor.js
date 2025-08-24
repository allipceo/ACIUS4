// 성능 모니터링 시스템
// 파일: static/js/performance_monitor.js

function measurePerformance() {
    const startTime = performance.now();
    const localStorageSize = JSON.stringify(localStorage).length;
    
    return {
        pageLoadTime: performance.now() - startTime,
        localStorageSize: localStorageSize,
        timestamp: new Date().toISOString()
    };
}

// 기준선 저장
localStorage.setItem('performance_baseline', JSON.stringify(measurePerformance()));
console.log('✅ 성능 기준선 설정 완료');

// 전역 함수로 노출
window.measurePerformance = measurePerformance;
