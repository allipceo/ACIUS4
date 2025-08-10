# services/quiz_data_service_v1.py
# 문제풀이 기능 - 데이터 로드 서비스 (150줄 이하)
# 파일명 수정: quiz_data_service_v1.0.py → quiz_data_service_v1.py

import json
import logging
from typing import List, Dict, Optional

class QuizDataService:
    """문제 데이터 전문 관리 서비스"""
    
    def __init__(self):
        self.questions_data = None
        self.data_path = "data/questions.json"
        self.category_mapping = {
            '재산보험': '06재산보험',
            '특종보험': '07특종보험', 
            '배상책임보험': '08배상책임보험',
            '해상보험': '09해상보험'
        }
        self.logger = logging.getLogger(__name__)
    
    def load_all_questions(self) -> List[Dict]:
        """전체 문제 로드 (기본학습용) - 싱글톤 패턴 적용"""
        try:
            if self.questions_data is None:
                with open(self.data_path, 'r', encoding='utf-8') as file:
                    data = json.load(file)
                    # JSON 구조: {"questions": [...]} 또는 [...] 둘 다 지원
                    if isinstance(data, list):
                        self.questions_data = data
                    else:
                        self.questions_data = data.get("questions", [])
                    
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
                
            layer1_value = self.category_mapping.get(category)
            if not layer1_value:
                self.logger.warning(f"알 수 없는 카테고리: {category}")
                return []
                
            filtered_questions = [
                q for q in all_questions 
                if q.get('layer1') == layer1_value
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
                return None
                
            question = questions[index]
            return question if self.validate_question_data(question) else None
                
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
                available_indices = list(range(len(questions)))
                
            random_index = random.choice(available_indices)
            return self.get_question_by_index(questions, random_index)
            
        except Exception as e:
            self.logger.error(f"랜덤 문제 선택 오류: {str(e)}")
            return None
    
    def validate_question_data(self, question: Dict) -> bool:
        """문제 데이터 유효성 검증 (실제 데이터 구조에 맞춤)"""
        try:
            required_fields = ['question', 'answer']
            
            for field in required_fields:
                if field not in question or not question[field]:
                    return False
            
            answer = question['answer']
            valid_answers = ['O', 'X', '1', '2', '3', '4']
            
            return answer in valid_answers
            
        except Exception:
            return False
    
    def get_questions_by_mode(self, mode: str, category: str = None) -> List[Dict]:
        """모드별 문제 반환 - 카테고리 로직 강화"""
        try:
            if mode == 'basic':
                # 기본학습: 전체 문제
                return self.load_all_questions()
            elif mode == 'category':
                if category:
                    # 대분류학습: 지정된 카테고리 문제
                    return self.load_category_questions(category)
                else:
                    self.logger.warning("카테고리 모드에서 카테고리가 지정되지 않음")
                    return []
            else:
                self.logger.warning(f"알 수 없는 모드: {mode}")
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
                answer = question.get('answer', '')
                if answer in ['O', 'X']:
                    stats['true_false_count'] += 1
                elif answer in ['1', '2', '3', '4']:
                    stats['multiple_choice_count'] += 1
                
                layer1 = question.get('layer1', 'Unknown')
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

# 테스트 함수 (개발용) - 코코치 지적사항 반영
def test_quiz_data_service():
    """서비스 동작 테스트 - JSON 구조 검증 포함"""
    service = get_quiz_data_service()
    
    print("=== QuizDataService 테스트 시작 ===")
    
    # 1. 전체 문제 로드 테스트
    all_questions = service.load_all_questions()
    print(f"✅ 전체 문제 로드: {len(all_questions)}개")
    
    if all_questions:
        # 첫 번째 문제 구조 확인
        sample_question = all_questions[0]
        print(f"✅ 샘플 문제 구조: {list(sample_question.keys())}")
        print(f"✅ 문제 내용: {sample_question.get('question', 'N/A')[:50]}...")
    
    # 2. 카테고리별 로드 테스트 - 매핑 정보 포함
    for category in ['재산보험', '특종보험', '배상책임보험', '해상보험']:
        category_questions = service.load_category_questions(category)
        mapped_value = service.category_mapping.get(category)
        print(f"✅ {category} → {mapped_value}: {len(category_questions)}개")
    
    # 3. 통계 정보 테스트
    stats = service.get_question_statistics(all_questions)
    print(f"✅ 통계 정보: {stats}")
    
    # 4. 모드별 테스트
    basic_questions = service.get_questions_by_mode('basic')
    category_questions = service.get_questions_by_mode('category', '재산보험')
    print(f"✅ 기본 모드: {len(basic_questions)}개")
    print(f"✅ 카테고리 모드: {len(category_questions)}개")
    
    print("=== 테스트 완료 ===")
    return True

if __name__ == "__main__":
    test_quiz_data_service()