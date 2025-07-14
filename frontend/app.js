let carrito = [];
let usuario = '';

function login() {
  const username = document.getElementById('user').value;
  const password = document.getElementById('pass').value;
  fetch('http://localhost:3000/api/login', {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ username, password })
  })
  .then(res => res.ok ? res.json() : Promise.reject())
  .then(() => {
    usuario = username;
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('catalogoSection').classList.remove('hidden');
    cargarCatalogo();
  })
  .catch(() => alert('Login fallido'));
}

function cargarCatalogo() {
  fetch('http://localhost:3000/api/products')
  .then(res => res.json())
  .then(data => {
    document.getElementById('catalogo').innerHTML = data.map(p => `
      <div class="product-card">
        <img src="https://www.impacto.com.pe/storage/products/1606412858RVLTXCBORQRCTHM.1.jpg" alt="${p.name}" style="width:50%; border-radius:8px; margin-bottom:8px;">
        <div style="margin-bottom:8px; font-weight:bold;">${p.name} - S/${p.price} (Stock: ${p.stock})</div>
        <input type="number" id="qty_${p.id}" min="1" max="${p.stock}" value="1">
        <button onclick="agregar(${p.id}, '${p.name}', ${p.price}, ${p.stock})">Agregar</button>
      </div>
    `).join('');
  });
}

function agregar(id, name, price, stock) {
  const qty = parseInt(document.getElementById(`qty_${id}`).value);
  if (qty > stock) return alert('Excede el stock disponible');
  const item = carrito.find(i => i.id == id);
  if (item) item.cantidad += qty;
  else carrito.push({ id, name, price, cantidad: qty });
  mostrarCarrito();
}

function mostrarCarrito() {
  document.getElementById('carrito').innerHTML = carrito.map(i => `
    <div class="product-card">
      <div style="margin-bottom:8px;">${i.name} x ${i.cantidad} = S/${i.price * i.cantidad}</div>
      <button onclick="quitar(${i.id})">Quitar</button>
    </div>
  `).join('');
  const subtotal = carrito.reduce((a,b)=>a+b.price*b.cantidad,0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;
  document.getElementById('resumen').innerText = `Sub: S/${subtotal} | IGV: S/${igv.toFixed(2)} | Total: S/${total.toFixed(2)}`;
}

function quitar(id) {
  carrito = carrito.filter(i => i.id != id);
  mostrarCarrito();
}

function realizarPedido() {
  if (!carrito.length) return alert('Carrito vacío');
  fetch('http://localhost:3000/api/pedidos', {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ cliente: usuario, items: carrito })
  })
  .then(res => res.ok ? res.json() : Promise.reject())
  .then(() => {
    alert('Pedido realizado');
    carrito = [];
    mostrarCarrito();
    cargarCatalogo();
  })
  .catch(() => alert('Error al crear pedido'));
}

function toggleCarrito() {
  const carritoSection = document.getElementById('carritoSection');
  carritoSection.style.display = (carritoSection.style.display === 'none' || carritoSection.style.display === '') ? 'block' : 'none';
}
