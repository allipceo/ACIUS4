# routes/statistics_routes.py - ACIU S4 통계 시스템

from flask import Blueprint, request, jsonify, session
from datetime import datetime, date
import json

statistics_bp = Blueprint('statistics', __name__)

# 외부에서 사용자 통계 데이터에 접근하기 위한 import
# user_registration.py의 USER_STATS를 참조
def get_user_stats():
    """user_registration.py의 USER_STATS에 접근"""
    try:
        from routes.user_registration import USER_STATS
        return USER_STATS
    except ImportError:
        return {}

@statistics_bp.route('/api/statistics/update', methods=['POST'])
def update_statistics():
    """학습 통계 업데이트 API"""
    print("=== 통계 업데이트 API 호출 ===")
    
    try:
        # 현재 사용자 확인
        current_user_id = session.get('current_user_id')
        if not current_user_id:
            return jsonify({
                'success': False,
                'error': '로그인된 사용자가 없습니다.'
            }), 401
        
        # 요청 데이터 파싱
        data = request.get_json()
        learning_type = data.get('learningType')  # 'basic' 또는 'category'
        is_correct = data.get('isCorrect')  # True/False
        question_info = data.get('questionInfo', {})  # 문제 정보
        
        print(f"통계 업데이트 요청: 사용자={current_user_id}, 타입={learning_type}, 정답여부={is_correct}")
        
        # 사용자 통계 로드
        USER_STATS = get_user_stats()
        user_stats = USER_STATS.get(current_user_id)
        
        if not user_stats:
            return jsonify({
                'success': False,
                'error': '사용자 통계를 찾을 수 없습니다.'
            }), 404
        
        # 오늘 날짜 확인
        today = date.today().isoformat()
        
        # 기본학습 통계 업데이트
        if learning_type == 'basic':
            basic_stats = user_stats.get('basicLearning', {})
            
            # 누적 통계 업데이트
            cumulative = basic_stats.get('cumulative', {
                'totalAttempted': 0, 'totalCorrect': 0, 'totalWrong': 0, 'accuracy': 0.0
            })
            
            cumulative['totalAttempted'] += 1
            if is_correct:
                cumulative['totalCorrect'] += 1
            else:
                cumulative['totalWrong'] += 1
            
            cumulative['accuracy'] = (cumulative['totalCorrect'] / cumulative['totalAttempted']) * 100 if cumulative['totalAttempted'] > 0 else 0
            
            # 금일 통계 업데이트
            today_stats = basic_stats.get('today', {
                'date': today, 'todayAttempted': 0, 'todayCorrect': 0, 'todayWrong': 0, 'accuracy': 0.0
            })
            
            # 날짜가 바뀐 경우 초기화
            if today_stats.get('date') != today:
                today_stats = {
                    'date': today, 'todayAttempted': 0, 'todayCorrect': 0, 'todayWrong': 0, 'accuracy': 0.0
                }
            
            today_stats['todayAttempted'] += 1
            if is_correct:
                today_stats['todayCorrect'] += 1
            else:
                today_stats['todayWrong'] += 1
            
            today_stats['accuracy'] = (today_stats['todayCorrect'] / today_stats['todayAttempted']) * 100 if today_stats['todayAttempted'] > 0 else 0
            
            # 연속 정답 업데이트
            if is_correct:
                basic_stats['streak'] = basic_stats.get('streak', 0) + 1
            else:
                basic_stats['streak'] = 0
            
            # 통계 저장
            basic_stats['cumulative'] = cumulative
            basic_stats['today'] = today_stats
            user_stats['basicLearning'] = basic_stats
        
        # 대분류학습 통계 업데이트 (향후 Step 3에서 구현)
        elif learning_type == 'category':
            category_name = question_info.get('category', '재산보험')
            category_stats = user_stats.get('categoryLearning', {})
            
            if category_name not in category_stats:
                category_stats[category_name] = {
                    'attempted': 0, 'correct': 0, 'wrong': 0, 'accuracy': 0.0
                }
            
            cat_stat = category_stats[category_name]
            cat_stat['attempted'] += 1
            if is_correct:
                cat_stat['correct'] += 1
            else:
                cat_stat['wrong'] += 1
            
            cat_stat['accuracy'] = (cat_stat['correct'] / cat_stat['attempted']) * 100 if cat_stat['attempted'] > 0 else 0
            user_stats['categoryLearning'] = category_stats
        
        # 전체 통계 업데이트
        overall = user_stats.get('overall', {
            'totalAttempted': 0, 'totalCorrect': 0, 'totalWrong': 0, 'accuracy': 0.0
        })
        
        overall['totalAttempted'] += 1
        if is_correct:
            overall['totalCorrect'] += 1
        else:
            overall['totalWrong'] += 1
        
        overall['accuracy'] = (overall['totalCorrect'] / overall['totalAttempted']) * 100 if overall['totalAttempted'] > 0 else 0
        user_stats['overall'] = overall
        
        # 마지막 업데이트 시간
        user_stats['lastUpdated'] = datetime.now().isoformat()
        
        # 메모리에 저장
        USER_STATS[current_user_id] = user_stats
        
        print(f"통계 업데이트 완료: 누적 정답률={cumulative.get('accuracy', 0):.1f}%, 금일 정답률={today_stats.get('accuracy', 0):.1f}%")
        
        return jsonify({
            'success': True,
            'message': '통계가 업데이트되었습니다.',
            'statistics': user_stats
        }), 200
        
    except Exception as e:
        print(f"통계 업데이트 오류: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'통계 업데이트 중 오류: {str(e)}'
        }), 500

@statistics_bp.route('/api/statistics/summary', methods=['GET'])
def get_statistics_summary():
    """통계 요약 조회 API"""
    print("=== 통계 요약 조회 API 호출 ===")
    
    try:
        current_user_id = session.get('current_user_id')
        if not current_user_id:
            return jsonify({
                'success': False,
                'error': '로그인된 사용자가 없습니다.'
            }), 401
        
        USER_STATS = get_user_stats()
        user_stats = USER_STATS.get(current_user_id)
        
        if not user_stats:
            return jsonify({
                'success': False,
                'error': '사용자 통계를 찾을 수 없습니다.'
            }), 404
        
        # 요약 통계 생성
        summary = {
            'overall': user_stats.get('overall', {}),
            'basicLearning': user_stats.get('basicLearning', {}),
            'categoryLearning': user_stats.get('categoryLearning', {}),
            'examPrediction': calculate_exam_prediction(user_stats),
            'lastUpdated': user_stats.get('lastUpdated'),
            'userId': current_user_id
        }
        
        return jsonify({
            'success': True,
            'summary': summary
        }), 200
        
    except Exception as e:
        print(f"통계 요약 조회 오류: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'통계 조회 중 오류: {str(e)}'
        }), 500

def calculate_exam_prediction(user_stats):
    """시험 점수 예측 계산 (조대표님 요구사항: 40점/60점 기준)"""
    try:
        # 카테고리별 통계
        category_stats = user_stats.get('categoryLearning', {})
        categories = ['재산보험', '특종보험', '배상책임보험', '해상보험']
        
        subject_scores = {}
        total_score = 0
        valid_subjects = 0
        
        for category in categories:
            if category in category_stats and category_stats[category]['attempted'] > 0:
                accuracy = category_stats[category]['accuracy']
                score = min(100, max(0, accuracy))  # 0-100점 범위
                subject_scores[category] = {
                    'score': round(score, 1),
                    'attempted': category_stats[category]['attempted'],
                    'passStatus': 'pass' if score >= 40 else 'fail'
                }
                total_score += score
                valid_subjects += 1
            else:
                subject_scores[category] = {
                    'score': 0,
                    'attempted': 0,
                    'passStatus': 'insufficient'
                }
        
        # 전체 평균 계산
        overall_average = total_score / valid_subjects if valid_subjects > 0 else 0
        
        # 합격 가능성 계산
        all_subjects_pass = all(subject_scores[cat]['passStatus'] == 'pass' for cat in categories)
        average_pass = overall_average >= 60
        
        if valid_subjects < 4:
            pass_likelihood = 0
            prediction_status = 'insufficient'
        elif all_subjects_pass and average_pass:
            pass_likelihood = 0.85  # 85% 합격 가능성
            prediction_status = 'likely'
        elif all_subjects_pass or average_pass:
            pass_likelihood = 0.5   # 50% 합격 가능성
            prediction_status = 'uncertain'
        else:
            pass_likelihood = 0.15  # 15% 합격 가능성
            prediction_status = 'at_risk'
        
        return {
            'overallScore': round(overall_average, 1),
            'subjectScores': subject_scores,
            'passLikelihood': pass_likelihood,
            'predictionStatus': prediction_status,
            'allSubjectsPass': all_subjects_pass,
            'averagePass': average_pass,
            'validSubjects': valid_subjects
        }
        
    except Exception as e:
        print(f"시험 점수 예측 계산 오류: {str(e)}")
        return {
            'overallScore': 0,
            'subjectScores': {},
            'passLikelihood': 0,
            'predictionStatus': 'error'
        }

@statistics_bp.route('/api/statistics/reset', methods=['POST'])
def reset_statistics():
    """통계 초기화 API (개발/테스트용)"""
    print("=== 통계 초기화 API 호출 ===")
    
    try:
        current_user_id = session.get('current_user_id')
        if not current_user_id:
            return jsonify({
                'success': False,
                'error': '로그인된 사용자가 없습니다.'
            }), 401
        
        USER_STATS = get_user_stats()
        
        # 초기 통계로 재설정
        initial_stats = {
            'userId': current_user_id,
            'registeredAt': datetime.now().isoformat(),
            'lastUpdated': datetime.now().isoformat(),
            
            'overall': {
                'totalAttempted': 0, 'totalCorrect': 0, 'totalWrong': 0, 'accuracy': 0.0
            },
            
            'basicLearning': {
                'cumulative': {
                    'totalAttempted': 0, 'totalCorrect': 0, 'totalWrong': 0, 'accuracy': 0.0
                },
                'today': {
                    'date': date.today().isoformat(),
                    'todayAttempted': 0, 'todayCorrect': 0, 'todayWrong': 0, 'accuracy': 0.0
                },
                'currentIndex': 0,
                'mode': 'continue',
                'streak': 0
            },
            
            'categoryLearning': {
                '재산보험': {'attempted': 0, 'correct': 0, 'wrong': 0, 'accuracy': 0.0},
                '특종보험': {'attempted': 0, 'correct': 0, 'wrong': 0, 'accuracy': 0.0},
                '배상책임보험': {'attempted': 0, 'correct': 0, 'wrong': 0, 'accuracy': 0.0},
                '해상보험': {'attempted': 0, 'correct': 0, 'wrong': 0, 'accuracy': 0.0}
            }
        }
        
        USER_STATS[current_user_id] = initial_stats
        
        return jsonify({
            'success': True,
            'message': '통계가 초기화되었습니다.',
            'statistics': initial_stats
        }), 200
        
    except Exception as e:
        print(f"통계 초기화 오류: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'통계 초기화 중 오류: {str(e)}'
        }), 500