
const db = require('../util/database');

module.exports = class User {

    constructor(username, email, password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    /* encontrar un usuario en base a un email */
    static find(email) {
        return db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        )
    }

    /* Guardar un usuario */
    static save(user) {
        return db.execute(
            'INSERT INTO users (username, email, password) VALUES (?,?,?)',
            [user.username, user.email, user.password]
        )
    }

    /* mostrar todos los usuarios */
    static findAll() {
        return db.execute('SELECT id, username, role, email FROM users WHERE role= "user"');
    }

    /* Borrar ususarios por id */
    static deleteById(id) {
        return db.execute('DELETE FROM users WHERE id = ?', [id]);
    }
/* Actualizar datoos dde usuario */
    static update(id, data) {
        return db.execute(
            'UPDATE users SET username = ?, email = ? WHERE id = ?',
            [data.username, data.email, id]
        );
    }


}