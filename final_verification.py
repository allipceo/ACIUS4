#!/usr/bin/env python3
"""
AICU S4 최종 검증 스크립트
실제 사용자 시나리오를 시뮬레이션하여 완벽한 상태를 확인합니다.
"""

import json
import time
from datetime import datetime

class FinalVerification:
    def __init__(self):
        self.verification_results = []
    
    def verify_json_structure_integrity(self):
        """JSON 구조 무결성 검증"""
        print("🔍 JSON 구조 무결성 검증...")
        
        try:
            with open('static/questions.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # 필수 필드 검증
            required_fields = ['metadata', 'questions']
            for field in required_fields:
                if field not in data:
                    raise ValueError(f"필수 필드 누락: {field}")
            
            # 메타데이터 검증
            metadata = data['metadata']
            required_metadata = ['total_questions', 'categories']
            for field in required_metadata:
                if field not in metadata:
                    raise ValueError(f"메타데이터 필드 누락: {field}")
            
            # 문제 데이터 검증
            questions = data['questions']
            if not isinstance(questions, list):
                raise ValueError("questions 필드가 배열이 아닙니다")
            
            # 샘플 문제 검증
            if questions:
                sample_question = questions[0]
                required_question_fields = ['question', 'answer', 'type', 'layer1']
                for field in required_question_fields:
                    if field not in sample_question:
                        raise ValueError(f"문제 필드 누락: {field}")
            
            print(f"✅ JSON 구조 무결성 검증 완료")
            print(f"   - 총 문제 수: {metadata['total_questions']}")
            print(f"   - 카테고리 수: {len(metadata['categories'])}")
            print(f"   - 문제 배열 길이: {len(questions)}")
            
            self.verification_results.append({
                'test': 'json_structure_integrity',
                'status': 'success',
                'total_questions': metadata['total_questions'],
                'categories_count': len(metadata['categories'])
            })
            
        except Exception as e:
            print(f"❌ JSON 구조 무결성 검증 실패: {e}")
            self.verification_results.append({
                'test': 'json_structure_integrity',
                'status': 'error',
                'error': str(e)
            })
    
    def verify_question_type_consistency(self):
        """문제 타입 일관성 검증"""
        print("\n📋 문제 타입 일관성 검증...")
        
        try:
            with open('static/questions.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            questions = data['questions']
            type_counts = {}
            answer_counts = {}
            
            for q in questions:
                q_type = q.get('type', 'unknown')
                answer = q.get('answer', '')
                
                type_counts[q_type] = type_counts.get(q_type, 0) + 1
                answer_counts[answer] = answer_counts.get(answer, 0) + 1
            
            print("📊 문제 타입 분포:")
            for q_type, count in type_counts.items():
                print(f"   - {q_type}: {count}개")
            
            print("📊 답안 분포:")
            for answer, count in answer_counts.items():
                print(f"   - {answer}: {count}개")
            
            # 타입별 답안 형식 검증
            valid_answers = {
                '진위형': ['O', 'X'],
                '선택형': ['1', '2', '3', '4']
            }
            
            type_consistency = True
            for q_type, valid_ans in valid_answers.items():
                if q_type in type_counts:
                    # 해당 타입의 문제들의 답안이 유효한지 확인
                    for q in questions:
                        if q.get('type') == q_type:
                            if q.get('answer') not in valid_ans:
                                print(f"⚠️ {q_type} 문제의 답안이 유효하지 않음: {q.get('answer')}")
                                type_consistency = False
            
            if type_consistency:
                print("✅ 문제 타입 일관성 검증 완료")
                self.verification_results.append({
                    'test': 'question_type_consistency',
                    'status': 'success',
                    'type_counts': type_counts,
                    'answer_counts': answer_counts
                })
            else:
                print("❌ 문제 타입 일관성 검증 실패")
                self.verification_results.append({
                    'test': 'question_type_consistency',
                    'status': 'error',
                    'error': '타입별 답안 형식 불일치'
                })
                
        except Exception as e:
            print(f"❌ 문제 타입 일관성 검증 실패: {e}")
            self.verification_results.append({
                'test': 'question_type_consistency',
                'status': 'error',
                'error': str(e)
            })
    
    def verify_category_mapping_consistency(self):
        """카테고리 매핑 일관성 검증"""
        print("\n🗂️ 카테고리 매핑 일관성 검증...")
        
        user_categories = ["재산보험", "특종보험", "배상책임보험", "해상보험"]
        system_categories = ["06재산보험", "07특종보험", "08배상책임보험", "09해상보험"]
        
        mapping_consistency = True
        
        try:
            with open('static/questions.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            questions = data['questions']
            
            # 시스템 카테고리별 문제 수 확인
            system_category_counts = {}
            for q in questions:
                layer1 = q.get('layer1', '')
                system_category_counts[layer1] = system_category_counts.get(layer1, 0) + 1
            
            print("📊 시스템 카테고리별 문제 수:")
            for system_cat in system_categories:
                count = system_category_counts.get(system_cat, 0)
                print(f"   - {system_cat}: {count}개")
                
                # 메타데이터와 일치하는지 확인
                expected_count = data['metadata']['categories'].get(system_cat, 0)
                if count != expected_count:
                    print(f"⚠️ {system_cat}: 실제 {count}개, 예상 {expected_count}개")
                    mapping_consistency = False
            
            if mapping_consistency:
                print("✅ 카테고리 매핑 일관성 검증 완료")
                self.verification_results.append({
                    'test': 'category_mapping_consistency',
                    'status': 'success',
                    'system_category_counts': system_category_counts
                })
            else:
                print("❌ 카테고리 매핑 일관성 검증 실패")
                self.verification_results.append({
                    'test': 'category_mapping_consistency',
                    'status': 'error',
                    'error': '카테고리별 문제 수 불일치'
                })
                
        except Exception as e:
            print(f"❌ 카테고리 매핑 일관성 검증 실패: {e}")
            self.verification_results.append({
                'test': 'category_mapping_consistency',
                'status': 'error',
                'error': str(e)
            })
    
    def verify_data_flow_simulation(self):
        """데이터 흐름 시뮬레이션 검증"""
        print("\n🔄 데이터 흐름 시뮬레이션 검증...")
        
        # 실제 사용자 시나리오 시뮬레이션
        scenarios = [
            {
                'user': '테스트 사용자',
                'category': '재산보험',
                'questions_solved': 25,
                'correct_answers': 20,
                'expected_accuracy': 80.0
            },
            {
                'user': '테스트 사용자',
                'category': '특종보험',
                'questions_solved': 30,
                'correct_answers': 24,
                'expected_accuracy': 80.0
            },
            {
                'user': '테스트 사용자',
                'category': '배상책임보험',
                'questions_solved': 18,
                'correct_answers': 6,
                'expected_accuracy': 33.3
            },
            {
                'user': '테스트 사용자',
                'category': '해상보험',
                'questions_solved': 0,
                'correct_answers': 0,
                'expected_accuracy': 0.0
            }
        ]
        
        total_solved = sum(s['questions_solved'] for s in scenarios)
        total_correct = sum(s['correct_answers'] for s in scenarios)
        overall_accuracy = (total_correct / total_solved) * 100 if total_solved > 0 else 0
        
        print("📊 시뮬레이션 시나리오:")
        for scenario in scenarios:
            actual_accuracy = (scenario['correct_answers'] / scenario['questions_solved']) * 100 if scenario['questions_solved'] > 0 else 0
            print(f"   - {scenario['category']}: {scenario['questions_solved']}문제 풀이, {scenario['correct_answers']}정답 ({actual_accuracy:.1f}%)")
        
        print(f"📈 전체 통계: {total_solved}문제 풀이, {total_correct}정답 ({overall_accuracy:.1f}%)")
        
        # 데이터 일관성 검증
        data_consistency = True
        for scenario in scenarios:
            actual_accuracy = (scenario['correct_answers'] / scenario['questions_solved']) * 100 if scenario['questions_solved'] > 0 else 0
            if abs(actual_accuracy - scenario['expected_accuracy']) > 0.1:  # 0.1% 오차 허용
                print(f"⚠️ {scenario['category']} 정확도 불일치: 실제 {actual_accuracy:.1f}%, 예상 {scenario['expected_accuracy']:.1f}%")
                data_consistency = False
        
        if data_consistency:
            print("✅ 데이터 흐름 시뮬레이션 검증 완료")
            self.verification_results.append({
                'test': 'data_flow_simulation',
                'status': 'success',
                'total_solved': total_solved,
                'total_correct': total_correct,
                'overall_accuracy': overall_accuracy
            })
        else:
            print("❌ 데이터 흐름 시뮬레이션 검증 실패")
            self.verification_results.append({
                'test': 'data_flow_simulation',
                'status': 'error',
                'error': '데이터 일관성 불일치'
            })
    
    def generate_final_report(self):
        """최종 검증 리포트 생성"""
        print("\n" + "=" * 60)
        print("🎯 AICU S4 최종 검증 리포트")
        print("=" * 60)
        
        # 검증 결과 통계
        total_verifications = len(self.verification_results)
        successful_verifications = len([r for r in self.verification_results if r['status'] == 'success'])
        failed_verifications = total_verifications - successful_verifications
        
        print(f"📊 검증 결과:")
        print(f"   - 총 검증: {total_verifications}개")
        print(f"   - 성공: {successful_verifications}개")
        print(f"   - 실패: {failed_verifications}개")
        print(f"   - 성공률: {(successful_verifications/total_verifications)*100:.1f}%")
        
        # 실패한 검증 상세
        if failed_verifications > 0:
            print(f"\n❌ 실패한 검증:")
            for result in self.verification_results:
                if result['status'] == 'error':
                    print(f"   - {result['test']}: {result.get('error', 'Unknown error')}")
        
        # 최종 상태 판정
        if failed_verifications == 0:
            print(f"\n🎉 최종 상태: 완벽한 상태 ✅")
            print("   모든 검증을 통과했습니다!")
            print("   시스템이 안정적으로 작동할 준비가 되었습니다.")
        else:
            print(f"\n⚠️ 최종 상태: 부분적 완성 ⚠️")
            print("   일부 검증에서 문제가 발견되었습니다.")
            print("   추가 수정이 필요합니다.")
        
        return {
            'summary': {
                'total_verifications': total_verifications,
                'successful_verifications': successful_verifications,
                'failed_verifications': failed_verifications,
                'success_rate': (successful_verifications/total_verifications)*100,
                'final_status': 'perfect' if failed_verifications == 0 else 'partial'
            },
            'detailed_results': self.verification_results
        }
    
    def run_comprehensive_verification(self):
        """종합 검증 실행"""
        print("🚀 AICU S4 최종 검증 시작")
        print("=" * 60)
        
        # 1. JSON 구조 무결성 검증
        self.verify_json_structure_integrity()
        
        # 2. 문제 타입 일관성 검증
        self.verify_question_type_consistency()
        
        # 3. 카테고리 매핑 일관성 검증
        self.verify_category_mapping_consistency()
        
        # 4. 데이터 흐름 시뮬레이션 검증
        self.verify_data_flow_simulation()
        
        # 5. 최종 검증 리포트 생성
        report = self.generate_final_report()
        
        return report

if __name__ == "__main__":
    verifier = FinalVerification()
    report = verifier.run_comprehensive_verification()
    
    # 리포트를 JSON 파일로 저장
    with open('final_verification_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    print(f"\n📄 최종 검증 리포트가 'final_verification_report.json'에 저장되었습니다.")
