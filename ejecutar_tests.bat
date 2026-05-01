@echo off
echo ========================================
echo   EJECUTANDO TESTS
echo ========================================
echo.

echo [1] Iniciando servidor backend...
cd /d "%~dp0backend"
start "Backend - Test" cmd /k "python app.py"

timeout /t 3 /nobreak >nul

echo [2] Instalando dependencias de tests...
pip install -r "%~dp0tests\requirements.txt" >nul 2>&1

echo.
echo ========================================
echo   TESTS DE API
echo ========================================
cd /d "%~dp0tests"
pytest test_api.py -v

echo.
echo ========================================
echo   TESTS DE SEGURIDAD
echo ========================================
pytest test_seguridad.py -v

echo.
echo ========================================
echo   TODOS LOS TESTS FINALIZADOS
echo ========================================
echo.
pause