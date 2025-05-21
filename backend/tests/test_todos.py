import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models import Todo

# Створюємо тестову базу даних в пам'яті
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Налаштовуємо базу даних для тестів
Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


def test_create_todo():
    response = client.post(
        "/todos/",
        json={"title": "Test Todo", "description": "Test Description", "completed": False},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Todo"
    assert data["description"] == "Test Description"
    assert data["completed"] == False
    assert "id" in data


def test_read_todos():
    response = client.get("/todos/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # Перевіряємо, що є хоча б один todo з попереднього тесту
    assert len(data) > 0


def test_read_todo():
    # Спочатку створюємо todo
    create_response = client.post(
        "/todos/",
        json={"title": "Get by ID", "description": "Test get by ID", "completed": False},
    )
    todo_id = create_response.json()["id"]

    # Отримуємо todo за ID
    response = client.get(f"/todos/{todo_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Get by ID"
    assert data["description"] == "Test get by ID"


def test_update_todo():
    # Спочатку створюємо todo
    create_response = client.post(
        "/todos/",
        json={"title": "Update Me", "description": "Test update", "completed": False},
    )
    todo_id = create_response.json()["id"]

    # Оновлюємо todo
    response = client.put(
        f"/todos/{todo_id}",
        json={"title": "Updated", "completed": True},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated"
    assert data["completed"] == True
    # Опис не змінився
    assert data["description"] == "Test update"


def test_delete_todo():
    create_response = client.post(
        "/todos/",
        json={
            "title": "Delete Me",
            "description": "Test delete",
            "completed": False},
    )
    todo_id = create_response.json()["id"]

    # Видаляємо todo
    response = client.delete(f"/todos/{todo_id}")
    assert response.status_code == 204

    # Перевіряємо, що todo видалено
    get_response = client.get(f"/todos/{todo_id}")
    assert get_response.status_code == 404
