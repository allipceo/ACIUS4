#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
3번 문제 포맷팅 디버깅
"""

import pandas as pd

def debug_question_3():
    """3번 문제 포맷팅 디버깅"""
    try:
        df = pd.read_excel('GEP_MASTER_TEST.xlsx')
        
        # 26회 관계법령 3번 문제 확인
        question_3 = df[(df['EROUND'] == 26) & (df['LAYER1'] == '관계법령') & (df['QNUM'] == 3)]
        
        if len(question_3) > 0:
            question_text = question_3['QUESTION'].iloc[0]
            print("=== 3번 문제 원본 텍스트 ===")
            print(question_text)
            print(f"\n텍스트 길이: {len(question_text)}")
            print(f"① 포함: {'①' in question_text}")
            print(f"② 포함: {'②' in question_text}")
            print(f"③ 포함: {'③' in question_text}")
            print(f"④ 포함: {'④' in question_text}")
            
            # 선택지 개수 확인
            option_count = question_text.count('①') + question_text.count('②') + question_text.count('③') + question_text.count('④')
            print(f"총 선택지 개수: {option_count}")
            
            # 줄바꿈 확인
            lines = question_text.split('\n')
            print(f"줄 수: {len(lines)}")
            for i, line in enumerate(lines):
                print(f"줄 {i+1}: {line[:50]}...")
        
        return True
        
    except Exception as e:
        print(f"디버깅 실패: {e}")
        return False

if __name__ == "__main__":
    debug_question_3()
