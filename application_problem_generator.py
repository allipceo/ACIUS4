#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GEP V1.0 - Application Problem Generator
기출문제에서 진위형 응용문제 생성을 위한 도우미 도구

Author: AI Assistant (Seo Daeri)
Date: 2024-12
Purpose: 1개 기출문제 → 8개 진위형 응용문제 생성 가이드
"""

import re
import json
from typing import List, Dict, Tuple

class ApplicationProblemGenerator:
    def __init__(self):
        self.templates = {
            '과일_예시': {
                'original': '다음 중 과일이 아닌 것을 고르시오. 1) 사과 2) 치킨 3) 포도 4) 수박',
                'correct_answer': 2,
                'application_problems': [
                    '사과는 과일이다. (정답: O)',
                    '사과는 과일이 아니다. (정답: X)',
                    '치킨은 과일이다. (정답: X)',
                    '치킨은 과일이 아니다. (정답: O)',
                    '포도는 과일이다. (정답: O)',
                    '포도는 과일이 아니다. (정답: X)',
                    '수박은 과일이다. (정답: O)',
                    '수박은 과일이 아니다. (정답: X)'
                ]
            }
        }
    
    def analyze_question_structure(self, question_text: str, options: List[str], correct_answer: int) -> Dict:
        """문제 구조 분석"""
        analysis = {
            'question_type': self._identify_question_type(question_text),
            'key_elements': self._extract_key_elements(question_text),
            'option_analysis': self._analyze_options(options, correct_answer),
            'application_patterns': []
        }
        
        return analysis
    
    def _identify_question_type(self, question_text: str) -> str:
        """문제 유형 식별"""
        question_lower = question_text.lower()
        
        if '다음 중' in question_text and '고르시오' in question_text:
            if '아닌' in question_text or '틀린' in question_text:
                return 'negative_selection'  # 부정 선택형
            else:
                return 'positive_selection'  # 긍정 선택형
        elif '올바른' in question_text:
            return 'correct_statement'
        elif '잘못된' in question_text:
            return 'incorrect_statement'
        else:
            return 'general_question'
    
    def _extract_key_elements(self, question_text: str) -> Dict:
        """핵심 요소 추출"""
        elements = {
            'subject': None,  # 주제
            'action': None,   # 행동/조건
            'criteria': None  # 기준
        }
        
        # 주제 추출 (예: "과일", "보험", "법규" 등)
        subject_patterns = [
            r'다음 중 (.+?)이 아닌',
            r'다음 중 (.+?)을',
            r'다음 중 (.+?)에',
            r'(.+?)에 대한'
        ]
        
        for pattern in subject_patterns:
            match = re.search(pattern, question_text)
            if match:
                elements['subject'] = match.group(1).strip()
                break
        
        return elements
    
    def _analyze_options(self, options: List[str], correct_answer: int) -> Dict:
        """보기 분석"""
        analysis = {
            'correct_option': options[correct_answer - 1] if 0 < correct_answer <= len(options) else None,
            'incorrect_options': [opt for i, opt in enumerate(options) if i != correct_answer - 1],
            'option_types': []
        }
        
        # 보기 유형 분석
        for option in options:
            if re.search(r'이다|입니다', option):
                analysis['option_types'].append('statement')
            elif re.search(r'한다|합니다', option):
                analysis['option_types'].append('action')
            else:
                analysis['option_types'].append('concept')
        
        return analysis
    
    def generate_application_problems(self, question_text: str, options: List[str], correct_answer: int) -> List[str]:
        """진위형 응용문제 생성"""
        analysis = self.analyze_question_structure(question_text, options, correct_answer)
        application_problems = []
        
        # 1. 정답 보기에 대한 진위형 문제 (2개)
        correct_option = analysis['option_analysis']['correct_option']
        if correct_option:
            # 긍정형
            positive_statement = self._create_true_statement(correct_option)
            application_problems.append(f"{positive_statement} (정답: O)")
            
            # 부정형
            negative_statement = self._create_false_statement(correct_option)
            application_problems.append(f"{negative_statement} (정답: X)")
        
        # 2. 오답 보기들에 대한 진위형 문제 (6개)
        incorrect_options = analysis['option_analysis']['incorrect_options']
        for option in incorrect_options:
            # 긍정형 (틀린 진술)
            positive_statement = self._create_true_statement(option)
            application_problems.append(f"{positive_statement} (정답: X)")
            
            # 부정형 (올바른 진술)
            negative_statement = self._create_false_statement(option)
            application_problems.append(f"{negative_statement} (정답: O)")
        
        # 8개로 제한
        return application_problems[:8]
    
    def _create_true_statement(self, option: str) -> str:
        """긍정 진술 생성"""
        # "이다" 형태로 끝나는 경우
        if option.endswith('이다') or option.endswith('입니다'):
            return option
        
        # "한다" 형태로 끝나는 경우
        if option.endswith('한다') or option.endswith('합니다'):
            return option
        
        # 일반적인 경우
        if not option.endswith(('이다', '입니다', '한다', '합니다')):
            return f"{option}이다"
        
        return option
    
    def _create_false_statement(self, option: str) -> str:
        """부정 진술 생성"""
        # "이다" → "이 아니다"
        if option.endswith('이다'):
            return option.replace('이다', '이 아니다')
        elif option.endswith('입니다'):
            return option.replace('입니다', '이 아닙니다')
        
        # "한다" → "하지 않는다"
        elif option.endswith('한다'):
            return option.replace('한다', '하지 않는다')
        elif option.endswith('합니다'):
            return option.replace('합니다', '하지 않습니다')
        
        # 일반적인 경우
        else:
            return f"{option}이 아니다"
    
    def validate_application_problems(self, original_question: str, application_problems: List[str]) -> Dict:
        """응용문제 검증"""
        validation = {
            'total_count': len(application_problems),
            'valid_count': 0,
            'issues': [],
            'suggestions': []
        }
        
        # 1. 개수 확인
        if len(application_problems) != 8:
            validation['issues'].append(f"응용문제 개수가 8개가 아닙니다: {len(application_problems)}개")
        
        # 2. 각 응용문제 검증
        for i, problem in enumerate(application_problems, 1):
            if not problem.strip():
                validation['issues'].append(f"응용문제 {i}: 빈 문제")
                continue
            
            # 정답 표시 확인
            if '(정답:' not in problem:
                validation['issues'].append(f"응용문제 {i}: 정답 표시 누락")
            else:
                validation['valid_count'] += 1
            
            # 중복 확인
            if application_problems.count(problem) > 1:
                validation['issues'].append(f"응용문제 {i}: 중복 문제 발견")
        
        # 3. 제안사항
        if validation['valid_count'] < 8:
            validation['suggestions'].append("모든 응용문제에 정답 표시를 추가하세요")
        
        if len(set(application_problems)) < len(application_problems):
            validation['suggestions'].append("중복된 응용문제를 제거하세요")
        
        return validation
    
    def create_example_workflow(self):
        """예시 워크플로우 생성"""
        example = {
            'original_question': '다음 중 과일이 아닌 것을 고르시오.',
            'options': ['사과', '치킨', '포도', '수박'],
            'correct_answer': 2,
            'step_by_step_process': [
                {
                    'step': 1,
                    'description': '정답 보기(치킨)에 대한 진위형 문제 생성',
                    'problems': [
                        '치킨은 과일이 아니다. (정답: O)',
                        '치킨은 과일이다. (정답: X)'
                    ]
                },
                {
                    'step': 2,
                    'description': '오답 보기들(사과, 포도, 수박)에 대한 진위형 문제 생성',
                    'problems': [
                        '사과는 과일이다. (정답: O)',
                        '사과는 과일이 아니다. (정답: X)',
                        '포도는 과일이다. (정답: O)',
                        '포도는 과일이 아니다. (정답: X)',
                        '수박은 과일이다. (정답: O)',
                        '수박은 과일이 아니다. (정답: X)'
                    ]
                }
            ],
            'final_result': [
                '치킨은 과일이 아니다. (정답: O)',
                '치킨은 과일이다. (정답: X)',
                '사과는 과일이다. (정답: O)',
                '사과는 과일이 아니다. (정답: X)',
                '포도는 과일이다. (정답: O)',
                '포도는 과일이 아니다. (정답: X)',
                '수박은 과일이다. (정답: O)',
                '수박은 과일이 아니다. (정답: X)'
            ]
        }
        
        return example

def main():
    """메인 실행 함수"""
    generator = ApplicationProblemGenerator()
    
    print("🎯 GEP V1.0 - 응용문제 생성 가이드")
    print("=" * 50)
    
    # 예시 워크플로우 출력
    example = generator.create_example_workflow()
    
    print("📝 예시 워크플로우:")
    print(f"원본 문제: {example['original_question']}")
    print(f"보기: {example['options']}")
    print(f"정답: {example['correct_answer']}")
    print()
    
    print("🔄 단계별 과정:")
    for step in example['step_by_step_process']:
        print(f"단계 {step['step']}: {step['description']}")
        for problem in step['problems']:
            print(f"  - {problem}")
        print()
    
    print("✅ 최종 결과 (8개 진위형 문제):")
    for i, problem in enumerate(example['final_result'], 1):
        print(f"{i:2d}. {problem}")
    
    print()
    print("💡 사용 팁:")
    print("1. 정답 보기 → 2개 진위형 문제 (O, X)")
    print("2. 오답 보기들 → 6개 진위형 문제 (각각 O, X)")
    print("3. 모든 문제에 '(정답: O/X)' 표시 필수")
    print("4. 중복 문제 방지")
    print("5. 문법적으로 자연스러운 진술로 변환")

if __name__ == "__main__":
    main()
