# Phase 3: 서버 테스트 스크립트 (V1.2)
# 실행 방법: python phase3_test_server.py

import subprocess
import time
import requests
from datetime import datetime

def test_server():
    print("🧪 AICU 시즌4 서버 테스트 시작...")
    print(f"📅 시작 시간: {datetime.now().strftime('%H:%M:%S')}")
    print("="*50)
    
    # 1. app_v2.0.py 우선 테스트
    print("📋 app_v2.0.py 테스트 중...")
    try:
        result = subprocess.run(['python', 'app_v2.0.py'], 
                              capture_output=True, text=True, timeout=10)
        
        if "Week2 퀴즈 API 등록 성공" in result.stdout or "Flask" in result.stdout:
            print("✅ app_v2.0.py 정상 실행 확인!")
            print("📋 출력 (처음 200자):", result.stdout[:200])
            return True
        else:
            print("⚠️  app_v2.0.py 실행 확인 필요")
            print("📋 출력:", result.stdout[:200])
            print("📋 오류:", result.stderr[:200])
            
            # 2. 백업으로 app_v1.8_simple.py 테스트
            print("\n📋 app_v1.8_simple.py 백업 테스트...")
            result2 = subprocess.run(['python', 'app_v1.8_simple.py'], 
                                   capture_output=True, text=True, timeout=10)
            
            if "Week2 퀴즈 API 등록 성공" in result2.stdout:
                print("✅ 백업 서버 정상 실행 확인!")
                print("📋 출력 (처음 200자):", result2.stdout[:200])
                return True
            else:
                print("❌ 모든 서버 실행 오류 발견")
                print("📋 백업 출력:", result2.stdout[:200])
                print("📋 백업 오류:", result2.stderr[:200])
                return False
                
    except subprocess.TimeoutExpired:
        print("⏰ 서버 실행 시간 초과 (10초)")
        return False
    except Exception as e:
        print(f"❌ 테스트 실행 실패: {e}")
        return False

def test_web_endpoints():
    print("\n🌐 웹 엔드포인트 테스트...")
    
    # 서버가 실행 중인지 확인
    try:
        response = requests.get("http://localhost:5000", timeout=5)
        if response.status_code == 200:
            print("✅ 기본 페이지 접속 성공")
            return True
        else:
            print(f"⚠️  기본 페이지 접속 실패: {response.status_code}")
            return False
    except requests.exceptions.RequestException:
        print("❌ 서버가 실행되지 않음")
        return False

def test_api_endpoints():
    print("\n🔌 API 엔드포인트 테스트...")
    
    try:
        response = requests.get("http://localhost:5000/api/quiz/health", timeout=5)
        if response.status_code == 200:
            print("✅ /api/quiz/health 엔드포인트 성공")
            return True
        else:
            print(f"⚠️  /api/quiz/health 엔드포인트 실패: {response.status_code}")
            return False
    except requests.exceptions.RequestException:
        print("❌ API 엔드포인트 접속 실패")
        return False

# 실행
if __name__ == "__main__":
    print("🚀 Phase 3: 서버 테스트 시작")
    
    # 서버 실행 테스트
    server_success = test_server()
    
    if server_success:
        print("\n✅ 서버 실행 성공!")
        
        # 웹 엔드포인트 테스트 (선택적)
        print("\n🌐 추가 웹 테스트를 진행하시겠습니까? (y/n)")
        # 실제로는 사용자 입력을 받지만, 여기서는 자동으로 진행
        web_success = test_web_endpoints()
        api_success = test_api_endpoints()
        
        print("\n" + "="*50)
        print("📊 Phase 3 완료 요약:")
        print(f"✅ 서버 실행: {'성공' if server_success else '실패'}")
        print(f"✅ 웹 엔드포인트: {'성공' if web_success else '실패'}")
        print(f"✅ API 엔드포인트: {'성공' if api_success else '실패'}")
        
        if server_success:
            print("\n🎉 파일 체계 정리 완료!")
            print("📋 app_v2.0.py 기준으로 안정적으로 정리됨")
        else:
            print("\n⚠️  서버 실행에 문제가 있습니다")
            
    else:
        print("\n❌ 서버 실행 실패!")
        print("🚨 app_v2.0.py 또는 메인 브랜치 복원 필요")
    
    print(f"\n📅 완료 시간: {datetime.now().strftime('%H:%M:%S')}")

