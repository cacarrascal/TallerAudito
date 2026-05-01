# 🏪 Tienda de Zapatos - Laboratorio Práctico

## Descripción del Proyecto

Aplicación full-stack de una tienda online de zapatos con:
- **Frontend:** React con componentes funcionales y hooks (useState, useEffect), diseño responsive
- **Backend:** Python Flask con API REST
- **Testing:** pytest para pruebas de API, bitácora y seguridad

---

## 📁 Estructura del Proyecto

```
TallerAudito/
├── backend/               # API en Flask
│   ├── app.py              # Servidor con endpoints, bitácora y validación de passwords
│   └── requirements.txt
├── frontend/              # App en React
│   ├── public/
│   ├── src/
│   │   ├── index.js
│   │   └── App.js          # Interfaz responsive con sistema de usuarios
│   └── package.json
├── tests/                 # Tests en Python
│   ├── test_api.py         # Tests de API y bitácora (24 tests)
│   ├── test_seguridad.py   # Tests de seguridad (27 tests)
│   └── requirements.txt
├── ejecutar_todo.bat      # Ejecutar todo (front + back)
├── ejecutar_tests.bat     # Ejecutar todos los tests
├── ejecutar_seguridad.bat # Ejecutar tests de seguridad
└── README.md
```

---

## 🚀 Ejecución Paso a Paso

### Opción 1: Usar los archivos .bat (Recomendado)

#### Ejecutar la tienda completa
1. Doble clic en **`ejecutar_todo.bat`**
2. Esperar a que se instalen las dependencias
3. Se abrirá automáticamente el navegador en: **http://localhost:3000**

#### Ejecutar los tests
1. Doble clic en **`ejecutar_tests.bat`** (incluye API + Seguridad)
2. O doble clic en **`ejecutar_seguridad.bat`** (solo seguridad)

---

### Opción 2: Ejecutar manualmente

#### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

#### Tests
```bash
cd tests
pip install pytest
pytest test_api.py -v           # Tests de API
pytest test_seguridad.py -v     # Tests de seguridad
```

---

## 📡 Endpoints de la API

### Productos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/productos` | Lista todos los zapatos |

### Carrito
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/carrito` | Muestra el carrito y total |
| POST | `/carrito` | Agrega producto al carrito |
| DELETE | `/carrito` | Vacía el carrito |
| DELETE | `/carrito/<id>` | Elimina un item |

### Usuarios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/usuarios/registro` | Registra usuario (con validación de password) |
| POST | `/usuarios/login` | Inicia sesión (admin/cliente) |
| POST | `/usuarios/logout` | Cierra sesión |

### Bitácora
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/bitacora` | Ver historial de acciones |
| DELETE | `/bitacora` | Limpiar bitácora |

---

## 👥 Usuarios y Roles

### Credenciales de Admin
- **Usuario:** `admin`
- **Contraseña:** `admin123`

### Registro de Clientes
Los clientes pueden registrarse desde la app. Las contraseñas deben:
- Tener al menos 8 caracteres
- No ser solo números o solo letras
- No ser comunes (password, admin, 12345678, etc.)

---

## 📋 Bitácora (Log)

Registra todas las acciones:
- **REGISTRO** - Nuevo usuario registrado
- **LOGIN** - Inicio de sesión exitoso
- **LOGIN_FALLIDO** - Credenciales incorrectas
- **LOGOUT** - Cierre de sesión

---

## ✅ Tests Incluidos

### Tests de API (24 tests)
- Productos: GET responde 200, formato JSON, campos correctos
- Carrito: Agregar, eliminar, total, múltiples productos
- Usuarios: Registro, login, logout
- Bitácora: Registros, timestamps, limpiar

### Tests de Seguridad (27 tests)
- **SQL Injection:** Login, registro, carrito
- **XSS:** Registro, productos
- **Validación de Input:** Longitud, caracteres especiales, campos vacíos
- **CSRF:** Métodos no permitidos
- **Headers:** Content-Type JSON, paths internos
- **Autenticación:** Bloqueo, no revelar usuarios
- **Rate Limiting:** Logins fallidos, registros duplicados
- **Parámetros:** ID negativo/cero, cantidades
- **Path Traversal:** Intentos de traversal
- **Passwords:** Passwords debiles, secuenciales, admin débil

---

## 💡 Cómo usar la aplicación

1. **Ver catálogo:** Productos en la página principal
2. **Registrarse/Iniciar sesión:** Click en "Iniciar Sesión"
3. **Agregar al carrito:** Click en "Agregar al Carrito"
4. **Ver carrito:** Click en el botón del carrito
5. **Eliminar productos:** Click en 🗑️
6. **Pagar:** Click en "Pagar Ahora"
7. **Panel Admin:** Acceso con usuario `admin` / `admin123`

---

## 📱 Diseño Responsive

- **Desktop:** Múltiples columnas
- **Tablet:** 2 columnas
- **Móvil:** Una columna, interfaz adaptada

---

## 🛠️ Comandos Rápidos

| Acción | Comando |
|--------|---------|
| Iniciar tienda | `ejecutar_todo.bat` |
| Todos los tests | `ejecutar_tests.bat` |
| Solo seguridad | `ejecutar_seguridad.bat` |
| Backend | `cd backend && python app.py` |
| Frontend | `cd frontend && npm start` |
| Tests API | `cd tests && pytest test_api.py -v` |
| Tests seguridad | `cd tests && pytest test_seguridad.py -v` |

---

## 🛠️ Requisitos

- Python 3.x
- Node.js y npm
- Navegador web moderno

---

## 📝 Notas

- El backend debe estar ejecutándose para que el frontend funcione
- El frontend se conecta a: http://localhost:5000
- El carrito se guarda en memoria (se reinicia al cerrar el backend)
- Los usuarios y pedidos se guardan en localStorage del navegador
- La bitácora se guarda en el backend (se reinicia al cerrar)
- El sistema valida contraseñas debiles en el registro