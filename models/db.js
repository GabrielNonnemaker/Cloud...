const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('postapp', 'postgres', '1234', {
  host: 'localhost',
  dialect: 'postgres', 
});

// Sincronize os modelos com o banco de dados, alterando as tabelas se necessário
sequelize.sync({ alter: true })
  .then(() => {
    console.log("Tabelas sincronizadas com sucesso!");
  })
  .catch(error => {
    console.error("Erro ao sincronizar tabelas: ", error);
  });

module.exports = { sequelize };
