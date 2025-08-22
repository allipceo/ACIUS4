#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
통계 페이지 "대문으로 돌아가기" 버튼 오류 수정 시뮬레이션
서대리가 통계 페이지의 네비게이션 오류를 수정하고 테스트합니다.
"""

import requests
import time
import json
from datetime import datetime

class StatisticsNavigationSimulation:
    def __init__(self):
        self.base_url = "http://127.0.0.1:5000"
        self.session = requests.Session()
        self.test_results = {
            "statistics_page_access": {"passed": 0, "total": 0, "details": []},
            "navigation_buttons": {"passed": 0, "total": 0, "details": []},
            "home_navigation": {"passed": 0, "total": 0, "details": []},
            "button_functionality": {"passed": 0, "total": 0, "details": []}
        }
        
    def log_test(self, category, success, message):
        """테스트 결과 로깅"""
        self.test_results[category]["total"] += 1
        if success:
            self.test_results[category]["passed"] += 1
            self.test_results[category]["details"].append(f"✅ {message}")
        else:
            self.test_results[category]["details"].append(f"❌ {message}")
        
        timestamp = datetime.now().strftime("%H:%M:%S")
        status = "✅" if success else "❌"
        print(f"[{timestamp}] {status} {category}: {message}")
    
    def test_statistics_page_access(self):
        """통계 페이지 접근 테스트"""
        print("\n=== 통계 페이지 접근 테스트 ===")
        
        try:
            # 통계 페이지 접근
            response = self.session.get(f"{self.base_url}/statistics")
            if response.status_code == 200:
                self.log_test("statistics_page_access", True, "통계 페이지 접근 성공")
                
                # 페이지 제목 확인
                if "학습 통계" in response.text:
                    self.log_test("statistics_page_access", True, "페이지 제목 정상 확인")
                else:
                    self.log_test("statistics_page_access", False, "페이지 제목 누락")
                
                # 사용자 정보 섹션 확인
                if "현재 사용자" in response.text:
                    self.log_test("statistics_page_access", True, "사용자 정보 섹션 확인")
                else:
                    self.log_test("statistics_page_access", False, "사용자 정보 섹션 누락")
                    
            else:
                self.log_test("statistics_page_access", False, f"통계 페이지 접근 실패: {response.status_code}")
                
        except Exception as e:
            self.log_test("statistics_page_access", False, f"통계 페이지 접근 테스트 오류: {str(e)}")
    
    def test_navigation_buttons(self):
        """네비게이션 버튼 테스트"""
        print("\n=== 네비게이션 버튼 테스트 ===")
        
        try:
            # 통계 페이지 접근
            response = self.session.get(f"{self.base_url}/statistics")
            if response.status_code == 200:
                # 액션 버튼들 확인
                action_buttons = ["새로운 학습 세션 시작", "통계 초기화", "대문으로 돌아가기"]
                missing_buttons = []
                
                for button in action_buttons:
                    if button not in response.text:
                        missing_buttons.append(button)
                
                if not missing_buttons:
                    self.log_test("navigation_buttons", True, "모든 액션 버튼 확인")
                else:
                    self.log_test("navigation_buttons", False, f"누락된 버튼들: {', '.join(missing_buttons)}")
                
                # 대문으로 돌아가기 버튼의 링크 확인
                if 'href="/"' in response.text:
                    self.log_test("navigation_buttons", True, "대문으로 돌아가기 링크 정상 (/ 경로)")
                elif 'href="/home"' in response.text:
                    self.log_test("navigation_buttons", False, "대문으로 돌아가기 링크 오류 (/home 경로)")
                else:
                    self.log_test("navigation_buttons", False, "대문으로 돌아가기 링크 누락")
                    
            else:
                self.log_test("navigation_buttons", False, f"네비게이션 버튼 테스트를 위한 페이지 접근 실패")
                
        except Exception as e:
            self.log_test("navigation_buttons", False, f"네비게이션 버튼 테스트 오류: {str(e)}")
    
    def test_home_navigation(self):
        """홈페이지 네비게이션 테스트"""
        print("\n=== 홈페이지 네비게이션 테스트 ===")
        
        try:
            # 홈페이지 접근 테스트
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                self.log_test("home_navigation", True, "홈페이지 접근 성공")
                
                # 홈페이지 제목 확인
                if "AICU Season 4" in response.text or "AICU" in response.text:
                    self.log_test("home_navigation", True, "홈페이지 제목 확인")
                else:
                    self.log_test("home_navigation", False, "홈페이지 제목 누락")
                    
            else:
                self.log_test("home_navigation", False, f"홈페이지 접근 실패: {response.status_code}")
                
        except Exception as e:
            self.log_test("home_navigation", False, f"홈페이지 네비게이션 테스트 오류: {str(e)}")
    
    def test_button_functionality(self):
        """버튼 기능성 테스트"""
        print("\n=== 버튼 기능성 테스트 ===")
        
        try:
            # 통계 페이지 접근
            response = self.session.get(f"{self.base_url}/statistics")
            if response.status_code == 200:
                # JavaScript 함수들 확인
                js_functions = ["startNewSession()", "resetStatistics()"]
                missing_functions = []
                
                for func in js_functions:
                    if func not in response.text:
                        missing_functions.append(func)
                
                if not missing_functions:
                    self.log_test("button_functionality", True, "JavaScript 함수들 모두 확인")
                else:
                    self.log_test("button_functionality", False, f"누락된 함수들: {', '.join(missing_functions)}")
                
                # 액션 섹션 확인
                if "🚀 액션" in response.text:
                    self.log_test("button_functionality", True, "액션 섹션 제목 확인")
                else:
                    self.log_test("button_functionality", False, "액션 섹션 제목 누락")
                    
            else:
                self.log_test("button_functionality", False, f"버튼 기능성 테스트를 위한 페이지 접근 실패")
                
        except Exception as e:
            self.log_test("button_functionality", False, f"버튼 기능성 테스트 오류: {str(e)}")
    
    def run_comprehensive_test(self):
        """종합 테스트 실행"""
        print("🚀 통계 페이지 '대문으로 돌아가기' 버튼 오류 수정 시뮬레이션 시작")
        print("=" * 70)
        
        # 서버 상태 확인
        try:
            response = self.session.get(f"{self.base_url}/")
            if response.status_code != 200:
                print("❌ 서버가 실행되지 않았습니다. 먼저 서버를 시작해주세요.")
                return
        except:
            print("❌ 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.")
            return
        
        print("✅ 서버 연결 확인됨")
        
        # 각 테스트 실행
        self.test_statistics_page_access()
        self.test_navigation_buttons()
        self.test_home_navigation()
        self.test_button_functionality()
        
        # 결과 요약
        self.display_results()
    
    def display_results(self):
        """테스트 결과 표시"""
        print("\n" + "=" * 70)
        print("📊 통계 페이지 '대문으로 돌아가기' 버튼 오류 수정 시뮬레이션 결과")
        print("=" * 70)
        
        total_passed = 0
        total_tests = 0
        
        for category, results in self.test_results.items():
            passed = results["passed"]
            total = results["total"]
            percentage = (passed / total * 100) if total > 0 else 0
            
            print(f"\n📋 {category.replace('_', ' ').title()}:")
            print(f"   결과: {passed}/{total} ({percentage:.1f}%)")
            
            for detail in results["details"]:
                print(f"   {detail}")
            
            total_passed += passed
            total_tests += total
        
        overall_percentage = (total_passed / total_tests * 100) if total_tests > 0 else 0
        print(f"\n🎯 전체 결과: {total_passed}/{total_tests} ({overall_percentage:.1f}%)")
        
        if overall_percentage >= 90:
            print("🎉 우수: 통계 페이지 네비게이션 오류가 성공적으로 수정되었습니다!")
        elif overall_percentage >= 70:
            print("✅ 양호: 대부분의 네비게이션 기능이 정상 작동합니다.")
        else:
            print("⚠️ 개선 필요: 일부 문제가 발견되었습니다.")
        
        # 권장사항
        print(f"\n💡 권장사항:")
        if overall_percentage < 100:
            print("   - 발견된 문제들을 수정해주세요.")
        print("   - 실제 사용자 테스트를 진행해주세요.")
        print("   - 다른 페이지의 네비게이션도 확인해주세요.")

if __name__ == "__main__":
    simulator = StatisticsNavigationSimulation()
    simulator.run_comprehensive_test()
