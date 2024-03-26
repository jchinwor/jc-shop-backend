import JwtStrategy from "passport-jwt/lib/strategy";
import { ExtractJwt } from "passport-jwt";
const User = require('../models/User')
const key = process.env.SECRET;

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = key;  

module.exports = passport =>{
    passport.use(
        new JwtStrategy(opts, (jwt_payload, done) =>{
            User.findById(jwt_payload._id).then(user =>{
                if(user) return done(null, user);
                return done(null, false)
            }).catch(err => {
                console.log(err)  
            })  
        })
    )
}