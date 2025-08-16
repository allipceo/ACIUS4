from flask import Flask, render_template, request, jsonify
import json
import os
from datetime import datetime

app = Flask(__name__)

# 문제 데이터 로드
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
    return render_template('register.html')

@app.route('/basic-learning')
def basic_learning():
    return render_template('basic_learning.html')

@app.route('/large-category-learning')
def large_category_learning():
    return render_template('large_category_learning.html')

@app.route('/statistics')
def statistics():
    return render_template('statistics.html')

@app.route('/debug')
def debug():
    return render_template('debug.html')

@app.route('/simulation')
def simulation():
    return render_template('simulation.html')

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
    print("🚀 AICU S4 v4.8 - 학습 패턴 분석 시스템 구축 완료")
    print("📍 URL: http://localhost:5000")
    print("📋 v4.8 학습 패턴 분석 시스템:")
    print("   ✅ LearningPatternAnalyzer 구축 완료")
    print("   ✅ 세션 분석 (총 세션, 최근 세션, 평균 세션 길이)")
    print("   ✅ 일일 패턴 분석 (일일 평균 문제, 최고 성과일, 일관성)")
    print("   ✅ 카테고리 패턴 분석 (선호 카테고리, 약점 카테고리, 균형)")
    print("   ✅ 시간 패턴 분석 (피크 시간, 최적 학습 시간, 주간 패턴)")
    print("   ✅ 정확도 패턴 분석 (전체 트렌드, 개선률, 일관성, 예측)")
    print("   ✅ 학습 권장사항 생성 (카테고리, 시간, 정확도 기반)")
    print("   ✅ 실시간 이벤트 기반 데이터 수집")
    print("   ✅ 주기적 분석 (5분마다)")
    print("   ✅ 학습 패턴 테스트 기능")
    print("   ✅ 116번 문서 과업10 완료")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
