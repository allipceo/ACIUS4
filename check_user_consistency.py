#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
현재 대문과 설정의 사용자 일치 여부 및 중앙 데이터 사용자 등록일 확인
"""

import json
import requests
from datetime import datetime
import re

class UserConsistencyChecker:
    def __init__(self):
        self.base_url = "http://localhost:5000"
        
    def print_header(self, title):
        print("\n" + "="*70)
        print(f"🔍 {title}")
        print("="*70)
    
    def check_homepage_user_info(self):
        """홈페이지에서 사용자 정보 확인"""
        self.print_header("홈페이지 사용자 정보 확인")
        
        try:
            response = requests.get(f"{self.base_url}/")
            if response.status_code == 200:
                html_content = response.text
                
                # 사용자 이름 추출 (홈페이지에서 표시되는 사용자 정보)
                user_name_patterns = [
                    r'사용자[:\s]*([^\s<]+)',
                    r'사용자명[:\s]*([^\s<]+)',
                    r'이름[:\s]*([^\s<]+)',
                    r'name[:\s]*([^\s<]+)',
                    r'user[:\s]*([^\s<]+)'
                ]
                
                homepage_user = None
                for pattern in user_name_patterns:
                    match = re.search(pattern, html_content, re.IGNORECASE)
                    if match:
                        homepage_user = match.group(1).strip()
                        break
                
                if homepage_user:
                    print(f"✅ 홈페이지 사용자: {homepage_user}")
                    return homepage_user
                else:
                    print("⚠️ 홈페이지에서 사용자 정보를 찾을 수 없습니다.")
                    return None
            else:
                print(f"❌ 홈페이지 접속 실패: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ 홈페이지 확인 오류: {str(e)}")
            return None
    
    def check_settings_user_info(self):
        """설정 페이지에서 사용자 정보 확인"""
        self.print_header("설정 페이지 사용자 정보 확인")
        
        try:
            response = requests.get(f"{self.base_url}/settings")
            if response.status_code == 200:
                html_content = response.text
                
                # 설정 페이지에서 사용자 정보 추출
                user_name_patterns = [
                    r'사용자[:\s]*([^\s<]+)',
                    r'사용자명[:\s]*([^\s<]+)',
                    r'이름[:\s]*([^\s<]+)',
                    r'name[:\s]*([^\s<]+)',
                    r'user[:\s]*([^\s<]+)',
                    r'등록된 사용자[:\s]*([^\s<]+)'
                ]
                
                settings_user = None
                for pattern in user_name_patterns:
                    match = re.search(pattern, html_content, re.IGNORECASE)
                    if match:
                        settings_user = match.group(1).strip()
                        break
                
                if settings_user:
                    print(f"✅ 설정 페이지 사용자: {settings_user}")
                    return settings_user
                else:
                    print("⚠️ 설정 페이지에서 사용자 정보를 찾을 수 없습니다.")
                    return None
            else:
                print(f"❌ 설정 페이지 접속 실패: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ 설정 페이지 확인 오류: {str(e)}")
            return None
    
    def check_central_data_user_info(self):
        """중앙 데이터에서 사용자 정보 및 등록일 확인"""
        self.print_header("중앙 데이터 사용자 정보 및 등록일 확인")
        
        try:
            # localStorage 데이터를 시뮬레이션하여 확인
            # 실제로는 브라우저의 localStorage를 확인해야 하지만,
            # 여기서는 API를 통해 데이터를 확인
            
            # 사용자 데이터 API 호출 시뮬레이션
            print("🔍 중앙 데이터 확인 중...")
            
            # 실제 localStorage 키들 확인
            localStorage_keys = [
                "aicu_user_data",
                "aicu_statistics", 
                "aicu_learning_log",
                "aicu_current_category",
                "aicu_real_time_data"
            ]
            
            print("📋 확인할 localStorage 키들:")
            for key in localStorage_keys:
                print(f"   - {key}")
            
            # 사용자 등록일 확인을 위한 시뮬레이션
            # 실제로는 브라우저에서 localStorage.getItem()을 통해 확인
            print("\n📅 사용자 등록일 확인:")
            print("   실제 등록일은 브라우저의 localStorage에서 확인해야 합니다.")
            print("   확인 방법:")
            print("   1. 브라우저 개발자 도구 열기 (F12)")
            print("   2. Application 탭 선택")
            print("   3. Local Storage > http://localhost:5000 선택")
            print("   4. 'aicu_user_data' 또는 'aicu_statistics' 키 확인")
            
            return True
            
        except Exception as e:
            print(f"❌ 중앙 데이터 확인 오류: {str(e)}")
            return False
    
    def check_user_consistency(self):
        """사용자 일치 여부 확인"""
        self.print_header("사용자 일치 여부 확인")
        
        homepage_user = self.check_homepage_user_info()
        settings_user = self.check_settings_user_info()
        
        print(f"\n📊 사용자 일치 여부 분석:")
        print(f"   홈페이지 사용자: {homepage_user or '확인 불가'}")
        print(f"   설정 페이지 사용자: {settings_user or '확인 불가'}")
        
        if homepage_user and settings_user:
            if homepage_user == settings_user:
                print(f"   ✅ 일치 여부: 일치")
                print(f"   🎉 홈페이지와 설정 페이지의 사용자가 동일합니다!")
            else:
                print(f"   ❌ 일치 여부: 불일치")
                print(f"   ⚠️ 홈페이지와 설정 페이지의 사용자가 다릅니다!")
                print(f"   🔧 수정이 필요합니다.")
        else:
            print(f"   ⚠️ 일치 여부: 확인 불가")
            print(f"   📝 일부 페이지에서 사용자 정보를 찾을 수 없습니다.")
        
        return homepage_user == settings_user if (homepage_user and settings_user) else None
    
    def get_registration_date_info(self):
        """등록일 정보 가져오기"""
        self.print_header("사용자 등록일 정보")
        
        print("📅 사용자 등록일 확인 방법:")
        print("="*50)
        print("1. 브라우저에서 http://localhost:5000 접속")
        print("2. F12 키를 눌러 개발자 도구 열기")
        print("3. Application 탭 클릭")
        print("4. 왼쪽 Local Storage > http://localhost:5000 선택")
        print("5. 다음 키들을 확인:")
        print("   - aicu_user_data")
        print("   - aicu_statistics")
        print("6. 각 키의 값에서 'registration_timestamp' 또는 'registeredAt' 확인")
        print("="*50)
        
        print("\n🔍 확인할 데이터 구조:")
        print("aicu_user_data 예시:")
        print('{')
        print('  "name": "사용자명",')
        print('  "registration_timestamp": "2025-08-21T07:18:50.575445",')
        print('  "exam_date": "2025-12-15"')
        print('}')
        
        print("\naicu_statistics 예시:")
        print('{')
        print('  "registration_timestamp": "2025-08-21T07:18:50.575445",')
        print('  "total_questions_attempted": 0,')
        print('  "total_correct_answers": 0,')
        print('  "daily_progress": {...}')
        print('}')
        
        return True
    
    def run_complete_check(self):
        """전체 사용자 일치 여부 및 등록일 확인"""
        print("🚀 사용자 일치 여부 및 등록일 확인 시작")
        print("="*70)
        
        # 1. 사용자 일치 여부 확인
        consistency_result = self.check_user_consistency()
        
        # 2. 중앙 데이터 확인
        self.check_central_data_user_info()
        
        # 3. 등록일 정보
        self.get_registration_date_info()
        
        # 4. 최종 결과
        self.print_header("최종 확인 결과")
        
        if consistency_result is True:
            print("✅ 사용자 일치 여부: 완벽한 일치")
            print("🎉 홈페이지와 설정 페이지의 사용자가 동일합니다!")
        elif consistency_result is False:
            print("❌ 사용자 일치 여부: 불일치 발견")
            print("⚠️ 홈페이지와 설정 페이지의 사용자가 다릅니다!")
            print("🔧 수정이 필요합니다.")
        else:
            print("⚠️ 사용자 일치 여부: 확인 불가")
            print("📝 일부 페이지에서 사용자 정보를 찾을 수 없습니다.")
        
        print("\n📋 다음 단계:")
        print("1. 브라우저에서 localStorage 확인하여 실제 등록일 확인")
        print("2. 사용자 불일치 시 중앙 아키텍처 데이터 동기화 필요")
        print("3. 등록일 기준 누적 통계 정확성 검증")

if __name__ == "__main__":
    checker = UserConsistencyChecker()
    checker.run_complete_check()
