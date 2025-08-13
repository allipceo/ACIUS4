# app_v4.0.py
# ACIU QUIZ 앱 시즌2 - Python Flask 기반 백엔드 애플리케이션
# 기획총괄: 코코치, 기술자문: 노팀장, 개발담당: 서대리

from flask import Flask, jsonify, render_template
import os

app = Flask(__name__)

# 테스트용 가상(Mock) 퀴즈 데이터 정의
# 실제 개발 시에는 'data/questions.json' 파일에서 데이터를 읽어오는 로직으로 대체됩니다.
questions_data = {
    "metadata": {
        "categories": {
            "재산보험": {},
            "해상보험": {},
            "배상책임보험": {}
        }
    },
    "questions": [
        {
            "qcode": "Q-001",
            "question": "다음 중 보험심사역 시험의 특징으로 옳지 않은 것은?",
            "answer": "정답은 나중에 입력됩니다."
        },
        {
            "qcode": "Q-002",
            "question": "ACIU QUIZ 앱의 목표는 효율적인 학습 지원입니다.",
            "answer": "정답은 나중에 입력됩니다."
        }
    ]
}

# 1. 메인 페이지 라우트
# 'templates/index.html' 파일을 렌더링합니다.
@app.route('/')
def home():
    """메인 페이지를 렌더링하는 함수."""
    return render_template('index.html')

# 2. 퀴즈 문제 API 라우트
# '/api/quiz/questions' 경로로 JSON 형식의 문제 데이터를 제공합니다.
# 이 엔드포인트는 Canvas에서 테스트했던 `fetch` 호출의 응답 역할을 합니다.
@app.route('/api/quiz/questions')
def get_quiz_questions():
    """퀴즈 문제 데이터를 JSON 형식으로 반환하는 API 엔드포인트."""
    return jsonify(questions_data)

# 3. 애플리케이션 실행
# 개발 환경과 배포 환경(Heroku)에 맞게 포트를 설정합니다.
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
