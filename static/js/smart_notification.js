// 스마트 알림 시스템 - 고급통계 기능 2단계
class SmartNotification {
    constructor() {
        this.isInitialized = false;
        this.notificationSettings = {};
        this.notificationHistory = [];
        this.scheduledNotifications = [];
        this.notificationTypes = {};
        console.log('=== 스마트 알림 시스템 초기화 ===');
    }

    async initialize() {
        try {
            console.log('🎯 스마트 알림 시스템 초기화 시작...');
            
            // 사용자 정보 로드
            await this.loadUserInfo();
            
            // 알림 설정 로드
            await this.loadNotificationSettings();
            
            // 알림 히스토리 로드
            await this.loadNotificationHistory();
            
            // 알림 타입 정의
            await this.defineNotificationTypes();
            
            // 브라우저 알림 권한 요청
            await this.requestNotificationPermission();
            
            this.isInitialized = true;
            console.log('✅ 스마트 알림 시스템 초기화 완료');
            
            return { success: true, message: '스마트 알림 시스템이 성공적으로 초기화되었습니다.' };
        } catch (error) {
            console.error('❌ 스마트 알림 시스템 초기화 실패:', error);
            return { success: false, message: error.message };
        }
    }

    async loadUserInfo() {
        try {
            const userInfo = localStorage.getItem('aicu_user_info');
            if (userInfo) {
                this.userInfo = JSON.parse(userInfo);
            } else {
                this.userInfo = { userName: 'guest', examDate: '2025-09-13', is_guest: true };
            }
            console.log('✅ 사용자 정보 로드 완료:', this.userInfo);
        } catch (error) {
            console.error('❌ 사용자 정보 로드 실패:', error);
            this.userInfo = { userName: 'guest', examDate: '2025-09-13', is_guest: true };
        }
    }

    async loadNotificationSettings() {
        try {
            const settings = localStorage.getItem('aicu_notification_settings');
            if (settings) {
                this.notificationSettings = JSON.parse(settings);
            } else {
                this.notificationSettings = this.getDefaultNotificationSettings();
            }
            console.log('✅ 알림 설정 로드 완료:', this.notificationSettings);
        } catch (error) {
            console.error('❌ 알림 설정 로드 실패:', error);
            this.notificationSettings = this.getDefaultNotificationSettings();
        }
    }

    async loadNotificationHistory() {
        try {
            const history = localStorage.getItem('aicu_notification_history');
            if (history) {
                this.notificationHistory = JSON.parse(history);
            }
            console.log('✅ 알림 히스토리 로드 완료:', this.notificationHistory.length, '개');
        } catch (error) {
            console.error('❌ 알림 히스토리 로드 실패:', error);
            this.notificationHistory = [];
        }
    }

    async defineNotificationTypes() {
        this.notificationTypes = {
            study_reminder: {
                name: '학습 알림',
                description: '정기적인 학습 시간 알림',
                priority: 'medium',
                icon: '📚',
                defaultEnabled: true
            },
            goal_achievement: {
                name: '목표 달성',
                description: '목표 달성 시 축하 알림',
                priority: 'high',
                icon: '🎉',
                defaultEnabled: true
            },
            weak_area: {
                name: '취약 영역',
                description: '취약 영역 학습 권장',
                priority: 'high',
                icon: '⚠️',
                defaultEnabled: true
            },
            learning_pattern: {
                name: '학습 패턴',
                description: '학습 패턴 개선 제안',
                priority: 'medium',
                icon: '📊',
                defaultEnabled: true
            },
            exam_reminder: {
                name: '시험 알림',
                description: '시험 일정 관련 알림',
                priority: 'high',
                icon: '📅',
                defaultEnabled: true
            },
            streak_reminder: {
                name: '연속 학습',
                description: '연속 학습 유지 알림',
                priority: 'medium',
                icon: '🔥',
                defaultEnabled: true
            }
        };
        console.log('✅ 알림 타입 정의 완료');
    }

    async requestNotificationPermission() {
        try {
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                console.log('알림 권한 상태:', permission);
                return permission === 'granted';
            }
            return false;
        } catch (error) {
            console.error('❌ 알림 권한 요청 실패:', error);
            return false;
        }
    }

    // 개인화된 학습 알림
    async sendPersonalizedReminder(userId, type = 'study_reminder') {
        try {
            console.log('🎯 개인화된 학습 알림 전송 시작...');
            
            if (!this.isInitialized) {
                await this.initialize();
            }

            // 알림 설정 확인
            if (!this.notificationSettings[type]?.enabled) {
                console.log('알림이 비활성화되어 있습니다:', type);
                return { success: false, message: '알림이 비활성화되어 있습니다.' };
            }

            // 개인화된 메시지 생성
            const message = await this.generatePersonalizedMessage(type);
            
            // 알림 전송
            const notification = await this.sendNotification(message);
            
            // 알림 히스토리에 저장
            this.saveNotificationToHistory(type, message, notification);
            
            console.log('✅ 개인화된 학습 알림 전송 완료:', message);
            return { success: true, notification: notification };
            
        } catch (error) {
            console.error('❌ 개인화된 학습 알림 전송 실패:', error);
            return { success: false, message: error.message };
        }
    }

    // 목표 달성 알림
    async sendGoalAchievementAlert(userId, achievement) {
        try {
            console.log('🎯 목표 달성 알림 전송 시작...');
            
            if (!this.isInitialized) {
                await this.initialize();
            }

            const type = 'goal_achievement';
            
            // 알림 설정 확인
            if (!this.notificationSettings[type]?.enabled) {
                return { success: false, message: '목표 달성 알림이 비활성화되어 있습니다.' };
            }

            // 목표 달성 메시지 생성
            const message = this.generateGoalAchievementMessage(achievement);
            
            // 알림 전송
            const notification = await this.sendNotification(message);
            
            // 알림 히스토리에 저장
            this.saveNotificationToHistory(type, message, notification);
            
            console.log('✅ 목표 달성 알림 전송 완료:', message);
            return { success: true, notification: notification };
            
        } catch (error) {
            console.error('❌ 목표 달성 알림 전송 실패:', error);
            return { success: false, message: error.message };
        }
    }

    // 취약 영역 학습 권장
    async sendWeakAreaRecommendation(userId, area) {
        try {
            console.log('🎯 취약 영역 학습 권장 알림 전송 시작...');
            
            if (!this.isInitialized) {
                await this.initialize();
            }

            const type = 'weak_area';
            
            // 알림 설정 확인
            if (!this.notificationSettings[type]?.enabled) {
                return { success: false, message: '취약 영역 알림이 비활성화되어 있습니다.' };
            }

            // 취약 영역 메시지 생성
            const message = this.generateWeakAreaMessage(area);
            
            // 알림 전송
            const notification = await this.sendNotification(message);
            
            // 알림 히스토리에 저장
            this.saveNotificationToHistory(type, message, notification);
            
            console.log('✅ 취약 영역 학습 권장 알림 전송 완료:', message);
            return { success: true, notification: notification };
            
        } catch (error) {
            console.error('❌ 취약 영역 학습 권장 알림 전송 실패:', error);
            return { success: false, message: error.message };
        }
    }

    // 학습 패턴 개선 제안
    async sendLearningPatternSuggestion(userId, suggestion) {
        try {
            console.log('🎯 학습 패턴 개선 제안 알림 전송 시작...');
            
            if (!this.isInitialized) {
                await this.initialize();
            }

            const type = 'learning_pattern';
            
            // 알림 설정 확인
            if (!this.notificationSettings[type]?.enabled) {
                return { success: false, message: '학습 패턴 알림이 비활성화되어 있습니다.' };
            }

            // 학습 패턴 메시지 생성
            const message = this.generateLearningPatternMessage(suggestion);
            
            // 알림 전송
            const notification = await this.sendNotification(message);
            
            // 알림 히스토리에 저장
            this.saveNotificationToHistory(type, message, notification);
            
            console.log('✅ 학습 패턴 개선 제안 알림 전송 완료:', message);
            return { success: true, notification: notification };
            
        } catch (error) {
            console.error('❌ 학습 패턴 개선 제안 알림 전송 실패:', error);
            return { success: false, message: error.message };
        }
    }

    // 스케줄된 알림 설정
    async scheduleNotification(userId, type, schedule) {
        try {
            console.log('🎯 스케줄된 알림 설정 시작...');
            
            if (!this.isInitialized) {
                await this.initialize();
            }

            const scheduledNotification = {
                id: this.generateNotificationId(),
                userId: userId,
                type: type,
                schedule: schedule,
                message: await this.generatePersonalizedMessage(type),
                status: 'scheduled',
                createdAt: new Date().toISOString()
            };

            this.scheduledNotifications.push(scheduledNotification);
            
            // 스케줄 저장
            this.saveScheduledNotifications();
            
            // 실제 스케줄링 (브라우저 환경에서는 제한적)
            this.scheduleBrowserNotification(scheduledNotification);
            
            console.log('✅ 스케줄된 알림 설정 완료:', scheduledNotification);
            return { success: true, scheduledNotification: scheduledNotification };
            
        } catch (error) {
            console.error('❌ 스케줄된 알림 설정 실패:', error);
            return { success: false, message: error.message };
        }
    }

    // 알림 설정 업데이트
    async updateNotificationSettings(userId, settings) {
        try {
            console.log('🎯 알림 설정 업데이트 시작...');
            
            if (!this.isInitialized) {
                await this.initialize();
            }

            // 기존 설정과 병합
            this.notificationSettings = { ...this.notificationSettings, ...settings };
            
            // 설정 저장
            localStorage.setItem('aicu_notification_settings', JSON.stringify(this.notificationSettings));
            
            console.log('✅ 알림 설정 업데이트 완료:', this.notificationSettings);
            return { success: true, settings: this.notificationSettings };
            
        } catch (error) {
            console.error('❌ 알림 설정 업데이트 실패:', error);
            return { success: false, message: error.message };
        }
    }

    // 개인화된 메시지 생성
    async generatePersonalizedMessage(type) {
        const userName = this.userInfo.userName || '학습자';
        const currentTime = new Date().getHours();
        const timeGreeting = this.getTimeGreeting(currentTime);
        
        const messages = {
            study_reminder: {
                title: `${timeGreeting}, ${userName}님!`,
                body: '오늘도 학습을 시작해보세요. 꾸준한 학습이 성공의 열쇠입니다.',
                icon: '📚'
            },
            exam_reminder: {
                title: '시험 준비 알림',
                body: '시험까지 남은 시간을 확인하고 계획을 세워보세요.',
                icon: '📅'
            },
            streak_reminder: {
                title: '연속 학습 유지',
                body: '연속 학습 기록을 이어가보세요. 작은 노력이 큰 성과를 만듭니다.',
                icon: '🔥'
            }
        };
        
        return messages[type] || messages.study_reminder;
    }

    // 목표 달성 메시지 생성
    generateGoalAchievementMessage(achievement) {
        const userName = this.userInfo.userName || '학습자';
        
        return {
            title: '🎉 목표 달성 축하!',
            body: `${userName}님, ${achievement.goal} 목표를 달성했습니다! 정말 대단합니다!`,
            icon: '🎉',
            data: achievement
        };
    }

    // 취약 영역 메시지 생성
    generateWeakAreaMessage(area) {
        const userName = this.userInfo.userName || '학습자';
        
        return {
            title: '⚠️ 취약 영역 학습 권장',
            body: `${userName}님, ${area.category} 영역에서 개선이 필요합니다. 집중 학습을 권장합니다.`,
            icon: '⚠️',
            data: area
        };
    }

    // 학습 패턴 메시지 생성
    generateLearningPatternMessage(suggestion) {
        const userName = this.userInfo.userName || '학습자';
        
        return {
            title: '📊 학습 패턴 개선 제안',
            body: `${userName}님, ${suggestion.title}. ${suggestion.description}`,
            icon: '📊',
            data: suggestion
        };
    }

    // 알림 전송
    async sendNotification(message) {
        try {
            if ('Notification' in window && Notification.permission === 'granted') {
                const notification = new Notification(message.title, {
                    body: message.body,
                    icon: '/static/images/notification-icon.png', // 기본 아이콘
                    badge: '/static/images/badge-icon.png',
                    tag: 'aicu-notification',
                    requireInteraction: false,
                    silent: false
                });
                
                // 알림 클릭 이벤트
                notification.onclick = () => {
                    window.focus();
                    notification.close();
                    this.handleNotificationClick(message);
                };
                
                return notification;
            } else {
                // 브라우저 알림이 불가능한 경우 내부 알림 시스템 사용
                return this.showInternalNotification(message);
            }
        } catch (error) {
            console.error('❌ 알림 전송 실패:', error);
            return this.showInternalNotification(message);
        }
    }

    // 내부 알림 시스템
    showInternalNotification(message) {
        // 페이지 내 알림 표시 (예: 토스트 메시지)
        const notificationElement = document.createElement('div');
        notificationElement.className = 'aicu-notification-toast';
        notificationElement.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${message.icon}</div>
                <div class="notification-text">
                    <div class="notification-title">${message.title}</div>
                    <div class="notification-body">${message.body}</div>
                </div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // 스타일 적용
        notificationElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notificationElement);
        
        // 5초 후 자동 제거
        setTimeout(() => {
            if (notificationElement.parentElement) {
                notificationElement.remove();
            }
        }, 5000);
        
        return notificationElement;
    }

    // 알림 클릭 처리
    handleNotificationClick(message) {
        console.log('알림 클릭됨:', message);
        
        // 알림 타입에 따른 페이지 이동
        switch (message.type) {
            case 'study_reminder':
                try {
                    window.location.replace('/home');
                } catch (error) {
                    window.location.assign('/home');
                }
                break;
            case 'weak_area':
                try {
                    window.location.replace('/advanced-statistics');
                } catch (error) {
                    window.location.assign('/advanced-statistics');
                }
                break;
            case 'goal_achievement':
                try {
                    window.location.replace('/advanced-statistics');
                } catch (error) {
                    window.location.assign('/advanced-statistics');
                }
                break;
            default:
                try {
                    window.location.replace('/home');
                } catch (error) {
                    window.location.assign('/home');
                }
        }
    }

    // 스케줄된 알림 처리
    scheduleBrowserNotification(scheduledNotification) {
        // 브라우저 환경에서는 제한적이므로 간단한 타이머 사용
        const now = new Date();
        const scheduleTime = new Date(scheduledNotification.schedule.time);
        const delay = scheduleTime.getTime() - now.getTime();
        
        if (delay > 0) {
            setTimeout(() => {
                this.sendNotification(scheduledNotification.message);
                this.markNotificationAsSent(scheduledNotification.id);
            }, delay);
        }
    }

    // 알림 히스토리 저장
    saveNotificationToHistory(type, message, notification) {
        const historyEntry = {
            id: this.generateNotificationId(),
            type: type,
            message: message,
            timestamp: new Date().toISOString(),
            status: 'sent',
            userId: this.userInfo.userName || 'guest'
        };
        
        this.notificationHistory.push(historyEntry);
        
        // 최근 100개만 유지
        if (this.notificationHistory.length > 100) {
            this.notificationHistory = this.notificationHistory.slice(-100);
        }
        
        localStorage.setItem('aicu_notification_history', JSON.stringify(this.notificationHistory));
    }

    // 스케줄된 알림 저장
    saveScheduledNotifications() {
        localStorage.setItem('aicu_scheduled_notifications', JSON.stringify(this.scheduledNotifications));
    }

    // 알림 전송 완료 표시
    markNotificationAsSent(notificationId) {
        const notification = this.scheduledNotifications.find(n => n.id === notificationId);
        if (notification) {
            notification.status = 'sent';
            notification.sentAt = new Date().toISOString();
            this.saveScheduledNotifications();
        }
    }

    // 유틸리티 메서드들
    getDefaultNotificationSettings() {
        const settings = {};
        
        Object.keys(this.notificationTypes).forEach(type => {
            settings[type] = {
                enabled: this.notificationTypes[type].defaultEnabled,
                priority: this.notificationTypes[type].priority,
                schedule: {
                    enabled: false,
                    time: '09:00',
                    days: ['mon', 'tue', 'wed', 'thu', 'fri']
                }
            };
        });
        
        return settings;
    }

    getTimeGreeting(hour) {
        if (hour >= 5 && hour < 12) return '좋은 아침';
        if (hour >= 12 && hour < 18) return '좋은 오후';
        if (hour >= 18 && hour < 22) return '좋은 저녁';
        return '좋은 밤';
    }

    generateNotificationId() {
        return 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 공개 API 메서드들
    async sendStudyReminder(userId) {
        return await this.sendPersonalizedReminder(userId, 'study_reminder');
    }

    async sendExamReminder(userId) {
        return await this.sendPersonalizedReminder(userId, 'exam_reminder');
    }

    async sendStreakReminder(userId) {
        return await this.sendPersonalizedReminder(userId, 'streak_reminder');
    }

    getNotificationSettings(userId) {
        return this.notificationSettings;
    }

    getNotificationHistory(userId) {
        return this.notificationHistory.filter(n => n.userId === userId);
    }

    getScheduledNotifications(userId) {
        return this.scheduledNotifications.filter(n => n.userId === userId);
    }

    async enableNotificationType(userId, type) {
        const settings = { [type]: { enabled: true } };
        return await this.updateNotificationSettings(userId, settings);
    }

    async disableNotificationType(userId, type) {
        const settings = { [type]: { enabled: false } };
        return await this.updateNotificationSettings(userId, settings);
    }

    getNotificationTypes() {
        return this.notificationTypes;
    }

    // 알림 테스트
    async testNotification(type = 'study_reminder') {
        console.log('🧪 알림 테스트 시작:', type);
        return await this.sendPersonalizedReminder(this.userInfo.userName || 'guest', type);
    }
}

// 전역 인스턴스 생성
window.smartNotification = new SmartNotification();
console.log('🎯 스마트 알림 시스템 모듈 로드 완료');








