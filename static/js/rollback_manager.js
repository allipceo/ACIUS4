// 롤백 관리 시스템
// 파일: static/js/rollback_manager.js

class RollbackManager {
    static createBackup(name) {
        const backup = {
            localStorage: {},
            timestamp: new Date().toISOString(),
            version: 'v4.0'
        };
        
        // 모든 localStorage 데이터 백업
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            backup.localStorage[key] = localStorage.getItem(key);
        }
        
        localStorage.setItem(`backup_${name}`, JSON.stringify(backup));
        console.log(`✅ 백업 생성 완료: ${name}`);
    }
    
    static rollback(name) {
        const backupData = localStorage.getItem(`backup_${name}`);
        if (backupData) {
            const backup = JSON.parse(backupData);
            
            // localStorage 초기화
            localStorage.clear();
            
            // 백업 데이터 복원
            Object.keys(backup.localStorage).forEach(key => {
                localStorage.setItem(key, backup.localStorage[key]);
            });
            
            console.log(`✅ 롤백 완료: ${name}`);
            location.reload();
        }
    }
    
    static listBackups() {
        const backups = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('backup_')) {
                backups.push(key.replace('backup_', ''));
            }
        }
        return backups;
    }
}

// 전역 인스턴스 생성
window.RollbackManager = RollbackManager;

// 초기 백업 생성
RollbackManager.createBackup('pre_week1');
