@echo off
setlocal

echo ========================================
echo   TESTS DE SEGURIDAD (VULNERABILITY SCANNER)
echo ========================================
echo.

echo [1] Installing dependencies...
cd /d "%~dp0backend"
python -m pip install -r requirements.txt

echo.
echo [2] Starting backend server...
start "Backend" cmd /k "cd /d "%~dp0backend" && python app.py"

echo [3] Waiting for server...
timeout /t 5 /nobreak

echo.
echo [4] Installing pytest...
python -m pip install pytest

echo.
echo ========================================
echo   ESCANEANDO VULNERABILIDADES...
echo ========================================
echo.

cd /d "%~dp0tests"
python -m pytest test_seguridad.py -v --tb=short

echo.
echo ========================================
echo   ESCANEO FINALIZADO
echo ========================================
echo.
pause