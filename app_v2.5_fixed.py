# app_v2.5.py - AICU S4 게스트 모드 자동 등록 및 라우팅 수정 버전

from flask import Flask, render_template, redirect, url_for, session, jsonify, make_response, request
from datetime import timedelta, datetime
import sys
import os
import time

def create_app():
    """AICU S4 v2.5 - 게스트 모드 자동 등록 및 라우팅 수정 버전"""
    app = Flask(__name__)
    
    # 앱 설정 강화 (세션 문제 해결)
    app.config['SECRET_KEY'] = 'aicu_season4_secret_key_2025_guest_mode'
    app.config['SESSION_PERMANENT'] = True
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    
    # Blueprint 등록
    register_blueprints(app)
    register_error_handlers(app)
    
    # 메인 라우트 (조대표님 시나리오 반영)
    @app.route('/')
    def index():
        """홈페이지 - 세션 없을 경우 '게스트'로 자동 등록 후 홈으로 리다이렉트"""
        print("=== 홈페이지 접속 ===")
        if 'current_user_id' not in session:
            guest_id = f"guest_{int(time.time())}"
            session.update({
                'current_user_id': guest_id,
                'user_name': '게스트',
                'registration_date': '2025-08-10',
                'exam_subject': 'ACIU',
                'exam_date': '2025-09-13',
                'is_guest': True,
                'guest_start_time': datetime.now().isoformat()
            })
            session.permanent = True
            print(f"✅ '게스트' 세션 자동 생성 완료: {guest_id}")
            
        return redirect(url_for('home.home_page'))

    # 게스트 → 실제 사용자 전환 API (기존 유지)
    @app.route('/api/user/register-from-guest', methods=['POST'])
    def register_from_guest():
        """게스트에서 실제 사용자로 전환"""
        data = request.get_json()
        
        if not session.get('is_guest'):
            return jsonify({'error': '게스트 모드가 아닙니다'}), 400
        
        # 게스트 통계 데이터 백업 (향후 활용)
        guest_stats = {
            'guest_id': session['current_user_id'],
            'guest_period': session.get('guest_start_time'),
            'guest_data': '게스트 기간 학습 데이터'
        }
        
        # 새로운 실제 사용자 정보 생성
        new_user_id = f"user_{int(time.time())}"
        registration_date = datetime.now().strftime('%Y-%m-%d')
        
        # 세션 업데이트
        session.update({
            'current_user_id': new_user_id,
            'user_name': data['name'],
            'registration_date': registration_date,
            'exam_subject': data['exam_subject'],
            'exam_date': data['exam_date'],
            'is_guest': False,
            'guest_period_stats': guest_stats
        })
        
        print(f"✅ 게스트→실사용자 전환: {session['current_user_id']}")
        
        return jsonify({
            'success': True,
            'message': f'{data["name"]}님으로 정식 등록되었습니다!',
            'new_user_id': new_user_id,
            'guest_stats_preserved': True
        })
    
    # 현재 사용자 정보 API (게스트 모드 지원)
    @app.route('/api/user/current')
    def get_current_user():
        """현재 사용자 정보 반환 (게스트 모드 포함)"""
        return jsonify({
            'user_id': session.get('current_user_id'),
            'user_name': session.get('user_name'),
            'registration_date': session.get('registration_date'),
            'exam_subject': session.get('exam_subject'),
            'exam_date': session.get('exam_date'),
            'is_guest': session.get('is_guest', False),
            'guest_start_time': session.get('guest_start_time')
        })
    
    # 세션 강제 초기화 (기존 유지)
    @app.route('/api/debug/clear-session')
    def clear_session_api():
        """모든 세션 정보를 강제로 삭제하는 디버그용 API"""
        print("=== 세션 강제 초기화 API 호출 ===")
        session.clear()
        response = make_response(jsonify({'success': True, 'message': '모든 세션이 삭제되었습니다.'}))
        response.delete_cookie(app.config['SESSION_COOKIE_NAME'])
        return response

    return app

def register_blueprints(app):
    """Blueprint 등록 - 안정적이고 명확한 방법"""
    
    try:
        from routes.quiz_routes import register_quiz_blueprints
        register_quiz_blueprints(app)
        print("✅ Week2 퀴즈 API 등록 성공 (Lego 모델 방식)")
    except ImportError as e:
        print(f"⚠️ Week2 퀴즈 API 등록 실패: {e}")
    
    try:
        from routes.user_registration_v2 import user_registration_bp
        app.register_blueprint(user_registration_bp, url_prefix='/user')
        print("✅ 사용자 등록 라우트 (v2) 활용")
    except ImportError:
        print("⚠️ user_registration_v2 없음")
    
    try:
        from routes.user_routes import user_bp
        app.register_blueprint(user_bp, url_prefix='/api')
        print("✅ 사용자 API 라우트 활용")
    except ImportError:
        print("⚠️ user_routes 없음")
    
    try:
        from routes.home_routes import home_bp
        app.register_blueprint(home_bp)
        print("✅ 홈 라우트 등록")
    except ImportError:
        print("❌ 홈 라우트 없음")
    
    try:
        from routes.learning_routes import learning_bp
        app.register_blueprint(learning_bp)
        print("✅ 학습 라우트 등록")
    except ImportError:
        print("❌ 학습 라우트 없음")
    
    try:
        from routes.settings_routes import settings_bp
        app.register_blueprint(settings_bp)
        print("✅ 설정 라우트 등록")
    except ImportError:
        print("❌ 설정 라우트 없음")
    
    @app.route('/large-category-learning')
    def large_category_learning():
        return render_template('large_category_learning.html')
    
    @app.route('/stats-test')
    def stats_test():
        return render_template('stats_test.html')

    @app.route('/advanced-stats-test')
    def advanced_stats_test():
        return render_template('advanced_stats_test.html')
    
    @app.route('/phase4-real-user-test')
    def phase4_real_user_test():
        return render_template('phase4_real_user_test.html')
    
    @app.route('/phase5-final-optimization')
    def phase5_final_optimization():
        return render_template('phase5_final_optimization.html')

def register_error_handlers(app):
    """에러 핸들러 등록"""
    
    @app.errorhandler(404)
    def not_found(error):
        return render_template('404.html'), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return render_template('500.html'), 500

# Flask 앱 생성
if __name__ == '__main__':
    app = create_app()
    print("=" * 60)
    print("🚀 AICU S4 v2.5 FINAL (통계 시스템 연동 문제 해결)")
    print("📍 URL: http://localhost:5000")
    print("📋 v2.5 개선 사항:")
    print("   ✅ before_request 로직 수정")
    print("   ✅ 세션 충돌 문제 해결")
    print("   ✅ API 경로 및 라우팅 문제 해결")
    print("   ✅ 사용자 등록 시나리오 개선")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
