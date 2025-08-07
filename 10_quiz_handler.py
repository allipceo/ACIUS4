#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AICU Season4 Quiz Handler Module
문제 표시, 답안 처리, 채점 시스템

작성자: 노팀장
작성일: 2025년 8월 7일
브랜치: develop01
"""

import json
import random
from typing import Dict, List, Optional, Any
import os

class QuizHandler:
    """퀴즈 처리 핵심 클래스"""
    
    # questions.json 파일 경로를 동적으로 설정합니다.
    DATA_FILE_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "questions.json")
    
    def __init__(self):
        """
        QuizHandler 초기화
        """
        self.questions: List[Dict] = []
        self.current_question: Optional[Dict] = None
        self.current_index: int = 0
        self.user_answer: Optional[str] = None
        self.is_answered: bool = False
        self.total_correct_count: int = 0
        self.total_wrong_count: int = 0
        self.is_shuffled: bool = False
        
        # QUESTION 필드 절대 노터치 원칙
        self.protected_fields = ["QUESTION"]
        
    def load_questions(self) -> bool:
        """
        questions.json 파일에서 문제 데이터 로드
        
        Returns:
            bool: 로드 성공 여부
        """
        try:
            with open(self.DATA_FILE_PATH, 'r', encoding='utf-8') as f:
                # 서대리 의견 반영: data_converter.py가 생성한 JSON 구조에 맞게 수정
                data = json.load(f)
                self.questions = data.get("questions", [])
            
            if not self.questions:
                print("❌ 문제 데이터가 비어있습니다.")
                return False
                
            print(f"✅ {len(self.questions)}개 문제 로드 완료")
            return True
            
        except FileNotFoundError:
            print(f"❌ 파일을 찾을 수 없습니다: {self.DATA_FILE_PATH}")
            return False
        except json.JSONDecodeError:
            print("❌ JSON 파일 형식 오류")
            return False
        except Exception as e:
            print(f"❌ 문제 로드 실패: {str(e)}")
            return False
    
    def shuffle_questions(self):
        """문제 순서를 무작위로 섞습니다."""
        random.shuffle(self.questions)
        self.is_shuffled = True
        print("✅ 문제 순서 셔플 완료.")
        
    def get_question_by_index(self, index: int) -> Optional[Dict]:
        """
        인덱스로 특정 문제 가져오기
        
        Args:
            index: 문제 인덱스 (0부터 시작)
            
        Returns:
            Dict: 문제 데이터 또는 None
        """
        if not self.questions:
            print("❌ 문제 데이터가 로드되지 않았습니다.")
            return None
            
        if not (0 <= index < len(self.questions)):
            print(f"❌ 잘못된 인덱스: {index} (범위: 0-{len(self.questions)-1})")
            return None
            
        return self.questions[index]
    
    def display_question(self, index: int) -> Dict[str, Any]:
        """
        문제 표시 (QUESTION 필드 절대 노터치)
        
        Args:
            index: 문제 인덱스
            
        Returns:
            Dict: 문제 표시 정보
        """
        question = self.get_question_by_index(index)
        if not question:
            return {"success": False, "message": "문제를 불러올 수 없습니다."}
        
        # 현재 문제 설정
        self.current_question = question
        self.current_index = index
        self.user_answer = None
        self.is_answered = False
        
        # QUESTION 필드는 절대 수정하지 않음
        display_data = {
            "success": True,
            "question_data": {
                "index": index + 1,
                "total": len(self.questions),
                "qcode": question.get("QCODE", ""),
                "question": question.get("QUESTION", ""),  # 절대 노터치
                "layer1": question.get("LAYER1", ""),
                "layer2": question.get("LAYER2", ""),
                "answer_type": self._get_answer_type(question),
                "choices": self._get_answer_choices(question)
            }
        }
        
        return display_data
    
    def _get_answer_type(self, question: Dict) -> str:
        """
        문제 유형 판단 (진위형/선택형)
        
        Args:
            question: 문제 데이터
            
        Returns:
            str: "true_false" 또는 "multiple_choice"
        """
        answer = str(question.get("ANSWER", "")).strip()
        
        # 진위형 문제와 선택형 문제를 구분하는 로직을 추가합니다.
        # 선택형 문제의 경우, 'INPUT' 필드에 '선택형'이라는 문자열이 포함되어 있을 수 있습니다.
        input_type = str(question.get("INPUT", "")).strip()

        if input_type == '선택형' or answer in ["1", "2", "3", "4", "①", "②", "③", "④"]:
            return "multiple_choice"
        else:
            return "true_false"
    
    def _get_answer_choices(self, question: Dict) -> List[str]:
        """
        답안 선택지 생성
        
        Args:
            question: 문제 데이터
            
        Returns:
            List[str]: 선택지 리스트
        """
        answer_type = self._get_answer_type(question)
        
        if answer_type == "true_false":
            return ["O", "X"]
        else:
            # 선택형 문제의 경우, 질문 본문에서 선택지를 파싱하는 로직이 필요할 수 있습니다.
            # 여기서는 임시로 고정된 선택지를 반환합니다.
            return ["1", "2", "3", "4"]
    
    def submit_answer(self, user_answer: str) -> Dict[str, Any]:
        """
        답안 제출 및 채점
        
        Args:
            user_answer: 사용자 답안
            
        Returns:
            Dict: 채점 결과
        """
        if not self.current_question:
            return {"success": False, "message": "현재 문제가 설정되지 않았습니다."}
        
        if self.is_answered:
            return {"success": False, "message": "이미 답변한 문제입니다."}
        
        # 답안 저장
        self.user_answer = str(user_answer).strip()
        self.is_answered = True
        
        # 정답 확인
        correct_answer = str(self.current_question.get("ANSWER", "")).strip()
        is_correct = self._check_answer(self.user_answer, correct_answer)
        
        # 통계 업데이트
        if is_correct:
            self.total_correct_count += 1
        else:
            self.total_wrong_count += 1
            
        result = {
            "success": True,
            "is_correct": is_correct,
            "user_answer": self.user_answer,
            "correct_answer": correct_answer,
            "question_index": self.current_index,
            "explanation": self._get_explanation()
        }
        
        return result
    
    def _check_answer(self, user_answer: str, correct_answer: str) -> bool:
        """
        답안 정확성 확인
        
        Args:
            user_answer: 사용자 답안
            correct_answer: 정답
            
        Returns:
            bool: 정답 여부
        """
        # 정규화
        user_normalized = user_answer.upper().strip()
        correct_normalized = correct_answer.upper().strip()
        
        # 직접 비교
        if user_normalized == correct_normalized:
            return True
        
        # 진위형 변환 비교
        true_values = ["O", "참", "TRUE", "T", "1"]
        false_values = ["X", "거짓", "FALSE", "F", "0"]
        
        user_is_true = user_normalized in true_values
        correct_is_true = correct_normalized in true_values
        
        return user_is_true == correct_is_true
    
    def _get_explanation(self) -> str:
        """
        문제 해설 반환 (추후 확장)
        
        Returns:
            str: 해설 텍스트
        """
        return self.current_question.get("EXPLAIN", "해설이 제공되지 않습니다.")
    
    def get_question_stats(self) -> Dict[str, Any]:
        """
        현재 문제 통계 정보
        
        Returns:
            Dict: 통계 정보
        """
        if not self.current_question:
            return {"success": False, "message": "현재 문제가 없습니다."}
        
        return {
            "success": True,
            "current_index": self.current_index,
            "total_questions": len(self.questions),
            "progress_percent": round(((self.current_index + 1) / len(self.questions)) * 100, 1),
            "is_answered": self.is_answered,
            "user_answer": self.user_answer,
            "total_correct": self.total_correct_count,
            "total_wrong": self.total_wrong_count
        }
    
    def reset_current_question(self):
        """현재 문제 상태 초기화"""
        self.user_answer = None
        self.is_answered = False
    
    def get_random_question(self) -> Dict[str, Any]:
        """
        랜덤 문제 가져오기
        
        Returns:
            Dict: 랜덤 문제 데이터
        """
        if not self.questions:
            return {"success": False, "message": "문제 데이터가 없습니다."}
        
        random_index = random.randint(0, len(self.questions) - 1)
        return self.display_question(random_index)

def main():
    """테스트 실행 함수"""
    print("🚀 AICU Season4 Quiz Handler 테스트 시작")
    print("🛡️ QUESTION 필드 절대 노터치 원칙 준수")
    
    # QuizHandler 인스턴스 생성
    quiz = QuizHandler()
    
    # 문제 데이터 로드
    if not quiz.load_questions():
        print("❌ 문제 로드 실패")
        return
    
    # 첫 번째 문제 표시
    print("\n=== 첫 번째 문제 표시 테스트 ===")
    result = quiz.display_question(0)
    
    if result["success"]:
        q_data = result["question_data"]
        print(f"문제 번호: {q_data['index']}/{q_data['total']}")
        print(f"문제 코드: {q_data['qcode']}")
        print(f"문제 유형: {q_data['answer_type']}")
        print(f"문제 내용: {q_data['question']}")  # QUESTION 필드 그대로 출력
        print(f"선택지: {q_data['choices']}")
    
    # 답안 제출 테스트
    print("\n=== 답안 제출 테스트 ===")
    answer_result = quiz.submit_answer("O")
    
    if answer_result["success"]:
        print(f"제출 답안: {answer_result['user_answer']}")
        print(f"정답: {answer_result['correct_answer']}")
        print(f"결과: {'정답' if answer_result['is_correct'] else '오답'}")
    
    # 통계 확인
    print("\n=== 통계 확인 테스트 ===")
    stats = quiz.get_question_stats()
    
    if stats["success"]:
        print(f"진도: {stats['current_index']+1}/{stats['total_questions']}")
        print(f"진행률: {stats['progress_percent']}%")
        print(f"답변 상태: {'답변 완료' if stats['is_answered'] else '미답변'}")
        print(f"총 정답: {stats['total_correct']}")
        print(f"총 오답: {stats['total_wrong']}")
    
    print("\n✅ Quiz Handler 테스트 완료!")


if __name__ == "__main__":
    main()
