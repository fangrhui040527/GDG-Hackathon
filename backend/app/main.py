import logging
import os
import sys

from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI

if __name__ == "__main__" and __package__ is None:
	# Allow running as a script: python app/main.py
	sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.routes import router

app = FastAPI(title="YokoYoko AI Backend", debug=True)

app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

app.include_router(router)


@app.on_event("startup")
def log_startup() -> None:
	logging.basicConfig(level=logging.INFO)
	logging.info("Server started: FastAPI is ready.")


@app.exception_handler(Exception)
def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
	logging.exception("Unhandled error")
	return JSONResponse(
		status_code=500,
		content={"error": "Internal Server Error", "detail": str(exc)},
	)
