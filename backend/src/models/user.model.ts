import db from '../config/db';

export const findAllUsers = async () => {
    return db.any('SELECT * FROM users');
};