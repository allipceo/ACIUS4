# routes/quiz_routes_v1.0.py
# 문제풀이 기능 - API 엔드포인트 통합 (150줄 목표)
# Day 4: RESTful API, 3개 서비스 연동, 에러 처리
# 파일명: quiz_routes_v1.0.py (기존 quiz_routes.py와 구분)

from flask import Blueprint, request, jsonify, session
import logging
import time
from datetime import datetime
from typing import Dict, Any

# 기존 서비스들 import (경로 수정)
import sys
import os
# 올바른 경로 설정
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

try:
    from services.quiz_data_service_v1_0 import get_quiz_data_service
    from services.quiz_session_service import get_quiz_session_service  
    from services.quiz_answer_service import get_quiz_answer_service
    SERVICES_AVAILABLE = True
    print("✅ Week2 서비스 import 성공 (v1_0)")
except ImportError as e:
    print(f"⚠️ 서비스 import 오류: {e}")
    print("💡 기존 서비스로 fallback")
    # 기존 서비스로 fallback
    try:
        from services.quiz_service import QuizService
        quiz_service = QuizService()
        get_quiz_data_service = lambda: quiz_service
        get_quiz_session_service = lambda: quiz_service
        get_quiz_answer_service = lambda: quiz_service
        SERVICES_AVAILABLE = True
        print("✅ 기존 서비스 fallback 성공")
    except ImportError as e2:
        print(f"❌ 기존 서비스도 실패: {e2}")
        get_quiz_data_service = lambda: None
        get_quiz_session_service = lambda: None
        get_quiz_answer_service = lambda: None
        SERVICES_AVAILABLE = False

# Blueprint 생성
quiz_bp = Blueprint('quiz', __name__, url_prefix='/api/quiz')
logger = logging.getLogger(__name__)

@quiz_bp.route('/start', methods=['POST'])
def start_quiz():
    """퀴즈 세션 시작"""
    try:
        data = request.get_json() or {}
        user_id = data.get('user_id') or session.get('current_user_id', 'anonymous')
        mode = data.get('mode', 'basic')  # 'basic' or 'category'
        category = data.get('category')
        
        if not user_id:
            return jsonify({
                'success': False,
                'error': '사용자 ID가 필요합니다',
                'code': 'USER_ID_REQUIRED'
            }), 400
        
        # 세션 서비스로 새 세션 생성
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

@quiz_bp.route('/question/<session_id>/<int:index>', methods=['GET'])
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

@quiz_bp.route('/submit', methods=['POST'])
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

@quiz_bp.route('/session/<session_id>/end', methods=['POST'])
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

@quiz_bp.route('/statistics/<user_id>', methods=['GET'])
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

@quiz_bp.route('/health', methods=['GET'])
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

# 에러 핸들러
@quiz_bp.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': '요청하신 리소스를 찾을 수 없습니다',
        'code': 'NOT_FOUND'
    }), 404

@quiz_bp.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': '내부 서버 오류가 발생했습니다',
        'code': 'INTERNAL_SERVER_ERROR'
    }), 500

# 테스트 함수 (개발용)
def test_quiz_routes():
    """퀴즈 API 라우트 테스트"""
    print("=== QuizRoutes 테스트 시작 ===")
    
    # Blueprint 정보 출력
    print(f"✅ Blueprint 이름: {quiz_bp.name}")
    print(f"✅ URL 접두사: {quiz_bp.url_prefix}")
    
    # 서비스 연동 상태 확인
    data_service = get_quiz_data_service()
    session_service = get_quiz_session_service()
    answer_service = get_quiz_answer_service()
    
    print(f"✅ 데이터 서비스: {'연결됨' if data_service else '연결 안됨'}")
    print(f"✅ 세션 서비스: {'연결됨' if session_service else '연결 안됨'}")
    print(f"✅ 답안 서비스: {'연결됨' if answer_service else '연결 안됨'}")
    
    # 실제 라우트 목록 (코드에서 확인)
    print(f"✅ 정의된 라우트: 6개")
    print("   - POST /api/quiz/start - 퀴즈 세션 시작")
    print("   - GET  /api/quiz/question/<id>/<idx> - 문제 조회")
    print("   - POST /api/quiz/submit - 답안 제출")
    print("   - POST /api/quiz/session/<id>/end - 세션 종료")
    print("   - GET  /api/quiz/statistics/<user> - 사용자 통계")
    print("   - GET  /api/quiz/health - 상태 확인")
    
    print("=== 테스트 완료 ===")
    print("📡 Flask 앱에 등록 후 API 테스트 가능")
    return True

if __name__ == "__main__":
    test_quiz_routes()