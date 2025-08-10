# app_v1.7.py - ACIU S4 Week2 (설정 우회, 바로 대문)

from flask import Flask, render_template, redirect, url_for, session
import os

def create_app():
    """Flask 앱 생성"""
    app = Flask(__name__)
    
    # 앱 설정
    app.config['SECRET_KEY'] = 'aciu_season4_secret_key_2025'
    app.config['SESSION_PERMANENT'] = False
    
    # 통계 라우트만 등록 (기본학습에 필요)
    try:
        from routes.statistics_routes import statistics_bp
        app.register_blueprint(statistics_bp, url_prefix='/stats')
        print("✅ 통계 라우트 등록 완료")
    except ImportError as e:
        print(f"⚠️ 통계 라우트 import 실패: {e}")
    
    # 메인 라우트들
    @app.route('/')
    def index():
        """홈 페이지 - 바로 대문으로"""
        # 임시 사용자 세션 생성 (설정 우회)
        if not session.get('current_user_id'):
            session['current_user_id'] = 'temp_user_001'
            session['user_name'] = '임시사용자'
            print("임시 사용자 세션 생성")
        
        return redirect(url_for('home'))
    
    @app.route('/home')
    def home():
        """대문 페이지"""
        current_user_id = session.get('current_user_id')
        
        # 세션이 없으면 생성
        if not current_user_id:
            session['current_user_id'] = 'temp_user_001'
            session['user_name'] = '임시사용자'
            current_user_id = 'temp_user_001'
        
        return f"""
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ACIU S4 - 대문</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 min-h-screen">
            <div class="container mx-auto px-4 py-8">
                <!-- 헤더 -->
                <header class="text-center mb-8">
                    <h1 class="text-4xl font-bold text-blue-600 mb-2">ACIU QUIZ</h1>
                    <p class="text-gray-600">보험중개사 자격증 학습 시스템 - Season 4</p>
                    <p class="text-sm text-green-600">사용자: {session.get('user_name', '임시사용자')} (ID: {current_user_id})</p>
                </header>

                <!-- 대문 메인 메뉴 -->
                <div class="bg-white rounded-lg shadow-md p-8">
                    <h2 class="text-2xl font-semibold mb-6 text-center">학습 메뉴</h2>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- 기본학습 -->
                        <a href="/basic-learning" class="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-lg text-center transition-all transform hover:scale-105">
                            <div class="text-4xl mb-4">📚</div>
                            <h3 class="text-xl font-semibold mb-2">기본학습</h3>
                            <p class="text-sm opacity-90">전체 문제를 대상으로 한 학습</p>
                            <p class="text-xs mt-2">이어풀기 • 처음풀기 • 랜덤풀기</p>
                        </a>
                        
                        <!-- 대분류학습 -->
                        <a href="/category-learning" class="bg-green-500 hover:bg-green-600 text-white p-6 rounded-lg text-center transition-all transform hover:scale-105">
                            <div class="text-4xl mb-4">📋</div>
                            <h3 class="text-xl font-semibold mb-2">대분류학습</h3>
                            <p class="text-sm opacity-90">카테고리별 집중 학습</p>
                            <p class="text-xs mt-2">재산보험 • 특종보험 • 배상책임 • 해상보험</p>
                        </a>
                        
                        <!-- 통계 -->
                        <a href="/statistics" class="bg-purple-500 hover:bg-purple-600 text-white p-6 rounded-lg text-center transition-all transform hover:scale-105">
                            <div class="text-4xl mb-4">📊</div>
                            <h3 class="text-xl font-semibold mb-2">통계</h3>
                            <p class="text-sm opacity-90">학습 진도 및 성과 분석</p>
                            <p class="text-xs mt-2">진도율 • 정답률 • 예상점수</p>
                        </a>
                        
                        <!-- 설정 -->
                        <a href="/settings" class="bg-gray-500 hover:bg-gray-600 text-white p-6 rounded-lg text-center transition-all transform hover:scale-105">
                            <div class="text-4xl mb-4">⚙️</div>
                            <h3 class="text-xl font-semibold mb-2">설정</h3>
                            <p class="text-sm opacity-90">사용자 설정 및 데이터 관리</p>
                            <p class="text-xs mt-2">Week3에서 구현 예정</p>
                        </a>
                    </div>
                    
                    <!-- 임시 정보 -->
                    <div class="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h4 class="font-semibold text-yellow-800 mb-2">📌 개발 진행 상황</h4>
                        <ul class="text-sm text-yellow-700 space-y-1">
                            <li>✅ <strong>기본학습</strong>: 완료 (누적/금일 통계 포함)</li>
                            <li>🔄 <strong>대분류학습</strong>: Week2 Step3에서 구현</li>
                            <li>🔄 <strong>통계</strong>: Week2 Step4에서 구현</li>
                            <li>⏳ <strong>설정</strong>: Week3에서 구현</li>
                        </ul>
                    </div>
                    
                    <!-- 디버그 정보 (개발용) -->
                    <div class="mt-4 text-center">
                        <button onclick="clearSession()" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm">
                            세션 초기화 (개발용)
                        </button>
                    </div>
                </div>
            </div>
            
            <script>
                function clearSession() {{
                    if (confirm('세션을 초기화하시겠습니까?')) {{
                        fetch('/clear-session', {{method: 'POST'}})
                            .then(() => window.location.reload());
                    }}
                }}
                
                console.log('ACIU S4 대문 페이지 로드 완료');
                console.log('현재 세션:', '{current_user_id}');
            </script>
        </body>
        </html>
        """
    
    @app.route('/basic-learning')
    def basic_learning():
        """기본학습 페이지"""
        current_user_id = session.get('current_user_id')
        
        # 세션이 없으면 생성
        if not current_user_id:
            session['current_user_id'] = 'temp_user_001'
            session['user_name'] = '임시사용자'
        
        # basic_learning.html 템플릿 사용
        if os.path.exists('templates/basic_learning.html'):
            return render_template('basic_learning.html')
        else:
            return f"""
            <!DOCTYPE html>
            <html lang="ko">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>ACIU S4 - 기본학습</title>
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="bg-gray-100 min-h-screen">
                <div class="container mx-auto px-4 py-8">
                    <div class="bg-white rounded-lg shadow-md p-8">
                        <h1 class="text-2xl font-bold text-red-600 mb-4">❌ 기본학습 파일 없음</h1>
                        <p class="text-gray-600 mb-4">templates/basic_learning.html 파일을 생성해주세요.</p>
                        <p class="text-sm text-gray-500 mb-6">사용자 ID: {session.get('current_user_id')}</p>
                        <a href="/home" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">홈으로 돌아가기</a>
                    </div>
                </div>
            </body>
            </html>
            """
    
    @app.route('/category-learning')
    def category_learning():
        """대분류학습 페이지"""
        current_user_id = session.get('current_user_id')
        
        if not current_user_id:
            session['current_user_id'] = 'temp_user_001'
            session['user_name'] = '임시사용자'
        
        return f"""
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ACIU S4 - 대분류학습</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 min-h-screen">
            <div class="container mx-auto px-4 py-8">
                <div class="bg-white rounded-lg shadow-md p-8">
                    <h1 class="text-2xl font-bold text-green-600 mb-4">📋 대분류학습</h1>
                    <p class="text-gray-600 mb-4">카테고리별 집중 학습 기능입니다.</p>
                    <p class="text-sm text-blue-600 mb-6">🔄 Week2 Step3에서 구현 예정</p>
                    <p class="text-sm text-gray-500 mb-6">사용자 ID: {session.get('current_user_id')}</p>
                    <a href="/home" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">홈으로 돌아가기</a>
                </div>
            </div>
        </body>
        </html>
        """
    
    @app.route('/statistics')
    def statistics():
        """통계 페이지"""
        current_user_id = session.get('current_user_id')
        
        if not current_user_id:
            session['current_user_id'] = 'temp_user_001'
            session['user_name'] = '임시사용자'
        
        return f"""
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ACIU S4 - 통계</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 min-h-screen">
            <div class="container mx-auto px-4 py-8">
                <div class="bg-white rounded-lg shadow-md p-8">
                    <h1 class="text-2xl font-bold text-purple-600 mb-4">📊 통계</h1>
                    <p class="text-gray-600 mb-4">학습 진도 및 성과 분석 기능입니다.</p>
                    <p class="text-sm text-blue-600 mb-6">🔄 Week2 Step4에서 구현 예정</p>
                    <p class="text-sm text-gray-500 mb-6">사용자 ID: {session.get('current_user_id')}</p>
                    <a href="/home" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">홈으로 돌아가기</a>
                </div>
            </div>
        </body>
        </html>
        """
    
    @app.route('/settings')
    def settings():
        """설정 페이지"""
        current_user_id = session.get('current_user_id')
        
        if not current_user_id:
            session['current_user_id'] = 'temp_user_001'
            session['user_name'] = '임시사용자'
        
        return f"""
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ACIU S4 - 설정</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 min-h-screen">
            <div class="container mx-auto px-4 py-8">
                <div class="bg-white rounded-lg shadow-md p-8">
                    <h1 class="text-2xl font-bold text-gray-600 mb-4">⚙️ 설정</h1>
                    <p class="text-gray-600 mb-4">사용자 설정 및 데이터 관리 기능입니다.</p>
                    <p class="text-sm text-blue-600 mb-6">⏳ Week3에서 구현 예정</p>
                    <p class="text-sm text-gray-500 mb-6">사용자 ID: {session.get('current_user_id')}</p>
                    <a href="/home" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">홈으로 돌아가기</a>
                </div>
            </div>
        </body>
        </html>
        """
    
    @app.route('/clear-session', methods=['POST'])
    def clear_session():
        """세션 초기화 (개발용)"""
        session.clear()
        return {'success': True}
    
    # 에러 핸들러
    @app.errorhandler(404)
    def page_not_found(e):
        return f"""
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <title>ACIU S4 - 404</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 min-h-screen flex items-center justify-center">
            <div class="bg-white rounded-lg shadow-md p-8 text-center">
                <h1 class="text-2xl font-bold text-red-600 mb-4">404 - 페이지를 찾을 수 없습니다</h1>
                <a href="/" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">홈으로 가기</a>
            </div>
        </body>
        </html>
        """, 404
    
    @app.errorhandler(500)
    def internal_server_error(e):
        return f"""
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <title>ACIU S4 - 500</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 min-h-screen flex items-center justify-center">
            <div class="bg-white rounded-lg shadow-md p-8 text-center">
                <h1 class="text-2xl font-bold text-red-600 mb-4">500 - 서버 오류</h1>
                <p class="text-gray-600 mb-4">{str(e)}</p>
                <a href="/" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">홈으로 가기</a>
            </div>
        </body>
        </html>
        """, 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    
    # 개발 모드 설정
    debug_mode = True
    port = 5000
    
    print("="*60)
    print("🚀 ACIU Season 4 Week 2 서버 시작 (v1.7 - 바로 대문)")
    print(f"📍 URL: http://localhost:{port}")
    print(f"🔧 디버그 모드: {debug_mode}")
    print("📋 주요 기능:")
    print("   • / → 바로 대문으로 리다이렉트")
    print("   • /home → 대문 (임시 사용자 자동 생성)")
    print("   • /basic-learning → 기본학습 (templates/basic_learning.html)")
    print("   • /category-learning → 대분류학습 (Step3 예정)")
    print("   • /statistics → 통계 (Step4 예정)")
    print("   • /settings → 설정 (Week3 예정)")
    print("⚠️  설정 기능 우회: 임시 사용자로 자동 로그인")
    print("="*60)
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug_mode
    )