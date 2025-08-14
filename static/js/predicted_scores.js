// 과목별 예상 점수 및 합격 확률 계산 시스템
// 파일: static/js/predicted_scores.js

class PredictedScoresManager {
    constructor() {
        this.subjects = {
            '06재산보험': { name: '재산보험', total: 169, weight: 0.25 },
            '07특종보험': { name: '특종보험', total: 182, weight: 0.25 },
            '08배상책임보험': { name: '배상책임보험', total: 268, weight: 0.25 },
            '09해상보험': { name: '해상보험', total: 170, weight: 0.25 }
        };
        
        this.passCriteria = {
            subjectMinimum: 40,    // 과목당 40점 이상
            overallAverage: 60     // 전체 평균 60점 이상
        };
        
        this.init();
    }
    
    // 예상 점수 계산
    calculatePredictedScores() {
        const categoryStats = JSON.parse(localStorage.getItem('aicu_category_statistics') || '{}');
        const scores = {};
        let totalScore = 0;
        let totalWeight = 0;
        
        Object.keys(this.subjects).forEach(subjectKey => {
            const subject = this.subjects[subjectKey];
            const stats = categoryStats.categories?.[subjectKey] || {};
            
            // 정답률 계산
            const solved = stats.solved || 0;
            const correct = stats.correct || 0;
            const accuracy = solved > 0 ? (correct / solved) * 100 : 0;
            
            // 예상 점수 계산 (정답률을 100점 만점으로 환산)
            const predictedScore = Math.round(accuracy);
            
            scores[subjectKey] = {
                name: subject.name,
                total: subject.total,
                solved: solved,
                correct: correct,
                accuracy: accuracy,
                predictedScore: predictedScore,
                weight: subject.weight,
                isPass: predictedScore >= this.passCriteria.subjectMinimum
            };
            
            totalScore += predictedScore * subject.weight;
            totalWeight += subject.weight;
        });
        
        // 전체 평균 점수
        const overallAverage = totalWeight > 0 ? totalScore / totalWeight : 0;
        
        return {
            subjects: scores,
            overallAverage: Math.round(overallAverage),
            totalSubjects: Object.keys(this.subjects).length,
            passedSubjects: Object.values(scores).filter(s => s.isPass).length,
            isOverallPass: overallAverage >= this.passCriteria.overallAverage
        };
    }
    
    // 합격 확률 계산
    calculatePassProbability(scores) {
        const { subjects, overallAverage, passedSubjects, totalSubjects } = scores;
        
        // 과목별 합격률
        const subjectPassRate = (passedSubjects / totalSubjects) * 100;
        
        // 전체 평균 점수 기반 합격 확률
        let overallPassProbability = 0;
        if (overallAverage >= 80) {
            overallPassProbability = 95;
        } else if (overallAverage >= 70) {
            overallPassProbability = 85;
        } else if (overallAverage >= 60) {
            overallPassProbability = 70;
        } else if (overallAverage >= 50) {
            overallPassProbability = 40;
        } else if (overallAverage >= 40) {
            overallPassProbability = 20;
        } else {
            overallPassProbability = 5;
        }
        
        // 종합 합격 확률 (과목별 합격률과 전체 점수 가중 평균)
        const combinedProbability = Math.round((subjectPassRate * 0.4) + (overallPassProbability * 0.6));
        
        return {
            subjectPassRate: Math.round(subjectPassRate),
            overallPassProbability: overallPassProbability,
            combinedProbability: combinedProbability,
            riskLevel: this.getRiskLevel(combinedProbability)
        };
    }
    
    // 위험도 레벨 판정
    getRiskLevel(probability) {
        if (probability >= 80) return { level: 'high', text: '합격 가능성 높음', color: 'green' };
        if (probability >= 60) return { level: 'medium', text: '합격 가능성 보통', color: 'yellow' };
        if (probability >= 40) return { level: 'low', text: '합격 가능성 낮음', color: 'orange' };
        return { level: 'critical', text: '합격 가능성 매우 낮음', color: 'red' };
    }
    
    // UI 업데이트
    updateDisplay() {
        const scores = this.calculatePredictedScores();
        const probability = this.calculatePassProbability(scores);
        
        // 예상 점수 카드 업데이트
        this.updateScoreCards(scores);
        
        // 합격 확률 업데이트
        this.updatePassProbability(probability);
        
        // 전체 상태 업데이트
        this.updateOverallStatus(scores, probability);
        
        return { scores, probability };
    }
    
    // 예상 점수 카드 업데이트
    updateScoreCards(scores) {
        const scoreContainer = document.getElementById('predicted-scores-container');
        if (!scoreContainer) return;
        
        let html = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">';
        
        Object.keys(scores.subjects).forEach(subjectKey => {
            const subject = scores.subjects[subjectKey];
            const passClass = subject.isPass ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50';
            const passIcon = subject.isPass ? '✅' : '❌';
            
            html += `
                <div class="score-card ${passClass} border-2 rounded-lg p-4">
                    <div class="flex justify-between items-center mb-2">
                        <h4 class="font-bold text-lg">${subject.name}</h4>
                        <span class="text-2xl">${passIcon}</span>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-blue-600">${subject.predictedScore}점</div>
                        <div class="text-sm text-gray-600">정답률: ${subject.accuracy.toFixed(1)}%</div>
                        <div class="text-xs text-gray-500">(${subject.correct}/${subject.solved})</div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        scoreContainer.innerHTML = html;
    }
    
    // 합격 확률 업데이트
    updatePassProbability(probability) {
        const probabilityContainer = document.getElementById('pass-probability-container');
        if (!probabilityContainer) return;
        
        const riskClass = `risk-${probability.riskLevel.level}`;
        
        const html = `
            <div class="probability-card ${riskClass} border-2 rounded-lg p-6 text-center">
                <h3 class="text-xl font-bold mb-4">합격 확률</h3>
                <div class="text-4xl font-bold text-blue-600 mb-2">${probability.combinedProbability}%</div>
                <div class="text-lg font-semibold mb-2">${probability.riskLevel.text}</div>
                <div class="text-sm text-gray-600">
                    과목별 합격률: ${probability.subjectPassRate}%<br>
                    전체 점수 기반: ${probability.overallPassProbability}%
                </div>
            </div>
        `;
        
        probabilityContainer.innerHTML = html;
    }
    
    // 전체 상태 업데이트
    updateOverallStatus(scores, probability) {
        const statusContainer = document.getElementById('overall-status-container');
        if (!statusContainer) return;
        
        const statusClass = scores.isOverallPass ? 'status-pass' : 'status-fail';
        const statusIcon = scores.isOverallPass ? '🎉' : '⚠️';
        const statusText = scores.isOverallPass ? '합격 가능' : '합격 어려움';
        
        const html = `
            <div class="overall-status ${statusClass} border-2 rounded-lg p-4 text-center">
                <div class="text-3xl mb-2">${statusIcon}</div>
                <div class="text-xl font-bold mb-2">${statusText}</div>
                <div class="text-lg">전체 평균: ${scores.overallAverage}점</div>
                <div class="text-sm text-gray-600">
                    합격 과목: ${scores.passedSubjects}/${scores.totalSubjects}개
                </div>
            </div>
        `;
        
        statusContainer.innerHTML = html;
    }
    
    // 초기화
    init() {
        // 페이지 로드 시 자동 업데이트
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.updateDisplay());
        } else {
            this.updateDisplay();
        }
        
        // 전역 함수로 노출
        window.PredictedScoresManager = this;
    }
}

// 전역 인스턴스 생성
window.predictedScoresManager = new PredictedScoresManager();
