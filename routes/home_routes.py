from flask import Blueprint, render_template, redirect, url_for, session, jsonify
from services.user_service import get_ceo_info, check_user_session
from datetime import datetime

home_bp = Blueprint('home', __name__)

@home_bp.route('/')
def index():
    """홈 페이지 - 조대표님 자동 로그인"""
    print("=== 홈페이지 접속 ===")
    current_user_id = check_user_session()
    
    # 조대표님 자동 로그인 (기존 로직 보존)
    if not current_user_id:
        session['current_user_id'] = 'user_jo_ceo_default'
        session['user_name'] = '조대표'
        session.permanent = True
        print("✅ 조대표님 자동 로그인 완료")
    
    return redirect(url_for('home.home_page'))

@home_bp.route('/home')
def home_page():
    """대문 페이지 - 통계 기능 통합"""
    print("=== 대문 페이지 접속 ===")
    current_user_id = check_user_session()
    ceo_info = get_ceo_info()
    
    # 통계 기능이 통합된 HTML 렌더링
    return render_home_with_stats_html(current_user_id, ceo_info)

@home_bp.route('/api/debug/session')
def debug_session():
    """세션 디버깅 API - 기존 기능 완전 보존"""
    return jsonify({
        'session_id': session.get('_id'),
        'current_user_id': session.get('current_user_id'),
        'session_data': dict(session),
        'session_permanent': session.permanent,
        'session_keys': list(session.keys()),
        'timestamp': datetime.now().isoformat()
    })

def render_home_with_stats_html(current_user_id, ceo_info):
    """통계 기능이 통합된 홈페이지 HTML 렌더링"""
    d_day = (datetime.strptime('2025-09-13', '%Y-%m-%d') - datetime.now()).days
    
    return f"""
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AICU Season 4 - 조대표님 전용</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <div class="container mx-auto px-4 py-8">
            <!-- 헤더 -->
            <div class="text-center mb-8">
                <h1 class="text-4xl font-bold text-blue-600 mb-2">🎓 AICU Season 4</h1>
                <p class="text-gray-600">보험중개사 시험 준비 플랫폼</p>
                <p class="text-sm text-blue-500 mt-2">사용자: <strong>조대표 (010-2067-6442)</strong></p>
                <p class="text-xs text-red-500 mt-1">🗓️ 시험일: 2025년 9월 13일 (D-{d_day})</p>
            </div>
            
            <!-- 통계 박스들 (동적 업데이트) -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <!-- 진행률 박스 -->
                <div id="home-progress-box" class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-blue-100 text-blue-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">학습 진도</p>
                            <p id="home-progress-text" class="text-lg font-semibold text-gray-900">로딩 중...</p>
                            <p id="home-accuracy-text" class="text-sm text-gray-600">정답률: 로딩 중...</p>
                        </div>
                    </div>
                </div>
                
                <!-- 총 시도/정답 박스 -->
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-green-100 text-green-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">총 학습 현황</p>
                            <p id="home-total-attempted" class="text-lg font-semibold text-gray-900">시도: 로딩 중...</p>
                            <p id="home-total-correct" class="text-sm text-gray-600">정답: 로딩 중...</p>
                        </div>
                    </div>
                </div>
                
                <!-- 오늘 통계 박스 -->
                <div id="home-today-box" class="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-purple-100 text-purple-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">오늘 학습</p>
                            <p id="home-today-summary" class="text-lg font-semibold text-gray-900">로딩 중...</p>
                            <p id="home-today-accuracy" class="text-sm text-gray-600">정답률: 로딩 중...</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 학습 모드 선택 -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer" onclick="location.href='/basic-learning'">
                    <div class="text-center">
                        <div class="text-4xl mb-4">📚</div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">기본학습</h3>
                        <p class="text-sm text-gray-600">전체 문제 학습</p>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer" onclick="location.href='/large-category-learning'">
                    <div class="text-center">
                        <div class="text-4xl mb-4">🎯</div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">대분류학습</h3>
                        <p class="text-sm text-gray-600">카테고리별 학습</p>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer" onclick="location.href='/statistics'">
                    <div class="text-center">
                        <div class="text-4xl mb-4">📊</div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">통계</h3>
                        <p class="text-sm text-gray-600">학습 현황 분석</p>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer" onclick="location.href='/settings'">
                    <div class="text-center">
                        <div class="text-4xl mb-4">⚙️</div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">설정</h3>
                        <p class="text-sm text-gray-600">사용자 정보 관리</p>
                    </div>
                </div>
            </div>
            
            <!-- 개발자 도구 영역 -->
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
                <h3 class="text-lg font-semibold text-gray-800 mb-3">🔧 개발자 도구</h3>
                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button onclick="location.href='/stats-test'" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-center">
                                    🧪 통계 시스템 테스트
                                </button>
                                <button onclick="location.href='/advanced-stats-test'" class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-center">
                                    🚀 고도화된 통계 테스트
                                </button>
                                <button onclick="location.href='/api/debug/session'" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-center">
                                    🔍 세션 디버그
                                </button>
                            </div>
            </div>
            
            <!-- 개발 정보 -->
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-yellow-800 mb-2">🔧 개발 정보</h3>
                <p class="text-sm text-yellow-700">현재 사용자 ID: <strong>{current_user_id or 'guest_user'}</strong></p>
                <p class="text-sm text-yellow-600 mt-1">세션 상태: {'활성' if current_user_id else '비활성'}</p>
                <p class="text-sm text-yellow-600 mt-1">통계 시스템: <span id="stats-status">초기화 중...</span></p>
            </div>
        </div>
        
        <!-- 통계 시스템 스크립트 로드 -->
        <script src="/static/js/progress_manager.js"></script>
        <script src="/static/js/stats_calculator.js"></script>
        <script src="/static/js/ui_updater.js"></script>
        <script src="/static/js/progress_system.js"></script>
        
        <!-- JavaScript - 통계 업데이트 및 세션 모니터링 -->
        <script>
            // 통계 시스템 초기화 및 업데이트
            document.addEventListener('DOMContentLoaded', function() {{
                console.log('🎯 홈페이지 통계 시스템 초기화 시작...');
                
                // ProgressSystem 초기화 대기
                setTimeout(() => {{
                    if (typeof progressSystem !== 'undefined') {{
                        // 시스템 초기화
                        const initResult = progressSystem.initialize();
                        if (initResult) {{
                            document.getElementById('stats-status').textContent = '활성';
                            document.getElementById('stats-status').className = 'text-sm text-green-600 mt-1';
                            
                            // 홈페이지 통계 업데이트
                            progressSystem.updateStats();
                            console.log('✅ 홈페이지 통계 업데이트 완료');
                        }} else {{
                            document.getElementById('stats-status').textContent = '초기화 실패';
                            document.getElementById('stats-status').className = 'text-sm text-red-600 mt-1';
                        }}
                    }} else {{
                        document.getElementById('stats-status').textContent = '모듈 로드 실패';
                        document.getElementById('stats-status').className = 'text-sm text-red-600 mt-1';
                    }}
                }}, 1000);
            }});
            
            // 5초마다 세션 상태 확인 (기존 기능 유지)
            setInterval(async () => {{
                try {{
                    const response = await fetch('/api/debug/session');
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
