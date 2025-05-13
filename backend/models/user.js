
const db= require('../util/database');

module.exports=class User{

    constructor(username,email,password){
      this.username=username ;
      this.email=email;
      this.password=password;
    }


    static find(email){
        return db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        )
    }


    static save(user){
        return db.execute(
            'INSERT INTO users (username, email, password) VALUES (?,?,?)',
            [user.username, user.email, user.password]
        )
    }


    
}