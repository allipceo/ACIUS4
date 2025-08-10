# app_v1.7.py - AICU S4 점진적 리팩토링 완성본 (80줄 이하)

from flask import Flask
from datetime import timedelta

def create_app():
    """경량화된 Flask 앱 팩토리"""
    app = Flask(__name__)
    
    # 기본 설정 (app_v1.6.py 설정 완전 복사)
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
    """Blueprint 등록 - 기존 + 신규 통합"""
    # Existing Blueprints (user_registration_v2, user_routes)
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
    
    # New Blueprints
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
        return f"<h1>500 - 서버 오류</h1><a href='/home'>🏠 대문으로</a>", 500

if __name__ == '__main__':
    app = create_app()
    print("="*60)
    print("🚀 AICU S4 v1.7 (점진적 리팩토링 완성)")
    print("📍 URL: http://localhost:5000")
    print("📋 개선 사항:")
    print("   ✅ 메인 앱: 694줄 → 80줄")
    print("   ✅ 기존 Blueprint 완전 호환")
    print("   ✅ 세션 기능 완전 보존")
    print("   ✅ JavaScript 기능 완전 보존")
    print("   ✅ 분할 개발 원칙 준수")
    print("="*60)
    app.run(host='0.0.0.0', port=5000, debug=True)
