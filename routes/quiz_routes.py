# routes/quiz_routes.py
# 퀴즈 API 통합 라우트 (150줄 목표)
# Lego 모델 방식으로 리팩토링 - 분리된 모듈들을 통합
# 🔧 v3.2 수정: 기존 Week2 API 완전 비활성화

from flask import Blueprint
import logging

# 🔧 v3.2 수정: 기존 Week2 API 완전 비활성화
print("🚫 기존 Week2 API 완전 비활성화 (routes/quiz_routes.py)")
print("🚫 분리된 모듈들 import 완전 차단")

# 분리된 모듈들 import - 완전 차단
try:
    # 🔧 v3.2 수정: 기존 Week2 API import 완전 차단
    print("🚫 기존 Week2 API import 차단됨")
    MODULES_AVAILABLE = False
except ImportError as e:
    print(f"🚫 기존 Week2 API import 차단됨: {e}")
    MODULES_AVAILABLE = False

# 메인 Blueprint 생성 - 비활성화
quiz_bp = Blueprint('quiz', __name__, url_prefix='/api/quiz')
logger = logging.getLogger(__name__)

def register_quiz_blueprints(app):
    """퀴즈 관련 Blueprint들을 Flask 앱에 등록 - v3.2 완전 비활성화"""
    # 🔧 v3.2 수정: 기존 Week2 API 등록 완전 차단
    print("🚫 기존 Week2 API 등록 완전 차단 (v3.2)")
    print("🚫 새로운 API만 사용하여 충돌 방지")
    
    # 기존 Week2 API 등록 완전 차단
    return False

# 테스트 함수 - 비활성화
def test_quiz_routes():
    """퀴즈 API 라우트 통합 테스트 - v3.2 비활성화"""
    print("=== QuizRoutes 통합 테스트 (v3.2 비활성화) ===")
    print("🚫 기존 Week2 API 완전 비활성화")
    print("✅ 새로운 API만 사용하여 충돌 방지")
    print("=== 테스트 완료 ===")
    return True

# 파일 크기 정보 - 비활성화
def get_file_info():
    """파일 정보 출력 - v3.2 비활성화"""
    print("=== QuizRoutes 파일 정보 (v3.2 비활성화) ===")
    print("🚫 기존 Week2 API 완전 비활성화")
    print("✅ 새로운 API만 사용하여 충돌 방지")
    return True

if __name__ == "__main__":
    test_quiz_routes()
    get_file_info()