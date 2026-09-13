"""
DigiPoosh AI - Hugging Face Gradio Space
API Proxy برای سایت دیجی‌پوش
"""

import gradio as gr
import requests
import os

# ═══ کلیدها از Environment Variables ═══
GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")
OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY", "")
GROQ_KEY = os.getenv("GROQ_API_KEY", "")


def call_groq(prompt: str) -> str:
    """سریع‌ترین - Qwen 3.8"""
    try:
        res = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {GROQ_KEY}",
            },
            json={
                "model": "qwen/qwen3.8-27b",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 1024,
                "temperature": 0.7,
            },
            timeout=30,
        )
        data = res.json()
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        raise Exception(f"Groq error: {e}")


def call_openrouter(prompt: str) -> str:
    """OpenRouter MiniMax"""
    try:
        res = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {OPENROUTER_KEY}",
                "HTTP-Referer": "https://digipoosh.ir",
                "X-Title": "DigiPoosh",
            },
            json={
                "model": "minimax/minimax-m2.7:free",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 1024,
            },
            timeout=30,
        )
        data = res.json()
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        raise Exception(f"OpenRouter error: {e}")


def call_gemini(prompt: str) -> str:
    """Gemini (Gemma)"""
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/interactions?key={GEMINI_KEY}"
        res = requests.post(
            url,
            headers={"Content-Type": "application/json"},
            json={"input": prompt, "model": "gemma-4-31b-it"},
            timeout=30,
        )
        data = res.json()
        if "steps" in data:
            for step in data["steps"]:
                if step.get("type") == "model_output" and step.get("content"):
                    return "".join(
                        c.get("text", "")
                        for c in step["content"]
                        if c.get("type") == "text"
                    )
        return data.get("output", "پاسخی دریافت نشد")
    except Exception as e:
        raise Exception(f"Gemini error: {e}")


def smart_chat(prompt: str, history=None) -> str:
    """چت هوشمند با Fallback"""
    if not prompt.strip():
        return "لطفاً یه سوال بپرس!"
    
    # ساخت prompt کامل با تاریخچه
    full_prompt = ""
    if history:
        for h in history[-5:]:  # فقط ۵ تا آخر
            full_prompt += f"{'کاربر' if h['role'] == 'user' else 'دیجی AI'}: {h['content']}\n"
    full_prompt += f"کاربر: {prompt}\nدیجی AI:"
    
    # Fallback: Groq → OpenRouter → Gemini
    for provider, func in [("groq", call_groq), ("openrouter", call_openrouter), ("gemini", call_gemini)]:
        try:
            response = func(full_prompt)
            return response
        except Exception as e:
            print(f"{provider} failed: {e}")
            continue
    
    return "❌ متأسفانه الان هیچ AI در دسترس نیست. لطفاً چند دقیقه بعد دوباره امتحان کنید."


def get_trends() -> str:
    """دریافت ترندهای روز از RSS"""
    sources = [
        ("https://www.vogue.com/feed/rss", "Vogue"),
        ("https://www.gq.com/feed/rss", "GQ"),
        ("https://www.elle.com/feed/rss", "ELLE"),
    ]
    
    all_trends = []
    for url, name in sources:
        try:
            api_url = f"https://api.rss2json.com/v1/api.json?rss_url={requests.utils.quote(url)}&count=3"
            res = requests.get(api_url, timeout=10)
            data = res.json()
            if data.get("status") == "ok":
                for item in data.get("items", [])[:3]:
                    all_trends.append(f"📰 **{item['title']}**\n   منبع: {name}\n   🔗 {item.get('link', '')}\n")
        except Exception:
            continue
    
    if not all_trends:
        return "⚠️ فعلاً ترندها در دسترس نیستن."
    
    return "🔥 **ترندهای روز دنیای مد:**\n\n" + "\n".join(all_trends[:10])


# ═══ رابط Gradio ═══
with gr.Blocks(
    title="DigiPoosh AI",
    theme=gr.themes.Soft(primary_hue="purple"),
) as demo:
    gr.Markdown(
        """
        # 🤖 DigiPoosh AI
        دستیار هوشمند مد و استایل فارسی
        """
    )
    
    with gr.Tab("💬 چت"):
        chatbot = gr.Chatbot(label="گفتگو", height=400)
        msg = gr.Textbox(
            label="پیامت رو بنویس",
            placeholder="مثلاً: یه ست برای عید نوروز پیشنهاد بده",
        )
        send = gr.Button("ارسال", variant="primary")
        
        def respond(message, chat_history):
            response = smart_chat(message, chat_history)
            chat_history.append({"role": "user", "content": message})
            chat_history.append({"role": "assistant", "content": response})
            return "", chat_history
        
        msg.submit(respond, [msg, chatbot], [msg, chatbot])
        send.click(respond, [msg, chatbot], [msg, chatbot])
    
    with gr.Tab("📰 ترندها"):
        trends_btn = gr.Button("دریافت ترندهای روز", variant="primary")
        trends_output = gr.Markdown()
        trends_btn.click(get_trends, outputs=trends_output)
    
    with gr.Tab("ℹ️ درباره"):
        gr.Markdown(
            """
            ## 🤖 DigiPoosh AI
            
            - 🧠 **هوش**: Gemma 4 + Groq Qwen + OpenRouter
            - 💰 **هزینه**: ۰ (رایگان)
            - 🌍 **زبان**: فارسی
            - ⚡ **سرعت**: بسیار بالا
            - 🔒 **امنیت**: بالا
            """
        )

# ═══ API Endpoints (برای Frontend) ═══
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class ChatRequest(BaseModel):
    message: str
    history: list = []


class TrendsResponse(BaseModel):
    success: bool
    count: int = 0
    trends: list = []


@app.post("/api/chat")
def chat_endpoint(req: ChatRequest):
    """API endpoint برای frontend"""
    try:
        response = smart_chat(req.message, req.history)
        return {"success": True, "response": response, "provider": "auto"}
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.get("/api/trends")
def trends_endpoint():
    """API endpoint برای trends"""
    sources = [
        ("https://www.vogue.com/feed/rss", "Vogue"),
        ("https://www.gq.com/feed/rss", "GQ"),
        ("https://www.elle.com/feed/rss", "ELLE"),
    ]
    all_trends = []
    for url, name in sources:
        try:
            api_url = f"https://api.rss2json.com/v1/api.json?rss_url={requests.utils.quote(url)}&count=3"
            res = requests.get(api_url, timeout=10)
            data = res.json()
            if data.get("status") == "ok":
                for item in data.get("items", [])[:3]:
                    all_trends.append({
                        "title": item["title"],
                        "link": item.get("link", ""),
                        "source": name,
                    })
        except Exception:
            continue
    return {"success": True, "count": len(all_trends), "trends": all_trends}


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "DigiPoosh AI"}


# ═══ ترکیب Gradio + FastAPI ═══
import gradio as gr

# Gradio interface
gr_interface = demo

# FastAPI mount
app = gr.mount_gradio_app(app, demo, path="/")


if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
