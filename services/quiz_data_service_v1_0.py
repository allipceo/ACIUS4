# services/quiz_data_service_v1_0.py
# 문제풀이 기능 - 데이터 로드 서비스 (150줄 이하)
# 저장경로: ACIUS4/services/quiz_data_service_v1_0.py
# 기존 파일 보존: quiz_service.py → quiz_service.py (보존)

import json
import os
import logging
from typing import List, Dict, Optional, Union

class QuizDataService:
    """문제 데이터 전문 관리 서비스"""
    
    def __init__(self):
        self.questions_data = None
        self.data_path = "data/questions.json"
        self.category_mapping = {
            '재산보험': 'LAYER1_1',
            '특종보험': 'LAYER1_2', 
            '배상책임보험': 'LAYER1_3',
            '해상보험': 'LAYER1_4'
        }
        self.logger = logging.getLogger(__name__)
    
    def load_all_questions(self) -> List[Dict]:
        """전체 문제 로드 (기본학습용) - modules/data_converter.py 활용"""
        try:
            if self.questions_data is None:
                with open(self.data_path, 'r', encoding='utf-8') as file:
                    self.questions_data = json.load(file)
                    
            self.logger.info(f"전체 문제 로드 완료: {len(self.questions_data)}개")
            return self.questions_data
            
        except FileNotFoundError:
            self.logger.error(f"문제 데이터 파일을 찾을 수 없습니다: {self.data_path}")
            return []
        except json.JSONDecodeError:
            self.logger.error("문제 데이터 JSON 파싱 오류")
            return []
        except Exception as e:
            self.logger.error(f"문제 로드 중 오류: {str(e)}")
            return []
    
    def load_category_questions(self, category: str) -> List[Dict]:
        """카테고리별 문제 로드 (대분류학습용)"""
        try:
            all_questions = self.load_all_questions()
            if not all_questions:
                return []
                
            # LAYER1 필드 기준 필터링
            layer1_value = self.category_mapping.get(category)
            if not layer1_value:
                self.logger.warning(f"알 수 없는 카테고리: {category}")
                return []
                
            filtered_questions = [
                q for q in all_questions 
                if q.get('LAYER1') == layer1_value
            ]
            
            self.logger.info(f"{category} 문제 로드 완료: {len(filtered_questions)}개")
            return filtered_questions
            
        except Exception as e:
            self.logger.error(f"카테고리별 문제 로드 오류: {str(e)}")
            return []
    
    def get_question_by_index(self, questions: List[Dict], index: int) -> Optional[Dict]:
        """특정 인덱스 문제 반환"""
        try:
            if not questions or index < 0 or index >= len(questions):
                self.logger.warning(f"유효하지 않은 문제 인덱스: {index}")
                return None
                
            question = questions[index]
            
            # 문제 데이터 유효성 검증
            if self.validate_question_data(question):
                return question
            else:
                self.logger.warning(f"유효하지 않은 문제 데이터: 인덱스 {index}")
                return None
                
        except Exception as e:
            self.logger.error(f"문제 조회 오류: {str(e)}")
            return None
    
    def get_random_question(self, questions: List[Dict], attempted_indices: List[int] = None) -> Optional[Dict]:
        """랜덤 문제 선택 (중복 제외)"""
        import random
        
        try:
            if not questions:
                return None
                
            attempted_indices = attempted_indices or []
            available_indices = [
                i for i in range(len(questions)) 
                if i not in attempted_indices
            ]
            
            if not available_indices:
                self.logger.info("모든 문제를 풀었습니다. 처음부터 다시 시작합니다.")
                available_indices = list(range(len(questions)))
                
            random_index = random.choice(available_indices)
            return self.get_question_by_index(questions, random_index)
            
        except Exception as e:
            self.logger.error(f"랜덤 문제 선택 오류: {str(e)}")
            return None
    
    def validate_question_data(self, question: Dict) -> bool:
        """문제 데이터 유효성 검증"""
        try:
            required_fields = ['QUESTION', 'ANSWER']
            
            # 필수 필드 확인
            for field in required_fields:
                if field not in question or not question[field]:
                    return False
            
            # 답안 형식 확인
            answer = question['ANSWER']
            valid_answers = ['O', 'X', '1', '2', '3', '4']
            
            if answer not in valid_answers:
                return False
                
            return True
            
        except Exception as e:
            self.logger.error(f"문제 검증 오류: {str(e)}")
            return False
    
    def get_questions_by_mode(self, mode: str, category: str = None) -> List[Dict]:
        """모드별 문제 반환"""
        try:
            if mode == 'basic':
                # 기본학습: 전체 문제
                return self.load_all_questions()
            elif mode == 'category' and category:
                # 대분류학습: 카테고리별 문제
                return self.load_category_questions(category)
            else:
                self.logger.warning(f"알 수 없는 모드 또는 카테고리: {mode}, {category}")
                return []
                
        except Exception as e:
            self.logger.error(f"모드별 문제 로드 오류: {str(e)}")
            return []
    
    def get_question_statistics(self, questions: List[Dict]) -> Dict:
        """문제 통계 정보 반환"""
        try:
            if not questions:
                return {
                    'total_count': 0,
                    'true_false_count': 0,
                    'multiple_choice_count': 0,
                    'categories': {}
                }
            
            stats = {
                'total_count': len(questions),
                'true_false_count': 0,
                'multiple_choice_count': 0,
                'categories': {}
            }
            
            for question in questions:
                # 문제 유형별 카운트
                answer = question.get('ANSWER', '')
                if answer in ['O', 'X']:
                    stats['true_false_count'] += 1
                elif answer in ['1', '2', '3', '4']:
                    stats['multiple_choice_count'] += 1
                
                # 카테고리별 카운트
                layer1 = question.get('LAYER1', 'Unknown')
                stats['categories'][layer1] = stats['categories'].get(layer1, 0) + 1
            
            return stats
            
        except Exception as e:
            self.logger.error(f"문제 통계 계산 오류: {str(e)}")
            return {}

# 전역 인스턴스 (싱글톤 패턴)
quiz_data_service = QuizDataService()

def get_quiz_data_service() -> QuizDataService:
    """QuizDataService 인스턴스 반환"""
    return quiz_data_service