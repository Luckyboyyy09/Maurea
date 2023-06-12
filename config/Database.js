import { Sequelize } from "sequelize";

const db = new Sequelize('auth_db', 'admin', '1234',{
    host: '10.107.128.3',
    dialect:'mysql'
});

export default db;
