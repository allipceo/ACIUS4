# app_v3.5.py - 문제 로딩 해결 완료 버전
# v3.5의 변경사항을 우선으로 하여 충돌 해결

from flask import Flask
from datetime import timedelta

def create_app():
    """v3.5 문제 로딩 해결 완료 버전"""
    app = Flask(__name__)
    
    # 기본 설정 (v3.5 설정 유지)
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
    """Blueprint 등록 - v3.5 문제 로딩 해결 완료"""
    
    # =============================================================
    # v3.5 문제 로딩 해결된 API 등록
    # =============================================================
    try:
        from routes.quiz_routes import quiz_bp
        app.register_blueprint(quiz_bp, url_prefix='/api/quiz')
        print("✅ v3.5 퀴즈 API 등록 성공 (문제 로딩 해결 완료)")
    except ImportError as e:
        print(f"❌ v3.5 퀴즈 API 로드 실패: {e}")
    
    # =============================================================
    # 기존 사용자 관리 Blueprint (v3.5 유지)
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
    # 페이지 Blueprint (v3.5 유지)
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

def register_error_handlers(app):
    """간단한 에러 핸들러"""
    @app.errorhandler(404)
    def not_found(error):
        return "<h1>404 - 페이지를 찾을 수 없습니다</h1><a href='/home'>🏠 대문으로</a>", 404
    
    @app.errorhandler(500)
    def internal_error(error):
        print(f"❌ 서버 내부 오류: {str(error)}")
        return f"<h1>500 - 서버 오류</h1><a href='/home'>🏠 대문으로</a><br><pre>{str(error)}</pre>", 500

if __name__ == '__main__':
    app = create_app()
    print("="*60)
    print("🚀 AICU S4 v3.5 (문제 로딩 해결 완료)")
    print("📍 URL: http://localhost:5000")
    print("📋 v3.5 특징:")
    print("   ✅ 기본학습 문제 로딩 완전 해결")
    print("   ✅ 대분류 학습 문제 로딩 완전 해결")
    print("   ✅ UI/UX 개선 완료")
    print("   ✅ 안정적인 베이스라인 확보")
    print("="*60)
    app.run(host='0.0.0.0', port=5000, debug=True)
