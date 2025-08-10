# routes/user_registration_v2.0.py - AICU S4 사용자 등록 시스템 (세션 관리 개선)

from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for, make_response
import json
import os
from datetime import datetime

# Blueprint 생성
user_registration_bp = Blueprint('user_registration', __name__)

# 임시 데이터 저장소 (메모리 기반)
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

def set_user_session(user_id):
    """세션 설정 및 영구 저장"""
    try:
        session.permanent = True
        session['current_user_id'] = user_id
        session.modified = True
        print(f"✅ 세션 설정 완료: {user_id}")
        return True
    except Exception as e:
        print(f"❌ 세션 설정 실패: {str(e)}")
        return False

@user_registration_bp.route('/register', methods=['GET'])
def register_page():
    """사용자 등록 페이지 렌더링"""
    print("=== 사용자 등록 페이지 요청 ===")
    
    # 이미 로그인된 경우 대문으로 리다이렉트
    current_user_id = session.get('current_user_id')
    if current_user_id and current_user_id in USERS_DATA:
        print(f"이미 로그인된 사용자: {current_user_id} → 대문으로 리다이렉트")
        return redirect('/home')
    
    try:
        return render_template('user_registration.html')
    except Exception as e:
        print(f"템플릿 렌더링 실패: {str(e)}")
        # 템플릿이 없는 경우 기본 등록 화면
        return """
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>사용자 등록 - AICU S4</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 min-h-screen">
            <div class="container mx-auto px-4 py-8">
                <div class="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
                    <h1 class="text-2xl font-bold text-center text-blue-600 mb-6">AICU S4 사용자 등록</h1>
                    
                    <form id="registrationForm">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
                            <input type="text" id="userName" name="userName" required
                                   class="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                   placeholder="홍길동">
                        </div>
                        
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">전화번호 *</label>
                            <input type="tel" id="userPhone" name="userPhone" required
                                   class="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                   placeholder="010-1234-5678">
                        </div>
                        
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">시험 과목</label>
                            <select id="examSubject" name="examSubject"
                                    class="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                                <option value="보험중개사">보험중개사</option>
                                <option value="손해사정사">손해사정사</option>
                            </select>
                        </div>
                        
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">시험 예정일</label>
                            <input type="date" id="examDate" name="examDate"
                                   class="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <button type="submit" id="submitBtn"
                                class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded">
                            등록하기
                        </button>
                    </form>
                    
                    <div id="message" class="mt-4 text-center"></div>
                </div>
            </div>
            
            <script>
                document.getElementById('registrationForm').addEventListener('submit', async function(e) {
                    e.preventDefault();
                    
                    const submitBtn = document.getElementById('submitBtn');
                    const messageDiv = document.getElementById('message');
                    
                    // 버튼 비활성화
                    submitBtn.disabled = true;
                    submitBtn.textContent = '등록 중...';
                    
                    // 폼 데이터 수집
                    const formData = {
                        userName: document.getElementById('userName').value.trim(),
                        userPhone: document.getElementById('userPhone').value.trim(),
                        examSubject: document.getElementById('examSubject').value,
                        examDate: document.getElementById('examDate').value
                    };
                    
                    try {
                        const response = await fetch('/user/api/users/register', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(formData)
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                            messageDiv.innerHTML = '<p class="text-green-600">✅ 등록 완료! 대문으로 이동합니다...</p>';
                            
                            // 1초 후 대문으로 이동
                            setTimeout(() => {
                                window.location.href = '/home';
                            }, 1000);
                        } else {
                            messageDiv.innerHTML = '<p class="text-red-600">❌ ' + result.error + '</p>';
                            submitBtn.disabled = false;
                            submitBtn.textContent = '등록하기';
                        }
                    } catch (error) {
                        messageDiv.innerHTML = '<p class="text-red-600">❌ 등록 중 오류가 발생했습니다.</p>';
                        submitBtn.disabled = false;
                        submitBtn.textContent = '등록하기';
                    }
                });
            </script>
        </body>
        </html>
        """

@user_registration_bp.route('/api/users/register', methods=['POST'])
def register_user():
    """사용자 등록 API (세션 관리 개선)"""
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
                # 기존 사용자의 경우 세션만 설정하고 로그인 처리
                user_id = user_data['userId']
                if set_user_session(user_id):
                    print(f"기존 사용자 로그인: {user_id}")
                    return jsonify({
                        'success': True,
                        'userId': user_id,
                        'message': '기존 사용자로 로그인되었습니다.',
                        'userData': user_data,
                        'isExistingUser': True
                    }), 200
                else:
                    return jsonify({
                        'success': False,
                        'error': '세션 설정에 실패했습니다.'
                    }), 500
        
        # 새 사용자 등록
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
        
        # 메모리에 저장
        USERS_DATA[user_id] = user_data
        USER_STATS[user_id] = initial_statistics
        
        # 세션 설정
        if not set_user_session(user_id):
            return jsonify({
                'success': False,
                'error': '사용자는 생성되었지만 세션 설정에 실패했습니다.'
            }), 500
        
        print(f"✅ 새 사용자 등록 및 세션 설정 완료: {user_id}")
        
        return jsonify({
            'success': True,
            'userId': user_id,
            'message': '사용자 등록이 완료되었습니다.',
            'userData': user_data,
            'statistics': initial_statistics,
            'isExistingUser': False
        }), 200
        
    except Exception as e:
        print(f"❌ 등록 오류: {str(e)}")
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
        print(f"전체 세션 데이터: {dict(session)}")
        
        if not user_id:
            return jsonify({
                'success': False,
                'error': '로그인된 사용자가 없습니다.'
            }), 401
        
        user_data = USERS_DATA.get(user_id)
        if user_data:
            print(f"✅ 사용자 정보 조회 성공: {user_id}")
            return jsonify({
                'success': True,
                'userData': user_data
            }), 200
        else:
            print(f"❌ 사용자 정보 없음: {user_id}")
            return jsonify({
                'success': False,
                'error': '사용자 정보를 찾을 수 없습니다.'
            }), 404
            
    except Exception as e:
        print(f"❌ 사용자 조회 오류: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'사용자 정보 조회 중 오류: {str(e)}'
        }), 500

@user_registration_bp.route('/api/users/logout', methods=['POST'])
def logout_user():
    """사용자 로그아웃"""
    print("=== 사용자 로그아웃 ===")
    
    try:
        user_id = session.get('current_user_id')
        session.clear()
        print(f"✅ 로그아웃 완료: {user_id}")
        
        return jsonify({
            'success': True,
            'message': '로그아웃되었습니다.'
        }), 200
        
    except Exception as e:
        print(f"❌ 로그아웃 오류: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'로그아웃 중 오류: {str(e)}'
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
            print(f"✅ 통계 조회 성공: {user_id}")
            return jsonify({
                'success': True,
                'statistics': statistics
            }), 200
        else:
            print(f"❌ 통계 정보 없음: {user_id}")
            return jsonify({
                'success': False,
                'error': '통계 정보를 찾을 수 없습니다.'
            }), 404
            
    except Exception as e:
        print(f"❌ 통계 조회 오류: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'통계 조회 중 오류: {str(e)}'
        }), 500

# 디버깅용 엔드포인트
@user_registration_bp.route('/api/debug/users', methods=['GET'])
def debug_users():
    """모든 사용자 데이터 조회 (개발용)"""
    current_session = dict(session)
    print(f"=== 디버그 정보 ===")
    print(f"등록된 사용자 수: {len(USERS_DATA)}")
    print(f"현재 세션: {current_session}")
    
    return jsonify({
        'totalUsers': len(USERS_DATA),
        'users': USERS_DATA,
        'stats': USER_STATS,
        'currentSession': current_session,
        'sessionUserId': session.get('current_user_id')
    })

@user_registration_bp.route('/api/debug/clear', methods=['POST'])
def debug_clear():
    """모든 데이터 삭제 (개발용)"""
    global USERS_DATA, USER_STATS
    USERS_DATA.clear()
    USER_STATS.clear()
    session.clear()
    
    print("✅ 모든 데이터 삭제 완료")
    
    return jsonify({
        'success': True,
        'message': '모든 데이터가 삭제되었습니다.'
    })

@user_registration_bp.route('/api/debug/session', methods=['GET'])
def debug_session():
    """세션 정보 조회 (개발용)"""
    return jsonify({
        'session': dict(session),
        'sessionId': session.get('current_user_id'),
        'sessionKeys': list(session.keys()),
        'sessionModified': session.modified,
        'sessionPermanent': session.permanent
    })