from flask import Blueprint, render_template, jsonify, request
from services.user_service import check_user_session, get_ceo_info
from datetime import datetime

advanced_stats_bp = Blueprint('advanced_stats', __name__)

@advanced_stats_bp.route('/advanced-statistics')
def advanced_statistics():
    """고급 통계 페이지 - 카테고리별 상세 통계 및 학습 패턴 분석"""
    print("=== 고급 통계 페이지 접속 ===")
    current_user_id = check_user_session()
    ceo_info = get_ceo_info()
    
    # 고급 통계 기능이 통합된 HTML 렌더링
    return render_advanced_statistics_html(current_user_id, ceo_info)

@advanced_stats_bp.route('/api/advanced-stats/category/<category>')
def get_category_stats(category):
    """카테고리별 상세 통계 API"""
    try:
        # 실제로는 고급 통계 시스템에서 데이터를 가져와야 함
        # 현재는 더미 데이터 반환
        dummy_stats = {
            '재산보험': {
                'progressRate': 25.5,
                'accuracy': { 'total': 78.3, 'today': 82.1, 'weekly': 79.2 },
                'learningSpeed': 12.3,
                'goalAchievement': 65.2,
                'totalQuestions': 197
            },
            '특종보험': {
                'progressRate': 18.7,
                'accuracy': { 'total': 72.1, 'today': 75.8, 'weekly': 73.4 },
                'learningSpeed': 8.9,
                'goalAchievement': 45.6,
                'totalQuestions': 263
            },
            '배상보험': {
                'progressRate': 32.1,
                'accuracy': { 'total': 85.2, 'today': 88.7, 'weekly': 86.1 },
                'learningSpeed': 15.6,
                'goalAchievement': 78.9,
                'totalQuestions': 197
            },
            '해상보험': {
                'progressRate': 15.3,
                'accuracy': { 'total': 69.8, 'today': 71.2, 'weekly': 70.5 },
                'learningSpeed': 6.7,
                'goalAchievement': 38.4,
                'totalQuestions': 132
            }
        }
        
        if category in dummy_stats:
            return jsonify({
                'success': True,
                'data': dummy_stats[category]
            })
        else:
            return jsonify({
                'success': False,
                'message': '알 수 없는 카테고리입니다.'
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'카테고리 통계 조회 실패: {str(e)}'
        }), 500

@advanced_stats_bp.route('/api/advanced-stats/learning-patterns')
def get_learning_patterns():
    """학습 패턴 분석 API"""
    try:
        # 더미 학습 패턴 데이터
        patterns = {
            'timeBased': {
                'morning': 25,
                'afternoon': 45,
                'evening': 20,
                'night': 10
            },
            'dayBased': {
                'mon': 15,
                'tue': 18,
                'wed': 20,
                'thu': 16,
                'fri': 14,
                'sat': 12,
                'sun': 5
            },
            'consecutiveDays': 7,
            'recommendations': [
                '오후 시간대에 학습 집중도가 높습니다.',
                '수요일과 목요일에 학습량이 많습니다.',
                '일요일 학습량이 적으니 주의가 필요합니다.'
            ]
        }
        
        return jsonify({
            'success': True,
            'data': patterns
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'학습 패턴 조회 실패: {str(e)}'
        }), 500

@advanced_stats_bp.route('/api/advanced-stats/goals')
def get_goals():
    """목표 달성률 API"""
    try:
        # 더미 목표 데이터
        goals = {
            'daily': { 'target': 50, 'achieved': 42, 'rate': 84.0 },
            'weekly': { 'target': 350, 'achieved': 298, 'rate': 85.1 },
            'monthly': { 'target': 1400, 'achieved': 1156, 'rate': 82.6 }
        }
        
        return jsonify({
            'success': True,
            'data': goals
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'목표 달성률 조회 실패: {str(e)}'
        }), 500

@advanced_stats_bp.route('/api/advanced-stats/weak-areas')
def get_weak_areas():
    """취약 영역 분석 API"""
    try:
        # 더미 취약 영역 데이터
        weak_areas = {
            'frequentMistakes': [
                { 'category': '해상보험', 'accuracy': 69.8, 'improvement': '정답률 향상 필요' },
                { 'category': '특종보험', 'accuracy': 72.1, 'improvement': '정답률 향상 필요' }
            ],
            'strengths': [
                { 'category': '배상보험', 'accuracy': 85.2, 'strength': '우수한 성과' },
                { 'category': '재산보험', 'accuracy': 78.3, 'strength': '우수한 성과' }
            ],
            'improvementPriority': [
                { 'category': '해상보험', 'priority': '높음', 'recommendation': '집중 학습 필요' },
                { 'category': '특종보험', 'priority': '보통', 'recommendation': '보완 학습 권장' },
                { 'category': '재산보험', 'priority': '낮음', 'recommendation': '유지 관리' },
                { 'category': '배상보험', 'priority': '낮음', 'recommendation': '유지 관리' }
            ]
        }
        
        return jsonify({
            'success': True,
            'data': weak_areas
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'취약 영역 분석 조회 실패: {str(e)}'
        }), 500

# AI 추천 API
@advanced_stats_bp.route('/api/ai/recommendations', methods=['GET'])
def get_ai_recommendations():
    """AI 기반 개인화 추천 제공"""
    try:
        # 실제 구현에서는 AI 추천 엔진에서 데이터를 가져와야 함
        return jsonify({
            'success': True,
            'recommendations': [
                {'id': 'Q001', 'category': '재산보험', 'difficulty': 'medium', 'title': 'AI 추천 문제 1', 'reason': '취약 영역 기반'},
                {'id': 'Q045', 'category': '특종보험', 'difficulty': 'easy', 'title': 'AI 추천 문제 2', 'reason': '학습 패턴 기반'},
                {'id': 'Q123', 'category': '배상보험', 'difficulty': 'hard', 'title': 'AI 추천 문제 3', 'reason': '난이도별 추천'},
                {'id': 'Q078', 'category': '해상보험', 'difficulty': 'medium', 'title': 'AI 추천 문제 4', 'reason': '카테고리 균형'},
                {'id': 'Q156', 'category': '재산보험', 'difficulty': 'easy', 'title': 'AI 추천 문제 5', 'reason': '개인화 추천'}
            ],
            'reason': '개인화된 학습 패턴 및 취약 영역 기반 추천',
            'confidence': 0.85,
            'weakAreas': [
                {'category': '재산보험', 'accuracy': 65, 'priority': 'high'},
                {'category': '특종보험', 'accuracy': 72, 'priority': 'medium'}
            ]
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@advanced_stats_bp.route('/api/ai/learning-path', methods=['GET', 'POST'])
def manage_learning_path():
    """적응형 학습 경로 관리"""
    try:
        return jsonify({
            'success': True,
            'currentPath': {
                'phase': 1,
                'targetDate': '2025-09-13',
                'daysUntilExam': 240,
                'milestones': [
                    {'id': 1, 'title': '기초 개념 완성', 'progress': 75, 'deadline': '2025-02-15', 'status': 'in_progress'},
                    {'id': 2, 'title': '핵심 이론 정리', 'progress': 0, 'deadline': '2025-04-15', 'status': 'pending'},
                    {'id': 3, 'title': '실전 문제 연습', 'progress': 0, 'deadline': '2025-06-15', 'status': 'pending'},
                    {'id': 4, 'title': '최종 점검 및 보완', 'progress': 0, 'deadline': '2025-08-15', 'status': 'pending'}
                ],
                'currentFocus': {'category': '재산보험', 'difficulty': 'medium', 'priority': 'high'},
                'overallProgress': 18.75
            },
            'achievements': {
                'overall': 18.75,
                'phase': {1: 75, 2: 0, 3: 0, 4: 0},
                'milestone': {1: 75, 2: 0, 3: 0, 4: 0},
                'category': {
                    '재산보험': 65,
                    '특종보험': 72,
                    '배상보험': 0,
                    '해상보험': 0
                }
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@advanced_stats_bp.route('/api/ai/predictions', methods=['GET'])
def get_predictions():
    """예측 분석 결과 제공"""
    try:
        return jsonify({
            'success': True,
            'examSuccess': {
                'probability': 75.5,
                'confidence': 0.8,
                'factors': {
                    'studyConsistency': 85,
                    'accuracy': 78,
                    'coverage': 65,
                    'timeManagement': 75,
                    'weakAreaManagement': 70
                },
                'recommendations': [
                    '정확도 향상을 위해 기초 개념 복습이 필요합니다.',
                    '학습 범위를 확대하여 더 많은 문제를 풀어보세요.',
                    '규칙적인 학습 습관을 기르는 것이 중요합니다.'
                ]
            },
            'learningPatterns': {
                'timeBased': {
                    'morning': {'efficiency': 0.8, 'accuracy': 78, 'count': 45},
                    'afternoon': {'efficiency': 0.7, 'accuracy': 75, 'count': 32},
                    'evening': {'efficiency': 0.6, 'accuracy': 72, 'count': 28},
                    'night': {'efficiency': 0.5, 'accuracy': 65, 'count': 15}
                },
                'dayBased': {
                    'mon': {'efficiency': 0.8, 'accuracy': 80, 'count': 25},
                    'tue': {'efficiency': 0.7, 'accuracy': 78, 'count': 22},
                    'wed': {'efficiency': 0.7, 'accuracy': 75, 'count': 20},
                    'thu': {'efficiency': 0.6, 'accuracy': 72, 'count': 18},
                    'fri': {'efficiency': 0.6, 'accuracy': 70, 'count': 15},
                    'sat': {'efficiency': 0.5, 'accuracy': 68, 'count': 12},
                    'sun': {'efficiency': 0.4, 'accuracy': 65, 'count': 8}
                },
                'consecutive': {
                    'consecutiveDays': 5,
                    'averageSessionLength': 45,
                    'restPatterns': ['주말 오후', '금요일 저녁'],
                    'longestStreak': 12,
                    'currentStreak': 5
                },
                'insights': [
                    '가장 효율적인 학습 시간은 morning입니다.',
                    'mon에 학습 효율성이 가장 높습니다.',
                    '규칙적인 학습 습관을 기르는 것이 중요합니다.'
                ]
            },
            'performanceForecast': {
                'nextWeek': {'expectedAccuracy': 82, 'expectedQuestions': 150, 'confidence': 0.8},
                'nextMonth': {'expectedAccuracy': 88, 'expectedQuestions': 600, 'confidence': 0.7},
                'nextQuarter': {'expectedAccuracy': 92, 'expectedQuestions': 1800, 'confidence': 0.6}
            },
            'optimalStudyTime': {
                'optimalTimeSlots': [
                    {
                        'timeSlot': '09:00-12:00',
                        'efficiency': 0.8,
                        'accuracy': 82,
                        'recommendation': '이 시간대에 학습하면 효율성이 높습니다.'
                    },
                    {
                        'timeSlot': '15:00-18:00',
                        'efficiency': 0.7,
                        'accuracy': 78,
                        'recommendation': '오후 학습 시간으로 적합합니다.'
                    }
                ],
                'recommendations': [
                    '09:00-12:00에 집중 학습을 권장합니다.',
                    '학습 세션은 60분, 휴식은 15분을 권장합니다.',
                    '주말에는 복습과 취약 영역 보완에 집중하세요.'
                ]
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@advanced_stats_bp.route('/api/ai/notifications', methods=['POST'])
def send_smart_notification():
    """스마트 알림 전송"""
    try:
        data = request.get_json()
        notification_type = data.get('type', 'study_reminder')
        user_id = data.get('userId', 'guest')
        
        # 실제 구현에서는 스마트 알림 시스템을 호출해야 함
        return jsonify({
            'success': True,
            'message': f'{notification_type} 알림이 성공적으로 전송되었습니다.',
            'notification': {
                'type': notification_type,
                'userId': user_id,
                'timestamp': datetime.now().isoformat(),
                'status': 'sent'
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@advanced_stats_bp.route('/api/ai/notifications/settings', methods=['GET', 'POST'])
def manage_notification_settings():
    """알림 설정 관리"""
    try:
        if request.method == 'GET':
            return jsonify({
                'success': True,
                'settings': {
                    'study_reminder': {'enabled': True, 'priority': 'medium'},
                    'goal_achievement': {'enabled': True, 'priority': 'high'},
                    'weak_area': {'enabled': True, 'priority': 'high'},
                    'learning_pattern': {'enabled': True, 'priority': 'medium'},
                    'exam_reminder': {'enabled': True, 'priority': 'high'},
                    'streak_reminder': {'enabled': True, 'priority': 'medium'}
                }
            })
        else:
            data = request.get_json()
            # 실제 구현에서는 설정을 저장해야 함
            return jsonify({
                'success': True,
                'message': '알림 설정이 업데이트되었습니다.',
                'settings': data
            })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

def render_advanced_statistics_html(current_user_id, ceo_info):
    """고급 통계 기능이 통합된 HTML 렌더링"""
    d_day = (datetime.strptime('2025-09-13', '%Y-%m-%d') - datetime.now()).days
    
    return f"""
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>고급 통계 - AICU S4</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    </head>
    <body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <div class="container mx-auto px-4 py-8">
            <!-- 헤더 -->
            <div class="text-center mb-8">
                <h1 class="text-4xl font-bold text-blue-600 mb-2">📊 고급 통계 분석</h1>
                <p class="text-gray-600">카테고리별 상세 통계 및 학습 패턴 분석</p>
                <p class="text-sm text-blue-500 mt-2">사용자: <strong>조대표 (010-2067-6442)</strong></p>
                <p class="text-xs text-red-500 mt-1">🗓️ 시험일: 2025년 9월 13일 (D-{d_day})</p>
            </div>
            
            <!-- 네비게이션 탭 -->
            <div class="bg-white rounded-lg shadow-md p-4 mb-8">
                <div class="flex flex-wrap gap-2" id="stats-tabs">
                    <button class="tab-button active bg-blue-500 text-white px-4 py-2 rounded-lg" data-tab="category-stats">
                        📈 카테고리별 통계
                    </button>
                    <button class="tab-button bg-gray-200 text-gray-700 px-4 py-2 rounded-lg" data-tab="learning-patterns">
                        🕒 학습 패턴
                    </button>
                    <button class="tab-button bg-gray-200 text-gray-700 px-4 py-2 rounded-lg" data-tab="goals">
                        🎯 목표 관리
                    </button>
                    <button class="tab-button bg-gray-200 text-gray-700 px-4 py-2 rounded-lg" data-tab="weak-areas">
                        ⚠️ 취약 영역
                    </button>
                    <button class="tab-button bg-gray-200 text-gray-700 px-4 py-2 rounded-lg" data-tab="ai-recommendations">
                        🤖 AI 추천
                    </button>
                </div>
            </div>
            
            <!-- 탭 콘텐츠 -->
            <div id="tab-content">
                <!-- 카테고리별 통계 탭 -->
                <div id="category-stats" class="tab-content active">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <!-- 재산보험 카드 -->
                        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                            <h3 class="text-lg font-bold text-blue-800 mb-4">🏠 재산보험</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600">진도율:</span>
                                    <span class="font-semibold text-blue-600" id="property-progress">25.5%</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">정답률:</span>
                                    <span class="font-semibold text-green-600" id="property-accuracy">78.3%</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">학습속도:</span>
                                    <span class="font-semibold text-purple-600" id="property-speed">12.3문제/일</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">목표달성:</span>
                                    <span class="font-semibold text-orange-600" id="property-goal">65.2%</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 특종보험 카드 -->
                        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                            <h3 class="text-lg font-bold text-green-800 mb-4">🚗 특종보험</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600">진도율:</span>
                                    <span class="font-semibold text-blue-600" id="special-progress">18.7%</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">정답률:</span>
                                    <span class="font-semibold text-green-600" id="special-accuracy">72.1%</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">학습속도:</span>
                                    <span class="font-semibold text-purple-600" id="special-speed">8.9문제/일</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">목표달성:</span>
                                    <span class="font-semibold text-orange-600" id="special-goal">45.6%</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 배상보험 카드 -->
                        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                            <h3 class="text-lg font-bold text-purple-800 mb-4">⚖️ 배상보험</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600">진도율:</span>
                                    <span class="font-semibold text-blue-600" id="liability-progress">32.1%</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">정답률:</span>
                                    <span class="font-semibold text-green-600" id="liability-accuracy">85.2%</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">학습속도:</span>
                                    <span class="font-semibold text-purple-600" id="liability-speed">15.6문제/일</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">목표달성:</span>
                                    <span class="font-semibold text-orange-600" id="liability-goal">78.9%</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 해상보험 카드 -->
                        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                            <h3 class="text-lg font-bold text-red-800 mb-4">🚢 해상보험</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between">
                                    <span class="text-gray-600">진도율:</span>
                                    <span class="font-semibold text-blue-600" id="marine-progress">15.3%</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">정답률:</span>
                                    <span class="font-semibold text-green-600" id="marine-accuracy">69.8%</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">학습속도:</span>
                                    <span class="font-semibold text-purple-600" id="marine-speed">6.7문제/일</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">목표달성:</span>
                                    <span class="font-semibold text-orange-600" id="marine-goal">38.4%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 차트 영역 -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <h3 class="text-lg font-bold text-gray-800 mb-4">진도율 비교</h3>
                            <canvas id="progressChart" width="400" height="200"></canvas>
                        </div>
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <h3 class="text-lg font-bold text-gray-800 mb-4">정답률 비교</h3>
                            <canvas id="accuracyChart" width="400" height="200"></canvas>
                        </div>
                    </div>
                </div>
                
                <!-- 학습 패턴 탭 -->
                <div id="learning-patterns" class="tab-content hidden">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <h3 class="text-lg font-bold text-gray-800 mb-4">시간대별 학습 패턴</h3>
                            <canvas id="timePatternChart" width="400" height="200"></canvas>
                        </div>
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <h3 class="text-lg font-bold text-gray-800 mb-4">요일별 학습 패턴</h3>
                            <canvas id="dayPatternChart" width="400" height="200"></canvas>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow-md p-6 mt-6">
                        <h3 class="text-lg font-bold text-gray-800 mb-4">학습 패턴 분석 결과</h3>
                        <div class="space-y-3">
                            <div class="flex items-center p-3 bg-blue-50 rounded-lg">
                                <span class="text-blue-600 mr-3">💡</span>
                                <span class="text-blue-800">오후 시간대에 학습 집중도가 높습니다.</span>
                            </div>
                            <div class="flex items-center p-3 bg-green-50 rounded-lg">
                                <span class="text-green-600 mr-3">📅</span>
                                <span class="text-green-800">수요일과 목요일에 학습량이 많습니다.</span>
                            </div>
                            <div class="flex items-center p-3 bg-yellow-50 rounded-lg">
                                <span class="text-yellow-600 mr-3">⚠️</span>
                                <span class="text-yellow-800">일요일 학습량이 적으니 주의가 필요합니다.</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 목표 관리 탭 -->
                <div id="goals" class="tab-content hidden">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                            <h3 class="text-lg font-bold text-blue-800 mb-4">📅 일일 목표</h3>
                            <div class="text-center">
                                <div class="text-3xl font-bold text-blue-600 mb-2" id="daily-rate">84.0%</div>
                                <div class="text-sm text-gray-600">42/50 문제</div>
                                <div class="mt-4 w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-blue-600 h-2 rounded-full" style="width: 84%"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                            <h3 class="text-lg font-bold text-green-800 mb-4">📊 주간 목표</h3>
                            <div class="text-center">
                                <div class="text-3xl font-bold text-green-600 mb-2" id="weekly-rate">85.1%</div>
                                <div class="text-sm text-gray-600">298/350 문제</div>
                                <div class="mt-4 w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-green-600 h-2 rounded-full" style="width: 85.1%"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                            <h3 class="text-lg font-bold text-purple-800 mb-4">📈 월간 목표</h3>
                            <div class="text-center">
                                <div class="text-3xl font-bold text-purple-600 mb-2" id="monthly-rate">82.6%</div>
                                <div class="text-sm text-gray-600">1156/1400 문제</div>
                                <div class="mt-4 w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-purple-600 h-2 rounded-full" style="width: 82.6%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-lg font-bold text-gray-800 mb-4">목표 달성 예측</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 class="font-semibold text-gray-700 mb-2">현재 속도로 예상</h4>
                                <div class="space-y-2">
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">시험일까지 예상 진도:</span>
                                        <span class="font-semibold text-blue-600">87.3%</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">목표 달성 가능성:</span>
                                        <span class="font-semibold text-green-600">높음</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 class="font-semibold text-gray-700 mb-2">권장 사항</h4>
                                <div class="space-y-2">
                                    <div class="text-sm text-gray-600">• 해상보험 영역 집중 학습</div>
                                    <div class="text-sm text-gray-600">• 일일 목표 50문제 유지</div>
                                    <div class="text-sm text-gray-600">• 주말 학습량 증가</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 취약 영역 탭 -->
                <div id="weak-areas" class="tab-content hidden">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                            <h3 class="text-lg font-bold text-red-800 mb-4">⚠️ 취약 영역</h3>
                            <div class="space-y-4">
                                <div class="p-3 bg-red-50 rounded-lg">
                                    <div class="flex justify-between items-center">
                                        <span class="font-semibold text-red-800">해상보험</span>
                                        <span class="text-red-600">69.8%</span>
                                    </div>
                                    <div class="text-sm text-red-600 mt-1">정답률 향상 필요</div>
                                </div>
                                <div class="p-3 bg-orange-50 rounded-lg">
                                    <div class="flex justify-between items-center">
                                        <span class="font-semibold text-orange-800">특종보험</span>
                                        <span class="text-orange-600">72.1%</span>
                                    </div>
                                    <div class="text-sm text-orange-600 mt-1">정답률 향상 필요</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                            <h3 class="text-lg font-bold text-green-800 mb-4">✅ 강점 영역</h3>
                            <div class="space-y-4">
                                <div class="p-3 bg-green-50 rounded-lg">
                                    <div class="flex justify-between items-center">
                                        <span class="font-semibold text-green-800">배상보험</span>
                                        <span class="text-green-600">85.2%</span>
                                    </div>
                                    <div class="text-sm text-green-600 mt-1">우수한 성과</div>
                                </div>
                                <div class="p-3 bg-blue-50 rounded-lg">
                                    <div class="flex justify-between items-center">
                                        <span class="font-semibold text-blue-800">재산보험</span>
                                        <span class="text-blue-600">78.3%</span>
                                    </div>
                                    <div class="text-sm text-blue-600 mt-1">우수한 성과</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-lg font-bold text-gray-800 mb-4">개선 우선순위</h3>
                        <div class="space-y-3">
                            <div class="flex items-center p-3 bg-red-50 rounded-lg">
                                <span class="text-red-600 mr-3">🔴</span>
                                <div class="flex-1">
                                    <div class="font-semibold text-red-800">해상보험 - 높음</div>
                                    <div class="text-sm text-red-600">집중 학습 필요</div>
                                </div>
                            </div>
                            <div class="flex items-center p-3 bg-yellow-50 rounded-lg">
                                <span class="text-yellow-600 mr-3">🟡</span>
                                <div class="flex-1">
                                    <div class="font-semibold text-yellow-800">특종보험 - 보통</div>
                                    <div class="text-sm text-yellow-600">보완 학습 권장</div>
                                </div>
                            </div>
                            <div class="flex items-center p-3 bg-green-50 rounded-lg">
                                <span class="text-green-600 mr-3">🟢</span>
                                <div class="flex-1">
                                    <div class="font-semibold text-green-800">재산보험 - 낮음</div>
                                    <div class="text-sm text-green-600">유지 관리</div>
                                </div>
                            </div>
                            <div class="flex items-center p-3 bg-green-50 rounded-lg">
                                <span class="text-green-600 mr-3">🟢</span>
                                <div class="flex-1">
                                    <div class="font-semibold text-green-800">배상보험 - 낮음</div>
                                    <div class="text-sm text-green-600">유지 관리</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- AI 추천 탭 -->
                <div id="ai-recommendations" class="tab-content hidden">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <!-- AI 추천 문제 -->
                        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                            <h3 class="text-lg font-bold text-purple-800 mb-4">🤖 AI 추천 문제</h3>
                            <div class="space-y-3" id="ai-recommendations-list">
                                <!-- AI 추천 문제들이 여기에 동적으로 로드됩니다 -->
                            </div>
                            <div class="mt-4 p-3 bg-purple-50 rounded-lg">
                                <div class="text-sm text-purple-700">
                                    <strong>추천 이유:</strong> <span id="recommendation-reason">개인화된 학습 패턴 및 취약 영역 기반 추천</span>
                                </div>
                                <div class="text-sm text-purple-600 mt-1">
                                    <strong>신뢰도:</strong> <span id="recommendation-confidence">85%</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 학습 경로 -->
                        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                            <h3 class="text-lg font-bold text-blue-800 mb-4">📈 적응형 학습 경로</h3>
                            <div class="space-y-4" id="learning-path-milestones">
                                <!-- 학습 경로 마일스톤들이 여기에 동적으로 로드됩니다 -->
                            </div>
                            <div class="mt-4 p-3 bg-blue-50 rounded-lg">
                                <div class="text-sm text-blue-700">
                                    <strong>현재 집중 영역:</strong> <span id="current-focus">재산보험 (중급)</span>
                                </div>
                                <div class="text-sm text-blue-600 mt-1">
                                    <strong>전체 진행률:</strong> <span id="overall-progress">18.75%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 예측 분석 -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <!-- 시험 합격 가능성 -->
                        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                            <h3 class="text-lg font-bold text-green-800 mb-4">🎯 시험 합격 가능성</h3>
                            <div class="text-center mb-4">
                                <div class="text-4xl font-bold text-green-600" id="success-probability">75.5%</div>
                                <div class="text-sm text-gray-600">신뢰도: <span id="success-confidence">80%</span></div>
                            </div>
                            <div class="space-y-2" id="success-factors">
                                <!-- 합격 요인들이 여기에 동적으로 로드됩니다 -->
                            </div>
                        </div>
                        
                        <!-- 성과 향상 예측 -->
                        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
                            <h3 class="text-lg font-bold text-orange-800 mb-4">📊 성과 향상 예측</h3>
                            <div class="space-y-3" id="performance-forecast">
                                <!-- 성과 향상 예측이 여기에 동적으로 로드됩니다 -->
                            </div>
                        </div>
                    </div>
                    
                    <!-- 최적 학습 시간 -->
                    <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
                        <h3 class="text-lg font-bold text-indigo-800 mb-4">⏰ 최적 학습 시간</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 class="font-semibold text-gray-700 mb-3">추천 시간대</h4>
                                <div class="space-y-3" id="optimal-time-slots">
                                    <!-- 최적 시간대가 여기에 동적으로 로드됩니다 -->
                                </div>
                            </div>
                            <div>
                                <h4 class="font-semibold text-gray-700 mb-3">학습 권장사항</h4>
                                <div class="space-y-2" id="study-recommendations">
                                    <!-- 학습 권장사항이 여기에 동적으로 로드됩니다 -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 하단 버튼 -->
            <div class="flex justify-center mt-8">
                <button onclick="location.href='/home'" 
                        class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg mr-4">
                    🏠 대문으로 돌아가기
                </button>
                <button onclick="location.href='/settings'" 
                        class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg">
                    ⚙️ 설정
                </button>
            </div>
        </div>
        
        <!-- 고급 통계 시스템 스크립트 로드 -->
        <script src="/static/js/basic_statistics_system.js"></script>
        <script src="/static/js/advanced_statistics_system.js"></script>
        <script src="/static/js/ai_recommendation_engine.js"></script>
        <script src="/static/js/adaptive_learning_path.js"></script>
        <script src="/static/js/predictive_analytics.js"></script>
        <script src="/static/js/smart_notification.js"></script>
        
        <!-- JavaScript - 고급 통계 페이지 기능 -->
        <script>
            // 탭 전환 기능
            document.addEventListener('DOMContentLoaded', function() {{
                const tabButtons = document.querySelectorAll('.tab-button');
                const tabContents = document.querySelectorAll('.tab-content');
                
                tabButtons.forEach(button => {{
                    button.addEventListener('click', function() {{
                        const targetTab = this.getAttribute('data-tab');
                        
                        // 모든 탭 버튼 비활성화
                        tabButtons.forEach(btn => {{
                            btn.classList.remove('active', 'bg-blue-500', 'text-white');
                            btn.classList.add('bg-gray-200', 'text-gray-700');
                        }});
                        
                        // 모든 탭 콘텐츠 숨기기
                        tabContents.forEach(content => {{
                            content.classList.add('hidden');
                            content.classList.remove('active');
                        }});
                        
                        // 선택된 탭 활성화
                        this.classList.add('active', 'bg-blue-500', 'text-white');
                        this.classList.remove('bg-gray-200', 'text-gray-700');
                        
                        // 선택된 탭 콘텐츠 표시
                        const targetContent = document.getElementById(targetTab);
                        if (targetContent) {{
                            targetContent.classList.remove('hidden');
                            targetContent.classList.add('active');
                        }}
                    }});
                }});
                
                // 고급 통계 시스템 초기화
                initializeAdvancedStats();
            }});
            
            // 고급 통계 시스템 초기화
            async function initializeAdvancedStats() {{
                try {{
                    console.log('🎯 고급 통계 및 AI 시스템 초기화 시작...');
                    
                    // 기본 통계 시스템 초기화
                    if (window.basicStatisticsSystem) {{
                        const basicResult = await window.basicStatisticsSystem.initialize();
                        if (basicResult.success) {{
                            console.log('✅ 기본 통계 시스템 초기화 완료');
                        }}
                    }}
                    
                    // 고급 통계 시스템 초기화
                    if (window.advancedStatisticsSystem) {{
                        const result = await window.advancedStatisticsSystem.initialize();
                        if (result.success) {{
                            console.log('✅ 고급 통계 시스템 초기화 완료');
                        }}
                    }}
                    
                    // AI 시스템들 초기화
                    await initializeAISystems();
                    
                    // 데이터 로드
                    loadAdvancedStatsData();
                    
                }} catch (error) {{
                    console.error('❌ 고급 통계 초기화 중 오류:', error);
                    loadDummyData();
                }}
            }}
            
            // AI 시스템들 초기화
            async function initializeAISystems() {{
                try {{
                    // AI 추천 엔진 초기화
                    if (window.aiRecommendationEngine) {{
                        const aiResult = await window.aiRecommendationEngine.initialize();
                        if (aiResult.success) {{
                            console.log('✅ AI 추천 엔진 초기화 완료');
                        }}
                    }}
                    
                    // 적응형 학습 경로 초기화
                    if (window.adaptiveLearningPath) {{
                        const pathResult = await window.adaptiveLearningPath.initialize();
                        if (pathResult.success) {{
                            console.log('✅ 적응형 학습 경로 초기화 완료');
                        }}
                    }}
                    
                    // 예측 분석 시스템 초기화
                    if (window.predictiveAnalytics) {{
                        const predResult = await window.predictiveAnalytics.initialize();
                        if (predResult.success) {{
                            console.log('✅ 예측 분석 시스템 초기화 완료');
                        }}
                    }}
                    
                    // 스마트 알림 시스템 초기화
                    if (window.smartNotification) {{
                        const notifResult = await window.smartNotification.initialize();
                        if (notifResult.success) {{
                            console.log('✅ 스마트 알림 시스템 초기화 완료');
                        }}
                    }}
                    
                }} catch (error) {{
                    console.error('❌ AI 시스템 초기화 중 오류:', error);
                }}
            }}
            
            // 고급 통계 데이터 로드
            async function loadAdvancedStatsData() {{
                try {{
                    // 기본 통계 데이터 로드
                    const advancedStats = window.advancedStatisticsSystem?.getAdvancedStatistics();
                    if (advancedStats) {{
                        updateCategoryStats(advancedStats.categoryDetailed);
                        updateLearningPatterns(advancedStats.learningPatterns);
                        updateGoals(advancedStats.goals);
                        updateWeakAreas(advancedStats.weakAreas);
                    }}
                    
                    // AI 데이터 로드
                    await loadAIData();
                    
                    // 차트 생성
                    createCharts();
                    
                }} catch (error) {{
                    console.error('❌ 고급 통계 데이터 로드 실패:', error);
                    loadDummyData();
                }}
            }}
            
            // AI 데이터 로드
            async function loadAIData() {{
                try {{
                    // AI 추천 데이터 로드
                    await loadAIRecommendations();
                    
                    // 학습 경로 데이터 로드
                    await loadLearningPath();
                    
                    // 예측 분석 데이터 로드
                    await loadPredictions();
                    
                }} catch (error) {{
                    console.error('❌ AI 데이터 로드 실패:', error);
                }}
            }}
            
            // AI 추천 데이터 로드
            async function loadAIRecommendations() {{
                try {{
                    const response = await fetch('/api/ai/recommendations');
                    const data = await response.json();
                    
                    if (data.success) {{
                        updateAIRecommendations(data);
                    }}
                }} catch (error) {{
                    console.error('❌ AI 추천 데이터 로드 실패:', error);
                }}
            }}
            
            // 학습 경로 데이터 로드
            async function loadLearningPath() {{
                try {{
                    const response = await fetch('/api/ai/learning-path');
                    const data = await response.json();
                    
                    if (data.success) {{
                        updateLearningPath(data);
                    }}
                }} catch (error) {{
                    console.error('❌ 학습 경로 데이터 로드 실패:', error);
                }}
            }}
            
            // 예측 분석 데이터 로드
            async function loadPredictions() {{
                try {{
                    const response = await fetch('/api/ai/predictions');
                    const data = await response.json();
                    
                    if (data.success) {{
                        updatePredictions(data);
                    }}
                }} catch (error) {{
                    console.error('❌ 예측 분석 데이터 로드 실패:', error);
                }}
            }}
            
            // 더미 데이터 로드
            function loadDummyData() {{
                console.log('더미 데이터로 통계 표시');
                // 차트 생성
                createCharts();
            }}
            
            // 카테고리별 통계 업데이트
            function updateCategoryStats(categoryStats) {{
                Object.keys(categoryStats).forEach(category => {{
                    const stats = categoryStats[category];
                    const prefix = getCategoryPrefix(category);
                    
                    if (document.getElementById(`${{prefix}}-progress`)) {{
                        document.getElementById(`${{prefix}}-progress`).textContent = `${{stats.progressRate}}%`;
                        document.getElementById(`${{prefix}}-accuracy`).textContent = `${{stats.accuracy.total}}%`;
                        document.getElementById(`${{prefix}}-speed`).textContent = `${{stats.learningSpeed}}문제/일`;
                        document.getElementById(`${{prefix}}-goal`).textContent = `${{stats.goalAchievement}}%`;
                    }}
                }});
            }}
            
            // 카테고리 접두사 가져오기
            function getCategoryPrefix(category) {{
                const prefixes = {{
                    '재산보험': 'property',
                    '특종보험': 'special',
                    '배상보험': 'liability',
                    '해상보험': 'marine'
                }};
                return prefixes[category] || category;
            }}
            
            // 학습 패턴 업데이트
            function updateLearningPatterns(patterns) {{
                console.log('학습 패턴 업데이트:', patterns);
            }}
            
            // 목표 업데이트
            function updateGoals(goals) {{
                if (document.getElementById('daily-rate')) {{
                    document.getElementById('daily-rate').textContent = `${{goals.daily.rate}}%`;
                    document.getElementById('weekly-rate').textContent = `${{goals.weekly.rate}}%`;
                    document.getElementById('monthly-rate').textContent = `${{goals.monthly.rate}}%`;
                }}
            }}
            
            // 취약 영역 업데이트
            function updateWeakAreas(weakAreas) {{
                console.log('취약 영역 업데이트:', weakAreas);
            }}
            
            // AI 추천 업데이트
            function updateAIRecommendations(data) {{
                try {{
                    const recommendationsList = document.getElementById('ai-recommendations-list');
                    const reasonElement = document.getElementById('recommendation-reason');
                    const confidenceElement = document.getElementById('recommendation-confidence');
                    
                    if (recommendationsList) {{
                        recommendationsList.innerHTML = '';
                        
                        data.recommendations.forEach((rec, index) => {{
                            const difficultyColor = {{
                                'easy': 'text-green-600',
                                'medium': 'text-yellow-600',
                                'hard': 'text-red-600'
                            }}[rec.difficulty] || 'text-gray-600';
                            
                            const difficultyText = {{
                                'easy': '쉬움',
                                'medium': '보통',
                                'hard': '어려움'
                            }}[rec.difficulty] || rec.difficulty;
                            
                            const recElement = document.createElement('div');
                            recElement.className = 'p-3 bg-gray-50 rounded-lg border-l-4 border-purple-500';
                            recElement.innerHTML = `
                                <div class="flex justify-between items-start">
                                    <div class="flex-1">
                                        <div class="font-semibold text-gray-800">${{rec.title}}</div>
                                        <div class="text-sm text-gray-600">${{rec.category}} • <span class="${{difficultyColor}}">${{difficultyText}}</span></div>
                                        <div class="text-xs text-purple-600 mt-1">${{rec.reason}}</div>
                                    </div>
                                    <button class="ml-2 px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600">
                                        풀기
                                    </button>
                                </div>
                            `;
                            recommendationsList.appendChild(recElement);
                        }});
                    }}
                    
                    if (reasonElement) {{
                        reasonElement.textContent = data.reason;
                    }}
                    
                    if (confidenceElement) {{
                        confidenceElement.textContent = `${{Math.round(data.confidence * 100)}}%`;
                    }}
                    
                }} catch (error) {{
                    console.error('❌ AI 추천 업데이트 실패:', error);
                }}
            }}
            
            // 학습 경로 업데이트
            function updateLearningPath(data) {{
                try {{
                    const milestonesList = document.getElementById('learning-path-milestones');
                    const currentFocusElement = document.getElementById('current-focus');
                    const overallProgressElement = document.getElementById('overall-progress');
                    
                    if (milestonesList) {{
                        milestonesList.innerHTML = '';
                        
                        data.currentPath.milestones.forEach(milestone => {{
                            const statusColor = {{
                                'completed': 'bg-green-500',
                                'in_progress': 'bg-blue-500',
                                'pending': 'bg-gray-300'
                            }}[milestone.status] || 'bg-gray-300';
                            
                            const statusText = {{
                                'completed': '완료',
                                'in_progress': '진행중',
                                'pending': '대기'
                            }}[milestone.status] || '대기';
                            
                            const milestoneElement = document.createElement('div');
                            milestoneElement.className = 'p-3 bg-gray-50 rounded-lg';
                            milestoneElement.innerHTML = `
                                <div class="flex justify-between items-center mb-2">
                                    <div class="font-semibold text-gray-800">${{milestone.title}}</div>
                                    <span class="px-2 py-1 text-xs text-white rounded ${{statusColor}}">${{statusText}}</span>
                                </div>
                                <div class="text-sm text-gray-600 mb-2">진행률: ${{milestone.progress}}%</div>
                                <div class="text-xs text-gray-500">마감일: ${{milestone.deadline}}</div>
                            `;
                            milestonesList.appendChild(milestoneElement);
                        }});
                    }}
                    
                    if (currentFocusElement) {{
                        const focus = data.currentPath.currentFocus;
                        const difficultyText = {{
                            'easy': '초급',
                            'medium': '중급',
                            'hard': '고급'
                        }}[focus.difficulty] || focus.difficulty;
                        currentFocusElement.textContent = `${{focus.category}} (${{difficultyText}})`;
                    }}
                    
                    if (overallProgressElement) {{
                        overallProgressElement.textContent = `${{data.currentPath.overallProgress}}%`;
                    }}
                    
                }} catch (error) {{
                    console.error('❌ 학습 경로 업데이트 실패:', error);
                }}
            }}
            
            // 예측 분석 업데이트
            function updatePredictions(data) {{
                try {{
                    // 시험 합격 가능성 업데이트
                    updateExamSuccess(data.examSuccess);
                    
                    // 성과 향상 예측 업데이트
                    updatePerformanceForecast(data.performanceForecast);
                    
                    // 최적 학습 시간 업데이트
                    updateOptimalStudyTime(data.optimalStudyTime);
                    
                }} catch (error) {{
                    console.error('❌ 예측 분석 업데이트 실패:', error);
                }}
            }}
            
            // 시험 합격 가능성 업데이트
            function updateExamSuccess(examSuccess) {{
                try {{
                    const probabilityElement = document.getElementById('success-probability');
                    const confidenceElement = document.getElementById('success-confidence');
                    const factorsElement = document.getElementById('success-factors');
                    
                    if (probabilityElement) {{
                        probabilityElement.textContent = `${{examSuccess.probability}}%`;
                    }}
                    
                    if (confidenceElement) {{
                        confidenceElement.textContent = `${{Math.round(examSuccess.confidence * 100)}}%`;
                    }}
                    
                    if (factorsElement) {{
                        factorsElement.innerHTML = '';
                        
                        Object.entries(examSuccess.factors).forEach(([factor, value]) => {{
                            const factorElement = document.createElement('div');
                            factorElement.className = 'flex justify-between items-center p-2 bg-gray-50 rounded';
                            factorElement.innerHTML = `
                                <span class="text-sm text-gray-700">${{getFactorName(factor)}}</span>
                                <span class="text-sm font-semibold text-green-600">${{value}}</span>
                            `;
                            factorsElement.appendChild(factorElement);
                        }});
                        
                        // 권장사항 추가
                        examSuccess.recommendations.forEach(rec => {{
                            const recElement = document.createElement('div');
                            recElement.className = 'p-2 bg-blue-50 rounded text-sm text-blue-700';
                            recElement.textContent = rec;
                            factorsElement.appendChild(recElement);
                        }});
                    }}
                    
                }} catch (error) {{
                    console.error('❌ 시험 합격 가능성 업데이트 실패:', error);
                }}
            }}
            
            // 성과 향상 예측 업데이트
            function updatePerformanceForecast(forecast) {{
                try {{
                    const forecastElement = document.getElementById('performance-forecast');
                    
                    if (forecastElement) {{
                        forecastElement.innerHTML = '';
                        
                        Object.entries(forecast).forEach(([period, data]) => {{
                            const periodElement = document.createElement('div');
                            periodElement.className = 'p-3 bg-gray-50 rounded-lg';
                            periodElement.innerHTML = `
                                <div class="font-semibold text-gray-800 mb-2">${{getPeriodName(period)}}</div>
                                <div class="space-y-1 text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">예상 정답률:</span>
                                        <span class="font-semibold text-green-600">${{data.expectedAccuracy}}%</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">예상 문제 수:</span>
                                        <span class="font-semibold text-blue-600">${{data.expectedQuestions}}개</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">신뢰도:</span>
                                        <span class="font-semibold text-purple-600">${{Math.round(data.confidence * 100)}}%</span>
                                    </div>
                                </div>
                            `;
                            forecastElement.appendChild(periodElement);
                        }});
                    }}
                    
                }} catch (error) {{
                    console.error('❌ 성과 향상 예측 업데이트 실패:', error);
                }}
            }}
            
            // 최적 학습 시간 업데이트
            function updateOptimalStudyTime(optimalStudyTime) {{
                try {{
                    const timeSlotsElement = document.getElementById('optimal-time-slots');
                    const recommendationsElement = document.getElementById('study-recommendations');
                    
                    if (timeSlotsElement) {{
                        timeSlotsElement.innerHTML = '';
                        
                        optimalStudyTime.optimalTimeSlots.forEach(slot => {{
                            const slotElement = document.createElement('div');
                            slotElement.className = 'p-3 bg-indigo-50 rounded-lg border-l-4 border-indigo-500';
                            slotElement.innerHTML = `
                                <div class="font-semibold text-indigo-800">${{slot.timeSlot}}</div>
                                <div class="text-sm text-indigo-600">효율성: ${{Math.round(slot.efficiency * 100)}}%</div>
                                <div class="text-sm text-indigo-600">정답률: ${{slot.accuracy}}%</div>
                                <div class="text-xs text-indigo-500 mt-1">${{slot.recommendation}}</div>
                            `;
                            timeSlotsElement.appendChild(slotElement);
                        }});
                    }}
                    
                    if (recommendationsElement) {{
                        recommendationsElement.innerHTML = '';
                        
                        optimalStudyTime.recommendations.forEach(rec => {{
                            const recElement = document.createElement('div');
                            recElement.className = 'text-sm text-gray-700 flex items-start';
                            recElement.innerHTML = `
                                <span class="text-indigo-500 mr-2">•</span>
                                <span>${{rec}}</span>
                            `;
                            recommendationsElement.appendChild(recElement);
                        }});
                    }}
                    
                }} catch (error) {{
                    console.error('❌ 최적 학습 시간 업데이트 실패:', error);
                }}
            }}
            
            // 유틸리티 함수들
            function getFactorName(factor) {{
                const factorNames = {{
                    'studyConsistency': '학습 일관성',
                    'accuracy': '정확도',
                    'coverage': '학습 범위',
                    'timeManagement': '시간 관리',
                    'weakAreaManagement': '취약 영역 관리'
                }};
                return factorNames[factor] || factor;
            }}
            
            function getPeriodName(period) {{
                const periodNames = {{
                    'nextWeek': '다음 주',
                    'nextMonth': '다음 달',
                    'nextQuarter': '다음 분기'
                }};
                return periodNames[period] || period;
            }}
            
            // 차트 생성
            function createCharts() {{
                // 진도율 차트
                const progressCtx = document.getElementById('progressChart');
                if (progressCtx) {{
                    new Chart(progressCtx, {{
                        type: 'bar',
                        data: {{
                            labels: ['재산보험', '특종보험', '배상보험', '해상보험'],
                            datasets: [{{
                                label: '진도율 (%)',
                                data: [25.5, 18.7, 32.1, 15.3],
                                backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6', '#EF4444']
                            }}]
                        }},
                        options: {{
                            responsive: true,
                            scales: {{
                                y: {{
                                    beginAtZero: true,
                                    max: 100
                                }}
                            }}
                        }}
                    }});
                }}
                
                // 정답률 차트
                const accuracyCtx = document.getElementById('accuracyChart');
                if (accuracyCtx) {{
                    new Chart(accuracyCtx, {{
                        type: 'doughnut',
                        data: {{
                            labels: ['재산보험', '특종보험', '배상보험', '해상보험'],
                            datasets: [{{
                                data: [78.3, 72.1, 85.2, 69.8],
                                backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6', '#EF4444']
                            }}]
                        }},
                        options: {{
                            responsive: true,
                            plugins: {{
                                legend: {{
                                    position: 'bottom'
                                }}
                            }}
                        }}
                    }});
                }}
                
                // 시간대별 패턴 차트
                const timePatternCtx = document.getElementById('timePatternChart');
                if (timePatternCtx) {{
                    new Chart(timePatternCtx, {{
                        type: 'pie',
                        data: {{
                            labels: ['오전', '오후', '저녁', '새벽'],
                            datasets: [{{
                                data: [25, 45, 20, 10],
                                backgroundColor: ['#F59E0B', '#10B981', '#3B82F6', '#6B7280']
                            }}]
                        }},
                        options: {{
                            responsive: true,
                            plugins: {{
                                legend: {{
                                    position: 'bottom'
                                }}
                            }}
                        }}
                    }});
                }}
                
                // 요일별 패턴 차트
                const dayPatternCtx = document.getElementById('dayPatternChart');
                if (dayPatternCtx) {{
                    new Chart(dayPatternCtx, {{
                        type: 'line',
                        data: {{
                            labels: ['월', '화', '수', '목', '금', '토', '일'],
                            datasets: [{{
                                label: '학습량',
                                data: [15, 18, 20, 16, 14, 12, 5],
                                borderColor: '#3B82F6',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                tension: 0.4
                            }}]
                        }},
                        options: {{
                            responsive: true,
                            scales: {{
                                y: {{
                                    beginAtZero: true
                                }}
                            }}
                        }}
                    }});
                }}
            }}
        </script>
    </body>
    </html>
    """
