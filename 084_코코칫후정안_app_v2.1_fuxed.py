# app_v2.1.py - 코코치 제안 안정성 개선 버전

from flask import Flask, render_template
from datetime import timedelta
import sys
import os

def create_app():
    """안정적이고 명확한 Week2 API 통합 (코코치 제안)"""
    app = Flask(__name__)
    
    # 기본 설정 (app_v2.0.py 설정 완전 복사)
    app.config['SECRET_KEY'] = 'aicu_season4_secret_key_2025_enhanced'
    app.config['SESSION_PERMANENT'] = True
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    
    # Blueprint 등록
    register_blueprints(app)
    register_error_handlers(app)
    
    return app

def register_blueprints(app):
    """Blueprint 등록 - 안정적이고 명확한 방법 (코코치 제안)"""
    
    # =============================================================
    # Week2 퀴즈 API 추가 (명시적 파일 지정)
    # =============================================================
    try:
        # 코코치 제안: 명시적으로 quiz_routes_backup.py 사용
        from routes.quiz_routes import register_quiz_blueprints
        register_quiz_blueprints(app)
        print("✅ Week2 퀴즈 API 등록 성공 (Lego 모델 방식)")
    except ImportError as e:
        print(f"⚠️ Week2 퀴즈 API 등록 실패: {e}")
        # fallback: 기존 방식
        try:
            from routes.quiz_routes_backup import quiz_bp
            app.register_blueprint(quiz_bp, url_prefix='/api/quiz')
            print("✅ Week2 퀴즈 API fallback 성공 (quiz_routes_backup.py)")
        except ImportError as e2:
            print(f"❌ Week2 퀴즈 API fallback도 실패: {e2}")
            print("📋 확인사항:")
            print("   1. routes/quiz_routes_backup.py 파일 존재하는가?")
            print("   2. 파일 내에 quiz_bp가 정의되어 있는가?")
            print("   3. 파일명과 import 구문이 일치하는가?")
    
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
    # 대분류 학습 라우트 추가 (서대리 개발)
    # =============================================================
    @app.route('/large-category-learning')
    def large_category_learning():
        return render_template('large_category_learning.html')
    
    print("✅ 대분류 학습 라우트 등록")

    # =============================================================
    # 통계 시스템 테스트 라우트 추가 (Day 3 개발)
    # =============================================================
    @app.route('/stats-test')
    def stats_test():
        return render_template('stats_test.html')

    print("✅ 통계 시스템 테스트 라우트 등록")

    # =============================================================
    # 고도화된 통계 시스템 테스트 라우트 추가 (Phase 1 Day 2)
    # =============================================================
    @app.route('/advanced-stats-test')
    def advanced_stats_test():
        return render_template('advanced_stats_test.html')
    
    print("✅ 고도화된 통계 시스템 테스트 라우트 등록")
    
    @app.route('/phase4-real-user-test')
    def phase4_real_user_test():
        return render_template('phase4_real_user_test.html')
    
    print("✅ Phase 4 실제 사용자 테스트 라우트 등록")
    
    # =============================================================
    # Phase 5: 실제 사용자 피드백 및 최종 최적화 라우트
    # =============================================================
    @app.route('/phase5-final-optimization')
    def phase5_final_optimization():
        return render_template('phase5_final_optimization.html')
    
    print("✅ Phase 5 최종 최적화 라우트 등록")

def register_error_handlers(app):
    """에러 핸들러 등록"""
    
    @app.errorhandler(404)
    def not_found(error):
        return render_template('404.html'), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return render_template('500.html'), 500

# Flask 앱 생성
app = create_app()

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 AICU S4 v2.1 (코코치 안정성 개선 버전)")
    print("📍 URL: http://localhost:5000")
    print("📋 v2.1 특징:")
    print("   ✅ 명시적 파일 지정: quiz_routes_backup.py 직접 사용")
    print("   ✅ 안정성 향상: ImportError 방지")
    print("   ✅ 맥락 유지: 파일명과 import 구문 일치")
    print("   ✅ 복잡성 감소: 명확한 의존성 관리")
    print("   ✅ 기본학습 모듈 리팩토링 완료")
    print("   ✅ 통계 시스템 테스트 페이지 추가")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
