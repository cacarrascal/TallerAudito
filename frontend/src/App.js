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
        setMensaje('Producto agregado al carrito!');
        setTimeout(() => setMensaje(''), 2000);
      })
      .catch(err => console.error('Error al agregar al carrito:', err));
  };

  const realizarPago = () => {
    if (!carrito.items || carrito.items.length === 0) {
      alert('El carrito esta vacio');
      return;
    }
    
    fetch(`${API_URL}/pagos/procesar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: usuario ? usuario.usuario : 'Invitado' })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          setMostrarCarrito(false);
          obtenerCarrito();
          alert('Gracias por tu compra! Pedido #: ' + data.pedido.id);
        }
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
      if (datosForm.password.length < 8) {
        alert('La contrasena debe tener al menos 8 caracteres');
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
            setMensaje('Bienvenido! Tu cuenta ha sido creada');
            setTimeout(() => setMensaje(''), 2000);
          }
        })
        .catch(err => {
          console.error('Error en registro:', err);
          alert('Error al registrar usuario');
        });
    } else {
      if (!datosForm.usuario || !datosForm.password) {
        alert('Completa todos los campos');
        return;
      }
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
              setMensaje('Bienvenido Administrador!');
            } else {
              setMensaje(`Hola ${data.usuario.nombre || data.usuario.usuario}! Bienvenido de nuevo`);
            }
            setTimeout(() => setMensaje(''), 2000);
          }
        })
        .catch(err => {
          console.error('Error en login:', err);
          alert('Error al iniciar sesion');
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
        setMensaje('Sesion cerrada correctamente');
        setTimeout(() => setMensaje(''), 2000);
      })
      .catch(err => {
        console.error('Error al cerrar sesion:', err);
      });
  };

  const cssStyles = `
    .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 25px 40px; border-radius: 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
    .logo { font-size: 32px; font-weight: 700; color: white; display: flex; align-items: center; gap: 12px; cursor: pointer; }
    .logo-icon { animation: pulse 2s infinite; }
    .user-info { display: flex; gap: 15px; align-items: center; }
    .user-name { color: white; font-weight: 600; }
    .cart-btn, .login-btn, .logout-btn, .admin-btn { padding: 12px 25px; border: none; border-radius: 50px; color: white; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
    .cart-btn { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); }
    .login-btn { background: linear-gradient(135deg, #0984e3 0%, #74b9ff 100%); }
    .logout-btn { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); }
    .admin-btn { background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%); }
    .toast { position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #00b894 0%, #00cec9 100%); color: white; padding: 15px 30px; border-radius: 10px; font-weight: 600; z-index: 1000; animation: fadeIn 0.3s; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px; }
    .card { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1); transition: all 0.4s; animation: fadeIn 0.5s ease-out; }
    .card:hover { transform: translateY(-10px); }
    .card-img { width: 100%; height: 220px; object-fit: cover; }
    .img-container { overflow: hidden; position: relative; }
    .category { position: absolute; top: 15px; left: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .card-body { padding: 25px; }
    .card-title { font-size: 20px; font-weight: 700; color: #2d3436; margin-bottom: 8px; }
    .card-desc { font-size: 14px; color: #636e72; margin-bottom: 15px; }
    .price-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .price { font-size: 28px; font-weight: 700; color: #00b894; }
    .add-btn { width: 100%; padding: 15px; background: linear-gradient(135deg, #0984e3 0%, #74b9ff 100%); border: none; border-radius: 12px; color: white; font-size: 16px; font-weight: 600; cursor: pointer; }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 999; }
    .modal { background: white; padding: 40px; border-radius: 25px; max-width: 500px; width: 90%; animation: fadeIn 0.3s; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .modal-title { font-size: 28px; font-weight: 700; color: #2d3436; }
    .close-btn { background: none; border: none; font-size: 32px; cursor: pointer; color: #636e72; }
    .cart-item { display: flex; gap: 15px; padding: 20px; border-radius: 15px; margin-bottom: 15px; background: #f8f9fa; }
    .cart-img { width: 80px; height: 80px; object-fit: cover; border-radius: 10px; }
    .cart-info { flex: 1; }
    .cart-name { font-weight: 600; color: #2d3436; }
    .cart-qty { font-size: 14px; color: #636e72; }
    .cart-price { font-size: 18px; font-weight: 700; color: #00b894; }
    .cart-total { font-size: 28px; font-weight: 700; text-align: right; margin-top: 25px; padding-top: 25px; border-top: 2px dashed #dfe6e9; }
    .empty-cart { text-align: center; padding: 60px 20px; color: #636e72; }
    .empty-icon { font-size: 80px; margin-bottom: 20px; }
    .section-title { font-size: 36px; font-weight: 700; color: #2d3436; margin-bottom: 30px; text-align: center; }
    .pay-btn { width: 100%; padding: 18px; margin-top: 20px; background: linear-gradient(135deg, #00b894 0%, #00cec9 100%); border: none; border-radius: 12px; color: white; font-size: 18px; font-weight: 700; cursor: pointer; }
    .delete-btn { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); border: none; border-radius: 8px; color: white; padding: 8px 12px; cursor: pointer; }
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
    .status-badge { padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #f39c12; color: white; }
    .back-btn { padding: 12px 25px; background: linear-gradient(135deg, #636e72 0%, #2d3436 100%); border: none; border-radius: 50px; color: white; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 20px; }
    .pagination { display: flex; justify-content: center; gap: 10px; margin-top: 40px; flex-wrap: wrap; }
    .page-btn { padding: 12px 18px; background: white; border: 2px solid #dfe6e9; border-radius: 10px; color: #2d3436; font-size: 14px; font-weight: 600; cursor: pointer; }
    .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    @media (max-width: 768px) { .header { padding: 15px; flex-direction: column; text-align: center; } .grid { grid-template-columns: repeat(2, 1fr); gap: 15px; } }
  `;

  const renderLoginModal = () => (
    <div className="modal-overlay" onClick={() => setMostrarLogin(false)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{esRegistro ? 'Registrarse' : 'Iniciar Sesion'}</h2>
          <button className="close-btn" onClick={() => setMostrarLogin(false)}>x</button>
        </div>
        <div className="login-form">
          {esRegistro && (
            <input type="text" className="login-input" placeholder="Tu nombre" value={datosForm.nombre} onChange={e => setDatosForm({...datosForm, nombre: e.target.value})} />
          )}
          <input type="text" className="login-input" placeholder="Usuario" value={datosForm.usuario} onChange={e => setDatosForm({...datosForm, usuario: e.target.value})} />
          <input type="password" className="login-input" placeholder="Contrasena" value={datosForm.password} onChange={e => setDatosForm({...datosForm, password: e.target.value})} />
          <button className="login-btn-full" onClick={iniciarSesion}>{esRegistro ? 'Crear Cuenta' : 'Iniciar Sesion'}</button>
          <p className="switch-link" onClick={() => setEsRegistro(!esRegistro)}>
            {esRegistro ? 'Ya tienes cuenta? Inicia sesion' : 'No tienes cuenta? Registrate'}
          </p>
        </div>
      </div>
    </div>
  );

  const renderAdminPanel = () => {
    const totalVentas = pedidos.reduce((acc, p) => acc + p.total, 0);
    return (
      <div className="admin-panel">
        <button className="back-btn" onClick={() => setVista('tienda')}>Volver a la Tienda</button>
        <h2 className="admin-title">Panel de Administracion</h2>
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
        <h3 style={{marginBottom:'20px',color:'#2d3436'}}>Historial de Pedidos</h3>
        {pedidos.length === 0 ? (
          <p style={{textAlign:'center',color:'#636e72',padding:'40px'}}>No hay pedidos</p>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Cliente</th>
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
                  <td style={{fontWeight:'bold',color:'#00b894'}}>${pedido.total.toFixed(2)}</td>
                  <td><span className="status-badge">{pedido.estado}</span></td>
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
      <div>
        <h2 className="section-title">Catalogo de Zapatos</h2>
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
                  Agregar al Carrito
                </button>
              </div>
            </div>
          ))}
        </div>

        {totalPaginas > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPaginaActual(1)} disabled={paginaActual === 1}>1</button>
            <button className="page-btn" onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))} disabled={paginaActual === 1}>-</button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
              <button key={num} className="page-btn" onClick={() => setPaginaActual(num)}>{num}</button>
            ))}
            <button className="page-btn" onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))} disabled={paginaActual === totalPaginas}>+</button>
          </div>
        )}
      </div>
    );
  };

  if (cargando) {
    return (
      <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'60px'}}>Z</div>
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
            <span className="logo-icon">Z</span>
            <span>Zapatateria Premium</span>
          </div>
          <div className="user-info">
            {usuario ? (
              <div>
                {usuario.rol === 'admin' && <button className="admin-btn" onClick={() => setVista('admin')}>Admin</button>}
                <span className="user-name"> {usuario.nombre || usuario.usuario}</span>
                <button className="logout-btn" onClick={cerrarSesion}>Cerrar Sesion</button>
              </div>
            ) : (
              <button className="login-btn" onClick={() => setMostrarLogin(true)}>Iniciar Sesion</button>
            )}
            <button className="cart-btn" onClick={() => setMostrarCarrito(true)}>
              Carrito ({carrito.items.reduce((acc, item) => acc + item.cantidad, 0)})
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