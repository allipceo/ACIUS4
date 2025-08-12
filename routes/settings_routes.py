from flask import Blueprint, render_template
from services.user_service import check_user_session, get_ceo_info
from datetime import datetime

settings_bp = Blueprint('settings', __name__)

@settings_bp.route('/settings')
def settings():
    """설정 페이지 - 조대표님 기본 정보 자동 입력"""
    print("=== 설정 페이지 접속 ===")
    current_user_id = check_user_session()
    ceo_info = get_ceo_info()
    
    # 임시: 기존 f-string HTML 사용 (STEP 3에서 템플릿으로 변경)
    return render_existing_settings_html(current_user_id, ceo_info)

def render_existing_settings_html(current_user_id, ceo_info):
    """임시 함수: 기존 설정 HTML 렌더링 (STEP 3에서 제거 예정)"""
    d_day = ceo_info['days_left']
    
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
                            <div class="text-2xl font-bold text-blue-600">{ceo_info['daily_needed']}</div>
                            <div class="text-sm text-gray-600">일일 필요 문제수</div>
                        </div>
                        
                        <div class="text-center p-4 bg-white rounded border">
                            <div class="text-2xl font-bold text-green-600">0.0%</div>
                            <div class="text-sm text-gray-600">현재 진도율</div>
                        </div>
                    </div>
                    
                    <div class="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
                        <p class="text-yellow-800 text-sm">
                            💡 <strong>학습 권장사항:</strong> 하루 {ceo_info['daily_needed']}문제씩 풀면 시험 전 완주 가능합니다.
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
