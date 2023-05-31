import { Sequelize } from "sequelize";

const db = new Sequelize('auth_db', 'compute', '1234gaE',{
    host: '34.128.92.117',
    dialect:'mysql'
});

export default db;