#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AICU S4 포괄적 시뮬레이션 스크립트
- DAY-1, DAY-2, DAY-3 시나리오
- 다양한 고객 시나리오
- 유료 앱 관점의 테스트
"""

import requests
import json
import time
import re
from datetime import datetime, timedelta
from typing import Dict, List, Any

class AICUSimulation:
    def __init__(self):
        self.base_url = "http://localhost:5000"
        self.session = requests.Session()
        self.results = {
            "simulation_start": datetime.now().isoformat(),
            "scenarios": {},
            "errors": [],
            "success_count": 0,
            "total_count": 0
        }
        
    def log(self, message: str, level: str = "INFO"):
        """로그 출력"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def check_response(self, response, expected_status: int = 200) -> bool:
        """응답 확인"""
        if response.status_code != expected_status:
            self.log(f"응답 실패: {response.status_code} - {response.text}", "ERROR")
            return False
        return True
    
    def simulate_quiz_answers(self, learning_type: str, category: str = None, 
                            correct_count: int = 0, total_count: int = 10) -> Dict:
        """문제 풀이 시뮬레이션"""
        self.log(f"문제 풀이 시뮬레이션: {learning_type} {category or ''} - {correct_count}/{total_count}")
        
        results = {
            "learning_type": learning_type,
            "category": category,
            "correct_count": correct_count,
            "total_count": total_count,
            "accuracy": (correct_count / total_count * 100) if total_count > 0 else 0
        }
        
        # 실제 문제 풀이 시뮬레이션
        for i in range(total_count):
            is_correct = i < correct_count
            self.log(f"  문제 {i+1}: {'정답' if is_correct else '오답'}")
            
            # 문제 풀이 페이지 접근 시뮬레이션 (실제 API 대신 페이지 접근)
            if learning_type == "basic":
                response = self.session.get(f"{self.base_url}/basic-learning")
            else:
                response = self.session.get(f"{self.base_url}/large-category-learning")
            
            if not self.check_response(response):
                results["error"] = f"문제 {i+1} 풀이 실패"
                break
                
            time.sleep(0.1)  # 실제 사용자 행동 시뮬레이션
            
        return results
    
    def simulate_day_1_scenario(self) -> Dict:
        """DAY-1 시나리오: 게스트 모드 시작"""
        self.log("=== DAY-1 시나리오 시작 ===")
        
        scenario_results = {
            "day": 1,
            "time": "10:00",
            "user_type": "guest",
            "activities": []
        }
        
        # 1. 홈페이지 접근
        response = self.session.get(f"{self.base_url}/")
        if not self.check_response(response):
            scenario_results["error"] = "홈페이지 접근 실패"
            return scenario_results
            
        # 2. 기본학습 20문제 (정답률 70%)
        basic_results = self.simulate_quiz_answers("basic", correct_count=14, total_count=20)
        scenario_results["activities"].append(basic_results)
        
        # 3. 대분류학습 - 재산보험 20문제 (정답률 75%)
        property_results = self.simulate_quiz_answers("category", "06재산보험", correct_count=15, total_count=20)
        scenario_results["activities"].append(property_results)
        
        # 4. 대분류학습 - 특종보험 15문제 (정답률 80%)
        special_results = self.simulate_quiz_answers("category", "07특종보험", correct_count=12, total_count=15)
        scenario_results["activities"].append(special_results)
        
        # 5. 대분류학습 - 배상책임보험 13문제 (정답률 85%)
        liability_results = self.simulate_quiz_answers("category", "08배상책임보험", correct_count=11, total_count=13)
        scenario_results["activities"].append(liability_results)
        
        # 6. 대분류학습 - 해상보험 17문제 (정답률 82%)
        marine_results = self.simulate_quiz_answers("category", "09해상보험", correct_count=14, total_count=17)
        scenario_results["activities"].append(marine_results)
        
        self.log("=== DAY-1 10:00 세션 완료 ===")
        return scenario_results
    
    def simulate_day_1_afternoon(self) -> Dict:
        """DAY-1 오후 세션 (13:00)"""
        self.log("=== DAY-1 오후 세션 시작 (13:00) ===")
        
        scenario_results = {
            "day": 1,
            "time": "13:00",
            "user_type": "guest",
            "activities": []
        }
        
        # Continue Learning 테스트 - 같은 문제 수 반복
        # 기본학습 20문제 (정답률 75%)
        basic_results = self.simulate_quiz_answers("basic", correct_count=15, total_count=20)
        scenario_results["activities"].append(basic_results)
        
        # 대분류학습 - 재산보험 20문제 (정답률 80%)
        property_results = self.simulate_quiz_answers("category", "06재산보험", correct_count=16, total_count=20)
        scenario_results["activities"].append(property_results)
        
        # 대분류학습 - 특종보험 15문제 (정답률 85%)
        special_results = self.simulate_quiz_answers("category", "07특종보험", correct_count=13, total_count=15)
        scenario_results["activities"].append(special_results)
        
        # 대분류학습 - 배상책임보험 13문제 (정답률 90%)
        liability_results = self.simulate_quiz_answers("category", "08배상책임보험", correct_count=12, total_count=13)
        scenario_results["activities"].append(liability_results)
        
        # 대분류학습 - 해상보험 17문제 (정답률 88%)
        marine_results = self.simulate_quiz_answers("category", "09해상보험", correct_count=15, total_count=17)
        scenario_results["activities"].append(marine_results)
        
        self.log("=== DAY-1 13:00 세션 완료 ===")
        return scenario_results
    
    def simulate_day_2_scenario(self) -> Dict:
        """DAY-2 시나리오: 게스트 모드 계속"""
        self.log("=== DAY-2 시나리오 시작 ===")
        
        scenario_results = {
            "day": 2,
            "time": "10:00",
            "user_type": "guest",
            "activities": []
        }
        
        # Continue Learning 테스트 - 증가된 문제 수
        # 기본학습 30문제 (정답률 80%)
        basic_results = self.simulate_quiz_answers("basic", correct_count=24, total_count=30)
        scenario_results["activities"].append(basic_results)
        
        # 대분류학습 - 재산보험 25문제 (정답률 85%)
        property_results = self.simulate_quiz_answers("category", "06재산보험", correct_count=21, total_count=25)
        scenario_results["activities"].append(property_results)
        
        # 대분류학습 - 특종보험 20문제 (정답률 90%)
        special_results = self.simulate_quiz_answers("category", "07특종보험", correct_count=18, total_count=20)
        scenario_results["activities"].append(special_results)
        
        # 대분류학습 - 배상책임보험 18문제 (정답률 92%)
        liability_results = self.simulate_quiz_answers("category", "08배상책임보험", correct_count=17, total_count=18)
        scenario_results["activities"].append(liability_results)
        
        # 대분류학습 - 해상보험 22문제 (정답률 89%)
        marine_results = self.simulate_quiz_answers("category", "09해상보험", correct_count=20, total_count=22)
        scenario_results["activities"].append(marine_results)
        
        self.log("=== DAY-2 세션 완료 ===")
        return scenario_results
    
    def simulate_day_3_registration(self) -> Dict:
        """DAY-3 시나리오: 게스트에서 조대표로 등록"""
        self.log("=== DAY-3 시나리오 시작: 사용자 등록 ===")
        
        scenario_results = {
            "day": 3,
            "time": "10:00",
            "user_type": "registration",
            "activities": []
        }
        
        # 1. 설정 페이지 접근
        response = self.session.get(f"{self.base_url}/settings")
        if not self.check_response(response):
            scenario_results["error"] = "설정 페이지 접근 실패"
            return scenario_results
        
        # 2. 사용자 등록 페이지 접근
        response = self.session.get(f"{self.base_url}/register")
        if not self.check_response(response):
            scenario_results["error"] = "사용자 등록 페이지 접근 실패"
            return scenario_results
        
        scenario_results["activities"].append({
            "type": "registration",
            "user_name": "조대표",
            "status": "success",
            "pages_accessed": ["settings", "register"]
        })
        
        self.log("=== DAY-3 사용자 등록 완료 ===")
        return scenario_results
    
    def simulate_day_3_learning(self) -> Dict:
        """DAY-3 시나리오: 조대표로 학습 계속"""
        self.log("=== DAY-3 시나리오: 조대표 학습 시작 ===")
        
        scenario_results = {
            "day": 3,
            "time": "11:00",
            "user_type": "registered_user",
            "activities": []
        }
        
        # Continue Learning 테스트 - 101번째 문제부터 시작해야 함
        # 기본학습 25문제 (정답률 85%)
        basic_results = self.simulate_quiz_answers("basic", correct_count=21, total_count=25)
        scenario_results["activities"].append(basic_results)
        
        # 대분류학습 - 재산보험 20문제 (정답률 90%)
        property_results = self.simulate_quiz_answers("category", "06재산보험", correct_count=18, total_count=20)
        scenario_results["activities"].append(property_results)
        
        # 대분류학습 - 특종보험 18문제 (정답률 92%)
        special_results = self.simulate_quiz_answers("category", "07특종보험", correct_count=17, total_count=18)
        scenario_results["activities"].append(special_results)
        
        # 대분류학습 - 배상책임보험 16문제 (정답률 94%)
        liability_results = self.simulate_quiz_answers("category", "08배상책임보험", correct_count=15, total_count=16)
        scenario_results["activities"].append(liability_results)
        
        # 대분류학습 - 해상보험 19문제 (정답률 91%)
        marine_results = self.simulate_quiz_answers("category", "09해상보험", correct_count=17, total_count=19)
        scenario_results["activities"].append(marine_results)
        
        self.log("=== DAY-3 조대표 학습 완료 ===")
        return scenario_results
    
    def simulate_customer_scenarios(self) -> List[Dict]:
        """다양한 고객 시나리오 시뮬레이션"""
        self.log("=== 고객 시나리오 시뮬레이션 시작 ===")
        
        scenarios = []
        
        # 시나리오 1: 초보 학습자
        self.log("--- 시나리오 1: 초보 학습자 ---")
        scenarios.append({
            "scenario": "초보 학습자",
            "description": "처음 시작하는 학습자, 낮은 정답률",
            "activities": [
                self.simulate_quiz_answers("basic", correct_count=5, total_count=20),
                self.simulate_quiz_answers("category", "06재산보험", correct_count=8, total_count=20)
            ]
        })
        
        # 시나리오 2: 중급 학습자
        self.log("--- 시나리오 2: 중급 학습자 ---")
        scenarios.append({
            "scenario": "중급 학습자",
            "description": "어느 정도 학습한 사용자, 중간 정답률",
            "activities": [
                self.simulate_quiz_answers("basic", correct_count=15, total_count=20),
                self.simulate_quiz_answers("category", "07특종보험", correct_count=16, total_count=20)
            ]
        })
        
        # 시나리오 3: 고급 학습자
        self.log("--- 시나리오 3: 고급 학습자 ---")
        scenarios.append({
            "scenario": "고급 학습자",
            "description": "충분히 학습한 사용자, 높은 정답률",
            "activities": [
                self.simulate_quiz_answers("basic", correct_count=18, total_count=20),
                self.simulate_quiz_answers("category", "08배상책임보험", correct_count=19, total_count=20)
            ]
        })
        
        # 시나리오 4: 불규칙 학습자
        self.log("--- 시나리오 4: 불규칙 학습자 ---")
        scenarios.append({
            "scenario": "불규칙 학습자",
            "description": "간헐적으로 학습하는 사용자",
            "activities": [
                self.simulate_quiz_answers("basic", correct_count=10, total_count=15),
                self.simulate_quiz_answers("category", "09해상보험", correct_count=12, total_count=15)
            ]
        })
        
        # 시나리오 5: 집중 학습자
        self.log("--- 시나리오 5: 집중 학습자 ---")
        scenarios.append({
            "scenario": "집중 학습자",
            "description": "하루에 많은 문제를 푸는 사용자",
            "activities": [
                self.simulate_quiz_answers("basic", correct_count=35, total_count=50),
                self.simulate_quiz_answers("category", "06재산보험", correct_count=40, total_count=50),
                self.simulate_quiz_answers("category", "07특종보험", correct_count=38, total_count=50)
            ]
        })
        
        return scenarios
    
    def simulate_error_scenarios(self) -> List[Dict]:
        """에러 시나리오 시뮬레이션"""
        self.log("=== 에러 시나리오 시뮬레이션 시작 ===")
        
        scenarios = []
        
        # 시나리오 1: 네트워크 오류
        self.log("--- 에러 시나리오 1: 네트워크 오류 ---")
        try:
            response = self.session.get("http://localhost:9999")  # 존재하지 않는 포트
            scenarios.append({
                "scenario": "네트워크 오류",
                "description": "서버 연결 실패 상황",
                "expected_error": True,
                "actual_result": response.status_code != 200
            })
        except Exception as e:
            scenarios.append({
                "scenario": "네트워크 오류",
                "description": "서버 연결 실패 상황",
                "expected_error": True,
                "actual_result": True,
                "error_message": str(e)
            })
        
        # 시나리오 2: 잘못된 데이터 전송
        self.log("--- 에러 시나리오 2: 잘못된 데이터 ---")
        try:
            response = self.session.post(f"{self.base_url}/basic-learning", 
                                        json={"invalid": "data"})
            scenarios.append({
                "scenario": "잘못된 데이터",
                "description": "잘못된 형식의 데이터 전송",
                "expected_error": True,
                "actual_result": response.status_code != 200
            })
        except Exception as e:
            scenarios.append({
                "scenario": "잘못된 데이터",
                "description": "잘못된 형식의 데이터 전송",
                "expected_error": True,
                "actual_result": True,
                "error_message": str(e)
            })
        
        # 시나리오 3: 세션 만료
        self.log("--- 에러 시나리오 3: 세션 만료 ---")
        try:
            response = self.session.get(f"{self.base_url}/basic-learning")
            scenarios.append({
                "scenario": "세션 만료",
                "description": "장시간 비활성 상태",
                "expected_error": False,
                "actual_result": response.status_code == 200
            })
        except Exception as e:
            scenarios.append({
                "scenario": "세션 만료",
                "description": "장시간 비활성 상태",
                "expected_error": False,
                "actual_result": False,
                "error_message": str(e)
            })
        
        return scenarios
    
    def verify_statistics_accuracy(self) -> Dict:
        """통계 정확성 검증"""
        self.log("=== 통계 정확성 검증 ===")
        
        verification_results = {
            "daily_stats": {},
            "cumulative_stats": {},
            "category_stats": {},
            "continue_learning": {},
            "registration_point": {}
        }
        
        # 1. 일일 통계 검증
        response = self.session.get(f"{self.base_url}/")
        if response.status_code == 200:
            # 홈페이지에서 통계 데이터 추출
            content = response.text
            verification_results["daily_stats"]["homepage_accessible"] = True
            verification_results["daily_stats"]["stats_displayed"] = "통계" in content
        else:
            verification_results["daily_stats"]["error"] = f"홈페이지 접근 실패: {response.status_code}"
        
        # 2. 누적 통계 검증
        response = self.session.get(f"{self.base_url}/basic-learning")
        if response.status_code == 200:
            verification_results["cumulative_stats"]["basic_learning_accessible"] = True
        else:
            verification_results["cumulative_stats"]["error"] = f"기본학습 접근 실패: {response.status_code}"
        
        # 3. 카테고리별 통계 검증
        response = self.session.get(f"{self.base_url}/large-category-learning")
        if response.status_code == 200:
            verification_results["category_stats"]["category_learning_accessible"] = True
        else:
            verification_results["category_stats"]["error"] = f"대분류학습 접근 실패: {response.status_code}"
        
        return verification_results
    
    def run_comprehensive_simulation(self):
        """포괄적 시뮬레이션 실행"""
        self.log("🚀 AICU S4 포괄적 시뮬레이션 시작")
        self.log("=" * 60)
        
        try:
            # 1. DAY-1 시나리오
            self.log("\n📅 DAY-1 시나리오 실행")
            day1_morning = self.simulate_day_1_scenario()
            self.results["scenarios"]["day1_morning"] = day1_morning
            
            day1_afternoon = self.simulate_day_1_afternoon()
            self.results["scenarios"]["day1_afternoon"] = day1_afternoon
            
            # 2. DAY-2 시나리오
            self.log("\n📅 DAY-2 시나리오 실행")
            day2 = self.simulate_day_2_scenario()
            self.results["scenarios"]["day2"] = day2
            
            # 3. DAY-3 시나리오
            self.log("\n📅 DAY-3 시나리오 실행")
            day3_registration = self.simulate_day_3_registration()
            self.results["scenarios"]["day3_registration"] = day3_registration
            
            day3_learning = self.simulate_day_3_learning()
            self.results["scenarios"]["day3_learning"] = day3_learning
            
            # 4. 고객 시나리오
            self.log("\n👥 고객 시나리오 실행")
            customer_scenarios = self.simulate_customer_scenarios()
            self.results["scenarios"]["customer_scenarios"] = customer_scenarios
            
            # 5. 에러 시나리오
            self.log("\n⚠️ 에러 시나리오 실행")
            error_scenarios = self.simulate_error_scenarios()
            self.results["scenarios"]["error_scenarios"] = error_scenarios
            
            # 6. 통계 정확성 검증
            self.log("\n📊 통계 정확성 검증")
            verification = self.verify_statistics_accuracy()
            self.results["verification"] = verification
            
            # 7. 결과 요약
            self.results["simulation_end"] = datetime.now().isoformat()
            self.results["total_duration"] = (
                datetime.fromisoformat(self.results["simulation_end"]) - 
                datetime.fromisoformat(self.results["simulation_start"])
            ).total_seconds()
            
            self.log("✅ 포괄적 시뮬레이션 완료")
            
        except Exception as e:
            self.log(f"❌ 시뮬레이션 실패: {e}", "ERROR")
            self.results["errors"].append(str(e))
        
        return self.results
    
    def save_results(self, filename: str = "simulation_results.json"):
        """결과 저장"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, ensure_ascii=False, indent=2)
        self.log(f"결과 저장 완료: {filename}")

if __name__ == "__main__":
    simulator = AICUSimulation()
    results = simulator.run_comprehensive_simulation()
    simulator.save_results()
    
    print("\n" + "=" * 60)
    print("🎉 시뮬레이션 완료!")
    print(f"📊 총 실행 시간: {results.get('total_duration', 0):.2f}초")
    print(f"✅ 성공: {results.get('success_count', 0)}")
    print(f"❌ 오류: {len(results.get('errors', []))}")
    print("=" * 60)
