// collaboration_analytics.js - 협업 분석 시스템 (3단계)
class CollaborationAnalytics {
    constructor() {
        this.analyticsData = {};
        this.interactionHistory = {};
        this.performanceMetrics = {};
        this.isInitialized = false;
        console.log('=== 협업 분석 시스템 초기화 ===');
    }

    async initialize() {
        try {
            console.log('🎯 협업 분석 시스템 초기화 시작...');
            
            // 분석 데이터 로드
            await this.loadAnalyticsData();
            
            // 상호작용 히스토리 로드
            await this.loadInteractionHistory();
            
            // 성과 지표 초기화
            await this.initializePerformanceMetrics();
            
            this.isInitialized = true;
            console.log('✅ 협업 분석 시스템 초기화 완료');
            
        } catch (error) {
            console.error('❌ 협업 분석 시스템 초기화 실패:', error);
            throw error;
        }
    }

    async loadAnalyticsData() {
        try {
            const analyticsData = localStorage.getItem('collaboration_analytics');
            if (analyticsData) {
                this.analyticsData = JSON.parse(analyticsData);
                console.log('✅ 협업 분석 데이터 로드 완료');
            } else {
                this.analyticsData = {};
                console.log('✅ 새로운 협업 분석 데이터 생성');
            }
        } catch (error) {
            console.error('❌ 협업 분석 데이터 로드 실패:', error);
            this.analyticsData = {};
        }
    }

    async loadInteractionHistory() {
        try {
            const historyData = localStorage.getItem('collaboration_interactions');
            if (historyData) {
                this.interactionHistory = JSON.parse(historyData);
                console.log('✅ 상호작용 히스토리 로드 완료');
            } else {
                this.interactionHistory = {};
                console.log('✅ 새로운 상호작용 히스토리 생성');
            }
        } catch (error) {
            console.error('❌ 상호작용 히스토리 로드 실패:', error);
            this.interactionHistory = {};
        }
    }

    async initializePerformanceMetrics() {
        try {
            const metricsData = localStorage.getItem('collaboration_performance');
            if (metricsData) {
                this.performanceMetrics = JSON.parse(metricsData);
                console.log('✅ 성과 지표 로드 완료');
            } else {
                this.performanceMetrics = {
                    individual: {},
                    group: {},
                    overall: {
                        totalCollaborations: 0,
                        averageImprovement: 0,
                        totalStudyTime: 0,
                        averageAccuracy: 0
                    }
                };
                console.log('✅ 새로운 성과 지표 생성');
            }
        } catch (error) {
            console.error('❌ 성과 지표 로드 실패:', error);
            this.performanceMetrics = {
                individual: {},
                group: {},
                overall: {
                    totalCollaborations: 0,
                    averageImprovement: 0,
                    totalStudyTime: 0,
                    averageAccuracy: 0
                }
            };
        }
    }

    async trackInteraction(groupId, interaction) {
        try {
            console.log('📊 상호작용 추적:', groupId, interaction.type);
            
            const interactionRecord = {
                id: `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                groupId: groupId,
                userId: this.getCurrentUserId(),
                type: interaction.type,
                data: interaction.data,
                timestamp: new Date().toISOString(),
                duration: interaction.duration || 0,
                impact: interaction.impact || 0
            };

            // 상호작용 히스토리에 추가
            if (!this.interactionHistory[groupId]) {
                this.interactionHistory[groupId] = [];
            }
            this.interactionHistory[groupId].push(interactionRecord);
            
            // 분석 데이터 업데이트
            await this.updateAnalyticsData(groupId, interactionRecord);
            
            // 성과 지표 업데이트
            await this.updatePerformanceMetrics(groupId, interactionRecord);
            
            await this.saveAnalyticsData();
            
            console.log('✅ 상호작용 추적 완료');
            return { success: true, record: interactionRecord };
            
        } catch (error) {
            console.error('❌ 상호작용 추적 실패:', error);
            return { success: false, message: error.message };
        }
    }

    async updateAnalyticsData(groupId, interactionRecord) {
        try {
            if (!this.analyticsData[groupId]) {
                this.analyticsData[groupId] = {
                    totalInteractions: 0,
                    interactionTypes: {},
                    userContributions: {},
                    timeDistribution: {},
                    impactScores: [],
                    lastUpdated: new Date().toISOString()
                };
            }

            const groupData = this.analyticsData[groupId];
            
            // 총 상호작용 수 증가
            groupData.totalInteractions++;
            
            // 상호작용 유형별 통계
            if (!groupData.interactionTypes[interactionRecord.type]) {
                groupData.interactionTypes[interactionRecord.type] = 0;
            }
            groupData.interactionTypes[interactionRecord.type]++;
            
            // 사용자 기여도 통계
            if (!groupData.userContributions[interactionRecord.userId]) {
                groupData.userContributions[interactionRecord.userId] = {
                    totalInteractions: 0,
                    totalImpact: 0,
                    averageImpact: 0
                };
            }
            const userContribution = groupData.userContributions[interactionRecord.userId];
            userContribution.totalInteractions++;
            userContribution.totalImpact += interactionRecord.impact;
            userContribution.averageImpact = userContribution.totalImpact / userContribution.totalInteractions;
            
            // 시간 분포 통계
            const hour = new Date(interactionRecord.timestamp).getHours();
            const timeSlot = this.getTimeSlot(hour);
            if (!groupData.timeDistribution[timeSlot]) {
                groupData.timeDistribution[timeSlot] = 0;
            }
            groupData.timeDistribution[timeSlot]++;
            
            // 영향도 점수 추가
            groupData.impactScores.push(interactionRecord.impact);
            
            // 마지막 업데이트 시간
            groupData.lastUpdated = new Date().toISOString();
            
        } catch (error) {
            console.error('❌ 분석 데이터 업데이트 실패:', error);
        }
    }

    async updatePerformanceMetrics(groupId, interactionRecord) {
        try {
            const userId = interactionRecord.userId;
            
            // 개인 성과 지표 업데이트
            if (!this.performanceMetrics.individual[userId]) {
                this.performanceMetrics.individual[userId] = {
                    totalInteractions: 0,
                    totalImpact: 0,
                    averageImpact: 0,
                    collaborationTime: 0,
                    improvement: 0,
                    groups: []
                };
            }
            
            const individualMetrics = this.performanceMetrics.individual[userId];
            individualMetrics.totalInteractions++;
            individualMetrics.totalImpact += interactionRecord.impact;
            individualMetrics.averageImpact = individualMetrics.totalImpact / individualMetrics.totalInteractions;
            individualMetrics.collaborationTime += interactionRecord.duration;
            
            if (!individualMetrics.groups.includes(groupId)) {
                individualMetrics.groups.push(groupId);
            }
            
            // 그룹 성과 지표 업데이트
            if (!this.performanceMetrics.group[groupId]) {
                this.performanceMetrics.group[groupId] = {
                    totalInteractions: 0,
                    totalImpact: 0,
                    averageImpact: 0,
                    memberCount: 0,
                    cohesion: 0,
                    efficiency: 0
                };
            }
            
            const groupMetrics = this.performanceMetrics.group[groupId];
            groupMetrics.totalInteractions++;
            groupMetrics.totalImpact += interactionRecord.impact;
            groupMetrics.averageImpact = groupMetrics.totalImpact / groupMetrics.totalInteractions;
            
            // 전체 성과 지표 업데이트
            this.performanceMetrics.overall.totalCollaborations++;
            this.performanceMetrics.overall.totalStudyTime += interactionRecord.duration;
            this.performanceMetrics.overall.averageAccuracy = this.calculateOverallAccuracy();
            
        } catch (error) {
            console.error('❌ 성과 지표 업데이트 실패:', error);
        }
    }

    async analyzeGroupPerformance(groupId) {
        try {
            console.log('📈 그룹 성과 분석:', groupId);
            
            if (!this.analyticsData[groupId]) {
                throw new Error('그룹 데이터가 없습니다.');
            }

            const groupData = this.analyticsData[groupId];
            const interactions = this.interactionHistory[groupId] || [];
            
            // 기본 통계
            const totalInteractions = groupData.totalInteractions;
            const uniqueUsers = Object.keys(groupData.userContributions).length;
            const averageImpact = groupData.impactScores.length > 0 
                ? groupData.impactScores.reduce((a, b) => a + b, 0) / groupData.impactScores.length 
                : 0;
            
            // 상호작용 패턴 분석
            const interactionPatterns = this.analyzeInteractionPatterns(interactions);
            
            // 사용자 참여도 분석
            const userEngagement = this.analyzeUserEngagement(groupData.userContributions);
            
            // 시간 패턴 분석
            const timePatterns = this.analyzeTimePatterns(groupData.timeDistribution);
            
            // 그룹 응집력 계산
            const cohesion = this.calculateGroupCohesion(groupData);
            
            // 효율성 계산
            const efficiency = this.calculateGroupEfficiency(groupData, interactions);
            
            const analysis = {
                groupId: groupId,
                summary: {
                    totalInteractions: totalInteractions,
                    uniqueUsers: uniqueUsers,
                    averageImpact: averageImpact,
                    cohesion: cohesion,
                    efficiency: efficiency
                },
                interactionPatterns: interactionPatterns,
                userEngagement: userEngagement,
                timePatterns: timePatterns,
                recommendations: this.generateRecommendations(groupData, analysis)
            };
            
            console.log('✅ 그룹 성과 분석 완료');
            return { success: true, analysis: analysis };
            
        } catch (error) {
            console.error('❌ 그룹 성과 분석 실패:', error);
            return { success: false, message: error.message };
        }
    }

    analyzeInteractionPatterns(interactions) {
        try {
            const patterns = {
                types: {},
                frequency: {},
                quality: {}
            };
            
            // 상호작용 유형별 분석
            interactions.forEach(interaction => {
                if (!patterns.types[interaction.type]) {
                    patterns.types[interaction.type] = 0;
                }
                patterns.types[interaction.type]++;
            });
            
            // 빈도 분석 (시간대별)
            const hourlyFrequency = {};
            interactions.forEach(interaction => {
                const hour = new Date(interaction.timestamp).getHours();
                if (!hourlyFrequency[hour]) {
                    hourlyFrequency[hour] = 0;
                }
                hourlyFrequency[hour]++;
            });
            patterns.frequency = hourlyFrequency;
            
            // 품질 분석 (영향도 기반)
            const impactScores = interactions.map(i => i.impact).filter(score => score > 0);
            patterns.quality = {
                averageImpact: impactScores.length > 0 ? impactScores.reduce((a, b) => a + b, 0) / impactScores.length : 0,
                highImpactCount: impactScores.filter(score => score > 0.7).length,
                lowImpactCount: impactScores.filter(score => score < 0.3).length
            };
            
            return patterns;
            
        } catch (error) {
            console.error('❌ 상호작용 패턴 분석 실패:', error);
            return {};
        }
    }

    analyzeUserEngagement(userContributions) {
        try {
            const engagement = {
                topContributors: [],
                averageContribution: 0,
                engagementDistribution: {}
            };
            
            const contributions = Object.values(userContributions);
            const totalContributions = contributions.reduce((sum, user) => sum + user.totalInteractions, 0);
            engagement.averageContribution = totalContributions / contributions.length;
            
            // 상위 기여자 식별
            const sortedUsers = Object.entries(userContributions)
                .sort(([,a], [,b]) => b.totalImpact - a.totalImpact)
                .slice(0, 3);
            
            engagement.topContributors = sortedUsers.map(([userId, data]) => ({
                userId: userId,
                totalInteractions: data.totalInteractions,
                totalImpact: data.totalImpact,
                averageImpact: data.averageImpact
            }));
            
            // 참여도 분포
            const engagementLevels = ['높음', '중간', '낮음'];
            engagementLevels.forEach(level => {
                engagement.engagementDistribution[level] = 0;
            });
            
            contributions.forEach(user => {
                if (user.averageImpact >= 0.7) {
                    engagement.engagementDistribution['높음']++;
                } else if (user.averageImpact >= 0.4) {
                    engagement.engagementDistribution['중간']++;
                } else {
                    engagement.engagementDistribution['낮음']++;
                }
            });
            
            return engagement;
            
        } catch (error) {
            console.error('❌ 사용자 참여도 분석 실패:', error);
            return {};
        }
    }

    analyzeTimePatterns(timeDistribution) {
        try {
            const patterns = {
                peakHours: [],
                lowActivityHours: [],
                distribution: timeDistribution
            };
            
            const sortedHours = Object.entries(timeDistribution)
                .sort(([,a], [,b]) => b - a);
            
            // 피크 시간 (상위 3개)
            patterns.peakHours = sortedHours.slice(0, 3).map(([timeSlot, count]) => ({
                timeSlot: timeSlot,
                count: count
            }));
            
            // 낮은 활동 시간 (하위 3개)
            patterns.lowActivityHours = sortedHours.slice(-3).map(([timeSlot, count]) => ({
                timeSlot: timeSlot,
                count: count
            }));
            
            return patterns;
            
        } catch (error) {
            console.error('❌ 시간 패턴 분석 실패:', error);
            return {};
        }
    }

    calculateGroupCohesion(groupData) {
        try {
            const userContributions = Object.values(groupData.userContributions);
            if (userContributions.length < 2) {
                return 1.0; // 단일 사용자는 최대 응집력
            }
            
            // 사용자 간 기여도 분산 계산
            const impacts = userContributions.map(user => user.averageImpact);
            const meanImpact = impacts.reduce((a, b) => a + b, 0) / impacts.length;
            const variance = impacts.reduce((sum, impact) => sum + Math.pow(impact - meanImpact, 2), 0) / impacts.length;
            const standardDeviation = Math.sqrt(variance);
            
            // 응집력 = 1 - (표준편차 / 평균) (0~1 범위로 정규화)
            const cohesion = Math.max(0, 1 - (standardDeviation / meanImpact));
            
            return cohesion;
            
        } catch (error) {
            console.error('❌ 그룹 응집력 계산 실패:', error);
            return 0.5;
        }
    }

    calculateGroupEfficiency(groupData, interactions) {
        try {
            if (interactions.length === 0) {
                return 0;
            }
            
            // 효율성 = (총 영향도 / 총 상호작용 수) * 응집력
            const totalImpact = groupData.impactScores.reduce((a, b) => a + b, 0);
            const totalInteractions = groupData.totalInteractions;
            const cohesion = this.calculateGroupCohesion(groupData);
            
            const efficiency = (totalImpact / totalInteractions) * cohesion;
            
            return Math.min(1, efficiency); // 0~1 범위로 제한
            
        } catch (error) {
            console.error('❌ 그룹 효율성 계산 실패:', error);
            return 0;
        }
    }

    async calculateCollaborationImpact(userId) {
        try {
            console.log('📊 개인 협업 영향도 분석:', userId);
            
            if (!this.performanceMetrics.individual[userId]) {
                throw new Error('사용자 성과 데이터가 없습니다.');
            }

            const individualMetrics = this.performanceMetrics.individual[userId];
            
            // 기본 지표
            const totalInteractions = individualMetrics.totalInteractions;
            const averageImpact = individualMetrics.averageImpact;
            const collaborationTime = individualMetrics.collaborationTime;
            const groupCount = individualMetrics.groups.length;
            
            // 개선도 계산
            const improvement = this.calculateIndividualImprovement(userId);
            
            // 협업 수준 평가
            const collaborationLevel = this.evaluateCollaborationLevel(individualMetrics);
            
            // 상세 분석
            const detailedAnalysis = {
                interactionQuality: this.analyzeInteractionQuality(userId),
                timeEfficiency: this.analyzeTimeEfficiency(userId),
                groupDiversity: this.analyzeGroupDiversity(userId),
                learningOutcomes: this.analyzeLearningOutcomes(userId)
            };
            
            const impact = {
                userId: userId,
                summary: {
                    totalInteractions: totalInteractions,
                    averageImpact: averageImpact,
                    collaborationTime: collaborationTime,
                    groupCount: groupCount,
                    improvement: improvement,
                    collaborationLevel: collaborationLevel
                },
                detailedAnalysis: detailedAnalysis,
                recommendations: this.generatePersonalRecommendations(individualMetrics)
            };
            
            console.log('✅ 개인 협업 영향도 분석 완료');
            return { success: true, impact: impact };
            
        } catch (error) {
            console.error('❌ 개인 협업 영향도 분석 실패:', error);
            return { success: false, message: error.message };
        }
    }

    calculateIndividualImprovement(userId) {
        try {
            // 개인 개선도 계산 (더미 데이터)
            const baseImprovement = 0.15; // 기본 15% 개선
            const randomFactor = Math.random() * 0.1; // 0~10% 랜덤 추가
            return Math.min(1, baseImprovement + randomFactor);
            
        } catch (error) {
            console.error('❌ 개인 개선도 계산 실패:', error);
            return 0.1;
        }
    }

    evaluateCollaborationLevel(individualMetrics) {
        try {
            const averageImpact = individualMetrics.averageImpact;
            const groupCount = individualMetrics.groups.length;
            
            if (averageImpact >= 0.8 && groupCount >= 3) {
                return '매우 높음';
            } else if (averageImpact >= 0.6 && groupCount >= 2) {
                return '높음';
            } else if (averageImpact >= 0.4 && groupCount >= 1) {
                return '보통';
            } else if (averageImpact >= 0.2) {
                return '낮음';
            } else {
                return '매우 낮음';
            }
            
        } catch (error) {
            console.error('❌ 협업 수준 평가 실패:', error);
            return '보통';
        }
    }

    analyzeInteractionQuality(userId) {
        try {
            // 상호작용 품질 분석 (더미 데이터)
            return {
                highQualityInteractions: Math.floor(Math.random() * 20) + 10,
                mediumQualityInteractions: Math.floor(Math.random() * 15) + 5,
                lowQualityInteractions: Math.floor(Math.random() * 5),
                averageQuality: 0.7 + Math.random() * 0.2
            };
            
        } catch (error) {
            console.error('❌ 상호작용 품질 분석 실패:', error);
            return {};
        }
    }

    analyzeTimeEfficiency(userId) {
        try {
            // 시간 효율성 분석 (더미 데이터)
            return {
                productiveHours: Math.floor(Math.random() * 4) + 2,
                totalStudyTime: Math.floor(Math.random() * 20) + 10,
                efficiency: 0.6 + Math.random() * 0.3,
                optimalTimeSlots: ['저녁', '새벽']
            };
            
        } catch (error) {
            console.error('❌ 시간 효율성 분석 실패:', error);
            return {};
        }
    }

    analyzeGroupDiversity(userId) {
        try {
            // 그룹 다양성 분석 (더미 데이터)
            return {
                diverseGroups: Math.floor(Math.random() * 3) + 1,
                specializedGroups: Math.floor(Math.random() * 2),
                crossGroupLearning: 0.5 + Math.random() * 0.4,
                networkEffect: 0.6 + Math.random() * 0.3
            };
            
        } catch (error) {
            console.error('❌ 그룹 다양성 분석 실패:', error);
            return {};
        }
    }

    analyzeLearningOutcomes(userId) {
        try {
            // 학습 성과 분석 (더미 데이터)
            return {
                knowledgeGain: 0.7 + Math.random() * 0.2,
                skillImprovement: 0.6 + Math.random() * 0.3,
                confidenceBoost: 0.5 + Math.random() * 0.4,
                retentionRate: 0.8 + Math.random() * 0.15
            };
            
        } catch (error) {
            console.error('❌ 학습 성과 분석 실패:', error);
            return {};
        }
    }

    generateRecommendations(groupData, analysis) {
        try {
            const recommendations = [];
            
            // 상호작용 유형별 권장사항
            const interactionTypes = Object.keys(groupData.interactionTypes);
            if (interactionTypes.length < 3) {
                recommendations.push('다양한 유형의 상호작용을 시도해보세요.');
            }
            
            // 참여도 개선 권장사항
            const lowEngagementUsers = Object.entries(groupData.userContributions)
                .filter(([, data]) => data.averageImpact < 0.4);
            if (lowEngagementUsers.length > 0) {
                recommendations.push('참여도가 낮은 멤버들의 적극적인 참여를 유도하세요.');
            }
            
            // 시간 패턴 최적화 권장사항
            const peakHours = analysis.timePatterns.peakHours;
            if (peakHours.length > 0) {
                recommendations.push(`활동이 가장 활발한 시간대(${peakHours[0].timeSlot})를 활용하세요.`);
            }
            
            return recommendations;
            
        } catch (error) {
            console.error('❌ 권장사항 생성 실패:', error);
            return ['분석 데이터를 기반으로 한 구체적인 권장사항을 제공할 수 없습니다.'];
        }
    }

    generatePersonalRecommendations(individualMetrics) {
        try {
            const recommendations = [];
            
            if (individualMetrics.averageImpact < 0.5) {
                recommendations.push('상호작용의 질을 높이기 위해 더 적극적으로 참여하세요.');
            }
            
            if (individualMetrics.groups.length < 2) {
                recommendations.push('다양한 그룹에 참여하여 다양한 관점을 경험하세요.');
            }
            
            if (individualMetrics.collaborationTime < 10) {
                recommendations.push('협업 학습 시간을 늘려 더 많은 상호작용을 하세요.');
            }
            
            return recommendations;
            
        } catch (error) {
            console.error('❌ 개인 권장사항 생성 실패:', error);
            return ['개인 맞춤 권장사항을 생성할 수 없습니다.'];
        }
    }

    async generateCollaborationReport(groupId) {
        try {
            console.log('📋 협업 리포트 생성:', groupId);
            
            const groupAnalysis = await this.analyzeGroupPerformance(groupId);
            if (!groupAnalysis.success) {
                throw new Error('그룹 성과 분석 실패');
            }
            
            const report = {
                groupId: groupId,
                generatedAt: new Date().toISOString(),
                summary: groupAnalysis.analysis.summary,
                detailedAnalysis: groupAnalysis.analysis,
                recommendations: groupAnalysis.analysis.recommendations,
                trends: this.analyzeTrends(groupId),
                predictions: this.generatePredictions(groupId)
            };
            
            console.log('✅ 협업 리포트 생성 완료');
            return { success: true, report: report };
            
        } catch (error) {
            console.error('❌ 협업 리포트 생성 실패:', error);
            return { success: false, message: error.message };
        }
    }

    analyzeTrends(groupId) {
        try {
            // 트렌드 분석 (더미 데이터)
            return {
                interactionGrowth: 0.15, // 15% 성장
                qualityImprovement: 0.08, // 8% 품질 향상
                memberEngagement: 0.12, // 12% 참여도 향상
                efficiencyGain: 0.10 // 10% 효율성 향상
            };
            
        } catch (error) {
            console.error('❌ 트렌드 분석 실패:', error);
            return {};
        }
    }

    generatePredictions(groupId) {
        try {
            // 예측 분석 (더미 데이터)
            return {
                expectedGrowth: 0.20, // 20% 예상 성장
                optimalGroupSize: 6,
                recommendedStudyTime: '20:00-22:00',
                successProbability: 0.85 // 85% 성공 확률
            };
            
        } catch (error) {
            console.error('❌ 예측 분석 실패:', error);
            return {};
        }
    }

    calculateOverallAccuracy() {
        try {
            // 전체 정확도 계산 (더미 데이터)
            return 0.75 + Math.random() * 0.15; // 75~90%
            
        } catch (error) {
            console.error('❌ 전체 정확도 계산 실패:', error);
            return 0.75;
        }
    }

    getTimeSlot(hour) {
        if (hour >= 6 && hour < 12) return '오전';
        if (hour >= 12 && hour < 18) return '오후';
        if (hour >= 18 && hour < 24) return '저녁';
        return '새벽';
    }

    getCurrentUserId() {
        const userInfo = localStorage.getItem('aicu_user_info');
        if (userInfo) {
            const user = JSON.parse(userInfo);
            return user.userName || '게스트';
        }
        return '게스트';
    }

    async saveAnalyticsData() {
        try {
            localStorage.setItem('collaboration_analytics', JSON.stringify(this.analyticsData));
            localStorage.setItem('collaboration_interactions', JSON.stringify(this.interactionHistory));
            localStorage.setItem('collaboration_performance', JSON.stringify(this.performanceMetrics));
        } catch (error) {
            console.error('❌ 분석 데이터 저장 실패:', error);
        }
    }

    // 데이터 초기화
    async resetAnalyticsData() {
        try {
            this.analyticsData = {};
            this.interactionHistory = {};
            this.performanceMetrics = {
                individual: {},
                group: {},
                overall: {
                    totalCollaborations: 0,
                    averageImprovement: 0,
                    totalStudyTime: 0,
                    averageAccuracy: 0
                }
            };
            
            localStorage.removeItem('collaboration_analytics');
            localStorage.removeItem('collaboration_interactions');
            localStorage.removeItem('collaboration_performance');
            
            console.log('✅ 협업 분석 데이터 초기화 완료');
            return { success: true };
            
        } catch (error) {
            console.error('❌ 협업 분석 데이터 초기화 실패:', error);
            return { success: false, message: error.message };
        }
    }

    // 시스템 정보 조회
    getSystemInfo() {
        return {
            isInitialized: this.isInitialized,
            analyticsDataCount: Object.keys(this.analyticsData).length,
            interactionHistoryCount: Object.keys(this.interactionHistory).length,
            performanceMetricsCount: Object.keys(this.performanceMetrics.individual).length
        };
    }
}

// 전역 인스턴스 생성
window.collaborationAnalytics = new CollaborationAnalytics();


