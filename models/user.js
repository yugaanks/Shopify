var mongoose=require("mongoose");
// var Schema=mongoose.Schema;
var bcrypt=require("bcrypt-nodejs");

var userSchema=mongoose.Schema({
    local:{
        email:String,
        password:String
    },
    facebook:{
        id:String,
        token:String,
        name:String,
        email:String
    },
    twitter:{
        id:String,
        toke:String,
        username:String,
        displayName:String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }
});

userSchema.methods.encryptPassword=function(password){
    return bcrypt.hashSync(password,bcrypt.genSaltSync(5),null);
};

userSchema.methods.validPassword=function(password) {
    return bcrypt.compareSync(password,this.local.password);
};

module.exports=mongoose.model("User",userSchema);