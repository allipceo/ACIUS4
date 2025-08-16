// 데이터 마이그레이션 및 복원 관리자
// 파일: static/js/data_migration_manager.js

class DataMigrationManager {
    constructor() {
        this.systemName = "Data Migration Manager";
        this.isInitialized = false;
        this.init();
    }

    /**
     * 초기화
     */
    init() {
        console.log('=== DataMigrationManager 초기화 ===');
        
        // 기존 데이터 복원 시도
        this.restoreLegacyData();
        
        // 실제 학습 데이터 마이그레이션
        this.migrateRealLearningData();
        
        // 테스트 데이터 생성 (기존 데이터가 없는 경우)
        this.createTestDataIfNeeded();
        
        this.isInitialized = true;
        console.log('✅ DataMigrationManager 초기화 완료');
    }

    /**
     * 기존 데이터 복원 시도
     */
    restoreLegacyData() {
        console.log('=== 기존 데이터 복원 시도 ===');
        
        try {
            // 백업된 데이터가 있는지 확인
            const backupData = localStorage.getItem('aicu_backup_data');
            if (backupData) {
                console.log('✅ 백업된 데이터 발견, 복원 시도');
                const parsedBackup = JSON.parse(backupData);
                // 백업 데이터를 중앙 시스템으로 마이그레이션
                this.migrateDataToCentralSystem(parsedBackup);
            }
        } catch (error) {
            console.error('❌ 기존 데이터 복원 실패:', error);
        }
    }

    /**
     * 실제 학습 데이터 마이그레이션
     */
    migrateRealLearningData() {
        console.log('=== 실제 학습 데이터 마이그레이션 ===');
        
        try {
            // 기존 카테고리 통계 데이터 확인
            const categoryStats = JSON.parse(localStorage.getItem('aicu_category_statistics') || '{}');
            
            if (categoryStats.categories && Object.keys(categoryStats.categories).length > 0) {
                console.log('✅ 실제 학습 데이터 발견:', categoryStats.categories);
                
                // 실제 데이터를 중앙 시스템으로 마이그레이션
                this.migrateDataToCentralSystem(categoryStats);
                
                // 마이그레이션 완료 후 기존 데이터 백업
                this.backupExistingData(categoryStats);
                
                console.log('✅ 실제 학습 데이터 마이그레이션 완료');
            } else {
                console.log('ℹ️ 마이그레이션할 실제 학습 데이터가 없습니다.');
            }
        } catch (error) {
            console.error('❌ 실제 학습 데이터 마이그레이션 실패:', error);
        }
    }

    /**
     * 데이터를 중앙 시스템으로 마이그레이션
     */
    migrateDataToCentralSystem(sourceData) {
        console.log('=== 중앙 시스템으로 데이터 마이그레이션 ===');
        
        try {
            // 카테고리명 매핑
            const categoryMapping = {
                '배상책임보험': '08배상책임보험',
                '재산보험': '06재산보험',
                '특종보험': '07특종보험',
                '해상보험': '09해상보험'
            };

            // 중앙 시스템 데이터 구조
            const centralData = {
                categories: {
                    '06재산보험': { total: 0, correct: 0, incorrect: 0, accuracy: 0.0 },
                    '07특종보험': { total: 0, correct: 0, incorrect: 0, accuracy: 0.0 },
                    '08배상책임보험': { total: 0, correct: 0, incorrect: 0, accuracy: 0.0 },
                    '09해상보험': { total: 0, correct: 0, incorrect: 0, accuracy: 0.0 }
                },
                lastUpdated: new Date().toISOString(),
                version: '1.0'
            };

            // 기존 데이터를 중앙 시스템 형식으로 변환
            if (sourceData.categories) {
                for (const [oldCategory, data] of Object.entries(sourceData.categories)) {
                    const newCategory = categoryMapping[oldCategory];
                    
                    if (newCategory && data.solved > 0) {
                        const correct = data.correct || 0;
                        const incorrect = data.solved - correct;
                        const accuracy = data.solved > 0 ? (correct / data.solved) * 100 : 0;
                        
                        centralData.categories[newCategory] = {
                            total: data.solved,
                            correct: correct,
                            incorrect: incorrect,
                            accuracy: Math.round(accuracy * 10) / 10
                        };
                        
                        console.log(`✅ ${oldCategory} → ${newCategory}: ${data.solved}문제, ${correct}정답, ${accuracy.toFixed(1)}%`);
                    }
                }
            }

            // 중앙 시스템에 저장
            localStorage.setItem('aicu_real_time_data', JSON.stringify(centralData));
            
            // CentralDataManager가 있다면 강제로 데이터 로드
            if (window.CentralDataManager && window.CentralDataManager.instance) {
                window.CentralDataManager.instance.loadData();
                console.log('✅ CentralDataManager 데이터 강제 로드 완료');
            }
            
            console.log('✅ 중앙 시스템 마이그레이션 완료:', centralData);
            
        } catch (error) {
            console.error('❌ 중앙 시스템 마이그레이션 실패:', error);
        }
    }

    /**
     * 기존 데이터 백업
     */
    backupExistingData(data) {
        try {
            localStorage.setItem('aicu_backup_data', JSON.stringify(data));
            console.log('✅ 기존 데이터 백업 완료');
        } catch (error) {
            console.error('❌ 기존 데이터 백업 실패:', error);
        }
    }

    /**
     * 테스트 데이터 생성 (기존 데이터가 없는 경우)
     */
    createTestDataIfNeeded() {
        console.log('=== 테스트 데이터 생성 확인 ===');
        
        try {
            const centralData = JSON.parse(localStorage.getItem('aicu_real_time_data') || '{}');
            
            // 중앙 시스템에 데이터가 없거나 모든 카테고리가 0인 경우
            if (!centralData.categories || 
                Object.values(centralData.categories).every(cat => cat.total === 0)) {
                
                console.log('ℹ️ 테스트 데이터 생성 필요');
                this.createTestData();
            } else {
                console.log('✅ 중앙 시스템에 유효한 데이터가 있습니다.');
            }
        } catch (error) {
            console.error('❌ 테스트 데이터 생성 확인 실패:', error);
        }
    }

    /**
     * 테스트 데이터 생성
     */
    createTestData() {
        console.log('=== 테스트 데이터 생성 ===');
        
        try {
            const testData = {
                categories: {
                    '06재산보험': { 
                        total: 6, 
                        correct: 5, 
                        incorrect: 1, 
                        accuracy: 83.3 
                    },
                    '07특종보험': { 
                        total: 8, 
                        correct: 5, 
                        incorrect: 3, 
                        accuracy: 62.5 
                    },
                    '08배상책임보험': { 
                        total: 18, 
                        correct: 6, 
                        incorrect: 12, 
                        accuracy: 33.3 
                    },
                    '09해상보험': { 
                        total: 0, 
                        correct: 0, 
                        incorrect: 0, 
                        accuracy: 0.0 
                    }
                },
                lastUpdated: new Date().toISOString(),
                version: '1.0'
            };

            localStorage.setItem('aicu_real_time_data', JSON.stringify(testData));
            console.log('✅ 테스트 데이터 생성 완료:', testData);
            
        } catch (error) {
            console.error('❌ 테스트 데이터 생성 실패:', error);
        }
    }

    /**
     * 마이그레이션 상태 확인
     */
    checkMigrationStatus() {
        console.log('=== 마이그레이션 상태 확인 ===');
        
        try {
            const centralData = JSON.parse(localStorage.getItem('aicu_real_time_data') || '{}');
            const legacyData = JSON.parse(localStorage.getItem('aicu_category_statistics') || '{}');
            
            console.log('📊 중앙 시스템 데이터:', centralData);
            console.log('📊 기존 데이터:', legacyData);
            
            // 데이터 일관성 확인
            let totalProblems = 0;
            if (centralData.categories) {
                totalProblems = Object.values(centralData.categories)
                    .reduce((sum, cat) => sum + cat.total, 0);
            }
            
            console.log(`📈 총 문제 수: ${totalProblems}`);
            
            if (totalProblems > 0) {
                console.log('✅ 마이그레이션 성공: 유효한 데이터가 중앙 시스템에 있습니다.');
                return true;
            } else {
                console.log('❌ 마이그레이션 실패: 중앙 시스템에 데이터가 없습니다.');
                return false;
            }
            
        } catch (error) {
            console.error('❌ 마이그레이션 상태 확인 실패:', error);
            return false;
        }
    }

    /**
     * 강제 마이그레이션 실행
     */
    forceMigration() {
        console.log('=== 강제 마이그레이션 실행 ===');
        
        // 기존 데이터 완전 삭제
        localStorage.removeItem('aicu_real_time_data');
        
        // 실제 학습 데이터 마이그레이션
        this.migrateRealLearningData();
        
        // 상태 확인
        const success = this.checkMigrationStatus();
        
        if (success) {
            console.log('✅ 강제 마이그레이션 성공');
            // 페이지 새로고침으로 모든 시스템 재시작
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            console.log('❌ 강제 마이그레이션 실패');
        }
    }
}

// 전역 인스턴스 생성
window.DataMigrationManager = new DataMigrationManager();
