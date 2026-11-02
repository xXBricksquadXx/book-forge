import re
def clean_for_elevenlabs(raw_text: str) -> str:
    """Strips formatting artifacts to optimize text for neural TTS engines."""
    text = re.sub(r'^\s*\d+\s*$', '', raw_text, flags=re.MULTILINE)
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)
    return text.strip()