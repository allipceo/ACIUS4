# app_v1.8_simple.py - 파일명 변경 후 간단 버전

from flask import Flask
from datetime import timedelta

def create_app():
    """간단하고 확실한 Week2 API 통합"""
    app = Flask(__name__)
    
    # 기본 설정 (app_v1.7.py 설정 완전 복사)
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
    """Blueprint 등록 - 간단하고 확실한 방법"""
    
    # =============================================================
    # Week2 퀴즈 API 추가 (V1_0을 메인으로 사용)
    # =============================================================
    try:
        from routes.quiz_routes import quiz_bp
        app.register_blueprint(quiz_bp, url_prefix='/api/quiz')
        print("✅ Week2 퀴즈 API 등록 성공 (V1_0 메인)")
    except ImportError as e:
        print(f"❌ Week2 퀴즈 API 로드 실패: {e}")
        print("📋 확인사항:")
        print("   1. routes/quiz_routes.py 파일 존재하는가?")
        print("   2. 파일 내에 quiz_bp가 정의되어 있는가?")
    
    # =============================================================
    # 기존 사용자 관리 Blueprint (v1.7 유지)
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
    # 페이지 Blueprint (v1.7 유지)
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
    print("🚀 AICU S4 v1.8 SIMPLE (파일명 수정 버전)")
    print("📍 URL: http://localhost:5000")
    print("📋 v1.8 Simple 특징:")
    print("   ✅ 파일명 변경: quiz_routes_V1.0.py → quiz_routes_V1_0.py")
    print("   ✅ 간단하고 확실한 import 방식")
    print("   ✅ 복잡한 동적 로딩 제거")
    print("   ✅ Week2 API 직접 연결")
    print("="*60)
    app.run(host='0.0.0.0', port=5000, debug=True)