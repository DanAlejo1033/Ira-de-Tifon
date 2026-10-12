@echo off
title Gigantomaquia - Defensa del Monte Olimpo
echo ========================================================
echo       GIGANTOMAQUIA: DEFENSA DEL MONTE OLIMPO
echo ========================================================
echo.
echo Verificando servidor local en el puerto 8000...
netstat -ano | findstr :8000 >nul
if %errorlevel% neq 0 (
    echo Iniciando servidor HTTP local...
    start /b python -m http.server 8000
    timeout /t 2 >nul
) else (
    echo Servidor HTTP ya esta en ejecucion en el puerto 8000.
)

echo Abriendo Gigantomaquia en tu navegador...
start http://localhost:8000
echo.
echo Juego iniciado correctamente. ¡Buena suerte, estratega!
timeout /t 3 >nul
