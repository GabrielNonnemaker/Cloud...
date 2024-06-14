const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

// Rota para exibir o formulário de login
router.get('/login', (req, res) => {
  res.render('login');
});

// Rota para processar o login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (user && await bcrypt.compare(password, user.password)) {
      req.session.userId = user.id;  // Salvar o ID do usuário na sessão
      res.redirect('/');
    } else {
      res.status(401).send('Usuário ou senha inválidos');
    }
  } catch (error) {
    res.status(500).send('OCORREU UM ERRO: ' + error);
  }
});

// Rota para logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('OCORREU UM ERRO: ' + err);
    }
    res.redirect('/login');
  });
});

// Rota para exibir o formulário de registro (opcional)
router.get('/register', (req, res) => {
  res.render('register');
});

// Rota para processar o registro (opcional)
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashedPassword });
    res.redirect('/login');
  } catch (error) {
    res.status(500).send('OCORREU UM ERRO: ' + error);
  }
});

module.exports = router;
