var mongoose=require("mongoose");
var campgroundSchema=new mongoose.Schema({
    name:String,
    img:String,
    body:String,
    comments:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"comment"
    }],
     author:{
        id:{
            type : mongoose.Schema.Types.ObjectId,
            ref  : "user.js"
           },
        username:String
    }
});

module.exports=mongoose.model("campground", campgroundSchema);