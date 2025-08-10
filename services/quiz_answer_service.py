# services/quiz_answer_service.py
# 문제풀이 기능 - 답안 처리 및 검증 서비스 (180줄 목표)
# Day 3: 답안 검증, 점수 계산, 즉시 피드백

import logging
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Any
from enum import Enum

class AnswerType(Enum):
    """답안 유형"""
    TRUE_FALSE = "true_false"  # O/X 문제
    MULTIPLE_CHOICE = "multiple_choice"  # 4지선다

class AnswerResult(Enum):
    """답안 결과"""
    CORRECT = "correct"
    INCORRECT = "incorrect"
    INVALID = "invalid"

class QuizAnswerService:
    """퀴즈 답안 처리 및 검증 서비스"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.valid_answers = {
            AnswerType.TRUE_FALSE: ['O', 'X'],
            AnswerType.MULTIPLE_CHOICE: ['1', '2', '3', '4']
        }
    
    def validate_answer(self, user_answer: str, question_data: Dict) -> Tuple[bool, str]:
        """답안 유효성 검증"""
        try:
            if not user_answer or not question_data:
                return False, "답안 또는 문제 데이터가 없습니다"
            
            # 답안 정규화
            user_answer = str(user_answer).strip().upper()
            correct_answer = str(question_data.get('answer', '')).strip().upper()
            
            if not correct_answer:
                return False, "문제에 정답이 설정되지 않았습니다"
            
            # 답안 유형 확인
            answer_type = self._determine_answer_type(correct_answer)
            valid_options = self.valid_answers.get(answer_type, [])
            
            if user_answer not in valid_options:
                return False, f"유효하지 않은 답안입니다. 가능한 답안: {valid_options}"
            
            return True, "유효한 답안입니다"
            
        except Exception as e:
            self.logger.error(f"답안 검증 오류: {str(e)}")
            return False, f"답안 검증 중 오류가 발생했습니다: {str(e)}"
    
    def check_answer(self, user_answer: str, question_data: Dict) -> Dict:
        """답안 정확성 확인 및 결과 반환"""
        try:
            # 답안 유효성 검증
            is_valid, validation_message = self.validate_answer(user_answer, question_data)
            
            if not is_valid:
                return {
                    'result': AnswerResult.INVALID.value,
                    'is_correct': False,
                    'user_answer': user_answer,
                    'correct_answer': question_data.get('answer', ''),
                    'message': validation_message,
                    'score_change': 0,
                    'timestamp': datetime.now().isoformat()
                }
            
            # 정답 비교
            user_answer_normalized = str(user_answer).strip().upper()
            correct_answer = str(question_data.get('answer', '')).strip().upper()
            is_correct = (user_answer_normalized == correct_answer)
            
            # 점수 계산
            score_change = self._calculate_score(is_correct, question_data)
            
            # 결과 메시지 생성
            message = self._generate_feedback_message(is_correct, question_data)
            
            return {
                'result': AnswerResult.CORRECT.value if is_correct else AnswerResult.INCORRECT.value,
                'is_correct': is_correct,
                'user_answer': user_answer_normalized,
                'correct_answer': correct_answer,
                'message': message,
                'score_change': score_change,
                'question_info': {
                    'qcode': question_data.get('qcode', ''),
                    'category': question_data.get('layer1', ''),
                    'difficulty': self._assess_difficulty(question_data)
                },
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"답안 확인 오류: {str(e)}")
            return {
                'result': AnswerResult.INVALID.value,
                'is_correct': False,
                'user_answer': user_answer,
                'correct_answer': '',
                'message': f"답안 처리 중 오류가 발생했습니다: {str(e)}",
                'score_change': 0,
                'timestamp': datetime.now().isoformat()
            }
    
    def calculate_session_score(self, attempts: List[Dict]) -> Dict:
        """세션 전체 점수 계산"""
        try:
            if not attempts:
                return self._empty_score_result()
            
            total_questions = len(attempts)
            correct_answers = sum(1 for attempt in attempts if attempt.get('is_correct', False))
            
            # 기본 점수 계산
            accuracy = (correct_answers / total_questions) * 100
            
            # 카테고리별 점수 계산
            category_scores = self._calculate_category_scores(attempts)
            
            # 난이도별 가중치 적용
            weighted_score = self._calculate_weighted_score(attempts)
            
            # 시간 보너스 계산
            time_bonus = self._calculate_time_bonus(attempts)
            
            final_score = min(100, weighted_score + time_bonus)
            
            return {
                'total_questions': total_questions,
                'correct_answers': correct_answers,
                'accuracy_percentage': round(accuracy, 1),
                'raw_score': round(accuracy, 1),
                'weighted_score': round(weighted_score, 1),
                'time_bonus': round(time_bonus, 1),
                'final_score': round(final_score, 1),
                'category_scores': category_scores,
                'performance_grade': self._determine_grade(final_score),
                'calculation_time': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"세션 점수 계산 오류: {str(e)}")
            return self._empty_score_result()
    
    def generate_detailed_feedback(self, answer_result: Dict, question_data: Dict) -> Dict:
        """상세한 피드백 생성"""
        try:
            is_correct = answer_result.get('is_correct', False)
            
            feedback = {
                'immediate_feedback': self._get_immediate_feedback(is_correct),
                'explanation': question_data.get('explain', ''),
                'category_info': {
                    'category': question_data.get('layer1', ''),
                    'subcategory': question_data.get('layer2', ''),
                    'topic': question_data.get('layer3', '')
                },
                'study_tip': self._generate_study_tip(question_data, is_correct),
                'related_concepts': self._get_related_concepts(question_data),
                'next_recommendation': self._get_next_recommendation(is_correct, question_data)
            }
            
            return feedback
            
        except Exception as e:
            self.logger.error(f"피드백 생성 오류: {str(e)}")
            return {'immediate_feedback': '피드백 생성 중 오류가 발생했습니다'}
    
    def _determine_answer_type(self, answer: str) -> AnswerType:
        """답안 유형 판별"""
        if answer in ['O', 'X']:
            return AnswerType.TRUE_FALSE
        elif answer in ['1', '2', '3', '4']:
            return AnswerType.MULTIPLE_CHOICE
        else:
            return AnswerType.TRUE_FALSE  # 기본값
    
    def _calculate_score(self, is_correct: bool, question_data: Dict) -> int:
        """개별 문제 점수 계산"""
        if not is_correct:
            return 0
        
        # 기본 점수
        base_score = 1
        
        # 난이도별 보너스 (추후 확장 가능)
        difficulty_bonus = 0
        
        return base_score + difficulty_bonus
    
    def _assess_difficulty(self, question_data: Dict) -> str:
        """문제 난이도 평가"""
        # 추후 통계 데이터를 활용하여 난이도 계산 가능
        return "보통"
    
    def _generate_feedback_message(self, is_correct: bool, question_data: Dict) -> str:
        """피드백 메시지 생성"""
        if is_correct:
            return "정답입니다! 잘하셨습니다."
        else:
            correct_answer = question_data.get('answer', '')
            return f"오답입니다. 정답은 '{correct_answer}'입니다."
    
    def _calculate_category_scores(self, attempts: List[Dict]) -> Dict:
        """카테고리별 점수 계산"""
        category_stats = {}
        
        for attempt in attempts:
            category = attempt.get('category', 'Unknown')
            if category not in category_stats:
                category_stats[category] = {'total': 0, 'correct': 0}
            
            category_stats[category]['total'] += 1
            if attempt.get('is_correct', False):
                category_stats[category]['correct'] += 1
        
        # 카테고리별 정답률 계산
        category_scores = {}
        for category, stats in category_stats.items():
            accuracy = (stats['correct'] / stats['total']) * 100 if stats['total'] > 0 else 0
            category_scores[category] = round(accuracy, 1)
        
        return category_scores
    
    def _calculate_weighted_score(self, attempts: List[Dict]) -> float:
        """가중치 적용 점수 계산"""
        if not attempts:
            return 0.0
        
        total_weight = 0
        weighted_correct = 0
        
        for attempt in attempts:
            weight = 1.0  # 기본 가중치 (추후 난이도별 조정 가능)
            total_weight += weight
            
            if attempt.get('is_correct', False):
                weighted_correct += weight
        
        return (weighted_correct / total_weight) * 100 if total_weight > 0 else 0.0
    
    def _calculate_time_bonus(self, attempts: List[Dict]) -> float:
        """시간 보너스 계산"""
        if not attempts:
            return 0.0
        
        total_time = sum(attempt.get('response_time_seconds', 0) for attempt in attempts)
        avg_time = total_time / len(attempts)
        
        # 평균 응답시간이 빠를수록 보너스 (최대 5점)
        if avg_time < 10:
            return 5.0
        elif avg_time < 20:
            return 3.0
        elif avg_time < 30:
            return 1.0
        else:
            return 0.0
    
    def _determine_grade(self, score: float) -> str:
        """성적 등급 결정"""
        if score >= 90:
            return "A"
        elif score >= 80:
            return "B"
        elif score >= 70:
            return "C"
        elif score >= 60:
            return "D"
        else:
            return "F"
    
    def _get_immediate_feedback(self, is_correct: bool) -> str:
        """즉시 피드백 메시지"""
        return "정답입니다! 🎉" if is_correct else "오답입니다. 다시 생각해보세요! 💭"
    
    def _generate_study_tip(self, question_data: Dict, is_correct: bool) -> str:
        """학습 팁 생성"""
        if is_correct:
            return "이 분야를 잘 이해하고 계시네요!"
        else:
            category = question_data.get('layer2', question_data.get('layer1', ''))
            return f"{category} 분야를 더 공부해보시기 바랍니다."
    
    def _get_related_concepts(self, question_data: Dict) -> List[str]:
        """관련 개념 제시"""
        return [
            question_data.get('layer1', ''),
            question_data.get('layer2', ''),
            question_data.get('layer3', '')
        ]
    
    def _get_next_recommendation(self, is_correct: bool, question_data: Dict) -> str:
        """다음 학습 추천"""
        if is_correct:
            return "다음 문제로 넘어가세요"
        else:
            return f"{question_data.get('layer1', '')} 카테고리 문제를 더 풀어보세요"
    
    def _empty_score_result(self) -> Dict:
        """빈 점수 결과"""
        return {
            'total_questions': 0,
            'correct_answers': 0,
            'accuracy_percentage': 0.0,
            'raw_score': 0.0,
            'weighted_score': 0.0,
            'time_bonus': 0.0,
            'final_score': 0.0,
            'category_scores': {},
            'performance_grade': 'F',
            'calculation_time': datetime.now().isoformat()
        }

# 전역 인스턴스 (싱글톤 패턴)
quiz_answer_service = QuizAnswerService()

def get_quiz_answer_service() -> QuizAnswerService:
    """QuizAnswerService 인스턴스 반환"""
    return quiz_answer_service

# 테스트 함수 (개발용)
def test_quiz_answer_service():
    """답안 서비스 동작 테스트"""
    service = get_quiz_answer_service()
    
    print("=== QuizAnswerService 테스트 시작 ===")
    
    # 테스트용 문제 데이터
    sample_question = {
        'qcode': 'TEST-001',
        'question': '일반화재보험은 일반물건과 공장물건에 대해서 보장을 제공한다',
        'answer': 'O',
        'layer1': '06재산보험',
        'layer2': '화재보험',
        'layer3': '일반화재보험',
        'explain': '일반화재보험은 일반물건과 공장물건을 대상으로 합니다'
    }
    
    # 1. 정답 테스트
    correct_result = service.check_answer('O', sample_question)
    print(f"✅ 정답 테스트: {correct_result['is_correct']} - {correct_result['message']}")
    
    # 2. 오답 테스트
    incorrect_result = service.check_answer('X', sample_question)
    print(f"✅ 오답 테스트: {incorrect_result['is_correct']} - {incorrect_result['message']}")
    
    # 3. 유효하지 않은 답안 테스트
    invalid_result = service.check_answer('Z', sample_question)
    print(f"✅ 무효답안 테스트: {invalid_result['result']} - {invalid_result['message']}")
    
    # 4. 세션 점수 계산 테스트
    sample_attempts = [
        {'is_correct': True, 'response_time_seconds': 5.0, 'category': '06재산보험'},
        {'is_correct': False, 'response_time_seconds': 15.0, 'category': '06재산보험'},
        {'is_correct': True, 'response_time_seconds': 8.0, 'category': '07특종보험'}
    ]
    
    score_result = service.calculate_session_score(sample_attempts)
    print(f"✅ 세션 점수: {score_result['final_score']}점 (등급: {score_result['performance_grade']})")
    
    # 5. 상세 피드백 테스트
    feedback = service.generate_detailed_feedback(correct_result, sample_question)
    print(f"✅ 피드백: {feedback['immediate_feedback']}")
    
    print("=== 테스트 완료 ===")
    return True

if __name__ == "__main__":
    test_quiz_answer_service()