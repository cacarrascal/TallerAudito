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
echo Instalando pytest...
python -m pip install pytest -q
if errorlevel 1 (
    echo Error en instalacion. Intentando de nuevo...
    python -m pip install pytest
)

echo.
echo ========================================
echo   TESTS DE API
echo ========================================
cd /d "%~dp0tests"
python -m pytest test_api.py -v

echo.
echo ========================================
echo   TESTS DE SEGURIDAD
echo ========================================
python -m pytest test_seguridad.py -v

echo.
echo ========================================
echo   TODOS LOS TESTS FINALIZADOS
echo ========================================
echo.
pause