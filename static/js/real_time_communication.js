// real_time_communication.js - 실시간 통신 시스템 (3단계)
class RealTimeCommunication {
    constructor() {
        this.connections = {};
        this.messageQueue = [];
        this.webSocket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 3000; // 3초
        console.log('=== 실시간 통신 시스템 초기화 ===');
    }

    async initialize() {
        try {
            console.log('🎯 실시간 통신 시스템 초기화 시작...');
            
            // WebSocket 연결 초기화
            await this.initializeWebSocket();
            
            // 메시지 큐 처리 시작
            this.startMessageQueueProcessor();
            
            console.log('✅ 실시간 통신 시스템 초기화 완료');
            
        } catch (error) {
            console.error('❌ 실시간 통신 시스템 초기화 실패:', error);
            throw error;
        }
    }

    async initializeWebSocket(groupId = null) {
        try {
            console.log('🔌 WebSocket 연결 초기화:', groupId);
            
            // 실제 구현에서는 WebSocket 서버 URL 사용
            // 현재는 시뮬레이션 모드
            const wsUrl = groupId ? `ws://localhost:5000/ws/${groupId}` : 'ws://localhost:5000/ws';
            
            // WebSocket 연결 시뮬레이션
            this.simulateWebSocketConnection(groupId);
            
            return { success: true, connectionId: `conn_${Date.now()}` };
            
        } catch (error) {
            console.error('❌ WebSocket 연결 실패:', error);
            return { success: false, message: error.message };
        }
    }

    simulateWebSocketConnection(groupId) {
        // WebSocket 연결 시뮬레이션
        this.isConnected = true;
        this.connections[groupId] = {
            id: `conn_${Date.now()}`,
            groupId: groupId,
            isActive: true,
            connectedAt: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        };
        
        console.log('✅ WebSocket 연결 시뮬레이션 완료:', groupId);
    }

    async sendChatMessage(groupId, message) {
        try {
            console.log('📤 채팅 메시지 전송:', groupId);
            
            if (!this.connections[groupId]) {
                await this.initializeWebSocket(groupId);
            }

            const chatMessage = {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'chat',
                groupId: groupId,
                userId: this.getCurrentUserId(),
                message: message,
                timestamp: new Date().toISOString(),
                status: 'sending'
            };

            // 메시지 큐에 추가
            this.messageQueue.push(chatMessage);
            
            // 즉시 전송 시도
            await this.processMessageQueue();
            
            console.log('✅ 채팅 메시지 전송 완료');
            return { success: true, message: chatMessage };
            
        } catch (error) {
            console.error('❌ 채팅 메시지 전송 실패:', error);
            return { success: false, message: error.message };
        }
    }

    async shareScreen(groupId) {
        try {
            console.log('🖥️ 화면 공유 시작:', groupId);
            
            if (!this.connections[groupId]) {
                await this.initializeWebSocket(groupId);
            }

            // 화면 공유 권한 요청
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });

            const screenShareMessage = {
                id: `screen_${Date.now()}`,
                type: 'screen_share',
                groupId: groupId,
                userId: this.getCurrentUserId(),
                stream: stream,
                timestamp: new Date().toISOString(),
                status: 'active'
            };

            // 화면 공유 세션 시작
            this.connections[groupId].screenShare = screenShareMessage;
            
            console.log('✅ 화면 공유 시작 완료');
            return { success: true, stream: stream };
            
        } catch (error) {
            console.error('❌ 화면 공유 실패:', error);
            return { success: false, message: error.message };
        }
    }

    async startVoiceCall(groupId) {
        try {
            console.log('📞 음성 통화 시작:', groupId);
            
            if (!this.connections[groupId]) {
                await this.initializeWebSocket(groupId);
            }

            // 마이크 권한 요청
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            });

            const voiceCallMessage = {
                id: `call_${Date.now()}`,
                type: 'voice_call',
                groupId: groupId,
                userId: this.getCurrentUserId(),
                stream: stream,
                timestamp: new Date().toISOString(),
                status: 'active'
            };

            // 음성 통화 세션 시작
            this.connections[groupId].voiceCall = voiceCallMessage;
            
            console.log('✅ 음성 통화 시작 완료');
            return { success: true, stream: stream };
            
        } catch (error) {
            console.error('❌ 음성 통화 실패:', error);
            return { success: false, message: error.message };
        }
    }

    async startVideoCall(groupId) {
        try {
            console.log('📹 영상 통화 시작:', groupId);
            
            if (!this.connections[groupId]) {
                await this.initializeWebSocket(groupId);
            }

            // 카메라 및 마이크 권한 요청
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true
            });

            const videoCallMessage = {
                id: `video_${Date.now()}`,
                type: 'video_call',
                groupId: groupId,
                userId: this.getCurrentUserId(),
                stream: stream,
                timestamp: new Date().toISOString(),
                status: 'active'
            };

            // 영상 통화 세션 시작
            this.connections[groupId].videoCall = videoCallMessage;
            
            console.log('✅ 영상 통화 시작 완료');
            return { success: true, stream: stream };
            
        } catch (error) {
            console.error('❌ 영상 통화 실패:', error);
            return { success: false, message: error.message };
        }
    }

    async shareWhiteboard(groupId, data) {
        try {
            console.log('🖼️ 화이트보드 공유:', groupId);
            
            if (!this.connections[groupId]) {
                await this.initializeWebSocket(groupId);
            }

            const whiteboardMessage = {
                id: `wb_${Date.now()}`,
                type: 'whiteboard',
                groupId: groupId,
                userId: this.getCurrentUserId(),
                data: data,
                timestamp: new Date().toISOString(),
                status: 'shared'
            };

            // 메시지 큐에 추가
            this.messageQueue.push(whiteboardMessage);
            
            // 즉시 전송 시도
            await this.processMessageQueue();
            
            console.log('✅ 화이트보드 공유 완료');
            return { success: true, message: whiteboardMessage };
            
        } catch (error) {
            console.error('❌ 화이트보드 공유 실패:', error);
            return { success: false, message: error.message };
        }
    }

    async sendFile(groupId, file) {
        try {
            console.log('📎 파일 전송:', groupId, file.name);
            
            if (!this.connections[groupId]) {
                await this.initializeWebSocket(groupId);
            }

            // 파일을 Base64로 인코딩
            const base64Data = await this.fileToBase64(file);

            const fileMessage = {
                id: `file_${Date.now()}`,
                type: 'file',
                groupId: groupId,
                userId: this.getCurrentUserId(),
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                data: base64Data,
                timestamp: new Date().toISOString(),
                status: 'uploading'
            };

            // 메시지 큐에 추가
            this.messageQueue.push(fileMessage);
            
            // 즉시 전송 시도
            await this.processMessageQueue();
            
            console.log('✅ 파일 전송 완료');
            return { success: true, message: fileMessage };
            
        } catch (error) {
            console.error('❌ 파일 전송 실패:', error);
            return { success: false, message: error.message };
        }
    }

    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    async processMessageQueue() {
        try {
            if (this.messageQueue.length === 0) {
                return;
            }

            console.log('📦 메시지 큐 처리:', this.messageQueue.length, '개');

            const messagesToProcess = [...this.messageQueue];
            this.messageQueue = [];

            for (const message of messagesToProcess) {
                await this.sendMessageToServer(message);
            }

        } catch (error) {
            console.error('❌ 메시지 큐 처리 실패:', error);
            // 실패한 메시지를 다시 큐에 추가
            this.messageQueue.unshift(...messagesToProcess);
        }
    }

    async sendMessageToServer(message) {
        try {
            // 실제 구현에서는 WebSocket을 통해 서버로 전송
            // 현재는 시뮬레이션
            console.log('📡 서버로 메시지 전송:', message.type);
            
            // 메시지 상태 업데이트
            message.status = 'sent';
            message.sentAt = new Date().toISOString();
            
            // 연결 상태 업데이트
            if (this.connections[message.groupId]) {
                this.connections[message.groupId].lastActivity = new Date().toISOString();
            }
            
            // 이벤트 발생
            this.emitMessageEvent(message);
            
        } catch (error) {
            console.error('❌ 서버 메시지 전송 실패:', error);
            message.status = 'failed';
            throw error;
        }
    }

    startMessageQueueProcessor() {
        // 주기적으로 메시지 큐 처리
        setInterval(() => {
            this.processMessageQueue();
        }, 1000); // 1초마다 처리
    }

    emitMessageEvent(message) {
        // 커스텀 이벤트 발생
        const event = new CustomEvent('realtimeMessage', {
            detail: message
        });
        window.dispatchEvent(event);
    }

    onMessage(callback) {
        // 메시지 수신 이벤트 리스너 등록
        window.addEventListener('realtimeMessage', (event) => {
            callback(event.detail);
        });
    }

    async disconnect(groupId) {
        try {
            console.log('🔌 연결 해제:', groupId);
            
            if (this.connections[groupId]) {
                // 화면 공유 중지
                if (this.connections[groupId].screenShare) {
                    await this.stopScreenShare(groupId);
                }
                
                // 통화 중지
                if (this.connections[groupId].voiceCall) {
                    await this.stopVoiceCall(groupId);
                }
                
                if (this.connections[groupId].videoCall) {
                    await this.stopVideoCall(groupId);
                }
                
                // 연결 정보 삭제
                delete this.connections[groupId];
            }
            
            console.log('✅ 연결 해제 완료');
            return { success: true };
            
        } catch (error) {
            console.error('❌ 연결 해제 실패:', error);
            return { success: false, message: error.message };
        }
    }

    async stopScreenShare(groupId) {
        try {
            if (this.connections[groupId]?.screenShare?.stream) {
                this.connections[groupId].screenShare.stream.getTracks().forEach(track => track.stop());
                delete this.connections[groupId].screenShare;
                console.log('✅ 화면 공유 중지 완료');
            }
        } catch (error) {
            console.error('❌ 화면 공유 중지 실패:', error);
        }
    }

    async stopVoiceCall(groupId) {
        try {
            if (this.connections[groupId]?.voiceCall?.stream) {
                this.connections[groupId].voiceCall.stream.getTracks().forEach(track => track.stop());
                delete this.connections[groupId].voiceCall;
                console.log('✅ 음성 통화 중지 완료');
            }
        } catch (error) {
            console.error('❌ 음성 통화 중지 실패:', error);
        }
    }

    async stopVideoCall(groupId) {
        try {
            if (this.connections[groupId]?.videoCall?.stream) {
                this.connections[groupId].videoCall.stream.getTracks().forEach(track => track.stop());
                delete this.connections[groupId].videoCall;
                console.log('✅ 영상 통화 중지 완료');
            }
        } catch (error) {
            console.error('❌ 영상 통화 중지 실패:', error);
        }
    }

    getCurrentUserId() {
        // 현재 사용자 ID 반환
        const userInfo = localStorage.getItem('aicu_user_info');
        if (userInfo) {
            const user = JSON.parse(userInfo);
            return user.userName || '게스트';
        }
        return '게스트';
    }

    getConnectionStatus(groupId) {
        if (this.connections[groupId]) {
            return {
                isConnected: this.connections[groupId].isActive,
                connectedAt: this.connections[groupId].connectedAt,
                lastActivity: this.connections[groupId].lastActivity,
                hasScreenShare: !!this.connections[groupId].screenShare,
                hasVoiceCall: !!this.connections[groupId].voiceCall,
                hasVideoCall: !!this.connections[groupId].videoCall
            };
        }
        return { isConnected: false };
    }

    getAllConnections() {
        return Object.keys(this.connections).map(groupId => ({
            groupId: groupId,
            ...this.getConnectionStatus(groupId)
        }));
    }

    // 연결 상태 모니터링
    startConnectionMonitoring() {
        setInterval(() => {
            this.checkConnectionHealth();
        }, 30000); // 30초마다 체크
    }

    async checkConnectionHealth() {
        try {
            for (const groupId in this.connections) {
                const connection = this.connections[groupId];
                const lastActivity = new Date(connection.lastActivity);
                const now = new Date();
                const timeDiff = now - lastActivity;
                
                // 5분 이상 활동이 없으면 연결 상태 확인
                if (timeDiff > 300000) {
                    console.log('⚠️ 연결 상태 확인:', groupId);
                    await this.pingConnection(groupId);
                }
            }
        } catch (error) {
            console.error('❌ 연결 상태 모니터링 실패:', error);
        }
    }

    async pingConnection(groupId) {
        try {
            const pingMessage = {
                id: `ping_${Date.now()}`,
                type: 'ping',
                groupId: groupId,
                timestamp: new Date().toISOString()
            };
            
            await this.sendMessageToServer(pingMessage);
            
        } catch (error) {
            console.error('❌ 연결 핑 실패:', groupId, error);
            // 연결 재시도
            await this.reconnect(groupId);
        }
    }

    async reconnect(groupId) {
        try {
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('❌ 최대 재연결 시도 횟수 초과:', groupId);
                return { success: false, message: '최대 재연결 시도 횟수 초과' };
            }

            console.log('🔄 연결 재시도:', groupId, this.reconnectAttempts + 1);
            
            this.reconnectAttempts++;
            
            // 기존 연결 정리
            await this.disconnect(groupId);
            
            // 잠시 대기 후 재연결
            await new Promise(resolve => setTimeout(resolve, this.reconnectInterval));
            
            // 재연결 시도
            const result = await this.initializeWebSocket(groupId);
            
            if (result.success) {
                this.reconnectAttempts = 0;
                console.log('✅ 재연결 성공:', groupId);
            }
            
            return result;
            
        } catch (error) {
            console.error('❌ 재연결 실패:', groupId, error);
            return { success: false, message: error.message };
        }
    }

    // 시스템 정보 조회
    getSystemInfo() {
        return {
            isConnected: this.isConnected,
            totalConnections: Object.keys(this.connections).length,
            messageQueueLength: this.messageQueue.length,
            reconnectAttempts: this.reconnectAttempts,
            connections: this.getAllConnections()
        };
    }

    // 데이터 초기화
    async resetCommunicationData() {
        try {
            // 모든 연결 해제
            for (const groupId in this.connections) {
                await this.disconnect(groupId);
            }
            
            // 메시지 큐 초기화
            this.messageQueue = [];
            
            // 재연결 시도 횟수 초기화
            this.reconnectAttempts = 0;
            
            console.log('✅ 실시간 통신 데이터 초기화 완료');
            return { success: true };
            
        } catch (error) {
            console.error('❌ 실시간 통신 데이터 초기화 실패:', error);
            return { success: false, message: error.message };
        }
    }
}

// 전역 인스턴스 생성
window.realTimeCommunication = new RealTimeCommunication();











