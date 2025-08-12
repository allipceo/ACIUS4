#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Integration check for app_v1.4.py using Flask test client.
Runs key endpoint calls without launching a server.
"""

import importlib.util
import os
import sys


def load_app_module(file_path: str):
    spec = importlib.util.spec_from_file_location("app_v1_4", file_path)
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader, "Failed to load spec"
    spec.loader.exec_module(module)  # type: ignore[attr-defined]
    return module


def main() -> int:
    repo_root = os.path.dirname(os.path.abspath(__file__))
    app_file = os.path.join(repo_root, "app_v1.4.py")

    try:
        mod = load_app_module(app_file)
        app = mod.create_app()
    except Exception as e:
        print("IMPORT_OR_INIT_FAILED", str(e))
        return 2

    client = app.test_client()

    def show(label: str, resp):
        try:
            data = resp.get_json(silent=True)
        except Exception:
            data = None
        print(label, resp.status_code, bool(data and data.get("success")), data if isinstance(data, dict) else str(resp.data)[:200])

    try:
        # Health
        r = client.get("/api/health")
        show("HEALTH", r)

        # Start quiz
        r = client.post("/api/quiz/start", json={"user_name": "tester"})
        show("START", r)

        # Get first question
        r = client.get("/api/quiz/question/0")
        show("QUESTION", r)

        # Submit answer
        r = client.post("/api/quiz/submit", json={"answer": "O"})
        show("SUBMIT", r)

        # Next question
        r = client.get("/api/quiz/next")
        show("NEXT", r)

        # Current stats
        r = client.get("/api/stats/current")
        show("STATS", r)
    except Exception as e:
        print("REQUEST_FAILED", str(e))
        return 3

    return 0


if __name__ == "__main__":
    sys.exit(main())


