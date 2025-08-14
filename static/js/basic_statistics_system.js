// basic_statistics_system.js - 통계 데이터 시작점 확보를 위한 기본 통계 시스템

class BasicStatisticsSystem {
    constructor() {
        this.isInitialized = false;
        this.userInfo = null;
        this.progressData = null;
        this.statistics = null;
        
        console.log('=== 기본 통계 시스템 초기화 ===');
    }
    
    // 시스템 초기화
    async initialize() {
        try {
            console.log('🔧 기본 통계 시스템 초기화 시작...');
            
            // 사용자 정보 로드
            await this.loadUserInfo();
            
            // 진도 데이터 로드
            await this.loadProgressData();
            
            // 통계 계산
            this.calculateStatistics();
            
            this.isInitialized = true;
            console.log('✅ 기본 통계 시스템 초기화 완료');
            
            return {
                success: true,
                message: '기본 통계 시스템이 성공적으로 초기화되었습니다.'
            };
            
        } catch (error) {
            console.error('❌ 기본 통계 시스템 초기화 실패:', error);
            return {
                success: false,
                message: '기본 통계 시스템 초기화에 실패했습니다: ' + error.message
            };
        }
    }
    
    // 사용자 정보 로드
    async loadUserInfo() {
        try {
            // LocalStorage에서 사용자 정보 확인
            const storedUserInfo = localStorage.getItem('aicu_user_info');
            
            if (storedUserInfo) {
                this.userInfo = JSON.parse(storedUserInfo);
                console.log('✅ 저장된 사용자 정보 로드:', this.userInfo);
            } else {
                // 기본 사용자 정보 설정 (데모 모드)
                this.userInfo = {
                    userName: '조대표',
                    userPhone: '010-1234-5678',
                    examDate: '2025-11-12',
                    isRegistered: false,
                    registrationDate: new Date().toISOString(),
                    isDemoMode: true
                };
                
                // LocalStorage에 저장
                localStorage.setItem('aicu_user_info', JSON.stringify(this.userInfo));
                console.log('✅ 기본 사용자 정보 설정 (데모 모드):', this.userInfo);
            }
            
        } catch (error) {
            console.error('❌ 사용자 정보 로드 실패:', error);
            throw error;
        }
    }
    
    // 진도 데이터 로드
    async loadProgressData() {
        try {
            // LocalStorage에서 진도 데이터 확인
            const storedProgress = localStorage.getItem('aicu_progress');
            
            if (storedProgress) {
                this.progressData = JSON.parse(storedProgress);
                console.log('✅ 저장된 진도 데이터 로드:', this.progressData);
            } else {
                // 기본 진도 데이터 생성
                this.progressData = this.createDefaultProgressData();
                
                // LocalStorage에 저장
                localStorage.setItem('aicu_progress', JSON.stringify(this.progressData));
                console.log('✅ 기본 진도 데이터 생성:', this.progressData);
            }
            
        } catch (error) {
            console.error('❌ 진도 데이터 로드 실패:', error);
            throw error;
        }
    }
    
    // 기본 진도 데이터 생성
    createDefaultProgressData() {
        const today = new Date().toISOString().split('T')[0];
        
        return {
            userInfo: {
                registrationDate: new Date().toISOString(),
                userName: this.userInfo.userName,
                examDate: this.userInfo.examDate,
                userType: this.userInfo.isRegistered ? 'registered' : 'guest'
            },
            basicLearning: {
                lastQuestion: 0,
                totalAttempted: 0,
                totalCorrect: 0,
                todayAttempted: 0,
                todayCorrect: 0,
                lastStudyDate: today
            },
            largeCategory: {
                재산보험: { 
                    lastQuestion: 0, 
                    totalAttempted: 0, 
                    totalCorrect: 0, 
                    todayAttempted: 0, 
                    todayCorrect: 0, 
                    totalQuestions: 197 
                },
                특종보험: { 
                    lastQuestion: 0, 
                    totalAttempted: 0, 
                    totalCorrect: 0, 
                    todayAttempted: 0, 
                    todayCorrect: 0, 
                    totalQuestions: 263 
                },
                배상보험: { 
                    lastQuestion: 0, 
                    totalAttempted: 0, 
                    totalCorrect: 0, 
                    todayAttempted: 0, 
                    todayCorrect: 0, 
                    totalQuestions: 197 
                },
                해상보험: { 
                    lastQuestion: 0, 
                    totalAttempted: 0, 
                    totalCorrect: 0, 
                    todayAttempted: 0, 
                    todayCorrect: 0, 
                    totalQuestions: 132 
                }
            }
        };
    }
    
    // 통계 계산
    calculateStatistics() {
        try {
            const basic = this.progressData.basicLearning;
            const categories = this.progressData.largeCategory;
            
            // 카테고리별 통계 합산
            let totalAttempted = basic.totalAttempted;
            let totalCorrect = basic.totalCorrect;
            let todayAttempted = basic.todayAttempted;
            let todayCorrect = basic.todayCorrect;
            
            Object.values(categories).forEach(category => {
                totalAttempted += category.totalAttempted;
                totalCorrect += category.totalCorrect;
                todayAttempted += category.todayAttempted;
                todayCorrect += category.todayCorrect;
            });
            
            // 전체 통계 계산
            this.statistics = {
                totalAttempted: totalAttempted,
                totalCorrect: totalCorrect,
                totalAccuracy: totalAttempted > 0 ? ((totalCorrect / totalAttempted) * 100).toFixed(1) : 0,
                todayAttempted: todayAttempted,
                todayCorrect: todayCorrect,
                todayAccuracy: todayAttempted > 0 ? ((todayCorrect / todayAttempted) * 100).toFixed(1) : 0,
                basicLearning: {
                    totalAttempted: basic.totalAttempted,
                    totalCorrect: basic.totalCorrect,
                    accuracy: basic.totalAttempted > 0 ? ((basic.totalCorrect / basic.totalAttempted) * 100).toFixed(1) : 0,
                    progressRate: ((basic.lastQuestion / 789) * 100).toFixed(1)
                },
                largeCategory: {
                    totalAttempted: totalAttempted - basic.totalAttempted,
                    totalCorrect: totalCorrect - basic.totalCorrect,
                    accuracy: (totalAttempted - basic.totalAttempted) > 0 ? 
                        (((totalCorrect - basic.totalCorrect) / (totalAttempted - basic.totalAttempted)) * 100).toFixed(1) : 0
                }
            };
            
            console.log('✅ 통계 계산 완료:', this.statistics);
            
        } catch (error) {
            console.error('❌ 통계 계산 실패:', error);
            throw error;
        }
    }
    
    // 문제 풀이 결과 업데이트
    updateOnQuestionSolved(category, questionId, isCorrect) {
        try {
            if (!this.isInitialized) {
                throw new Error('통계 시스템이 초기화되지 않았습니다.');
            }
            
            const today = new Date().toISOString().split('T')[0];
            
            if (category === 'basic_learning') {
                // 기본학습 통계 업데이트
                this.progressData.basicLearning.lastQuestion = questionId;
                this.progressData.basicLearning.totalAttempted++;
                if (isCorrect) this.progressData.basicLearning.totalCorrect++;
                
                // 날짜가 바뀌면 오늘 통계 초기화
                if (this.progressData.basicLearning.lastStudyDate !== today) {
                    this.progressData.basicLearning.todayAttempted = 0;
                    this.progressData.basicLearning.todayCorrect = 0;
                    this.progressData.basicLearning.lastStudyDate = today;
                }
                
                this.progressData.basicLearning.todayAttempted++;
                if (isCorrect) this.progressData.basicLearning.todayCorrect++;
                
            } else if (this.progressData.largeCategory[category]) {
                // 대분류 학습 통계 업데이트
                const categoryData = this.progressData.largeCategory[category];
                categoryData.lastQuestion = questionId;
                categoryData.totalAttempted++;
                if (isCorrect) categoryData.totalCorrect++;
                
                categoryData.todayAttempted++;
                if (isCorrect) categoryData.todayCorrect++;
            }
            
            // LocalStorage에 저장
            localStorage.setItem('aicu_progress', JSON.stringify(this.progressData));
            
            // 통계 재계산
            this.calculateStatistics();
            
            console.log(`✅ 문제 풀이 결과 업데이트: ${category} ${questionId}번 ${isCorrect ? '정답' : '오답'}`);
            
            return {
                success: true,
                message: '문제 풀이 결과가 업데이트되었습니다.'
            };
            
        } catch (error) {
            console.error('❌ 문제 풀이 결과 업데이트 실패:', error);
            return {
                success: false,
                message: '문제 풀이 결과 업데이트에 실패했습니다: ' + error.message
            };
        }
    }
    
    // 다음 문제 조회
    getNextQuestion(category) {
        try {
            if (!this.isInitialized) {
                throw new Error('통계 시스템이 초기화되지 않았습니다.');
            }
            
            if (category === 'basic_learning') {
                const nextQuestionId = this.progressData.basicLearning.lastQuestion + 1;
                if (nextQuestionId > 789) {
                    return { 
                        completed: true, 
                        message: '모든 문제를 완료했습니다!' 
                    };
                }
                return { 
                    questionId: nextQuestionId, 
                    total: 789 
                };
                
            } else if (this.progressData.largeCategory[category]) {
                const categoryData = this.progressData.largeCategory[category];
                const nextQuestionId = categoryData.lastQuestion + 1;
                
                if (nextQuestionId > categoryData.totalQuestions) {
                    return { 
                        completed: true, 
                        message: `${category} 모든 문제를 완료했습니다!` 
                    };
                }
                return { 
                    questionId: nextQuestionId, 
                    total: categoryData.totalQuestions 
                };
            }
            
            throw new Error(`알 수 없는 카테고리: ${category}`);
            
        } catch (error) {
            console.error('❌ 다음 문제 조회 실패:', error);
            return {
                completed: false,
                error: error.message
            };
        }
    }
    
    // 실제 사용자 등록
    registerRealUser(realUserInfo) {
        try {
            console.log('=== 실제 사용자 등록 시작 ===');
            
            // 기존 데이터 완전 초기화
            this.resetAllData();
            
            // 새로운 사용자 정보 설정
            this.userInfo = {
                userName: realUserInfo.name,
                userPhone: realUserInfo.phone,
                examDate: realUserInfo.exam_date,
                isRegistered: true,
                registrationDate: new Date().toISOString(),
                isDemoMode: false
            };
            
            // LocalStorage에 사용자 정보 저장
            localStorage.setItem('aicu_user_info', JSON.stringify(this.userInfo));
            
            // 새로운 진도 데이터 생성
            this.progressData = this.createDefaultProgressData();
            localStorage.setItem('aicu_progress', JSON.stringify(this.progressData));
            
            // 통계 재계산
            this.calculateStatistics();
            
            console.log('✅ 실제 사용자 등록 완료:', this.userInfo);
            
            return {
                success: true,
                message: '실제 사용자 등록이 완료되었습니다.'
            };
            
        } catch (error) {
            console.error('❌ 실제 사용자 등록 실패:', error);
            return {
                success: false,
                message: '실제 사용자 등록에 실패했습니다: ' + error.message
            };
        }
    }
    
    // 진도 초기화
    resetProgress() {
        try {
            const today = new Date().toISOString().split('T')[0];
            
            // 진도만 초기화 (사용자 정보는 유지)
            this.progressData.basicLearning = {
                lastQuestion: 0,
                totalAttempted: 0,
                totalCorrect: 0,
                todayAttempted: 0,
                todayCorrect: 0,
                lastStudyDate: today
            };
            
            this.progressData.largeCategory = {
                재산보험: { lastQuestion: 0, totalAttempted: 0, totalCorrect: 0, todayAttempted: 0, todayCorrect: 0, totalQuestions: 197 },
                특종보험: { lastQuestion: 0, totalAttempted: 0, totalCorrect: 0, todayAttempted: 0, todayCorrect: 0, totalQuestions: 263 },
                배상보험: { lastQuestion: 0, totalAttempted: 0, totalCorrect: 0, todayAttempted: 0, todayCorrect: 0, totalQuestions: 197 },
                해상보험: { lastQuestion: 0, totalAttempted: 0, totalCorrect: 0, todayAttempted: 0, todayCorrect: 0, totalQuestions: 132 }
            };
            
            // LocalStorage에 저장
            localStorage.setItem('aicu_progress', JSON.stringify(this.progressData));
            
            // 통계 재계산
            this.calculateStatistics();
            
            console.log('✅ 진도 초기화 완료');
            
            return {
                success: true,
                message: '진도가 초기화되었습니다.'
            };
            
        } catch (error) {
            console.error('❌ 진도 초기화 실패:', error);
            return {
                success: false,
                message: '진도 초기화에 실패했습니다: ' + error.message
            };
        }
    }
    
    // 모든 데이터 초기화
    resetAllData() {
        try {
            // LocalStorage에서 모든 데이터 삭제
            localStorage.removeItem('aicu_progress');
            localStorage.removeItem('aicu_user_info');
            localStorage.removeItem('aicu_settings');
            
            console.log('✅ 모든 데이터 초기화 완료');
            
            return {
                success: true,
                message: '모든 데이터가 초기화되었습니다.'
            };
            
        } catch (error) {
            console.error('❌ 데이터 초기화 실패:', error);
            return {
                success: false,
                message: '데이터 초기화에 실패했습니다: ' + error.message
            };
        }
    }
    
    // 통계 데이터 조회
    getStatistics() {
        if (!this.isInitialized) {
            return null;
        }
        
        return {
            userInfo: this.userInfo,
            progressData: this.progressData,
            statistics: this.statistics
        };
    }
    
    // 홈페이지 통계 업데이트
    updateHomeStatistics() {
        try {
            if (!this.isInitialized) {
                throw new Error('통계 시스템이 초기화되지 않았습니다.');
            }
            
            // 홈페이지 통계 박스 업데이트
            this.updateStatisticsBoxes();
            
            console.log('✅ 홈페이지 통계 업데이트 완료');
            
        } catch (error) {
            console.error('❌ 홈페이지 통계 업데이트 실패:', error);
        }
    }
    
    // 통계 박스 업데이트
    updateStatisticsBoxes() {
        const stats = this.statistics;
        
        // 박스 1: 보유 문제수
        const questionCountBox = document.getElementById('question-count-box');
        if (questionCountBox) {
            questionCountBox.innerHTML = `
                <div class="text-center p-4 bg-blue-100 rounded-lg">
                    <h3 class="text-lg font-bold text-blue-800">보유 문제수</h3>
                    <p class="text-2xl font-bold text-blue-600">789개</p>
                    <p class="text-sm text-gray-600">인스교재 기준</p>
                </div>
            `;
        }
        
        // 박스 2: 학습 진도 현황
        const progressBox = document.getElementById('progress-box');
        if (progressBox) {
            const progressRate = ((stats.totalAttempted / 789) * 100).toFixed(1);
            progressBox.innerHTML = `
                <div class="text-center p-4 bg-green-100 rounded-lg">
                    <h3 class="text-lg font-bold text-green-800">학습 진도</h3>
                    <p class="text-2xl font-bold text-green-600">${progressRate}%</p>
                    <p class="text-sm text-gray-600">${stats.totalAttempted}/789문제</p>
                    <p class="text-sm text-gray-600">정답률 ${stats.totalAccuracy}%</p>
                </div>
            `;
        }
        
        // 박스 3: 금일 학습 현황
        const dailyBox = document.getElementById('daily-box');
        if (dailyBox) {
            dailyBox.innerHTML = `
                <div class="text-center p-4 bg-orange-100 rounded-lg">
                    <h3 class="text-lg font-bold text-orange-800">오늘 학습</h3>
                    <p class="text-2xl font-bold text-orange-600">${stats.todayAttempted}문제</p>
                    <p class="text-sm text-gray-600">정답률 ${stats.todayAccuracy}%</p>
                </div>
            `;
        }
    }
}

// 전역 인스턴스 생성
window.basicStatisticsSystem = new BasicStatisticsSystem();

console.log('✅ 기본 통계 시스템 로드 완료');


