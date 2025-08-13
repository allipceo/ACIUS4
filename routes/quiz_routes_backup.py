#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Quiz Routes - 퀴즈 관련 API 라우터
기존 app_v1.3.py의 퀴즈 API 부분을 분리

작성자: 노팀장
작성일: 2025년 8월 9일
파일: routes/quiz_routes.py
"""

from flask import Blueprint, request, jsonify, session, current_app
from datetime import datetime

quiz_bp = Blueprint('quiz', __name__)

@quiz_bp.route('/health')
def health_check():
    """퀴즈 API 상태 확인"""
    try:
        quiz_service = current_app.quiz_service
        if quiz_service:
            status = quiz_service.get_status()
            return jsonify({
                'status': 'healthy',
                'quiz_service': status,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'status': 'unhealthy',
                'error': 'QuizService not available',
                'timestamp': datetime.now().isoformat()
            }), 500
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@quiz_bp.route('/start', methods=['POST'])
def start_quiz():
    """퀴즈 시작 API - app_v1.3.py에서 분리"""
    try:
        data = request.get_json()
        user_name = data.get('user_name', 'anonymous').strip()
        
        if not user_name:
            return jsonify({
                'success': False,
                'message': '사용자 이름을 입력해주세요'
            })
        
        # 서비스 사용
        quiz_service = current_app.quiz_service
        user_service = current_app.user_service
        
        # 사용자 ID 생성
        user_id = f"user_{user_name}_{datetime.now().strftime('%Y%m%d')}"
        
        # 기존 사용자 데이터 로드
        existing_data = user_service.get_user_data(user_id)
        if not existing_data:
            existing_data = user_service.create_new_user(user_name, user_id)
            print(f"🆕 신규 사용자 생성: {user_name}")
        else:
            print(f"👤 기존 사용자 복원: {user_name}")
        
        # 세션 설정
        session.permanent = True
        session['user_id'] = user_id
        session['user_name'] = user_name
        session['session_start'] = datetime.now().isoformat()
        session['current_question_index'] = existing_data.get('last_question_index', 0)
        session['correct_count'] = 0
        session['wrong_count'] = 0
        session['session_stats'] = {
            'start_time': datetime.now().isoformat(),
            'questions_in_session': 0,
            'correct_in_session': 0,
            'wrong_in_session': 0
        }
        
        # 퀴즈 시작
        start_index = session['current_question_index']
        result = quiz_service.start_quiz(start_index)
        
        if result and result.get('success'):
            return jsonify({
                'success': True,
                'message': f'{user_name}님, 퀴즈가 시작되었습니다!',
                'question_data': result['question_data'],
                'user_info': {
                    'user_name': user_name,
                    'user_id': user_id,
                    'resume_from': start_index + 1,
                    'total_questions': quiz_service.get_total_questions(),
                    'previous_stats': existing_data
                }
            })
        else:
            return jsonify({
                'success': False,
                'message': '퀴즈 시작 실패: 문제를 불러올 수 없습니다'
            })
            
    except Exception as e:
        print(f"❌ 퀴즈 시작 오류: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'퀴즈 시작 오류: {str(e)}'
        })

@quiz_bp.route('/question/<int:question_index>')
def get_question(question_index):
    """특정 문제 가져오기 API - app_v1.3.py에서 분리"""
    try:
        quiz_service = current_app.quiz_service
        result = quiz_service.get_question(question_index)
        
        if result and result.get('success'):
            session['current_question_index'] = question_index
            
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
                'message': '문제를 가져올 수 없습니다'
            })
            
    except Exception as e:
        print(f"❌ 문제 가져오기 오류: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'문제 가져오기 오류: {str(e)}'
        })

@quiz_bp.route('/submit', methods=['POST'])
def submit_answer():
    """답안 제출 API - app_v1.3.py에서 분리"""
    try:
        data = request.get_json()
        user_answer = data.get('answer')
        
        if not user_answer:
            return jsonify({
                'success': False,
                'message': '답안이 제출되지 않았습니다'
            })
        
        current_index = session.get('current_question_index', 0)
        quiz_service = current_app.quiz_service
        user_service = current_app.user_service
        
        # 답안 채점
        result = quiz_service.submit_answer(current_index, user_answer)
        
        if result and result.get('success'):
            is_correct = result['is_correct']
            
            # 세션 통계 업데이트
            if is_correct:
                session['correct_count'] = session.get('correct_count', 0) + 1
                session['session_stats']['correct_in_session'] += 1
                message = "정답입니다! 🎉"
            else:
                session['wrong_count'] = session.get('wrong_count', 0) + 1
                session['session_stats']['wrong_in_session'] += 1
                message = f"오답입니다. 정답은 '{result['correct_answer']}' 입니다."
            
            session['session_stats']['questions_in_session'] += 1
            session.permanent = True
            
            # 사용자 진도 업데이트
            user_service.update_user_progress(
                session.get('user_id'),
                is_correct,
                current_index,
                session
            )
            
            return jsonify({
                'success': True,
                'is_correct': is_correct,
                'user_answer': user_answer,
                'correct_answer': result['correct_answer'],
                'message': message,
                'session_info': {
                    'user_name': session.get('user_name', 'anonymous'),
                    'current_index': current_index,
                    'correct_count': session.get('correct_count', 0),
                    'wrong_count': session.get('wrong_count', 0)
                },
                'question_info': result.get('question_info', {})
            })
        else:
            return jsonify({
                'success': False,
                'message': '답안 처리 실패'
            })
            
    except Exception as e:
        print(f"❌ 답안 제출 오류: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'답안 제출 오류: {str(e)}'
        })

@quiz_bp.route('/next')
def next_question():
    """다음 문제 API - app_v1.3.py에서 분리"""
    try:
        current_index = session.get('current_question_index', 0)
        next_index = current_index + 1
        
        quiz_service = current_app.quiz_service
        total_questions = quiz_service.get_total_questions()
        
        if next_index >= total_questions:
            user_service = current_app.user_service
            completion_stats = user_service.complete_quiz_session(session)
            
            return jsonify({
                'success': False,
                'message': '🎉 모든 문제를 완료했습니다!',
                'is_last': True,
                'completion_stats': completion_stats
            })
        
        result = quiz_service.get_question(next_index)
        
        if result and result.get('success'):
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
        print(f"❌ 다음 문제 오류: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'다음 문제 오류: {str(e)}'
        })

@quiz_bp.route('/prev')
def prev_question():
    """이전 문제 API - app_v1.3.py에서 분리"""
    try:
        current_index = session.get('current_question_index', 0)
        prev_index = current_index - 1
        
        if prev_index < 0:
            return jsonify({
                'success': False,
                'message': '첫 번째 문제입니다',
                'is_first': True
            })
        
        quiz_service = current_app.quiz_service
        result = quiz_service.get_question(prev_index)
        
        if result and result.get('success'):
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
        print(f"❌ 이전 문제 오류: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'이전 문제 오류: {str(e)}'
        })

