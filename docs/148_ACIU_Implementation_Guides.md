# 148. ACIU Core Features Implementation Guide

## 📋 개요

**작성일**: 2024년 12월 19일  
**작성자**: 서대리 (AI Assistant)  
**프로젝트**: ACIU S4 v4.12 → 보험중개사 시험 앱 개발 준비  
**목적**: 핵심 기능 구현 가이드, 안정적이고 확장 가능한 코드 구조, 효율적인 데이터 처리 방법 제공  

---

## 🚀 Flask 애플리케이션 구조 및 구현

### **1. 메인 애플리케이션 구조**

#### **1.1 app.py 기본 구조**
```python
# app_v4.12.py - AICU S4 완성형 구조
from flask import Flask, render_template, redirect, url_for, jsonify, request, session
from datetime import datetime, timedelta
import os
import json
import time

def create_app():
    """AICU S4 v4.12 - 완성형 Flask 애플리케이션"""
    app = Flask(__name__)
    
    # 앱 설정
    app.config['SECRET_KEY'] = 'aicu_season4_v4_12_production'
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)
    
    # 정적 파일 캐싱 설정
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 31536000  # 1년
    
    # 메인 라우트 - 게스트 자동 등록 시스템
    @app.route('/')
    def index():
        """홈페이지 - 세션 없을 경우 게스트로 자동 등록"""
        if 'current_user_id' not in session:
            # 게스트 자동 등록
            guest_id = f"guest_{int(time.time())}"
            session.update({
                'current_user_id': guest_id,
                'user_name': '홍길동',
                'registration_date': '2025-08-10',
                'exam_subject': 'ACIU',
                'exam_date': '2025-09-13',
                'is_guest': True,
                'guest_start_time': datetime.now().isoformat()
            })
            session.permanent = True
            
            print(f"✅ 게스트 자동 등록: {guest_id}")
        
        return redirect(url_for('home_page'))
    
    # Blueprint 등록
    register_blueprints(app)
    
    return app

def register_blueprints(app):
    """Blueprint 등록 - 모듈화된 라우트 관리"""
    
    # 홈 페이지 라우트
    try:
        from routes.home_routes import home_bp
        app.register_blueprint(home_bp)
        print("✅ 홈 라우트 등록")
    except ImportError:
        print("❌ 홈 라우트 없음")
    
    # 학습 라우트
    try:
        from routes.learning_routes import learning_bp
        app.register_blueprint(learning_bp)
        print("✅ 학습 라우트 등록")
    except ImportError:
        print("❌ 학습 라우트 없음")
    
    # 설정 라우트
    try:
        from routes.settings_routes import settings_bp
        app.register_blueprint(settings_bp)
        print("✅ 설정 라우트 등록")
    except ImportError:
        print("❌ 설정 라우트 없음")
    
    # 사용자 API 라우트
    try:
        from routes.user_routes import user_bp
        app.register_blueprint(user_bp, url_prefix='/api')
        print("✅ 사용자 API 라우트 등록")
    except ImportError:
        print("❌ 사용자 API 라우트 없음")

if __name__ == '__main__':
    app = create_app()
    print("=" * 60)
    print("🚀 AICU S4 v4.12 - 문서화 및 배포 준비 완료")
    print("📍 URL: http://localhost:5000")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5000, debug=True)
```

#### **1.2 Blueprint 기반 모듈화 구조**
```python
# routes/home_routes.py - 홈 페이지 관련 라우트
from flask import Blueprint, render_template, session, jsonify
from datetime import datetime

home_bp = Blueprint('home', __name__)

@home_bp.route('/home')
def home_page():
    """홈페이지 메인"""
    user_info = {
        'name': session.get('user_name', '홍길동'),
        'exam_date': session.get('exam_date', '2025-09-13'),
        'is_guest': session.get('is_guest', True)
    }
    
    # D-Day 계산
    if user_info['exam_date']:
        exam_date = datetime.strptime(user_info['exam_date'], '%Y-%m-%d')
        today = datetime.now()
        d_day = (exam_date - today).days
        
        if d_day > 0:
            user_info['d_day'] = f'D-{d_day}'
        elif d_day == 0:
            user_info['d_day'] = 'D-Day'
        else:
            user_info['d_day'] = f'D+{abs(d_day)}'
    else:
        user_info['d_day'] = 'D-?'
    
    return render_template('home.html', user_info=user_info)

@home_bp.route('/api/home/statistics')
def get_home_statistics():
    """홈페이지 통계 API"""
    # 실제 구현에서는 LocalStorage 데이터를 활용
    statistics = {
        'total_solved': 0,
        'total_correct': 0,
        'overall_accuracy': 0,
        'expected_scores': {
            '06재산보험': 0,
            '07특종보험': 0,
            '08배상책임보험': 0,
            '09해상보험': 0
        },
        'pass_probability': 0
    }
    
    return jsonify(statistics)
```

### **2. API 엔드포인트 구현 패턴**

#### **2.1 사용자 등록 API**
```python
# routes/user_routes.py - 사용자 관련 API
from flask import Blueprint, request, jsonify, session
from datetime import datetime
import json
import os

user_bp = Blueprint('user', __name__)

@user_bp.route('/register/guest', methods=['POST'])
def register_guest():
    """게스트 등록 API"""
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        exam_date = data.get('exam_date', '').strip()
        
        # 입력 검증
        if not name or not exam_date:
            return jsonify({
                'success': False, 
                'message': '이름과 시험일을 입력해주세요.'
            }), 400
        
        # 세션 업데이트
        guest_id = f"guest_{int(time.time())}"
        session.update({
            'current_user_id': guest_id,
            'user_name': name,
            'exam_date': exam_date,
            'registration_date': datetime.now().strftime('%Y-%m-%d'),
            'exam_subject': 'ACIU',
            'is_guest': True,
            'registration_timestamp': datetime.now().isoformat()
        })
        session.permanent = True
        
        # 사용자 데이터 저장 (선택사항)
        save_user_data({
            'user_id': guest_id,
            'name': name,
            'exam_date': exam_date,
            'type': 'guest',
            'created_at': datetime.now().isoformat()
        })
        
        return jsonify({
            'success': True,
            'message': f'{name}님, 게스트 등록이 완료되었습니다!',
            'user_data': {
                'user_id': guest_id,
                'name': name,
                'exam_date': exam_date,
                'd_day': calculate_d_day(exam_date)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'등록 중 오류가 발생했습니다: {str(e)}'
        }), 500

@user_bp.route('/register/user', methods=['POST'])
def register_user():
    """실제 사용자 등록 API"""
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        phone = data.get('phone', '').strip()
        exam_date = data.get('exam_date', '').strip()
        
        # 입력 검증
        if not all([name, phone, exam_date]):
            return jsonify({
                'success': False,
                'message': '모든 필드를 입력해주세요.'
            }), 400
        
        # 전화번호 형식 검증
        if not is_valid_phone(phone):
            return jsonify({
                'success': False,
                'message': '올바른 전화번호 형식이 아닙니다.'
            }), 400
        
        # 세션 업데이트
        user_id = f"user_{int(time.time())}"
        session.update({
            'current_user_id': user_id,
            'user_name': name,
            'user_phone': phone,
            'exam_date': exam_date,
            'registration_date': datetime.now().strftime('%Y-%m-%d'),
            'exam_subject': 'AICU',
            'is_guest': False,
            'registration_timestamp': datetime.now().isoformat()
        })
        session.permanent = True
        
        # 사용자 데이터 저장
        save_user_data({
            'user_id': user_id,
            'name': name,
            'phone': phone,
            'exam_date': exam_date,
            'type': 'registered',
            'created_at': datetime.now().isoformat()
        })
        
        return jsonify({
            'success': True,
            'message': f'{name}님, 정식 등록이 완료되었습니다!',
            'user_data': {
                'user_id': user_id,
                'name': name,
                'phone': phone,
                'exam_date': exam_date,
                'd_day': calculate_d_day(exam_date)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'등록 중 오류가 발생했습니다: {str(e)}'
        }), 500

def save_user_data(user_data):
    """사용자 데이터 저장 (파일 기반)"""
    try:
        users_file = 'data/users.json'
        
        # 디렉토리 생성
        os.makedirs(os.path.dirname(users_file), exist_ok=True)
        
        # 기존 사용자 데이터 로드
        users = []
        if os.path.exists(users_file):
            with open(users_file, 'r', encoding='utf-8') as f:
                users = json.load(f)
        
        # 새 사용자 추가
        users.append(user_data)
        
        # 저장
        with open(users_file, 'w', encoding='utf-8') as f:
            json.dump(users, f, ensure_ascii=False, indent=2)
        
        return True
    except Exception as e:
        print(f"사용자 데이터 저장 실패: {e}")
        return False

def calculate_d_day(exam_date_str):
    """D-Day 계산"""
    try:
        exam_date = datetime.strptime(exam_date_str, '%Y-%m-%d')
        today = datetime.now()
        d_day = (exam_date - today).days
        
        if d_day > 0:
            return f'D-{d_day}'
        elif d_day == 0:
            return 'D-Day'
        else:
            return f'D+{abs(d_day)}'
    except:
        return 'D-?'

def is_valid_phone(phone):
    """전화번호 유효성 검사"""
    import re
    pattern = r'^01[0-9]-\d{4}-\d{4}$'
    return re.match(pattern, phone) is not None
```

#### **2.2 문제 데이터 API**
```python
# routes/question_routes.py - 문제 관련 API
from flask import Blueprint, jsonify, request
import json
import os

question_bp = Blueprint('question', __name__)

@question_bp.route('/api/questions')
def get_questions():
    """전체 문제 데이터 조회"""
    try:
        questions_file = 'data/questions.json'
        
        if not os.path.exists(questions_file):
            return jsonify({
                'success': False,
                'message': '문제 데이터를 찾을 수 없습니다.'
            }), 404
        
        with open(questions_file, 'r', encoding='utf-8') as f:
            questions = json.load(f)
        
        return jsonify({
            'success': True,
            'questions': questions,
            'total_count': len(questions)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'문제 데이터 로드 실패: {str(e)}'
        }), 500

@question_bp.route('/api/questions/category/<category>')
def get_questions_by_category(category):
    """카테고리별 문제 조회"""
    try:
        questions_file = 'data/questions.json'
        
        with open(questions_file, 'r', encoding='utf-8') as f:
            all_questions = json.load(f)
        
        # 카테고리 필터링
        filtered_questions = [
            q for q in all_questions 
            if q.get('layer1') == category or q.get('category') == category
        ]
        
        return jsonify({
            'success': True,
            'questions': filtered_questions,
            'category': category,
            'total_count': len(filtered_questions)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'카테고리별 문제 조회 실패: {str(e)}'
        }), 500

@question_bp.route('/api/questions/<int:question_id>')
def get_question_by_id(question_id):
    """특정 문제 조회"""
    try:
        questions_file = 'data/questions.json'
        
        with open(questions_file, 'r', encoding='utf-8') as f:
            questions = json.load(f)
        
        # 문제 ID로 검색
        question = next((q for q in questions if q.get('qcode') == str(question_id)), None)
        
        if not question:
            return jsonify({
                'success': False,
                'message': '해당 문제를 찾을 수 없습니다.'
            }), 404
        
        return jsonify({
            'success': True,
            'question': question
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'문제 조회 실패: {str(e)}'
        }), 500
```

---

## 📊 통계 시스템 구현

### **1. 실시간 통계 업데이트 시스템**

#### **1.1 JavaScript 통계 관리자**
```javascript
// static/js/statistics_manager.js
class StatisticsManager {
    constructor() {
        this.storageKeys = {
            realTimeData: 'aicu_real_time_data',
            categoryStats: 'aicu_category_statistics',
            userInfo: 'aicu_user_info',
            learningLog: 'aicu_learning_log'
        };
        
        this.initialize();
    }
    
    /**
     * 통계 시스템 초기화
     */
    initialize() {
        this.initializeStorageStructure();
        this.setupEventListeners();
        console.log('✅ 통계 관리자 초기화 완료');
    }
    
    /**
     * LocalStorage 구조 초기화
     */
    initializeStorageStructure() {
        // 실시간 데이터 초기화
        if (!localStorage.getItem(this.storageKeys.realTimeData)) {
            const initialData = {
                '06재산보험': this.createCategoryStructure(),
                '07특종보험': this.createCategoryStructure(),
                '08배상책임보험': this.createCategoryStructure(),
                '09해상보험': this.createCategoryStructure(),
                meta: {
                    total_attempts: 0,
                    total_correct: 0,
                    overall_accuracy: 0,
                    last_updated: new Date().toISOString()
                }
            };
            
            localStorage.setItem(this.storageKeys.realTimeData, JSON.stringify(initialData));
        }
        
        // 사용자 정보 초기화
        if (!localStorage.getItem(this.storageKeys.userInfo)) {
            const userInfo = {
                user_type: 'guest',
                name: '홍길동',
                exam_date: '2025-09-13',
                registration_date: new Date().toISOString().split('T')[0],
                d_day: this.calculateDDay('2025-09-13')
            };
            
            localStorage.setItem(this.storageKeys.userInfo, JSON.stringify(userInfo));
        }
    }
    
    /**
     * 카테고리 데이터 구조 생성
     */
    createCategoryStructure() {
        return {
            solved: 0,
            correct: 0,
            accuracy: '0.0',
            daily_progress: {},
            lastQuestionIndex: 0,
            last_updated: new Date().toISOString()
        };
    }
    
    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 퀴즈 완료 이벤트
        window.addEventListener('quizCompleted', (event) => {
            this.handleQuizCompleted(event.detail);
        });
        
        // 페이지 간 데이터 동기화
        window.addEventListener('storage', (event) => {
            if (event.key && event.key.startsWith('aicu_')) {
                this.handleStorageChange(event);
            }
        });
    }
    
    /**
     * 퀴즈 완료 처리
     */
    handleQuizCompleted(detail) {
        const { questionId, category, isCorrect, userAnswer, correctAnswer } = detail;
        
        // 실시간 데이터 업데이트
        this.updateRealTimeData(category, isCorrect);
        
        // 학습 로그 기록
        this.recordLearningLog(questionId, category, isCorrect, userAnswer, correctAnswer);
        
        // UI 업데이트
        this.updateStatisticsUI();
        
        console.log(`📊 퀴즈 결과 처리: ${category} - ${isCorrect ? '정답' : '오답'}`);
    }
    
    /**
     * 실시간 데이터 업데이트
     */
    updateRealTimeData(category, isCorrect) {
        const realTimeData = JSON.parse(localStorage.getItem(this.storageKeys.realTimeData) || '{}');
        
        // 카테고리 데이터 초기화 (필요시)
        if (!realTimeData[category]) {
            realTimeData[category] = this.createCategoryStructure();
        }
        
        // 통계 업데이트
        realTimeData[category].solved++;
        if (isCorrect) {
            realTimeData[category].correct++;
        }
        
        // 정답률 계산
        const accuracy = realTimeData[category].solved > 0 
            ? (realTimeData[category].correct / realTimeData[category].solved * 100).toFixed(1)
            : '0.0';
        realTimeData[category].accuracy = accuracy;
        realTimeData[category].last_updated = new Date().toISOString();
        
        // 일별 진행상황 업데이트
        const today = new Date().toISOString().split('T')[0];
        if (!realTimeData[category].daily_progress[today]) {
            realTimeData[category].daily_progress[today] = { solved: 0, correct: 0 };
        }
        
        realTimeData[category].daily_progress[today].solved++;
        if (isCorrect) {
            realTimeData[category].daily_progress[today].correct++;
        }
        
        // 메타 데이터 업데이트
        realTimeData.meta.total_attempts++;
        if (isCorrect) {
            realTimeData.meta.total_correct++;
        }
        realTimeData.meta.overall_accuracy = 
            (realTimeData.meta.total_correct / realTimeData.meta.total_attempts * 100).toFixed(1);
        realTimeData.meta.last_updated = new Date().toISOString();
        
        // 저장
        localStorage.setItem(this.storageKeys.realTimeData, JSON.stringify(realTimeData));
    }
    
    /**
     * 학습 로그 기록
     */
    recordLearningLog(questionId, category, isCorrect, userAnswer, correctAnswer) {
        let learningLog = JSON.parse(localStorage.getItem(this.storageKeys.learningLog) || '{}');
        
        if (!learningLog.logs) {
            learningLog = {
                user_id: '게스트',
                registration_date: new Date().toISOString().split('T')[0],
                logs: [],
                last_updated: new Date().toISOString()
            };
        }
        
        learningLog.logs.push({
            timestamp: new Date().toISOString(),
            question_id: questionId,
            category: category,
            user_answer: userAnswer,
            correct_answer: correctAnswer,
            is_correct: isCorrect,
            time_spent: 0 // TODO: 실제 시간 측정
        });
        
        learningLog.last_updated = new Date().toISOString();
        localStorage.setItem(this.storageKeys.learningLog, JSON.stringify(learningLog));
    }
    
    /**
     * 통계 UI 업데이트
     */
    updateStatisticsUI() {
        const realTimeData = JSON.parse(localStorage.getItem(this.storageKeys.realTimeData) || '{}');
        
        // 전체 진행률 업데이트
        this.updateProgressDisplay(realTimeData);
        
        // 정답률 업데이트
        this.updateAccuracyDisplay(realTimeData);
        
        // 카테고리별 통계 업데이트
        this.updateCategoryStatistics(realTimeData);
        
        // 예상 점수 업데이트
        this.updateExpectedScores(realTimeData);
    }
    
    /**
     * 진행률 표시 업데이트
     */
    updateProgressDisplay(data) {
        const totalSolved = Object.keys(data)
            .filter(key => key !== 'meta')
            .reduce((sum, category) => sum + (data[category].solved || 0), 0);
        
        const totalQuestions = 789; // 전체 문제 수
        const progressRate = ((totalSolved / totalQuestions) * 100).toFixed(1);
        
        // DOM 업데이트
        const progressElements = document.querySelectorAll('.progress-display');
        progressElements.forEach(element => {
            if (element) {
                element.textContent = `진행률: ${progressRate}% (${totalSolved}/${totalQuestions})`;
            }
        });
        
        // 진행률 바 업데이트
        const progressBars = document.querySelectorAll('.progress-bar');
        progressBars.forEach(bar => {
            if (bar) {
                bar.style.width = `${progressRate}%`;
            }
        });
    }
    
    /**
     * 정답률 표시 업데이트
     */
    updateAccuracyDisplay(data) {
        const overallAccuracy = data.meta.overall_accuracy || '0.0';
        
        const accuracyElements = document.querySelectorAll('.accuracy-display');
        accuracyElements.forEach(element => {
            if (element) {
                element.textContent = `정답률: ${overallAccuracy}%`;
            }
        });
    }
    
    /**
     * 카테고리별 통계 업데이트
     */
    updateCategoryStatistics(data) {
        Object.keys(data).forEach(category => {
            if (category !== 'meta') {
                const categoryData = data[category];
                
                // 카테고리별 진행률
                const categoryProgress = document.querySelector(`.category-progress[data-category="${category}"]`);
                if (categoryProgress) {
                    categoryProgress.textContent = `${categoryData.solved}문제 (정답률: ${categoryData.accuracy}%)`;
                }
                
                // 카테고리별 진행률 바
                const categoryBar = document.querySelector(`.category-bar[data-category="${category}"]`);
                if (categoryBar) {
                    const progressPercent = categoryData.accuracy;
                    categoryBar.style.width = `${progressPercent}%`;
                }
            }
        });
    }
    
    /**
     * 예상 점수 업데이트
     */
    updateExpectedScores(data) {
        const expectedScores = {};
        let totalScore = 0;
        let categoryCount = 0;
        
        Object.keys(data).forEach(category => {
            if (category !== 'meta') {
                const accuracy = parseFloat(data[category].accuracy) || 0;
                const expectedScore = Math.round(accuracy);
                expectedScores[category] = expectedScore;
                totalScore += expectedScore;
                categoryCount++;
            }
        });
        
        // 전체 평균 점수
        const averageScore = categoryCount > 0 ? Math.round(totalScore / categoryCount) : 0;
        expectedScores['전체평균'] = averageScore;
        
        // 합격 확률 계산
        const passCount = Object.values(expectedScores)
            .filter(score => score >= 40).length - 1; // 전체평균 제외
        const passProbability = Math.round((passCount / categoryCount) * 100);
        
        // DOM 업데이트
        Object.keys(expectedScores).forEach(category => {
            const scoreElement = document.querySelector(`.expected-score[data-category="${category}"]`);
            if (scoreElement) {
                scoreElement.textContent = `${expectedScores[category]}점`;
            }
        });
        
        // 합격 확률 업데이트
        const passProbElement = document.querySelector('.pass-probability');
        if (passProbElement) {
            passProbElement.textContent = `합격 확률: ${passProbability}%`;
        }
    }
    
    /**
     * D-Day 계산
     */
    calculateDDay(examDateStr) {
        try {
            const examDate = new Date(examDateStr);
            const today = new Date();
            const diffTime = examDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > 0) {
                return `D-${diffDays}`;
            } else if (diffDays === 0) {
                return 'D-Day';
            } else {
                return `D+${Math.abs(diffDays)}`;
            }
        } catch {
            return 'D-?';
        }
    }
    
    /**
     * 통계 데이터 조회
     */
    getStatistics(category = null) {
        const realTimeData = JSON.parse(localStorage.getItem(this.storageKeys.realTimeData) || '{}');
        
        if (category) {
            return realTimeData[category] || this.createCategoryStructure();
        }
        
        return realTimeData;
    }
    
    /**
     * 통계 초기화
     */
    resetStatistics() {
        localStorage.removeItem(this.storageKeys.realTimeData);
        localStorage.removeItem(this.storageKeys.learningLog);
        this.initializeStorageStructure();
        this.updateStatisticsUI();
        console.log('✅ 통계 데이터 초기화 완료');
    }
}

// 전역 인스턴스 생성
window.StatisticsManager = new StatisticsManager();
```

### **2. 이어풀기 기능 구현**

#### **2.1 Continue Learning System**
```javascript
// static/js/continue_learning.js
class ContinueLearningManager {
    constructor() {
        this.storageKey = 'aicu_continue_learning';
        this.currentCategory = null;
        this.currentQuestionIndex = 0;
    }
    
    /**
     * 이어풀기 상태 저장
     */
    saveProgress(category, questionIndex, additionalData = {}) {
        const progressData = {
            category: category,
            questionIndex: questionIndex,
            timestamp: new Date().toISOString(),
            session_id: this.generateSessionId(),
            ...additionalData
        };
        
        localStorage.setItem(this.storageKey, JSON.stringify(progressData));
        console.log(`💾 이어풀기 진행상황 저장: ${category} - ${questionIndex}번 문제`);
    }
    
    /**
     * 이어풀기 상태 로드
     */
    loadProgress() {
        const savedProgress = localStorage.getItem(this.storageKey);
        
        if (savedProgress) {
            try {
                const progressData = JSON.parse(savedProgress);
                this.currentCategory = progressData.category;
                this.currentQuestionIndex = progressData.questionIndex;
                
                return progressData;
            } catch (e) {
                console.error('이어풀기 데이터 파싱 오류:', e);
                return null;
            }
        }
        
        return null;
    }
    
    /**
     * 마지막 위치에서 이어풀기 시작
     */
    continueFromLastPosition() {
        const progress = this.loadProgress();
        
        if (progress) {
            // 카테고리별 이어풀기
            if (progress.category && progress.category !== 'basic_learning') {
                this.startCategoryLearning(progress.category, progress.questionIndex);
            } else {
                // 기본학습 이어풀기
                this.startBasicLearning(progress.questionIndex);
            }
            
            return true;
        }
        
        return false;
    }
    
    /**
     * 기본학습 이어풀기 시작
     */
    startBasicLearning(startIndex = 0) {
        this.currentCategory = 'basic_learning';
        this.currentQuestionIndex = startIndex;
        
        // 기본학습 페이지로 이동하면서 시작 인덱스 전달
        const url = `/basic-learning?start=${startIndex}&continue=true`;
        window.location.href = url;
    }
    
    /**
     * 카테고리별 학습 이어풀기 시작
     */
    startCategoryLearning(category, startIndex = 0) {
        this.currentCategory = category;
        this.currentQuestionIndex = startIndex;
        
        // 대분류학습 페이지로 이동하면서 카테고리와 시작 인덱스 전달
        const url = `/large-category-learning?category=${encodeURIComponent(category)}&start=${startIndex}&continue=true`;
        window.location.href = url;
    }
    
    /**
     * 이어풀기 정보 표시
     */
    displayContinueInfo() {
        const progress = this.loadProgress();
        
        if (progress) {
            const continueInfoElement = document.querySelector('#continue-info');
            if (continueInfoElement) {
                const categoryName = progress.category === 'basic_learning' ? '기본학습' : progress.category;
                const lastUpdated = new Date(progress.timestamp).toLocaleString('ko-KR');
                
                continueInfoElement.innerHTML = `
                    <div class="continue-info-card">
                        <h4>📚 이어풀기 가능</h4>
                        <p><strong>카테고리:</strong> ${categoryName}</p>
                        <p><strong>마지막 문제:</strong> ${progress.questionIndex}번</p>
                        <p><strong>마지막 학습:</strong> ${lastUpdated}</p>
                        <button onclick="continueLearning.continueFromLastPosition()" 
                                class="btn btn-primary">
                            이어서 풀기
                        </button>
                    </div>
                `;
            }
        }
    }
    
    /**
     * 자동 이어풀기 (페이지 로드 시)
     */
    autoResume() {
        const urlParams = new URLSearchParams(window.location.search);
        const shouldContinue = urlParams.get('continue') === 'true';
        const startIndex = parseInt(urlParams.get('start')) || 0;
        const category = urlParams.get('category');
        
        if (shouldContinue) {
            if (category) {
                // 카테고리별 학습 자동 시작
                this.resumeCategoryLearning(category, startIndex);
            } else {
                // 기본학습 자동 시작
                this.resumeBasicLearning(startIndex);
            }
        }
    }
    
    /**
     * 기본학습 자동 재개
     */
    resumeBasicLearning(startIndex) {
        console.log(`🔄 기본학습 자동 재개: ${startIndex}번 문제부터`);
        
        // 전역 함수 호출 (basic_learning.html의 JavaScript 함수)
        if (typeof startQuizFromIndex === 'function') {
            startQuizFromIndex(startIndex);
        }
    }
    
    /**
     * 카테고리별 학습 자동 재개
     */
    resumeCategoryLearning(category, startIndex) {
        console.log(`🔄 ${category} 학습 자동 재개: ${startIndex}번 문제부터`);
        
        // 전역 함수 호출 (large_category_learning.html의 JavaScript 함수)
        if (typeof startCategoryQuizFromIndex === 'function') {
            startCategoryQuizFromIndex(category, startIndex);
        }
    }
    
    /**
     * 세션 ID 생성
     */
    generateSessionId() {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        return `${dateStr}_${timeStr}`;
    }
    
    /**
     * 이어풀기 데이터 초기화
     */
    resetProgress() {
        localStorage.removeItem(this.storageKey);
        this.currentCategory = null;
        this.currentQuestionIndex = 0;
        console.log('🗑️ 이어풀기 데이터 초기화 완료');
    }
}

// 전역 인스턴스 생성
window.continueLearning = new ContinueLearningManager();

// 페이지 로드 시 자동 재개 확인
document.addEventListener('DOMContentLoaded', () => {
    window.continueLearning.autoResume();
    window.continueLearning.displayContinueInfo();
});
```

---

## 🎯 보험중개사 앱 적용 가이드

### **1. 보험중개사 앱 구조 변경**

#### **1.1 카테고리 및 데이터 구조 변경**
```python
# insurance_app.py - 보험중개사 전용 Flask 앱
from flask import Flask, render_template, redirect, url_for, jsonify, request, session
from datetime import datetime, timedelta
import os
import json
import time

def create_insurance_app():
    """보험중개사 시험 앱 v1.0"""
    app = Flask(__name__)
    
    # 앱 설정
    app.config['SECRET_KEY'] = 'insurance_broker_exam_v1_0'
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)
    
    # 보험중개사 시험 카테고리
    INSURANCE_CATEGORIES = ['보험일반', '보험계약', '보험금지급', '보험업법']
    
    @app.route('/')
    def index():
        """홈페이지 - 보험중개사 게스트 자동 등록"""
        if 'current_user_id' not in session:
            guest_id = f"insurance_guest_{int(time.time())}"
            session.update({
                'current_user_id': guest_id,
                'user_name': '김보험',
                'registration_date': datetime.now().strftime('%Y-%m-%d'),
                'exam_subject': '보험중개사',
                'exam_date': '2025-03-15',  # 보험중개사 시험일
                'is_guest': True,
                'guest_start_time': datetime.now().isoformat(),
                'categories': INSURANCE_CATEGORIES
            })
            session.permanent = True
            
            print(f"✅ 보험중개사 게스트 자동 등록: {guest_id}")
        
        return redirect(url_for('insurance_home'))
    
    @app.route('/home')
    def insurance_home():
        """보험중개사 홈페이지"""
        user_info = {
            'name': session.get('user_name', '김보험'),
            'exam_date': session.get('exam_date', '2025-03-15'),
            'exam_subject': session.get('exam_subject', '보험중개사'),
            'is_guest': session.get('is_guest', True),
            'categories': INSURANCE_CATEGORIES
        }
        
        # D-Day 계산
        user_info['d_day'] = calculate_d_day(user_info['exam_date'])
        
        return render_template('insurance_home.html', user_info=user_info)
    
    @app.route('/api/insurance/categories')
    def get_insurance_categories():
        """보험중개사 카테고리 목록 API"""
        categories_info = {
            '보험일반': {
                'name': '보험일반',
                'description': '보험의 기본 개념과 원리',
                'total_questions': 250,
                'pass_score': 40
            },
            '보험계약': {
                'name': '보험계약',
                'description': '보험계약의 성립과 효력',
                'total_questions': 200,
                'pass_score': 40
            },
            '보험금지급': {
                'name': '보험금지급',
                'description': '보험금 지급 절차와 기준',
                'total_questions': 200,
                'pass_score': 40
            },
            '보험업법': {
                'name': '보험업법',
                'description': '보험업 관련 법률과 규정',
                'total_questions': 150,
                'pass_score': 40
            }
        }
        
        return jsonify({
            'success': True,
            'categories': categories_info,
            'total_categories': len(categories_info)
        })
    
    return app

def calculate_d_day(exam_date_str):
    """D-Day 계산"""
    try:
        exam_date = datetime.strptime(exam_date_str, '%Y-%m-%d')
        today = datetime.now()
        d_day = (exam_date - today).days
        
        if d_day > 0:
            return f'D-{d_day}'
        elif d_day == 0:
            return 'D-Day'
        else:
            return f'D+{abs(d_day)}'
    except:
        return 'D-?'

if __name__ == '__main__':
    app = create_insurance_app()
    print("=" * 60)
    print("🏢 보험중개사 시험 앱 v1.0 시작")
    print("📍 URL: http://localhost:5000")
    print("📚 카테고리: 보험일반, 보험계약, 보험금지급, 보험업법")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5000, debug=True)
```

#### **1.2 보험중개사 전용 통계 시스템**
```javascript
// static/js/insurance_statistics.js
class InsuranceStatisticsManager {
    constructor() {
        this.categories = ['보험일반', '보험계약', '보험금지급', '보험업법'];
        this.passThreshold = 40; // 각 과목 합격 기준
        this.overallPassThreshold = 50; // 전체 평균 합격 기준
        
        this.storageKeys = {
            realTimeData: 'insurance_real_time_data',
            userInfo: 'insurance_user_info',
            studyPlan: 'insurance_study_plan',
            wrongAnswers: 'insurance_wrong_answers'
        };
        
        this.initialize();
    }
    
    /**
     * 보험중개사 통계 시스템 초기화
     */
    initialize() {
        this.initializeInsuranceData();
        this.setupEventListeners();
        console.log('✅ 보험중개사 통계 관리자 초기화 완료');
    }
    
    /**
     * 보험중개사 데이터 구조 초기화
     */
    initializeInsuranceData() {
        // 실시간 데이터 초기화
        if (!localStorage.getItem(this.storageKeys.realTimeData)) {
            const initialData = {
                meta: {
                    total_attempts: 0,
                    total_correct: 0,
                    overall_accuracy: 0,
                    overall_expected_score: 0,
                    pass_probability: 0,
                    exam_ready: false,
                    last_updated: new Date().toISOString()
                }
            };
            
            // 각 카테고리 초기화
            this.categories.forEach(category => {
                initialData[category] = {
                    solved: 0,
                    correct: 0,
                    accuracy: '0.0',
                    expected_score: 0,
                    pass_threshold: this.passThreshold,
                    daily_progress: {},
                    lastQuestionIndex: 0,
                    last_updated: new Date().toISOString()
                };
            });
            
            localStorage.setItem(this.storageKeys.realTimeData, JSON.stringify(initialData));
        }
        
        // 사용자 정보 초기화
        if (!localStorage.getItem(this.storageKeys.userInfo)) {
            const userInfo = {
                user_type: 'guest',
                name: '김보험',
                exam_type: '보험중개사',
                exam_date: '2025-03-15',
                target_score: 60,
                registration_date: new Date().toISOString().split('T')[0],
                study_goal: {
                    daily_questions: 50,
                    weekly_hours: 20,
                    target_accuracy: 80
                }
            };
            
            localStorage.setItem(this.storageKeys.userInfo, JSON.stringify(userInfo));
        }
        
        // 학습 계획 초기화
        if (!localStorage.getItem(this.storageKeys.studyPlan)) {
            const studyPlan = {
                total_questions: 800, // 보험중개사 예상 총 문제 수
                daily_target: 40,
                weekly_target: 280,
                category_distribution: {
                    '보험일반': 0.3,
                    '보험계약': 0.25,
                    '보험금지급': 0.25,
                    '보험업법': 0.2
                }
            };
            
            localStorage.setItem(this.storageKeys.studyPlan, JSON.stringify(studyPlan));
        }
    }
    
    /**
     * 보험중개사 퀴즈 결과 처리
     */
    recordInsuranceQuizResult(questionId, category, isCorrect, userAnswer, correctAnswer) {
        // 기본 통계 업데이트
        this.updateInsuranceStatistics(category, isCorrect);
        
        // 오답 노트 업데이트 (틀린 경우)
        if (!isCorrect) {
            this.updateWrongAnswersNote(questionId, category, userAnswer, correctAnswer);
        }
        
        // 예상 점수 및 합격 확률 재계산
        this.recalculateExamMetrics();
        
        // UI 업데이트
        this.updateInsuranceUI();
        
        console.log(`📊 보험중개사 퀴즈 결과 처리: ${category} - ${isCorrect ? '정답' : '오답'}`);
    }
    
    /**
     * 보험중개사 통계 업데이트
     */
    updateInsuranceStatistics(category, isCorrect) {
        const realTimeData = JSON.parse(localStorage.getItem(this.storageKeys.realTimeData) || '{}');
        
        if (!realTimeData[category]) {
            realTimeData[category] = {
                solved: 0,
                correct: 0,
                accuracy: '0.0',
                expected_score: 0,
                pass_threshold: this.passThreshold,
                daily_progress: {},
                lastQuestionIndex: 0,
                last_updated: new Date().toISOString()
            };
        }
        
        // 통계 업데이트
        realTimeData[category].solved++;
        if (isCorrect) {
            realTimeData[category].correct++;
        }
        
        // 정답률 및 예상 점수 계산
        const accuracy = realTimeData[category].solved > 0 
            ? (realTimeData[category].correct / realTimeData[category].solved * 100).toFixed(1)
            : '0.0';
        realTimeData[category].accuracy = accuracy;
        realTimeData[category].expected_score = Math.round(parseFloat(accuracy));
        realTimeData[category].last_updated = new Date().toISOString();
        
        // 일별 진행상황 업데이트
        const today = new Date().toISOString().split('T')[0];
        if (!realTimeData[category].daily_progress[today]) {
            realTimeData[category].daily_progress[today] = { solved: 0, correct: 0 };
        }
        
        realTimeData[category].daily_progress[today].solved++;
        if (isCorrect) {
            realTimeData[category].daily_progress[today].correct++;
        }
        
        // 메타 데이터 업데이트
        realTimeData.meta.total_attempts++;
        if (isCorrect) {
            realTimeData.meta.total_correct++;
        }
        realTimeData.meta.overall_accuracy = 
            (realTimeData.meta.total_correct / realTimeData.meta.total_attempts * 100).toFixed(1);
        realTimeData.meta.last_updated = new Date().toISOString();
        
        localStorage.setItem(this.storageKeys.realTimeData, JSON.stringify(realTimeData));
    }
    
    /**
     * 예상 점수 및 합격 확률 재계산
     */
    recalculateExamMetrics() {
        const realTimeData = JSON.parse(localStorage.getItem(this.storageKeys.realTimeData) || '{}');
        
        // 카테고리별 예상 점수 수집
        const categoryScores = [];
        let passCount = 0;
        
        this.categories.forEach(category => {
            if (realTimeData[category]) {
                const score = realTimeData[category].expected_score || 0;
                categoryScores.push(score);
                
                if (score >= this.passThreshold) {
                    passCount++;
                }
            }
        });
        
        // 전체 평균 점수 계산
        const overallScore = categoryScores.length > 0 
            ? Math.round(categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length)
            : 0;
        
        // 합격 확률 계산
        const categoryPassRate = (passCount / this.categories.length) * 100;
        const overallPassRate = overallScore >= this.overallPassThreshold ? 100 : 0;
        const passProbability = Math.round((categoryPassRate * 0.7) + (overallPassRate * 0.3));
        
        // 시험 준비 완료 여부
        const examReady = passProbability >= 80;
        
        // 메타데이터 업데이트
        realTimeData.meta.overall_expected_score = overallScore;
        realTimeData.meta.pass_probability = passProbability;
        realTimeData.meta.exam_ready = examReady;
        realTimeData.meta.last_updated = new Date().toISOString();
        
        localStorage.setItem(this.storageKeys.realTimeData, JSON.stringify(realTimeData));
        
        console.log(`📊 보험중개사 시험 메트릭 업데이트: 예상점수 ${overallScore}점, 합격확률 ${passProbability}%`);
    }
    
    /**
     * 보험중개사 UI 업데이트
     */
    updateInsuranceUI() {
        const realTimeData = JSON.parse(localStorage.getItem(this.storageKeys.realTimeData) || '{}');
        
        // 전체 예상 점수 업데이트
        const overallScoreElement = document.querySelector('#overall-expected-score');
        if (overallScoreElement) {
            overallScoreElement.textContent = `${realTimeData.meta.overall_expected_score}점`;
        }
        
        // 합격 확률 업데이트
        const passProbElement = document.querySelector('#pass-probability');
        if (passProbElement) {
            const probability = realTimeData.meta.pass_probability;
            passProbElement.textContent = `${probability}%`;
            
            // 합격 확률에 따른 색상 변경
            if (probability >= 80) {
                passProbElement.className = 'text-green-600 font-bold';
            } else if (probability >= 60) {
                passProbElement.className = 'text-yellow-600 font-bold';
            } else {
                passProbElement.className = 'text-red-600 font-bold';
            }
        }
        
        // 카테고리별 예상 점수 업데이트
        this.categories.forEach(category => {
            const categoryData = realTimeData[category];
            if (categoryData) {
                const scoreElement = document.querySelector(`#score-${category.replace(/\s+/g, '-')}`);
                if (scoreElement) {
                    const score = categoryData.expected_score;
                    scoreElement.textContent = `${score}점`;
                    
                    // 합격선에 따른 색상 변경
                    if (score >= this.passThreshold) {
                        scoreElement.className = 'text-green-600 font-bold';
                    } else {
                        scoreElement.className = 'text-red-600 font-bold';
                    }
                }
                
                // 정답률 업데이트
                const accuracyElement = document.querySelector(`#accuracy-${category.replace(/\s+/g, '-')}`);
                if (accuracyElement) {
                    accuracyElement.textContent = `${categoryData.accuracy}%`;
                }
            }
        });
        
        // 시험 준비 상태 업데이트
        const examReadyElement = document.querySelector('#exam-ready-status');
        if (examReadyElement) {
            if (realTimeData.meta.exam_ready) {
                examReadyElement.innerHTML = '<span class="text-green-600">✅ 시험 준비 완료</span>';
            } else {
                examReadyElement.innerHTML = '<span class="text-orange-600">⚠️ 추가 학습 필요</span>';
            }
        }
    }
    
    /**
     * 보험중개사 학습 추천사항 생성
     */
    generateInsuranceRecommendations() {
        const realTimeData = JSON.parse(localStorage.getItem(this.storageKeys.realTimeData) || '{}');
        const recommendations = [];
        
        // 전체 합격 확률 기반 추천
        const passProbability = realTimeData.meta.pass_probability || 0;
        if (passProbability < 70) {
            recommendations.push("전체적인 합격 확률이 낮습니다. 모든 영역의 균형 잡힌 학습이 필요합니다.");
        }
        
        // 카테고리별 추천
        this.categories.forEach(category => {
            const categoryData = realTimeData[category];
            if (categoryData) {
                const score = categoryData.expected_score || 0;
                const accuracy = parseFloat(categoryData.accuracy) || 0;
                
                if (score < this.passThreshold) {
                    recommendations.push(`${category} 영역의 집중 학습이 필요합니다 (현재 예상점수: ${score}점).`);
                }
                
                if (accuracy < 60) {
                    recommendations.push(`${category} 영역의 정답률이 낮습니다 (${accuracy}%). 기본 개념 복습을 권장합니다.`);
                }
            }
        });
        
        if (recommendations.length === 0) {
            recommendations.push("현재 학습 상태가 양호합니다. 꾸준히 학습을 계속하세요.");
        }
        
        return recommendations;
    }
}

// 전역 인스턴스 생성
window.InsuranceStatisticsManager = new InsuranceStatisticsManager();
```

---

## 🎯 결론

### **핵심 구현 가이드의 가치**

1. **모듈화된 구조**: Blueprint 기반의 확장 가능한 Flask 애플리케이션 구조
2. **실시간 통계 시스템**: LocalStorage 기반의 효율적인 데이터 관리
3. **이어풀기 기능**: 사용자 학습 연속성 보장을 위한 진행상황 관리
4. **도메인 적응성**: AICU에서 보험중개사 앱으로의 쉬운 확장

### **새 프로젝트 적용 시 주의사항**

1. **데이터 구조 설계**: 도메인 특성에 맞는 카테고리 및 데이터 구조 설계
2. **API 설계**: RESTful API 원칙을 따른 일관된 인터페이스 구현
3. **에러 처리**: 사용자 친화적인 에러 메시지 및 복구 메커니즘
4. **성능 최적화**: LocalStorage 용량 제한 고려한 효율적인 데이터 관리

### **지속적 개선 방향**

1. **API 표준화**: 더욱 일관된 API 인터페이스 설계
2. **실시간 동기화**: WebSocket 기반 실시간 데이터 동기화
3. **모바일 최적화**: 반응형 디자인 및 모바일 UX 개선
4. **테스트 자동화**: 단위 테스트 및 통합 테스트 구현

이 구현 가이드를 통해 **안정적이고 확장 가능한 학습 플랫폼**을 효율적으로 구축할 수 있을 것입니다.

---

**작성 완료**: 2024년 12월 19일  
**다음 단계**: 149번 문서 (ACIU_Lessons_Learned_Problem_Solutions.md) 작성
