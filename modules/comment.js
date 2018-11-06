var mongoose=require("mongoose");
var commentSchema=new mongoose.Schema({
    text:String,
    author:{
        id:{
            type : mongoose.Schema.Types.ObjectId,
            ref  : "user.js"
           },
        username:String
    }
});

module.exports=mongoose.model("comment", commentSchema);
