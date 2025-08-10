#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AICU Season4 Statistics Handler Module
통계 시스템, 진도 관리, 성과 분석

작성자: 노팀장
작성일: 2025년 8월 7일
브랜치: develop01
"""

import json
import time
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import os


class StatsHandler:
    """통계 처리 핵심 클래스"""
    
    # 통계 데이터 파일 경로
    STATS_FILE_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "user_stats.json")
    
    def __init__(self, user_id: str = "default_user"):
        """
        StatsHandler 초기화
        
        Args:
            user_id: 사용자 식별자
        """
        self.user_id = user_id
        self.session_start_time = time.time()
        self.stats_data: Dict[str, Any] = {}
        
        # 기본 통계 구조
        self.default_stats = {
            "user_id": user_id,
            "total_questions_attempted": 0,
            "total_correct": 0,
            "total_wrong": 0,
            "accuracy_rate": 0.0,
            "study_sessions": [],
            "category_stats": {},
            "daily_progress": {},
            "best_streak": 0,
            "current_streak": 0,
            "total_study_time": 0,
            "last_study_date": "",
            "created_date": datetime.now().isoformat(),
            "updated_date": datetime.now().isoformat()
        }
        
        self.load_stats()
        
    def load_stats(self) -> bool:
        """
        사용자 통계 데이터 로드
        
        Returns:
            bool: 로드 성공 여부
        """
        try:
            if os.path.exists(self.STATS_FILE_PATH):
                with open(self.STATS_FILE_PATH, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                # 사용자별 통계 찾기
                users_stats = data.get("users", {})
                if self.user_id in users_stats:
                    self.stats_data = users_stats[self.user_id]
                    print(f"✅ {self.user_id} 통계 데이터 로드 완료")
                    return True
                else:
                    # 새 사용자 - 기본 통계 생성
                    self.stats_data = self.default_stats.copy()
                    print(f"📊 {self.user_id} 새 사용자 통계 생성")
                    return True
            else:
                # 통계 파일 없음 - 새로 생성
                self.stats_data = self.default_stats.copy()
                print("📊 새 통계 시스템 초기화")
                return True
                
        except Exception as e:
            print(f"❌ 통계 로드 실패: {str(e)}")
            self.stats_data = self.default_stats.copy()
            return False
            
    def save_stats(self) -> bool:
        """
        사용자 통계 데이터 저장
        
        Returns:
            bool: 저장 성공 여부
        """
        try:
            # 업데이트 시간 갱신
            self.stats_data["updated_date"] = datetime.now().isoformat()
            
            # 기존 데이터 로드
            all_stats = {"users": {}}
            if os.path.exists(self.STATS_FILE_PATH):
                with open(self.STATS_FILE_PATH, 'r', encoding='utf-8') as f:
                    all_stats = json.load(f)
            
            # 현재 사용자 통계 업데이트
            if "users" not in all_stats:
                all_stats["users"] = {}
            all_stats["users"][self.user_id] = self.stats_data
            
            # 데이터 폴더 생성
            os.makedirs(os.path.dirname(self.STATS_FILE_PATH), exist_ok=True)
            
            # 파일 저장
            with open(self.STATS_FILE_PATH, 'w', encoding='utf-8') as f:
                json.dump(all_stats, f, indent=2, ensure_ascii=False)
                
            print(f"✅ {self.user_id} 통계 데이터 저장 완료")
            return True
            
        except Exception as e:
            print(f"❌ 통계 저장 실패: {str(e)}")
            return False
            
    def record_answer(self, question_data: Dict, user_answer: str, 
                     is_correct: bool, response_time: float = 0.0) -> bool:
        """
        답안 기록 및 통계 업데이트
        
        Args:
            question_data: 문제 데이터
            user_answer: 사용자 답안
            is_correct: 정답 여부
            response_time: 응답 시간 (초)
            
        Returns:
            bool: 기록 성공 여부
        """
        try:
            # 기본 통계 업데이트
            self.stats_data["total_questions_attempted"] += 1
            
            if is_correct:
                self.stats_data["total_correct"] += 1
                self.stats_data["current_streak"] += 1
                # 최고 연속 정답 업데이트
                if self.stats_data["current_streak"] > self.stats_data["best_streak"]:
                    self.stats_data["best_streak"] = self.stats_data["current_streak"]
            else:
                self.stats_data["total_wrong"] += 1
                self.stats_data["current_streak"] = 0
            
            # 정답률 계산
            total_attempted = self.stats_data["total_questions_attempted"]
            if total_attempted > 0:
                self.stats_data["accuracy_rate"] = round(
                    (self.stats_data["total_correct"] / total_attempted) * 100, 2
                )
            
            # 카테고리별 통계 업데이트
            self._update_category_stats(question_data, is_correct, response_time)
            
            # 일일 진도 업데이트
            self._update_daily_progress(is_correct)
            
            # 마지막 학습일 업데이트
            self.stats_data["last_study_date"] = datetime.now().isoformat()
            
            return True
            
        except Exception as e:
            print(f"❌ 답안 기록 실패: {str(e)}")
            return False
            
    def _update_category_stats(self, question_data: Dict, is_correct: bool, 
                              response_time: float):
        """카테고리별 통계 업데이트"""
        layer1 = question_data.get("layer1", "기타")
        
        if layer1 not in self.stats_data["category_stats"]:
            self.stats_data["category_stats"][layer1] = {
                "total_attempted": 0,
                "total_correct": 0,
                "total_wrong": 0,
                "accuracy_rate": 0.0,
                "avg_response_time": 0.0,
                "response_times": []
            }
        
        cat_stats = self.stats_data["category_stats"][layer1]
        cat_stats["total_attempted"] += 1
        
        if is_correct:
            cat_stats["total_correct"] += 1
        else:
            cat_stats["total_wrong"] += 1
            
        # 정답률 계산
        if cat_stats["total_attempted"] > 0:
            cat_stats["accuracy_rate"] = round(
                (cat_stats["total_correct"] / cat_stats["total_attempted"]) * 100, 2
            )
        
        # 응답 시간 기록 (최근 10개만 유지)
        if response_time > 0:
            cat_stats["response_times"].append(response_time)
            if len(cat_stats["response_times"]) > 10:
                cat_stats["response_times"].pop(0)
            
            # 평균 응답 시간 계산
            if cat_stats["response_times"]:
                cat_stats["avg_response_time"] = round(
                    sum(cat_stats["response_times"]) / len(cat_stats["response_times"]), 2
                )
    
    def _update_daily_progress(self, is_correct: bool):
        """일일 진도 업데이트"""
        today = datetime.now().strftime("%Y-%m-%d")
        
        if today not in self.stats_data["daily_progress"]:
            self.stats_data["daily_progress"][today] = {
                "questions_attempted": 0,
                "correct_answers": 0,
                "wrong_answers": 0,
                "study_time": 0,
                "accuracy_rate": 0.0
            }
        
        daily_stats = self.stats_data["daily_progress"][today]
        daily_stats["questions_attempted"] += 1
        
        if is_correct:
            daily_stats["correct_answers"] += 1
        else:
            daily_stats["wrong_answers"] += 1
        
        # 일일 정답률 계산
        if daily_stats["questions_attempted"] > 0:
            daily_stats["accuracy_rate"] = round(
                (daily_stats["correct_answers"] / daily_stats["questions_attempted"]) * 100, 2
            )
    
    def start_study_session(self):
        """학습 세션 시작"""
        self.session_start_time = time.time()
        print("📚 학습 세션 시작")
        
    def end_study_session(self) -> Dict[str, Any]:
        """
        학습 세션 종료 및 결과 반환
        
        Returns:
            Dict: 세션 결과
        """
        session_duration = time.time() - self.session_start_time
        
        # 세션 데이터 기록
        session_data = {
            "start_time": datetime.fromtimestamp(self.session_start_time).isoformat(),
            "end_time": datetime.now().isoformat(),
            "duration_seconds": round(session_duration, 2),
            "duration_minutes": round(session_duration / 60, 2),
            "questions_in_session": 0,  # 외부에서 설정
            "correct_in_session": 0,    # 외부에서 설정
            "session_accuracy": 0.0     # 외부에서 설정
        }
        
        # 세션 히스토리에 추가
        self.stats_data["study_sessions"].append(session_data)
        
        # 총 학습 시간 업데이트
        self.stats_data["total_study_time"] += session_duration
        
        # 최근 10개 세션만 유지
        if len(self.stats_data["study_sessions"]) > 10:
            self.stats_data["study_sessions"].pop(0)
        
        print(f"📚 학습 세션 종료 - {session_data['duration_minutes']:.1f}분")
        return session_data
        
    def get_overall_stats(self) -> Dict[str, Any]:
        """
        전체 통계 정보 반환
        
        Returns:
            Dict: 전체 통계
        """
        return {
            "user_id": self.stats_data["user_id"],
            "total_questions": self.stats_data["total_questions_attempted"],
            "total_correct": self.stats_data["total_correct"],
            "total_wrong": self.stats_data["total_wrong"],
            "accuracy_rate": self.stats_data["accuracy_rate"],
            "current_streak": self.stats_data["current_streak"],
            "best_streak": self.stats_data["best_streak"],
            "total_study_time_hours": round(self.stats_data["total_study_time"] / 3600, 2),
            "total_sessions": len(self.stats_data["study_sessions"]),
            "last_study_date": self.stats_data["last_study_date"],
            "created_date": self.stats_data["created_date"]
        }
        
    def get_category_stats(self) -> Dict[str, Any]:
        """
        카테고리별 통계 정보 반환
        
        Returns:
            Dict: 카테고리별 통계
        """
        return self.stats_data["category_stats"]
        
    def get_daily_progress(self, days: int = 7) -> Dict[str, Any]:
        """
        최근 N일간 일일 진도 반환
        
        Args:
            days: 조회할 일수
            
        Returns:
            Dict: 일일 진도 데이터
        """
        daily_data = {}
        today = datetime.now()
        
        for i in range(days):
            date = (today - timedelta(days=i)).strftime("%Y-%m-%d")
            if date in self.stats_data["daily_progress"]:
                daily_data[date] = self.stats_data["daily_progress"][date]
            else:
                daily_data[date] = {
                    "questions_attempted": 0,
                    "correct_answers": 0,
                    "wrong_answers": 0,
                    "study_time": 0,
                    "accuracy_rate": 0.0
                }
        
        return daily_data
        
    def get_weak_categories(self, min_questions: int = 5) -> List[Dict[str, Any]]:
        """
        취약 카테고리 분석
        
        Args:
            min_questions: 최소 문제 수 (이보다 적으면 제외)
            
        Returns:
            List: 취약 카테고리 목록 (정확도 낮은 순)
        """
        weak_categories = []
        
        for category, stats in self.stats_data["category_stats"].items():
            if stats["total_attempted"] >= min_questions:
                weak_categories.append({
                    "category": category,
                    "accuracy_rate": stats["accuracy_rate"],
                    "total_attempted": stats["total_attempted"],
                    "total_wrong": stats["total_wrong"]
                })
        
        # 정확도 낮은 순으로 정렬
        weak_categories.sort(key=lambda x: x["accuracy_rate"])
        
        return weak_categories
        
    def get_study_recommendations(self) -> List[str]:
        """
        학습 권장사항 생성
        
        Returns:
            List: 권장사항 목록
        """
        recommendations = []
        
        # 전체 정답률 기준
        accuracy = self.stats_data["accuracy_rate"]
        if accuracy < 60:
            recommendations.append("전체 정답률이 낮습니다. 기본기 복습을 권장합니다.")
        elif accuracy < 80:
            recommendations.append("좋은 성과입니다! 틀린 문제를 다시 풀어보세요.")
        else:
            recommendations.append("우수한 성과입니다! 새로운 카테고리에 도전해보세요.")
        
        # 취약 카테고리 기준
        weak_categories = self.get_weak_categories()
        if weak_categories:
            worst_category = weak_categories[0]
            recommendations.append(
                f"{worst_category['category']} 분야 집중 학습을 권장합니다. "
                f"(정답률: {worst_category['accuracy_rate']}%)"
            )
        
        # 연속 정답 기준
        if self.stats_data["current_streak"] >= 10:
            recommendations.append("연속 정답 기록이 훌륭합니다! 이 상태를 유지하세요.")
        elif self.stats_data["current_streak"] == 0 and self.stats_data["total_questions_attempted"] > 0:
            recommendations.append("연속 정답을 위해 문제를 천천히 읽어보세요.")
        
        return recommendations
        
    def reset_stats(self):
        """통계 데이터 초기화"""
        self.stats_data = self.default_stats.copy()
        print("🔄 통계 데이터 초기화 완료")


def main():
    """테스트 실행 함수"""
    print("📊 AICU Season4 Stats Handler 테스트 시작")
    
    # StatsHandler 인스턴스 생성
    stats = StatsHandler("test_user")
    
    # 학습 세션 시작
    stats.start_study_session()
    
    # 테스트 문제 데이터
    test_questions = [
        {"layer1": "06재산보험", "qcode": "TEST-001", "question": "테스트 문제 1"},
        {"layer1": "07특종보험", "qcode": "TEST-002", "question": "테스트 문제 2"},
        {"layer1": "06재산보험", "qcode": "TEST-003", "question": "테스트 문제 3"},
    ]
    
    # 답안 기록 테스트
    print("\n=== 답안 기록 테스트 ===")
    stats.record_answer(test_questions[0], "O", True, 2.5)
    stats.record_answer(test_questions[1], "X", False, 4.2)
    stats.record_answer(test_questions[2], "O", True, 1.8)
    
    # 전체 통계 조회
    print("\n=== 전체 통계 ===")
    overall = stats.get_overall_stats()
    for key, value in overall.items():
        print(f"{key}: {value}")
    
    # 카테고리별 통계 조회
    print("\n=== 카테고리별 통계 ===")
    category_stats = stats.get_category_stats()
    for category, cat_stats in category_stats.items():
        print(f"{category}: 정답률 {cat_stats['accuracy_rate']}%")
    
    # 학습 권장사항
    print("\n=== 학습 권장사항 ===")
    recommendations = stats.get_study_recommendations()
    for i, rec in enumerate(recommendations, 1):
        print(f"{i}. {rec}")
    
    # 학습 세션 종료
    session_result = stats.end_study_session()
    print(f"\n학습 시간: {session_result['duration_minutes']:.1f}분")
    
    # 통계 저장
    stats.save_stats()
    
    print("\n✅ Stats Handler 테스트 완료!")


if __name__ == "__main__":
    main()
