
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

let users = [{ username: 'user', password: '123' }];
let products = [
  { id: 1, name: 'Producto A', price: 10, stock: 50 },
  { id: 2, name: 'Producto B', price: 20, stock: 50 },
  { id: 3, name: 'Producto C', price: 15, stock: 50 }
];
let pedidos = [];
let nextPedidoId = 1;

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username == username && u.password == password);
  if (user) res.json({ success: true });
  else res.status(401).json({ success: false });
});

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/pedidos', (req, res) => {
  const { cliente, items } = req.body;
  for (let item of items) {
    let prod = products.find(p => p.id == item.id);
    if (!prod || prod.stock < item.cantidad) {
      return res.status(400).json({ error: `Stock insuficiente para ${prod.name}` });
    }
  }
  for (let item of items) {
    let prod = products.find(p => p.id == item.id);
    prod.stock -= item.cantidad;
  }
  const pedido = { id: nextPedidoId++, cliente, items, status: 'creado' };
  pedidos.push(pedido);
  res.json(pedido);
});

app.put('/api/pedidos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let pedido = pedidos.find(p => p.id === id);
  if (pedido) {
    pedido.items = req.body.items;
    res.json(pedido);
  } else {
    res.status(404).json({ error: 'Pedido no encontrado' });
  }
});

app.delete('/api/pedidos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let index = pedidos.findIndex(p => p.id === id);
  if (index !== -1) {
    pedidos.splice(index, 1 );
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Pedido no encontrado' });
  }
});

app.get('/api/pedidos/:cliente', (req, res) => {
  const cliente = req.params.cliente;
  let result = pedidos.filter(p => p.cliente === cliente);
  res.json(result);
});

app.listen(3000, () => console.log('Backend REST funcionando en http://localhost:3000'));
