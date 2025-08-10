# app.py - ACIU S4 Week2 메인 앱 (기존 구조 기반)

from flask import Flask, render_template, redirect, url_for, session
import os

def create_app():
    """Flask 앱 생성"""
    app = Flask(__name__)
    
    # 앱 설정
    app.config['SECRET_KEY'] = 'aciu_season4_secret_key_2025'
    app.config['SESSION_PERMANENT'] = False
    
    # 사용자 등록 라우트 import 및 등록 (새 파일)
    try:
        from routes.user_registration import user_registration_bp
        app.register_blueprint(user_registration_bp, url_prefix='/user')
        print("✅ 사용자 등록 라우트 등록 완료")
    except ImportError as e:
        print(f"⚠️ 사용자 등록 라우트 import 실패: {e}")
    
    # 기존 사용자 라우트 (기존 기능 보존)
    try:
        from routes.user_routes import user_bp
        app.register_blueprint(user_bp, url_prefix='/api')
        print("✅ 기존 사용자 라우트 등록 완료")
    except ImportError as e:
        print(f"⚠️ 기존 사용자 라우트 import 실패: {e}")
    
    # 통계 라우트 (새 파일)
    try:
        from routes.statistics_routes import statistics_bp
        app.register_blueprint(statistics_bp, url_prefix='/stats')
        print("✅ 통계 라우트 등록 완료")
    except ImportError as e:
        print(f"⚠️ 통계 라우트 import 실패: {e}")
    
    # 기존 라우트들 (있다면)
    try:
        from routes.quiz_routes import quiz_routes
        app.register_blueprint(quiz_routes, url_prefix='/quiz')
        print("✅ 퀴즈 라우트 등록 완료")
    except ImportError:
        print("⚠️ 퀴즈 라우트 없음 (정상)")
    
    try:
        from routes.stats_routes import stats_routes
        app.register_blueprint(stats_routes, url_prefix='/stats')
        print("✅ 통계 라우트 등록 완료")
    except ImportError:
        print("⚠️ 통계 라우트 없음 (정상)")
    
    # 메인 라우트들
    @app.route('/')
    def index():
        """홈 페이지 - 사용자 등록 여부 확인"""
        current_user_id = session.get('current_user_id')
        print(f"홈 페이지 접속 - 세션 사용자: {current_user_id}")
        
        if current_user_id:
            # 등록된 사용자 - 메인 대시보드로
            return render_template('index.html') if os.path.exists('templates/index.html') else f"""
            <h1>환영합니다!</h1>
            <p>사용자 ID: {current_user_id}</p>
            <p>다음 단계: 기본학습과 대분류학습 화면 구현 예정</p>
            <a href="/user/api/debug/users">디버그: 사용자 정보 확인</a><br>
            <a href="/user/api/users/logout" onclick="fetch(this.href, {{method:'POST'}}); window.location.reload(); return false;">로그아웃</a>
            """
        else:
            # 미등록 사용자 - 등록 페이지로
            return redirect(url_for('user_registration.register_page'))
    
    @app.route('/home')
    def home():
        """대문 페이지"""
        current_user_id = session.get('current_user_id')
        if not current_user_id:
            return redirect(url_for('user_routes.register_page'))
        
        # 시즌1 index.html이 있다면 사용, 없다면 임시 페이지
        if os.path.exists('templates/index.html'):
            return render_template('index.html')
        else:
            return f"""
            <h1>ACIU S4 - 대문</h1>
            <p>사용자 ID: {current_user_id}</p>
            <ul>
                <li><a href="/basic-learning">기본학습</a></li>
                <li><a href="/category-learning">대분류학습</a></li>
                <li><a href="/statistics">통계</a></li>
                <li><a href="/settings">설정</a></li>
            </ul>
            """
    
    @app.route('/basic-learning')
    def basic_learning():
        """기본학습 페이지"""
        current_user_id = session.get('current_user_id')
        if not current_user_id:
            return redirect(url_for('user_routes.register_page'))
        
        return f"""
        <h1>기본학습</h1>
        <p>사용자 ID: {current_user_id}</p>
        <p>Step 2에서 구현 예정</p>
        <a href="/home">홈으로</a>
        """
    
    @app.route('/category-learning')
    def category_learning():
        """대분류학습 페이지"""
        current_user_id = session.get('current_user_id')
        if not current_user_id:
            return redirect(url_for('user_routes.register_page'))
        
        return f"""
        <h1>대분류학습</h1>
        <p>사용자 ID: {current_user_id}</p>
        <p>Step 3에서 구현 예정</p>
        <a href="/home">홈으로</a>
        """
    
    @app.route('/statistics')
    def statistics():
        """통계 페이지"""
        current_user_id = session.get('current_user_id')
        if not current_user_id:
            return redirect(url_for('user_routes.register_page'))
        
        return f"""
        <h1>통계</h1>
        <p>사용자 ID: {current_user_id}</p>
        <p>Step 4에서 구현 예정</p>
        <a href="/home">홈으로</a>
        """
    
    @app.route('/settings')
    def settings():
        """설정 페이지 (사용자 정보 수정)"""
        current_user_id = session.get('current_user_id')
        if not current_user_id:
            return redirect(url_for('user_routes.register_page'))
        
        return render_template('user_registration.html', mode='edit')
    
    # 에러 핸들러
    @app.errorhandler(404)
    def page_not_found(e):
        return f"<h1>404 - 페이지를 찾을 수 없습니다</h1><a href='/'>홈으로</a>", 404
    
    @app.errorhandler(500)
    def internal_server_error(e):
        return f"<h1>500 - 서버 오류</h1><p>{str(e)}</p><a href='/'>홈으로</a>", 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    
    # 개발 모드 설정
    debug_mode = True
    port = 5000
    
    print("="*60)
    print("🚀 ACIU Season 4 Week 2 서버 시작")
    print(f"📍 URL: http://localhost:{port}")
    print(f"🔧 디버그 모드: {debug_mode}")
    print("📋 등록된 라우트:")
    print("   • / → 홈페이지 (사용자 등록 확인)")
    print("   • /user/register → 사용자 등록 페이지")
    print("   • /user/api/users/register → 등록 API")
    print("   • /user/api/debug/users → 디버그용 데이터 조회")
    print("="*60)
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug_mode
    )
