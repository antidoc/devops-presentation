#!/bin/bash
set -e

# Змінні середовища
DB_HOST=$1
DB_USER=$2
DB_PASSWORD=$3
DB_NAME=$4
S3_BUCKET=$5

# Перевірка наявності всіх аргументів
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ] || [ -z "$S3_BUCKET" ]; then
  echo "Використання: $0 <db_host> <db_user> <db_password> <db_name> <s3_bucket>"
  exit 1
fi

# Створення директорії для резервних копій
BACKUP_DIR="/tmp/db_backups"
mkdir -p $BACKUP_DIR

# Назва файлу резервної копії з датою та часом
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"

# Створення резервної копії
echo "Створення резервної копії бази даних $DB_NAME..."
PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME | gzip > $BACKUP_FILE

# Завантаження на S3
echo "Завантаження резервної копії на S3..."
aws s3 cp $BACKUP_FILE s3://$S3_BUCKET/db_backups/

# Видалення локальної резервної копії
rm $BACKUP_FILE

echo "Резервне копіювання успішно завершено!"