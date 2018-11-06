var mongoose=require("mongoose");
var campground=require("./modules/campground.js");
var comment=require("./modules/comment.js");
var data=[
    {
        name:"Camp A",
        img:"https://www.ccprc.com/ImageRepository/Path?filePath=%2FDocuments%5CContent%5C461%5C1051%5C1452%2FIMG_2121.jpg",
        body:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum"
    },
    {
        name:"Camp A",
        img:"https://www.ccprc.com/ImageRepository/Path?filePath=%2FDocuments%5CContent%5C461%5C1051%5C1452%2FIMG_2121.jpg",
        body:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum"
    },
    {
        name:"Camp A",
        img:"https://www.ccprc.com/ImageRepository/Path?filePath=%2FDocuments%5CContent%5C461%5C1051%5C1452%2FIMG_2121.jpg",
        body:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum"
    }
    ];

function seedDB(){
campground.remove({}, function(err){
    if(err){
        console.log(err);
    }
      console.log("removed camps");
      data.forEach(function(seed){
    campground.create(seed, function(err, newCampground){
        if(err){
            console.log(err);
        }else{
            comment.create({
                text:"chblah balh blah blah blah blah",
                author:"dafrefwds"
            }, function(err, comment){
                if(err){
                    console.log(err);
                }else{
                    newCampground.comments.push(comment);
                    newCampground.save();
                    console.log("created new comment");
                }
            });
        }
    });
});    
});

}

module.exports=seedDB;
