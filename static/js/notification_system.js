/**
 * NotificationSystem - 실시간 알림 시스템
 * Phase 3: 사용자 경험 개선
 * 077번 계획서 기반 구현
 */

class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.isEnabled = true;
        this.notificationContainer = null;
        this.maxNotifications = 5;
        this.autoHideDelay = 5000; // 5초 후 자동 숨김
        
        this.init();
    }
    
    // 알림 시스템 초기화
    init() {
        this.createNotificationContainer();
        this.loadSettings();
        console.log('✅ 알림 시스템 초기화 완료');
    }
    
    // 알림 컨테이너 생성
    createNotificationContainer() {
        // 기존 컨테이너가 있으면 제거
        const existingContainer = document.getElementById('notification-container');
        if (existingContainer) {
            existingContainer.remove();
        }
        
        // 새로운 알림 컨테이너 생성
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.id = 'notification-container';
        this.notificationContainer.className = 'fixed top-4 right-4 z-50 space-y-2 max-w-sm';
        this.notificationContainer.style.cssText = `
            position: fixed;
            top: 1rem;
            right: 1rem;
            z-index: 9999;
            max-width: 400px;
            pointer-events: none;
        `;
        
        document.body.appendChild(this.notificationContainer);
    }
    
    // 설정 로드
    loadSettings() {
        try {
            const settings = localStorage.getItem('aicu_notification_settings');
            if (settings) {
                const parsedSettings = JSON.parse(settings);
                this.isEnabled = parsedSettings.isEnabled !== false;
                this.autoHideDelay = parsedSettings.autoHideDelay || 5000;
            }
        } catch (error) {
            console.error('알림 설정 로드 실패:', error);
        }
    }
    
    // 설정 저장
    saveSettings() {
        try {
            const settings = {
                isEnabled: this.isEnabled,
                autoHideDelay: this.autoHideDelay
            };
            localStorage.setItem('aicu_notification_settings', JSON.stringify(settings));
        } catch (error) {
            console.error('알림 설정 저장 실패:', error);
        }
    }
    
    // 알림 표시
    show(message, type = 'info', duration = null) {
        if (!this.isEnabled) return;
        
        const notification = this.createNotification(message, type);
        this.notifications.push(notification);
        
        // 최대 알림 개수 제한
        if (this.notifications.length > this.maxNotifications) {
            const oldNotification = this.notifications.shift();
            this.removeNotification(oldNotification);
        }
        
        // 자동 숨김 설정
        const hideDelay = duration || this.autoHideDelay;
        if (hideDelay > 0) {
            setTimeout(() => {
                this.hide(notification.id);
            }, hideDelay);
        }
        
        return notification.id;
    }
    
    // 알림 생성
    createNotification(message, type) {
        const notificationId = 'notification-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        const notification = document.createElement('div');
        notification.id = notificationId;
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            padding: 16px;
            margin-bottom: 8px;
            border-left: 4px solid ${this.getTypeColor(type)};
            transform: translateX(100%);
            transition: transform 0.3s ease;
            pointer-events: auto;
            max-width: 400px;
            word-wrap: break-word;
        `;
        
        // 아이콘과 메시지
        const icon = this.getTypeIcon(type);
        notification.innerHTML = `
            <div class="flex items-start justify-between">
                <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0 text-lg">${icon}</div>
                    <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900">${message}</p>
                    </div>
                </div>
                <button onclick="window.notificationSystem.hide('${notificationId}')" 
                        class="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600">
                    <span class="text-lg">×</span>
                </button>
            </div>
        `;
        
        this.notificationContainer.appendChild(notification);
        
        // 애니메이션 효과
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        return {
            id: notificationId,
            element: notification,
            type: type,
            message: message,
            timestamp: Date.now()
        };
    }
    
    // 알림 숨기기
    hide(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            this.removeNotification(notification);
            this.notifications = this.notifications.filter(n => n.id !== notificationId);
        }
    }
    
    // 알림 제거
    removeNotification(notification) {
        if (notification.element) {
            notification.element.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.element.parentNode) {
                    notification.element.parentNode.removeChild(notification.element);
                }
            }, 300);
        }
    }
    
    // 모든 알림 숨기기
    hideAll() {
        this.notifications.forEach(notification => {
            this.removeNotification(notification);
        });
        this.notifications = [];
    }
    
    // 타입별 색상
    getTypeColor(type) {
        const colors = {
            success: '#10B981',
            error: '#EF4444',
            warning: '#F59E0B',
            info: '#3B82F6'
        };
        return colors[type] || colors.info;
    }
    
    // 타입별 아이콘
    getTypeIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
    
    // 성공 알림
    success(message, duration = null) {
        return this.show(message, 'success', duration);
    }
    
    // 오류 알림
    error(message, duration = null) {
        return this.show(message, 'error', duration);
    }
    
    // 경고 알림
    warning(message, duration = null) {
        return this.show(message, 'warning', duration);
    }
    
    // 정보 알림
    info(message, duration = null) {
        return this.show(message, 'info', duration);
    }
    
    // 통계 관련 알림
    showStatsNotification(stats) {
        const message = `📊 통계 업데이트: ${stats.total_questions_solved}개 풀이, 정답률 ${stats.overall_accuracy}%`;
        return this.success(message, 3000);
    }
    
    // 이어풀기 알림
    showContinueLearningNotification(category, nextQuestion) {
        const categoryName = category === 'basic_learning' ? '기본학습' : category;
        const message = `🔄 ${categoryName} 이어풀기: ${nextQuestion}번 문제부터 시작합니다.`;
        return this.info(message, 4000);
    }
    
    // 사용자 등록 알림
    showUserRegistrationNotification(userName) {
        const message = `👤 ${userName}님, 실제 사용자로 등록되었습니다!`;
        return this.success(message, 5000);
    }
    
    // 성능 알림
    showPerformanceNotification(performanceTime, queueLength) {
        const message = `⚡ 성능 최적화: ${performanceTime.toFixed(2)}ms, 큐 ${queueLength}개 처리`;
        return this.info(message, 3000);
    }
    
    // 설정 변경
    updateSettings(settings) {
        if (settings.hasOwnProperty('isEnabled')) {
            this.isEnabled = settings.isEnabled;
        }
        if (settings.hasOwnProperty('autoHideDelay')) {
            this.autoHideDelay = settings.autoHideDelay;
        }
        this.saveSettings();
    }
    
    // 알림 시스템 테스트
    testSystem() {
        console.log('=== 알림 시스템 테스트 시작 ===');
        
        try {
            // 다양한 타입의 알림 테스트
            this.success('성공 알림 테스트', 2000);
            
            setTimeout(() => {
                this.error('오류 알림 테스트', 2000);
            }, 500);
            
            setTimeout(() => {
                this.warning('경고 알림 테스트', 2000);
            }, 1000);
            
            setTimeout(() => {
                this.info('정보 알림 테스트', 2000);
            }, 1500);
            
            setTimeout(() => {
                this.showStatsNotification({
                    total_questions_solved: 25,
                    overall_accuracy: 85
                });
            }, 2000);
            
            console.log('✅ 알림 시스템 테스트 완료');
            return true;
        } catch (error) {
            console.error('❌ 알림 시스템 테스트 실패:', error);
            return false;
        }
    }
    
    // 시스템 상태 확인
    getStatus() {
        return {
            isEnabled: this.isEnabled,
            notificationCount: this.notifications.length,
            maxNotifications: this.maxNotifications,
            autoHideDelay: this.autoHideDelay,
            containerExists: !!this.notificationContainer
        };
    }
}

// 전역 인스턴스 생성
window.notificationSystem = new NotificationSystem();

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('페이지 로드 완료 - 알림 시스템 초기화');
    
    // 알림 시스템이 이미 초기화되었는지 확인
    if (!window.notificationSystem) {
        window.notificationSystem = new NotificationSystem();
    }
});
