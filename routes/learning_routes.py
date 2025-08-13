# routes/learning_routes.py - 게스트 모드 지원 버전

from flask import Blueprint, render_template, session, redirect, url_for, jsonify

learning_bp = Blueprint('learning', __name__)

@learning_bp.route('/basic-learning')
def basic_learning():
    """기본학습 페이지 - 게스트 모드 완전 지원"""
    
    # 게스트 세션이 있으면 바로 학습 페이지로 진행
    if 'current_user_id' in session:
        return render_template('basic_learning.html')
    else:
        # 세션이 없어도 게스트 모드로 자동 생성 (app.py의 before_request가 처리)
        return render_template('basic_learning.html')

@learning_bp.route('/large-category-learning')  
def large_category_learning():
    """대분류학습 페이지 - 게스트 모드 완전 지원"""
    
    # 게스트 세션이 있으면 바로 학습 페이지로 진행
    if 'current_user_id' in session:
        return render_template('large_category_learning.html')
    else:
        # 세션이 없어도 게스트 모드로 자동 생성
        return render_template('large_category_learning.html')

@learning_bp.route('/quiz')
def quiz():
    """퀴즈 페이지 - 게스트 모드 완전 지원"""
    
    # 게스트 세션이 있으면 바로 퀴즈 페이지로 진행
    if 'current_user_id' in session:
        return render_template('quiz.html')
    else:
        # 세션이 없어도 게스트 모드로 자동 생성
        return render_template('quiz.html')

@learning_bp.route('/quiz-v1')
def quiz_v1():
    """Week2 퀴즈 페이지 - 게스트 모드 완전 지원"""
    
    # 게스트 세션이 있으면 바로 퀴즈 페이지로 진행
    if 'current_user_id' in session:
        return render_template('quiz_v1.0.html')
    else:
        # 세션이 없어도 게스트 모드로 자동 생성
        return render_template('quiz_v1.0.html')

# API 엔드포인트들도 게스트 모드 지원
@learning_bp.route('/api/learning/current-user')
def get_current_learning_user():
    """현재 학습 사용자 정보 - 게스트 모드 지원"""
    
    if 'current_user_id' not in session:
        return jsonify({'error': '세션 없음'}), 401
    
    return jsonify({
        'user_id': session.get('current_user_id'),
        'user_name': session.get('user_name', '게스트'),
        'is_guest': session.get('is_guest', True),
        'registration_date': session.get('registration_date'),
        'exam_subject': session.get('exam_subject'),
        'exam_date': session.get('exam_date')
    })

@learning_bp.route('/api/learning/stats')
def get_learning_stats():
    """학습 통계 - 게스트 모드 지원"""
    
    if 'current_user_id' not in session:
        return jsonify({'error': '세션 없음'}), 401
    
    # 게스트 모드 vs 실제 사용자 구분하여 통계 제공
    user_id = session.get('current_user_id')
    is_guest = session.get('is_guest', True)
    
    if is_guest:
        # 게스트 모드 통계 (체험용)
        return jsonify({
            'total_attempted': 0,
            'total_correct': 0,
            'accuracy_rate': 0.0,
            'study_days': 1,
            'mode': '체험 모드',
            'message': '정식 등록 후 정확한 통계가 제공됩니다'
        })
    else:
        # 실제 사용자 통계 (정식)
        # 실제 통계 서비스에서 데이터 가져오기
        return jsonify({
            'total_attempted': 0,
            'total_correct': 0,
            'accuracy_rate': 0.0,
            'study_days': 1,
            'mode': '정식 모드'
        })