#!/usr/bin/env python3
import requests
import json
import sys
import time
from datetime import datetime, timedelta

# Конфігурація
PROMETHEUS_URL = sys.argv[1]
SLACK_WEBHOOK_URL = sys.argv[2]


# Отримання даних з Prometheus
def get_prometheus_data(query, start_time, end_time, step='15s'):
    response = requests.get(
        f"{PROMETHEUS_URL}/api/v1/query_range",
        params={
            'query': query,
            'start': start_time,
            'end': end_time,
            'step': step
        }
    )
    return response.json()


# Відправлення повідомлення в Slack
def send_to_slack(message):
    payload = {'text': message}
    requests.post(SLACK_WEBHOOK_URL, json=payload)


# Основна функція
def analyze_chaos_test_results():
    # Час початку і кінця тесту
    end_time = datetime.now()
    start_time = end_time - timedelta(hours=1)

    # Формат часу для Prometheus
    start_time_str = start_time.isoformat("T") + "Z"
    end_time_str = end_time.isoformat("T") + "Z"

    # Запити до Prometheus
    error_rate_query = 'sum(rate(http_requests_total{status_code=~"5.."}[1m])) / sum(rate(http_requests_total[1m]))'
    response_time_query = 'histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[1m])) by (le))'

    # Отримання даних
    error_rate_data = get_prometheus_data(error_rate_query, start_time_str, end_time_str)
    response_time_data = get_prometheus_data(response_time_query, start_time_str, end_time_str)

    # Аналіз результатів
    try:
        error_rate_values = [float(point[1]) for point in error_rate_data['data']['result'][0]['values']]
        response_time_values = [float(point[1]) for point in response_time_data['data']['result'][0]['values']]

        max_error_rate = max(error_rate_values)
        max_response_time = max(response_time_values)

        # Формування повідомлення
        message = f"*Chaos Engineering Test Results*\n\n"
        message += f"*Maximum Error Rate*: {max_error_rate:.2%}\n"
        message += f"*Maximum Response Time (p95)*: {max_response_time:.2f} seconds\n\n"

        # Оцінка стійкості системи
        if max_error_rate > 0.1:
            message += "⚠️ Error rate exceeded 10% during the test - system resilience needs improvement.\n"
        else:
            message += "✅ Error rate remained below 10% - good system resilience.\n"

        if max_response_time > 2:
            message += "⚠️ Response time exceeded 2 seconds during the test - performance degradation observed.\n"
        else:
            message += "✅ Response time remained acceptable - good performance under stress.\n"

        # Відправлення результатів
        send_to_slack(message)
    except (KeyError, IndexError):
        send_to_slack("⚠️ Failed to analyze Chaos Engineering test results due to missing data.")


if __name__ == "__main__":
    analyze_chaos_test_results()