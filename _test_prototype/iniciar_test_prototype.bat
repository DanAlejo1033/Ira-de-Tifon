@echo off
title Gigantomaquia - Prototipo de Pruebas (Test Prototype)
echo ========================================================
echo   GIGANTOMAQUIA: PROTOTIPO DE PRUEBAS (TEST PROTOTYPE)
echo   * Todas las habilidades y torres desbloqueadas para pruebas
echo ========================================================
echo.
echo Verificando servidor local en el puerto 8000...
netstat -ano | findstr :8000 >nul
if %errorlevel% neq 0 (
    echo Iniciando servidor HTTP local desde la raiz de Gigantomaquia...
    cd ..
    start /b python -m http.server 8000
    cd _test_prototype
    timeout /t 2 >nul
) else (
    echo Servidor HTTP ya esta en ejecucion en el puerto 8000.
)

echo Abriendo Prototipo de Pruebas en tu navegador...
start http://localhost:8000/_test_prototype/index.html
echo.
echo Prototipo de pruebas iniciado correctamente.
timeout /t 3 >nul
