#!/bin/bash

BASE_URL="http://localhost:5000"
LOG_FILE="test_endpoints.log"

echo "Iniciando pruebas de endpoints..." > $LOG_FILE

echo "\nProbando: Crear un nodo con un label" | tee -a $LOG_FILE
curl -X POST "$BASE_URL/create-node-single-label" \
     -H "Content-Type: application/json" \
     -d '{"label": "Usuario", "properties": {"nombre": "Juan", "edad": 25, "email": "juan@example.com"}}' | tee -a $LOG_FILE

echo -e "\n\nProbando: Obtener todos los usuarios" | tee -a $LOG_FILE
curl -X GET "$BASE_URL/users" | tee -a $LOG_FILE

echo -e "\n\nProbando: Registrar un usuario" | tee -a $LOG_FILE
curl -X POST "$BASE_URL/register" \
     -H "Content-Type: application/json" \
     -d '{"nombre": "Juan", "edad": 25, "email": "juan@example.com", "password": "123456"}' | tee -a $LOG_FILE

echo -e "\n\nProbando: Login de usuario" | tee -a $LOG_FILE
curl -X POST "$BASE_URL/login" \
     -H "Content-Type: application/json" \
     -d '{"email": "juan@example.com", "password": "123456"}' | tee -a $LOG_FILE

echo -e "\n\nProbando: Obtener todas las películas" | tee -a $LOG_FILE
curl -X GET "$BASE_URL/movies" | tee -a $LOG_FILE

echo -e "\n\nProbando: Guardar preferencias de usuario" | tee -a $LOG_FILE
curl -X POST "$BASE_URL/save-preferences" \
     -H "Content-Type: application/json" \
     -d '{"email": "juan@example.com", "genres": ["Acción", "Comedia"]}' | tee -a $LOG_FILE

echo -e "\n\nProbando: Obtener recomendaciones basadas en género" | tee -a $LOG_FILE
curl -X GET "$BASE_URL/recommendations/juan@example.com" | tee -a $LOG_FILE

echo -e "\n\nProbando: Obtener detalles de una película" | tee -a $LOG_FILE
curl -X GET "$BASE_URL/movie/Inception" | tee -a $LOG_FILE

echo -e "\n\nProbando: Marcar una película como vista" | tee -a $LOG_FILE
curl -X POST "$BASE_URL/mark-as-watched" \
     -H "Content-Type: application/json" \
     -d '{"email": "juan@example.com", "movieTitle": "Inception"}' | tee -a $LOG_FILE

echo -e "\n\nProbando: Obtener historial de películas vistas" | tee -a $LOG_FILE
curl -X GET "$BASE_URL/watched-movies/juan@example.com" | tee -a $LOG_FILE

echo -e "\n\nProbando: Calificar una película" | tee -a $LOG_FILE
curl -X PUT "$BASE_URL/movie/Inception" \
     -H "Content-Type: application/json" \
     -d '{"email": "juan@example.com", "calificacion": 9}' | tee -a $LOG_FILE

echo -e "\n\nProbando: Obtener películas recomendadas para volver a ver" | tee -a $LOG_FILE
curl -X GET "$BASE_URL/re-watch-movies/juan@example.com" | tee -a $LOG_FILE

echo -e "\n\nProbando: Obtener películas similares a una ya vista" | tee -a $LOG_FILE
curl -X GET "$BASE_URL/similar-movies/Inception" | tee -a $LOG_FILE

echo -e "\n\nProbando: Obtener recomendaciones por calificación" | tee -a $LOG_FILE
curl -X GET "$BASE_URL/recommended-by-rating/juan@example.com" | tee -a $LOG_FILE

echo -e "\n\nProbando: Obtener usuarios activos" | tee -a $LOG_FILE
curl -X GET "$BASE_URL/active-users" | tee -a $LOG_FILE

echo -e "\n\nProbando: Actualizar última conexión del usuario" | tee -a $LOG_FILE
curl -X POST "$BASE_URL/update-last-seen" \
     -H "Content-Type: application/json" \
     -d '{"email": "juan@example.com"}' | tee -a $LOG_FILE

echo -e "\n\nPruebas finalizadas. Revisa el archivo de log: $LOG_FILE"
