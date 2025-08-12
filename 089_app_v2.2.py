# app_v2.1.py - 코코치 제안 최종 안정화 버전

from flask import Flask, render_template, redirect, url_for, session, jsonify, make_response
from datetime import timedelta, datetime
import sys
import os

def create_app():
    """AICU S4 최종 안정화 버전"""
    app = Flask(__name__)
    
    # 앱 설정 강화 (세션 문제 해결)
    app.config['SECRET_KEY'] = 'aicu_season4_secret_key_2025_enhanced'
    app.config['SESSION_PERMANENT'] = True
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    
    # Blueprint 등록
    register_blueprints(app)
    register_error_handlers(app)
    
    # 코코치 수정: @app.before_request 로직 제거
    # 홈 라우트에서 세션 유무를 직접 판단
    
    # 메인 라우트
    @app.route('/')
    def index():
        """홈페이지 - 세션 존재 시 /home, 미존재 시 /user/register로 리다이렉트"""
        if 'current_user_id' in session:
            return redirect(url_for('home.home_page'))
        else:
            return redirect(url_for('user_registration.register_page'))
    
    # 코코치 추가: 세션 강제 초기화 엔드포인트
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
    
    # =============================================================
    # Week2 퀴즈 API 추가 (명시적 파일 지정)
    # =============================================================
    try:
        from routes.quiz_routes import register_quiz_blueprints
        register_quiz_blueprints(app)
        print("✅ Week2 퀴즈 API 등록 성공 (Lego 모델 방식)")
    except ImportError as e:
        print(f"⚠️ Week2 퀴즈 API 등록 실패: {e}")
        try:
            from routes.quiz_routes_backup import quiz_bp
            app.register_blueprint(quiz_bp, url_prefix='/api/quiz')
            print("✅ Week2 퀴즈 API fallback 성공 (quiz_routes_backup.py)")
        except ImportError as e2:
            print(f"❌ Week2 퀴즈 API fallback도 실패: {e2}")
    
    # =============================================================
    # 기존 사용자 관리 Blueprint (v2.0 유지)
    # =============================================================
    try:
        from routes.user_registration_v2 import user_registration_bp
        app.register_blueprint(user_registration_bp, url_prefix='/user')
        print("✅ 기존 사용자 등록 라우트 (v2) 활용")
    except ImportError:
        print("⚠️ user_registration_v2 없음")
    
    try:
        from routes.user_routes import user_bp
        app.register_blueprint(user_bp, url_prefix='/api')
        print("✅ 기존 사용자 API 라우트 활용")
    except ImportError:
        print("⚠️ user_routes 없음")
    
    # =============================================================
    # 페이지 Blueprint (v2.0 유지)
    # =============================================================
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
    
    # =============================================================
    # 기타 라우트들 (Phase 3, 4, 5)
    # =============================================================
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
    print("🚀 AICU S4 v2.1 FINAL (최종 안정화 버전)")
    print("📍 URL: http://localhost:5000")
    print("📋 v2.1 특징:")
    print("   ✅ before_request 로직 제거")
    print("   ✅ 세션 충돌 문제 근본적 해결")
    print("   ✅ 안정성 및 가독성 향상")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
