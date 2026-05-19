import os
import json

lines = [
    "-----BEGIN PRIVATE KEY-----",
    "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC34PJfS5LH4tT6",
    "B7Ib13uiW3B37iv9p58S2iKWv7axGhAyd/ZRqab569QMNR2LRFDz44M92ZLstVJT",
    "cW+XgZbiBNaV2DYLNHR5skU4xxvHfYFQiDnCUKsjktl2RZbkgJktixHfTAqxwzSk",
    "p42ui8KFxAdkYG+F/xuz3s0vJEhPFzg+dlDpYgrp/yxz2uYEZynfZvo9hznnld9L",
    "MZLxwdlxgSaDYdYUcJ1d2kqpDPBwYQbpSSsamUFbg/cKJnD0RzJC6x45I+keUjO3",
    "xx0W6e3yYaNnzhEfY/750OtsL4iL7z3inEhbWUtCNuhmCsnzH48HMP29FSf4sgew",
    "lVRntpClAgMBAAECggEACGNA+xrZ67dLqsoeFEoMkDfmlfnt1MjIJ1Z+/GxrW4HK",
    "WlsBh/EatkzNI+9qVRd9L9rhejlKC/Urd7X1dq5JIS9CUJyHvpQaehCpOrFOcZem",
    "hfNo2xXN8LX6qHv9KZg6JIsy+gIgfMJgTOB9xIgIjAyIn8oMXErqSxavOmbHy5+6",
    "IOVt5YERoAIjYEIL2GJ1lg4FYOuPHynKAnHip6o7uaCB1SomWdDueQN+traCbTor",
    "2wffySHvd85Y7nNEYP6YStL3zPRXmkmGc9tSZQkfNa66pCnyVqmnpL3vEmqyw5Fw",
    "D0JzXqAMzbxZDHtbUmPKqgXxZB4iEAZmdmMvweDrMQKBgQDwu26xWoTaD+Y0jAjO",
    "6ojzCdPTNq93Gq3/5dK1WxichRvE1n6HyETf/yuefQ6SZooZOJUYxsQn/uEdLUng",
    "nnjq1sHe5jmYLjK3mxE3oYI93AVr+vWO4WUFagazvE9DGbJSiM9rYcyaEK4ZuEVu4",
    "6vEJbA89umd0apE295Wf3sUk2QKBgQDDim6dYU9qDFdylXLFlZTqMQWQXERiBBqY",
    "bdB9+ZOq+U6FXp7tMUz7whrkq/70br/tzSgevmJBrKIaUaXm2I5IIPb1LetU7ihI",
    "jRNd3wcUb/twvQh3znwwOzS+MDpZSOlY9SUlUGuv24v5S98qkoMfazYCdN49aS5C",
    "wuBvzw+6rQKBgQDlOkUUQlKA5mTZooJ8rV3Mt43p8IeyjUgkhO5YXK8Z07H2hBym",
    "JPBYrz0UxJZMl7FmhLeMiTCduRkY1Fglt+XFvoyyt0K6OrIZLNHWtaPGuRaxvRuo",
    "ne0aRqKqYR8K4rfBoEkClNuXPW7bflHtymHNDAWTTN1YQGWYhrcGLXViOQKBgQCD",
    "BNZpDTKw0+QkGo70ZO2KnZ4kxC3tnuJTEAGK5xdSkAlUw7mpJEd4yO5MGhKSpUJk",
    "i/o930Lmzk0vZVXL/34WRkAyt7nfBlRniF9Znn6X6xCG0aJC5E/B4WnNpXLzMC9q",
    "M5fYELKW+nwnZfb6B4FkI+nka3odm8QrZ3gKcqsPYQKBgE9m2AcLN2atPrhy3CBr",
    "BHoT61oPEGPp6ImF1FJsIXlz3sqwhnd3K8MUnJe8Ajhuwi8fq1U3WjjNFfDFS4jn",
    "my5d/DtQRclNIwzG92VWyBNsevs4Yo2WJAL1lCeJUhXlftfAiFlo80yquOIVKvIy",
    "qz1+J6HTXgy8TODVE/eZKzTO",
    "-----END PRIVATE KEY-----"
]

private_key_string = "\n".join(lines) + "\n"

data = {
  "type": "service_account",
  "project_id": "factory-app-496721",
  "private_key_id": "58c9988a45053d120332586ac7d0a4cd52f61011",
  "private_key": private_key_string,
  "client_email": "my-app-service-account@factory-app-496721.iam.gserviceaccount.com",
  "client_id": "111678860874742377136",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/my-app-service-account%40factory-app-496721.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}

# Resolve backend path
current_dir = os.path.dirname(os.path.abspath(__file__))
workspace_dir = os.path.dirname(current_dir)
backend_dir = os.path.join(workspace_dir, "backend")

for filename in ["smartfactory-key.json", "factoryapp-key.json"]:
    filepath = os.path.join(backend_dir, filename)
    with open(filepath, "w") as f:
        json.dump(data, f, indent=2)
    print(f"Successfully wrote {filepath}")
