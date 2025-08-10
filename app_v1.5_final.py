# app_v1.5_final.py - AICU S4 Week2 메인 앱 (완전한 세션 관리 + 수정 적용)

from flask import Flask, render_template, redirect, url_for, session, jsonify
import os
from datetime import timedelta, datetime
import sys

def create_app():
    """Flask 앱 생성"""
    app = Flask(__name__)
    
    # 앱 설정 강화 (세션 문제 해결)
    app.config['SECRET_KEY'] = 'aicu_season4_secret_key_2025_enhanced'
    app.config['SESSION_PERMANENT'] = True
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)  # 7일간 세션 유지
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    
    # Blueprint 등록 (수정된 import)
    try:
        from routes.user_registration_v2 import user_registration_bp  # 수정된 파일명
        app.register_blueprint(user_registration_bp, url_prefix='/user')
        print("✅ 사용자 등록 라우트 v2.0 등록 완료")
    except ImportError as e:
        print(f"⚠️ user_registration_v2 import 실패: {e}")
        try:
            from routes.user_registration import user_registration_bp
            app.register_blueprint(user_registration_bp, url_prefix='/user')
            print("✅ 사용자 등록 라우트 기본 버전 등록 완료")
        except ImportError as e2:
            print(f"❌ 사용자 등록 라우트 완전 실패: {e2}")
    
    # 기존 라우트들 (선택적 로드)
    try:
        from routes.user_routes import user_bp
        app.register_blueprint(user_bp, url_prefix='/api')
        print("✅ 기존 사용자 라우트 등록 완료")
    except ImportError:
        print("⚠️ user_routes 없음 (정상)")
    
    try:
        from routes.quiz_routes import quiz_routes
        app.register_blueprint(quiz_routes, url_prefix='/quiz')
        print("✅ 퀴즈 라우트 등록 완료")
    except ImportError:
        print("⚠️ quiz_routes 없음 (정상)")
    
    try:
        from routes.stats_routes import stats_routes
        app.register_blueprint(stats_routes, url_prefix='/stats')
        print("✅ 통계 라우트 등록 완료")
    except ImportError:
        print("⚠️ stats_routes 없음 (정상)")
    
    # 세션 체크 함수 강화
    def check_user_session():
        """사용자 세션 체크 및 강화된 디버깅"""
        current_user_id = session.get('current_user_id')
        session_data = dict(session)
        print(f"🔍 세션 체크 - 사용자 ID: {current_user_id}")
        print(f"🔍 전체 세션: {session_data}")
        print(f"🔑 세션 키 존재: {'current_user_id' in session}")
        print(f"💾 세션 영구: {session.permanent}")
        return current_user_id
    
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
            # 완전한 대문 화면 HTML 
            return f"""
            <!DOCTYPE html>
            <html lang="ko">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>AICU Season 4 - 대문</title>
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
                <div class="container mx-auto px-4 py-8">
                    <!-- 헤더 -->
                    <div class="text-center mb-8">
                        <h1 class="text-4xl font-bold text-blue-600 mb-2">🎓 AICU Season 4</h1>
                        <p class="text-gray-600">보험중개사 시험 준비 플랫폼</p>
                        <p class="text-sm text-blue-500 mt-2">사용자: <strong>{current_user_id}</strong></p>
                    </div>
                    
                    <!-- 통계 박스들 (조대표님 요구사항) -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <!-- 1. 보유문제수 현황 -->
                        <div class="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
                            <h3 class="text-lg font-semibold text-gray-800 mb-2">📊 보유문제수 현황</h3>
                            <div class="text-3xl font-bold text-blue-600 mb-1">1,370개</div>
                            <p class="text-sm text-gray-600">인스교재 + 중개사시험</p>
                            <div class="mt-2 text-xs text-green-600">✅ 고급버전 이용 중</div>
                        </div>
                        
                        <!-- 2. 학습진도 현황 -->
                        <div class="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
                            <h3 class="text-lg font-semibold text-gray-800 mb-2">📈 학습진도 현황</h3>
                            <div class="text-3xl font-bold text-green-600 mb-1">0.0%</div>
                            <p class="text-sm text-gray-600">완료: 0문제 / 전체: 1,370문제</p>
                            <div class="mt-2 text-xs text-blue-600">정답율: 0.0%</div>
                        </div>
                        
                        <!-- 3. 금일 학습현황 -->
                        <div class="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
                            <h3 class="text-lg font-semibold text-gray-800 mb-2">🎯 금일 학습현황</h3>
                            <div class="text-3xl font-bold text-purple-600 mb-1">0문제</div>
                            <p class="text-sm text-gray-600">정답: 0문제 / 오답: 0문제</p>
                            <div class="mt-2 text-xs text-purple-600">금일 정답율: 0.0%</div>
                        </div>
                    </div>
                    
                    <!-- 학습 모드 선택 -->
                    <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">📚 학습 모드 선택</h2>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- 기본학습 -->
                            <div class="border-2 border-blue-200 rounded-lg p-6 hover:border-blue-400 transition-colors">
                                <h3 class="text-xl font-bold text-blue-600 mb-3">📖 기본학습</h3>
                                <p class="text-gray-600 mb-4">전체 문제를 대상으로 한 종합 학습</p>
                                <div class="space-y-2">
                                    <button onclick="location.href='/basic-learning'" 
                                            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                                        이어풀기
                                    </button>
                                    <button onclick="location.href='/basic-learning'" 
                                            class="w-full bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded">
                                        처음풀기
                                    </button>
                                    <button onclick="location.href='/basic-learning'" 
                                            class="w-full bg-blue-300 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded">
                                        랜덤풀기
                                    </button>
                                </div>
                            </div>
                            
                            <!-- 대분류학습 -->
                            <div class="border-2 border-green-200 rounded-lg p-6 hover:border-green-400 transition-colors">
                                <h3 class="text-xl font-bold text-green-600 mb-3">🎯 대분류학습</h3>
                                <p class="text-gray-600 mb-4">카테고리별 집중 학습</p>
                                <div class="space-y-2">
                                    <button onclick="location.href='/category-learning'" 
                                            class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                                        재산보험
                                    </button>
                                    <button onclick="location.href='/category-learning'" 
                                            class="w-full bg-green-400 hover:bg-green-500 text-white font-bold py-2 px-4 rounded">
                                        특종보험
                                    </button>
                                    <button onclick="location.href='/category-learning'" 
                                            class="w-full bg-green-300 hover:bg-green-400 text-white font-bold py-2 px-4 rounded">
                                        배상책임보험
                                    </button>
                                    <button onclick="location.href='/category-learning'" 
                                            class="w-full bg-green-200 hover:bg-green-300 text-white font-bold py-2 px-4 rounded">
                                        해상보험
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 추가 메뉴 -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button onclick="location.href='/statistics'" 
                                class="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded">
                            📊 통계 및 분석
                        </button>
                        <button onclick="location.href='/settings'" 
                                class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded">
                            ⚙️ 설정
                        </button>
                        <button onclick="location.href='/user/api/debug/session'" 
                                class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded">
                            🔧 세션 디버그
                        </button>
                    </div>
                </div>
                
                <!-- 세션 상태 모니터링 -->
                <script>
                    // 5초마다 세션 상태 확인
                    setInterval(async () => {
                        try {{
                            const response = await fetch('/user/api/debug/session');
                            const result = await response.json();
                            console.log('세션 상태:', result.session_data ? '활성' : '비활성');
                        }} catch (error) {{
                            console.log('세션 확인 오류:', error);
                        }}
                    }}, 5000);
                </script>
            </body>
            </html>
            """
    
    # 세션 디버깅 API 추가
    @app.route('/api/debug/session')
    def debug_session():
        """세션 디버깅 API"""
        return jsonify({
            'session_id': session.get('_id'),
            'current_user_id': session.get('current_user_id'),
            'session_data': dict(session),
            'session_permanent': session.permanent,
            'session_keys': list(session.keys()),
            'timestamp': datetime.now().isoformat()
        })
    
    @app.route('/basic-learning')
    def basic_learning():
        """기본학습 페이지"""
        print("=== 기본학습 페이지 접속 ===")
        current_user_id = check_user_session()
        
        return f"""
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>기본학습 - AICU S4</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 min-h-screen">
            <div class="container mx-auto px-4 py-8">
                <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
                    <h1 class="text-2xl font-bold text-blue-600 mb-4">📚 기본학습</h1>
                    
                    <div class="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
                        <p class="text-blue-700">사용자 ID: <strong>{current_user_id or 'guest_user'}</strong></p>
                        <p class="text-sm text-blue-600 mt-2">전체 문제를 대상으로 한 학습 모드입니다.</p>
                    </div>
                    
                    <div class="space-y-4">
                        <div class="border border-orange-200 bg-orange-50 rounded p-4">
                            <h3 class="font-medium text-orange-800">🚧 개발 상태</h3>
                            <p class="text-sm text-orange-700 mt-1">Step 3에서 구현 예정</p>
                            <ul class="text-sm text-orange-600 mt-2 ml-4">
                                <li>• 시즌1 퀴즈 로직 통합</li>
                                <li>• 사용자별 진도 관리</li>
                                <li>• 실시간 통계 업데이트</li>
                            </ul>
                        </div>
                        
                        <button onclick="location.href='/home'" 
                                class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded">
                            🏠 대문으로 돌아가기
                        </button>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
    
    @app.route('/category-learning')
    def category_learning():
        """대분류학습 페이지"""
        print("=== 대분류학습 페이지 접속 ===")
        current_user_id = check_user_session()
        
        return f"""
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>대분류학습 - AICU S4</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 min-h-screen">
            <div class="container mx-auto px-4 py-8">
                <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
                    <h1 class="text-2xl font-bold text-green-600 mb-4">🎯 대분류학습</h1>
                    
                    <div class="bg-green-50 border border-green-200 rounded p-4 mb-6">
                        <p class="text-green-700">사용자 ID: <strong>{current_user_id or 'guest_user'}</strong></p>
                        <p class="text-sm text-green-600 mt-2">카테고리별 집중 학습 모드입니다.</p>
                    </div>
                    
                    <div class="space-y-4">
                        <div class="border border-orange-200 bg-orange-50 rounded p-4">
                            <h3 class="font-medium text-orange-800">🚧 개발 상태</h3>
                            <p class="text-sm text-orange-700 mt-1">Step 3에서 구현 예정</p>
                            <ul class="text-sm text-orange-600 mt-2 ml-4">
                                <li>• 카테고리별 문제 분류</li>
                                <li>• 개별 통계 관리</li>
                                <li>• 과목별 점수 예측</li>
                            </ul>
                        </div>
                        
                        <button onclick="location.href='/home'" 
                                class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded">
                            🏠 대문으로 돌아가기
                        </button>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
    
    @app.route('/statistics')
    def statistics():
        """통계 및 분석 페이지"""
        print("=== 통계 페이지 접속 ===")
        current_user_id = check_user_session()
        
        return f"""
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>통계 및 분석 - AICU S4</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 min-h-screen">
            <div class="container mx-auto px-4 py-8">
                <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
                    <h1 class="text-2xl font-bold text-purple-600 mb-4">📊 통계 및 분석</h1>
                    
                    <div class="bg-purple-50 border border-purple-200 rounded p-4 mb-6">
                        <p class="text-purple-700">사용자 ID: <strong>{current_user_id or 'guest_user'}</strong></p>
                        <p class="text-sm text-purple-600 mt-2">학습 통계 및 분석 정보를 제공합니다.</p>
                    </div>
                    
                    <div class="space-y-4">
                        <div class="border border-orange-200 bg-orange-50 rounded p-4">
                            <h3 class="font-medium text-orange-800">🚧 개발 상태</h3>
                            <p class="text-sm text-orange-700 mt-1">Step 4에서 구현 예정</p>
                            <ul class="text-sm text-orange-600 mt-2 ml-4">
                                <li>• 실시간 합격 예측 시스템</li>
                                <li>• 과목별 점수 분석</li>
                                <li>• 학습 패턴 분석</li>
                                <li>• 취약점 리포트</li>
                            </ul>
                        </div>
                        
                        <button onclick="location.href='/home'" 
                                class="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded">
                            🏠 대문으로 돌아가기
                        </button>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
    
    @app.route('/settings')
    def settings():
        """설정 페이지 - 조대표님 기본 정보 자동 입력"""
        print("=== 설정 페이지 접속 ===")
        current_user_id = check_user_session()
        
        # 조대표님 기본 정보
        from datetime import datetime
        
        def calculate_d_day():
            exam_date = datetime.strptime("2025-09-13", "%Y-%m-%d")
            today = datetime.now()
            days_left = (exam_date - today).days
            return max(0, days_left)
        
        d_day = calculate_d_day()
        
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
                <div class="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
                    <h1 class="text-2xl font-bold text-gray-600 mb-6">⚙️ 사용자 설정</h1>
                    
                    <!-- 사용자 기본 정보 -->
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <h2 class="text-xl font-bold text-blue-800 mb-4">👤 사용자 정보</h2>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">이름</label>
                                <input type="text" value="조대표" readonly
                                       class="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                                <input type="text" value="010-2067-6442" readonly
                                       class="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">시험일자</label>
                                <input type="text" value="2025년 9월 13일" readonly
                                       class="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">D-Day</label>
                                <input type="text" value="D-{d_day}" readonly
                                       class="w-full px-3 py-2 bg-red-100 border border-red-300 rounded-md font-bold text-red-600">
                            </div>
                        </div>
                        
                        <div class="mt-4 p-3 bg-green-100 border border-green-300 rounded">
                            <p class="text-green-800 text-sm">
                                ✅ <strong>고급버전</strong> 이용 중 (전체 1,370문제 이용 가능)
                            </p>
                        </div>
                    </div>
                    
                    <!-- 학습 설정 -->
                    <div class="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                        <h2 class="text-xl font-bold text-green-800 mb-4">📚 학습 설정</h2>
                        
                        <div class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">일일 목표 문제수</label>
                                    <select class="w-full px-3 py-2 border border-gray-300 rounded-md">
                                        <option value="30">30문제</option>
                                        <option value="50" selected>50문제 (권장)</option>
                                        <option value="70">70문제</option>
                                        <option value="100">100문제</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">선호 학습시간</label>
                                    <select class="w-full px-3 py-2 border border-gray-300 rounded-md">
                                        <option value="morning">오전 (09:00-12:00)</option>
                                        <option value="afternoon" selected>오후 (13:00-18:00)</option>
                                        <option value="evening">저녁 (19:00-22:00)</option>
                                        <option value="all">하루 종일</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="space-y-2">
                                <label class="flex items-center">
                                    <input type="checkbox" checked class="mr-2">
                                    <span class="text-gray-700">자동 로그인 유지</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" checked class="mr-2">
                                    <span class="text-gray-700">학습 알림 받기</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" checked class="mr-2">
                                    <span class="text-gray-700">일일 목표 달성 알림</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 시험 정보 -->
                    <div class="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                        <h2 class="text-xl font-bold text-purple-800 mb-4">📅 시험 정보</h2>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="text-center p-4 bg-white rounded border">
                                <div class="text-2xl font-bold text-purple-600">D-{d_day}</div>
                                <div class="text-sm text-gray-600">시험까지 남은 일수</div>
                            </div>
                            
                            <div class="text-center p-4 bg-white rounded border">
                                <div class="text-2xl font-bold text-blue-600">{round(1370/max(d_day, 1), 1)}</div>
                                <div class="text-sm text-gray-600">일일 필요 문제수</div>
                            </div>
                            
                            <div class="text-center p-4 bg-white rounded border">
                                <div class="text-2xl font-bold text-green-600">0.0%</div>
                                <div class="text-sm text-gray-600">현재 진도율</div>
                            </div>
                        </div>
                        
                        <div class="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
                            <p class="text-yellow-800 text-sm">
                                💡 <strong>학습 권장사항:</strong> 하루 {round(1370/max(d_day, 1))}문제씩 풀면 시험 전 완주 가능합니다.
                            </p>
                        </div>
                    </div>
                    
                    <!-- 데이터 관리 -->
                    <div class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                        <h2 class="text-xl font-bold text-red-800 mb-4">🗂️ 데이터 관리</h2>
                        
                        <div class="space-y-3">
                            <button onclick="exportData()" 
                                    class="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2">
                                📁 학습 데이터 내보내기
                            </button>
                            
                            <button onclick="resetProgress()" 
                                    class="w-full md:w-auto bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded mr-2">
                                🔄 진도 초기화
                            </button>
                            
                            <button onclick="resetAll()" 
                                    class="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                                ❌ 모든 데이터 초기화
                            </button>
                        </div>
                        
                        <div class="mt-3 p-3 bg-red-100 border border-red-300 rounded">
                            <p class="text-red-800 text-sm">
                                ⚠️ 데이터 초기화는 되돌릴 수 없습니다. 신중히 선택해 주세요.
                            </p>
                        </div>
                    </div>
                    
                    <!-- 버튼들 -->
                    <div class="flex flex-col md:flex-row gap-4">
                        <button onclick="saveSettings()" 
                                class="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded">
                            💾 설정 저장
                        </button>
                        
                        <button onclick="location.href='/home'" 
                                class="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded">
                            🏠 대문으로 돌아가기
                        </button>
                    </div>
                    
                    <!-- 상태 메시지 -->
                    <div id="statusMessage" class="mt-4 text-center"></div>
                </div>
            </div>
            
            <script>
                function saveSettings() {{
                    document.getElementById('statusMessage').innerHTML = 
                        '<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">✅ 설정이 저장되었습니다!</div>';
                    
                    setTimeout(() => {{
                        document.getElementById('statusMessage').innerHTML = '';
                    }}, 3000);
                }}
                
                function exportData() {{
                    const data = {{
                        userName: "조대표",
                        phone: "010-2067-6442",
                        examDate: "2025-09-13",
                        exportDate: new Date().toISOString(),
                        statistics: "추후 구현"
                    }};
                    
                    const blob = new Blob([JSON.stringify(data, null, 2)], {{type: 'application/json'}});
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'aicu_data_조대표_' + new Date().toISOString().split('T')[0] + '.json';
                    a.click();
                    
                    document.getElementById('statusMessage').innerHTML = 
                        '<div class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">📁 데이터 내보내기 완료!</div>';
                    
                    setTimeout(() => {{
                        document.getElementById('statusMessage').innerHTML = '';
                    }}, 3000);
                }}
                
                function resetProgress() {{
                    if (confirm('진도를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {{
                        document.getElementById('statusMessage').innerHTML = 
                            '<div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">🔄 진도가 초기화되었습니다.</div>';
                        
                        setTimeout(() => {{
                            document.getElementById('statusMessage').innerHTML = '';
                        }}, 3000);
                    }}
                }}
                
                function resetAll() {{
                    if (confirm('모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {{
                        if (confirm('정말로 모든 학습 기록을 삭제하시겠습니까?')) {{
                            document.getElementById('statusMessage').innerHTML = 
                                '<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">❌ 모든 데이터가 초기화되었습니다.</div>';
                            
                            setTimeout(() => {{
                                location.href = '/user/register';
                            }}, 2000);
                        }}
                    }}
                }}
            </script>
        </body>
        </html>
        """
    
    # 에러 핸들러
    @app.errorhandler(404)
    def not_found(error):
        return f"""
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <title>404 - 페이지를 찾을 수 없습니다</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 min-h-screen flex items-center justify-center">
            <div class="bg-white p-8 rounded-lg shadow-lg text-center">
                <h1 class="text-3xl font-bold text-red-600 mb-4">404</h1>
                <p class="text-gray-600 mb-4">요청하신 페이지를 찾을 수 없습니다.</p>
                <a href="/home" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">🏠 대문으로</a>
            </div>
        </body>
        </html>
        """, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        print(f"❌ 서버 내부 오류: {str(error)}")
        return f"""
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <title>500 - 서버 오류</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 min-h-screen flex items-center justify-center">
            <div class="bg-white p-8 rounded-lg shadow-lg text-center">
                <h1 class="text-3xl font-bold text-red-600 mb-4">500</h1>
                <p class="text-gray-600 mb-4">서버 내부 오류가 발생했습니다: {str(error)}</p>
                <a href="/home" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">🏠 대문으로</a>
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
    print("🚀 AICU Season 4 Week 2 서버 시작 (수정된 버전)")
    print(f"📍 URL: http://localhost:{port}")
    print(f"🔧 디버그 모드: {debug_mode}")
    print("📋 수정 사항:")
    print("   ✅ user_registration_v2.py import 경로 수정")
    print("   ✅ 세션 체크 함수 강화 (디버깅 정보 추가)")
    print("   ✅ 세션 만료 시간 7일로 연장")
    print("   ✅ 세션 디버깅 API 추가")
    print("   ✅ 에러 핸들링 개선")
    print("="*60)
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug_mode
    )