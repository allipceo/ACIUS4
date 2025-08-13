# routes/quiz_answer_routes.py
# 퀴즈 답안 처리 전용 라우트 (100줄 목표)
# 답안 제출 및 채점 기능 담당

from flask import Blueprint, request, jsonify
import logging
import time
from typing import Dict, Any

# 서비스 import (단순화)
import sys
import os
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

try:
    from services.quiz_session_service import get_quiz_session_service
    from services.quiz_answer_service import get_quiz_answer_service
    SERVICES_AVAILABLE = True
except ImportError:
    # fallback
    from services.quiz_service import QuizService
    quiz_service = QuizService()
    get_quiz_session_service = lambda: quiz_service
    get_quiz_answer_service = lambda: quiz_service
    SERVICES_AVAILABLE = True

# Blueprint 생성
answer_bp = Blueprint('quiz_answer', __name__, url_prefix='/api/quiz')
logger = logging.getLogger(__name__)

@answer_bp.route('/submit', methods=['POST'])
def submit_answer():
    """답안 제출 및 채점"""
    try:
        data = request.get_json() or {}
        session_id = data.get('session_id')
        user_answer = data.get('user_answer')
        question_data = data.get('question_data')
        start_time = data.get('start_time')
        
        if not all([session_id, user_answer, question_data]):
            return jsonify({
                'success': False,
                'error': '필수 정보가 누락되었습니다',
                'code': 'MISSING_REQUIRED_DATA'
            }), 400
        
        # 응답 시간 계산
        response_time = time.time() - float(start_time) if start_time else 0.0
        
        # 답안 검증 및 채점
        answer_service = get_quiz_answer_service()
        if not answer_service:
            return jsonify({'success': False, 'error': '답안 서비스를 사용할 수 없습니다'}), 500
            
        answer_result = answer_service.check_answer(user_answer, question_data)
        
        # 세션에 시도 기록
        session_service = get_quiz_session_service()
        user_id = session_id.split('_')[0]
        
        record_success = session_service.record_attempt(
            user_id, session_id, question_data, user_answer, response_time
        )
        
        if not record_success:
            logger.warning(f"시도 기록 실패: {session_id}")
        
        # 상세 피드백 생성
        feedback = answer_service.generate_detailed_feedback(answer_result, question_data)
        
        return jsonify({
            'success': True,
            'answer_result': answer_result,
            'feedback': feedback,
            'response_time': round(response_time, 2),
            'recorded': record_success
        })
        
    except Exception as e:
        logger.error(f"답안 제출 오류: {str(e)}")
        return jsonify({
            'success': False,
            'error': '답안 제출 중 오류가 발생했습니다',
            'code': 'INTERNAL_ERROR'
        }), 500

# 테스트 함수
def test_answer_routes():
    """답안 라우트 테스트"""
    print("=== QuizAnswerRoutes 테스트 ===")
    print(f"✅ Blueprint: {answer_bp.name}")
    print(f"✅ URL 접두사: {answer_bp.url_prefix}")
    print("✅ 라우트: 1개")
    print("   - POST /api/quiz/submit - 답안 제출")
    return True

if __name__ == "__main__":
    test_answer_routes()
