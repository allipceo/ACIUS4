# AICU S4 고급통계 구현계획 v2.0

**작성자**: 노팀장 (기술자문)  
**기준**: 조대표님 요구사항 + 108번 아키텍처 완전 준수  
**목표**: 101번 요구사항 90% 달성을 통한 유료 앱 가치 실현  
**작성일**: 2025년 8월 15일 00:16 KST

---

## 🎯 **핵심 전략: 유료 앱 가치 실현 우선**

### **비즈니스 목표**
- **101번 요구사항 완전 구현**: 게스트모드, D-day, 예상점수, 합격률, 오답분석
- **유료화 차별 기능 완성**: 무료 체험 → 프리미엄 전환 유도
- **108번 아키텍처 완전 준수**: 안전성과 기능성 동시 확보

### **개발 원칙**
- **레고블록 철학**: 각 주차 200-250줄 이하
- **기존 시스템 보호**: 85% 완성도 유지하며 추가 개발
- **점진적 검증**: 단계별 완성 후 다음 단계 진행

---

## 📅 **3주 완성 로드맵**

### **🚀 1주차: 즉시 체험 가능한 UX 개선**
**목표**: 진입 장벽 제거 + 시험 긴장감 조성  
**유료화 가치**: 즉시 체험 가능 + 목표 의식 강화

#### **구현 파일 (108번 Week1 완전 준수)**
```javascript
// === 파일 1: static/js/guest_mode_defaults.js (100줄) ===
class GuestModeManager {
    static applyDefaults() {
        const userInfo = localStorage.getItem('aicu_user_data');
        
        if (!userInfo) {
            const defaultUserData = {
                name: '게스트',
                registration_date: '2025-08-01',    // 조대표님 지정
                exam_subject: 'AICU',
                exam_date: '2025-09-13',            // 조대표님 지정
                phone: '010-1234-5678',
                is_guest: true,
                created_at: new Date().toISOString()
            };
            
            localStorage.setItem('aicu_user_data', JSON.stringify(defaultUserData));
            this.initializeStatistics(defaultUserData);
            console.log('✅ 게스트 모드 기본값 적용 완료');
            return defaultUserData;
        }
        return JSON.parse(userInfo);
    }
    
    static initializeStatistics(userData) {
        const today = new Date().toISOString().split('T')[0];
        
        if (!localStorage.getItem('aicu_statistics')) {
            const initialStats = {
                registration_timestamp: userData.created_at,
                total_questions_attempted: 0,
                total_correct_answers: 0,
                accuracy_rate: 0,
                daily_progress: {
                    [today]: { attempted: 0, correct: 0, accuracy: 0 }
                },
                last_updated: userData.created_at
            };
            
            localStorage.setItem('aicu_statistics', JSON.stringify(initialStats));
        }
    }
}

// 페이지 로드 시 자동 실행
document.addEventListener('DOMContentLoaded', () => {
    GuestModeManager.applyDefaults();
});

window.GuestModeManager = GuestModeManager;

// === 파일 2: static/js/dday_counter.js (80줄) ===
class DDayCounter {
    constructor(examDate = '2025-09-13') {
        this.examDate = new Date(examDate);
        this.init();
    }
    
    calculateDDay() {
        const today = new Date();
        const timeDiff = this.examDate - today;
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        
        return {
            days: daysDiff,
            display: daysDiff > 0 ? `D-${daysDiff}` : daysDiff === 0 ? 'D-Day' : `D+${Math.abs(daysDiff)}`,
            status: daysDiff > 0 ? 'before' : daysDiff === 0 ? 'today' : 'after'
        };
    }
    
    updateDisplay() {
        const dday = this.calculateDDay();
        
        // 대문 페이지 D-day 표시
        const ddayElement = document.getElementById('dday-counter');
        if (ddayElement) {
            ddayElement.textContent = dday.display;
            ddayElement.className = `dday-${dday.status}`;
        }
        
        // 사용자 정보 영역에 표시
        const userInfoElement = document.getElementById('user-exam-info');
        if (userInfoElement) {
            const userData = JSON.parse(localStorage.getItem('aicu_user_data') || '{}');
            userInfoElement.innerHTML = `
                <div class="user-info">
                    <span>👤 ${userData.name || '게스트'}</span>
                    <span>📅 시험일: ${userData.exam_date || '2025-09-13'} (${dday.display})</span>
                </div>
            `;
        }
        
        return dday;
    }
    
    init() {
        this.updateDisplay();
        
        // 매일 자정에 업데이트
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const msUntilMidnight = tomorrow.getTime() - now.getTime();
        
        setTimeout(() => {
            this.updateDisplay();
            setInterval(() => this.updateDisplay(), 24 * 60 * 60 * 1000);
        }, msUntilMidnight);
    }
}

window.DDayCounter = new DDayCounter();

// === 파일 3: templates/home.html 수정 (20줄) ===
// 기존 home.html에 추가할 내용:
<!-- D-day 카운터 표시 영역 -->
<div id="dday-counter" class="dday-display"></div>

<!-- 사용자 정보 표시 영역 -->  
<div id="user-exam-info" class="user-exam-info"></div>

<!-- 스크립트 로드 -->
<script src="/static/js/guest_mode_defaults.js"></script>
<script src="/static/js/dday_counter.js"></script>
```

#### **1주차 예상 효과**
- **진입 장벽 제거**: 등록 없이 즉시 학습 시작
- **목표 의식 강화**: D-day 표시로 시험 긴장감 조성
- **유료 전환 동기**: 게스트에서 실제 사용자로 전환 유도

---

### **🎯 2주차: 핵심 차별화 기능 (조대표님 요구사항 핵심)**
**목표**: 과목별 예상점수 + 합격확률 계산  
**유료화 가치**: 경쟁 앱 대비 핵심 차별 기능

#### **구현 파일 (108번 Week2 완전 준수)**
```javascript
// === 파일 1: static/js/predicted_scores.js (150줄) ===
class PredictedScoreCalculator {
    constructor() {
        this.subjects = ['06재산보험', '07특종보험', '08배상책임보험', '09해상보험'];
        this.passCriteria = {
            subjectMinimum: 40,     // 과목당 40점 이상
            overallAverage: 60      // 전체 평균 60점 이상 (조대표님: 50점→60점 상향)
        };
    }
    
    /**
     * 과목별 예상 점수 계산
     * 조대표 요구사항: "현재 내가 푼 데이터를 기준으로 볼 때 시험과목당 평균 몇점이고"
     */
    calculateSubjectScores() {
        const categoryStats = JSON.parse(localStorage.getItem('aicu_category_statistics') || '{}');
        const results = {};
        
        this.subjects.forEach(subject => {
            const stats = categoryStats.categories?.[subject];
            
            if (stats && stats.solved > 0) {
                const accuracy = (stats.correct / stats.solved) * 100;
                results[subject] = {
                    attempted: stats.solved,
                    correct: stats.correct,
                    accuracy: Math.round(accuracy),
                    predicted_score: Math.round(accuracy),  // 정답률 = 예상점수
                    pass_status: accuracy >= this.passCriteria.subjectMinimum ? 'pass' : 'fail'
                };
            } else {
                results[subject] = {
                    attempted: 0,
                    correct: 0,
                    accuracy: 0,
                    predicted_score: 0,
                    pass_status: 'no_data'
                };
            }
        });
        
        return results;
    }
    
    /**
     * 전체 평균 점수 및 합격 확률 계산
     * 조대표 요구사항: "총 평균은 몇점이다. 합격 확율이 몇 %다"
     */
    calculateOverallResults() {
        const subjectScores = this.calculateSubjectScores();
        const validSubjects = Object.values(subjectScores).filter(s => s.attempted > 0);
        
        if (validSubjects.length === 0) {
            return {
                average_score: 0,
                pass_probability: 0,
                status: 'no_data',
                message: '아직 풀이한 문제가 없습니다.'
            };
        }
        
        // 전체 평균 계산
        const totalScore = validSubjects.reduce((sum, s) => sum + s.predicted_score, 0);
        const averageScore = Math.round(totalScore / validSubjects.length);
        
        // 합격 조건 확인
        const subjectPassCount = validSubjects.filter(s => s.predicted_score >= this.passCriteria.subjectMinimum).length;
        const allSubjectsPass = subjectPassCount === validSubjects.length;
        const averagePass = averageScore >= this.passCriteria.overallAverage;
        
        // 합격 확률 계산 (조대표님 요구사항 반영)
        let passRatio = 0;
        if (allSubjectsPass && averagePass) {
            passRatio = Math.min(95, 70 + (averageScore - this.passCriteria.overallAverage));
        } else if (allSubjectsPass || averagePass) {
            passRatio = Math.min(70, 30 + (averageScore - 40));
        } else {
            passRatio = Math.max(5, averageScore / 2);
        }
        
        return {
            average_score: averageScore,
            pass_probability: Math.round(passRatio),
            subject_pass_count: subjectPassCount,
            total_subjects: validSubjects.length,
            status: allSubjectsPass && averagePass ? 'likely_pass' : 'needs_improvement',
            message: this.generateMessage(allSubjectsPass, averagePass, averageScore)
        };
    }
    
    generateMessage(allSubjectsPass, averagePass, averageScore) {
        if (allSubjectsPass && averagePass) {
            return `현재 실력으로 합격 가능성이 높습니다! (평균 ${averageScore}점)`;
        } else if (!allSubjectsPass) {
            return '일부 과목이 40점 미만입니다. 취약 과목을 집중 학습하세요.';
        } else {
            return `전체 평균이 ${averageScore}점입니다. 60점 이상을 목표로 하세요.`;
        }
    }
    
    /**
     * 화면에 예상 점수 표시 (조대표님 요구사항 반영)
     */
    displayResults() {
        const subjectScores = this.calculateSubjectScores();
        const overallResults = this.calculateOverallResults();
        
        const scoreDisplayElement = document.getElementById('predicted-scores');
        if (scoreDisplayElement) {
            scoreDisplayElement.innerHTML = `
                <div class="predicted-scores">
                    <h3>📊 현재 수준 예상 점수</h3>
                    <div class="overall-score">
                        <span class="score">${overallResults.average_score}점</span>
                        <span class="probability">합격확률: ${overallResults.pass_probability}%</span>
                    </div>
                    <div class="subject-scores">
                        ${this.subjects.map(subject => {
                            const score = subjectScores[subject];
                            return `
                                <div class="subject ${score.pass_status}">
                                    <span class="name">${subject.substring(2)}</span>
                                    <span class="score">${score.predicted_score}점</span>
                                    <span class="status">${score.predicted_score >= 40 ? '✅' : '❌'}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <p class="message">${overallResults.message}</p>
                    <div class="criteria">
                        <small>📋 합격 기준: 과목별 40점 이상 + 전체 평균 60점 이상</small>
                    </div>
                </div>
            `;
        }
        
        return { subjectScores, overallResults };
    }
}

window.PredictedScoreCalculator = new PredictedScoreCalculator();

// === 파일 2: static/css/predicted_scores.css (50줄) ===
.predicted-scores {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 15px;
    margin: 20px 0;
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}

.overall-score {
    text-align: center;
    margin-bottom: 20px;
}

.overall-score .score {
    font-size: 2.5em;
    font-weight: bold;
    display: block;
}

.overall-score .probability {
    font-size: 1.2em;
    opacity: 0.9;
}

.subject-scores {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 15px;
}

.subject {
    background: rgba(255,255,255,0.1);
    padding: 15px;
    border-radius: 10px;
    text-align: center;
}

.subject.pass {
    border-left: 4px solid #4CAF50;
}

.subject.fail {
    border-left: 4px solid #f44336;
}

.subject .name {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
}

.subject .score {
    font-size: 1.5em;
    display: block;
}

.message {
    text-align: center;
    font-size: 1.1em;
    margin-bottom: 10px;
}

.criteria {
    text-align: center;
    opacity: 0.8;
}

// === 파일 3: templates/home.html 추가 (30줄) ===
<!-- 예상 점수 표시 영역 -->
<div id="predicted-scores" class="predicted-scores-container"></div>

<!-- CSS 로드 -->
<link rel="stylesheet" href="/static/css/predicted_scores.css">

<!-- 스크립트 로드 -->
<script src="/static/js/predicted_scores.js"></script>

<!-- 통계 업데이트 시 자동 재계산 -->
<script>
document.addEventListener('statisticsUpdated', () => {
    window.PredictedScoreCalculator.displayResults();
});

// 페이지 로드 시 예상 점수 표시
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.PredictedScoreCalculator.displayResults();
    }, 1000);
});
</script>
```

#### **2주차 예상 효과**
- **핵심 차별화**: "현재 수준으로 몇점, 합격확률 몇%" 기능 완성
- **유료 가치 입증**: 경쟁 앱에 없는 고유 기능
- **학습 동기 강화**: 실시간 점수 예측으로 목표 의식 향상

---

### **🔍 3주차: 프리미엄 고급 분석 기능**
**목표**: 1-5번 틀린 문제별 상세 분석  
**유료화 가치**: 개인 맞춤 학습 인사이트 제공

#### **구현 파일 (108번 Week3 완전 준수)**
```javascript
// === 파일 1: static/js/incorrect_analysis.js (120줄) ===
class IncorrectAnalysisManager {
    constructor() {
        this.maxAttempts = 5;
        this.init();
    }
    
    /**
     * 문제별 시도 횟수 추적
     * 조대표 요구사항: "과목별로 한번에 맞춘 문제는 몇개(%) 한번틀린 문제는 몇개(%)"
     */
    trackQuestionAttempts(questionId, isCorrect, category) {
        let attempts = JSON.parse(localStorage.getItem('aicu_question_attempts') || '{}');
        
        if (!attempts[questionId]) {
            attempts[questionId] = {
                category: category,
                attempt_count: 0,
                correct_attempt: 0,
                first_attempt_correct: false,
                history: []
            };
        }
        
        attempts[questionId].attempt_count += 1;
        attempts[questionId].history.push({
            attempt: attempts[questionId].attempt_count,
            is_correct: isCorrect,
            timestamp: new Date().toISOString()
        });
        
        if (isCorrect) {
            attempts[questionId].correct_attempt = attempts[questionId].attempt_count;
            if (attempts[questionId].attempt_count === 1) {
                attempts[questionId].first_attempt_correct = true;
            }
        }
        
        localStorage.setItem('aicu_question_attempts', JSON.stringify(attempts));
        this.updateIncorrectStatistics();
        
        return attempts[questionId];
    }
    
    /**
     * 오답 횟수별 통계 계산 (조대표님 요구사항 완전 구현)
     */
    calculateIncorrectStatistics() {
        const attempts = JSON.parse(localStorage.getItem('aicu_question_attempts') || '{}');
        const stats = {
            overall: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            by_category: {}
        };
        
        Object.values(attempts).forEach(questionData => {
            const category = questionData.category === '기본학습' ? 'overall' : questionData.category;
            
            if (!stats.by_category[category]) {
                stats.by_category[category] = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            }
            
            if (questionData.correct_attempt > 0) {
                const incorrectCount = questionData.correct_attempt - 1;
                const statKey = Math.min(incorrectCount, this.maxAttempts);
                
                stats.overall[statKey] += 1;
                if (category !== 'overall') {
                    stats.by_category[category][statKey] += 1;
                }
            } else if (questionData.attempt_count >= this.maxAttempts) {
                stats.overall[this.maxAttempts] += 1;
                if (category !== 'overall') {
                    stats.by_category[category][this.maxAttempts] += 1;
                }
            }
        });
        
        return stats;
    }
    
    /**
     * 화면에 오답 분석 표시 (조대표님 요구사항 반영)
     */
    displayAnalysis() {
        const stats = this.calculateIncorrectStatistics();
        const totalQuestions = Object.values(stats.overall).reduce((sum, count) => sum + count, 0);
        
        if (totalQuestions === 0) {
            return { message: '아직 분석할 데이터가 없습니다.' };
        }
        
        const analysisElement = document.getElementById('incorrect-analysis');
        if (analysisElement) {
            analysisElement.innerHTML = `
                <div class="incorrect-analysis">
                    <h3>🔍 오답 횟수별 정밀 분석</h3>
                    <div class="overall-stats">
                        <h4>📊 전체 현황 (총 ${totalQuestions}문제)</h4>
                        ${[0, 1, 2, 3, 4, 5].map(count => {
                            const questionCount = stats.overall[count];
                            const percentage = totalQuestions > 0 ? Math.round((questionCount / totalQuestions) * 100) : 0;
                            const label = count === 0 ? '🎯 한번에 맞춘 문제' : 
                                         count === 5 ? '⚠️ 다섯번 이상 틀린 문제' : 
                                         `❌ ${count}번 틀린 문제`;
                            const statusColor = count === 0 ? 'success' : count <= 2 ? 'warning' : 'danger';
                            
                            return `
                                <div class="stat-item ${statusColor}">
                                    <span class="label">${label}</span>
                                    <span class="count">${questionCount}개 (${percentage}%)</span>
                                    <div class="progress-bar">
                                        <div class="progress" style="width: ${percentage}%"></div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div class="category-stats">
                        <h4>📋 과목별 오답 현황</h4>
                        ${Object.keys(stats.by_category).map(category => {
                            const categoryStats = stats.by_category[category];
                            const categoryTotal = Object.values(categoryStats).reduce((sum, count) => sum + count, 0);
                            if (categoryTotal === 0) return '';
                            
                            const categoryName = category.includes('0') ? category.substring(2) : category;
                            
                            return `
                                <div class="category-item">
                                    <h5>📚 ${categoryName}</h5>
                                    <div class="category-breakdown">
                                        ${[0, 1, 2].map(count => {
                                            const questionCount = categoryStats[count];
                                            const percentage = categoryTotal > 0 ? Math.round((questionCount / categoryTotal) * 100) : 0;
                                            const label = count === 0 ? '한번에 맞춘 문제' : `${count}번 틀린 문제`;
                                            return `
                                                <span class="breakdown-item">
                                                    ${label}: <strong>${questionCount}개 (${percentage}%)</strong>
                                                </span>
                                            `;
                                        }).join('')}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div class="analysis-insights">
                        <h4>💡 학습 인사이트</h4>
                        ${this.generateInsights(stats, totalQuestions)}
                    </div>
                </div>
            `;
        }
        
        return stats;
    }
    
    generateInsights(stats, totalQuestions) {
        const oneAttempt = stats.overall[0];
        const multipleAttempts = totalQuestions - oneAttempt;
        const oneAttemptRatio = Math.round((oneAttempt / totalQuestions) * 100);
        
        let insights = [];
        
        if (oneAttemptRatio >= 70) {
            insights.push('🎉 우수한 실력! 한번에 맞춘 문제가 70% 이상입니다.');
        } else if (oneAttemptRatio >= 50) {
            insights.push('👍 좋은 실력입니다. 틀린 문제를 복습하면 더 향상될 것입니다.');
        } else {
            insights.push('📚 더 많은 학습이 필요합니다. 기초를 다시 한번 점검해보세요.');
        }
        
        if (stats.overall[4] + stats.overall[5] > 0) {
            insights.push('⚠️ 반복해서 틀리는 문제들이 있습니다. 해당 영역을 집중 학습하세요.');
        }
        
        return insights.map(insight => `<p class="insight">${insight}</p>`).join('');
    }
    
    init() {
        if (!localStorage.getItem('aicu_question_attempts')) {
            localStorage.setItem('aicu_question_attempts', JSON.stringify({}));
        }
        
        document.addEventListener('questionAnswered', (event) => {
            const { questionId, isCorrect, category } = event.detail;
            this.trackQuestionAttempts(questionId, isCorrect, category);
        });
    }
    
    updateIncorrectStatistics() {
        const stats = this.calculateIncorrectStatistics();
        localStorage.setItem('aicu_incorrect_statistics', JSON.stringify(stats));
        document.dispatchEvent(new CustomEvent('incorrectStatsUpdated', { detail: stats }));
        return stats;
    }
}

window.IncorrectAnalysisManager = new IncorrectAnalysisManager();

// === 파일 2: static/css/incorrect_analysis.css (40줄) ===
.incorrect-analysis {
    background: #f8f9fa;
    border-radius: 15px;
    padding: 25px;
    margin: 20px 0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    margin: 10px 0;
    border-radius: 10px;
    border-left: 4px solid;
}

.stat-item.success {
    background: #d4edda;
    border-left-color: #28a745;
}

.stat-item.warning {
    background: #fff3cd;
    border-left-color: #ffc107;
}

.stat-item.danger {
    background: #f8d7da;
    border-left-color: #dc3545;
}

.progress-bar {
    width: 100px;
    height: 8px;
    background: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
}

.progress {
    height: 100%;
    background: linear-gradient(90deg, #28a745, #20c997);
    transition: width 0.3s ease;
}

.category-item {
    background: white;
    padding: 20px;
    margin: 15px 0;
    border-radius: 10px;
    border: 1px solid #dee2e6;
}

.category-breakdown {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-top: 10px;
}

.breakdown-item {
    background: #e9ecef;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.9em;
}

.analysis-insights {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 10px;
    margin-top: 20px;
}

.insight {
    margin: 10px 0;
    padding: 10px;
    background: rgba(255,255,255,0.1);
    border-radius: 8px;
}

// === 파일 3: templates/statistics.html 추가 (40줄) ===
<!-- 오답 분석 표시 영역 -->
<div id="incorrect-analysis" class="incorrect-analysis-container"></div>

<!-- CSS 로드 -->
<link rel="stylesheet" href="/static/css/incorrect_analysis.css">

<!-- 스크립트 로드 -->
<script src="/static/js/incorrect_analysis.js"></script>

<!-- 페이지 로드 시 분석 표시 -->
<script>
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.IncorrectAnalysisManager.displayAnalysis();
    }, 1000);
});

// 오답 통계 업데이트 시 자동 재표시
document.addEventListener('incorrectStatsUpdated', () => {
    window.IncorrectAnalysisManager.displayAnalysis();
});
</script>
```

#### **3주차 예상 효과**
- **프리미엄 가치**: 1-5번 틀린 문제별 정밀 분석
- **개인 맞춤 인사이트**: 학습 패턴 기반 개선 방향 제시
- **고급 분석 완성**: 경쟁 앱 대비 압도적 차별화

---

## 📊 **기존 시스템 연동 방안**

### **🔗 기존 파일 최소 수정 (안전성 확보)**
```javascript
// === basic_learning_main.js에 5줄만 추가 ===
function updateStatistics(question, userAnswer, isCorrect) {
    // 기존 로직 유지
    // ...existing code...
    
    // Week3 오답 분석 연동 (신규 추가)
    document.dispatchEvent(new CustomEvent('questionAnswered', {
        detail: { questionId: question.qcode, isCorrect, category: '기본학습' }
    }));
}

// === large_category_main.js에 5줄만 추가 ===
function handleAnswerSelection(question, userAnswer, isCorrect, category) {
    // 기존 로직 유지
    // ...existing code...
    
    // Week3 오답 분석 연동 (신규 추가)
    document.dispatchEvent(new CustomEvent('questionAnswered', {
        detail: { questionId: question.qcode, isCorrect, category }
    }));
}
```

### **📱 UI 통합 방안**
```html
<!-- home.html 최종 통합 구조 -->
<!DOCTYPE html>
<html>
<head>
    <title>AICU S4 - 고급통계 v2.0</title>
    <!-- 기존 스타일 -->
    <link rel="stylesheet" href="/static/css/style.css">
    <!-- Week2 추가 스타일 -->
    <link rel="stylesheet" href="/static/css/predicted_scores.css">
</head>
<body>
    <!-- 기존 대문 내용 -->
    
    <!-- Week1 추가: D-day 카운터 -->
    <div id="dday-counter" class="dday-display"></div>
    <div id="user-exam-info" class="user-exam-info"></div>
    
    <!-- Week2 추가: 예상 점수 -->
    <div id="predicted-scores" class="predicted-scores-container"></div>
    
    <!-- 기존 스크립트 -->
    <!-- Week1 추가 스크립트 -->
    <script src="/static/js/guest_mode_defaults.js"></script>
    <script src="/static/js/dday_counter.js"></script>
    <!-- Week2 추가 스크립트 -->
    <script src="/static/js/predicted_scores.js"></script>
</body>
</html>
```

---

## 🎯 **101번 요구사항 달성도 검증**

### **완전 구현 예정 (90% 달성)**
| 요구사항 | 1주차 | 2주차 | 3주차 |
|---------|--------|--------|--------|
| 게스트 모드 기본값 자동 설정 | ✅ 100% | - | - |
| D-day 카운터 | ✅ 100% | - | - |
| 등록 시점 기준 통계 | ✅ 100% | - | - |
| 이어풀기 기능 완성 | ✅ 100% | - | - |
| 과목별 예상 점수 | - | ✅ 100% | - |
| 전체 평균 점수 | - | ✅ 100% | - |
| 합격 확률 계산 | - | ✅ 100% | - |
| 오답 횟수별 분석 (1-5번) | - | - | ✅ 100% |
| 과목별 오답 현황 | - | - | ✅ 100% |

### **유료화 가치 실현 로드맵**
- **1주 후**: 즉시 체험 가능 + 목표 의식 (진입 장벽 제거)
- **2주 후**: 핵심 차별화 기능 완성 (예상점수 + 합격률)
- **3주 후**: 프리미엄 고급 분석 (개인 맞춤 인사이트)

---

## 📋 **구현 일정 및 검증 계획**

### **Week1 (8월 15일-22일)**
- **Day 1-2**: `guest_mode_defaults.js` 구현 및 테스트
- **Day 3-4**: `dday_counter.js` 구현 및 테스트  
- **Day 5-7**: `home.html` 통합 및 전체 테스트

**검증 기준**: 
- 앱 실행 시 자동 게스트 설정 확인
- D-day 카운터 정확한 표시 확인
- 기존 기능 정상 작동 확인

### **Week2 (8월 22일-29일)**
- **Day 1-3**: `predicted_scores.js` 핵심 로직 구현
- **Day 4-5**: CSS 스타일링 및 UI 개선
- **Day 6-7**: 통계 연동 및 통합 테스트

**검증 기준**:
- 과목별 예상 점수 정확한 계산
- 합격 확률 합리적 산출
- 실시간 업데이트 정상 작동

### **Week3 (8월 29일-9월 5일)**
- **Day 1-3**: `incorrect_analysis.js` 오답 추적 로직
- **Day 4-5**: 분석 화면 및 인사이트 생성
- **Day 6-7**: 전체 통합 및 최종 테스트

**검증 기준**:
- 1-5번 틀린 문제 정확한 분류
- 과목별 오답 현황 정확한 표시
- 학습 인사이트 의미있는 제공

---

## 🚀 **성공 지표 및 기대 효과**

### **비즈니스 성과 지표**
- **사용자 체험율**: 90% 이상 (게스트 모드)
- **유료 전환율**: 40% 이상 (예상점수 기능)
- **사용자 만족도**: 9.0/10 이상 (고급 분석)

### **기술적 성과 지표**
- **101번 요구사항 달성**: 90% 이상
- **기존 시스템 안정성**: 100% 유지
- **레고블록 원칙 준수**: 완벽 준수

### **유료 앱 차별화 완성**
1. **즉시 체험**: 등록 없이 바로 학습 시작
2. **실시간 예측**: 현재 수준 기반 점수 예측
3. **개인 맞춤**: 오답 패턴 기반 학습 인사이트
4. **목표 관리**: D-day 카운터로 동기 부여

---

## 💎 **최종 결론**

**AICU S4 고급통계 구현계획 v2.0**은 **조대표님의 유료 앱 가치 실현 요구사항**과 **108번 아키텍처의 기술적 안전성**을 완벽하게 결합한 실행 계획입니다.

### **핵심 성공 요인**
- **108번 문서 완전 준수**: 파일 구조, 코드 라인, 연동 방법
- **101번 요구사항 90% 달성**: 게스트모드부터 오답분석까지
- **유료화 가치 명확화**: 경쟁 앱 대비 압도적 차별화
- **안전한 점진적 개발**: 기존 85% 완성도 보호

**3주 후 AICU S4는 국내 최고 수준의 차별화된 유료 학습 앱으로 완성됩니다.**

---

**작성 완료**: 2025년 8월 15일 00:18 KST  
**상태**: 조대표님 승인 대기 중  
**다음 단계**: Week1 구현 착수 지시 대기