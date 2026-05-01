from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

productos = [
    {"id": 1, "nombre": "Nike Air Max 90", "precio": 149.99, "imagen": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop", "categoria": "Deportivo", "descripcion": "Zapato deportivo clásico con amortiguación Air"},
    {"id": 2, "nombre": "Oxford Leather", "precio": 189.99, "imagen": "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400&h=300&fit=crop", "categoria": "Formal", "descripcion": "Zapato formal de cuero genuino italiano"},
    {"id": 3, "nombre": "Adidas Ultraboost", "precio": 179.99, "imagen": "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=300&fit=crop", "categoria": "Running", "descripcion": "Zapatilla de running con tecnología Boost"},
    {"id": 4, "nombre": "Timberland Premium", "precio": 219.99, "imagen": "https://images.unsplash.com/photo-1605034313761-73ea4a0cfbf3?w=400&h=300&fit=crop", "categoria": "Botines", "descripcion": "Botín impermeable de cuero premium"},
    {"id": 5, "nombre": "Skechers Sport", "precio": 79.99, "imagen": "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=300&fit=crop", "categoria": "Casual", "descripcion": "Zapatilla casual confort extra"},
    {"id": 6, "nombre": "Puma RS-X", "precio": 119.99, "imagen": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop", "categoria": "Urbano", "descripcion": "Zapatilla urbana con diseño retro"},
    {"id": 7, "nombre": "Converse Chuck 70", "precio": 89.99, "imagen": "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=400&h=300&fit=crop", "categoria": "Clásico", "descripcion": "Zapato icónico de lona estilo vintage"},
    {"id": 8, "nombre": "Vans Old Skool", "precio": 69.99, "imagen": "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=300&fit=crop", "categoria": "Skate", "descripcion": "Zapatilla经典的街头滑板款式"},
]

carrito = []
usuarios = []
bitacora = []

ADMIN_CREDENTIALS = {"usuario": "admin", "password": "admin123", "nombre": "Administrador", "rol": "admin"}

def agregar_bitacora(accion, usuario, detalles=""):
    bitacora.append({
        "id": len(bitacora) + 1,
        "timestamp": datetime.now().isoformat(),
        "accion": accion,
        "usuario": usuario,
        "detalles": detalles
    })

def validar_password(password):
    """Valida la fortaleza de una contrasena"""
    errores = []
    
    if len(password) < 8:
        errores.append("La contrasena debe tener al menos 8 caracteres")
    
    if password.lower() in ['password', 'admin', '12345678', 'qwerty', 'abc123']:
        errores.append("La contrasena es muy comun")
    
    if password.isdigit():
        errores.append("La contrasena no puede ser solo numeros")
    
    if password.isalpha():
        errores.append("La contrasena no puede ser solo letras")
    
    if password.lower() == 'admin123' or password == '123456':
        errores.append("Esta contrasena es insegura")
    
    return errores

@app.route('/productos', methods=['GET'])
def get_productos():
    return jsonify(productos), 200

@app.route('/carrito', methods=['GET'])
def get_carrito():
    total = sum(item['precio'] * item['cantidad'] for item in carrito)
    return jsonify({"items": carrito, "total": total}), 200

@app.route('/carrito', methods=['POST'])
def agregar_carrito():
    data = request.get_json()
    if not data or 'producto_id' not in data:
        return jsonify({"error": "Falta producto_id"}), 400
    
    producto = next((p for p in productos if p['id'] == data['producto_id']), None)
    if not producto:
        return jsonify({"error": "Producto no encontrado"}), 404
    
    cantidad = data.get('cantidad', 1)
    
    item_existente = next((item for item in carrito if item['id'] == producto['id']), None)
    if item_existente:
        item_existente['cantidad'] += cantidad
    else:
        carrito.append({
            "id": producto['id'],
            "nombre": producto['nombre'],
            "precio": producto['precio'],
            "imagen": producto['imagen'],
            "cantidad": cantidad
        })
    
    return jsonify({"mensaje": "Producto agregado", "carrito": carrito}), 201

@app.route('/carrito/<int:item_id>', methods=['DELETE'])
def eliminar_item(item_id):
    global carrito
    global productos
    item = next((item for item in carrito if item['id'] == item_id), None)
    if not item:
        return jsonify({"error": "Item no encontrado"}), 404
    
    item['cantidad'] -= 1
    
    if item['cantidad'] <= 0:
        carrito = [i for i in carrito if i['id'] != item_id]
    
    return jsonify({"mensaje": "Item eliminado"}), 200

@app.route('/carrito', methods=['DELETE'])
def limpiar_carrito():
    global carrito
    carrito = []
    return jsonify({"mensaje": "Carrito vaciado"}), 200

@app.route('/usuarios/registro', methods=['POST'])
def registro():
    data = request.get_json()
    if not data or not data.get('usuario') or not data.get('password'):
        return jsonify({"error": "Faltan datos requeridos"}), 400
    
    if any(u.get('usuario') == data['usuario'] for u in usuarios):
        return jsonify({"error": "El usuario ya existe"}), 400
    
    errores_password = validar_password(data['password'])
    if errores_password:
        return jsonify({"error": "Contrasena debil", "detalles": errores_password}), 400
    
    nuevo_usuario = {
        "id": len(usuarios) + 1,
        "usuario": data['usuario'],
        "password": data['password'],
        "nombre": data.get('nombre', data['usuario']),
        "rol": "cliente"
    }
    usuarios.append(nuevo_usuario)
    
    agregar_bitacora("REGISTRO", nuevo_usuario['usuario'], "Nuevo usuario registrado")
    
    return jsonify({"mensaje": "Usuario registrado exitosamente", "usuario": nuevo_usuario}), 201

@app.route('/usuarios/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('usuario') or not data.get('password'):
        return jsonify({"error": "Faltan credenciales"}), 400
    
    if data['usuario'] == ADMIN_CREDENTIALS['usuario'] and data['password'] == ADMIN_CREDENTIALS['password']:
        agregar_bitacora("LOGIN", "admin", "Administrador inició sesión")
        return jsonify({
            "mensaje": "Login exitoso",
            "usuario": {
                "usuario": "admin",
                "nombre": "Administrador",
                "rol": "admin"
            }
        }), 200
    
    usuario_encontrado = next((u for u in usuarios if u['usuario'] == data['usuario'] and u['password'] == data['password']), None)
    
    if usuario_encontrado:
        agregar_bitacora("LOGIN", usuario_encontrado['usuario'], "Usuario cliente inició sesión")
        return jsonify({
            "mensaje": "Login exitoso",
            "usuario": usuario_encontrado
        }), 200
    
    agregar_bitacora("LOGIN_FALLIDO", data['usuario'], "Intento de inicio de sesión fallido")
    return jsonify({"error": "Credenciales incorrectas"}), 401

@app.route('/usuarios/logout', methods=['POST'])
def logout():
    data = request.get_json()
    if data and data.get('usuario'):
        agregar_bitacora("LOGOUT", data['usuario'], "Usuario cerró sesión")
    return jsonify({"mensaje": "Logout exitoso"}), 200

@app.route('/bitacora', methods=['GET'])
def get_bitacora():
    return jsonify(bitacora), 200

@app.route('/bitacora', methods=['DELETE'])
def limpiar_bitacora():
    global bitacora
    bitacora = []
    return jsonify({"mensaje": "Bitácora vaciada"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)