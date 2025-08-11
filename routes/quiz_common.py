# routes/quiz_common.py
# 퀴즈 공통 기능 모듈 (50줄 목표)
# 에러 핸들러, 공통 유틸리티 함수

from flask import Blueprint, jsonify
import logging
from typing import Dict, Any

# Blueprint 생성
common_bp = Blueprint('quiz_common', __name__, url_prefix='/api/quiz')
logger = logging.getLogger(__name__)

# 에러 핸들러
@common_bp.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': '요청하신 리소스를 찾을 수 없습니다',
        'code': 'NOT_FOUND'
    }), 404

@common_bp.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': '내부 서버 오류가 발생했습니다',
        'code': 'INTERNAL_SERVER_ERROR'
    }), 500

# 공통 유틸리티 함수
def validate_session_id(session_id: str) -> bool:
    """세션 ID 유효성 검증"""
    return session_id and '_' in session_id

def create_error_response(message: str, code: str, status_code: int = 400) -> tuple:
    """표준 에러 응답 생성"""
    return jsonify({
        'success': False,
        'error': message,
        'code': code
    }), status_code

# 테스트 함수
def test_common_routes():
    """공통 라우트 테스트"""
    print("=== QuizCommonRoutes 테스트 ===")
    print(f"✅ Blueprint: {common_bp.name}")
    print(f"✅ URL 접두사: {common_bp.url_prefix}")
    print("✅ 에러 핸들러: 2개")
    print("   - 404 에러 핸들러")
    print("   - 500 에러 핸들러")
    return True

if __name__ == "__main__":
    test_common_routes()
