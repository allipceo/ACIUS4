# routes/user_registration.py - ACIU S4 사용자 등록 시스템

from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for
import json
import os
from datetime import datetime

# 기존 user_routes.py와 충돌 방지를 위해 새로운 Blueprint 이름 사용
user_registration_bp = Blueprint('user_registration', __name__)

# 임시 데이터 저장소 (실제로는 데이터베이스나 파일 시스템 사용)
USERS_DATA = {}
USER_STATS = {}

def generate_user_id(user_name, user_phone):
    """사용자 고유 ID 생성"""
    import hashlib
    combined = f"{user_name}_{user_phone}_{datetime.now().timestamp()}"
    hash_object = hashlib.md5(combined.encode())
    return f"user_{hash_object.hexdigest()[:12]}"

def create_initial_statistics(user_id):
    """사용자 초기 통계 생성"""
    return {
        'userId': user_id,
        'registeredAt': datetime.now().isoformat(),
        'lastUpdated': datetime.now().isoformat(),
        
        # 전체 통계
        'overall': {
            'totalAttempted': 0,
            'totalCorrect': 0,
            'totalWrong': 0,
            'accuracy': 0.0,
            'studyDays': 0,
            'totalStudyTime': 0
        },
        
        # 일별 통계
        'daily': {
            'today': datetime.now().date().isoformat(),
            'todayAttempted': 0,
            'todayCorrect': 0,
            'todayWrong': 0,
            'todayAccuracy': 0.0,
            'todayStudyTime': 0
        },
        
        # 기본학습 통계
        'basicLearning': {
            'attempted': 0,
            'correct': 0,
            'wrong': 0,
            'accuracy': 0.0,
            'currentIndex': 0,
            'mode': 'continue'
        },
        
        # 대분류학습 통계
        'categoryLearning': {
            '재산보험': {'attempted': 0, 'correct': 0, 'wrong': 0, 'accuracy': 0.0},
            '특종보험': {'attempted': 0, 'correct': 0, 'wrong': 0, 'accuracy': 0.0},
            '배상책임보험': {'attempted': 0, 'correct': 0, 'wrong': 0, 'accuracy': 0.0},
            '해상보험': {'attempted': 0, 'correct': 0, 'wrong': 0, 'accuracy': 0.0}
        },
        
        # 시험 점수 예측
        'examPrediction': {
            'overallScore': 0.0,
            'subjectScores': {
                '재산보험': 0.0,
                '특종보험': 0.0,
                '배상책임보험': 0.0,
                '해상보험': 0.0
            },
            'passLikelihood': 0.0
        }
    }

@user_registration_bp.route('/register', methods=['GET'])
def register_page():
    """사용자 등록 페이지 렌더링"""
    print("=== 사용자 등록 페이지 요청 ===")
    return render_template('user_registration.html')

@user_registration_bp.route('/api/users/register', methods=['POST'])
def register_user():
    """사용자 등록 API"""
    print("=== 사용자 등록 API 호출 ===")
    
    try:
        # 요청 데이터 파싱
        data = request.get_json()
        print(f"등록 요청 데이터: {data}")
        
        # 필수 필드 검증
        if not data.get('userName'):
            return jsonify({'success': False, 'error': '이름은 필수 항목입니다.'}), 400
        
        if not data.get('userPhone'):
            return jsonify({'success': False, 'error': '전화번호는 필수 항목입니다.'}), 400
        
        # 기존 사용자 확인 (전화번호 기준)
        for user_data in USERS_DATA.values():
            if user_data.get('userPhone') == data.get('userPhone'):
                return jsonify({
                    'success': False, 
                    'error': '이미 등록된 전화번호입니다.',
                    'existingUser': user_data
                }), 400
        
        # 사용자 ID 생성
        user_id = generate_user_id(data.get('userName'), data.get('userPhone'))
        
        # 사용자 데이터 생성
        user_data = {
            'userId': user_id,
            'userName': data.get('userName'),
            'userPhone': data.get('userPhone'),
            'examSubject': data.get('examSubject', '보험중개사'),
            'examDate': data.get('examDate'),
            'syncEnabled': data.get('syncEnabled', True),
            'notificationsEnabled': data.get('notificationsEnabled', True),
            'registeredAt': datetime.now().isoformat(),
            'lastLoginAt': datetime.now().isoformat(),
            'isActive': True
        }
        
        # 초기 통계 생성
        initial_statistics = create_initial_statistics(user_id)
        
        # 메모리에 저장 (임시)
        USERS_DATA[user_id] = user_data
        USER_STATS[user_id] = initial_statistics
        
        # 세션에 사용자 ID 저장
        session['current_user_id'] = user_id
        
        print(f"사용자 등록 성공: {user_id}")
        
        return jsonify({
            'success': True,
            'userId': user_id,
            'message': '사용자 등록이 완료되었습니다.',
            'userData': user_data,
            'statistics': initial_statistics
        }), 200
        
    except Exception as e:
        print(f"등록 오류: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'등록 중 오류가 발생했습니다: {str(e)}'
        }), 500

@user_registration_bp.route('/api/users/current', methods=['GET'])
def get_current_user():
    """현재 로그인된 사용자 정보 조회"""
    print("=== 현재 사용자 조회 API 호출 ===")
    
    try:
        user_id = session.get('current_user_id')
        print(f"세션 사용자 ID: {user_id}")
        
        if not user_id:
            return jsonify({
                'success': False,
                'error': '로그인된 사용자가 없습니다.'
            }), 401
        
        user_data = USERS_DATA.get(user_id)
        if user_data:
            return jsonify({
                'success': True,
                'userData': user_data
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': '사용자 정보를 찾을 수 없습니다.'
            }), 404
            
    except Exception as e:
        print(f"사용자 조회 오류: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'사용자 정보 조회 중 오류: {str(e)}'
        }), 500

@user_registration_bp.route('/api/users/<user_id>/statistics', methods=['GET'])
def get_user_statistics(user_id):
    """사용자별 통계 조회"""
    print(f"=== 사용자 통계 조회: {user_id} ===")
    
    try:
        # 권한 확인 (자신의 통계만 조회 가능)
        current_user_id = session.get('current_user_id')
        if current_user_id != user_id:
            return jsonify({
                'success': False,
                'error': '권한이 없습니다.'
            }), 403
        
        statistics = USER_STATS.get(user_id)
        
        if statistics:
            return jsonify({
                'success': True,
                'statistics': statistics
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': '통계 정보를 찾을 수 없습니다.'
            }), 404
            
    except Exception as e:
        print(f"통계 조회 오류: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'통계 조회 중 오류: {str(e)}'
        }), 500

@user_registration_bp.route('/api/users/logout', methods=['POST'])
def logout_user():
    """사용자 로그아웃"""
    print("=== 사용자 로그아웃 ===")
    
    try:
        session.pop('current_user_id', None)
        return jsonify({
            'success': True,
            'message': '로그아웃되었습니다.'
        }), 200
        
    except Exception as e:
        print(f"로그아웃 오류: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'로그아웃 중 오류: {str(e)}'
        }), 500

# 디버깅용 엔드포인트
@user_registration_bp.route('/api/debug/users', methods=['GET'])
def debug_users():
    """모든 사용자 데이터 조회 (개발용)"""
    return jsonify({
        'users': USERS_DATA,
        'stats': USER_STATS,
        'current_session': session.get('current_user_id')
    })

@user_registration_bp.route('/api/debug/clear', methods=['POST'])
def debug_clear():
    """모든 데이터 삭제 (개발용)"""
    global USERS_DATA, USER_STATS
    USERS_DATA.clear()
    USER_STATS.clear()
    session.clear()
    
    return jsonify({
        'success': True,
        'message': '모든 데이터가 삭제되었습니다.'
    })