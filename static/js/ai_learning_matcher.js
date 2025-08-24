// ai_learning_matcher.js - AI 기반 학습 매칭 시스템 (3단계)
class AILearningMatcher {
    constructor() {
        this.matchingCriteria = {
            skillLevel: 0.3,      // 능력 수준 (30%)
            studyGoal: 0.25,      // 학습 목표 (25%)
            timeAvailability: 0.2, // 시간 가용성 (20%)
            learningStyle: 0.15,   // 학습 스타일 (15%)
            personality: 0.1       // 성향 (10%)
        };
        
        this.userProfiles = {};
        this.matchingHistory = {};
        this.isInitialized = false;
        console.log('=== AI 학습 매칭 시스템 초기화 ===');
    }

    async initialize() {
        try {
            console.log('🎯 AI 학습 매칭 시스템 초기화 시작...');
            
            // 사용자 프로필 로드
            await this.loadUserProfiles();
            
            // 매칭 히스토리 로드
            await this.loadMatchingHistory();
            
            this.isInitialized = true;
            console.log('✅ AI 학습 매칭 시스템 초기화 완료');
            
        } catch (error) {
            console.error('❌ AI 학습 매칭 시스템 초기화 실패:', error);
            throw error;
        }
    }

    async loadUserProfiles() {
        try {
            const profilesData = localStorage.getItem('ai_user_profiles');
            if (profilesData) {
                this.userProfiles = JSON.parse(profilesData);
                console.log('✅ 사용자 프로필 로드 완료:', Object.keys(this.userProfiles).length, '개');
            } else {
                this.userProfiles = {};
                console.log('✅ 새로운 사용자 프로필 생성');
            }
        } catch (error) {
            console.error('❌ 사용자 프로필 로드 실패:', error);
            this.userProfiles = {};
        }
    }

    async loadMatchingHistory() {
        try {
            const historyData = localStorage.getItem('ai_matching_history');
            if (historyData) {
                this.matchingHistory = JSON.parse(historyData);
                console.log('✅ 매칭 히스토리 로드 완료');
            } else {
                this.matchingHistory = {};
                console.log('✅ 새로운 매칭 히스토리 생성');
            }
        } catch (error) {
            console.error('❌ 매칭 히스토리 로드 실패:', error);
            this.matchingHistory = {};
        }
    }

    async analyzeUserProfile(userId) {
        try {
            console.log('🔍 사용자 프로필 분석:', userId);
            
            // 기존 프로필이 있으면 로드
            if (this.userProfiles[userId]) {
                return { success: true, profile: this.userProfiles[userId] };
            }

            // 새로운 프로필 생성
            const userInfo = localStorage.getItem('aicu_user_info');
            const progressData = localStorage.getItem('aicu_progress');
            
            let userData = {};
            let progressDataObj = {};
            
            if (userInfo) {
                userData = JSON.parse(userInfo);
            }
            
            if (progressData) {
                progressDataObj = JSON.parse(progressData);
            }

            // 프로필 분석
            const profile = await this.createUserProfile(userId, userData, progressDataObj);
            
            // 프로필 저장
            this.userProfiles[userId] = profile;
            await this.saveUserProfiles();
            
            console.log('✅ 사용자 프로필 분석 완료');
            return { success: true, profile: profile };
            
        } catch (error) {
            console.error('❌ 사용자 프로필 분석 실패:', error);
            return { success: false, message: error.message };
        }
    }

    async createUserProfile(userId, userData, progressData) {
        // 기본 정보
        const basicInfo = {
            userId: userId,
            userName: userData.userName || '게스트',
            examDate: userData.examDate || null,
            isRegistered: userData.isRegistered || false
        };

        // 능력 수준 분석
        const skillLevel = this.analyzeSkillLevel(progressData);
        
        // 학습 목표 분석
        const studyGoal = this.analyzeStudyGoal(userData, progressData);
        
        // 시간 가용성 분석
        const timeAvailability = this.analyzeTimeAvailability(userData, progressData);
        
        // 학습 스타일 분석
        const learningStyle = this.analyzeLearningStyle(progressData);
        
        // 성향 분석
        const personality = this.analyzePersonality(progressData);

        return {
            ...basicInfo,
            skillLevel: skillLevel,
            studyGoal: studyGoal,
            timeAvailability: timeAvailability,
            learningStyle: learningStyle,
            personality: personality,
            lastUpdated: new Date().toISOString()
        };
    }

    analyzeSkillLevel(progressData) {
        try {
            if (!progressData || !progressData.basicLearning) {
                return { level: 50, confidence: 0.3, details: '기본 수준' };
            }

            const basic = progressData.basicLearning;
            const totalAttempted = basic.totalAttempted || 0;
            const totalCorrect = basic.totalCorrect || 0;
            
            if (totalAttempted === 0) {
                return { level: 50, confidence: 0.3, details: '기본 수준' };
            }

            const accuracy = (totalCorrect / totalAttempted) * 100;
            let level, details;

            if (accuracy >= 90) {
                level = 95;
                details = '고급 수준';
            } else if (accuracy >= 80) {
                level = 85;
                details = '상급 수준';
            } else if (accuracy >= 70) {
                level = 75;
                details = '중급 수준';
            } else if (accuracy >= 60) {
                level = 65;
                details = '초급 수준';
            } else {
                level = 55;
                details = '기본 수준';
            }

            const confidence = Math.min(totalAttempted / 100, 1.0);

            return { level, confidence, details };
            
        } catch (error) {
            console.error('❌ 능력 수준 분석 실패:', error);
            return { level: 50, confidence: 0.3, details: '기본 수준' };
        }
    }

    analyzeStudyGoal(userData, progressData) {
        try {
            const examDate = userData.examDate;
            const targetScore = 80; // 기본 목표 점수
            
            let urgency = '보통';
            let goalType = '합격';
            
            if (examDate) {
                const today = new Date();
                const exam = new Date(examDate);
                const daysLeft = Math.ceil((exam - today) / (1000 * 60 * 60 * 24));
                
                if (daysLeft <= 30) {
                    urgency = '긴급';
                    goalType = '고득점';
                } else if (daysLeft <= 90) {
                    urgency = '높음';
                    goalType = '안정적 합격';
                } else {
                    urgency = '보통';
                    goalType = '합격';
                }
            }

            return {
                type: goalType,
                urgency: urgency,
                targetScore: targetScore,
                examDate: examDate
            };
            
        } catch (error) {
            console.error('❌ 학습 목표 분석 실패:', error);
            return {
                type: '합격',
                urgency: '보통',
                targetScore: 80,
                examDate: null
            };
        }
    }

    analyzeTimeAvailability(userData, progressData) {
        try {
            // 학습 패턴 분석
            const basic = progressData?.basicLearning || {};
            const lastStudyDate = basic.lastStudyDate;
            
            let frequency = '보통';
            let preferredTime = '저녁';
            let availability = '중간';
            
            if (lastStudyDate) {
                const today = new Date();
                const lastStudy = new Date(lastStudyDate);
                const daysSinceLastStudy = Math.ceil((today - lastStudy) / (1000 * 60 * 60 * 24));
                
                if (daysSinceLastStudy <= 1) {
                    frequency = '높음';
                    availability = '높음';
                } else if (daysSinceLastStudy <= 3) {
                    frequency = '보통';
                    availability = '중간';
                } else {
                    frequency = '낮음';
                    availability = '낮음';
                }
            }

            return {
                frequency: frequency,
                preferredTime: preferredTime,
                availability: availability,
                lastStudyDate: lastStudyDate
            };
            
        } catch (error) {
            console.error('❌ 시간 가용성 분석 실패:', error);
            return {
                frequency: '보통',
                preferredTime: '저녁',
                availability: '중간',
                lastStudyDate: null
            };
        }
    }

    analyzeLearningStyle(progressData) {
        try {
            // 학습 스타일 분석 (더미 데이터)
            const styles = ['시각형', '청각형', '독서형', '실습형'];
            const randomStyle = styles[Math.floor(Math.random() * styles.length)];
            
            return {
                primary: randomStyle,
                secondary: '혼합형',
                preferences: {
                    visual: 0.7,
                    auditory: 0.6,
                    reading: 0.8,
                    kinesthetic: 0.5
                }
            };
            
        } catch (error) {
            console.error('❌ 학습 스타일 분석 실패:', error);
            return {
                primary: '혼합형',
                secondary: '독서형',
                preferences: {
                    visual: 0.5,
                    auditory: 0.5,
                    reading: 0.5,
                    kinesthetic: 0.5
                }
            };
        }
    }

    analyzePersonality(progressData) {
        try {
            // 성향 분석 (더미 데이터)
            const personalities = ['내향형', '외향형', '분석형', '직관형'];
            const randomPersonality = personalities[Math.floor(Math.random() * personalities.length)];
            
            return {
                type: randomPersonality,
                traits: {
                    introversion: 0.6,
                    extroversion: 0.4,
                    analytical: 0.7,
                    intuitive: 0.3
                }
            };
            
        } catch (error) {
            console.error('❌ 성향 분석 실패:', error);
            return {
                type: '혼합형',
                traits: {
                    introversion: 0.5,
                    extroversion: 0.5,
                    analytical: 0.5,
                    intuitive: 0.5
                }
            };
        }
    }

    async calculateCompatibility(user1, user2) {
        try {
            console.log('🔗 호환성 계산:', user1, user2);
            
            const profile1 = await this.analyzeUserProfile(user1);
            const profile2 = await this.analyzeUserProfile(user2);
            
            if (!profile1.success || !profile2.success) {
                throw new Error('프로필 분석 실패');
            }

            const p1 = profile1.profile;
            const p2 = profile2.profile;

            // 각 기준별 호환성 점수 계산
            const skillCompatibility = this.calculateSkillCompatibility(p1.skillLevel, p2.skillLevel);
            const goalCompatibility = this.calculateGoalCompatibility(p1.studyGoal, p2.studyGoal);
            const timeCompatibility = this.calculateTimeCompatibility(p1.timeAvailability, p2.timeAvailability);
            const styleCompatibility = this.calculateStyleCompatibility(p1.learningStyle, p2.learningStyle);
            const personalityCompatibility = this.calculatePersonalityCompatibility(p1.personality, p2.personality);

            // 가중 평균 계산
            const totalScore = 
                skillCompatibility * this.matchingCriteria.skillLevel +
                goalCompatibility * this.matchingCriteria.studyGoal +
                timeCompatibility * this.matchingCriteria.timeAvailability +
                styleCompatibility * this.matchingCriteria.learningStyle +
                personalityCompatibility * this.matchingCriteria.personality;

            const compatibility = {
                totalScore: totalScore,
                skillCompatibility: skillCompatibility,
                goalCompatibility: goalCompatibility,
                timeCompatibility: timeCompatibility,
                styleCompatibility: styleCompatibility,
                personalityCompatibility: personalityCompatibility,
                level: this.getCompatibilityLevel(totalScore),
                details: this.getCompatibilityDetails(totalScore)
            };

            // 매칭 히스토리에 저장
            await this.saveMatchingResult(user1, user2, compatibility);

            return { success: true, compatibility: compatibility };
            
        } catch (error) {
            console.error('❌ 호환성 계산 실패:', error);
            return { success: false, message: error.message };
        }
    }

    calculateSkillCompatibility(skill1, skill2) {
        const diff = Math.abs(skill1.level - skill2.level);
        const maxDiff = 50; // 최대 차이
        
        // 차이가 적을수록 높은 호환성
        return Math.max(0, 1 - (diff / maxDiff));
    }

    calculateGoalCompatibility(goal1, goal2) {
        // 목표 유형이 같으면 높은 호환성
        if (goal1.type === goal2.type) {
            return 0.9;
        }
        
        // 긴급도가 비슷하면 중간 호환성
        if (goal1.urgency === goal2.urgency) {
            return 0.7;
        }
        
        return 0.5;
    }

    calculateTimeCompatibility(time1, time2) {
        // 시간 가용성이 비슷하면 높은 호환성
        if (time1.availability === time2.availability) {
            return 0.8;
        }
        
        // 선호 시간이 같으면 추가 점수
        if (time1.preferredTime === time2.preferredTime) {
            return 0.7;
        }
        
        return 0.5;
    }

    calculateStyleCompatibility(style1, style2) {
        // 주요 학습 스타일이 같으면 높은 호환성
        if (style1.primary === style2.primary) {
            return 0.9;
        }
        
        // 보조 학습 스타일이 같으면 중간 호환성
        if (style1.secondary === style2.secondary) {
            return 0.7;
        }
        
        return 0.6;
    }

    calculatePersonalityCompatibility(personality1, personality2) {
        // 성향이 같으면 높은 호환성
        if (personality1.type === personality2.type) {
            return 0.8;
        }
        
        // 보완적 성향이면 중간 호환성
        const complementaryPairs = [
            ['내향형', '외향형'],
            ['분석형', '직관형']
        ];
        
        for (const pair of complementaryPairs) {
            if ((personality1.type === pair[0] && personality2.type === pair[1]) ||
                (personality1.type === pair[1] && personality2.type === pair[0])) {
                return 0.7;
            }
        }
        
        return 0.5;
    }

    getCompatibilityLevel(score) {
        if (score >= 0.8) return '매우 높음';
        if (score >= 0.7) return '높음';
        if (score >= 0.6) return '보통';
        if (score >= 0.5) return '낮음';
        return '매우 낮음';
    }

    getCompatibilityDetails(score) {
        if (score >= 0.8) return '완벽한 학습 파트너입니다!';
        if (score >= 0.7) return '매우 좋은 학습 파트너입니다.';
        if (score >= 0.6) return '적당한 학습 파트너입니다.';
        if (score >= 0.5) return '기본적인 학습 파트너입니다.';
        return '호환성이 낮습니다.';
    }

    async recommendLearningPartners(userId, count = 5) {
        try {
            console.log('🎯 학습 파트너 추천:', userId);
            
            // 현재 사용자 프로필 분석
            const userProfile = await this.analyzeUserProfile(userId);
            if (!userProfile.success) {
                throw new Error('사용자 프로필 분석 실패');
            }

            // 더미 파트너 목록 생성
            const dummyPartners = [
                {
                    userId: 'user_001',
                    userName: '김학습',
                    profile: await this.analyzeUserProfile('user_001')
                },
                {
                    userId: 'user_002',
                    userName: '이공부',
                    profile: await this.analyzeUserProfile('user_002')
                },
                {
                    userId: 'user_003',
                    userName: '박지식',
                    profile: await this.analyzeUserProfile('user_003')
                },
                {
                    userId: 'user_004',
                    userName: '최성실',
                    profile: await this.analyzeUserProfile('user_004')
                },
                {
                    userId: 'user_005',
                    userName: '정열심',
                    profile: await this.analyzeUserProfile('user_005')
                }
            ];

            // 호환성 계산 및 정렬
            const recommendations = [];
            for (const partner of dummyPartners) {
                if (partner.userId !== userId) {
                    const compatibility = await this.calculateCompatibility(userId, partner.userId);
                    if (compatibility.success) {
                        recommendations.push({
                            ...partner,
                            compatibility: compatibility.compatibility
                        });
                    }
                }
            }

            // 호환성 점수로 정렬
            recommendations.sort((a, b) => b.compatibility.totalScore - a.compatibility.totalScore);

            // 상위 N개 반환
            const topRecommendations = recommendations.slice(0, count);

            return { success: true, recommendations: topRecommendations };
            
        } catch (error) {
            console.error('❌ 학습 파트너 추천 실패:', error);
            return { success: false, message: error.message };
        }
    }

    async optimizeGroupFormation(users) {
        try {
            console.log('👥 그룹 최적화:', users.length, '명');
            
            // 그룹 크기 결정 (3-6명)
            const groupSize = Math.min(Math.max(3, Math.ceil(users.length / 2)), 6);
            const numGroups = Math.ceil(users.length / groupSize);
            
            const groups = [];
            
            for (let i = 0; i < numGroups; i++) {
                const groupMembers = users.slice(i * groupSize, (i + 1) * groupSize);
                const groupCompatibility = await this.calculateGroupCompatibility(groupMembers);
                
                groups.push({
                    id: `group_${Date.now()}_${i}`,
                    members: groupMembers,
                    compatibility: groupCompatibility,
                    size: groupMembers.length
                });
            }

            return { success: true, groups: groups };
            
        } catch (error) {
            console.error('❌ 그룹 최적화 실패:', error);
            return { success: false, message: error.message };
        }
    }

    async calculateGroupCompatibility(members) {
        try {
            if (members.length < 2) {
                return { score: 1.0, details: '단일 멤버' };
            }

            let totalCompatibility = 0;
            let pairCount = 0;

            // 모든 멤버 쌍의 호환성 계산
            for (let i = 0; i < members.length; i++) {
                for (let j = i + 1; j < members.length; j++) {
                    const compatibility = await this.calculateCompatibility(members[i], members[j]);
                    if (compatibility.success) {
                        totalCompatibility += compatibility.compatibility.totalScore;
                        pairCount++;
                    }
                }
            }

            const averageCompatibility = pairCount > 0 ? totalCompatibility / pairCount : 0;

            return {
                score: averageCompatibility,
                details: this.getGroupCompatibilityDetails(averageCompatibility)
            };
            
        } catch (error) {
            console.error('❌ 그룹 호환성 계산 실패:', error);
            return { score: 0.5, details: '계산 실패' };
        }
    }

    getGroupCompatibilityDetails(score) {
        if (score >= 0.8) return '완벽한 그룹 조합입니다!';
        if (score >= 0.7) return '매우 좋은 그룹 조합입니다.';
        if (score >= 0.6) return '적당한 그룹 조합입니다.';
        if (score >= 0.5) return '기본적인 그룹 조합입니다.';
        return '그룹 호환성이 낮습니다.';
    }

    async saveMatchingResult(user1, user2, compatibility) {
        try {
            const key = `${user1}_${user2}`;
            const reverseKey = `${user2}_${user1}`;
            
            this.matchingHistory[key] = {
                user1: user1,
                user2: user2,
                compatibility: compatibility,
                timestamp: new Date().toISOString()
            };
            
            this.matchingHistory[reverseKey] = this.matchingHistory[key];
            
            await this.saveMatchingHistory();
            
        } catch (error) {
            console.error('❌ 매칭 결과 저장 실패:', error);
        }
    }

    async saveUserProfiles() {
        try {
            localStorage.setItem('ai_user_profiles', JSON.stringify(this.userProfiles));
        } catch (error) {
            console.error('❌ 사용자 프로필 저장 실패:', error);
        }
    }

    async saveMatchingHistory() {
        try {
            localStorage.setItem('ai_matching_history', JSON.stringify(this.matchingHistory));
        } catch (error) {
            console.error('❌ 매칭 히스토리 저장 실패:', error);
        }
    }

    // 데이터 초기화
    async resetMatchingData() {
        try {
            this.userProfiles = {};
            this.matchingHistory = {};
            
            localStorage.removeItem('ai_user_profiles');
            localStorage.removeItem('ai_matching_history');
            
            console.log('✅ AI 매칭 데이터 초기화 완료');
            return { success: true };
            
        } catch (error) {
            console.error('❌ AI 매칭 데이터 초기화 실패:', error);
            return { success: false, message: error.message };
        }
    }

    // 시스템 정보 조회
    getSystemInfo() {
        return {
            isInitialized: this.isInitialized,
            userProfilesCount: Object.keys(this.userProfiles).length,
            matchingHistoryCount: Object.keys(this.matchingHistory).length,
            matchingCriteria: this.matchingCriteria
        };
    }
}

// 전역 인스턴스 생성
window.aiLearningMatcher = new AILearningMatcher();











