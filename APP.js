const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const Post = require('./models/Post');
const { sequelize } = require('./models/db');
const authRoutes = require('./routes/auth');

// Configuração do Handlebars
app.engine('handlebars', exphbs({
  defaultLayout: 'main',
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
}));
app.set('view engine', 'handlebars');

// Configuração do Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configuração de Sessão
app.use(session({
  secret: 'seuSegredo',
  resave: false,
  saveUninitialized: true,
}));

// Middleware para tornar o usuário disponível em todas as views
app.use((req, res, next) => {
  res.locals.user = req.session.userId ? { id: req.session.userId } : null;
  next();
});

// Usar as rotas de autenticação
app.use(authRoutes);

// Middleware para verificar a autenticação
function requireAuth(req, res, next) {
  if (req.session.userId) {
    next(); // Continue se o usuário estiver autenticado
  } else {
    res.redirect('/login'); // Redirecione para a tela de login se não estiver autenticado
  }
}

// Aplicar o middleware requireAuth em todas as rotas protegidas
app.use(requireAuth);

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Nome do arquivo único
  }
});
const upload = multer({ storage: storage });

// Servir arquivos estáticos da pasta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rota para exibir a lista de posts
app.get('/', async (req, res) => {
  try {
    const posts = await Post.findAll({ order: [['id', 'DESC']] });
    res.render('home', { posts: posts });
  } catch (error) {
    res.status(500).send("OCORREU UM ERRO: " + error);
  }
});

app.get('/cad', (req, res) => {
  res.render("form-cad");
});

// Rota para processar o formulário
app.post('/cad', upload.single('imagem'), (req, res) => {
  Post.create({
    titulo: req.body.titulo,
    conteudo: req.body.conteudo,
    imagem: req.file ? req.file.filename : null // Salvar o nome do arquivo de imagem
  })
  .then(() => {
    res.redirect('/');
  })
  .catch((erro) => {
    res.send("OCORREU UM ERRO: " + erro);
  });
});

// Rota para excluir postagem
app.get('/deletar/:id', (req, res) => {
  const postId = req.params.id;

  Post.destroy({
    where: { id: postId }
  })
  .then(() => {
    res.send("POSTAGEM DELETADA COM SUCESSO!");
  })
  .catch((erro) => {
    res.send("OCORREU UM ERRO: " + erro);
  });
});

app.get('/edit/:id', (req, res) => {
  Post.findByPk(req.params.id)
    .then(post => {
      res.render('form-edit', {
        id: req.params.id,
        titulo: post.titulo,
        conteudo: post.conteudo
      });
    })
    .catch(err => {
      res.send('POST NÃO ENCONTRADO!');
    });
});

app.post('/editado/:id', upload.single('imagem'), (req, res) => {
  const updateData = {
    titulo: req.body.titulo,
    conteudo: req.body.conteudo,
  };

  if (req.file) {
    updateData.imagem = req.file.filename; // Atualiza o nome do arquivo de imagem se houver
  }

  Post.update(updateData, { where: { id: req.params.id } })
  .then(() => {
    res.redirect('/');
  }).catch(err => {
    console.log(err);
  });
});

// Inicie o servidor após sincronizar o banco de dados
sequelize.sync({ alter: true }).then(() => {
  const PORT = process.env.PORT || 8081;
  app.listen(PORT, () => {
    console.log(`Servidor está rodando na porta ${PORT}`);
  });
});
