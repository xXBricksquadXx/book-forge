import requests

def ask_ollama(prompt: str, system_context: str = "You are an expert creative writing assistant.", model: str = "qwen2.5-coder:3b") -> str:
    """Routes a prompt to the local Ollama instance and returns the generated text."""
    url = "http://localhost:11434/api/generate"
    
    payload = {
        "model": model,
        "system": system_context,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.7
        }
    }
    
    try:
        response = requests.post(url, json=payload, timeout=120)
        response.raise_for_status()
        return response.json().get("response", "").strip()
    except requests.exceptions.ConnectionError:
        return "Error: Could not connect to Ollama. Ensure the Ollama app is running locally."
    except Exception as e:
        return f"Error: {str(e)}"