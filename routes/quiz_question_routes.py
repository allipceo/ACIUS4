# routes/quiz_question_routes.py
# 퀴즈 문제 조회 전용 라우트 (100줄 목표)
# 문제 조회 기능 담당

from flask import Blueprint, request, jsonify
import logging
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
    SERVICES_AVAILABLE = True
except ImportError:
    # fallback
    from services.quiz_service import QuizService
    quiz_service = QuizService()
    get_quiz_session_service = lambda: quiz_service
    get_quiz_data_service = lambda: quiz_service
    SERVICES_AVAILABLE = True

# Blueprint 생성
question_bp = Blueprint('quiz_question', __name__, url_prefix='/api/quiz')
logger = logging.getLogger(__name__)

@question_bp.route('/question/<session_id>/<int:index>', methods=['GET'])
def get_question(session_id: str, index: int):
    """특정 문제 조회"""
    try:
        # 세션 검증
        session_service = get_quiz_session_service()
        current_session = session_service.get_current_session(session_id.split('_')[0])
        
        if not current_session or current_session.get('session_id') != session_id:
            return jsonify({
                'success': False,
                'error': '유효하지 않은 세션입니다',
                'code': 'INVALID_SESSION'
            }), 401
        
        # 문제 로드
        data_service = get_quiz_data_service()
        mode = current_session.get('mode', 'basic')
        category = current_session.get('category')
        
        questions = data_service.get_questions_by_mode(mode, category)
        
        if index < 0 or index >= len(questions):
            return jsonify({
                'success': False,
                'error': '유효하지 않은 문제 번호입니다',
                'code': 'INVALID_QUESTION_INDEX'
            }), 400
        
        question = data_service.get_question_by_index(questions, index)
        
        if not question:
            return jsonify({
                'success': False,
                'error': '문제를 찾을 수 없습니다',
                'code': 'QUESTION_NOT_FOUND'
            }), 404
        
        return jsonify({
            'success': True,
            'question': question,
            'question_index': index,
            'total_questions': len(questions),
            'session_id': session_id
        })
        
    except Exception as e:
        logger.error(f"문제 조회 오류: {str(e)}")
        return jsonify({
            'success': False,
            'error': '문제 조회 중 오류가 발생했습니다',
            'code': 'INTERNAL_ERROR'
        }), 500

# 테스트 함수
def test_question_routes():
    """문제 라우트 테스트"""
    print("=== QuizQuestionRoutes 테스트 ===")
    print(f"✅ Blueprint: {question_bp.name}")
    print(f"✅ URL 접두사: {question_bp.url_prefix}")
    print("✅ 라우트: 1개")
    print("   - GET /api/quiz/question/<id>/<idx> - 문제 조회")
    return True

if __name__ == "__main__":
    test_question_routes()
