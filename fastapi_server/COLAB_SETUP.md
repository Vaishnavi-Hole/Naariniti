# Google Colab Setup Guide for Nariniti Open-Source AI Service

This guide explains how to run the Nariniti FastAPI server with an open-source instruction-following LLM (such as `Qwen/Qwen2.5-1.5B-Instruct` or `Llama-3.2-1B-Instruct`) on Google Colab's free T4 GPU and connect it to your Nariniti frontend via a secure tunnel.

---

## Step 1: Create a Colab Notebook with GPU Acceleration

1. Open [Google Colab](https://colab.research.google.com).
2. Create a new notebook titled `Nariniti_AI_Server.ipynb`.
3. Go to **Runtime** > **Change runtime type** > Select **T4 GPU** > Click **Save**.

---

## Step 2: Install Requirements in Colab Cell 1

```python
!pip install -q fastapi uvicorn[standard] pydantic transformers torch accelerate pyngrok
```

---

## Step 3: Write the Server Code in Colab Cell 2

```python
%%writefile server.py
# Copy all contents from fastapi_server/main.py here
```
*(Or upload `main.py` directly to the Colab filesystem).*

---

## Step 4: Launch FastAPI in Background in Colab Cell 3

```python
import subprocess
import time

# Launch uvicorn on port 8000
process = subprocess.Popen(["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"])
time.sleep(3)
print("Uvicorn started on port 8000!")
```

---

## Step 5: Expose Secure HTTPS Tunnel in Colab Cell 4

### Option A: Using Localtunnel (No Account Required)
```bash
!npx localtunnel --port 8000
```
*Note the public IP printed by Colab (e.g. `curl https://loca.lt/mytunnelpassword`) to unlock the localtunnel password page.*

### Option B: Using Cloudflare Quick Tunnel (Free & Instant)
```bash
!wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
!dpkg -i cloudflared-linux-amd64.deb
!cloudflared tunnel --url http://localhost:8000
```
This prints an instant HTTPS tunnel URL like `https://xxxx-xxxx-xxxx.trycloudflare.com`.

### Option C: Using Ngrok (Token Required)
```python
from pyngrok import ngrok
ngrok.set_auth_token("YOUR_NGROK_AUTHTOKEN")
public_url = ngrok.connect(8000)
print(f"Secure Colab Tunnel URL: {public_url}")
```

---

## Step 6: Connect to the Frontend

1. Copy your generated HTTPS tunnel URL (e.g., `https://xxxx.trycloudflare.com` or `https://xxxx.loca.lt`).
2. In your Nariniti project root, set the environment variable in `.env.local` or `.env`:
   ```env
   VITE_AI_API_BASE_URL="https://xxxx.trycloudflare.com"
   NEXT_PUBLIC_AI_API_BASE_URL="https://xxxx.trycloudflare.com"
   ```
3. In the Nariniti app, open the **AI Mentor** tab or top banner, click **Test Connection**. You will see:
   `✓ Live FastAPI Server Online: Qwen/Qwen2.5-1.5B-Instruct on CUDA (T4 GPU)`!

---

## Step 7: Testing the API Endpoints via Curl

### Health Check
```bash
curl -X GET https://YOUR_TUNNEL_URL/api/v1/health
```

### Chat with Mentor
```bash
curl -X POST https://YOUR_TUNNEL_URL/api/v1/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I calculate profit on tea and poha in Shirur?",
    "language": "mr",
    "project_context": {
      "title": "Sai Shakti Snacks",
      "sector": "food_snacks",
      "budget_in_inr": 30000,
      "location": "Shirur, Pune Rural",
      "stage": "planning"
    }
  }'
```
