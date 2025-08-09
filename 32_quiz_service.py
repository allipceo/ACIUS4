#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Quiz Service - 퀴즈 비즈니스 로직
Week1 quiz_handler 모듈을 래핑하는 서비스 계층

작성자: 노팀장
작성일: 2025년 8월 9일
파일: services/quiz_service.py
"""

import sys
import os
from datetime import datetime

# Week1 모듈 import
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'modules'))
from quiz_handler import QuizHandler

# StatsHandler 안전 import
try:
    from stats_handler import StatsHandler
    STATS_AVAILABLE = True
except ImportError:
    STATS_AVAILABLE = False

class QuizService:
    """퀴즈 서비스 클래스"""
    
    def __init__(self):
        """서비스 초기화"""
        self.quiz_handler = QuizHandler()
        self.stats_handler = None
        
        # QuizHandler 초기화
        if self.quiz_handler.load_questions():
            print(f"✅ QuizService: 문제 로드 성공 ({len(self.quiz_handler.questions)}개)")
        else:
            print("❌ QuizService: 문제 로드 실패")
        
        # StatsHandler 안전 초기화
        if STATS_AVAILABLE:
            try:
                self.stats_handler = StatsHandler()
                print("✅ QuizService: StatsHandler 연동 성공")
            except Exception as e:
                print(f"⚠️ QuizService: StatsHandler 연동 실패 - {e}")
                STATS_AVAILABLE = False
    
    def get_status(self):
        """서비스 상태 반환"""
        return {
            'questions_loaded': len(self.quiz_handler.questions) if self.quiz_handler.questions else 0,
            'stats_handler_available': STATS_AVAILABLE and self.stats_handler is not None,
            'initialized': True
        }
    
    def get_total_questions(self):
        """전체 문제 수 반환"""
        return len(self.quiz_handler.questions) if self.quiz_handler.questions else 0
    
    def start_quiz(self, start_index=0):
        """퀴즈 시작"""
        try:
            self.quiz_handler.current_index = start_index
            
            # reset_current_question 메서드 안전 호출
            if hasattr(self.quiz_handler, 'reset_current_question'):
                self.quiz_handler.reset_current_question()
            
            return self.quiz_handler.display_question(start_index)
        except Exception as e:
            print(f"❌ QuizService.start_quiz 오류: {str(e)}")
            return {'success': False, 'message': str(e)}
    
    def get_question(self, question_index):
        """특정 문제 가져오기"""
        try:
            self.quiz_handler.current_index = question_index
            
            # reset_current_question 메서드 안전 호출
            if hasattr(self.quiz_handler, 'reset_current_question'):
                self.quiz_handler.reset_current_question()
            
            return self.quiz_handler.display_question(question_index)
        except Exception as e:
            print(f"❌ QuizService.get_question 오류: {str(e)}")
            return {'success': False, 'message': str(e)}
    
    def submit_answer(self, question_index, user_answer):
        """답안 제출 및 채점"""
        try:
            if question_index >= len(self.quiz_handler.questions):
                return {'success': False, 'message': '유효하지 않은 문제입니다'}
            
            current_question = self.quiz_handler.questions[question_index]
            correct_answer = current_question.get('answer', '')
            
            # 답안 비교
            user_answer_clean = str(user_answer).strip().upper()
            correct_answer_clean = str(correct_answer).strip().upper()
            is_correct = user_answer_clean == correct_answer_clean
            
            # StatsHandler에 기록 (안전 호출)
            if STATS_AVAILABLE and self.stats_handler:
                try:
                    if hasattr(self.stats_handler, 'record_answer'):
                        self.stats_handler.record_answer(
                            is_correct=is_correct,
                            question_id=current_question.get('qcode', f'Q{question_index}'),
                            category=current_question.get('layer1', '일반')
                        )
                        print("📊 StatsHandler 기록 성공")
                except Exception as e:
                    print(f"⚠️ StatsHandler 기록 실패: {e}")
            
            return {
                'success': True,
                'is_correct': is_correct,
                'correct_answer': correct_answer,
                'question_info': {
                    'category': current_question.get('layer1', '일반'),
                    'type': current_question.get('type', '진위형'),
                    'code': current_question.get('qcode', f'Q{question_index}')
                }
            }
            
        except Exception as e:
            print(f"❌ QuizService.submit_answer 오류: {str(e)}")
            return {'success': False, 'message': str(e)}
    
    def get_stats_data(self):
        """StatsHandler에서 통계 데이터 가져오기"""
        if not (STATS_AVAILABLE and self.stats_handler):
            return {}
        
        try:
            stats_data = {}
            
            # 안전한 메서드 호출
            if hasattr(self.stats_handler, 'get_user_progress'):
                stats_data['progress'] = self.stats_handler.get_user_progress()
            
            if hasattr(self.stats_handler, 'get_user_accuracy'):
                stats_data['accuracy'] = self.stats_handler.get_user_accuracy()
            
            if hasattr(self.stats_handler, 'get_category_stats'):
                stats_data['category_stats'] = self.stats_handler.get_category_stats()
            
            if hasattr(self.stats_handler, 'get_overall_stats'):
                stats_data['overall_stats'] = self.stats_handler.get_overall_stats()
            
            return stats_data
            
        except Exception as e:
            print(f"⚠️ QuizService.get_stats_data 오류: {e}")
            return {}