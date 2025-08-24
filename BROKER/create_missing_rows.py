#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BROKER - Create Missing Rows
20회, 21회, 22회 행을 자동으로 생성하는 스크립트

Author: AI Assistant (Seo Daeri)
Date: 2024-12
"""

import pandas as pd
import logging

def setup_logging():
    """로깅 설정"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('create_rows.log', encoding='utf-8'),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)

def create_missing_rows():
    """20회, 21회, 22회 행 생성"""
    logger = setup_logging()
    excel_file = "GEP_MASTER_DB_V1.0.xlsx"
    
    logger.info("=== 누락된 행 생성 시작 ===")
    
    # 1. Excel 파일 로드
    try:
        df = pd.read_excel(excel_file)
        logger.info(f"Excel 파일 로드 완료: {len(df)}행")
    except Exception as e:
        logger.error(f"Excel 파일 로드 실패: {e}")
        return False
    
    # 2. 현재 회차 확인
    existing_rounds = sorted(df['EROUND'].unique())
    logger.info(f"현재 존재하는 회차: {existing_rounds}")
    
    # 3. 생성할 회차 (20회, 21회, 22회)
    missing_rounds = [20, 21, 22]
    
    total_new_rows = 0
    
    for round_num in missing_rounds:
        logger.info(f"\n=== {round_num}회 행 생성 시작 ===")
        
        # 해당 회차의 행이 이미 있는지 확인
        existing_mask = (df['EROUND'] == round_num)
        if existing_mask.any():
            logger.info(f"{round_num}회 행이 이미 존재합니다. 건너뜁니다.")
            continue
        
        # 23회 데이터를 템플릿으로 사용
        template_mask = (df['EROUND'] == 23)
        template_rows = df[template_mask]
        
        if len(template_rows) == 0:
            logger.error(f"23회 템플릿 데이터가 없습니다.")
            continue
        
        # 새 행 생성
        new_rows = []
        for _, template_row in template_rows.iterrows():
            new_row = template_row.copy()
            new_row['EROUND'] = round_num
            new_row['QUESTION'] = ''  # 빈 값으로 초기화
            new_rows.append(new_row)
        
        # DataFrame에 새 행 추가
        new_df = pd.concat([df, pd.DataFrame(new_rows)], ignore_index=True)
        df = new_df
        
        logger.info(f"{round_num}회 행 {len(new_rows)}개 생성 완료")
        total_new_rows += len(new_rows)
    
    # 4. Excel 파일 저장
    if total_new_rows > 0:
        try:
            df.to_excel(excel_file, index=False)
            logger.info(f"Excel 파일 저장 완료: 총 {total_new_rows}개 행 추가")
            
            # 저장 후 검증
            verification_df = pd.read_excel(excel_file)
            logger.info(f"저장 후 총 행 수: {len(verification_df)}행")
            
            # 새로 생성된 회차 확인
            new_rounds = sorted(verification_df['EROUND'].unique())
            logger.info(f"저장 후 존재하는 회차: {new_rounds}")
            
            return True
            
        except Exception as e:
            logger.error(f"Excel 파일 저장 실패: {e}")
            return False
    else:
        logger.info("생성할 새로운 행이 없습니다.")
        return True

def main():
    """메인 실행 함수"""
    print("=== 20회, 21회, 22회 행 생성 시작 ===")
    
    success = create_missing_rows()
    
    if success:
        print("✅ 행 생성 완료!")
    else:
        print("❌ 행 생성 실패!")

if __name__ == "__main__":
    main()
