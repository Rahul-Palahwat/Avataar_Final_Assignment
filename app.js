const express=require('express');
const app=express();
const port=process.env.PORT || 3000;
const fs=require('fs');
const path=require('path');

// this is to get json format data 
app.use(express.json());
// this is a middleware to get the data from post request 
app.use(express.urlencoded());


// this is for database connection 
const mongoose=require('mongoose');
mongoose.connect('mongodb://localhost/Demo',{
    useNewUrlParser:true,
    useUnifiedTopology:true
});

var db=mongoose.connection;
db.on('error', console.error.bind(console,'connection error:'));

// to check the connection 
db.once('open',function(){
    console.log("We are succesfully connected to database");
})

// this is to create schema to store the data to database in a format 
const userSchema=new mongoose.Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type:Number,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    confirmpassword:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    gender:{
        type:String,
        required:true
    }
})

// we are creating a new collection 
const User=new mongoose.model("User",userSchema);



// this is to serve files from static folder for css
app.use('/static',express.static('static'));

// endpoints 
app.get('/register',(req,res)=>{
    res.sendFile(path.join(__dirname,'/views/home.html'));
})

app.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname,'/views/login.html'));
})

app.post('/login',async(req,res)=>{
    try {
        var id=req.body.email;
        var pass=req.body.password;
        // console.log(`${id} ${pass}`);
        const useremail=await User.findOne({email:id});
        // console.log(useremail.password);
        if(useremail.password===pass){
            // res.sendFile(path.join(__dirname,'/views/rahul.html'));
            res.json({name:useremail.firstname, email:useremail.email})
        }
        else{
            res.status(400).send(`Invalid password`);
        }
    } catch (error) {
        res.status(400).send(`Invalid details`);
    }
})


app.post('/register',(req,res)=>{
    var password=req.body.password;
    var cpassword=req.body.confirmpassword;
    if(password===cpassword){
        var this_user=new User({
            firstname:req.body.firstname,
            lastname:req.body.lastname,
            email:req.body.email,
            phone:req.body.number,
            password:req.body.password,
            confirmpassword:cpassword,
            age:req.body.age,
            gender:req.body.gender,
        })
        this_user.save().then(()=>{
            console.log("This data has been added to the database");
            res.sendFile(path.join(__dirname,'views/rahul.html'));
        }).catch((error)=>{
            res.status(400).send(error);
        })
    }
    else{
        res.send("Password does not match");
    }
})


// this is to start the server 
app.listen(port,()=>{
    console.log(`Connection is live at port ${port}`);
})
