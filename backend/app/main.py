from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from prometheus_fastapi_instrumentator import Instrumentator
from typing import List

from .database import engine, get_db
from . import models, schemas, crud

# Створюємо таблиці в базі даних
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="TodoApp API")
Instrumentator().instrument(app).expose(app)

# # Налаштування CORS
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000"],  # Frontend URL
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


@app.get("/health")
def health_check():
    """
    Ендпоінт для перевірки здоров'я сервісу
    (для Kubernetes liveness probe)
    """
    return {"status": "healthy"}


@app.get("/todos/", response_model=List[schemas.Todo])
def read_todos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    todos = crud.get_todos(db, skip=skip, limit=limit)
    return todos


@app.post(
    "/todos/",
    response_model=schemas.Todo,
    status_code=status.HTTP_201_CREATED
)
def create_todo(todo: schemas.TodoCreate, db: Session = Depends(get_db)):
    return crud.create_todo(db=db, todo=todo)


@app.get("/todos/{todo_id}", response_model=schemas.Todo)
def read_todo(todo_id: int, db: Session = Depends(get_db)):
    db_todo = crud.get_todo(db, todo_id=todo_id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return db_todo


@app.put("/todos/{todo_id}", response_model=schemas.Todo)
def update_todo(
        todo_id: int,
        todo: schemas.TodoUpdate,
        db: Session = Depends(get_db)
):
    db_todo = crud.get_todo(db, todo_id=todo_id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return crud.update_todo(db=db, todo_id=todo_id, todo=todo)


@app.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    db_todo = crud.get_todo(db, todo_id=todo_id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    crud.delete_todo(db=db, todo_id=todo_id)
    return None
