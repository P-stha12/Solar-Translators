const express = require("express");
const path = require('path')
const consolidate = require('consolidate');
const multer = require('multer');

require("dotenv").config();


//app level constants are configured here
const PORT = process.env.PORT || 3000 ;


const app = express();

//App configuration
app.engine('html',consolidate.swig);
app.set('views',path.join(__dirname,"/views"))
app.use(express.json());
app.use(express.urlencoded({
    extended:true
}));

let upload=multer({
    storage:multer.diskStorage({
        destination:(req,file,cb)=>{
            cb(null,path.join(__dirname,process.env.tempFile))
        },
        filename:(req,file,cb)=>{
            let fileName = Date.now()+file.originalname
            req.fileName  = fileName
            cb(null,fileName);
        }
    }),
    fileFilter:(req,file,cb)=>{
        if(path.extname(file.originalname) == ".csv"){
            cb(null,true)
        }else{
            cb(new Error("The file entered must be a csv file"));
        }
    }
})

app.post('/graph',upload.single('file'),(req,res)=>{
    res.status(200).json({
        "status":true
    })
    //We will implement the api request here some time after
},(err,req,res,next)=>{
    if(err){
        res.status(400).json({
            "message":err.message
        })
        console.log(err);
    }
})

app.use(express.static(path.join(__dirname+"/public")));

app.listen(PORT,()=>{
    console.log("We are listening to the app at port ", PORT);
})