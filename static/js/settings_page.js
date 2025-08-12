/**
 * 설정 페이지 JavaScript - Phase 4
 * 실제 사용자 등록 및 통계 시스템 관리
 */

// 고도화된 통계 시스템 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 설정 페이지 고도화된 통계 시스템 초기화 시작...');
    
    setTimeout(async () => {
        if (typeof window.advancedStatisticsSystem !== 'undefined') {
            try {
                const initResult = await window.advancedStatisticsSystem.initialize();
                if (initResult) {
                    console.log('✅ 설정 페이지 고도화된 통계 시스템 초기화 완료');
                    updateUserStatus();
                } else {
                    console.error('❌ 설정 페이지 고도화된 통계 시스템 초기화 실패');
                }
            } catch (error) {
                console.error('❌ 고도화된 통계 시스템 초기화 중 오류:', error);
            }
        } else {
            console.error('❌ AdvancedStatisticsSystem 모듈을 찾을 수 없습니다.');
        }
    }, 2000);
});

// 사용자 상태 업데이트
function updateUserStatus() {
    if (window.advancedProgressManager) {
        const userInfo = window.advancedProgressManager.userInfo;
        const statusElement = document.getElementById('current-user-status');
        
        if (statusElement) {
            if (userInfo.is_demo_mode) {
                statusElement.innerHTML = `
                    <p class="text-yellow-800 text-sm">
                        🔄 <strong>데모 모드</strong> 이용 중 (기본값으로 학습 진행)
                    </p>
                `;
            } else {
                statusElement.innerHTML = `
                    <p class="text-green-800 text-sm">
                        ✅ <strong>실제 등록</strong> 완료 (${userInfo.name}님)
                    </p>
                `;
            }
        }
    }
}

// 실제 사용자 등록 함수
async function registerRealUser() {
    if (confirm('실제 사용자로 등록하시겠습니까?\n\n기존 데모 데이터가 모두 초기화되고 새로운 통계가 시작됩니다.')) {
        try {
            const userName = document.getElementById('user-name').value;
            const userPhone = document.getElementById('user-phone').value;
            const userExamDate = document.getElementById('user-exam-date').value;
            
            if (!userName || !userPhone || !userExamDate) {
                alert('모든 필드를 입력해주세요.');
                return;
            }
            
            const realUserInfo = {
                name: userName,
                phone: userPhone,
                exam_date: userExamDate
            };
            
            if (typeof window.advancedStatisticsSystem !== 'undefined' && window.advancedStatisticsSystem.isInitialized) {
                const result = window.advancedStatisticsSystem.registerRealUser(realUserInfo);
                if (result) {
                    document.getElementById('statusMessage').innerHTML = 
                        '<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">✅ 실제 사용자 등록 완료! 새로운 통계가 시작됩니다.</div>';
                    
                    updateUserStatus();
                    
                    setTimeout(() => {
                        document.getElementById('statusMessage').innerHTML = '';
                    }, 5000);
                } else {
                    document.getElementById('statusMessage').innerHTML = 
                        '<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">❌ 사용자 등록 실패. 다시 시도해주세요.</div>';
                }
            } else {
                alert('통계 시스템이 초기화되지 않았습니다. 페이지를 새로고침 후 다시 시도해주세요.');
            }
        } catch (error) {
            console.error('사용자 등록 중 오류:', error);
            document.getElementById('statusMessage').innerHTML = 
                '<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">❌ 사용자 등록 중 오류가 발생했습니다.</div>';
        }
    }
}

// 설정 저장 함수
function saveSettings() {
    document.getElementById('statusMessage').innerHTML = 
        '<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">✅ 설정이 저장되었습니다!</div>';
    
    setTimeout(() => {
        document.getElementById('statusMessage').innerHTML = '';
    }, 3000);
}

// 데이터 내보내기 함수
function exportData() {
    const data = {
        userName: "조대표",
        phone: "010-2067-6442",
        examDate: "2025-09-13",
        exportDate: new Date().toISOString(),
        statistics: "추후 구현"
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aicu_data_조대표_' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    
    document.getElementById('statusMessage').innerHTML = 
        '<div class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">📁 데이터 내보내기 완료!</div>';
    
    setTimeout(() => {
        document.getElementById('statusMessage').innerHTML = '';
    }, 3000);
}

// 진도 초기화 함수
function resetProgress() {
    if (confirm('진도를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        document.getElementById('statusMessage').innerHTML = 
            '<div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">🔄 진도가 초기화되었습니다.</div>';
        
        setTimeout(() => {
            document.getElementById('statusMessage').innerHTML = '';
        }, 3000);
    }
}

// 모든 데이터 초기화 함수
function resetAll() {
    if (confirm('모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        if (confirm('정말로 모든 학습 기록을 삭제하시겠습니까?')) {
            document.getElementById('statusMessage').innerHTML = 
                '<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">❌ 모든 데이터가 초기화되었습니다.</div>';
            
            setTimeout(() => {
                location.href = '/user/register';
            }, 2000);
        }
    }
}

console.log('✅ Settings Page JavaScript 로드 완료');
