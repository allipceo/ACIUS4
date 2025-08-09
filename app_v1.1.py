#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AICU Season4 Flask Web Application v1.1
답안 제출 오류 수정 버전

작성자: 노팀장
작성일: 2025년 8월 8일
브랜치: develop02
파일명: app_v1.1.py
수정사항: 답안 제출 API 오류 수정
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
app.secret_key = 'aicu_season4_secret_key_v1.1'

# Week1 모듈 초기화
quiz = QuizHandler()
stats = StatsHandler()

# 앱 시작 시 데이터 로드
print("🚀 AICU Season4 v1.1 시작 (답안 제출 오류 수정)")
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
        
        # QuizHandler 초기화 및 첫 번째 문제 설정
        quiz.current_index = 0
        quiz.reset_current_question()
        
        # 첫 번째 문제 가져오기
        result = quiz.display_question(0)
        
        if result['success']:
            # 세션에 현재 문제 정보 저장
            session['current_question_data'] = result['question_data']
            
            return jsonify({
                'success': True,
                'message': '퀴즈가 시작되었습니다',
                'question_data': result['question_data'],
                'user_name': user_name
            })
        else:
            return jsonify({
                'success': False,
                'message': '퀴즈 시작 실패: ' + result.get('message', '')
            })
            
    except Exception as e:
        print(f"❌ 퀴즈 시작 오류: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'퀴즈 시작 오류: {str(e)}'
        })

@app.route('/api/quiz/question/<int:question_index>')
def get_question(question_index):
    """특정 문제 가져오기 API"""
    try:
        # QuizHandler에 인덱스 설정
        quiz.current_index = question_index
        quiz.reset_current_question()
        
        result = quiz.display_question(question_index)
        
        if result['success']:
            # 세션 업데이트
            session['current_question_index'] = question_index
            session['current_question_data'] = result['question_data']
            
            return jsonify({
                'success': True,
                'question_data': result['question_data'],
                'session_info': {
                    'user_name': session.get('user_name', 'anonymous'),
                    'current_index': question_index,
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
        print(f"❌ 문제 가져오기 오류: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'문제 가져오기 오류: {str(e)}'
        })

@app.route('/api/quiz/submit', methods=['POST'])
def submit_answer():
    """답안 제출 API - 수정된 버전"""
    try:
        print("🔍 답안 제출 API 호출됨")
        
        # 요청 데이터 받기
        data = request.get_json()
        if not data:
            print("❌ 요청 데이터가 없습니다")
            return jsonify({
                'success': False,
                'message': '요청 데이터가 없습니다'
            })
        
        user_answer = data.get('answer')
        print(f"📝 사용자 답안: {user_answer}")
        
        if not user_answer:
            print("❌ 답안이 제출되지 않았습니다")
            return jsonify({
                'success': False,
                'message': '답안이 제출되지 않았습니다'
            })
        
        # 현재 문제 정보 확인
        current_index = session.get('current_question_index', 0)
        print(f"📍 현재 문제 인덱스: {current_index}")
        
        # QuizHandler 상태 설정
        quiz.current_index = current_index
        
        # 현재 문제 가져오기
        if current_index < len(quiz.questions):
            current_question = quiz.questions[current_index]
            correct_answer = current_question.get('answer', '')
            
            print(f"✅ 정답: {correct_answer}")
            print(f"📝 사용자 답안: {user_answer}")
            
            # 답안 비교 (대소문자 무시, 공백 제거)
            user_answer_clean = str(user_answer).strip().upper()
            correct_answer_clean = str(correct_answer).strip().upper()
            
            is_correct = user_answer_clean == correct_answer_clean
            print(f"🎯 채점 결과: {is_correct}")
            
            # 세션 통계 업데이트
            if is_correct:
                session['correct_count'] = session.get('correct_count', 0) + 1
                message = "정답입니다! 🎉"
            else:
                session['wrong_count'] = session.get('wrong_count', 0) + 1
                message = f"오답입니다. 정답은 '{correct_answer}' 입니다."
            
            # 세션 저장
            session.permanent = True
            
            print(f"📊 통계 업데이트: 정답 {session.get('correct_count', 0)}, 오답 {session.get('wrong_count', 0)}")
            
            return jsonify({
                'success': True,
                'is_correct': is_correct,
                'user_answer': user_answer,
                'correct_answer': correct_answer,
                'message': message,
                'session_info': {
                    'user_name': session.get('user_name', 'anonymous'),
                    'current_index': current_index,
                    'correct_count': session.get('correct_count', 0),
                    'wrong_count': session.get('wrong_count', 0)
                }
            })
        else:
            print("❌ 유효하지 않은 문제 인덱스")
            return jsonify({
                'success': False,
                'message': '유효하지 않은 문제입니다'
            })
            
    except Exception as e:
        print(f"❌ 답안 제출 오류: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            'success': False,
            'message': f'답안 제출 오류: {str(e)}'
        })

@app.route('/api/quiz/next')
def next_question():
    """다음 문제로 이동 API"""
    try:
        current_index = session.get('current_question_index', 0)
        next_index = current_index + 1
        
        print(f"➡️ 다음 문제로 이동: {current_index} → {next_index}")
        
        if next_index >= len(quiz.questions):
            return jsonify({
                'success': False,
                'message': '마지막 문제입니다',
                'is_last': True
            })
        
        # QuizHandler 상태 설정
        quiz.current_index = next_index
        quiz.reset_current_question()
        
        result = quiz.display_question(next_index)
        
        if result['success']:
            session['current_question_index'] = next_index
            session['current_question_data'] = result['question_data']
            
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
        print(f"❌ 다음 문제 오류: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'다음 문제 오류: {str(e)}'
        })

@app.route('/api/quiz/prev')
def prev_question():
    """이전 문제로 이동 API"""
    try:
        current_index = session.get('current_question_index', 0)
        prev_index = current_index - 1
        
        print(f"⬅️ 이전 문제로 이동: {current_index} → {prev_index}")
        
        if prev_index < 0:
            return jsonify({
                'success': False,
                'message': '첫 번째 문제입니다',
                'is_first': True
            })
        
        # QuizHandler 상태 설정
        quiz.current_index = prev_index
        quiz.reset_current_question()
        
        result = quiz.display_question(prev_index)
        
        if result['success']:
            session['current_question_index'] = prev_index
            session['current_question_data'] = result['question_data']
            
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
        print(f"❌ 이전 문제 오류: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'이전 문제 오류: {str(e)}'
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
        print(f"❌ 통계 조회 오류: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'통계 조회 오류: {str(e)}'
        })

@app.route('/api/health')
def health_check():
    """헬스 체크 API"""
    return jsonify({
        'success': True,
        'version': 'v1.1',
        'status': 'healthy',
        'questions_loaded': len(quiz.questions),
        'message': 'AICU Season4 v1.1 웹앱이 정상 동작 중입니다'
    })

# 에러 핸들러 추가
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'message': '페이지를 찾을 수 없습니다'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    print(f"❌ 서버 내부 오류: {str(error)}")
    return jsonify({
        'success': False,
        'message': '서버 내부 오류가 발생했습니다'
    }), 500

if __name__ == '__main__':
    print("🌐 AICU Season4 v1.1 웹서버 시작 (답안 제출 오류 수정)")
    print("📍 접속 주소: http://localhost:5000")
    print("🔧 수정사항: 답안 제출 API 안정화")
    app.run(debug=True, port=5000, host='0.0.0.0')