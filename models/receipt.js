var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var schema=new Schema({
    userId:{type:Object, required:false},
    productId:{type:[String], required:true},
    // productId:[String],
    date:{type:Date, required:true}
});

module.exports=mongoose.model('Receipt',schema);