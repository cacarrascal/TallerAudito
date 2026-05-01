import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000';

const styles = {
  global: `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Poppins', sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%); min-height: 100vh; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
  `,
};

const getStoredUser = () => {
  const user = localStorage.getItem('usuario');
  return user ? JSON.parse(user) : null;
};

const getPedidos = () => {
  const pedidos = localStorage.getItem('pedidos');
  return pedidos ? JSON.parse(pedidos) : [];
};

function App() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState({ items: [], total: 0 });
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [vista, setVista] = useState('tienda');
  const [usuario, setUsuario] = useState(getStoredUser());
  const [pedidos, setPedidos] = useState(getPedidos());
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [esRegistro, setEsRegistro] = useState(false);
  const [datosForm, setDatosForm] = useState({ usuario: '', password: '', nombre: '' });
  const [paginaActual, setPaginaActual] = useState(1);
  const [productosPorPagina] = useState(4);

  useEffect(() => {
    fetch(`${API_URL}/productos`)
      .then(res => res.json())
      .then(data => {
        setProductos(data);
        setCargando(false);
      })
      .catch(err => {
        console.error('Error al cargar productos:', err);
        setCargando(false);
      });
    obtenerCarrito();
  }, []);

  const obtenerCarrito = () => {
    fetch(`${API_URL}/carrito`)
      .then(res => res.json())
      .then(data => setCarrito(data))
      .catch(err => console.error('Error al cargar carrito:', err));
  };

  const agregarAlCarrito = (productoId) => {
    fetch(`${API_URL}/carrito`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ producto_id: productoId, cantidad: 1 })
    })
      .then(res => res.json())
      .then(() => {
        obtenerCarrito();
        setMensaje('¡Producto agregado al carrito!');
        setTimeout(() => setMensaje(''), 2000);
      })
      .catch(err => console.error('Error al agregar al carrito:', err));
  };

  const realizarPago = () => {
    const nuevoPedido = {
      id: Date.now(),
      fecha: new Date().toLocaleDateString(),
      items: [...carrito.items],
      total: carrito.total,
      usuario: usuario ? usuario.usuario : 'Invitado',
      estado: 'Pendiente'
    };

    const pedidosActualizados = [...pedidos, nuevoPedido];
    setPedidos(pedidosActualizados);
    localStorage.setItem('pedidos', JSON.stringify(pedidosActualizados));

    fetch(`${API_URL}/carrito`, { method: 'DELETE' })
      .then(() => {
        setMostrarCarrito(false);
        obtenerCarrito();
        alert('🎉 ¡Gracias por tu compra! \n\nTu pedido ha sido procesado correctamente.');
      })
      .catch(err => console.error('Error al procesar pago:', err));
  };

  const eliminarItem = (itemId) => {
    fetch(`${API_URL}/carrito/${itemId}`, { method: 'DELETE' })
      .then(res => {
        if (res.ok) {
          obtenerCarrito();
          setMensaje('Producto eliminado del carrito');
          setTimeout(() => setMensaje(''), 2000);
        }
      })
      .catch(err => console.error('Error al eliminar item:', err));
  };

  const iniciarSesion = () => {
    if (esRegistro) {
      if (!datosForm.nombre || !datosForm.usuario || !datosForm.password) {
        alert('Completa todos los campos');
        return;
      }
      fetch(`${API_URL}/usuarios/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosForm)
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            alert(data.error);
          } else {
            setUsuario(data.usuario);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            setMostrarLogin(false);
            setMensaje('¡Bienvenido! Tu cuenta ha sido creada');
            setTimeout(() => setMensaje(''), 2000);
          }
        })
        .catch(err => {
          console.error('Error en registro:', err);
          alert('Error al registrar usuario');
        });
    } else {
      fetch(`${API_URL}/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosForm)
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            alert(data.error);
          } else {
            setUsuario(data.usuario);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            setMostrarLogin(false);
            if (data.usuario.rol === 'admin') {
              setVista('admin');
              setMensaje('¡Bienvenido Administrador!');
            } else {
              setMensaje(`¡Hola ${data.usuario.nombre || data.usuario.usuario}! Bienvenido de nuevo`);
            }
            setTimeout(() => setMensaje(''), 2000);
          }
        })
        .catch(err => {
          console.error('Error en login:', err);
          alert('Error al iniciar sesión');
        });
    }
    setDatosForm({ usuario: '', password: '', nombre: '' });
  };

  const cerrarSesion = () => {
    fetch(`${API_URL}/usuarios/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: usuario.usuario })
    })
      .then(() => {
        setUsuario(null);
        localStorage.removeItem('usuario');
        setVista('tienda');
        setMensaje('Sesión cerrada correctamente');
        setTimeout(() => setMensaje(''), 2000);
      })
      .catch(err => {
        console.error('Error al cerrar sesión:', err);
      });
  };

  const cssStyles = `
    .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
    .header { 
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); 
      padding: 25px 40px; 
      border-radius: 20px; 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 40px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    .logo { font-size: 32px; font-weight: 700; color: white; display: flex; align-items: center; gap: 12px; cursor: pointer; }
    .logo-icon { animation: pulse 2s infinite; }
    .user-info { display: flex; gap: 15px; align-items: center; }
    .user-name { color: white; font-weight: 600; }
    .cart-btn, .login-btn, .logout-btn, .admin-btn { 
      padding: 12px 25px; 
      border: none; 
      border-radius: 50px; 
      color: white; 
      font-size: 14px; 
      font-weight: 600; 
      cursor: pointer; 
      transition: all 0.3s;
    }
    .cart-btn { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); }
    .login-btn { background: linear-gradient(135deg, #0984e3 0%, #74b9ff 100%); }
    .logout-btn { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); }
    .admin-btn { background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%); }
    .cart-btn:hover, .login-btn:hover, .logout-btn:hover, .admin-btn:hover { transform: translateY(-3px); }
    .toast { 
      position: fixed; top: 20px; right: 20px; 
      background: linear-gradient(135deg, #00b894 0%, #00cec9 100%);
      color: white; padding: 15px 30px; border-radius: 10px;
      font-weight: 600; z-index: 1000; animation: fadeIn 0.3s;
      box-shadow: 0 10px 40px rgba(0,184,148,0.4);
    }
    .grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
      gap: 30px; 
    }
    .card { 
      background: white; 
      border-radius: 20px; 
      overflow: hidden; 
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      transition: all 0.4s;
      animation: fadeIn 0.5s ease-out;
    }
    .card:hover { transform: translateY(-10px); box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
    .card-img { width: 100%; height: 220px; object-fit: cover; transition: transform 0.4s; }
    .card:hover .card-img { transform: scale(1.1); }
    .img-container { overflow: hidden; position: relative; }
    .category { 
      position: absolute; top: 15px; left: 15px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; padding: 8px 16px; border-radius: 20px;
      font-size: 12px; font-weight: 600;
    }
    .card-body { padding: 25px; }
    .card-title { font-size: 20px; font-weight: 700; color: #2d3436; margin-bottom: 8px; }
    .card-desc { font-size: 14px; color: #636e72; margin-bottom: 15px; line-height: 1.5; }
    .price-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .price { font-size: 28px; font-weight: 700; background: linear-gradient(135deg, #00b894 0%, #00cec9 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .add-btn { 
      width: 100%; padding: 15px; 
      background: linear-gradient(135deg, #0984e3 0%, #74b9ff 100%);
      border: none; border-radius: 12px; color: white;
      font-size: 16px; font-weight: 600; cursor: pointer;
      transition: all 0.3s;
    }
    .add-btn:hover { transform: scale(1.02); box-shadow: 0 10px 30px rgba(9,132,227,0.4); }
    .modal-overlay { 
      position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
      background: rgba(0,0,0,0.7); 
      display: flex; justify-content: center; align-items: center; 
      z-index: 999;
      backdrop-filter: blur(5px);
    }
    .modal { 
      background: white; padding: 40px; border-radius: 25px; 
      max-width: 500px; width: 90%; max-height: 85vh; overflow: auto;
      animation: fadeIn 0.3s;
    }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .modal-title { font-size: 28px; font-weight: 700; color: #2d3436; }
    .close-btn { background: none; border: none; font-size: 32px; cursor: pointer; color: #636e72; }
    .cart-item { 
      display: flex; gap: 15px; padding: 20px; 
      border-radius: 15px; margin-bottom: 15px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }
    .cart-img { width: 80px; height: 80px; object-fit: cover; border-radius: 10px; }
    .cart-info { flex: 1; }
    .cart-name { font-weight: 600; color: #2d3436; margin-bottom: 5px; }
    .cart-qty { font-size: 14px; color: #636e72; }
    .cart-price { font-size: 18px; font-weight: 700; color: #00b894; }
    .cart-total { 
      font-size: 28px; font-weight: 700; text-align: right; 
      margin-top: 25px; padding-top: 25px; border-top: 2px dashed #dfe6e9;
      background: linear-gradient(135deg, #00b894 0%, #00cec9 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .empty-cart { text-align: center; padding: 60px 20px; color: #636e72; }
    .empty-icon { font-size: 80px; margin-bottom: 20px; }
    .section-title { font-size: 36px; font-weight: 700; color: #2d3436; margin-bottom: 30px; text-align: center; }
    .section-title span { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .pay-btn { 
      width: 100%; padding: 18px; margin-top: 20px;
      background: linear-gradient(135deg, #00b894 0%, #00cec9 100%);
      border: none; border-radius: 12px; color: white;
      font-size: 18px; font-weight: 700; cursor: pointer;
      transition: all 0.3s;
    }
    .pay-btn:hover { transform: scale(1.02); box-shadow: 0 10px 30px rgba(0,184,148,0.4); }
    .delete-btn { 
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
      border: none; border-radius: 8px; color: white;
      padding: 8px 12px; cursor: pointer; font-size: 14px;
      transition: all 0.3s;
    }
    .delete-btn:hover { transform: scale(1.1); box-shadow: 0 5px 15px rgba(231,76,60,0.4); }
    .cart-item-row { display: flex; align-items: center; gap: 15px; }
    .login-form { display: flex; flex-direction: column; gap: 15px; }
    .login-input { padding: 15px; border: 2px solid #dfe6e9; border-radius: 10px; font-size: 16px; }
    .login-input:focus { outline: none; border-color: #0984e3; }
    .login-btn-full { padding: 15px; background: linear-gradient(135deg, #0984e3 0%, #74b9ff 100%); border: none; border-radius: 10px; color: white; font-size: 16px; font-weight: 600; cursor: pointer; }
    .switch-link { text-align: center; color: #0984e3; cursor: pointer; margin-top: 10px; }
    .admin-panel { background: white; border-radius: 20px; padding: 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
    .admin-title { font-size: 32px; font-weight: 700; color: #2d3436; margin-bottom: 30px; }
    .admin-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
    .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 15px; color: white; text-align: center; }
    .stat-number { font-size: 36px; font-weight: 700; }
    .stat-label { font-size: 14px; opacity: 0.9; }
    .orders-table { width: 100%; border-collapse: collapse; }
    .orders-table th { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; text-align: left; }
    .orders-table td { padding: 15px; border-bottom: 1px solid #dfe6e9; }
    .orders-table tr:hover { background: #f8f9fa; }
    .status-badge { padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .status-pendiente { background: #f39c12; color: white; }
    .status-entregado { background: #27ae60; color: white; }
    .back-btn { padding: 12px 25px; background: linear-gradient(135deg, #636e72 0%, #2d3436 100%); border: none; border-radius: 50px; color: white; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 20px; }
    .pagination { display: flex; justify-content: center; gap: 10px; margin-top: 40px; flex-wrap: wrap; }
    .page-btn { padding: 12px 18px; background: white; border: 2px solid #dfe6e9; border-radius: 10px; color: #2d3436; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
    .page-btn:hover:not(:disabled) { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-color: transparent; }
    .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .page-btn.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-color: transparent; }

    /* RESPONSIVE DESIGN */
    @media (max-width: 1024px) {
      .header { padding: 20px; flex-wrap: wrap; gap: 15px; }
      .logo { font-size: 24px; }
      .admin-stats { grid-template-columns: repeat(2, 1fr); }
      .section-title { font-size: 28px; }
    }

    @media (max-width: 768px) {
      .container { padding: 10px; }
      .header { 
        padding: 15px; 
        flex-direction: column; 
        text-align: center;
      }
      .logo { font-size: 22px; gap: 8px; }
      .user-info { 
        flex-wrap: wrap; 
        justify-content: center; 
        gap: 10px; 
      }
      .cart-btn, .login-btn, .logout-btn, .admin-btn {
        padding: 10px 18px;
        font-size: 12px;
      }
      .user-name { font-size: 14px; }
      .grid { 
        grid-template-columns: repeat(2, 1fr); 
        gap: 15px; 
      }
      .card { border-radius: 15px; }
      .card-img { height: 160px; }
      .card-body { padding: 15px; }
      .card-title { font-size: 16px; }
      .card-desc { font-size: 12px; display: none; }
      .price { font-size: 22px; }
      .add-btn { padding: 12px; font-size: 14px; }
      .section-title { font-size: 24px; margin-bottom: 20px; }
      .modal { padding: 25px; }
      .modal-title { font-size: 22px; }
      .cart-item { flex-direction: column; padding: 15px; }
      .cart-img { width: 100%; height: 120px; }
      .cart-item-row { flex-wrap: wrap; }
      .cart-price { width: 100%; text-align: right; margin-top: 10px; }
      .delete-btn { position: absolute; right: 10px; top: 10px; }
      .cart-item { position: relative; }
      .cart-total { font-size: 22px; }
      .pay-btn { padding: 15px; font-size: 16px; }
      .admin-panel { padding: 20px; }
      .admin-title { font-size: 24px; }
      .admin-stats { grid-template-columns: 1fr; gap: 15px; }
      .stat-card { padding: 20px; }
      .stat-number { font-size: 28px; }
      .orders-table { font-size: 12px; }
      .orders-table th, .orders-table td { padding: 10px 5px; }
      .toast { right: 10px; left: 10px; text-align: center; }
    }

    @media (max-width: 480px) {
      .header { padding: 12px; border-radius: 12px; margin-bottom: 20px; }
      .logo { font-size: 18px; }
      .logo-icon { font-size: 24px; }
      .user-info { gap: 8px; }
      .cart-btn, .login-btn, .logout-btn, .admin-btn {
        padding: 8px 14px;
        font-size: 11px;
        border-radius: 20px;
      }
      .user-name { font-size: 12px; }
      .grid { 
        grid-template-columns: 1fr; 
        gap: 12px; 
      }
      .card-img { height: 180px; }
      .card-body { padding: 12px; }
      .card-title { font-size: 15px; }
      .price { font-size: 20px; }
      .add-btn { padding: 10px; font-size: 13px; }
      .section-title { font-size: 20px; }
      .modal { padding: 20px; border-radius: 15px; }
      .modal-title { font-size: 18px; }
      .close-btn { font-size: 24px; }
      .cart-item { padding: 12px; }
      .cart-img { height: 100px; }
      .cart-name { font-size: 14px; }
      .cart-qty { font-size: 12px; }
      .cart-price { font-size: 16px; }
      .cart-total { font-size: 18px; padding-top: 15px; }
      .pay-btn { padding: 12px; font-size: 14px; }
      .login-input { padding: 12px; font-size: 14px; }
      .login-btn-full { padding: 12px; font-size: 14px; }
      .admin-panel { padding: 15px; border-radius: 15px; }
      .admin-title { font-size: 20px; margin-bottom: 20px; }
      .stat-card { padding: 15px; }
      .stat-number { font-size: 24px; }
      .stat-label { font-size: 12px; }
      .orders-table { font-size: 10px; }
      .orders-table th, .orders-table td { padding: 8px 3px; }
      .status-badge { padding: 3px 8px; font-size: 10px; }
      .pagination { gap: 5px; margin-top: 20px; }
      .page-btn { padding: 8px 12px; font-size: 12px; }
    }
  `;

  const renderLoginModal = () => (
    <div className="modal-overlay" onClick={() => setMostrarLogin(false)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{esRegistro ? '📝 Registrarse' : '🔐 Iniciar Sesión'}</h2>
          <button className="close-btn" onClick={() => setMostrarLogin(false)}>×</button>
        </div>
        <div className="login-form">
          {esRegistro && (
            <input type="text" className="login-input" placeholder="Tu nombre" value={datosForm.nombre} onChange={e => setDatosForm({...datosForm, nombre: e.target.value})} />
          )}
          <input type="text" className="login-input" placeholder="Usuario" value={datosForm.usuario} onChange={e => setDatosForm({...datosForm, usuario: e.target.value})} />
          <input type="password" className="login-input" placeholder="Contraseña" value={datosForm.password} onChange={e => setDatosForm({...datosForm, password: e.target.value})} />
          <button className="login-btn-full" onClick={iniciarSesion}>{esRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}</button>
          <p className="switch-link" onClick={() => setEsRegistro(!esRegistro)}>
            {esRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </p>
          <p style={{textAlign:'center',fontSize:'12px',color:'#636e72',marginTop:'10px'}}>
            Admin: usuario="admin" password="admin123"
          </p>
        </div>
      </div>
    </div>
  );

  const renderAdminPanel = () => {
    const totalVentas = pedidos.reduce((acc, p) => acc + p.total, 0);
    return (
      <div className="admin-panel">
        <button className="back-btn" onClick={() => setVista('tienda')}>← Volver a la Tienda</button>
        <h2 className="admin-title">📊 Panel de Administración</h2>
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-number">{pedidos.length}</div>
            <div className="stat-label">Pedidos Totales</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">${totalVentas.toFixed(2)}</div>
            <div className="stat-label">Ventas Totales</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{productos.length}</div>
            <div className="stat-label">Productos</div>
          </div>
        </div>
        <h3 style={{marginBottom:'20px',color:'#2d3436'}}>📋 Historial de Pedidos</h3>
        {pedidos.length === 0 ? (
          <p style={{textAlign:'center',color:'#636e72',padding:'40px'}}>No hay pedidos todavía</p>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Items</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map(pedido => (
                <tr key={pedido.id}>
                  <td>#{pedido.id}</td>
                  <td>{pedido.fecha}</td>
                  <td>{pedido.usuario}</td>
                  <td>{pedido.items.length} productos</td>
                  <td style={{fontWeight:'bold',color:'#00b894'}}>${pedido.total.toFixed(2)}</td>
                  <td><span className="status-badge status-pendiente">{pedido.estado}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  const renderTienda = () => {
    const indiceInicio = (paginaActual - 1) * productosPorPagina;
    const indiceFin = indiceInicio + productosPorPagina;
    const productosPagina = productos.slice(indiceInicio, indiceFin);
    const totalPaginas = Math.ceil(productos.length / productosPorPagina);

    return (
    <>
      <h2 className="section-title">
        <span>Catálogo</span> de Zapatos
        <span style={{fontSize:'16px',color:'#636e72',marginLeft:'10px'}}>
          (Página {paginaActual} de {totalPaginas})
        </span>
      </h2>
      <div className="grid">
        {productosPagina.map((producto, index) => (
          <div key={producto.id} className="card" style={{animationDelay: `${index * 0.1}s`}}>
            <div className="img-container">
              <img src={producto.imagen} alt={producto.nombre} className="card-img" />
              <span className="category">{producto.categoria}</span>
            </div>
            <div className="card-body">
              <h3 className="card-title">{producto.nombre}</h3>
              <p className="card-desc">{producto.descripcion}</p>
              <div className="price-row">
                <span className="price">${producto.precio.toFixed(2)}</span>
              </div>
              <button className="add-btn" onClick={() => agregarAlCarrito(producto.id)}>
                ➕ Agregar al Carrito
              </button>
            </div>
          </div>
        ))}
      </div>

      {totalPaginas > 1 && (
        <div className="pagination">
          <button 
            className="page-btn" 
            onClick={() => setPaginaActual(1)}
            disabled={paginaActual === 1}
          >
            ««
          </button>
          <button 
            className="page-btn" 
            onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
            disabled={paginaActual === 1}
          >
            «
          </button>
          
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
            <button
              key={num}
              className={`page-btn ${paginaActual === num ? 'active' : ''}`}
              onClick={() => setPaginaActual(num)}
            >
              {num}
            </button>
          ))}
          
          <button 
            className="page-btn" 
            onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
            disabled={paginaActual === totalPaginas}
          >
            »
          </button>
          <button 
            className="page-btn" 
            onClick={() => setPaginaActual(totalPaginas)}
            disabled={paginaActual === totalPaginas}
          >
            »»
          </button>
        </div>
      )}

      {mostrarCarrito && (
        <div className="modal-overlay" onClick={() => setMostrarCarrito(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">🛒 Carrito de Compras</h2>
              <button className="close-btn" onClick={() => setMostrarCarrito(false)}>×</button>
            </div>
            
            {carrito.items.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-icon">🛒</div>
                <p>Tu carrito está vacío</p>
                <p style={{fontSize:'14px',marginTop:'10px'}}>¡Agrega algunos productos!</p>
              </div>
            ) : (
              <>
                {carrito.items.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-row">
                      <img src={item.imagen} alt={item.nombre} className="cart-img" />
                      <div className="cart-info">
                        <div className="cart-name">{item.nombre}</div>
                        <div className="cart-qty">Cantidad: {item.cantidad} × ${item.precio.toFixed(2)}</div>
                      </div>
                      <div className="cart-price">${(item.precio * item.cantidad).toFixed(2)}</div>
                      <button className="delete-btn" onClick={() => eliminarItem(item.id)} title="Eliminar">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
                <div className="cart-total">Total: ${carrito.total.toFixed(2)}</div>
                <button className="pay-btn" onClick={realizarPago}>
                  💳 Pagar Ahora
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );

  if (cargando) {
    return (
      <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'60px',marginBottom:'20px'}}>👞</div>
          <div style={{fontSize:'24px',color:'#636e72'}}>Cargando productos...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{styles.global}</style>
      <style>{cssStyles}</style>
      <div className="container">
        {mensaje && <div className="toast">{mensaje}</div>}
        
        <header className="header">
          <div className="logo" onClick={() => setVista('tienda')}>
            <span className="logo-icon">👞</span>
            <span>Zapatería Premium</span>
          </div>
          <div className="user-info">
            {usuario ? (
              <>
                {usuario.rol === 'admin' && <button className="admin-btn" onClick={() => setVista('admin')}>⚙️ Admin</button>}
                <span className="user-name">👤 {usuario.nombre || usuario.usuario}</span>
                <button className="logout-btn" onClick={cerrarSesion}>Cerrar Sesión</button>
              </>
            ) : (
              <button className="login-btn" onClick={() => setMostrarLogin(true)}>🔐 Iniciar Sesión</button>
            )}
            <button className="cart-btn" onClick={() => setMostrarCarrito(true)}>
              🛒 Carrito ({carrito.items.reduce((acc, item) => acc + item.cantidad, 0)})
            </button>
          </div>
        </header>

        {vista === 'admin' ? renderAdminPanel() : renderTienda()}

        {mostrarLogin && renderLoginModal()}
      </div>
    </>
  );
}

export default App;