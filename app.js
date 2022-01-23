const express=require('express');
const app=express();
const port=process.env.PORT || 3000;
const fs=require('fs');
const path=require('path');

const bcrypt=require('bcryptjs');


// this is for cookies and session 
const mongoURI="mongodb://localhost/Demo";
const session=require('express-session');
const MongoDBSession=require('connect-mongodb-session')(session);




// this is to get json format data 
app.use(express.json());
// this is a middleware to get the data from post request 
app.use(express.urlencoded());


// to set view engine 
app.set('view-engine', 'ejs');

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



// this is for session and cookies 
const store=new MongoDBSession({
    uri: mongoURI,
    collection: 'mySessions',
})



app.use(session({
    secret: 'key that will sign cookies',
    resave: false,
    saveUninitialized: false,
    store: store,
}))

// middleware to authentication 
const isAuth=(req,res,next)=>{
    if(req.session.isAuth){
        next()
    }else{
        res.render('/login');
    }
}




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
    // res.sendFile(path.join(__dirname,'/views/home.html'));
    res.render('register.ejs');
})

app.get('/rahul',isAuth,(req,res)=>{
    // res.sendFile(path.join(__dirname,'/views/home.html'));
    res.render('rahul.ejs');
})


app.get('/login',(req,res)=>{
    // res.sendFile(path.join(__dirname,'/views/login.html'));
    // req.session.isAuth=true;
    // console.log(req.session);
    // console.log(req.session.id);
    res.render('login.ejs')
})

app.post('/login',async(req,res)=>{
    try {
        var id=req.body.email;
        var pass=req.body.password;
        // console.log(`${id} ${pass}`);
        const useremail=await User.findOne({email:id});
        // console.log(useremail.password);
        const ismatch=await bcrypt.compare(pass,useremail.password);
        if(ismatch){
            // res.sendFile(path.join(__dirname,'/views/rahul.html'));
            // res.render('rahul.ejs',{name:useremail.firstname , mail:useremail.email});
            req.session.isAuth=true;
            res.render('rahul.ejs');
            // res.status(200).render('',name)
            // res.json({name:useremail.firstname, email:useremail.email})
        }
        else{
            res.status(400).send(`Invalid password`);
        }
    } catch (error) {
        res.status(400).send(`Invalid details`);
    }
})


app.post('/register', async (req,res)=>{
    var password=req.body.password;
    var cpassword=req.body.confirmpassword;
    if(password===cpassword){
        password=await bcrypt.hash(password, 12);
        var this_user=new User({
            firstname:req.body.firstname,
            lastname:req.body.lastname,
            email:req.body.email,
            phone:req.body.number,
            password:password,
            confirmpassword:password,
            age:req.body.age,
            gender:req.body.gender,
        })
        
        this_user.save().then(()=>{
            console.log("This data has been added to the database");
            // res.sendFile(path.join(__dirname,'views/rahul.html'));
            res.render('rahul.ejs',{name:req.body.firstname});
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
