// settings_page.js - 통계 데이터 시작점 확보를 위한 설정 페이지 기능

// 전역 변수
let currentUserInfo = null;
let isDemoMode = true;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== 설정 페이지 초기화 ===');
    initializeSettingsPage();
});

// 설정 페이지 초기화
async function initializeSettingsPage() {
    try {
        // 현재 사용자 정보 로드
        await loadCurrentUserInfo();
        
        // 사용자 상태 표시 업데이트
        updateUserStatusDisplay();
        
        // 통계 시스템 초기화 (고도화된 통계 시스템이 있는 경우)
        if (window.advancedStatisticsSystem) {
            await window.advancedStatisticsSystem.initialize();
            console.log('✅ 고도화된 통계 시스템 초기화 완료');
        }
        
        console.log('✅ 설정 페이지 초기화 완료');
    } catch (error) {
        console.error('❌ 설정 페이지 초기화 실패:', error);
        showStatusMessage('설정 페이지 초기화에 실패했습니다.', 'error');
    }
}

// 현재 사용자 정보 로드
async function loadCurrentUserInfo() {
    try {
        const response = await fetch('/user/api/users/current');
        const data = await response.json();
        
        if (data.success) {
            currentUserInfo = data;
            isDemoMode = data.is_guest || true;
            console.log('✅ 사용자 정보 로드 완료:', currentUserInfo);
        } else {
            throw new Error('사용자 정보 로드 실패');
        }
    } catch (error) {
        console.error('❌ 사용자 정보 로드 실패:', error);
        // 기본값 설정
        currentUserInfo = {
            userId: 'user_jo_ceo_default',
            userName: '조대표',
            is_guest: true,
            exam_subject: '보험중개사',
            exam_date: '2025-11-12'
        };
        isDemoMode = true;
    }
}

// 사용자 상태 표시 업데이트
function updateUserStatusDisplay() {
    const statusElement = document.getElementById('current-user-status');
    if (!statusElement) return;
    
    if (isDemoMode) {
        statusElement.innerHTML = `
            <p class="text-yellow-800 text-sm">
                🔄 <strong>데모 모드</strong> 이용 중 (기본값으로 학습 진행)
            </p>
        `;
        statusElement.className = 'mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded';
    } else {
        statusElement.innerHTML = `
            <p class="text-green-800 text-sm">
                ✅ <strong>실제 등록 사용자</strong> (개인화된 학습 진행)
            </p>
        `;
        statusElement.className = 'mb-4 p-3 bg-green-100 border border-green-300 rounded';
    }
}

// 실제 사용자 등록
async function registerRealUser() {
    try {
        console.log('=== 실제 사용자 등록 시작 ===');
        
        // 사용자 입력값 가져오기
        const userName = document.getElementById('user-name').value.trim();
        const userPhone = document.getElementById('user-phone').value.trim();
        const userExamDate = document.getElementById('user-exam-date').value;
        
        // 입력값 검증
        if (!userName || userName.length < 2) {
            showStatusMessage('이름을 2글자 이상 입력해주세요.', 'error');
            return;
        }
        
        if (!userPhone) {
            showStatusMessage('전화번호를 입력해주세요.', 'error');
            return;
        }
        
        if (!userExamDate) {
            showStatusMessage('시험일을 선택해주세요.', 'error');
            return;
        }
        
        // 시험일 유효성 검증 (오늘 이후)
        const today = new Date();
        const selectedDate = new Date(userExamDate);
        if (selectedDate <= today) {
            showStatusMessage('시험일은 오늘 이후로 설정해주세요.', 'error');
            return;
        }
        
        showStatusMessage('실제 사용자 등록 중...', 'info');
        
        // 고도화된 통계 시스템이 있는 경우
        if (window.advancedStatisticsSystem) {
            const realUserInfo = {
                name: userName,
                phone: userPhone,
                exam_date: userExamDate
            };
            
            const result = await window.advancedStatisticsSystem.registerRealUser(realUserInfo);
            
            if (result.success) {
                isDemoMode = false;
                currentUserInfo = {
                    ...currentUserInfo,
                    userName: userName,
                    is_guest: false
                };
                
                updateUserStatusDisplay();
                showStatusMessage('✅ 실제 사용자 등록이 완료되었습니다!', 'success');
                
                // 통계 데이터 초기화 확인
                console.log('✅ 통계 데이터 초기화 완료');
                
                // 3초 후 대문으로 이동
                setTimeout(() => {
                    window.location.href = '/home';
                }, 3000);
            } else {
                throw new Error(result.message || '사용자 등록 실패');
            }
        } else {
            // 기본 통계 시스템 사용
            const userData = {
                userName: userName,
                userPhone: userPhone,
                examDate: userExamDate,
                isRegistered: true,
                registrationDate: new Date().toISOString()
            };
            
            // LocalStorage에 사용자 정보 저장
            localStorage.setItem('aicu_user_info', JSON.stringify(userData));
            
            // 통계 데이터 초기화
            initializeStatisticsData(userData);
            
            isDemoMode = false;
            currentUserInfo = {
                ...currentUserInfo,
                userName: userName,
                is_guest: false
            };
            
            updateUserStatusDisplay();
            showStatusMessage('✅ 실제 사용자 등록이 완료되었습니다!', 'success');
            
            // 3초 후 대문으로 이동
            setTimeout(() => {
                window.location.href = '/home';
            }, 3000);
        }
        
    } catch (error) {
        console.error('❌ 실제 사용자 등록 실패:', error);
        showStatusMessage('실제 사용자 등록에 실패했습니다: ' + error.message, 'error');
    }
}

// 통계 데이터 초기화 (기본 시스템)
function initializeStatisticsData(userInfo) {
    const statisticsData = {
        userInfo: {
            registrationDate: new Date().toISOString(),
            userName: userInfo.userName,
            examDate: userInfo.examDate,
            userType: 'registered'
        },
        basicLearning: {
            lastQuestion: 0,
            totalAttempted: 0,
            totalCorrect: 0,
            todayAttempted: 0,
            todayCorrect: 0,
            lastStudyDate: new Date().toISOString().split('T')[0]
        },
        largeCategory: {
            재산보험: { lastQuestion: 0, totalAttempted: 0, totalCorrect: 0, todayAttempted: 0, todayCorrect: 0, totalQuestions: 197 },
            특종보험: { lastQuestion: 0, totalAttempted: 0, totalCorrect: 0, todayAttempted: 0, todayCorrect: 0, totalQuestions: 263 },
            배상보험: { lastQuestion: 0, totalAttempted: 0, totalCorrect: 0, todayAttempted: 0, todayCorrect: 0, totalQuestions: 197 },
            해상보험: { lastQuestion: 0, totalAttempted: 0, totalCorrect: 0, todayAttempted: 0, todayCorrect: 0, totalQuestions: 132 }
        }
    };
    
    localStorage.setItem('aicu_progress', JSON.stringify(statisticsData));
    console.log('✅ 기본 통계 데이터 초기화 완료:', statisticsData);
}

// 설정 저장
async function saveSettings() {
    try {
        showStatusMessage('설정 저장 중...', 'info');
        
        // 사용자 정보 업데이트
        const userName = document.getElementById('user-name').value.trim();
        const userPhone = document.getElementById('user-phone').value.trim();
        const userExamDate = document.getElementById('user-exam-date').value;
        
        // LocalStorage에 설정 저장
        const settings = {
            userName: userName,
            userPhone: userPhone,
            examDate: userExamDate,
            dailyGoal: document.querySelector('select[value="50"]')?.value || '50',
            preferredTime: document.querySelector('select[value="afternoon"]')?.value || 'afternoon',
            autoLogin: document.querySelector('input[type="checkbox"]')?.checked || true,
            notifications: document.querySelectorAll('input[type="checkbox"]')[1]?.checked || true,
            dailyGoalNotification: document.querySelectorAll('input[type="checkbox"]')[2]?.checked || true
        };
        
        localStorage.setItem('aicu_settings', JSON.stringify(settings));
        
        // 고도화된 통계 시스템이 있는 경우 설정 업데이트
        if (window.advancedStatisticsSystem) {
            await window.advancedStatisticsSystem.updateSettings(settings);
        }
        
        showStatusMessage('✅ 설정이 저장되었습니다!', 'success');
        
        // 사용자 정보 업데이트
        if (currentUserInfo) {
            currentUserInfo.userName = userName;
            localStorage.setItem('aicu_user_info', JSON.stringify(currentUserInfo));
        }
        
    } catch (error) {
        console.error('❌ 설정 저장 실패:', error);
        showStatusMessage('설정 저장에 실패했습니다: ' + error.message, 'error');
    }
}

// 데이터 내보내기
function exportData() {
    try {
        const progressData = localStorage.getItem('aicu_progress');
        const userInfo = localStorage.getItem('aicu_user_info');
        const settings = localStorage.getItem('aicu_settings');
        
        const exportData = {
            progress: progressData ? JSON.parse(progressData) : null,
            userInfo: userInfo ? JSON.parse(userInfo) : null,
            settings: settings ? JSON.parse(settings) : null,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `aicu_data_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showStatusMessage('✅ 학습 데이터가 내보내기되었습니다!', 'success');
        
    } catch (error) {
        console.error('❌ 데이터 내보내기 실패:', error);
        showStatusMessage('데이터 내보내기에 실패했습니다: ' + error.message, 'error');
    }
}

// 진도 초기화
function resetProgress() {
    if (confirm('정말로 진도를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        try {
            const progressData = localStorage.getItem('aicu_progress');
            if (progressData) {
                const data = JSON.parse(progressData);
                
                // 진도만 초기화 (사용자 정보는 유지)
                data.basicLearning = {
                    lastQuestion: 0,
                    totalAttempted: 0,
                    totalCorrect: 0,
                    todayAttempted: 0,
                    todayCorrect: 0,
                    lastStudyDate: new Date().toISOString().split('T')[0]
                };
                
                data.largeCategory = {
                    재산보험: { lastQuestion: 0, totalAttempted: 0, totalCorrect: 0, todayAttempted: 0, todayCorrect: 0, totalQuestions: 197 },
                    특종보험: { lastQuestion: 0, totalAttempted: 0, totalCorrect: 0, todayAttempted: 0, todayCorrect: 0, totalQuestions: 263 },
                    배상보험: { lastQuestion: 0, totalAttempted: 0, totalCorrect: 0, todayAttempted: 0, todayCorrect: 0, totalQuestions: 197 },
                    해상보험: { lastQuestion: 0, totalAttempted: 0, totalCorrect: 0, todayAttempted: 0, todayCorrect: 0, totalQuestions: 132 }
                };
                
                localStorage.setItem('aicu_progress', JSON.stringify(data));
                
                // 고도화된 통계 시스템이 있는 경우
                if (window.advancedStatisticsSystem) {
                    window.advancedStatisticsSystem.resetProgress();
                }
                
                showStatusMessage('✅ 진도가 초기화되었습니다!', 'success');
            }
        } catch (error) {
            console.error('❌ 진도 초기화 실패:', error);
            showStatusMessage('진도 초기화에 실패했습니다: ' + error.message, 'error');
        }
    }
}

// 모든 데이터 초기화
function resetAll() {
    if (confirm('정말로 모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        try {
            // 모든 LocalStorage 데이터 삭제
            localStorage.removeItem('aicu_progress');
            localStorage.removeItem('aicu_user_info');
            localStorage.removeItem('aicu_settings');
            
            // 고도화된 통계 시스템이 있는 경우
            if (window.advancedStatisticsSystem) {
                window.advancedStatisticsSystem.resetAllData();
            }
            
            showStatusMessage('✅ 모든 데이터가 초기화되었습니다!', 'success');
            
            // 2초 후 페이지 새로고침
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } catch (error) {
            console.error('❌ 데이터 초기화 실패:', error);
            showStatusMessage('데이터 초기화에 실패했습니다: ' + error.message, 'error');
        }
    }
}

// 상태 메시지 표시
function showStatusMessage(message, type = 'info') {
    const statusElement = document.getElementById('statusMessage');
    if (!statusElement) return;
    
    const colors = {
        success: 'text-green-600 bg-green-100 border-green-300',
        error: 'text-red-600 bg-red-100 border-red-300',
        info: 'text-blue-600 bg-blue-100 border-blue-300',
        warning: 'text-yellow-600 bg-yellow-100 border-yellow-300'
    };
    
    statusElement.innerHTML = `
        <div class="p-3 border rounded ${colors[type]}">
            ${message}
        </div>
    `;
    
    // 5초 후 메시지 자동 제거
    setTimeout(() => {
        statusElement.innerHTML = '';
    }, 5000);
}

// D-Day 계산
function calculateDDay(examDate) {
    const today = new Date();
    const exam = new Date(examDate);
    const diffTime = exam - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// 시험일 변경 시 D-Day 업데이트
document.addEventListener('DOMContentLoaded', function() {
    const examDateInput = document.getElementById('user-exam-date');
    const dDayInput = document.getElementById('user-d-day');
    
    if (examDateInput && dDayInput) {
        examDateInput.addEventListener('change', function() {
            const dDay = calculateDDay(this.value);
            dDayInput.value = `D-${dDay}`;
        });
    }
});

console.log('✅ 설정 페이지 JavaScript 로드 완료');
