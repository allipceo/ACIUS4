#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
기본학습 UI 변경사항 시뮬레이션 및 검증 프로그램
- 우측 상단 "홈으로" 버튼 검증
- 좌측하단 "이전문제" 버튼 검증
- 네비게이션 로직 검증
"""

import json
import time
import requests
from datetime import datetime

class BasicLearningUISimulation:
    def __init__(self):
        self.base_url = "http://localhost:5000"
        self.results = []
        self.test_data = {
            "total_tests": 0,
            "passed": 0,
            "failed": 0,
            "errors": []
        }
        
    def log(self, message, level="INFO"):
        """로그 출력"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def record_result(self, test_name, status, details=None, error=None):
        """테스트 결과 기록"""
        self.test_data["total_tests"] += 1
        
        result = {
            "test": test_name,
            "status": status,
            "timestamp": datetime.now().isoformat(),
            "details": details
        }
        
        if error:
            result["error"] = str(error)
            self.test_data["errors"].append(error)
            
        if status == "PASS":
            self.test_data["passed"] += 1
            self.log(f"✅ {test_name}: 성공", "PASS")
        else:
            self.test_data["failed"] += 1
            self.log(f"❌ {test_name}: 실패 - {error}", "FAIL")
            
        self.results.append(result)
        
    def test_basic_learning_page_access(self):
        """기본학습 페이지 접근 테스트"""
        try:
            self.log("=== 기본학습 페이지 접근 테스트 ===")
            
            # 직접 파일 내용 읽기
            try:
                with open('templates/basic_learning.html', 'r', encoding='utf-8') as f:
                    content = f.read()
                self.log(f"기본학습 HTML 파일 읽기 성공: {len(content)} 문자")
            except Exception as e:
                self.log(f"파일 읽기 실패: {e}")
                self.record_result("기본학습 페이지 접근", "FAIL", error=f"파일 읽기 실패: {e}")
                return
            
            # HTML 내용 검증
            checks = {
                "홈으로 버튼 존재": "홈으로" in content,
                "이전문제 버튼 존재": "이전문제" in content,
                "기본학습메뉴로 버튼 제거": "기본학습메뉴로" not in content,
                "메뉴로 돌아가기 버튼 제거": "메뉴로 돌아가기" not in content,
                "previousQuestion 함수 호출": "previousQuestion()" in content,
                "goToHome 함수 호출": "goToHome()" in content
            }
            
            all_passed = True
            for check_name, check_result in checks.items():
                if check_result:
                    self.log(f"✅ {check_name}")
                else:
                    self.log(f"❌ {check_name}")
                    all_passed = False
            
            if all_passed:
                self.record_result("기본학습 페이지 접근", "PASS", {
                    "content_length": len(content),
                    "checks_passed": len([c for c in checks.values() if c])
                })
            else:
                self.record_result("기본학습 페이지 접근", "FAIL", 
                                 error="HTML 내용 검증 실패")
                
        except Exception as e:
            self.log(f"예외 발생: {e}")
            self.record_result("기본학습 페이지 접근", "FAIL", error=str(e))
            
    def test_navigation_button_logic(self):
        """네비게이션 버튼 로직 테스트"""
        try:
            self.log("=== 네비게이션 버튼 로직 테스트 ===")
            
            # 직접 파일 내용 읽기
            try:
                with open('templates/basic_learning.html', 'r', encoding='utf-8') as f:
                    content = f.read()
                self.log(f"기본학습 HTML 파일 읽기 성공: {len(content)} 문자")
            except Exception as e:
                self.log(f"파일 읽기 실패: {e}")
                self.record_result("네비게이션 버튼 로직", "FAIL", error=f"파일 읽기 실패: {e}")
                return
            
            # updateNavigationButton 함수 로직 검증
            logic_checks = {
                "기본학습 모드 홈으로 버튼": "기본학습 모드 - 항상 홈으로" in content,
                "goToHome 함수 정의": "function goToHome()" in content,
                "previousQuestion 함수 정의": "function previousQuestion()" in content
            }
            
            all_passed = True
            for check_name, check_result in logic_checks.items():
                if check_result:
                    self.log(f"✅ {check_name}")
                else:
                    self.log(f"❌ {check_name}")
                    all_passed = False
            
            if all_passed:
                self.record_result("네비게이션 버튼 로직", "PASS", {
                    "logic_checks_passed": len([c for c in logic_checks.values() if c])
                })
            else:
                self.record_result("네비게이션 버튼 로직", "FAIL", 
                                 error="JavaScript 로직 검증 실패")
                
        except Exception as e:
            self.record_result("네비게이션 버튼 로직", "FAIL", error=str(e))
            
    def test_previous_question_function(self):
        """이전문제 함수 검증"""
        try:
            self.log("=== 이전문제 함수 검증 ===")
            
            # 직접 파일 내용 읽기
            try:
                with open('static/js/basic_learning_main.js', 'r', encoding='utf-8') as f:
                    content = f.read()
                self.log(f"basic_learning_main.js 파일 읽기 성공: {len(content)} 문자")
            except Exception as e:
                self.log(f"파일 읽기 실패: {e}")
                self.record_result("이전문제 함수 검증", "FAIL", error=f"파일 읽기 실패: {e}")
                return
            
            # previousQuestion 함수 구현 검증
            function_checks = {
                "previousQuestion 함수 존재": "function previousQuestion()" in content,
                "currentQuestionIndex 감소 로직": "currentQuestionIndex--" in content,
                "첫 번째 문제 체크": "currentQuestionIndex > 0" in content,
                "displayQuestion 호출": "displayQuestion(currentQuestionIndex)" in content,
                "첫 번째 문제 메시지": "첫 번째 문제입니다" in content
            }
            
            all_passed = True
            for check_name, check_result in function_checks.items():
                if check_result:
                    self.log(f"✅ {check_name}")
                else:
                    self.log(f"❌ {check_name}")
                    all_passed = False
            
            if all_passed:
                self.record_result("이전문제 함수 검증", "PASS", {
                    "function_checks_passed": len([c for c in function_checks.values() if c])
                })
            else:
                self.record_result("이전문제 함수 검증", "FAIL", 
                                 error="함수 구현 검증 실패")
                
        except Exception as e:
            self.record_result("이전문제 함수 검증", "FAIL", error=str(e))
            
    def test_home_button_function(self):
        """홈으로 버튼 함수 검증"""
        try:
            self.log("=== 홈으로 버튼 함수 검증 ===")
            
            # 직접 파일 내용 읽기
            try:
                with open('templates/basic_learning.html', 'r', encoding='utf-8') as f:
                    content = f.read()
                self.log(f"기본학습 HTML 파일 읽기 성공: {len(content)} 문자")
            except Exception as e:
                self.log(f"파일 읽기 실패: {e}")
                self.record_result("홈으로 버튼 함수 검증", "FAIL", error=f"파일 읽기 실패: {e}")
                return
            
            # goToHome 함수 구현 검증
            home_checks = {
                "goToHome 함수 정의": "function goToHome()" in content,
                "홈페이지 이동": "window.location.href = '/home'" in content or "window.location.href = '/'" in content,
                "홈으로 버튼 onclick": "onclick=\"goToHome()\"" in content
            }
            
            all_passed = True
            for check_name, check_result in home_checks.items():
                if check_result:
                    self.log(f"✅ {check_name}")
                else:
                    self.log(f"❌ {check_name}")
                    all_passed = False
            
            if all_passed:
                self.record_result("홈으로 버튼 함수 검증", "PASS", {
                    "home_checks_passed": len([c for c in home_checks.values() if c])
                })
            else:
                self.record_result("홈으로 버튼 함수 검증", "FAIL", 
                                 error="홈 버튼 함수 검증 실패")
                
        except Exception as e:
            self.record_result("홈으로 버튼 함수 검증", "FAIL", error=str(e))
            
    def test_ui_consistency(self):
        """UI 일관성 테스트"""
        try:
            self.log("=== UI 일관성 테스트 ===")
            
            # 직접 파일 내용 읽기
            try:
                with open('templates/basic_learning.html', 'r', encoding='utf-8') as f:
                    basic_content = f.read()
                with open('templates/large_category_learning.html', 'r', encoding='utf-8') as f:
                    large_content = f.read()
                self.log(f"HTML 파일 읽기 성공: 기본학습({len(basic_content)}), 대분류학습({len(large_content)})")
            except Exception as e:
                self.log(f"파일 읽기 실패: {e}")
                self.record_result("UI 일관성 테스트", "FAIL", error=f"파일 읽기 실패: {e}")
                return
            
            # UI 일관성 검증
            consistency_checks = {
                "기본학습 홈으로 버튼": "홈으로" in basic_content and "기본학습메뉴로" not in basic_content,
                "대분류학습 조건부 버튼": "대분류메뉴로" in large_content or "홈으로" in large_content,
                "이전문제 버튼": "이전문제" in basic_content,
                "다음문제 버튼": "다음 문제" in basic_content,
                "정답확인 버튼": "정답 확인" in basic_content
            }
            
            all_passed = True
            for check_name, check_result in consistency_checks.items():
                if check_result:
                    self.log(f"✅ {check_name}")
                else:
                    self.log(f"❌ {check_name}")
                    all_passed = False
            
            if all_passed:
                self.record_result("UI 일관성 테스트", "PASS", {
                    "consistency_checks_passed": len([c for c in consistency_checks.values() if c])
                })
            else:
                self.record_result("UI 일관성 테스트", "FAIL", 
                                 error="UI 일관성 검증 실패")
                
        except Exception as e:
            self.record_result("UI 일관성 테스트", "FAIL", error=str(e))
            
    def run_all_tests(self):
        """모든 테스트 실행"""
        self.log("🚀 기본학습 UI 변경사항 시뮬레이션 시작")
        self.log("=" * 60)
        
        # 테스트 실행
        self.test_basic_learning_page_access()
        self.test_navigation_button_logic()
        self.test_previous_question_function()
        self.test_home_button_function()
        self.test_ui_consistency()
        
        # 결과 요약
        self.generate_report()
        
    def generate_report(self):
        """시뮬레이션 결과 리포트 생성"""
        self.log("=" * 60)
        self.log("📊 기본학습 UI 변경사항 시뮬레이션 결과")
        self.log("=" * 60)
        
        # 통계
        total = self.test_data["total_tests"]
        passed = self.test_data["passed"]
        failed = self.test_data["failed"]
        success_rate = (passed / total * 100) if total > 0 else 0
        
        self.log(f"📈 테스트 통계:")
        self.log(f"   - 총 테스트: {total}개")
        self.log(f"   - 성공: {passed}개")
        self.log(f"   - 실패: {failed}개")
        self.log(f"   - 성공률: {success_rate:.1f}%")
        
        # 상세 결과
        self.log(f"\n📋 상세 결과:")
        for result in self.results:
            status_icon = "✅" if result["status"] == "PASS" else "❌"
            self.log(f"   {status_icon} {result['test']}")
            if result.get("details"):
                for key, value in result["details"].items():
                    self.log(f"      - {key}: {value}")
        
        # 오류 목록
        if self.test_data["errors"]:
            self.log(f"\n❌ 발견된 오류:")
            for i, error in enumerate(self.test_data["errors"], 1):
                self.log(f"   {i}. {error}")
        
        # 최종 평가
        self.log(f"\n🎯 최종 평가:")
        if success_rate == 100:
            self.log("   🎉 완벽한 상태 ✅")
            self.log("   모든 UI 변경사항이 정상적으로 구현되었습니다!")
        elif success_rate >= 80:
            self.log("   ✅ 양호한 상태")
            self.log("   대부분의 기능이 정상 작동합니다.")
        else:
            self.log("   ⚠️ 개선 필요")
            self.log("   일부 기능에 문제가 있습니다.")
            
        # 결과 저장
        report_data = {
            "timestamp": datetime.now().isoformat(),
            "test_summary": self.test_data,
            "detailed_results": self.results
        }
        
        with open("basic_learning_ui_simulation_report.json", "w", encoding="utf-8") as f:
            json.dump(report_data, f, ensure_ascii=False, indent=2)
            
        self.log(f"\n💾 상세 리포트가 'basic_learning_ui_simulation_report.json'에 저장되었습니다.")

if __name__ == "__main__":
    # 시뮬레이션 실행
    simulator = BasicLearningUISimulation()
    simulator.run_all_tests()
