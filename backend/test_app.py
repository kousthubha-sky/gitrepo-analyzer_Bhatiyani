from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Test API")

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TestRequest(BaseModel):
    repo_url: str

@app.get("/")
def read_root():
    return {"message": "Test API is running!"}

@app.get("/api/test")
def test_endpoint():
    return {"message": "API test endpoint working!"}

@app.post("/api/analyze")
def test_analyze(request: TestRequest):
    return {"message": f"Received: {request.repo_url}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
