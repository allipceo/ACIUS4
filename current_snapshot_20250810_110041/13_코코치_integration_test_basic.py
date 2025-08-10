# integration_test_basic.py

import os
import sys

# 프로젝트 루트 디렉토리를 PYTHONPATH에 추가하여 모듈을 임포트할 수 있도록 설정
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from modules.data_converter import convert_csv_to_json
from modules.quiz_handler import QuizHandler
from modules.stats_handler import StatsHandler

def test_module_imports():
    """
    1단계: 기본 연동 테스트
    세 개의 핵심 모듈이 성공적으로 import 되는지 확인합니다.
    """
    print("--- 1단계: 기본 연동 테스트 시작 ---")
    
    try:
        # 모듈 임포트 확인
        print("✅ 모듈 임포트 성공: data_converter, quiz_handler, stats_handler")

        # 각 클래스 초기화 테스트
        quiz = QuizHandler()
        stats = StatsHandler("test_user")

        print("✅ QuizHandler 및 StatsHandler 객체 초기화 성공")
        
        # 더미 함수 호출로 기본 동작 확인
        print(f"QuizHandler 객체: {quiz}")
        print(f"StatsHandler 객체: {stats}")

        print("--- 1단계: 기본 연동 테스트 완료 ---")
        return True
    
    except ImportError as e:
        print(f"❌ 모듈 임포트 실패: {e}")
        return False
    except Exception as e:
        print(f"❌ 예외 발생: {e}")
        return False

if __name__ == "__main__":
    if test_module_imports():
        print("\n✅ 모든 기본 연동 테스트가 성공적으로 완료되었습니다. 다음 단계로 진행할 수 있습니다.")
    else:
        print("\n❌ 기본 연동 테스트에 실패했습니다. 경로 설정 또는 파일 상태를 확인하십시오.")

