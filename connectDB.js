const Sequelize = require("sequelize");

const sequelize = new Sequelize('todo_db', 'postgres', 'changeme', {
  host: "localhost",
  dialect: "postgres",
});

const connect = async () => {
  return sequelize.authenticate();
}

module.exports = {
  connect,
  sequelize
}