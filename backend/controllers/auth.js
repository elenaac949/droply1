const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Validación fallida.',
            errors: errors.array()
        });
    }

    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;


    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        const userDetails = {
            username: username,
            email: email,
            password: hashedPassword
        }

        await User.save(userDetails);

        res.status(201).json({ message: 'Usuario registrado correctamente' });


    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}