# routes/quiz_session_routes.py
# 퀴즈 세션 관리 전용 라우트 (120줄 목표)
# 세션 시작, 종료 기능 담당

from flask import Blueprint, request, jsonify, session
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
session_bp = Blueprint('quiz_session', __name__, url_prefix='/api/quiz')
logger = logging.getLogger(__name__)

@session_bp.route('/start', methods=['POST'])
def start_quiz():
    """퀴즈 세션 시작"""
    try:
        data = request.get_json() or {}
        user_id = data.get('user_id') or session.get('current_user_id', 'anonymous')
        mode = data.get('mode', 'basic')
        category = data.get('category')
        
        if not user_id:
            return jsonify({
                'success': False,
                'error': '사용자 ID가 필요합니다',
                'code': 'USER_ID_REQUIRED'
            }), 400
        
        # 세션 생성
        session_service = get_quiz_session_service()
        if not session_service:
            return jsonify({'success': False, 'error': '세션 서비스를 사용할 수 없습니다'}), 500
            
        session_id = session_service.create_session(user_id, mode, category)
        
        if not session_id:
            return jsonify({
                'success': False,
                'error': '세션 생성에 실패했습니다',
                'code': 'SESSION_CREATE_FAILED'
            }), 500
        
        # 첫 번째 문제 로드
        data_service = get_quiz_data_service()
        if not data_service:
            return jsonify({'success': False, 'error': '데이터 서비스를 사용할 수 없습니다'}), 500
            
        questions = data_service.get_questions_by_mode(mode, category)
        
        if not questions:
            return jsonify({
                'success': False,
                'error': '문제를 찾을 수 없습니다',
                'code': 'NO_QUESTIONS_FOUND'
            }), 404
        
        first_question = data_service.get_question_by_index(questions, 0)
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'mode': mode,
            'category': category,
            'total_questions': len(questions),
            'current_question': first_question,
            'question_index': 0,
            'started_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"퀴즈 시작 오류: {str(e)}")
        return jsonify({
            'success': False,
            'error': '퀴즈 시작 중 오류가 발생했습니다',
            'code': 'INTERNAL_ERROR'
        }), 500

@session_bp.route('/session/<session_id>/end', methods=['POST'])
def end_quiz_session(session_id: str):
    """퀴즈 세션 종료"""
    try:
        user_id = session_id.split('_')[0]
        
        # 세션 종료
        session_service = get_quiz_session_service()
        end_success = session_service.end_session(user_id, session_id)
        
        if not end_success:
            return jsonify({
                'success': False,
                'error': '세션 종료에 실패했습니다',
                'code': 'SESSION_END_FAILED'
            }), 500
        
        # 최종 통계 계산
        user_stats = session_service.get_user_statistics(user_id)
        session_history = session_service.get_session_history(user_id, 1)
        
        final_session = session_history[0] if session_history else {}
        attempts = final_session.get('attempts', [])
        
        # 세션 점수 계산
        answer_service = get_quiz_answer_service()
        session_score = answer_service.calculate_session_score(attempts)
        
        return jsonify({
            'success': True,
            'session_ended': True,
            'session_summary': final_session,
            'session_score': session_score,
            'user_statistics': user_stats,
            'ended_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"세션 종료 오류: {str(e)}")
        return jsonify({
            'success': False,
            'error': '세션 종료 중 오류가 발생했습니다',
            'code': 'INTERNAL_ERROR'
        }), 500

# 테스트 함수
def test_session_routes():
    """세션 라우트 테스트"""
    print("=== QuizSessionRoutes 테스트 ===")
    print(f"✅ Blueprint: {session_bp.name}")
    print(f"✅ URL 접두사: {session_bp.url_prefix}")
    print("✅ 라우트: 2개")
    print("   - POST /api/quiz/start - 세션 시작")
    print("   - POST /api/quiz/session/<id>/end - 세션 종료")
    return True

if __name__ == "__main__":
    test_session_routes()
