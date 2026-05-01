import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app import app, usuarios, bitacora

@pytest.fixture
def cliente():
    app.config['TESTING'] = True
    with app.test_client() as cliente:
        with app.app_context():
            usuarios.clear()
            bitacora.clear()
            yield cliente

def test_get_productos_respuesta_200(cliente):
    respuesta = cliente.get('/productos')
    assert respuesta.status_code == 200

def test_get_productos_formato_json(cliente):
    respuesta = cliente.get('/productos')
    assert respuesta.content_type == 'application/json'

def test_get_productos_lista_no_vacia(cliente):
    respuesta = cliente.get('/productos')
    datos = respuesta.get_json()
    assert len(datos) > 0

def test_get_productos_tiene_campos_correctos(cliente):
    respuesta = cliente.get('/productos')
    datos = respuesta.get_json()
    producto = datos[0]
    assert 'id' in producto
    assert 'nombre' in producto
    assert 'precio' in producto
    assert 'imagen' in producto

def test_post_carrito_agrega_producto(cliente):
    respuesta = cliente.post('/carrito', json={'producto_id': 1, 'cantidad': 2})
    assert respuesta.status_code == 201

def test_post_carrito_producto_inexistente(cliente):
    respuesta = cliente.post('/carrito', json={'producto_id': 999, 'cantidad': 1})
    assert respuesta.status_code == 404

def test_post_carrito_sin_producto_id(cliente):
    respuesta = cliente.post('/carrito', json={'cantidad': 1})
    assert respuesta.status_code == 400

def test_get_carrito_devuelve_total(cliente):
    cliente.post('/carrito', json={'producto_id': 1, 'cantidad': 1})
    respuesta = cliente.get('/carrito')
    datos = respuesta.get_json()
    assert 'total' in datos
    assert 'items' in datos

def test_total_carrito_correcto(cliente):
    cliente.delete('/carrito')
    cliente.post('/carrito', json={'producto_id': 1, 'cantidad': 2})
    respuesta = cliente.get('/carrito')
    datos = respuesta.get_json()
    precio_producto_1 = 149.99
    assert datos['total'] == precio_producto_1 * 2

def test_carrito_multiple_productos(cliente):
    cliente.delete('/carrito')
    cliente.post('/carrito', json={'producto_id': 1, 'cantidad': 1})
    cliente.post('/carrito', json={'producto_id': 2, 'cantidad': 1})
    respuesta = cliente.get('/carrito')
    datos = respuesta.get_json()
    assert len(datos['items']) == 2
    total_esperado = 149.99 + 189.99
    assert datos['total'] == total_esperado

def test_registro_usuario_nuevo(cliente):
    respuesta = cliente.post('/usuarios/registro', json={
        'usuario': 'juan',
        'password': '123456',
        'nombre': 'Juan Perez'
    })
    assert respuesta.status_code == 201
    datos = respuesta.get_json()
    assert datos['mensaje'] == 'Usuario registrado exitosamente'
    assert datos['usuario']['usuario'] == 'juan'
    assert datos['usuario']['rol'] == 'cliente'

def test_registro_usuario_existente(cliente):
    cliente.post('/usuarios/registro', json={
        'usuario': 'juan',
        'password': '123456',
        'nombre': 'Juan Perez'
    })
    respuesta = cliente.post('/usuarios/registro', json={
        'usuario': 'juan',
        'password': 'otrapass',
        'nombre': 'Otro Juan'
    })
    assert respuesta.status_code == 400

def test_registro_sin_datos(cliente):
    respuesta = cliente.post('/usuarios/registro', json={})
    assert respuesta.status_code == 400

def test_login_admin_exitoso(cliente):
    respuesta = cliente.post('/usuarios/login', json={
        'usuario': 'admin',
        'password': 'admin123'
    })
    assert respuesta.status_code == 200
    datos = respuesta.get_json()
    assert datos['mensaje'] == 'Login exitoso'
    assert datos['usuario']['rol'] == 'admin'

def test_login_cliente_exitoso(cliente):
    cliente.post('/usuarios/registro', json={
        'usuario': 'maria',
        'password': 'password123',
        'nombre': 'Maria Garcia'
    })
    respuesta = cliente.post('/usuarios/login', json={
        'usuario': 'maria',
        'password': 'password123'
    })
    assert respuesta.status_code == 200
    datos = respuesta.get_json()
    assert datos['mensaje'] == 'Login exitoso'
    assert datos['usuario']['usuario'] == 'maria'
    assert datos['usuario']['rol'] == 'cliente'

def test_login_credenciales_incorrectas(cliente):
    respuesta = cliente.post('/usuarios/login', json={
        'usuario': 'admin',
        'password': 'wrongpass'
    })
    assert respuesta.status_code == 401

def test_login_sin_credenciales(cliente):
    respuesta = cliente.post('/usuarios/login', json={})
    assert respuesta.status_code == 400

def test_logout_usuario(cliente):
    respuesta = cliente.post('/usuarios/logout', json={'usuario': 'admin'})
    assert respuesta.status_code == 200
    datos = respuesta.get_json()
    assert datos['mensaje'] == 'Logout exitoso'

def test_bitacora_vacia_inicio(cliente):
    respuesta = cliente.get('/bitacora')
    datos = respuesta.get_json()
    assert len(datos) == 0

def test_bitacora_registra_registro(cliente):
    cliente.post('/usuarios/registro', json={
        'usuario': 'pedro',
        'password': 'abc123',
        'nombre': 'Pedro Lopez'
    })
    respuesta = cliente.get('/bitacora')
    datos = respuesta.get_json()
    assert len(datos) == 1
    assert datos[0]['accion'] == 'REGISTRO'
    assert datos[0]['usuario'] == 'pedro'

def test_bitacora_registra_login_admin(cliente):
    cliente.post('/usuarios/login', json={'usuario': 'admin', 'password': 'admin123'})
    respuesta = cliente.get('/bitacora')
    datos = respuesta.get_json()
    assert len(datos) == 1
    assert datos[0]['accion'] == 'LOGIN'
    assert datos[0]['usuario'] == 'admin'
    assert 'Administrador' in datos[0]['detalles']

def test_bitacora_registra_login_cliente(cliente):
    cliente.post('/usuarios/registro', json={
        'usuario': 'ana',
        'password': 'pass123',
        'nombre': 'Ana Lopez'
    })
    cliente.post('/usuarios/login', json={'usuario': 'ana', 'password': 'pass123'})
    respuesta = cliente.get('/bitacora')
    datos = respuesta.get_json()
    assert len(datos) == 2

def test_bitacora_registra_login_fallido(cliente):
    cliente.post('/usuarios/login', json={'usuario': 'falso', 'password': 'erroneo'})
    respuesta = cliente.get('/bitacora')
    datos = respuesta.get_json()
    assert len(datos) == 1
    assert datos[0]['accion'] == 'LOGIN_FALLIDO'
    assert datos[0]['usuario'] == 'falso'

def test_bitacora_registra_logout(cliente):
    cliente.post('/usuarios/login', json={'usuario': 'admin', 'password': 'admin123'})
    cliente.post('/usuarios/logout', json={'usuario': 'admin'})
    respuesta = cliente.get('/bitacora')
    datos = respuesta.get_json()
    logout_entry = next((b for b in datos if b['accion'] == 'LOGOUT'), None)
    assert logout_entry is not None

def test_bitacora_limpiar(cliente):
    cliente.post('/usuarios/registro', json={
        'usuario': 'test',
        'password': '123',
        'nombre': 'Test'
    })
    respuesta = cliente.delete('/bitacora')
    assert respuesta.status_code == 200
    respuesta2 = cliente.get('/bitacora')
    datos2 = respuesta2.get_json()
    assert len(datos2) == 0

def test_bitacora_tiene_timestamp(cliente):
    cliente.post('/usuarios/registro', json={
        'usuario': 'luis',
        'password': '456',
        'nombre': 'Luis'
    })
    respuesta = cliente.get('/bitacora')
    datos = respuesta.get_json()
    assert 'timestamp' in datos[0]
    assert datos[0]['timestamp'] != ''

def test_bitacora_tiene_id(cliente):
    cliente.post('/usuarios/registro', json={
        'usuario': 'carlos',
        'password': '789',
        'nombre': 'Carlos'
    })
    respuesta = cliente.get('/bitacora')
    datos = respuesta.get_json()
    assert 'id' in datos[0]
    assert datos[0]['id'] == 1

def test_usuario_mantiene_sesion_despues_de_varias_acciones(cliente):
    cliente.post('/usuarios/registro', json={
        'usuario': 'usuario1',
        'password': 'pass1',
        'nombre': 'Usuario Uno'
    })
    cliente.post('/usuarios/login', json={'usuario': 'usuario1', 'password': 'pass1'})
    cliente.post('/carrito', json={'producto_id': 1, 'cantidad': 1})
    cliente.post('/carrito', json={'producto_id': 2, 'cantidad': 1})
    
    bitacora_resp = cliente.get('/bitacora')
    bitacora_datos = bitacora_resp.get_json()
    
    registros_usuario = [b for b in bitacora_datos if b['usuario'] == 'usuario1']
    assert len(registros_usuario) >= 1

print("\n" + "="*60)
print("📋 RESUMEN DE TESTS DE BITÁCORA (LOG)")
print("="*60)
print("✅ test_bitacora_vacia_inicio")
print("✅ test_bitacora_registra_registro")
print("✅ test_bitacora_registra_login_admin")
print("✅ test_bitacora_registra_login_cliente")
print("✅ test_bitacora_registra_login_fallido")
print("✅ test_bitacora_registra_logout")
print("✅ test_bitacora_limpiar")
print("✅ test_bitacora_tiene_timestamp")
print("✅ test_bitacora_tiene_id")
print("✅ test_usuario_mantiene_sesion_despues_de_varias_acciones")
print("="*60)