// collaborative_learning_system.js - 실시간 협업 학습 시스템 (3단계)
class CollaborativeLearningSystem {
    constructor() {
        this.currentUser = null;
        this.activeGroups = [];
        this.chatConnections = {};
        this.whiteboardSessions = {};
        this.isInitialized = false;
        console.log('=== 협업 학습 시스템 초기화 ===');
    }

    async initialize() {
        try {
            console.log('🎯 협업 학습 시스템 초기화 시작...');
            
            // 사용자 정보 로드
            await this.loadCurrentUser();
            
            // 활성 그룹 로드
            await this.loadActiveGroups();
            
            // 협업 데이터 로드
            await this.loadCollaborationData();
            
            this.isInitialized = true;
            console.log('✅ 협업 학습 시스템 초기화 완료');
            
        } catch (error) {
            console.error('❌ 협업 학습 시스템 초기화 실패:', error);
            throw error;
        }
    }

    async loadCurrentUser() {
        try {
            const userInfo = localStorage.getItem('aicu_user_info');
            if (userInfo) {
                this.currentUser = JSON.parse(userInfo);
                console.log('✅ 사용자 정보 로드 완료:', this.currentUser.userName);
            } else {
                console.log('⚠️ 사용자 정보 없음 - 게스트 모드');
                this.currentUser = { userName: '게스트', is_guest: true };
            }
        } catch (error) {
            console.error('❌ 사용자 정보 로드 실패:', error);
            this.currentUser = { userName: '게스트', is_guest: true };
        }
    }

    async loadActiveGroups() {
        try {
            const groupsData = localStorage.getItem('collaborative_groups');
            if (groupsData) {
                this.activeGroups = JSON.parse(groupsData);
                console.log('✅ 활성 그룹 로드 완료:', this.activeGroups.length, '개');
            } else {
                this.activeGroups = [];
                console.log('✅ 새로운 그룹 목록 생성');
            }
        } catch (error) {
            console.error('❌ 그룹 데이터 로드 실패:', error);
            this.activeGroups = [];
        }
    }

    async loadCollaborationData() {
        try {
            const collaborationData = localStorage.getItem('collaboration_data');
            if (collaborationData) {
                const data = JSON.parse(collaborationData);
                this.chatConnections = data.chatConnections || {};
                this.whiteboardSessions = data.whiteboardSessions || {};
                console.log('✅ 협업 데이터 로드 완료');
            } else {
                this.chatConnections = {};
                this.whiteboardSessions = {};
                console.log('✅ 새로운 협업 데이터 생성');
            }
        } catch (error) {
            console.error('❌ 협업 데이터 로드 실패:', error);
            this.chatConnections = {};
            this.whiteboardSessions = {};
        }
    }

    // 그룹 관리 메서드들
    async createGroup(groupInfo) {
        try {
            console.log('📝 새 그룹 생성:', groupInfo.name);
            
            const newGroup = {
                id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: groupInfo.name,
                description: groupInfo.description || '',
                createdBy: this.currentUser.userName,
                createdAt: new Date().toISOString(),
                maxMembers: groupInfo.maxMembers || 8,
                currentMembers: 1,
                members: [{
                    userId: this.currentUser.userName,
                    role: 'leader',
                    joinedAt: new Date().toISOString(),
                    contribution: 0
                }],
                rules: {
                    studyTime: groupInfo.studyTime || '20:00-22:00',
                    studyDays: groupInfo.studyDays || ['mon', 'wed', 'fri'],
                    targetScore: groupInfo.targetScore || 80
                },
                performance: {
                    averageAccuracy: 0,
                    totalStudyTime: 0,
                    groupCohesion: 0
                }
            };

            this.activeGroups.push(newGroup);
            await this.saveGroupsData();
            
            console.log('✅ 그룹 생성 완료:', newGroup.id);
            return { success: true, groupId: newGroup.id, group: newGroup };
            
        } catch (error) {
            console.error('❌ 그룹 생성 실패:', error);
            return { success: false, message: error.message };
        }
    }

    async joinGroup(groupId) {
        try {
            console.log('👥 그룹 참여:', groupId);
            
            const group = this.activeGroups.find(g => g.id === groupId);
            if (!group) {
                throw new Error('그룹을 찾을 수 없습니다.');
            }

            if (group.currentMembers >= group.maxMembers) {
                throw new Error('그룹이 가득 찼습니다.');
            }

            const existingMember = group.members.find(m => m.userId === this.currentUser.userName);
            if (existingMember) {
                throw new Error('이미 그룹에 참여 중입니다.');
            }

            group.members.push({
                userId: this.currentUser.userName,
                role: 'member',
                joinedAt: new Date().toISOString(),
                contribution: 0
            });
            group.currentMembers++;

            await this.saveGroupsData();
            
            console.log('✅ 그룹 참여 완료');
            return { success: true, group: group };
            
        } catch (error) {
            console.error('❌ 그룹 참여 실패:', error);
            return { success: false, message: error.message };
        }
    }

    async leaveGroup(groupId) {
        try {
            console.log('🚪 그룹 탈퇴:', groupId);
            
            const groupIndex = this.activeGroups.findIndex(g => g.id === groupId);
            if (groupIndex === -1) {
                throw new Error('그룹을 찾을 수 없습니다.');
            }

            const group = this.activeGroups[groupIndex];
            const memberIndex = group.members.findIndex(m => m.userId === this.currentUser.userName);
            
            if (memberIndex === -1) {
                throw new Error('그룹 멤버가 아닙니다.');
            }

            // 리더인 경우 그룹 삭제
            if (group.members[memberIndex].role === 'leader') {
                this.activeGroups.splice(groupIndex, 1);
                console.log('🗑️ 리더 탈퇴로 그룹 삭제');
            } else {
                group.members.splice(memberIndex, 1);
                group.currentMembers--;
            }

            await this.saveGroupsData();
            
            console.log('✅ 그룹 탈퇴 완료');
            return { success: true };
            
        } catch (error) {
            console.error('❌ 그룹 탈퇴 실패:', error);
            return { success: false, message: error.message };
        }
    }

    async getGroupMembers(groupId) {
        try {
            const group = this.activeGroups.find(g => g.id === groupId);
            if (!group) {
                throw new Error('그룹을 찾을 수 없습니다.');
            }

            return { success: true, members: group.members };
            
        } catch (error) {
            console.error('❌ 그룹 멤버 조회 실패:', error);
            return { success: false, message: error.message };
        }
    }

    // 실시간 통신 메서드들
    async initializeChat(groupId) {
        try {
            console.log('💬 채팅 초기화:', groupId);
            
            if (!this.chatConnections[groupId]) {
                this.chatConnections[groupId] = {
                    messages: [],
                    isActive: true,
                    lastActivity: new Date().toISOString()
                };
                await this.saveCollaborationData();
            }

            return { success: true, messages: this.chatConnections[groupId].messages };
            
        } catch (error) {
            console.error('❌ 채팅 초기화 실패:', error);
            return { success: false, message: error.message };
        }
    }

    async sendMessage(groupId, message) {
        try {
            console.log('📤 메시지 전송:', groupId);
            
            if (!this.chatConnections[groupId]) {
                await this.initializeChat(groupId);
            }

            const newMessage = {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: this.currentUser.userName,
                message: message,
                timestamp: new Date().toISOString(),
                type: 'text'
            };

            this.chatConnections[groupId].messages.push(newMessage);
            this.chatConnections[groupId].lastActivity = new Date().toISOString();
            
            await this.saveCollaborationData();
            
            console.log('✅ 메시지 전송 완료');
            return { success: true, message: newMessage };
            
        } catch (error) {
            console.error('❌ 메시지 전송 실패:', error);
            return { success: false, message: error.message };
        }
    }

    async shareWhiteboard(groupId, data) {
        try {
            console.log('🖼️ 화이트보드 공유:', groupId);
            
            if (!this.whiteboardSessions[groupId]) {
                this.whiteboardSessions[groupId] = {
                    sessionId: `wb_${Date.now()}`,
                    data: '',
                    lastUpdated: new Date().toISOString(),
                    participants: []
                };
            }

            this.whiteboardSessions[groupId].data = data;
            this.whiteboardSessions[groupId].lastUpdated = new Date().toISOString();
            
            if (!this.whiteboardSessions[groupId].participants.includes(this.currentUser.userName)) {
                this.whiteboardSessions[groupId].participants.push(this.currentUser.userName);
            }

            await this.saveCollaborationData();
            
            console.log('✅ 화이트보드 공유 완료');
            return { success: true, session: this.whiteboardSessions[groupId] };
            
        } catch (error) {
            console.error('❌ 화이트보드 공유 실패:', error);
            return { success: false, message: error.message };
        }
    }

    // AI 매칭 메서드들
    async findLearningPartners(criteria) {
        try {
            console.log('🔍 학습 파트너 검색:', criteria);
            
            // 실제 구현에서는 AI 매칭 엔진과 연동
            // 현재는 더미 데이터 반환
            const dummyPartners = [
                {
                    userId: 'user_001',
                    userName: '김학습',
                    skillLevel: 75,
                    studyGoal: 'ACIU 고득점',
                    timeAvailability: '20:00-22:00',
                    compatibility: 0.85
                },
                {
                    userId: 'user_002',
                    userName: '이공부',
                    skillLevel: 82,
                    studyGoal: 'ACIU 합격',
                    timeAvailability: '19:00-21:00',
                    compatibility: 0.78
                }
            ];

            return { success: true, partners: dummyPartners };
            
        } catch (error) {
            console.error('❌ 학습 파트너 검색 실패:', error);
            return { success: false, message: error.message };
        }
    }

    async getMatchingScore(user1, user2) {
        try {
            // 실제 구현에서는 복잡한 호환성 계산 알고리즘 사용
            // 현재는 간단한 랜덤 점수 반환
            const score = Math.random() * 0.4 + 0.6; // 0.6 ~ 1.0
            
            return { success: true, score: score };
            
        } catch (error) {
            console.error('❌ 호환성 점수 계산 실패:', error);
            return { success: false, message: error.message };
        }
    }

    // 통계 분석 메서드들
    async analyzeCollaborationStats(groupId) {
        try {
            console.log('📊 협업 통계 분석:', groupId);
            
            const group = this.activeGroups.find(g => g.id === groupId);
            if (!group) {
                throw new Error('그룹을 찾을 수 없습니다.');
            }

            const chatData = this.chatConnections[groupId] || { messages: [] };
            const whiteboardData = this.whiteboardSessions[groupId];

            const stats = {
                totalInteractions: chatData.messages.length,
                averageResponseTime: 2.5, // 더미 데이터
                knowledgeSharing: 0.78,
                peerLearning: 0.85,
                groupSynergy: 0.82,
                activeMembers: group.members.length,
                totalStudyTime: group.performance.totalStudyTime,
                averageAccuracy: group.performance.averageAccuracy
            };

            return { success: true, stats: stats };
            
        } catch (error) {
            console.error('❌ 협업 통계 분석 실패:', error);
            return { success: false, message: error.message };
        }
    }

    async getPersonalCollaborationImpact() {
        try {
            console.log('📈 개인 협업 영향도 분석');
            
            let totalGroups = 0;
            let totalInteractions = 0;
            let averageContribution = 0;

            for (const group of this.activeGroups) {
                const member = group.members.find(m => m.userId === this.currentUser.userName);
                if (member) {
                    totalGroups++;
                    totalInteractions += member.contribution || 0;
                }
            }

            averageContribution = totalGroups > 0 ? totalInteractions / totalGroups : 0;

            const impact = {
                totalGroups: totalGroups,
                totalInteractions: totalInteractions,
                averageContribution: averageContribution,
                collaborationLevel: this.getCollaborationLevel(averageContribution),
                improvement: this.calculateImprovement(averageContribution)
            };

            return { success: true, impact: impact };
            
        } catch (error) {
            console.error('❌ 개인 협업 영향도 분석 실패:', error);
            return { success: false, message: error.message };
        }
    }

    // 유틸리티 메서드들
    getCollaborationLevel(contribution) {
        if (contribution >= 80) return '매우 높음';
        if (contribution >= 60) return '높음';
        if (contribution >= 40) return '보통';
        if (contribution >= 20) return '낮음';
        return '매우 낮음';
    }

    calculateImprovement(contribution) {
        // 더미 개선도 계산
        return Math.min(contribution * 0.1, 10);
    }

    async saveGroupsData() {
        try {
            localStorage.setItem('collaborative_groups', JSON.stringify(this.activeGroups));
        } catch (error) {
            console.error('❌ 그룹 데이터 저장 실패:', error);
        }
    }

    async saveCollaborationData() {
        try {
            const data = {
                chatConnections: this.chatConnections,
                whiteboardSessions: this.whiteboardSessions
            };
            localStorage.setItem('collaboration_data', JSON.stringify(data));
        } catch (error) {
            console.error('❌ 협업 데이터 저장 실패:', error);
        }
    }

    // 데이터 초기화
    async resetCollaborationData() {
        try {
            this.activeGroups = [];
            this.chatConnections = {};
            this.whiteboardSessions = {};
            
            localStorage.removeItem('collaborative_groups');
            localStorage.removeItem('collaboration_data');
            
            console.log('✅ 협업 데이터 초기화 완료');
            return { success: true };
            
        } catch (error) {
            console.error('❌ 협업 데이터 초기화 실패:', error);
            return { success: false, message: error.message };
        }
    }

    // 시스템 정보 조회
    getSystemInfo() {
        return {
            isInitialized: this.isInitialized,
            currentUser: this.currentUser,
            activeGroupsCount: this.activeGroups.length,
            totalChatConnections: Object.keys(this.chatConnections).length,
            totalWhiteboardSessions: Object.keys(this.whiteboardSessions).length
        };
    }
}

// 전역 인스턴스 생성
window.collaborativeLearningSystem = new CollaborativeLearningSystem();


