// D-day 카운터 시스템
// 파일: static/js/dday_counter.js

class DDayCounter {
    constructor(examDate = '2025-09-13') {
        this.examDate = new Date(examDate);
        this.init();
    }
    
    calculateDDay() {
        const today = new Date();
        const timeDiff = this.examDate - today;
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        
        return {
            days: daysDiff,
            display: daysDiff > 0 ? `D-${daysDiff}` : daysDiff === 0 ? 'D-Day' : `D+${Math.abs(daysDiff)}`,
            status: daysDiff > 0 ? 'before' : daysDiff === 0 ? 'today' : 'after'
        };
    }
    
    updateDisplay() {
        const dday = this.calculateDDay();
        
        // 대문 페이지 D-day 표시
        const ddayElement = document.getElementById('dday-counter');
        if (ddayElement) {
            ddayElement.textContent = dday.display;
            ddayElement.className = `dday-${dday.status}`;
        }
        
        // 사용자 정보 영역에 표시
        const userInfoElement = document.getElementById('user-exam-info');
        if (userInfoElement) {
            const userData = JSON.parse(localStorage.getItem('aicu_user_data') || '{}');
            userInfoElement.innerHTML = `
                <div class="user-info">
                    <span>👤 ${userData.name || '게스트'}</span>
                    <span>📅 시험일: ${userData.exam_date || '2025-09-13'} (${dday.display})</span>
                </div>
            `;
        }
        
        return dday;
    }
    
    init() {
        // 즉시 업데이트
        this.updateDisplay();
        
        // 매일 자정에 업데이트
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const msUntilMidnight = tomorrow.getTime() - now.getTime();
        
        setTimeout(() => {
            this.updateDisplay();
            setInterval(() => this.updateDisplay(), 24 * 60 * 60 * 1000);
        }, msUntilMidnight);
    }
    
    updateExamDate(newDate) {
        this.examDate = new Date(newDate);
        this.updateDisplay();
        console.log(`✅ 시험일 업데이트: ${newDate}`);
    }
}

// 전역 인스턴스 생성
window.DDayCounter = new DDayCounter();
