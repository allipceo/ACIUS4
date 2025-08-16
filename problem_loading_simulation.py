#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
문제 로딩 문제 진단 및 해결 시뮬레이션 프로그램
- 기본학습 페이지에서 문제가 로딩되지 않는 문제 해결
"""

import json
import time
import requests
from datetime import datetime

class ProblemLoadingSimulation:
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
        
    def test_flask_server_status(self):
        """Flask 서버 상태 테스트"""
        try:
            self.log("=== Flask 서버 상태 테스트 ===")
            
            # 홈페이지 접근 테스트
            response = requests.get(f"{self.base_url}/", timeout=5)
            if response.status_code == 200:
                self.log("✅ 홈페이지 접근 성공")
                self.record_result("Flask 서버 상태", "PASS", {
                    "status_code": response.status_code,
                    "content_length": len(response.text)
                })
            else:
                self.record_result("Flask 서버 상태", "FAIL", 
                                 error=f"홈페이지 접근 실패: HTTP {response.status_code}")
                
        except Exception as e:
            self.record_result("Flask 서버 상태", "FAIL", error=f"서버 연결 실패: {e}")
            
    def test_basic_learning_page_access(self):
        """기본학습 페이지 접근 테스트"""
        try:
            self.log("=== 기본학습 페이지 접근 테스트 ===")
            
            response = requests.get(f"{self.base_url}/basic-learning", timeout=10)
            if response.status_code == 200:
                content = response.text
                self.log(f"✅ 기본학습 페이지 접근 성공: {len(content)} 문자")
                
                # 페이지 내용 검증
                checks = {
                    "문제 텍스트 영역": "문제 텍스트가 여기에 표시됩니다" in content,
                    "로딩 중 표시": "로딩 중" in content,
                    "JavaScript 파일 로드": "basic_learning_main.js" in content,
                    "문제 풀이 영역": "문제 풀이" in content
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
                        "status_code": response.status_code,
                        "content_length": len(content),
                        "checks_passed": len([c for c in checks.values() if c])
                    })
                else:
                    self.record_result("기본학습 페이지 접근", "FAIL", 
                                     error="페이지 내용 검증 실패")
            else:
                self.record_result("기본학습 페이지 접근", "FAIL", 
                                 error=f"HTTP {response.status_code}")
                
        except Exception as e:
            self.record_result("기본학습 페이지 접근", "FAIL", error=str(e))
            
    def test_questions_api(self):
        """문제 API 테스트"""
        try:
            self.log("=== 문제 API 테스트 ===")
            
            # 전체 문제 조회
            response = requests.get(f"{self.base_url}/api/questions", timeout=10)
            if response.status_code == 200:
                data = response.json()
                questions = data.get('questions', [])
                self.log(f"✅ 전체 문제 조회 성공: {len(questions)}개 문제")
                
                if len(questions) > 0:
                    # 첫 번째 문제 상세 확인
                    first_question = questions[0]
                    question_checks = {
                        "문제 텍스트": "question" in first_question,
                        "답안": "answer" in first_question,
                        "타입": "type" in first_question,
                        "카테고리": "layer1" in first_question
                    }
                    
                    all_passed = True
                    for check_name, check_result in question_checks.items():
                        if check_result:
                            self.log(f"✅ {check_name}")
                        else:
                            self.log(f"❌ {check_name}")
                            all_passed = False
                    
                    if all_passed:
                        self.record_result("문제 API 테스트", "PASS", {
                            "total_questions": len(questions),
                            "first_question": {
                                "question": first_question.get('question', '')[:50] + '...',
                                "answer": first_question.get('answer'),
                                "type": first_question.get('type'),
                                "layer1": first_question.get('layer1')
                            }
                        })
                    else:
                        self.record_result("문제 API 테스트", "FAIL", 
                                         error="문제 데이터 구조 검증 실패")
                else:
                    self.record_result("문제 API 테스트", "FAIL", 
                                     error="문제 데이터가 없습니다")
            else:
                self.record_result("문제 API 테스트", "FAIL", 
                                 error=f"API 호출 실패: HTTP {response.status_code}")
                
        except Exception as e:
            self.record_result("문제 API 테스트", "FAIL", error=str(e))
            
    def test_javascript_files(self):
        """JavaScript 파일 접근 테스트"""
        try:
            self.log("=== JavaScript 파일 접근 테스트 ===")
            
            js_files = [
                "basic_learning_main.js",
                "central_data_manager.js",
                "realtime_sync_manager.js",
                "compatibility_layer.js",
                "quiz_data_collector.js"
            ]
            
            all_passed = True
            for js_file in js_files:
                try:
                    response = requests.get(f"{self.base_url}/static/js/{js_file}", timeout=5)
                    if response.status_code == 200:
                        self.log(f"✅ {js_file} 접근 성공")
                    else:
                        self.log(f"❌ {js_file} 접근 실패: HTTP {response.status_code}")
                        all_passed = False
                except Exception as e:
                    self.log(f"❌ {js_file} 접근 실패: {e}")
                    all_passed = False
            
            if all_passed:
                self.record_result("JavaScript 파일 접근", "PASS", {
                    "files_tested": len(js_files),
                    "files_accessible": len(js_files)
                })
            else:
                self.record_result("JavaScript 파일 접근", "FAIL", 
                                 error="일부 JavaScript 파일 접근 실패")
                
        except Exception as e:
            self.record_result("JavaScript 파일 접근", "FAIL", error=str(e))
            
    def test_questions_json_file(self):
        """questions.json 파일 테스트"""
        try:
            self.log("=== questions.json 파일 테스트 ===")
            
            # 직접 파일 읽기
            try:
                with open('static/questions.json', 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                questions = data.get('questions', [])
                self.log(f"✅ questions.json 파일 읽기 성공: {len(questions)}개 문제")
                
                if len(questions) > 0:
                    # 파일 구조 검증
                    first_question = questions[0]
                    structure_checks = {
                        "문제 텍스트": "question" in first_question,
                        "답안": "answer" in first_question,
                        "타입": "type" in first_question,
                        "카테고리": "layer1" in first_question
                    }
                    
                    all_passed = True
                    for check_name, check_result in structure_checks.items():
                        if check_result:
                            self.log(f"✅ {check_name}")
                        else:
                            self.log(f"❌ {check_name}")
                            all_passed = False
                    
                    if all_passed:
                        self.record_result("questions.json 파일", "PASS", {
                            "total_questions": len(questions),
                            "file_size": len(str(data)),
                            "structure_valid": True
                        })
                    else:
                        self.record_result("questions.json 파일", "FAIL", 
                                         error="파일 구조 검증 실패")
                else:
                    self.record_result("questions.json 파일", "FAIL", 
                                     error="문제 데이터가 없습니다")
                    
            except FileNotFoundError:
                self.record_result("questions.json 파일", "FAIL", 
                                 error="파일을 찾을 수 없습니다")
            except json.JSONDecodeError as e:
                self.record_result("questions.json 파일", "FAIL", 
                                 error=f"JSON 파싱 오류: {e}")
            except Exception as e:
                self.record_result("questions.json 파일", "FAIL", 
                                 error=f"파일 읽기 오류: {e}")
                
        except Exception as e:
            self.record_result("questions.json 파일", "FAIL", error=str(e))
            
    def test_basic_learning_javascript_logic(self):
        """기본학습 JavaScript 로직 테스트"""
        try:
            self.log("=== 기본학습 JavaScript 로직 테스트 ===")
            
            # basic_learning_main.js 파일 읽기
            try:
                with open('static/js/basic_learning_main.js', 'r', encoding='utf-8') as f:
                    content = f.read()
                
                self.log(f"✅ basic_learning_main.js 파일 읽기 성공: {len(content)} 문자")
                
                # 핵심 함수 존재 확인
                function_checks = {
                    "displayQuestion 함수": "function displayQuestion" in content,
                    "loadQuestions 함수": "function loadQuestions" in content or "loadQuestions" in content,
                    "nextQuestion 함수": "function nextQuestion" in content,
                    "previousQuestion 함수": "function previousQuestion" in content,
                    "checkAnswer 함수": "function checkAnswer" in content
                }
                
                all_passed = True
                for check_name, check_result in function_checks.items():
                    if check_result:
                        self.log(f"✅ {check_name}")
                    else:
                        self.log(f"❌ {check_name}")
                        all_passed = False
                
                if all_passed:
                    self.record_result("기본학습 JavaScript 로직", "PASS", {
                        "functions_found": len([c for c in function_checks.values() if c]),
                        "total_functions": len(function_checks)
                    })
                else:
                    self.record_result("기본학습 JavaScript 로직", "FAIL", 
                                     error="필수 함수 누락")
                    
            except FileNotFoundError:
                self.record_result("기본학습 JavaScript 로직", "FAIL", 
                                 error="basic_learning_main.js 파일을 찾을 수 없습니다")
            except Exception as e:
                self.record_result("기본학습 JavaScript 로직", "FAIL", 
                                 error=f"파일 읽기 오류: {e}")
                
        except Exception as e:
            self.record_result("기본학습 JavaScript 로직", "FAIL", error=str(e))
            
    def run_all_tests(self):
        """모든 테스트 실행"""
        self.log("🚀 문제 로딩 문제 진단 시뮬레이션 시작")
        self.log("=" * 60)
        
        # 테스트 실행
        self.test_flask_server_status()
        self.test_basic_learning_page_access()
        self.test_questions_api()
        self.test_javascript_files()
        self.test_questions_json_file()
        self.test_basic_learning_javascript_logic()
        
        # 결과 요약
        self.generate_report()
        
    def generate_report(self):
        """시뮬레이션 결과 리포트 생성"""
        self.log("=" * 60)
        self.log("📊 문제 로딩 문제 진단 결과")
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
        
        # 문제 진단 및 해결 방안
        self.log(f"\n🔍 문제 진단:")
        if success_rate == 100:
            self.log("   🎉 모든 테스트 통과 - 문제 로딩이 정상적으로 작동합니다!")
        elif success_rate >= 80:
            self.log("   ✅ 대부분 정상 - 일부 문제만 해결하면 됩니다.")
        else:
            self.log("   ⚠️ 여러 문제 발견 - 체계적인 해결이 필요합니다.")
            
        # 해결 방안 제시
        self.log(f"\n💡 해결 방안:")
        if "Flask 서버 상태" in [r["test"] for r in self.results if r["status"] == "FAIL"]:
            self.log("   1. Flask 서버 재시작 필요")
        if "문제 API 테스트" in [r["test"] for r in self.results if r["status"] == "FAIL"]:
            self.log("   2. API 엔드포인트 수정 필요")
        if "questions.json 파일" in [r["test"] for r in self.results if r["status"] == "FAIL"]:
            self.log("   3. questions.json 파일 경로 또는 구조 수정 필요")
        if "JavaScript 파일 접근" in [r["test"] for r in self.results if r["status"] == "FAIL"]:
            self.log("   4. JavaScript 파일 경로 수정 필요")
        if "기본학습 JavaScript 로직" in [r["test"] for r in self.results if r["status"] == "FAIL"]:
            self.log("   5. JavaScript 함수 구현 수정 필요")
            
        # 결과 저장
        report_data = {
            "timestamp": datetime.now().isoformat(),
            "test_summary": self.test_data,
            "detailed_results": self.results
        }
        
        with open("problem_loading_simulation_report.json", "w", encoding="utf-8") as f:
            json.dump(report_data, f, ensure_ascii=False, indent=2)
            
        self.log(f"\n💾 상세 리포트가 'problem_loading_simulation_report.json'에 저장되었습니다.")

if __name__ == "__main__":
    # 시뮬레이션 실행
    simulator = ProblemLoadingSimulation()
    simulator.run_all_tests()
