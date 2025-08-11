# routes/quiz_stats_routes.py
# 퀴즈 통계 및 상태 확인 전용 라우트 (80줄 목표)
# 통계 조회, health check 기능 담당

from flask import Blueprint, request, jsonify
import logging
from datetime import datetime
from typing import Dict, Any

# 서비스 import (단순화)
import sys
import os
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

try:
    from services.quiz_session_service import get_quiz_session_service
    from services.quiz_data_service_v1_0 import get_quiz_data_service
    from services.quiz_answer_service import get_quiz_answer_service
    SERVICES_AVAILABLE = True
except ImportError:
    # fallback
    from services.quiz_service import QuizService
    quiz_service = QuizService()
    get_quiz_session_service = lambda: quiz_service
    get_quiz_data_service = lambda: quiz_service
    get_quiz_answer_service = lambda: quiz_service
    SERVICES_AVAILABLE = True

# Blueprint 생성
stats_bp = Blueprint('quiz_stats', __name__, url_prefix='/api/quiz')
logger = logging.getLogger(__name__)

@stats_bp.route('/statistics/<user_id>', methods=['GET'])
def get_user_statistics(user_id: str):
    """사용자 통계 조회"""
    try:
        session_service = get_quiz_session_service()
        user_stats = session_service.get_user_statistics(user_id)
        
        return jsonify({
            'success': True,
            'statistics': user_stats
        })
        
    except Exception as e:
        logger.error(f"통계 조회 오류: {str(e)}")
        return jsonify({
            'success': False,
            'error': '통계 조회 중 오류가 발생했습니다',
            'code': 'INTERNAL_ERROR'
        }), 500

@stats_bp.route('/health', methods=['GET'])
def health_check():
    """API 상태 확인"""
    try:
        # 각 서비스 상태 확인
        data_service = get_quiz_data_service()
        session_service = get_quiz_session_service()
        answer_service = get_quiz_answer_service()
        
        services_status = {
            'quiz_data_service': data_service is not None,
            'quiz_session_service': session_service is not None,
            'quiz_answer_service': answer_service is not None
        }
        
        all_healthy = all(services_status.values())
        
        return jsonify({
            'success': True,
            'status': 'healthy' if all_healthy else 'degraded',
            'services': services_status,
            'timestamp': datetime.now().isoformat()
        }), 200 if all_healthy else 503
        
    except Exception as e:
        logger.error(f"상태 확인 오류: {str(e)}")
        return jsonify({
            'success': False,
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

# 테스트 함수
def test_stats_routes():
    """통계 라우트 테스트"""
    print("=== QuizStatsRoutes 테스트 ===")
    print(f"✅ Blueprint: {stats_bp.name}")
    print(f"✅ URL 접두사: {stats_bp.url_prefix}")
    print("✅ 라우트: 2개")
    print("   - GET /api/quiz/statistics/<user> - 사용자 통계")
    print("   - GET /api/quiz/health - 상태 확인")
    return True

if __name__ == "__main__":
    test_stats_routes()
