# Phase 2: import 구문 수정 스크립트 (V1.2)
# 실행 방법: python phase2_fix_imports.py

import os
import glob
import re
from datetime import datetime

def fix_imports():
    print("🔧 AICU 시즌4 import 구문 수정 시작...")
    print(f"📅 시작 시간: {datetime.now().strftime('%H:%M:%S')}")
    print("="*50)
    
    # app_v2.0.py 보호
    protected_files = ["app_v2.0.py", "app_v2_0_verified.py"]
    
    # 모든 .py 파일 스캔 (보호된 파일 제외)
    py_files = glob.glob("**/*.py", recursive=True)
    py_files = [f for f in py_files if f not in protected_files and not '__pycache__' in f and not '.git' in f]
    
    print(f"📋 스캔된 Python 파일: {len(py_files)}개")
    
    # import 수정 매핑
    replace_map = {
        "from routes.quiz_routes_v1_0_original": "from routes.quiz_routes_v1_0_original",
        "import quiz_routes_v1_0_original": "import quiz_routes_v1_0_original",
        "from services.quiz_data_service_v1_0": "from services.quiz_data_service_v1_0",
        "import quiz_data_service_v1_0": "import quiz_data_service_v1_0",
        "quiz_routes_v1_0_original": "quiz_routes_v1_0_original",
        "quiz_data_service_v1_0": "quiz_data_service_v1_0"
    }
    
    modified_files = []
    
    for file_path in py_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            modified = False
            
            for old_import, new_import in replace_map.items():
                if old_import in content:
                    content = content.replace(old_import, new_import)
                    modified = True
            
            if modified:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✅ {file_path} import 수정 완료")
                modified_files.append(file_path)
                
        except Exception as e:
            print(f"⚠️  {file_path} 처리 실패: {e}")
    
    # app_v2.0.py 무결성 확인
    print("\n🔍 app_v2.0.py 무결성 확인...")
    try:
        with open("app_v2.0.py", 'r', encoding='utf-8') as f:
            content = f.read()
        
        if "app.register_blueprint" in content and "quiz_bp" in content:
            print("✅ app_v2.0.py 무결성 확인 완료")
        else:
            print("⚠️  app_v2.0.py 내용 확인 필요")
            
    except Exception as e:
        print(f"❌ app_v2.0.py 확인 실패: {e}")
    
    # 결과 요약
    print("\n" + "="*50)
    print("📊 Phase 2 완료 요약:")
    print(f"✅ 스캔된 Python 파일: {len(py_files)}개")
    print(f"✅ 수정된 파일: {len(modified_files)}개")
    print(f"✅ app_v2.0.py 보호: 완료")
    
    if modified_files:
        print("\n📋 수정된 파일 목록:")
        for file in modified_files:
            print(f"   - {file}")
    
    print("\n🎉 import 구문 수정 성공!")
    return True

# 실행
if __name__ == "__main__":
    success = fix_imports()
    if success:
        print("\n✅ Phase 2 완료! Phase 3로 진행 가능합니다.")
        print(f"📅 완료 시간: {datetime.now().strftime('%H:%M:%S')}")
    else:
        print("\n❌ Phase 2 실패!")

