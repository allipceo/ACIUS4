#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AICU Season4 Flask Web Application v1.0
Week1 완성 모듈들을 웹으로 연결하는 첫 버전

작성자: 노팀장
작성일: 2025년 8월 8일
브랜치: develop02
파일명: app_v1.0.py
"""

from flask import Flask, render_template, request, jsonify, session
import sys
import os
import json

# Week1 완성 모듈 import
sys.path.append(os.path.join(os.path.dirname(__file__), 'modules'))
from quiz_handler import QuizHandler
from stats_handler import StatsHandler

app = Flask(__name__)
app.secret_key = 'aicu_season4_secret_key_v1.0'

# Week1 모듈 초기화
quiz = QuizHandler()
stats = StatsHandler()

# 앱 시작 시 데이터 로드
print("🚀 AICU Season4 v1.0 시작")
if quiz.load_questions():
    print(f"✅ 문제 로드 성공: {len(quiz.questions)}개")
else:
    print("❌ 문제 로드 실패")

@app.route('/')
def home():
    """홈페이지 - 퀴즈 메인으로 리다이렉트"""
    return render_template('quiz.html')

@app.route('/quiz')
def quiz_page():
    """퀴즈 페이지"""
    return render_template('quiz.html')

@app.route('/stats')
def stats_page():
    """통계 페이지"""
    return render_template('stats.html')

@app.route('/api/quiz/start', methods=['POST'])
def start_quiz():
    """퀴즈 시작 API"""
    try:
        # 사용자 정보 받기
        data = request.get_json()
        user_name = data.get('user_name', 'anonymous')
        
        # 세션에 사용자 정보 저장
        session['user_name'] = user_name
        session['current_question_index'] = 0
        session['correct_count'] = 0
        session['wrong_count'] = 0
        
        # 첫 번째 문제 가져오기
        result = quiz.display_question(0)
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': '퀴즈가 시작되었습니다',
                'question_data': result['question_data'],
                'user_name': user_name
            })
        else:
            return jsonify({
                'success': False,
                'message': '퀴즈 시작 실패'
            })
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'오류 발생: {str(e)}'
        })

@app.route('/api/quiz/question/<int:question_index>')
def get_question(question_index):
    """특정 문제 가져오기 API"""
    try:
        result = quiz.display_question(question_index)
        
        if result['success']:
            # 세션 업데이트
            session['current_question_index'] = question_index
            
            return jsonify({
                'success': True,
                'question_data': result['question_data'],
                'session_info': {
                    'user_name': session.get('user_name', 'anonymous'),
                    'current_index': session.get('current_question_index', 0),
                    'correct_count': session.get('correct_count', 0),
                    'wrong_count': session.get('wrong_count', 0)
                }
            })
        else:
            return jsonify({
                'success': False,
                'message': result.get('message', '문제를 가져올 수 없습니다')
            })
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'오류 발생: {str(e)}'
        })

@app.route('/api/quiz/submit', methods=['POST'])
def submit_answer():
    """답안 제출 API"""
    try:
        data = request.get_json()
        user_answer = data.get('answer')
        
        if not user_answer:
            return jsonify({
                'success': False,
                'message': '답안이 제출되지 않았습니다'
            })
        
        # 답안 제출 및 채점
        result = quiz.submit_answer(user_answer)
        
        if result['success']:
            # 세션 통계 업데이트
            if result['is_correct']:
                session['correct_count'] = session.get('correct_count', 0) + 1
            else:
                session['wrong_count'] = session.get('wrong_count', 0) + 1
            
            return jsonify({
                'success': True,
                'is_correct': result['is_correct'],
                'user_answer': result['user_answer'],
                'correct_answer': result['correct_answer'],
                'message': result['message'],
                'session_info': {
                    'user_name': session.get('user_name', 'anonymous'),
                    'current_index': session.get('current_question_index', 0),
                    'correct_count': session.get('correct_count', 0),
                    'wrong_count': session.get('wrong_count', 0)
                }
            })
        else:
            return jsonify({
                'success': False,
                'message': result.get('message', '채점 실패')
            })
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'오류 발생: {str(e)}'
        })

@app.route('/api/quiz/next')
def next_question():
    """다음 문제로 이동 API"""
    try:
        current_index = session.get('current_question_index', 0)
        next_index = current_index + 1
        
        if next_index >= len(quiz.questions):
            return jsonify({
                'success': False,
                'message': '마지막 문제입니다',
                'is_last': True
            })
        
        result = quiz.display_question(next_index)
        
        if result['success']:
            session['current_question_index'] = next_index
            
            return jsonify({
                'success': True,
                'question_data': result['question_data'],
                'session_info': {
                    'user_name': session.get('user_name', 'anonymous'),
                    'current_index': next_index,
                    'correct_count': session.get('correct_count', 0),
                    'wrong_count': session.get('wrong_count', 0)
                }
            })
        else:
            return jsonify({
                'success': False,
                'message': '다음 문제를 가져올 수 없습니다'
            })
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'오류 발생: {str(e)}'
        })

@app.route('/api/quiz/prev')
def prev_question():
    """이전 문제로 이동 API"""
    try:
        current_index = session.get('current_question_index', 0)
        prev_index = current_index - 1
        
        if prev_index < 0:
            return jsonify({
                'success': False,
                'message': '첫 번째 문제입니다',
                'is_first': True
            })
        
        result = quiz.display_question(prev_index)
        
        if result['success']:
            session['current_question_index'] = prev_index
            
            return jsonify({
                'success': True,
                'question_data': result['question_data'],
                'session_info': {
                    'user_name': session.get('user_name', 'anonymous'),
                    'current_index': prev_index,
                    'correct_count': session.get('correct_count', 0),
                    'wrong_count': session.get('wrong_count', 0)
                }
            })
        else:
            return jsonify({
                'success': False,
                'message': '이전 문제를 가져올 수 없습니다'
            })
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'오류 발생: {str(e)}'
        })

@app.route('/api/stats/current')
def get_current_stats():
    """현재 세션 통계 API"""
    try:
        current_index = session.get('current_question_index', 0)
        correct_count = session.get('correct_count', 0)
        wrong_count = session.get('wrong_count', 0)
        total_answered = correct_count + wrong_count
        
        accuracy = 0
        if total_answered > 0:
            accuracy = round((correct_count / total_answered) * 100, 1)
        
        progress = round(((current_index + 1) / len(quiz.questions)) * 100, 1)
        
        return jsonify({
            'success': True,
            'stats': {
                'user_name': session.get('user_name', 'anonymous'),
                'current_question': current_index + 1,
                'total_questions': len(quiz.questions),
                'progress_percent': progress,
                'correct_count': correct_count,
                'wrong_count': wrong_count,
                'total_answered': total_answered,
                'accuracy_percent': accuracy
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'통계 조회 실패: {str(e)}'
        })

@app.route('/api/health')
def health_check():
    """헬스 체크 API"""
    return jsonify({
        'success': True,
        'version': 'v1.0',
        'status': 'healthy',
        'questions_loaded': len(quiz.questions),
        'message': 'AICU Season4 웹앱이 정상 동작 중입니다'
    })

if __name__ == '__main__':
    print("🌐 AICU Season4 v1.0 웹서버 시작")
    print("📍 접속 주소: http://localhost:5000")
    print("🎯 브라우저에서 위 주소로 접속하세요")
    app.run(debug=True, port=5000, host='0.0.0.0')