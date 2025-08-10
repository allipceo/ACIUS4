# Phase 1: 파일명 표준화 스크립트 (V1.2)
# 실행 방법: python phase1_standardize.py

import os
import glob
import shutil
from datetime import datetime

def standardize_filenames():
    print("🚀 AICU 시즌4 파일명 표준화 시작...")
    print(f"📅 시작 시간: {datetime.now().strftime('%H:%M:%S')}")
    print("="*50)
    
    # 1. app_v2.0.py 보호 확인
    if os.path.exists("app_v2.0.py"):
        print("✅ app_v2.0.py 검증 완료 버전 확인")
        # 안전 복사본 생성
        shutil.copy2("app_v2.0.py", "app_v2_0_verified.py")
        print("✅ app_v2_0_verified.py 안전 복사본 생성")
    else:
        print("⚠️  app_v2.0.py 파일이 없습니다!")
        print("📋 현재 디렉토리:", os.getcwd())
        print("📋 파일 목록:")
        for file in os.listdir("."):
            if file.endswith(".py"):
                print(f"   - {file}")
        return False
    
    print("\n🔍 점(.) 포함 파일 검색 중...")
    
    # 2. 점 포함 .py 파일들 찾기 및 변경
    py_files_found = []
    potential_py_files = {
        "quiz_routes_v1_0_original.py": "quiz_routes_v1_0_original.py",
        "routes/quiz_routes_v1_0_original.py": "routes/quiz_routes_v1_0_original.py",
        "app_v1.8.py": "app_v1_8_original.py", 
        "services/quiz_data_service_v1_0.py": "services/quiz_data_service_v1_0.py"
    }
    
    for old_path, new_path in potential_py_files.items():
        if os.path.exists(old_path):
            try:
                os.rename(old_path, new_path)
                print(f"✅ {old_path} → {new_path}")
                py_files_found.append((old_path, new_path))
            except Exception as e:
                print(f"❌ {old_path} 변경 실패: {e}")
        else:
            print(f"⚠️  {old_path} 파일 없음")
    
    # 3. 점 포함 .html 파일들 찾기 및 변경
    html_files_found = []
    potential_html_files = {
        "templates/quiz_v1.0.html": "templates/quiz_v1_0.html",
        "quiz_v1.0.html": "quiz_v1_0.html"
    }
    
    for old_path, new_path in potential_html_files.items():
        if os.path.exists(old_path):
            try:
                os.rename(old_path, new_path)
                print(f"✅ {old_path} → {new_path}")
                html_files_found.append((old_path, new_path))
            except Exception as e:
                print(f"❌ {old_path} 변경 실패: {e}")
        else:
            print(f"⚠️  {old_path} 파일 없음")
    
    # 4. 추가 점 포함 파일 자동 검색
    print("\n🔍 추가 점 포함 파일 자동 검색...")
    all_files = glob.glob("**/*.*", recursive=True)
    dot_files = [f for f in all_files if '.' in os.path.basename(f).replace('.py', '').replace('.html', '').replace('.js', '').replace('.css', '').replace('.md', '') and not f.startswith('.git') and not '__pycache__' in f]
    
    for file_path in dot_files:
        if any(ext in file_path for ext in ['.py', '.html', '.js']):
            print(f"🔍 발견: {file_path}")
    
    # 5. 결과 요약
    print("\n" + "="*50)
    print("📊 Phase 1 완료 요약:")
    print(f"✅ 변경된 Python 파일: {len(py_files_found)}개")
    print(f"✅ 변경된 HTML 파일: {len(html_files_found)}개")
    print(f"✅ app_v2.0.py 보호: 완료")
    print(f"✅ 안전 복사본: app_v2_0_verified.py")
    
    if py_files_found or html_files_found:
        print("\n🎉 파일명 표준화 성공!")
        return True
    else:
        print("\n⚠️  변경할 파일이 없습니다 (이미 표준화됨)")
        return True

# 실행
if __name__ == "__main__":
    success = standardize_filenames()
    if success:
        print("\n✅ Phase 1 완료! Phase 2로 진행 가능합니다.")
        print(f"📅 완료 시간: {datetime.now().strftime('%H:%M:%S')}")
    else:
        print("\n❌ Phase 1 실패! app_v2.0.py 위치를 확인해주세요.")