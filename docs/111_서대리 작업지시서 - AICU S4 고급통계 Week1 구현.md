# 111_서대리 작업지시서 - AICU S4 고급통계 Week1 구현

**지시자**: 노팀장 (프로젝트 리드)  
**수행자**: 서대리 (실제 개발 담당)  
**기준**: 110번 안전장치 + 109번 기능 완성도 (하이브리드 접근)  
**목표**: Week1 게스트 모드 + D-day 카운터 완전 구현  
**작업일**: 2025년 8월 15일 00:22 KST 시작

---

## 🎯 **작업 개요**

### **프로젝트 목표**
- **101번 요구사항 실현**: 게스트 모드 + D-day 카운터
- **유료 앱 가치**: 즉시 체험 + 목표 의식 강화
- **기존 시스템 보호**: 85% 완성도 유지

### **Week1 구현 범위**
- `static/js/guest_mode_defaults.js` (100줄)
- `static/js/dday_counter.js` (80줄)  
- `templates/home.html` 수정 (20줄)
- **총 200줄, 2개 핵심 기능 동시 구현**

---

## 📋 **단계별 작업 지시**

### **🚀 Step 1: 개발 환경 준비 (30분)**

#### **1.1 백업 및 브랜치 생성**
```bash
# 현재 상태 백업
git add .
git commit -m "v3.7 백업 - Week1 고급통계 시작 전"

# 새로운 브랜치 생성
git checkout -b statistics-advanced-v3.8

# 브랜치 확인
git branch
```

**검증 기준**: 
- [ ] 브랜치 생성 성공 확인
- [ ] 기존 v3.7 상태 보존 확인

#### **1.2 성능 기준선 측정**
```javascript
// 파일 생성: static/js/performance_monitor.js
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
```

**검증 기준**:
- [ ] 성능 기준선 localStorage에 저장 확인
- [ ] 콘솔에서 기준선 데이터 확인

#### **1.3 롤백 시스템 구축**
```javascript
// 파일 생성: static/js/rollback_manager.js
class RollbackManager {
    static createBackup(name) {
        const backup = {
            localStorage: {},
            timestamp: new Date().toISOString(),
            version: 'v3.7'
        };
        
        // 모든 localStorage 데이터 백업
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            backup.localStorage[key] = localStorage.getItem(key);
        }
        
        localStorage.setItem(`backup_${name}`, JSON.stringify(backup));
        console.log(`✅ 백업 생성 완료: ${name}`);
    }
    
    static rollback(name) {
        const backupData = localStorage.getItem(`backup_${name}`);
        if (backupData) {
            const backup = JSON.parse(backupData);
            
            // localStorage 초기화
            localStorage.clear();
            
            // 백업 데이터 복원
            Object.keys(backup.localStorage).forEach(key => {
                localStorage.setItem(key, backup.localStorage[key]);
            });
            
            console.log(`✅ 롤백 완료: ${name}`);
            location.reload();
        }
    }
}

window.RollbackManager = RollbackManager;

// 초기 백업 생성
RollbackManager.createBackup('pre_week1');
```

**검증 기준**:
- [ ] RollbackManager 클래스 생성 확인
- [ ] pre_week1 백업 생성 확인
- [ ] 롤백 테스트 성공 확인

---

### **🚀 Step 2: 게스트 모드 구현 (60분)**

#### **2.1 guest_mode_defaults.js 생성**
```javascript
// 파일: static/js/guest_mode_defaults.js (100줄)
class GuestModeManager {
    static applyDefaults() {
        const userInfo = localStorage.getItem('aicu_user_data');
        
        if (!userInfo) {
            const defaultUserData = {
                name: '게스트',
                registration_date: '2025-08-01',
                exam_subject: 'AICU',
                exam_date: '2025-09-13',
                phone: '010-1234-5678',
                is_guest: true,
                created_at: new Date().toISOString()
            };
            
            localStorage.setItem('aicu_user_data', JSON.stringify(defaultUserData));
            this.initializeStatistics(defaultUserData);
            
            console.log('✅ 게스트 모드 기본값 적용 완료');
            return defaultUserData;
        }
        
        return JSON.parse(userInfo);
    }
    
    static initializeStatistics(userData) {
        const today = new Date().toISOString().split('T')[0];
        
        if (!localStorage.getItem('aicu_statistics')) {
            const initialStats = {
                registration_timestamp: userData.created_at,
                total_questions_attempted: 0,
                total_correct_answers: 0,
                accuracy_rate: 0,
                daily_progress: {
                    [today]: { attempted: 0, correct: 0, accuracy: 0 }
                },
                last_updated: userData.created_at
            };
            
            localStorage.setItem('aicu_statistics', JSON.stringify(initialStats));
        }
    }
    
    static isGuestMode() {
        const userData = JSON.parse(localStorage.getItem('aicu_user_data') || '{}');
        return userData.is_guest === true;
    }
    
    static updateGuestToUser(userData) {
        userData.is_guest = false;
        userData.updated_at = new Date().toISOString();
        localStorage.setItem('aicu_user_data', JSON.stringify(userData));
        console.log('✅ 게스트 모드에서 실제 사용자로 전환 완료');
    }
}

// 페이지 로드 시 자동 실행
document.addEventListener('DOMContentLoaded', () => {
    GuestModeManager.applyDefaults();
});

window.GuestModeManager = GuestModeManager;
```

**검증 기준**:
- [ ] 파일 생성 확인 (100줄 내외)
- [ ] localStorage 초기화 후 자동 게스트 설정 확인
- [ ] 기존 사용자 데이터 보존 확인
- [ ] isGuestMode() 함수 정상 작동 확인

#### **2.2 게스트 모드 테스트**
```javascript
// 테스트 함수 (임시)
function testGuestMode() {
    // localStorage 초기화
    localStorage.clear();
    
    // 게스트 모드 적용
    GuestModeManager.applyDefaults();
    
    // 결과 확인
    const userData = JSON.parse(localStorage.getItem('aicu_user_data'));
    const stats = JSON.parse(localStorage.getItem('aicu_statistics'));
    
    console.log('게스트 모드 테스트 결과:', {
        userData: userData,
        stats: stats,
        isGuest: GuestModeManager.isGuestMode()
    });
    
    return userData && stats && GuestModeManager.isGuestMode();
}

// 테스트 실행
console.log('게스트 모드 테스트:', testGuestMode());
```

**검증 기준**:
- [ ] testGuestMode() 함수 true 반환
- [ ] 콘솔에서 게스트 데이터 확인
- [ ] 통계 초기화 확인

---

### **🚀 Step 3: D-day 카운터 구현 (60분)**

#### **3.1 dday_counter.js 생성**
```javascript
// 파일: static/js/dday_counter.js (80줄)
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
}

// 전역 인스턴스 생성
window.DDayCounter = new DDayCounter();
```

**검증 기준**:
- [ ] 파일 생성 확인 (80줄 내외)
- [ ] D-day 정확한 계산 확인
- [ ] 시험일 변경 시 업데이트 확인

#### **3.2 CSS 스타일 추가**
```css
/* 파일: static/css/dday_counter.css (30줄) */
.dday-before {
    color: #e74c3c;
    font-weight: bold;
    font-size: 1.2em;
    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
    padding: 8px 16px;
    border-radius: 20px;
    display: inline-block;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.dday-today {
    color: #f39c12;
    font-weight: bold;
    font-size: 1.3em;
    background: linear-gradient(45deg, #f39c12, #e67e22);
    padding: 10px 20px;
    border-radius: 25px;
    display: inline-block;
    box-shadow: 0 6px 12px rgba(0,0,0,0.2);
    animation: pulse 2s infinite;
}

.dday-after {
    color: #27ae60;
    font-weight: bold;
    font-size: 1.1em;
    background: linear-gradient(45deg, #2ecc71, #27ae60);
    padding: 6px 12px;
    border-radius: 15px;
    display: inline-block;
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

.user-info {
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 10px;
    background: rgba(255,255,255,0.1);
    border-radius: 8px;
    margin: 10px 0;
}

.user-info span {
    font-size: 0.9em;
    color: #333;
}
```

**검증 기준**:
- [ ] CSS 파일 생성 확인
- [ ] D-day 스타일 적용 확인

---

### **🚀 Step 4: home.html 통합 (30분)**

#### **4.1 home.html 수정 (20줄 추가)**
```html
<!-- templates/home.html 기존 파일에 추가 -->

<!-- head 섹션에 CSS 추가 -->
<link rel="stylesheet" href="/static/css/dday_counter.css">

<!-- 기존 사용자 정보 영역 근처에 추가 -->
<div class="dday-container text-center mb-6">
    <h3 class="text-lg font-semibold mb-2">📅 시험까지 남은 시간</h3>
    <div id="dday-counter" class="dday-display"></div>
</div>

<!-- 사용자 정보 표시 영역 -->  
<div id="user-exam-info" class="user-info-container">
    <!-- D-day 카운터가 여기에 표시됨 -->
</div>

<!-- body 끝 부분에 스크립트 추가 -->
<script src="/static/js/performance_monitor.js"></script>
<script src="/static/js/rollback_manager.js"></script>
<script src="/static/js/guest_mode_defaults.js"></script>
<script src="/static/js/dday_counter.js"></script>
```

**검증 기준**:
- [ ] home.html 수정 확인 (20줄 내외)
- [ ] 모든 스크립트 로드 확인
- [ ] CSS 적용 확인

---

### **🚀 Step 5: 통합 테스트 (30분)**

#### **5.1 전체 기능 테스트**
```javascript
// 통합 테스트 함수
function testWeek1Integration() {
    console.log('=== Week1 통합 테스트 시작 ===');
    
    // 1. localStorage 초기화
    localStorage.clear();
    
    // 2. 페이지 로드 시뮬레이션
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
    // 3. 결과 확인
    const results = {
        guestMode: GuestModeManager.isGuestMode(),
        userData: JSON.parse(localStorage.getItem('aicu_user_data')),
        ddayElement: document.getElementById('dday-counter'),
        userInfoElement: document.getElementById('user-exam-info'),
        ddayCalculation: window.DDayCounter.calculateDDay()
    };
    
    console.log('Week1 통합 테스트 결과:', results);
    
    // 성공 기준 체크
    const success = results.guestMode && 
                   results.userData && 
                   results.ddayElement && 
                   results.userInfoElement &&
                   results.ddayCalculation;
    
    console.log('통합 테스트 성공:', success);
    return success;
}
```

**검증 기준**:
- [ ] 게스트 모드 자동 설정 확인
- [ ] D-day 카운터 화면 표시 확인  
- [ ] 사용자 정보에 "게스트" 표시 확인
- [ ] 시험일 정보 정확 표시 확인

#### **5.2 성능 측정**
```javascript
// 성능 비교 테스트
function comparePerformance() {
    const baseline = JSON.parse(localStorage.getItem('performance_baseline'));
    const current = measurePerformance();
    
    const comparison = {
        baseline: baseline,
        current: current,
        loadTimeDiff: current.pageLoadTime - baseline.pageLoadTime,
        storageDiff: current.localStorageSize - baseline.localStorageSize
    };
    
    console.log('성능 비교 결과:', comparison);
    
    // 성능 기준 (기준선 대비 20% 이내)
    const performanceOK = comparison.loadTimeDiff < baseline.pageLoadTime * 0.2 &&
                         comparison.storageDiff < baseline.localStorageSize * 0.2;
    
    console.log('성능 기준 통과:', performanceOK);
    return performanceOK;
}
```

**검증 기준**:
- [ ] 페이지 로딩 시간 기준선 대비 20% 이내
- [ ] LocalStorage 사용량 기준선 대비 20% 이내

---

## ✅ **Week1 완료 체크리스트**

### **기능 검증**
- [ ] 앱 실행 시 자동 게스트 설정
- [ ] D-day 카운터 정확한 표시 (D-30 형태)
- [ ] 사용자 정보에 "게스트" 표시
- [ ] 시험일 정보 정확 표시
- [ ] 브라우저 새로고침 후에도 데이터 유지

### **안정성 검증**
- [ ] 기존 기능 100% 정상 작동
- [ ] 기존 사용자 데이터 보존
- [ ] 성능 기준선 대비 20% 이내 유지
- [ ] 롤백 시스템 정상 작동
- [ ] 에러 없이 완전한 동작

### **코드 품질 검증**
- [ ] 새 파일 5개 생성 (performance_monitor, rollback_manager, guest_mode_defaults, dday_counter, dday_counter.css)
- [ ] 기존 파일 수정 최소화 (home.html 20줄)
- [ ] 총 코드량 230줄 이하
- [ ] 모든 함수 정상 작동

### **사용자 경험 검증**
- [ ] 즉시 체험 가능 (등록 없이 학습 시작)
- [ ] 목표 의식 강화 (D-day 표시)
- [ ] 직관적인 UI (명확한 게스트 표시)
- [ ] 매끄러운 전환 (게스트→실제 사용자)

---

## 📊 **완료 보고 양식**

### **작업 완료 시 서대리 보고 내용**
```
=== Week1 완료 보고 ===
작업 기간: 2025년 8월 15일 00:22 ~ [완료 시간]
구현 파일: 5개 신규, 1개 수정
코드 라인: [실제 라인 수]
테스트 결과: [체크리스트 완료 개수/전체 개수]
성능 측정: [기준선 대비 변화율]
발견 이슈: [있을 경우 상세 기록]
다음 단계 준비: [Week2 진행 가능 여부]
```

### **노팀장 검증 완료 후**
- ✅ **기능 검증 통과**: Week2 계획 수립
- ❌ **검증 실패**: 문제점 분석 및 재작업 지시

---

**작업 지시 완료**: 2025년 8월 15일 00:22 KST  
**담당자**: 서대리  
**검증자**: 노팀장  
**다음 단계**: Week1 완료 후 Week2 계획 수립

**서대리는 이 지시서에 따라 단계별로 작업을 수행하고, 각 단계 완료 시마다 노팀장에게 보고해주세요.**