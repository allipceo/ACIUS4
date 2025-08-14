// ===================================================================
// Week3 통계고도화 현실적 계획 - 107번 문서 기준 수정
// 101번 요구사항 vs 107번 현황 정확 분석 기반
// ===================================================================

/**
 * 📊 현재 상황 정리 (107번 문서 기반)
 * 
 * ✅ 완전 구현 완료 (85-100%)
 * - 기본 통계 시스템 (aicu_statistics)
 * - 대분류 통계 시스템 (aicu_category_statistics) 
 * - 등록시점 기반 통계
 * - LocalStorage 기반 데이터 보존
 * - 실시간 통계 업데이트
 * - 이어풀기 기능
 * 
 * 🔄 부분 구현 (70-90%)
 * - 사용자 등록 시점 기반 통계 (게스트 모드 기본값 필요)
 * - 일별/누적 통계 분리 (UI 표시 개선 필요)
 * 
 * ❌ 미구현 (0%)
 * - 과목별 예상 점수 및 합격 확률
 * - 오답 횟수별 분석 (1-5번 틀린 문제)
 * - 선택형/진위형 과목별 분석
 * - D-day 카운터
 * - 게스트 모드 기본값 자동 설정
 */
 ## 🎯 **Week3 통계고도화 현실적 계획 완성**

### **✅ 107번 문서 분석 반영 완료**

#### **현재 구현 완료 (85-100%)**
- 기본 통계 시스템 ✅
- 대분류 통계 시스템 ✅ 
- 등록시점 기반 통계 ✅
- 이어풀기 기능 ✅

#### **Week3 집중 개발 (미구현 0% → 100%)**
- 게스트 모드 기본값 자동 설정
- D-day 카운터 
- 과목별 예상 점수 및 합격 확률
- 오답 횟수별 분석 (1-5번 틀린 문제)

### **🚀 레고블록 완벽 준수**

#### **1주차 (200줄): 기본 UX 개선**
- `guest_mode_defaults.js` (100줄)
- `dday_counter.js` (80줄)
- `home.html` 수정 (20줄)

#### **2주차 (230줄): 핵심 예상점수**
- `predicted_scores.js` (150줄)
- CSS 스타일링 (50줄)  
- HTML 연동 (30줄)

#### **3주차 (200줄): 고급 분석**
- `incorrect_analysis.js` (120줄)
- 분석 화면 (40줄)
- CSS + 연동 (40줄)

### **📊 101번 요구사항 달성률**

```
게스트 모드: 0% → 100%
D-day 카운터: 0% → 100%  
과목별 예상점수: 0% → 100%
합격 확률: 0% → 100%
오답 분석: 0% → 100%
전체 달성률: 70% → 95%
```

### **🛡️ 위험도 최소화**

#### **기존 시스템 보호**
- 기존 파일 최소 수정 (5-50줄)
- 기존 로직 100% 유지
- 추가 기능만 구현

#### **점진적 개발**
- 주차별 독립 기능
- 단계별 테스트 가능
- 문제 발생 시 해당 주차만 롤백

**조대표님, 이제 107번 현황을 완벽히 반영한 현실적이고 실용적인 Week3 계획이 완성되었습니다!** 

레고블록 원칙 준수 + 101번 요구사항 완벽 구현이 가능합니다! 🎯✨


class Week3StatisticsUpgrade {
    constructor() {
        this.version = '3.1.0'; // 현실적 버전
        this.init();
    }

    /**
     * 🎯 Week3 목표: 미구현 기능만 집중 개발
     * 107번 분석 기반 - 기존 85% 완성도 위에 추가 개발
     */
    getWeek3UpgradeSpec() {
        return {
            // === 우선순위 1: 게스트 모드 기본값 (즉시 필요) ===
            guest_mode_defaults: {
                name: '게스트',
                registration_date: '2025-08-01',    // 조대표님 지정
                exam_subject: 'AICU',
                exam_date: '2025-09-13',            // 조대표님 지정
                phone: '010-1234-5678',
                auto_apply: true                    // 자동 적용
            },

            // === 우선순위 2: D-day 카운터 (단순 계산) ===
            d_day_counter: {
                target_date: '2025-09-13',          // 시험일
                display_format: 'D-30',             // 표시 형식
                update_frequency: 'daily'           // 일별 업데이트
            },

            // === 우선순위 3: 과목별 예상 점수 (핵심 요구사항) ===
            predicted_scores: {
                subjects: ['손해보험', '생명보험', '해상보험', '배상책임보험'],
                calculation_method: 'accuracy_based',  // 정답률 기반
                pass_criteria: {
                    subject_minimum: 40,            // 과목당 40점 이상
                    overall_average: 60             // 전체 평균 60점 이상
                },
                formula: '정답률 × 100 = 예상점수'
            },

            // === 우선순위 4: 오답 횟수별 분석 (조대표 핵심 요구) ===
            incorrect_analysis: {
                attempt_counts: [1, 2, 3, 4, 5],   // 1-5번 틀린 문제
                tracking_method: 'question_id_based', // 문제별 추적
                display_format: 'count_and_percentage' // 개수(%)
            }
        };
    }

    /**
     * 🚀 Step 1: 게스트 모드 기본값 자동 설정 (100줄)
     * 즉시 구현 가능 - 기존 시스템 최소 수정
     */
    implementGuestModeDefaults() {
        return `
// === 파일: static/js/guest_mode_defaults.js (100줄) ===

class GuestModeManager {
    static applyDefaults() {
        const userInfo = localStorage.getItem('aicu_user_data');
        
        if (!userInfo) {
            const defaultUserData = {
                name: '게스트',
                registration_date: '2025-08-01',
                exam_subject: 'AICU', 
                exam_date: '2025-09-13',
                phone: '010-1234-5678',
                is_guest: true,
                created_at: new Date().toISOString()
            };
            
            localStorage.setItem('aicu_user_data', JSON.stringify(defaultUserData));
            
            // 통계 시스템 초기화
            this.initializeStatistics(defaultUserData);
            
            console.log('✅ 게스트 모드 기본값 적용 완료');
            return defaultUserData;
        }
        
        return JSON.parse(userInfo);
    }
    
    static initializeStatistics(userData) {
        const today = new Date().toISOString().split('T')[0];
        
        // 기존 통계가 없으면 초기화
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
        `;
    }

    /**
     * 🚀 Step 2: D-day 카운터 구현 (80줄)
     * 단순 계산 - 기존 UI에 추가
     */
    implementDDayCounter() {
        return `
// === 파일: static/js/dday_counter.js (80줄) ===

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
            display: daysDiff > 0 ? \`D-\${daysDiff}\` : daysDiff === 0 ? 'D-Day' : \`D+\${Math.abs(daysDiff)}\`,
            status: daysDiff > 0 ? 'before' : daysDiff === 0 ? 'today' : 'after'
        };
    }
    
    updateDisplay() {
        const dday = this.calculateDDay();
        
        // 대문 페이지 D-day 표시
        const ddayElement = document.getElementById('dday-counter');
        if (ddayElement) {
            ddayElement.textContent = dday.display;
            ddayElement.className = \`dday-\${dday.status}\`;
        }
        
        // 사용자 정보 영역에 표시
        const userInfoElement = document.getElementById('user-exam-info');
        if (userInfoElement) {
            const userData = JSON.parse(localStorage.getItem('aicu_user_data') || '{}');
            userInfoElement.innerHTML = \`
                <div class="user-info">
                    <span>👤 \${userData.name || '게스트'}</span>
                    <span>📅 시험일: \${userData.exam_date || '2025-09-13'} (\${dday.display})</span>
                </div>
            \`;
        }
        
        return dday;
    }
    
    init() {
        // 즉시 업데이트
        this.updateDisplay();
        
        // 매일 자정에 업데이트
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const msUntilMidnight = tomorrow.getTime() - now.getTime();
        
        setTimeout(() => {
            this.updateDisplay();
            // 이후 24시간마다 업데이트
            setInterval(() => this.updateDisplay(), 24 * 60 * 60 * 1000);
        }, msUntilMidnight);
    }
}

// 전역 인스턴스 생성
window.DDayCounter = new DDayCounter();
        `;
    }

    /**
     * 🚀 Step 3: 과목별 예상 점수 계산 (150줄)
     * 조대표님 핵심 요구사항 - 정답률 기반 점수 계산
     */
    implementPredictedScores() {
        return `
// === 파일: static/js/predicted_scores.js (150줄) ===

class PredictedScoreCalculator {
    constructor() {
        this.subjects = ['손해보험', '생명보험', '해상보험', '배상책임보험'];
        this.passCriteria = {
            subjectMinimum: 40,     // 과목당 40점 이상
            overallAverage: 60      // 전체 평균 60점 이상
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
            const subjectKey = this.findSubjectKey(subject, categoryStats);
            const stats = categoryStats.categories?.[subjectKey];
            
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
        
        // 합격 확률 계산 (단순 휴리스틱)
        let passRatio = 0;
        if (allSubjectsPass && averagePass) {
            passRatio = Math.min(95, 50 + (averageScore - this.passCriteria.overallAverage));
        } else if (allSubjectsPass || averagePass) {
            passRatio = Math.min(70, 20 + (averageScore - 40));
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
    
    findSubjectKey(subject, categoryStats) {
        // 실제 저장된 키 찾기 (06재산보험, 07특종보험 등)
        const categories = Object.keys(categoryStats.categories || {});
        return categories.find(key => key.includes(subject.slice(0, 2))) || subject;
    }
    
    generateMessage(allSubjectsPass, averagePass, averageScore) {
        if (allSubjectsPass && averagePass) {
            return \`현재 실력으로 합격 가능성이 높습니다! (평균 \${averageScore}점)\`;
        } else if (!allSubjectsPass) {
            return '일부 과목이 40점 미만입니다. 취약 과목을 집중 학습하세요.';
        } else {
            return \`전체 평균이 \${averageScore}점입니다. 60점 이상을 목표로 하세요.\`;
        }
    }
    
    /**
     * 화면에 예상 점수 표시
     */
    displayResults() {
        const subjectScores = this.calculateSubjectScores();
        const overallResults = this.calculateOverallResults();
        
        // 대문 페이지에 표시
        const scoreDisplayElement = document.getElementById('predicted-scores');
        if (scoreDisplayElement) {
            scoreDisplayElement.innerHTML = \`
                <div class="predicted-scores">
                    <h3>📊 예상 점수</h3>
                    <div class="overall-score">
                        <span class="score">\${overallResults.average_score}점</span>
                        <span class="probability">합격확률: \${overallResults.pass_probability}%</span>
                    </div>
                    <div class="subject-scores">
                        \${this.subjects.map(subject => {
                            const score = subjectScores[subject];
                            return \`
                                <div class="subject \${score.pass_status}">
                                    <span class="name">\${subject}</span>
                                    <span class="score">\${score.predicted_score}점</span>
                                </div>
                            \`;
                        }).join('')}
                    </div>
                    <p class="message">\${overallResults.message}</p>
                </div>
            \`;
        }
        
        return { subjectScores, overallResults };
    }
}

// 전역 인스턴스
window.PredictedScoreCalculator = new PredictedScoreCalculator();

// 통계 업데이트 시 자동 재계산
document.addEventListener('statisticsUpdated', () => {
    window.PredictedScoreCalculator.displayResults();
});
        `;
    }

    /**
     * 🚀 Step 4: 오답 횟수별 분석 (120줄)
     * 조대표 요구사항: "한번에 맞춘 문제, 한번틀린 문제, 두번틀린 문제..."
     */
    implementIncorrectAnalysis() {
        return `
// === 파일: static/js/incorrect_analysis.js (120줄) ===

class IncorrectAnalysisManager {
    constructor() {
        this.maxAttempts = 5; // 최대 5번까지 추적
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
        
        // 통계 업데이트
        this.updateIncorrectStatistics();
        
        return attempts[questionId];
    }
    
    /**
     * 오답 횟수별 통계 계산
     */
    calculateIncorrectStatistics() {
        const attempts = JSON.parse(localStorage.getItem('aicu_question_attempts') || '{}');
        const stats = {
            overall: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, // 0=한번에 맞춤, 1=한번틀림, ...
            by_category: {}
        };
        
        Object.values(attempts).forEach(questionData => {
            const category = questionData.category === '기본학습' ? 'overall' : questionData.category;
            
            if (!stats.by_category[category]) {
                stats.by_category[category] = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            }
            
            if (questionData.correct_attempt > 0) {
                // 정답을 맞춘 경우
                const incorrectCount = questionData.correct_attempt - 1;
                const statKey = Math.min(incorrectCount, this.maxAttempts);
                
                stats.overall[statKey] += 1;
                if (category !== 'overall') {
                    stats.by_category[category][statKey] += 1;
                }
            } else if (questionData.attempt_count >= this.maxAttempts) {
                // 5번 이상 틀린 경우
                stats.overall[this.maxAttempts] += 1;
                if (category !== 'overall') {
                    stats.by_category[category][this.maxAttempts] += 1;
                }
            }
        });
        
        return stats;
    }
    
    /**
     * 통계 업데이트 및 저장
     */
    updateIncorrectStatistics() {
        const stats = this.calculateIncorrectStatistics();
        localStorage.setItem('aicu_incorrect_statistics', JSON.stringify(stats));
        
        // 화면 업데이트 이벤트 발생
        document.dispatchEvent(new CustomEvent('incorrectStatsUpdated', { detail: stats }));
        
        return stats;
    }
    
    /**
     * 화면에 오답 분석 표시
     */
    displayAnalysis() {
        const stats = this.calculateIncorrectStatistics();
        const totalQuestions = Object.values(stats.overall).reduce((sum, count) => sum + count, 0);
        
        if (totalQuestions === 0) {
            return { message: '아직 분석할 데이터가 없습니다.' };
        }
        
        const analysisElement = document.getElementById('incorrect-analysis');
        if (analysisElement) {
            analysisElement.innerHTML = \`
                <div class="incorrect-analysis">
                    <h3>🔍 오답 횟수별 분석</h3>
                    <div class="overall-stats">
                        <h4>전체 현황 (총 \${totalQuestions}문제)</h4>
                        \${[0, 1, 2, 3, 4, 5].map(count => {
                            const questionCount = stats.overall[count];
                            const percentage = totalQuestions > 0 ? Math.round((questionCount / totalQuestions) * 100) : 0;
                            const label = count === 0 ? '한번에 맞춘 문제' : 
                                         count === 5 ? '다섯번 이상 틀린 문제' : 
                                         \`\${count}번 틀린 문제\`;
                            return \`
                                <div class="stat-item attempt-\${count}">
                                    <span class="label">\${label}</span>
                                    <span class="count">\${questionCount}개 (\${percentage}%)</span>
                                </div>
                            \`;
                        }).join('')}
                    </div>
                    <div class="category-stats">
                        <h4>과목별 현황</h4>
                        \${Object.keys(stats.by_category).map(category => {
                            const categoryStats = stats.by_category[category];
                            const categoryTotal = Object.values(categoryStats).reduce((sum, count) => sum + count, 0);
                            if (categoryTotal === 0) return '';
                            
                            return \`
                                <div class="category-item">
                                    <h5>\${category}</h5>
                                    \${[0, 1, 2].map(count => {
                                        const questionCount = categoryStats[count];
                                        const percentage = categoryTotal > 0 ? Math.round((questionCount / categoryTotal) * 100) : 0;
                                        const label = count === 0 ? '한번에 맞춤' : \`\${count}번 틀림\`;
                                        return \`<span>\${label}: \${questionCount}개(\${percentage}%)</span>\`;
                                    }).join(' | ')}
                                </div>
                            \`;
                        }).join('')}
                    </div>
                </div>
            \`;
        }
        
        return stats;
    }
    
    init() {
        // 기존 데이터가 없으면 초기화
        if (!localStorage.getItem('aicu_question_attempts')) {
            localStorage.setItem('aicu_question_attempts', JSON.stringify({}));
        }
        
        // 주기적으로 통계 업데이트
        document.addEventListener('questionAnswered', (event) => {
            const { questionId, isCorrect, category } = event.detail;
            this.trackQuestionAttempts(questionId, isCorrect, category);
        });
    }
}

// 전역 인스턴스
window.IncorrectAnalysisManager = new IncorrectAnalysisManager();
        `;
    }

    /**
     * 📋 통합 실행 계획
     */
    getImplementationPlan() {
        return {
            // === 1주차: 게스트 모드 + D-day ===
            week1: {
                files: [
                    'static/js/guest_mode_defaults.js (100줄)',
                    'static/js/dday_counter.js (80줄)',
                    'templates/home.html (20줄 수정)'
                ],
                total_lines: 200,
                description: '즉시 사용자 경험 개선',
                priority: 'HIGH'
            },

            // === 2주차: 예상 점수 계산 ===
            week2: {
                files: [
                    'static/js/predicted_scores.js (150줄)',
                    'templates/home.html (30줄 추가)',
                    'static/css/predicted_scores.css (50줄)'
                ],
                total_lines: 230,
                description: '조대표님 핵심 요구사항 구현',
                priority: 'HIGH'
            },

            // === 3주차: 오답 분석 ===
            week3: {
                files: [
                    'static/js/incorrect_analysis.js (120줄)',
                    'templates/statistics.html (40줄 추가)',
                    'static/css/incorrect_analysis.css (40줄)'
                ],
                total_lines: 200,
                description: '고급 학습 분석 기능',
                priority: 'MEDIUM'
            },

            // === 전체 요약 ===
            total: {
                new_files: 6,
                modified_files: 3,
                total_lines: 630,
                compliance: 'LEGO_BLOCK_COMPLIANT', // 각 단계 200-250줄 이하
                risk_level: 'LOW'
            }
        };
    }

    /**
     * 🎯 기존 시스템 연동 방법
     */
    getIntegrationGuide() {
        return `
// === 기존 시스템 연동 가이드 ===

// 1. basic_learning_main.js에 추가 (5줄)
function updateStatistics(question, userAnswer, isCorrect) {
    // 기존 로직 유지
    // ...existing code...
    
    // Week3 기능 연동
    document.dispatchEvent(new CustomEvent('questionAnswered', {
        detail: { questionId: question.qcode, isCorrect, category: '기본학습' }
    }));
}

// 2. home.html에 추가 (HTML 영역)
<div id="dday-counter"></div>
<div id="predicted-scores"></div>
<div id="incorrect-analysis"></div>

// 3. 스크립트 로드 추가
<script src="/static/js/guest_mode_defaults.js"></script>
<script src="/static/js/dday_counter.js"></script>
<script src="/static/js/predicted_scores.js"></script>
<script src="/static/js/incorrect_analysis.js"></script>
        `;
    }
}

// ===================================================================
// 실행 계획 요약
// ===================================================================

/**
 * 📊 Week3 통계고도화 최종 계획
 * 
 * 🎯 목표: 101번 요구사항 중 미구현 기능 완성
 * 📋 방법: 레고블록 원칙 준수 (각 주차 200-250줄 이하)
 * 🔧 전략: 기존 85% 완성도 위에 추가 기능만 개발
 * 
 * ✅ 1주차 (180줄): 게스트 모드 + D-day 카운터
 * ✅ 2주차 (230줄): 과목별 예상 점수 + 합격률
 * ✅ 3주차 (200줄): 오답 횟수별 분석
 * 
 * 📈 예상 결과: 101번 요구사항 90% 달성
 * 🛡️ 위험도: 낮음 (기존 시스템 무간섭)
 * 🔄 확장성: 높음 (모듈별 독립 구현)
 */

console.log('📊 Week3 통계고도화 현실적 계획 로드 완료');
console.log('🎯 목표: 미구현 기능 완성 (게스트모드, D-day, 예상점수, 오답분석)');
console.log('📋 방법: 레고블록 원칙 준수 + 기존 시스템 연동');
console.log('⏰ 일정: 3주 완성 (주차별 200-250줄)');

// 전역 접근을 위한 인스턴스 생성
window.Week3StatisticsUpgrade = new Week3StatisticsUpgrade();

// ===================================================================
// 실제 구현 순서 및 파일 생성 가이드
// ===================================================================

/**
 * 🗓️ 상세 구현 일정
 */
const IMPLEMENTATION_SCHEDULE = {
    // === 1주차: 기본 사용자 경험 개선 ===
    week1: {
        day1: {
            task: 'guest_mode_defaults.js 생성',
            lines: 100,
            files: ['static/js/guest_mode_defaults.js'],
            description: '게스트 모드 자동 설정',
            test: 'app.py 실행하여 자동 게스트 설정 확인'
        },
        day2: {
            task: 'dday_counter.js 생성',
            lines: 80,
            files: ['static/js/dday_counter.js'],
            description: 'D-day 카운터 구현',
            test: '대문에서 D-30 형태 표시 확인'
        },
        day3: {
            task: 'home.html 수정',
            lines: 20,
            files: ['templates/home.html'],
            description: 'UI 요소 추가',
            test: 'D-day와 사용자 정보 화면 표시 확인'
        },
        total_lines: 200,
        deliverable: '게스트 모드 + D-day 완전 작동'
    },

    // === 2주차: 핵심 예상 점수 기능 ===
    week2: {
        day1: {
            task: 'predicted_scores.js 생성',
            lines: 150,
            files: ['static/js/predicted_scores.js'],
            description: '과목별 점수 계산 로직',
            test: '콘솔에서 점수 계산 결과 확인'
        },
        day2: {
            task: 'CSS 스타일링',
            lines: 50,
            files: ['static/css/predicted_scores.css'],
            description: '예상 점수 화면 디자인',
            test: '대문에서 예상 점수 카드 표시'
        },
        day3: {
            task: 'home.html 연동',
            lines: 30,
            files: ['templates/home.html'],
            description: '예상 점수 표시 영역 추가',
            test: '실제 학습 후 점수 변화 확인'
        },
        total_lines: 230,
        deliverable: '과목별 예상점수 + 합격확률 표시'
    },

    // === 3주차: 고급 분석 기능 ===
    week3: {
        day1: {
            task: 'incorrect_analysis.js 생성',
            lines: 120,
            files: ['static/js/incorrect_analysis.js'],
            description: '오답 횟수별 분석 로직',
            test: '문제별 시도 횟수 추적 확인'
        },
        day2: {
            task: '분석 화면 구현',
            lines: 40,
            files: ['templates/statistics.html'],
            description: '오답 분석 표시 페이지',
            test: '통계 페이지에서 분석 결과 확인'
        },
        day3: {
            task: 'CSS + 최종 연동',
            lines: 40,
            files: ['static/css/incorrect_analysis.css'],
            description: '스타일링 및 전체 연동',
            test: '모든 기능 통합 테스트'
        },
        total_lines: 200,
        deliverable: '1-5번 틀린 문제 완전 분석'
    }
};

/**
 * 📁 생성할 파일 목록 및 내용
 */
const FILE_SPECIFICATIONS = {
    // === 신규 생성 파일 ===
    new_files: {
        'static/js/guest_mode_defaults.js': {
            purpose: '게스트 모드 자동 설정',
            size: '100줄',
            dependencies: ['localStorage'],
            exports: ['GuestModeManager']
        },
        'static/js/dday_counter.js': {
            purpose: 'D-day 카운터 표시',
            size: '80줄',
            dependencies: ['Date'],
            exports: ['DDayCounter']
        },
        'static/js/predicted_scores.js': {
            purpose: '과목별 예상 점수 계산',
            size: '150줄',
            dependencies: ['aicu_category_statistics'],
            exports: ['PredictedScoreCalculator']
        },
        'static/js/incorrect_analysis.js': {
            purpose: '오답 횟수별 분석',
            size: '120줄',
            dependencies: ['aicu_question_attempts'],
            exports: ['IncorrectAnalysisManager']
        },
        'static/css/predicted_scores.css': {
            purpose: '예상 점수 스타일링',
            size: '50줄',
            dependencies: [],
            exports: []
        },
        'static/css/incorrect_analysis.css': {
            purpose: '오답 분석 스타일링',
            size: '40줄',
            dependencies: [],
            exports: []
        }
    },

    // === 수정할 기존 파일 ===
    modified_files: {
        'templates/home.html': {
            changes: [
                '스크립트 로드 태그 4개 추가 (10줄)',
                'D-day 표시 영역 추가 (10줄)',
                '예상 점수 카드 영역 추가 (20줄)',
                '사용자 정보 영역 수정 (10줄)'
            ],
            total_additions: 50
        },
        'templates/statistics.html': {
            changes: [
                '오답 분석 표시 영역 추가 (30줄)',
                '스크립트 로드 태그 추가 (10줄)'
            ],
            total_additions: 40
        },
        'static/js/basic_learning_main.js': {
            changes: [
                'questionAnswered 이벤트 발생 추가 (5줄)'
            ],
            total_additions: 5
        }
    }
};

/**
 * 🧪 테스트 시나리오
 */
const TEST_SCENARIOS = {
    week1_test: {
        name: '게스트 모드 + D-day 테스트',
        steps: [
            '1. localStorage 초기화',
            '2. 앱 실행',
            '3. 자동으로 게스트 정보 설정 확인',
            '4. 대문에서 D-day 표시 확인',
            '5. 사용자 정보에 "게스트" 표시 확인'
        ],
        expected: 'D-30 형태로 표시, 게스트 자동 설정'
    },

    week2_test: {
        name: '예상 점수 계산 테스트',
        steps: [
            '1. 기본학습에서 10문제 풀이 (8문제 정답)',
            '2. 대분류에서 손해보험 5문제 풀이 (4문제 정답)',
            '3. 대문에서 예상 점수 확인',
            '4. 손해보험 80점, 전체 평균 계산 확인',
            '5. 합격 확률 표시 확인'
        ],
        expected: '손해보험 80점, 합격확률 계산 표시'
    },

    week3_test: {
        name: '오답 분석 테스트',
        steps: [
            '1. 같은 문제를 여러 번 틀리기',
            '2. 다른 문제는 한 번에 맞추기',
            '3. 통계 페이지에서 분석 결과 확인',
            '4. "한번에 맞춘 문제: X개(X%)" 표시 확인',
            '5. "한번 틀린 문제: X개(X%)" 표시 확인'
        ],
        expected: '오답 횟수별 정확한 분류 및 퍼센트 표시'
    }
};

/**
 * 🔧 통합 연동 가이드
 */
const INTEGRATION_GUIDE = {
    step1: '모든 새 파일을 해당 디렉토리에 생성',
    step2: 'home.html에 스크립트 태그 및 표시 영역 추가',
    step3: 'basic_learning_main.js에 이벤트 발생 코드 추가',
    step4: 'CSS 파일들을 HTML에서 로드',
    step5: '각 주차별로 단계적 테스트 실행',

    // 기존 시스템과의 호환성
    compatibility: {
        localStorage_keys: [
            'aicu_user_data (기존 사용)',
            'aicu_statistics (기존 사용)',
            'aicu_category_statistics (기존 사용)',
            'aicu_question_attempts (신규 추가)',
            'aicu_incorrect_statistics (신규 추가)'
        ],
        existing_functions: [
            'updateStatistics() - 이벤트 발생 추가',
            'loadAndDisplayStatistics() - 연동 유지',
            'displayRegistrationBasedStatistics() - 연동 유지'
        ],
        no_conflicts: '기존 로직 변경 없음, 추가 기능만 구현'
    }
};

/**
 * 📈 예상 효과
 */
const EXPECTED_OUTCOMES = {
    // 101번 요구사항 달성도
    requirement_completion: {
        '게스트 모드 기본값': '100% 완성',
        'D-day 카운터': '100% 완성',
        '과목별 예상 점수': '100% 완성',
        '전체 평균 점수': '100% 완성',
        '합격 확률': '100% 완성',
        '오답 횟수별 분석': '100% 완성',
        '일별/누적 통계 분리': '기존 85% → 100% 완성'
    },

    // 사용자 경험 개선
    user_experience: {
        '즉시 시작 가능': '게스트 모드로 진입 장벽 제거',
        '목표 의식': 'D-day로 시간 인식 향상',
        '학습 동기': '예상 점수로 성취감 제공',
        '취약점 파악': '오답 분석으로 집중 학습 가능'
    },

    // 기술적 성과
    technical_achievement: {
        '레고블록 준수': '각 주차 200-250줄 이하',
        '기존 시스템 보호': '무간섭 추가 개발',
        '확장성': '모듈별 독립적 기능',
        '유지보수성': '명확한 책임 분리'
    }
};

console.log('🎯 Week3 통계고도화 상세 계획 완성');
console.log('📋 총 6개 신규 파일 + 3개 기존 파일 수정');
console.log('⏰ 3주 완성 일정 (630줄 총 코드)');
console.log('✅ 101번 요구사항 90% 이상 달성 예상');

export { IMPLEMENTATION_SCHEDULE, FILE_SPECIFICATIONS, TEST_SCENARIOS, INTEGRATION_GUIDE, EXPECTED_OUTCOMES };