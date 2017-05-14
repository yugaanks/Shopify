var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var schema=new Schema({
    userId:{type:String, required:true},
    points:{type:Number, required:true}
});

module.exports=mongoose.model('RewardPoints',schema);