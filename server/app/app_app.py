from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_sqlalchemy import DBSessionMiddleware  # middleware helper


from app.database import init_db, shutdown_db
from app.utils import vars
import logging

SECRET = vars.FLASK_KEY

app = FastAPI()
# app.secret_key = SECRET
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(DBSessionMiddleware, db_url=vars.DB_URL)

# logging.getLogger('werkzeug').setLevel(logging.WARNING)
logger = logging.getLogger(__name__)

class FilterJobsStatus(logging.Filter):
    def filter(self, record):
        return False #  "GET /jobs-status" not in record.getMessage()
logging.getLogger('uvicorn').addFilter(FilterJobsStatus())


@app.on_event("startup")
def startup():
    init_db()


@app.on_event("shutdown")
def shutdown_session():
    shutdown_db()

