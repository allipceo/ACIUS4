# quiz_test_app.py
# 문제풀이 기능 통합 테스트용 Flask 앱
# 조대표님 검증용 독립 실행 앱

from flask import Flask, render_template
import sys
import os

# 프로젝트 루트 경로 추가
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def create_test_app():
    """문제풀이 기능 테스트용 Flask 앱 생성"""
    app = Flask(__name__)
    
    # 기본 설정
    app.config['SECRET_KEY'] = 'quiz_test_secret_key_2025'
    app.config['DEBUG'] = True
    
    # 세션 설정 (조대표님 자동 로그인)
    @app.before_request
    def setup_session():
        from flask import session
        if 'current_user_id' not in session:
            session['current_user_id'] = '조대표'
            session.permanent = True
    
    # 메인 퀴즈 페이지
    @app.route('/')
    def index():
        return render_template('quiz_v1.0.html')
    
    @app.route('/quiz')
    def quiz_page():
        return render_template('quiz_v1.0.html')
    
    # 퀴즈 API Blueprint 등록
    try:
        from routes.quiz_routes_V1_0 import quiz_bp
        app.register_blueprint(quiz_bp)
        print("✅ 퀴즈 API Blueprint 등록 성공")
    except ImportError as e:
        print(f"⚠️ 퀴즈 API Blueprint 등록 실패: {e}")
        print("💡 routes/quiz_routes_V1_0.py 파일을 확인해주세요")
    
    # 에러 핸들러
    @app.errorhandler(404)
    def not_found(error):
        return f"<h1>404 - 페이지를 찾을 수 없습니다</h1><p><a href='/'>메인으로 돌아가기</a></p>", 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return f"<h1>500 - 서버 오류</h1><p>오류: {error}</p><p><a href='/'>메인으로 돌아가기</a></p>", 500
    
    # 테스트용 디버그 라우트
    @app.route('/debug')
    def debug_info():
        """디버그 정보 표시"""
        debug_info = {
            'registered_routes': [],
            'templates_folder': app.template_folder,
            'static_folder': app.static_folder,
            'session_data': {}
        }
        
        # 등록된 라우트 정보
        for rule in app.url_map.iter_rules():
            debug_info['registered_routes'].append({
                'endpoint': rule.endpoint,
                'methods': list(rule.methods),
                'rule': rule.rule
            })
        
        # 세션 정보
        try:
            from flask import session
            debug_info['session_data'] = dict(session)
        except:
            debug_info['session_data'] = {'error': '세션 정보 없음'}
        
        # HTML 응답 생성
        html = """
        <html>
        <head><title>퀴즈 앱 디버그 정보</title></head>
        <body>
            <h1>퀴즈 앱 디버그 정보</h1>
            <h2>등록된 라우트:</h2>
            <ul>
        """
        
        for route in debug_info['registered_routes']:
            html += f"<li><strong>{route['rule']}</strong> - {route['methods']} ({route['endpoint']})</li>"
        
        html += f"""
            </ul>
            <h2>설정 정보:</h2>
            <p>Templates 폴더: {debug_info['templates_folder']}</p>
            <p>Static 폴더: {debug_info['static_folder']}</p>
            <h2>세션 정보:</h2>
            <pre>{debug_info['session_data']}</pre>
            <h2>테스트 링크:</h2>
            <ul>
                <li><a href="/">메인 퀴즈 페이지</a></li>
                <li><a href="/api/quiz/health">API 상태 확인</a></li>
                <li><a href="/quiz">퀴즈 페이지 (별칭)</a></li>
            </ul>
        </body>
        </html>
        """
        
        return html
    
    return app

def test_services():
    """서비스 연동 상태 테스트"""
    print("=== 서비스 연동 상태 테스트 ===")
    
    try:
        from services.quiz_data_service_v1 import get_quiz_data_service
        data_service = get_quiz_data_service()
        questions = data_service.load_all_questions()
        print(f"✅ 데이터 서비스: {len(questions)}개 문제 로드 성공")
    except Exception as e:
        print(f"❌ 데이터 서비스 오류: {e}")
    
    try:
        from services.quiz_session_service import get_quiz_session_service
        session_service = get_quiz_session_service()
        print("✅ 세션 서비스: 연결 성공")
    except Exception as e:
        print(f"❌ 세션 서비스 오류: {e}")
    
    try:
        from services.quiz_answer_service import get_quiz_answer_service
        answer_service = get_quiz_answer_service()
        print("✅ 답안 서비스: 연결 성공")
    except Exception as e:
        print(f"❌ 답안 서비스 오류: {e}")
    
    print("=== 테스트 완료 ===\n")

if __name__ == "__main__":
    print("🚀 AICU 시즌4 문제풀이 기능 통합 테스트 시작")
    print("=" * 50)
    
    # 서비스 연동 테스트
    test_services()
    
    # Flask 앱 생성 및 실행
    app = create_test_app()
    
    print("📡 Flask 서버 시작")
    print("🌐 브라우저에서 다음 URL로 접속하세요:")
    print("   - 메인 퀴즈: http://localhost:5000/")
    print("   - 디버그 정보: http://localhost:5000/debug")
    print("   - API 상태: http://localhost:5000/api/quiz/health")
    print("=" * 50)
    
    try:
        app.run(host='0.0.0.0', port=5000, debug=True)
    except KeyboardInterrupt:
        print("\n⏹️ 서버가 종료되었습니다.")
    except Exception as e:
        print(f"\n❌ 서버 실행 오류: {e}")
        print("💡 포트 5000이 사용 중일 수 있습니다. 다른 Flask 앱을 종료해보세요.")