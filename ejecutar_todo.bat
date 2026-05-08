@echo off
echo ========================================
echo   INICIANDO TIENDA DE ZAPATOS
echo ========================================
echo.

echo [1] Instalando dependencias del backend...
cd /d "%~dp0backend"
python -m pip install -r requirements.txt >nul 2>&1

echo [2] Iniciando servidor backend (Flask)...
start "" /b python app.py

timeout /t 4 /nobreak >nul

echo [3] Instalando dependencias del frontend...
cd /d "%~dp0frontend"
call npm install

echo [4] Iniciando frontend (React)...
start "" /b npm start

echo [5] Esperando a que React inicie...
timeout /t 10 /nobreak >nul

echo [6] Abriendo navegador...
start http://localhost:3000

echo.
echo ========================================
echo   ¡TIENDA INICIADA!
echo   Backend: http://localhost:5000
echo   Frontend: http://localhost:3000
echo ========================================
echo.
pause