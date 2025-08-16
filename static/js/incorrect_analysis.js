// 오답 횟수별 분석 및 개인 맞춤 인사이트 시스템
// 파일: static/js/incorrect_analysis.js

class IncorrectAnalysisManager {
    constructor() {
        this.attemptThresholds = {
            critical: 5,    // 5번 이상 틀린 문제 (매우 위험)
            high: 3,        // 3-4번 틀린 문제 (높은 위험)
            medium: 2,      // 2번 틀린 문제 (보통 위험)
            low: 1          // 1번 틀린 문제 (낮은 위험)
        };
        
        this.insightCategories = {
            'weak_subjects': '약점 과목',
            'frequent_mistakes': '자주 틀리는 유형',
            'improvement_areas': '개선 영역',
            'study_recommendations': '학습 권장사항'
        };
        
        this.init();
    }
    
    // 오답 데이터 구조 초기화
    initializeIncorrectData() {
        const incorrectData = {
            question_attempts: {},      // 문제별 시도 횟수
            incorrect_patterns: {},     // 오답 패턴
            subject_weaknesses: {},     // 과목별 약점
            daily_incorrect: {},        // 일별 오답 통계
            last_updated: new Date().toISOString()
        };
        
        localStorage.setItem('aicu_incorrect_statistics', JSON.stringify(incorrectData));
        return incorrectData;
    }
    
    // 문제별 오답 기록
    recordIncorrectAnswer(questionId, category, userAnswer, correctAnswer) {
        const incorrectData = JSON.parse(localStorage.getItem('aicu_incorrect_statistics') || '{}');
        
        if (!incorrectData.question_attempts) {
            incorrectData.question_attempts = {};
        }
        
        // 문제별 시도 횟수 업데이트
        if (!incorrectData.question_attempts[questionId]) {
            incorrectData.question_attempts[questionId] = {
                attempts: 0,
                incorrect: 0,
                last_attempt: null,
                category: category,
                user_answers: [],
                correct_answer: correctAnswer
            };
        }
        
        const questionData = incorrectData.question_attempts[questionId];
        questionData.attempts++;
        questionData.incorrect++;
        questionData.last_attempt = new Date().toISOString();
        questionData.user_answers.push({
            answer: userAnswer,
            timestamp: new Date().toISOString()
        });
        
        // 과목별 약점 업데이트
        if (!incorrectData.subject_weaknesses[category]) {
            incorrectData.subject_weaknesses[category] = {
                total_incorrect: 0,
                questions: []
            };
        }
        
        if (!incorrectData.subject_weaknesses[category].questions.includes(questionId)) {
            incorrectData.subject_weaknesses[category].questions.push(questionId);
            incorrectData.subject_weaknesses[category].total_incorrect++;
        }
        
        // 일별 오답 통계 업데이트
        const today = new Date().toISOString().split('T')[0];
        if (!incorrectData.daily_incorrect[today]) {
            incorrectData.daily_incorrect[today] = {
                total_incorrect: 0,
                by_category: {}
            };
        }
        
        incorrectData.daily_incorrect[today].total_incorrect++;
        if (!incorrectData.daily_incorrect[today].by_category[category]) {
            incorrectData.daily_incorrect[today].by_category[category] = 0;
        }
        incorrectData.daily_incorrect[today].by_category[category]++;
        
        incorrectData.last_updated = new Date().toISOString();
        localStorage.setItem('aicu_incorrect_statistics', JSON.stringify(incorrectData));
        
        return questionData;
    }
    
    // 오답 분석 결과 생성
    generateIncorrectAnalysis() {
        const incorrectData = JSON.parse(localStorage.getItem('aicu_incorrect_statistics') || '{}');
        
        if (!incorrectData.question_attempts) {
            return this.getEmptyAnalysis();
        }
        
        const analysis = {
            summary: this.generateSummary(incorrectData),
            critical_questions: this.getCriticalQuestions(incorrectData),
            subject_analysis: this.analyzeSubjects(incorrectData),
            patterns: this.analyzePatterns(incorrectData),
            insights: this.generateInsights(incorrectData),
            recommendations: this.generateRecommendations(incorrectData)
        };
        
        return analysis;
    }
    
    // 전체 요약 생성
    generateSummary(incorrectData) {
        const questions = Object.values(incorrectData.question_attempts || {});
        const totalQuestions = questions.length;
        const totalIncorrect = questions.reduce((sum, q) => sum + q.incorrect, 0);
        const totalAttempts = questions.reduce((sum, q) => sum + q.attempts, 0);
        
        const criticalCount = questions.filter(q => q.incorrect >= this.attemptThresholds.critical).length;
        const highCount = questions.filter(q => q.incorrect >= this.attemptThresholds.high && q.incorrect < this.attemptThresholds.critical).length;
        const mediumCount = questions.filter(q => q.incorrect >= this.attemptThresholds.medium && q.incorrect < this.attemptThresholds.high).length;
        const lowCount = questions.filter(q => q.incorrect >= this.attemptThresholds.low && q.incorrect < this.attemptThresholds.medium).length;
        
        return {
            total_questions: totalQuestions,
            total_incorrect: totalIncorrect,
            total_attempts: totalAttempts,
            average_attempts: totalQuestions > 0 ? (totalAttempts / totalQuestions).toFixed(1) : 0,
            critical_count: criticalCount,
            high_count: highCount,
            medium_count: mediumCount,
            low_count: lowCount
        };
    }
    
    // 위험도별 문제 분류
    getCriticalQuestions(incorrectData) {
        const questions = Object.entries(incorrectData.question_attempts || {});
        
        return {
            critical: questions.filter(([id, q]) => q.incorrect >= this.attemptThresholds.critical)
                .map(([id, q]) => ({ id, ...q, risk_level: 'critical' })),
            high: questions.filter(([id, q]) => q.incorrect >= this.attemptThresholds.high && q.incorrect < this.attemptThresholds.critical)
                .map(([id, q]) => ({ id, ...q, risk_level: 'high' })),
            medium: questions.filter(([id, q]) => q.incorrect >= this.attemptThresholds.medium && q.incorrect < this.attemptThresholds.high)
                .map(([id, q]) => ({ id, ...q, risk_level: 'medium' })),
            low: questions.filter(([id, q]) => q.incorrect >= this.attemptThresholds.low && q.incorrect < this.attemptThresholds.medium)
                .map(([id, q]) => ({ id, ...q, risk_level: 'low' }))
        };
    }
    
    // 과목별 분석
    analyzeSubjects(incorrectData) {
        const subjectWeaknesses = incorrectData.subject_weaknesses || {};
        const analysis = {};
        
        Object.entries(subjectWeaknesses).forEach(([subject, data]) => {
            const questions = data.questions.map(id => incorrectData.question_attempts[id]);
            const totalIncorrect = questions.reduce((sum, q) => sum + q.incorrect, 0);
            const averageAttempts = questions.length > 0 ? (totalIncorrect / questions.length).toFixed(1) : 0;
            
            analysis[subject] = {
                total_questions: data.questions.length,
                total_incorrect: data.total_incorrect,
                average_attempts: averageAttempts,
                critical_count: questions.filter(q => q.incorrect >= this.attemptThresholds.critical).length,
                high_count: questions.filter(q => q.incorrect >= this.attemptThresholds.high && q.incorrect < this.attemptThresholds.critical).length
            };
        });
        
        return analysis;
    }
    
    // 패턴 분석
    analyzePatterns(incorrectData) {
        const questions = Object.values(incorrectData.question_attempts || {});
        
        // 가장 자주 틀리는 문제
        const mostIncorrect = questions
            .sort((a, b) => b.incorrect - a.incorrect)
            .slice(0, 5);
        
        // 최근 틀린 문제
        const recentIncorrect = questions
            .filter(q => q.last_attempt)
            .sort((a, b) => new Date(b.last_attempt) - new Date(a.last_attempt))
            .slice(0, 5);
        
        return {
            most_incorrect: mostIncorrect,
            recent_incorrect: recentIncorrect
        };
    }
    
    // 개인 맞춤 인사이트 생성
    generateInsights(incorrectData) {
        const insights = [];
        const summary = this.generateSummary(incorrectData);
        const subjectAnalysis = this.analyzeSubjects(incorrectData);
        
        // 전체적인 학습 상태 인사이트
        if (summary.critical_count > 0) {
            insights.push({
                type: 'warning',
                title: '매우 위험한 문제 발견',
                message: `${summary.critical_count}개의 문제를 5번 이상 틀렸습니다. 이 문제들을 집중적으로 복습해야 합니다.`,
                priority: 'high'
            });
        }
        
        if (summary.high_count > 0) {
            insights.push({
                type: 'caution',
                title: '주의가 필요한 문제',
                message: `${summary.high_count}개의 문제를 3-4번 틀렸습니다. 추가 학습이 필요합니다.`,
                priority: 'medium'
            });
        }
        
        // 과목별 인사이트
        Object.entries(subjectAnalysis).forEach(([subject, analysis]) => {
            if (analysis.critical_count > 0) {
                insights.push({
                    type: 'subject_warning',
                    title: `${this.getSubjectDisplayName(subject)} 약점 발견`,
                    message: `${analysis.critical_count}개의 문제가 매우 위험한 상태입니다.`,
                    subject: subject,
                    priority: 'high'
                });
            }
        });
        
        return insights;
    }
    
    // 학습 권장사항 생성
    generateRecommendations(incorrectData) {
        const recommendations = [];
        const summary = this.generateSummary(incorrectData);
        const criticalQuestions = this.getCriticalQuestions(incorrectData);
        
        // 우선순위별 학습 권장사항
        if (criticalQuestions.critical.length > 0) {
            recommendations.push({
                type: 'priority_1',
                title: '최우선 복습 대상',
                description: '5번 이상 틀린 문제들을 집중적으로 복습하세요.',
                count: criticalQuestions.critical.length,
                action: 'critical_review'
            });
        }
        
        if (criticalQuestions.high.length > 0) {
            recommendations.push({
                type: 'priority_2',
                title: '고우선 복습 대상',
                description: '3-4번 틀린 문제들을 체계적으로 학습하세요.',
                count: criticalQuestions.high.length,
                action: 'high_review'
            });
        }
        
        // 학습 방법 권장사항
        if (summary.average_attempts > 2) {
            recommendations.push({
                type: 'study_method',
                title: '학습 방법 개선',
                description: '평균 시도 횟수가 높습니다. 문제를 더 꼼꼼히 읽고 이해하는 습관을 기르세요.',
                action: 'improve_reading'
            });
        }
        
        return recommendations;
    }
    
    // 과목 표시명 변환
    getSubjectDisplayName(subjectKey) {
        const subjectNames = {
            '06재산보험': '재산보험',
            '07특종보험': '특종보험',
            '08배상책임보험': '배상책임보험',
            '09해상보험': '해상보험'
        };
        return subjectNames[subjectKey] || subjectKey;
    }
    
    // 빈 분석 결과 반환
    getEmptyAnalysis() {
        return {
            summary: {
                total_questions: 0,
                total_incorrect: 0,
                total_attempts: 0,
                average_attempts: 0,
                critical_count: 0,
                high_count: 0,
                medium_count: 0,
                low_count: 0
            },
            critical_questions: { critical: [], high: [], medium: [], low: [] },
            subject_analysis: {},
            patterns: { most_incorrect: [], recent_incorrect: [] },
            insights: [],
            recommendations: []
        };
    }
    
    // UI 업데이트
    updateDisplay() {
        console.log('=== IncorrectAnalysisManager UI 업데이트 ===');
        
        try {
            // 새로운 중앙 데이터 관리 시스템에서 데이터 조회
            const stats = this.getStatisticsData();
            const incorrectData = this.getIncorrectData();
            
            console.log('통계 데이터:', stats);
            console.log('오답 데이터:', incorrectData);
            
            // 오답 분석 생성
            const analysis = this.generateIncorrectAnalysisFromData(stats, incorrectData);
        
        // 요약 정보 업데이트
        this.updateSummary(analysis.summary);
        
        // 위험도별 문제 목록 업데이트
        this.updateCriticalQuestions(analysis.critical_questions);
        
        // 과목별 분석 업데이트
        this.updateSubjectAnalysis(analysis.subject_analysis);
        
        // 인사이트 업데이트
        this.updateInsights(analysis.insights);
        
        // 권장사항 업데이트
        this.updateRecommendations(analysis.recommendations);
        
            console.log('✅ IncorrectAnalysisManager UI 업데이트 완료');
        return analysis;
            
        } catch (error) {
            console.error('❌ IncorrectAnalysisManager UI 업데이트 실패:', error);
        }
    }
    
    // 요약 정보 업데이트
    updateSummary(summary) {
        const summaryContainer = document.getElementById('incorrect-summary-container');
        if (!summaryContainer) return;
        
        const html = `
            <div class="incorrect-summary bg-white rounded-lg shadow-lg p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4">📊 오답 분석 요약</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-blue-600">${summary.total_questions}</div>
                        <div class="text-sm text-gray-600">총 오답 문제</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-red-600">${summary.critical_count}</div>
                        <div class="text-sm text-gray-600">매우 위험</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-orange-600">${summary.high_count}</div>
                        <div class="text-sm text-gray-600">높은 위험</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-gray-600">${summary.average_attempts}</div>
                        <div class="text-sm text-gray-600">평균 시도</div>
                    </div>
                </div>
            </div>
        `;
        
        summaryContainer.innerHTML = html;
    }
    
    // 위험도별 문제 목록 업데이트
    updateCriticalQuestions(criticalQuestions) {
        const container = document.getElementById('critical-questions-container');
        if (!container) return;
        
        let html = '<div class="critical-questions bg-white rounded-lg shadow-lg p-6">';
        html += '<h3 class="text-xl font-bold text-gray-800 mb-4">⚠️ 위험도별 문제 목록</h3>';
        
        Object.entries(criticalQuestions).forEach(([level, questions]) => {
            if (questions.length > 0) {
                const levelNames = {
                    critical: '매우 위험 (5번 이상)',
                    high: '높은 위험 (3-4번)',
                    medium: '보통 위험 (2번)',
                    low: '낮은 위험 (1번)'
                };
                
                const levelColors = {
                    critical: 'text-red-600',
                    high: 'text-orange-600',
                    medium: 'text-yellow-600',
                    low: 'text-green-600'
                };
                
                html += `
                    <div class="mb-4">
                        <h4 class="font-semibold ${levelColors[level]} mb-2">${levelNames[level]} (${questions.length}개)</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                            ${questions.slice(0, 4).map(q => `
                                <div class="bg-gray-50 p-2 rounded text-sm">
                                    <div class="font-medium">문제 ${q.id}</div>
                                    <div class="text-gray-600">${this.getSubjectDisplayName(q.category)} - ${q.incorrect}번 틀림</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        });
        
        html += '</div>';
        container.innerHTML = html;
    }
    
    // 과목별 분석 업데이트
    updateSubjectAnalysis(subjectAnalysis) {
        const container = document.getElementById('subject-analysis-container');
        if (!container) return;
        
        let html = '<div class="subject-analysis bg-white rounded-lg shadow-lg p-6">';
        html += '<h3 class="text-xl font-bold text-gray-800 mb-4">📚 과목별 분석</h3>';
        
        if (Object.keys(subjectAnalysis).length === 0) {
            html += '<p class="text-gray-500">아직 오답 데이터가 없습니다.</p>';
        } else {
            Object.entries(subjectAnalysis).forEach(([subject, analysis]) => {
                html += `
                    <div class="mb-4 p-3 bg-gray-50 rounded">
                        <h4 class="font-semibold text-gray-800">${this.getSubjectDisplayName(subject)}</h4>
                        <div class="grid grid-cols-3 gap-2 text-sm">
                            <div>오답 문제: ${analysis.total_questions}개</div>
                            <div>매우 위험: ${analysis.critical_count}개</div>
                            <div>평균 시도: ${analysis.average_attempts}회</div>
                        </div>
                    </div>
                `;
            });
        }
        
        html += '</div>';
        container.innerHTML = html;
    }
    
    // 인사이트 업데이트
    updateInsights(insights) {
        const container = document.getElementById('insights-container');
        if (!container) return;
        
        let html = '<div class="insights bg-white rounded-lg shadow-lg p-6">';
        html += '<h3 class="text-xl font-bold text-gray-800 mb-4">💡 개인 맞춤 인사이트</h3>';
        
        if (insights.length === 0) {
            html += '<p class="text-gray-500">아직 충분한 데이터가 없습니다. 더 많은 문제를 풀어보세요.</p>';
        } else {
            insights.forEach(insight => {
                const typeColors = {
                    warning: 'border-red-500 bg-red-50',
                    caution: 'border-orange-500 bg-orange-50',
                    subject_warning: 'border-yellow-500 bg-yellow-50'
                };
                
                html += `
                    <div class="mb-3 p-3 border-l-4 ${typeColors[insight.type] || 'border-gray-500 bg-gray-50'}">
                        <div class="font-semibold text-gray-800">${insight.title}</div>
                        <div class="text-sm text-gray-600">${insight.message}</div>
                    </div>
                `;
            });
        }
        
        html += '</div>';
        container.innerHTML = html;
    }
    
    // 권장사항 업데이트
    updateRecommendations(recommendations) {
        const container = document.getElementById('recommendations-container');
        if (!container) return;
        
        let html = '<div class="recommendations bg-white rounded-lg shadow-lg p-6">';
        html += '<h3 class="text-xl font-bold text-gray-800 mb-4">🎯 학습 권장사항</h3>';
        
        if (recommendations.length === 0) {
            html += '<p class="text-gray-500">현재 특별한 권장사항이 없습니다.</p>';
        } else {
            recommendations.forEach(rec => {
                const typeColors = {
                    priority_1: 'border-red-500 bg-red-50',
                    priority_2: 'border-orange-500 bg-orange-50',
                    study_method: 'border-blue-500 bg-blue-50'
                };
                
                html += `
                    <div class="mb-3 p-3 border-l-4 ${typeColors[rec.type] || 'border-gray-500 bg-gray-50'}">
                        <div class="font-semibold text-gray-800">${rec.title}</div>
                        <div class="text-sm text-gray-600">${rec.description}</div>
                        ${rec.count ? `<div class="text-xs text-gray-500 mt-1">대상: ${rec.count}개</div>` : ''}
                    </div>
                `;
            });
        }
        
        html += '</div>';
        container.innerHTML = html;
    }
    
    /**
     * 통계 데이터 조회 (새로운 중앙 데이터 관리 시스템 사용)
     */
    getStatisticsData() {
        console.log('=== 통계 데이터 조회 (새로운 시스템) ===');
        
        try {
            // 새로운 중앙 데이터 관리 시스템에서 데이터 조회
            if (window.CentralDataManager && typeof window.CentralDataManager.getAllCategoryData === 'function') {
                const categoryData = window.CentralDataManager.getAllCategoryData();
                console.log('✅ 새로운 중앙 데이터 관리 시스템에서 데이터 조회 성공:', categoryData);
                
                // 새로운 데이터 구조를 기존 형식으로 변환
                const convertedData = this.convertNewDataToOldFormat(categoryData);
                console.log('✅ 데이터 변환 완료:', convertedData);
                
                return convertedData;
            }
            
            // 기존 방식으로 폴백
            const stats = JSON.parse(localStorage.getItem('aicu_statistics') || '{}');
            console.log('⚠️ 기존 방식으로 폴백:', stats);
            return stats;
            
        } catch (error) {
            console.error('❌ 통계 데이터 조회 실패:', error);
            return {};
        }
    }

    /**
     * 새로운 데이터 구조를 기존 형식으로 변환
     */
    convertNewDataToOldFormat(categoryData) {
        console.log('=== 새로운 데이터 구조 변환 ===');
        
        let totalSolved = 0;
        let totalCorrect = 0;
        let totalIncorrect = 0;
        
        // 카테고리별 데이터 집계
        Object.keys(categoryData).forEach(category => {
            const data = categoryData[category];
            
            if (data.total !== undefined && data.correct !== undefined) {
                totalSolved += data.total;
                totalCorrect += data.correct;
                totalIncorrect += (data.total - data.correct);
            }
        });
        
        const convertedData = {
            total_problems: 789, // 전체 문제 수
            solved_problems: totalSolved,
            correct_answers: totalCorrect,
            incorrect_answers: totalIncorrect,
            accuracy_rate: totalSolved > 0 ? (totalCorrect / totalSolved) * 100 : 0,
            categories: categoryData
        };
        
        console.log('✅ 데이터 변환 결과:', convertedData);
        return convertedData;
    }

    /**
     * 오답 데이터 조회 (새로운 중앙 데이터 관리 시스템 사용)
     */
    getIncorrectData() {
        console.log('=== 오답 데이터 조회 (새로운 시스템) ===');
        
        try {
            // 새로운 중앙 데이터 관리 시스템에서 오답 데이터 조회
            if (window.CentralDataManager && typeof window.CentralDataManager.getQuizResults === 'function') {
                const quizResults = window.CentralDataManager.getQuizResults();
                console.log('✅ 새로운 중앙 데이터 관리 시스템에서 오답 데이터 조회 성공:', quizResults);
                
                // 퀴즈 결과를 오답 분석 형식으로 변환
                const incorrectData = this.convertQuizResultsToIncorrectFormat(quizResults);
                console.log('✅ 오답 데이터 변환 완료:', incorrectData);
                
                return incorrectData;
            }
            
            // 기존 방식으로 폴백
            const incorrectStats = JSON.parse(localStorage.getItem('aicu_incorrect_statistics') || '{}');
            console.log('⚠️ 기존 방식으로 폴백:', incorrectStats);
            return incorrectStats;
            
        } catch (error) {
            console.error('❌ 오답 데이터 조회 실패:', error);
            return {};
        }
    }

    /**
     * 퀴즈 결과를 오답 분석 형식으로 변환
     */
    convertQuizResultsToIncorrectFormat(quizResults) {
        console.log('=== 퀴즈 결과를 오답 분석 형식으로 변환 ===');
        
        const incorrectProblems = {};
        const categoryIncorrect = {};
        
        // 퀴즈 결과에서 오답만 필터링
        quizResults.forEach(result => {
            if (!result.isCorrect) {
                const questionId = result.questionId;
                
                if (!incorrectProblems[questionId]) {
                    incorrectProblems[questionId] = {
                        questionId: questionId,
                        category: result.category,
                        attempts: 1,
                        lastAttempted: result.timestamp,
                        isVeryHighRisk: false,
                        isHighRisk: false,
                        isMediumRisk: false,
                        isLowRisk: false
                    };
                } else {
                    incorrectProblems[questionId].attempts += 1;
                    incorrectProblems[questionId].lastAttempted = result.timestamp;
                }
                
                // 카테고리별 오답 카운트
                if (!categoryIncorrect[result.category]) {
                    categoryIncorrect[result.category] = 0;
                }
                categoryIncorrect[result.category] += 1;
            }
        });
        
        // 위험도 분류
        Object.keys(incorrectProblems).forEach(questionId => {
            const problem = incorrectProblems[questionId];
            
            if (problem.attempts >= 5) {
                problem.isVeryHighRisk = true;
            } else if (problem.attempts >= 3) {
                problem.isHighRisk = true;
            } else if (problem.attempts >= 2) {
                problem.isMediumRisk = true;
            } else {
                problem.isLowRisk = true;
            }
        });
        
        const convertedData = {
            total_incorrect: Object.keys(incorrectProblems).length,
            very_high_risk: Object.values(incorrectProblems).filter(p => p.isVeryHighRisk).length,
            high_risk: Object.values(incorrectProblems).filter(p => p.isHighRisk).length,
            medium_risk: Object.values(incorrectProblems).filter(p => p.isMediumRisk).length,
            low_risk: Object.values(incorrectProblems).filter(p => p.isLowRisk).length,
            average_attempts: Object.keys(incorrectProblems).length > 0 ? 
                Object.values(incorrectProblems).reduce((sum, p) => sum + p.attempts, 0) / Object.keys(incorrectProblems).length : 0,
            problems: incorrectProblems,
            category_incorrect: categoryIncorrect
        };
        
        console.log('✅ 오답 분석 데이터 변환 완료:', convertedData);
        return convertedData;
    }
    
    /**
     * 새로운 데이터 구조에서 오답 분석 생성
     */
    generateIncorrectAnalysisFromData(stats, incorrectData) {
        console.log('=== 새로운 데이터 구조에서 오답 분석 생성 ===');
        
        // 요약 정보 생성
        const summary = {
            total_questions: incorrectData.total_incorrect || 0,
            critical_count: incorrectData.very_high_risk || 0,
            high_count: incorrectData.high_risk || 0,
            medium_count: incorrectData.medium_risk || 0,
            low_count: incorrectData.low_risk || 0,
            average_attempts: incorrectData.average_attempts || 0
        };
        
        // 위험도별 문제 목록 생성
        const criticalQuestions = {
            critical: [],
            high: [],
            medium: [],
            low: []
        };
        
        if (incorrectData.problems) {
            Object.values(incorrectData.problems).forEach(problem => {
                const questionData = {
                    id: problem.questionId,
                    category: problem.category,
                    incorrect: problem.attempts,
                    lastAttempted: problem.lastAttempted
                };
                
                if (problem.isVeryHighRisk) {
                    criticalQuestions.critical.push(questionData);
                } else if (problem.isHighRisk) {
                    criticalQuestions.high.push(questionData);
                } else if (problem.isMediumRisk) {
                    criticalQuestions.medium.push(questionData);
                } else if (problem.isLowRisk) {
                    criticalQuestions.low.push(questionData);
                }
            });
        }
        
        // 과목별 분석 생성
        const subjectAnalysis = {};
        if (stats.categories) {
            Object.keys(stats.categories).forEach(category => {
                const categoryData = stats.categories[category];
                const incorrectCount = incorrectData.category_incorrect?.[category] || 0;
                
                subjectAnalysis[category] = {
                    name: this.getSubjectDisplayName(category),
                    total: categoryData.total || 0,
                    correct: categoryData.correct || 0,
                    incorrect: incorrectCount,
                    accuracy: categoryData.accuracy || 0,
                    weak_points: incorrectCount > 0 ? `${incorrectCount}개 문제` : '없음'
                };
            });
        }
        
        // 인사이트 생성
        const insights = this.generateInsightsFromData(stats, incorrectData);
        
        // 권장사항 생성
        const recommendations = this.generateRecommendationsFromData(stats, incorrectData);
        
        const analysis = {
            summary,
            critical_questions: criticalQuestions,
            subject_analysis: subjectAnalysis,
            insights,
            recommendations
        };
        
        console.log('✅ 오답 분석 생성 완료:', analysis);
        return analysis;
    }

    /**
     * 새로운 데이터 구조에서 인사이트 생성
     */
    generateInsightsFromData(stats, incorrectData) {
        const insights = [];
        
        // 전체 정답률 기반 인사이트
        if (stats.accuracy_rate < 60) {
            insights.push('전체 정답률이 낮아 집중적인 복습이 필요합니다.');
        } else if (stats.accuracy_rate < 80) {
            insights.push('정답률이 보통 수준이므로 약점 보완에 집중하세요.');
        } else {
            insights.push('높은 정답률을 유지하고 있습니다. 안정적인 학습을 계속하세요.');
        }
        
        // 오답 패턴 기반 인사이트
        if (incorrectData.very_high_risk > 0) {
            insights.push(`${incorrectData.very_high_risk}개의 매우 위험한 문제가 있습니다. 우선적으로 복습하세요.`);
        }
        
        if (incorrectData.high_risk > 0) {
            insights.push(`${incorrectData.high_risk}개의 높은 위험 문제가 있습니다. 반복 학습이 필요합니다.`);
        }
        
        // 카테고리별 약점 인사이트
        if (incorrectData.category_incorrect) {
            const worstCategory = Object.entries(incorrectData.category_incorrect)
                .sort(([,a], [,b]) => b - a)[0];
            
            if (worstCategory && worstCategory[1] > 0) {
                insights.push(`${this.getSubjectDisplayName(worstCategory[0])}에서 가장 많은 오답이 발생했습니다.`);
            }
        }
        
        return insights;
    }

    /**
     * 새로운 데이터 구조에서 권장사항 생성
     */
    generateRecommendationsFromData(stats, incorrectData) {
        const recommendations = [];
        
        // 우선순위별 권장사항
        if (incorrectData.very_high_risk > 0) {
            recommendations.push('매우 위험한 문제들을 우선적으로 복습하세요.');
        }
        
        if (incorrectData.high_risk > 0) {
            recommendations.push('높은 위험 문제들을 반복 학습하세요.');
        }
        
        // 카테고리별 권장사항
        if (incorrectData.category_incorrect) {
            const worstCategory = Object.entries(incorrectData.category_incorrect)
                .sort(([,a], [,b]) => b - a)[0];
            
            if (worstCategory && worstCategory[1] > 0) {
                recommendations.push(`${this.getSubjectDisplayName(worstCategory[0])} 카테고리에 집중 학습하세요.`);
            }
        }
        
        // 전체적인 권장사항
        if (stats.accuracy_rate < 60) {
            recommendations.push('기본 개념을 다시 정리하고 기본 문제부터 차근차근 풀어보세요.');
        } else if (stats.accuracy_rate < 80) {
            recommendations.push('약점 부분을 집중적으로 보완하고 실전 문제를 더 풀어보세요.');
        } else {
            recommendations.push('현재 학습 상태가 좋습니다. 실전 모의고사로 실력을 점검해보세요.');
        }
        
        return recommendations;
    }
    
    // 초기화
    init() {
        // 기존 오답 데이터가 없으면 초기화
        if (!localStorage.getItem('aicu_incorrect_statistics')) {
            this.initializeIncorrectData();
        }
        
        // 페이지 로드 시 자동 업데이트
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.updateDisplay());
        } else {
            this.updateDisplay();
        }
        
        // 전역 함수로 노출
        window.IncorrectAnalysisManager = this;
    }
}

// 전역 인스턴스 생성
window.incorrectAnalysisManager = new IncorrectAnalysisManager();

