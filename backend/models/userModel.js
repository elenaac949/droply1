
const db = require('../util/database');

module.exports = class User {

    constructor(username, email, password, role = 'user', phone = '', country = '', city = '', postal_code = '', address = '', profile_picture = '') {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
        this.phone = phone;
        this.country = country;
        this.city = city;
        this.postal_code = postal_code;
        this.address = address;
        this.profile_picture = profile_picture;
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
            `INSERT INTO users 
            (username, email, password, role, phone, country, city, postal_code, address, profile_picture) 
            VALUES (?,?,?,?,?,?,?,?,?,?)`,
            [
                user.username,
                user.email,
                user.password,
                user.role || 'user',
                user.phone || '',
                user.country || '',
                user.city || '',
                user.postal_code || '',
                user.address || '',
                user.profile_picture || ''
            ]
        );
    }

    /* mostrar todos los usuarios */
    static findAll() {
        return db.execute(`
            SELECT 
            id, username, email, role,
            phone, country, city, postal_code, address, profile_picture
            FROM users
            WHERE role = "user"
        `);
    }



    /* Borrar ususarios por id */
    static deleteById(id) {
        return db.execute('DELETE FROM users WHERE id = ?', [id]);
    }

    /* Actualizar datoos dde usuario */
    static update(id, data) {
        return db.execute(
            `UPDATE users 
             SET username = ?, email = ?, role = ?, phone = ?, country = ?, city = ?, postal_code = ?, address = ?, profile_picture = ?
             WHERE id = ?`,
            [
                data.username,
                data.email,
                data.role || 'user',
                data.phone || '',
                data.country || '',
                data.city || '',
                data.postal_code || '',
                data.address || '',
                data.profile_picture || '',
                id
            ]
        );
    }


}