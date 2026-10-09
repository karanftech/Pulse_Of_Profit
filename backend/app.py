"""
Alias module to support running `uvicorn app:app --reload`
Exports the FastAPI instance from `main.py`.
"""
import os
import uvicorn
from main import app

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host=host, port=port, reload=True)
