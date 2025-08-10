# app_v1.5_fixed.py - AICU S4 Week2 메인 앱 (대문 우선 + 설정 분리)

from flask import Flask, render_template, redirect, url_for, session
import os

def create_app():
    """Flask 앱 생성"""
    app = Flask(__name__)
    
    # 앱 설정
    app.config['SECRET_KEY'] = 'aicu_season4_secret_key_2025'
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
    
    # 메인 라우트들 수정
    @app.route('/')
    def index():
        """홈 페이지 - 사용자 등록 여부 확인 후 바로 대문으로"""
        current_user_id = session.get('current_user_id')
        print(f"홈 페이지 접속 - 세션 사용자: {current_user_id}")
        
        if current_user_id:
            # 등록된 사용자 - 바로 대문으로 리다이렉트
            return redirect(url_for('home'))
        else:
            # 미등록 사용자 - 등록 페이지로
            return redirect(url_for('user_registration.register_page'))
    
    @app.route('/home')
    def home():
        """대문 페이지 - 메인 대시보드"""
        current_user_id = session.get('current_user_id')
        if not current_user_id:
            return redirect(url_for('user_registration.register_page'))
        
        # 시즌1 index.html이 있다면 사용, 없다면 대문 화면
        if os.path.exists('templates/index.html'):
            return render_template('index.html')
        else:
            # 대문 화면 HTML (시즌1 스타일)
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
                                사용자: {current_user_id}
                            </div>
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
                    
                    <!-- 메인 메뉴 버튼들 -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <!-- 기본학습 -->
                        <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                             onclick="location.href='/basic-learning'">
                            <div class="text-center">
                                <div class="text-4xl mb-4">📚</div>
                                <h3 class="text-xl font-bold text-blue-600 mb-2">기본학습</h3>
                                <p class="text-sm text-gray-600">전체 문제 학습</p>
                            </div>
                        </div>
                        
                        <!-- 대분류학습 -->
                        <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                             onclick="location.href='/category-learning'">
                            <div class="text-center">
                                <div class="text-4xl mb-4">🎯</div>
                                <h3 class="text-xl font-bold text-green-600 mb-2">대분류학습</h3>
                                <p class="text-sm text-gray-600">카테고리별 학습</p>
                            </div>
                        </div>
                        
                        <!-- 통계 -->
                        <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                             onclick="location.href='/statistics'">
                            <div class="text-center">
                                <div class="text-4xl mb-4">📊</div>
                                <h3 class="text-xl font-bold text-purple-600 mb-2">통계</h3>
                                <p class="text-sm text-gray-600">학습 통계 분석</p>
                            </div>
                        </div>
                        
                        <!-- 설정 -->
                        <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                             onclick="location.href='/settings'">
                            <div class="text-center">
                                <div class="text-4xl mb-4">⚙️</div>
                                <h3 class="text-xl font-bold text-gray-600 mb-2">설정</h3>
                                <p class="text-sm text-gray-600">사용자 정보 관리</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 하단 메뉴 -->
                    <div class="mt-8 bg-white rounded-lg shadow-lg p-4">
                        <div class="flex justify-center space-x-4 text-sm">
                            <a href="/user/api/debug/users" class="text-blue-600 hover:underline">디버그: 사용자 정보 확인</a>
                            <span class="text-gray-300">|</span>
                            <a href="/user/api/users/logout" onclick="fetch(this.href, {{method:'POST'}}); window.location.reload(); return false;" 
                               class="text-red-600 hover:underline">로그아웃</a>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """
    
    @app.route('/basic-learning')
    def basic_learning():
        """기본학습 페이지"""
        current_user_id = session.get('current_user_id')
        if not current_user_id:
            return redirect(url_for('user_registration.register_page'))
        
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
        current_user_id = session.get('current_user_id')
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
        """설정 페이지 - 사용자 정보 수정"""
        current_user_id = session.get('current_user_id')
        if not current_user_id:
            return redirect(url_for('user_registration.register_page'))
        
        # 설정 화면은 user_registration.html을 edit 모드로 사용
        try:
            return render_template('user_registration.html', mode='edit')
        except:
            # 템플릿이 없는 경우 간단한 설정 화면
            return f"""
            <!DOCTYPE html>
            <html lang="ko">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>설정 - AICU S4</title>
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="bg-gray-100 min-h-screen">
                <div class="container mx-auto px-4 py-8">
                    <div class="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
                        <h1 class="text-2xl font-bold text-center text-blue-600 mb-6">사용자 설정</h1>
                        
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">현재 사용자 ID</label>
                            <div class="p-3 bg-gray-100 rounded border">{current_user_id}</div>
                        </div>
                        
                        <div class="space-y-4">
                            <button onclick="location.href='/user/api/debug/users'" 
                                    class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                                사용자 정보 확인
                            </button>
                            
                            <button onclick="if(confirm('정말로 로그아웃 하시겠습니까?')) {{ fetch('/user/api/users/logout', {{method:'POST'}}); window.location.href='/'; }}" 
                                    class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                                로그아웃
                            </button>
                            
                            <button onclick="location.href='/home'" 
                                    class="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
                                대문으로 돌아가기
                            </button>
                        </div>
                        
                        <div class="mt-6 text-center text-sm text-gray-500">
                            <p>추가 설정 기능은 향후 업데이트에서 제공됩니다.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """
    
    # 에러 핸들러
    @app.errorhandler(404)
    def page_not_found(e):
        return f"<h1>404 - 페이지를 찾을 수 없습니다</h1><a href='/home'>대문으로</a>", 404
    
    @app.errorhandler(500)
    def internal_server_error(e):
        return f"<h1>500 - 서버 오류</h1><p>{str(e)}</p><a href='/home'>대문으로</a>", 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    
    # 개발 모드 설정
    debug_mode = True
    port = 5000
    
    print("="*60)
    print("🚀 AICU Season 4 Week 2 서버 시작 (대문 우선)")
    print(f"📍 URL: http://localhost:{port}")
    print(f"🔧 디버그 모드: {debug_mode}")
    print("📋 등록된 라우트:")
    print("   • / → 사용자 확인 후 대문으로 리다이렉트")
    print("   • /home → 대문 화면 (메인 대시보드)")
    print("   • /settings → 설정 화면 (대문에서 접근)")
    print("   • /user/register → 사용자 등록 페이지")
    print("   • /user/api/users/register → 등록 API")
    print("   • /user/api/debug/users → 디버그용 데이터 조회")
    print("="*60)
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug_mode
    )