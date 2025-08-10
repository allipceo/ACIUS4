# app_v1.5_updated.py - AICU S4 Week2 메인 앱 (세션 문제 해결)

from flask import Flask, render_template, redirect, url_for, session
import os
from datetime import timedelta
import sys

# 프로젝트 루트 디렉토리를 PYTHONPATH에 추가
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__))))

# Blueprint import
from routes.user_registration_v2 import user_registration_bp
from routes.user_routes import user_bp
from routes.quiz_routes import quiz_routes
from routes.stats_routes import stats_routes

def create_app():
    """Flask 앱 생성"""
    app = Flask(__name__)
    
    # 앱 설정 강화 (세션 문제 해결)
    app.config['SECRET_KEY'] = 'aicu_season4_secret_key_2025_enhanced'
    app.config['SESSION_PERMANENT'] = True
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    
    # Blueprint 등록
    app.register_blueprint(user_registration_bp, url_prefix='/user')
    app.register_blueprint(user_bp, url_prefix='/api')
    app.register_blueprint(quiz_routes, url_prefix='/quiz')
    app.register_blueprint(stats_routes, url_prefix='/stats')

    # 세션 체크 함수
    def check_user_session():
        """사용자 세션 체크 및 디버깅"""
        user_id = session.get('current_user_id')
        print(f"🔍 세션 체크 - 사용자 ID: {user_id}")
        print(f"🔍 전체 세션: {dict(session)}")
        return user_id
    
    # 메인 라우트들
    @app.route('/')
    def index():
        """홈 페이지 - 사용자 등록 여부 확인 후 대문으로"""
        print("=== 홈페이지 접속 ===")
        current_user_id = check_user_session()
        
        if current_user_id:
            print(f"✅ 로그인된 사용자 확인: {current_user_id} → 대문으로 이동")
            return redirect(url_for('home'))
        else:
            print("❌ 세션 없음 → 등록 페이지로 이동")
            return redirect(url_for('user_registration.register_page'))
    
    @app.route('/home')
    def home():
        """대문 페이지 - 메인 대시보드"""
        print("=== 대문 페이지 접속 ===")
        current_user_id = check_user_session()
        
        # 세션이 없는 경우에도 임시로 접근 허용 (개발 단계)
        if not current_user_id:
            print("⚠️ 세션 없음 - 임시 접근 허용 (개발 모드)")
            current_user_id = "guest_user"
        
        # 시즌1 index.html이 있다면 사용, 없다면 대문 화면
        if os.path.exists('templates/index.html'):
            return render_template('index.html')
        else:
            # 대문 화면 HTML (시즌1 스타일 + 개선)
            return f"""
            <!DOCTYPE html>
            <html lang="ko">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>AICU S4 - 대문</title>
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="bg-gray-100 min-h-screen">
                <div class="container mx-auto px-4 py-8">
                    <!-- 헤더 -->
                    <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <div class="flex justify-between items-center">
                            <h1 class="text-3xl font-bold text-blue-600">AICU Season 4</h1>
                            <div class="text-sm text-gray-600">
                                <span class="bg-green-100 px-2 py-1 rounded">사용자: {current_user_id}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 세션 상태 표시 (개발용) -->
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <h3 class="text-sm font-medium text-yellow-800 mb-2">🔧 개발 정보</h3>
                        <div class="text-xs text-yellow-700">
                            <p>현재 시각: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                            <p>세션 상태: {'✅ 활성' if current_user_id != 'guest_user' else '❌ 게스트 모드'}</p>
                            <p>대문 접근: ✅ 성공</p>
                        </div>
                    </div>
                    
                    <!-- 통계 박스 (3개) -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <!-- 1. 보유문제수 현황 -->
                        <div class="bg-white rounded-lg shadow-lg p-6">
                            <h3 class="text-lg font-semibold mb-4 text-blue-600">📊 보유문제수 현황</h3>
                            <div class="text-center">
                                <div class="text-3xl font-bold text-blue-600">1,370</div>
                                <div class="text-sm text-gray-600">전체 문제수</div>
                            </div>
                        </div>
                        
                        <!-- 2. 학습진도 현황 -->
                        <div class="bg-white rounded-lg shadow-lg p-6">
                            <h3 class="text-lg font-semibold mb-4 text-green-600">📈 학습진도 현황</h3>
                            <div class="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <div class="text-xl font-bold text-green-600">0</div>
                                    <div class="text-xs text-gray-600">완료문제</div>
                                </div>
                                <div>
                                    <div class="text-xl font-bold text-orange-600">0%</div>
                                    <div class="text-xs text-gray-600">정답율</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 3. 금일 학습현황 -->
                        <div class="bg-white rounded-lg shadow-lg p-6">
                            <h3 class="text-lg font-semibold mb-4 text-purple-600">📅 금일 학습현황</h3>
                            <div class="grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <div class="text-lg font-bold text-blue-600">0</div>
                                    <div class="text-xs text-gray-600">총문제</div>
                                </div>
                                <div>
                                    <div class="text-lg font-bold text-green-600">0</div>
                                    <div class="text-xs text-gray-600">정답수</div>
                                </div>
                                <div>
                                    <div class="text-lg font-bold text-orange-600">0%</div>
                                    <div class="text-xs text-gray-600">정답율</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 내비게이션 -->
                    <nav class="flex justify-center mt-8">
                        <a href="/basic-learning" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg mr-4">
                            기본학습
                        </a>
                        <a href="/statistics" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg">
                            통계
                        </a>
                    </nav>
                </div>
            </body>
            </html>
            """
    
    @app.route('/basic-learning')
    def basic_learning():
        """기본학습 페이지"""
        current_user_id = check_user_session()
        if not current_user_id:
            return redirect(url_for('user_registration.register_page'))
        
        return render_template('basic_learning.html')
    
    @app.route('/category-learning')
    def category_learning():
        """대분류학습 페이지"""
        current_user_id = check_user_session()
        if not current_user_id:
            return redirect(url_for('user_registration.register_page'))
        
        return f"""
        <h1>대분류학습</h1>
        <p>사용자 ID: {current_user_id}</p>
        <p>Step 3에서 구현 예정</p>
        <a href="/home">홈으로</a>
        """
    
    @app.route('/statistics')
    def statistics():
        """통계 페이지"""
        current_user_id = check_user_session()
        if not current_user_id:
            return redirect(url_for('user_registration.register_page'))
        
        return f"""
        <h1>통계</h1>
        <p>사용자 ID: {current_user_id}</p>
        <p>Step 4에서 구현 예정</p>
        <a href="/home">홈으로</a>
        """
    
    @app.route('/settings')
    def settings():
        """설정 페이지 (사용자 정보 수정)"""
        current_user_id = check_user_session()
        if not current_user_id:
            return redirect(url_for('user_registration.register_page'))
        
        # user_registration_v2.0.py의 register_page로 리다이렉트
        return redirect(url_for('user_registration.register_page', mode='edit'))
    
    # 에러 핸들러
    @app.errorhandler(404)
    def page_not_found(e):
        return f"<h1>404 - 페이지를 찾을 수 없습니다</h1><a href='/'>홈으로</a>", 404
    
    @app.errorhandler(500)
    def internal_server_error(e):
        print(f"❌ 서버 내부 오류: {str(e)}")
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
    print("   • /home → 대문 페이지")
    print("   • /basic-learning → 기본학습 페이지")
    print("   • /statistics → 통계 페이지")
    print("   • /settings → 설정 페이지")
    print("="*60)
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug_mode
    )
