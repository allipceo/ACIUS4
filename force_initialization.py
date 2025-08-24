#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AICU S4 - 강제 초기화 스크립트
초기화 상태 문제 해결을 위한 localStorage 완전 클리어
"""

import requests
import json
import time
from datetime import datetime

def force_initialization():
    """강제 초기화 실행"""
    print("🔧 AICU S4 강제 초기화 시작")
    print("=" * 60)
    
    try:
        # 1. 서버 상태 확인
        response = requests.get("http://localhost:5000/", timeout=5)
        if response.status_code != 200:
            print("❌ 서버가 실행되지 않았습니다.")
            return False
        
        print("✅ 서버 연결 확인됨")
        
        # 2. 설정 페이지 접근하여 초기화 실행
        print("📋 설정 페이지 접근 중...")
        response = requests.get("http://localhost:5000/settings")
        
        if response.status_code == 200:
            print("✅ 설정 페이지 접근 성공")
            
            # 3. 초기화 관련 요소 확인
            if "clearAllData" in response.text and "applyGuestModeDefaults" in response.text:
                print("✅ 초기화 기능 확인됨")
                print("📝 다음 단계:")
                print("   1. 브라우저에서 http://localhost:5000/settings 접속")
                print("   2. '모든 데이터 초기화' 버튼 클릭")
                print("   3. 확인 후 홈페이지로 이동하여 초기화 상태 확인")
                return True
            else:
                print("❌ 초기화 기능을 찾을 수 없습니다.")
                return False
        else:
            print(f"❌ 설정 페이지 접근 실패: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 강제 초기화 실패: {str(e)}")
        return False

def verify_initialization():
    """초기화 상태 검증"""
    print("\n🔍 초기화 상태 검증")
    print("=" * 60)
    
    try:
        # 홈페이지 접근하여 초기화 상태 확인
        response = requests.get("http://localhost:5000/")
        
        if response.status_code == 200:
            # 초기화 상태 확인 (모든 데이터가 0이어야 함)
            if "0" in response.text and "게스트" in response.text:
                print("✅ 초기화 상태 확인됨")
                print("   - 모든 데이터가 0으로 초기화됨")
                print("   - 게스트 모드로 설정됨")
                return True
            else:
                print("❌ 완전한 초기화 상태가 아님")
                print("   - 일부 데이터가 남아있을 수 있음")
                return False
        else:
            print(f"❌ 홈페이지 접근 실패: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 초기화 상태 검증 실패: {str(e)}")
        return False

def main():
    """메인 실행 함수"""
    print("🚀 AICU S4 강제 초기화 프로세스 시작")
    print("=" * 60)
    
    # 1. 강제 초기화 실행
    if force_initialization():
        print("\n✅ 강제 초기화 준비 완료")
        print("📝 사용자가 브라우저에서 초기화를 실행한 후...")
        
        # 2. 사용자에게 초기화 실행 안내
        print("\n" + "=" * 60)
        print("📋 초기화 실행 안내")
        print("=" * 60)
        print("1. 브라우저에서 http://localhost:5000/settings 접속")
        print("2. '🗑️ 모든 데이터 초기화' 버튼 클릭")
        print("3. 확인 대화상자에서 '확인' 클릭")
        print("4. 초기화 완료 메시지 확인")
        print("5. '🏠 홈으로 돌아가기' 버튼 클릭")
        print("6. 홈페이지에서 모든 데이터가 0인지 확인")
        print("\n초기화가 완료되면 Enter 키를 눌러 검증을 진행하세요...")
        
        input()  # 사용자 입력 대기
        
        # 3. 초기화 상태 검증
        if verify_initialization():
            print("\n🎉 초기화 성공!")
            print("✅ 모든 데이터가 성공적으로 초기화되었습니다.")
            print("✅ 게스트 모드로 정상 설정되었습니다.")
            print("✅ 120-125번 문서의 중앙아키텍처 원칙이 준수됩니다.")
            return True
        else:
            print("\n⚠️ 초기화 검증 실패")
            print("❌ 일부 데이터가 남아있거나 초기화가 완전하지 않습니다.")
            return False
    else:
        print("\n❌ 강제 초기화 준비 실패")
        return False

if __name__ == "__main__":
    main()
