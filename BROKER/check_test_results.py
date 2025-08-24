#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
테스트 결과 확인 스크립트
"""

import pandas as pd

def check_test_results():
    """테스트 결과 확인"""
    try:
        df = pd.read_excel('GEP_MASTER_TEST.xlsx')
        
        print("=== 테스트 결과 확인 ===")
        print(f"총 행 수: {len(df)}개")
        
        # 26회 데이터 확인
        round_26_common = df[(df['EROUND'] == 26) & (df['LAYER1'] == '관계법령')]
        round_26_sonbo1 = df[(df['EROUND'] == 26) & (df['LAYER1'] == '손보1부')]
        
        print(f"26회 관계법령: {len(round_26_common)}개")
        print(f"26회 손보1부: {len(round_26_sonbo1)}개")
        
        # QUESTION 필드 샘플 확인
        if len(round_26_common) > 0:
            sample_question = round_26_common[round_26_common['QNUM'] == 1]
            if len(sample_question) > 0:
                question_text = sample_question['QUESTION'].iloc[0]
                print(f"\n=== 26회 관계법령 1번 문제 샘플 ===")
                print(question_text[:300] + "..." if len(question_text) > 300 else question_text)
            else:
                print("\n26회 관계법령 1번 문제를 찾을 수 없습니다.")
        else:
            print("\n26회 관계법령 데이터가 없습니다.")
        
        # 포맷팅 확인
        print(f"\n=== 포맷팅 검증 ===")
        if len(round_26_common) > 0:
            sample_questions = round_26_common.head(3)
            for idx, row in sample_questions.iterrows():
                question_text = row['QUESTION']
                if '①' in question_text and '②' in question_text and '③' in question_text and '④' in question_text:
                    print(f"✅ {row['QNUM']}번: 선택지 포맷팅 정상")
                else:
                    print(f"❌ {row['QNUM']}번: 선택지 포맷팅 문제")
        
        return True
        
    except Exception as e:
        print(f"테스트 결과 확인 실패: {e}")
        return False

if __name__ == "__main__":
    check_test_results()
