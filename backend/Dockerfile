# Етап збірки
FROM python:3.10-slim AS builder

WORKDIR /app

# Встановлення інструментів для компіляції
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Копіювання залежностей
COPY requirements.txt .

# Створення віртуального середовища
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Встановлення залежностей
RUN pip install --no-cache-dir -r requirements.txt

# Фінальний образ
FROM python:3.10-slim

# Створення непривілейованого користувача
RUN adduser --disabled-password --gecos "" appuser

WORKDIR /app

# Копіювання віртуального середовища
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Копіювання коду додатку
COPY . .

# Зміна прав доступу
RUN chown -R appuser:appuser /app

# Перехід на непривілейованого користувача
USER appuser

# Відкриття порту
EXPOSE 8000

# Запуск додатку
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]