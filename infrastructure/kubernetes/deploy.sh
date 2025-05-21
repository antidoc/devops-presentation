#!/bin/bash
set -e

# Змінні середовища
ENVIRONMENT=$1
BACKEND_IMAGE=$2
FRONTEND_IMAGE=$3
DB_HOST=$4
REDIS_HOST=$5
DB_PASSWORD=$6

# Перевірка наявності всіх аргументів
if [ -z "$ENVIRONMENT" ] || [ -z "$BACKEND_IMAGE" ] || [ -z "$FRONTEND_IMAGE" ] || [ -z "$DB_HOST" ] || [ -z "$REDIS_HOST" ] || [ -z "$DB_PASSWORD" ]; then
  echo "Використання: $0 <environment> <backend_image> <frontend_image> <db_host> <redis_host> <db_password>"
  exit 1
fi

# Кодування паролю в base64
DB_PASSWORD_BASE64=$(echo -n "$DB_PASSWORD" | base64)

# Створення директорії для тимчасових файлів
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Копіювання та заміна змінних в маніфестах
for file in namespace.yaml secrets.yaml backend-deployment.yaml backend-service.yaml frontend-deployment.yaml frontend-service.yaml ingress.yaml hpa.yaml; do
  sed -e "s|\${BACKEND_IMAGE}|$BACKEND_IMAGE|g" \
      -e "s|\${FRONTEND_IMAGE}|$FRONTEND_IMAGE|g" \
      -e "s|\${DB_HOST}|$DB_HOST|g" \
      -e "s|\${REDIS_HOST}|$REDIS_HOST|g" \
      -e "s|\${DB_PASSWORD_BASE64}|$DB_PASSWORD_BASE64|g" \
      $file > $TEMP_DIR/$file
done

# Застосування маніфестів
kubectl apply -f $TEMP_DIR/namespace.yaml
kubectl apply -f $TEMP_DIR/secrets.yaml
kubectl apply -f $TEMP_DIR/backend-service.yaml
kubectl apply -f $TEMP_DIR/frontend-service.yaml
kubectl apply -f $TEMP_DIR/backend-deployment.yaml
kubectl apply -f $TEMP_DIR/frontend-deployment.yaml
kubectl apply -f $TEMP_DIR/ingress.yaml
kubectl apply -f $TEMP_DIR/hpa.yaml

# Перевірка статусу розгортання
echo "Перевірка статусу розгортання..."
kubectl rollout status deployment/backend -n todoapp
kubectl rollout status deployment/frontend -n todoapp

echo "Розгортання успішно завершено!"