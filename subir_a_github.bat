@echo off
title Subir Ira de Tifon a GitHub
echo ========================================================
echo       SUBIENDO IRA DE TIFON A GITHUB
echo ========================================================
echo.
echo Conectando con https://github.com/DanAlejo1033/Ira-de-Tifon.git...
echo Si se abre una ventana del navegador, haz clic en "Authorize" o inicia sesion.
echo.
git push -u origin main
echo.
if %errorlevel% equ 0 (
    echo ========================================================
    echo  LISTO! Tu proyecto ha sido subido con exito a GitHub.
    echo ========================================================
) else (
    echo Hubo un problema al subir. Revisa la ventana de autenticacion.
)
echo.
pause
