from flask import Blueprint, render_template
from services.user_service import check_user_session

learning_bp = Blueprint('learning', __name__)

@learning_bp.route('/basic-learning')
def basic_learning():
    """기본학습 페이지"""
    print("=== 기본학습 페이지 접속 ===")
    current_user_id = check_user_session()
    
    # 원본 템플릿 사용
    return render_template('basic_learning.html', user_id=current_user_id)

@learning_bp.route('/category-learning') 
def category_learning():
    """대분류학습 페이지 - 기존 기능 보존"""
    print("=== 대분류학습 페이지 접속 ===")
    current_user_id = check_user_session()
    
    return render_existing_category_learning_html(current_user_id)

@learning_bp.route('/statistics')
def statistics():
    """통계 페이지 - 기존 기능 보존"""
    print("=== 통계 페이지 접속 ===")
    current_user_id = check_user_session()
    
    return render_existing_statistics_html(current_user_id)

# 임시 함수들 (STEP 3에서 템플릿으로 대체)
def render_existing_basic_learning_html(current_user_id):
    """임시 함수: 기존 기본학습 HTML 렌더링"""
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

def render_existing_category_learning_html(current_user_id):
    """임시 함수: 기존 대분류학습 HTML 렌더링"""
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

def render_existing_statistics_html(current_user_id):
    """임시 함수: 기존 통계 HTML 렌더링"""
    return f"""
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>통계 - AICU S4</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 min-h-screen">
        <div class="container mx-auto px-4 py-8">
            <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
                <h1 class="text-2xl font-bold text-purple-600 mb-4">📊 통계</h1>
                
                <div class="bg-purple-50 border border-purple-200 rounded p-4 mb-6">
                    <p class="text-purple-700">사용자 ID: <strong>{current_user_id or 'guest_user'}</strong></p>
                    <p class="text-sm text-purple-600 mt-2">학습 현황 및 성과 분석입니다.</p>
                </div>
                
                <div class="space-y-4">
                    <div class="border border-orange-200 bg-orange-50 rounded p-4">
                        <h3 class="font-medium text-orange-800">🚧 개발 상태</h3>
                        <p class="text-sm text-orange-700 mt-1">Step 3에서 구현 예정</p>
                        <ul class="text-sm text-orange-600 mt-2 ml-4">
                            <li>• 실시간 학습 통계</li>
                            <li>• 과목별 성과 분석</li>
                            <li>• 합격 예측 시스템</li>
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
