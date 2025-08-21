// 게스트 모드 관리 시스템
// 파일: static/js/guest_mode_defaults.js

class GuestModeManager {
    static applyDefaults() {
        const userInfo = localStorage.getItem('aicu_user_data');
        const statistics = localStorage.getItem('aicu_statistics');
        const registrationCompleted = localStorage.getItem('aicu_registration_completed');
        
        // localStorage가 완전히 클리어된 경우에만 기본값 적용
        if (!userInfo && !statistics && !registrationCompleted) {
            const registrationTimestamp = new Date().toISOString();
            
            const defaultUserData = {
                name: '게스트',
                registration_date: registrationTimestamp.split('T')[0],
                exam_subject: 'AICU',
                exam_date: '2025-09-13',
                phone: '010-1234-5678',
                is_guest: true,
                created_at: registrationTimestamp
            };
            
            // 등록 완료 플래그 절대적 저장
            const registrationData = {
                type: 'guest',
                registration_timestamp: registrationTimestamp,
                is_permanent: true, // 절대적 보존 플래그
                user_name: '게스트',
                registration_date: registrationTimestamp.split('T')[0]
            };
            
            localStorage.setItem('aicu_user_data', JSON.stringify(defaultUserData));
            localStorage.setItem('aicu_registration_completed', JSON.stringify(registrationData));
            localStorage.setItem('aicu_registration_timestamp', registrationTimestamp);
            
            this.initializeStatistics(defaultUserData);
            
            console.log('✅ 게스트 모드 기본값 적용 완료 (등록 시점 절대적 저장)');
            console.log('📅 등록 시점:', registrationTimestamp);
            return defaultUserData;
        }
        
        return userInfo ? JSON.parse(userInfo) : null;
    }
    
    static initializeStatistics(userData) {
        const today = new Date().toISOString().split('T')[0];
        
        // 기존 통계가 없으면 초기화
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
        
        // 예상점수 계산에 사용되는 실시간 데이터도 초기화
        if (!localStorage.getItem('aicu_real_time_data')) {
            const initialRealTimeData = {
                categories: {
                    "06재산보험": { total: 0, correct: 0, incorrect: 0, accuracy: 0 },
                    "07특종보험": { total: 0, correct: 0, incorrect: 0, accuracy: 0 },
                    "08배상책임보험": { total: 0, correct: 0, incorrect: 0, accuracy: 0 },
                    "09해상보험": { total: 0, correct: 0, incorrect: 0, accuracy: 0 }
                },
                last_updated: new Date().toISOString()
            };
            
            localStorage.setItem('aicu_real_time_data', JSON.stringify(initialRealTimeData));
        }
        
        // 학습 로그 초기화 (누락된 키)
        if (!localStorage.getItem('aicu_learning_log')) {
            const initialLearningLog = {
                user_id: userData.name,
                registration_date: userData.registration_date,
                logs: [],
                last_updated: new Date().toISOString()
            };
            
            localStorage.setItem('aicu_learning_log', JSON.stringify(initialLearningLog));
        }
    }
    
    static isGuestMode() {
        const userData = JSON.parse(localStorage.getItem('aicu_user_data') || '{}');
        return userData.is_guest === true;
    }
    
    static updateGuestToUser(userData) {
        userData.is_guest = false;
        userData.updated_at = new Date().toISOString();
        
        // 기존 등록 시점 유지하면서 사용자 정보 업데이트
        const registrationCompleted = localStorage.getItem('aicu_registration_completed');
        const registrationTimestamp = localStorage.getItem('aicu_registration_timestamp');
        
        if (registrationCompleted && registrationTimestamp) {
            const registration = JSON.parse(registrationCompleted);
            registration.user_name = userData.name;
            registration.type = 'registered';
            registration.updated_at = new Date().toISOString();
            
            localStorage.setItem('aicu_registration_completed', JSON.stringify(registration));
        }
        
        localStorage.setItem('aicu_user_data', JSON.stringify(userData));
        console.log('✅ 게스트 모드에서 실제 사용자로 전환 완료 (등록 시점 유지)');
        console.log('📅 원본 등록 시점:', registrationTimestamp);
    }
    
    static getGuestInfo() {
        const userData = JSON.parse(localStorage.getItem('aicu_user_data') || '{}');
        return {
            name: userData.name || '게스트',
            exam_date: userData.exam_date || '2025-09-13',
            is_guest: userData.is_guest || true
        };
    }
}

// 페이지 로드 시 자동 실행
document.addEventListener('DOMContentLoaded', () => {
    GuestModeManager.applyDefaults();
});

// 전역 인스턴스 생성
window.GuestModeManager = GuestModeManager;
