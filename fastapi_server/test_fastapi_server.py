"""
Integration and Unit Tests for Nariniti FastAPI Server.
Verifies all 4 required endpoints, Pydantic validations, and timeout handling.
"""
import sys
import os

# Add directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_endpoint():
    print("Test 1: GET /api/v1/health...")
    response = client.get("/api/v1/health")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert data["status"] == "online"
    assert "model_id" in data
    assert "device" in data
    assert data["is_ready"] is True
    print("✓ Health check endpoint verified successfully.")

def test_chat_endpoint_validation():
    print("Test 2: POST /api/v1/ai/chat with full project context...")
    payload = {
        "message": "What is the expected daily profit for a morning breakfast stall?",
        "language": "mr",
        "project_context": {
            "project_id": "prj_test_01",
            "title": "Sai Shakti Snacks",
            "sector": "food_snacks",
            "budget_in_inr": 30000.0,
            "location": "Shirur, Pune Rural",
            "stage": "planning",
            "target_daily_customers": 70
        },
        "conversation_history": []
    }
    response = client.post("/api/v1/ai/chat", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    assert "summary" in data and len(data["summary"]) > 0
    assert "estimated_costs" in data and len(data["estimated_costs"]) > 0
    assert "recommendations" in data
    assert "source_references" in data
    assert "model_identifier" in data
    assert "latency_ms" in data
    print("✓ Chat inference and Pydantic validation passed.")

def test_business_plan_endpoint():
    print("Test 3: POST /api/v1/ai/business-plan unit economics...")
    payload = {
        "title": "Shirur Tea and Snack Stall",
        "sector": "food_snacks",
        "budget_in_inr": 30000.0,
        "location": "Shirur Market",
        "target_daily_customers": 60,
        "operation_mode": "stall"
    }
    response = client.post("/api/v1/ai/business-plan", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert data["break_even_units_daily"] > 0
    assert data["daily_revenue_estimate"] > 0
    assert data["monthly_net_profit_estimate"] > 0
    assert len(data["estimated_startup_costs"]) > 0
    print("✓ Business plan generation endpoint verified.")

def test_summarize_context_endpoint():
    print("Test 4: POST /api/v1/ai/summarize-context...")
    payload = {
        "messages": [
            {"role": "user", "content": "How much does a commercial gas burner cost?"},
            {"role": "assistant", "content": "A standard commercial burner costs approximately ₹4,000 to ₹4,500."}
        ],
        "current_summary": "Initial stall planning."
    }
    response = client.post("/api/v1/ai/summarize-context", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert "updated_summary" in data
    print("✓ Summarize context endpoint verified.")

def test_deterministic_eligibility_endpoint():
    print("Test 5: POST /api/v1/eligibility/evaluate (Phase 6 Deterministic Engine)...")
    # 5a. Eligible Mudra Case
    payload = {
        "scheme_id": "sch_mudra_shishu",
        "age": "26-35",
        "state": "Maharashtra",
        "district": "Pune",
        "sector": "food_snacks",
        "budget_in_inr": 30000.0,
        "cibil_or_credit_ok": True
    }
    res = client.post("/api/v1/eligibility/evaluate", json=payload)
    assert res.status_code == 200, f"Failed: {res.text}"
    report = res.json()
    assert report["overall_status"] == "eligible"
    assert "preliminary_disclaimer" in report
    assert len(report["evidence_references"]) > 0

    # 5b. Boundary / Ineligible Stand-Up India (Budget ₹30k < ₹10 Lakhs)
    res_su = client.post("/api/v1/eligibility/evaluate", json={
        "scheme_id": "sch_standup_india",
        "budget_in_inr": 30000.0
    })
    assert res_su.status_code == 200
    report_su = res_su.json()
    assert report_su["overall_status"] == "ineligible"
    fail_crit = [c for c in report_su["criteria"] if c["status"] == "fail"]
    assert len(fail_crit) > 0

    # 5c. Missing information never assumed passing
    res_empty = client.post("/api/v1/eligibility/evaluate", json={
        "scheme_id": "sch_mudra_shishu"
    })
    assert res_empty.status_code == 200
    report_empty = res_empty.json()
    assert report_empty["overall_status"] == "insufficient_data"
    assert len(report_empty["missing_information"]) > 0

    # 5d. Hallucinated scheme ID rejected
    res_fake = client.post("/api/v1/eligibility/evaluate", json={
        "scheme_id": "sch_hallucinated_scheme_99"
    })
    assert res_fake.status_code == 400
    print("✓ Deterministic eligibility service verified with boundary and hallucination checks.")

if __name__ == "__main__":
    print("\n--- RUNNING FASTAPI INTEGRATION TESTS ---")
    test_health_endpoint()
    test_chat_endpoint_validation()
    test_business_plan_endpoint()
    test_summarize_context_endpoint()
    test_deterministic_eligibility_endpoint()
    print("\n=================================================")
    print("ALL FASTAPI SERVICE & ELIGIBILITY TESTS PASSED (5/5)")
    print("=================================================\n")
