from flask import Flask, render_template, request, jsonify
import json
import os
from datetime import datetime

app = Flask(__name__)

# 문제 데이터 로드 - static 폴더에서 로드
def load_questions():
    try:
        with open('static/questions.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"questions": []}

# 사용자 데이터 저장
def save_user_data(user_data):
    try:
        with open('user_data.json', 'w', encoding='utf-8') as f:
            json.dump(user_data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"사용자 데이터 저장 실패: {e}")
        return False

# 사용자 데이터 로드
def load_user_data():
    try:
        with open('user_data.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/register')
def register():
    return render_template('user_registration.html')

@app.route('/basic-learning')
def basic_learning():
    return render_template('basic_learning.html')

@app.route('/large-category-learning')
def large_category_learning():
    return render_template('large_category_learning_v3.7.html')

@app.route('/statistics')
def statistics():
    return render_template('statistics.html')

@app.route('/debug')
def debug():
    return render_template('debug.html')

@app.route('/settings')
def settings():
    return render_template('settings_new.html')

# 누락된 엔드포인트들 추가
@app.route('/user-registration')
def user_registration():
    return render_template('user_registration.html')

@app.route('/stats-test')
def stats_test():
    return render_template('stats_test.html')

@app.route('/registration-check')
def registration_check():
    return render_template('registration_check.html')

@app.route('/developer-tools')
def developer_tools():
    return render_template('developer_tools.html')

@app.route('/api/register/guest', methods=['POST'])
def api_register_guest():
    try:
        data = request.get_json()
        name = data.get('name', '')
        exam_date = data.get('exam_date', '')
        
        if not name or not exam_date:
            return jsonify({'success': False, 'message': '이름과 시험일을 입력해주세요.'})
        
        user_data = {
            'name': name,
            'exam_date': exam_date,
            'registration_date': datetime.now().isoformat(),
            'type': 'guest',
            'created_at': datetime.now().isoformat()
        }
        
        if save_user_data(user_data):
            return jsonify({
                'success': True, 
                'message': '게스트 등록이 완료되었습니다.',
                'user_data': user_data
            })
        else:
            return jsonify({'success': False, 'message': '등록 중 오류가 발생했습니다.'})
            
    except Exception as e:
        return jsonify({'success': False, 'message': f'서버 오류: {str(e)}'})

@app.route('/api/register/user', methods=['POST'])
def api_register_user():
    try:
        data = request.get_json()
        name = data.get('name', '')
        phone = data.get('phone', '')
        exam_date = data.get('exam_date', '')
        
        if not name or not phone or not exam_date:
            return jsonify({'success': False, 'message': '이름, 전화번호, 시험일을 모두 입력해주세요.'})
        
        user_data = {
            'name': name,
            'phone': phone,
            'exam_date': exam_date,
            'registration_date': datetime.now().isoformat(),
            'type': 'registered',
            'created_at': datetime.now().isoformat()
        }
        
        if save_user_data(user_data):
            return jsonify({
                'success': True, 
                'message': '사용자 등록이 완료되었습니다.',
                'user_data': user_data
            })
        else:
            return jsonify({'success': False, 'message': '등록 중 오류가 발생했습니다.'})
            
    except Exception as e:
        return jsonify({'success': False, 'message': f'서버 오류: {str(e)}'})

@app.route('/api/register', methods=['POST'])
def api_register():
    try:
        data = request.get_json()
        name = data.get('name', '')
        exam_date = data.get('exam_date', '')
        
        if not name or not exam_date:
            return jsonify({'success': False, 'message': '이름과 시험일을 입력해주세요.'})
        
        user_data = {
            'name': name,
            'exam_date': exam_date,
            'registration_date': datetime.now().isoformat(),
            'type': 'registered'
        }
        
        if save_user_data(user_data):
            return jsonify({'success': True, 'message': '등록이 완료되었습니다.'})
        else:
            return jsonify({'success': False, 'message': '등록 중 오류가 발생했습니다.'})
            
    except Exception as e:
        return jsonify({'success': False, 'message': f'서버 오류: {str(e)}'})

@app.route('/api/questions')
def api_questions():
    try:
        questions_data = load_questions()
        category = request.args.get('category')
        
        if category:
            # 카테고리별 필터링
            filtered_questions = []
            for q in questions_data.get('questions', []):
                if q.get('layer1') == category:
                    filtered_questions.append(q)
            return jsonify({'questions': filtered_questions})
        else:
            return jsonify(questions_data)
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/statistics')
def api_statistics():
    try:
        category = request.args.get('category')
        if category:
            # 카테고리별 통계 조회
            questions_data = load_questions()
            category_questions = [q for q in questions_data.get('questions', []) if q.get('layer1') == category]
            
            stats = {
                'category': category,
                'total_questions': len(category_questions),
                'questions': category_questions
            }
            return jsonify(stats)
        else:
            return jsonify({'error': '카테고리가 필요합니다.'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 AICU S4 v4.12 - Heroku 배포 준비 완료")
    print("📍 URL: http://localhost:5000")
    print("📋 배포 준비 사항:")
    print("   ✅ requirements.txt 생성 완료")
    print("   ✅ Procfile 생성 완료")
    print("   ✅ app.py 생성 완료")
    print("   ✅ static 폴더 경로 수정 완료")
    print("   ✅ Heroku 배포 준비 완료")
    print("=" * 60)
    
    # Heroku 환경에서는 포트를 환경변수에서 가져옴
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
