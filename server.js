// const swaggerUi = require("swagger-ui-express");
// const swaggerJsdoc = require("swagger-jsdoc");
// const cors = require("cors")

const express = require('express')
const sequelize = require("./Model/db");
const session = require("express-session");
const path = require("path");
const { Server } = require('socket.io');
const http = require('http');
const bcrypt =require("bcrypt")
const Locations = require("./Model/Locations")
const User = require("./Model/User"); // import the User model
const Material = require("./Model/Material"); // import the Material model
const Project = require("./Model/Project")
const db = require("./Model/db");
const app = express()
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' } // Change in production!
});


const { Sequelize , QueryTypes } = require('sequelize');
const { SELECT } = require('sequelize/lib/query-types');
// const sequelize = new Sequelize('mysql::memory:');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

 //session middle ware
app.use(session({
    //   store: new RedisStore({ client: redisClient }),
  secret: "supersecretkey",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure:false,     // HTTPS only
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));

app.use(express.static(path.join(__dirname, 'public')));

// app.use(cors({
//     origin: "http://localhost:3000",
//     credentials: true
// })); 

function isAuthenticated(req,res, next){
   
        if(!req.session.user){
            return res.status(401).json({message: "please login first"})
        }
         req.user = req.session.user;
        next()
    }

//authorization middleware
 function isAdmin(req,res,next){

    //cheks role stroed ins ession
     
        if(!req.session.user || req.session.user.role !== 'admin')
               {
                return res.status(403).json({message: "Access denied admin only"})
               }
               next();
     } 

     
app.use(express.static(path.join(__dirname ,"public")))

app.get("/me", (req, res) => {
  if(req.session.user){
    res.json({
        id:req.session.user.id,
        username : req.session.user.username,
        role: req.session.user.role
    })
}  else { res.status(401).json ({ message : "Not logged in "})}
});
// ============ POST API ZONE 
 
app.post('/register',isAuthenticated, isAdmin, async (req,res)=>{
  
/// new registration for worker
     try {    console.log("hello")
        const password = req.body.password;
        const username =req.body.username
          const Fname = req.body.Fname
          const jobPosition = req.body.jobPosition

        // 1.basic validation
         if(!username|| !password || !Fname || !jobPosition){
              return res.status(400).json({message:"Please fill all fields"})
         }
        //  2.check if the user already exxists?
         
    const existingUsar = await User.findOne({
      where:{userName: username},
    })
          if(existingUsar){
              return res.status(409).json({message:"user already exists"})
              
          }
        //   3. hashing password 
         const hashedPassword= await bcrypt.hash(password , 12);

            // 4. insert user to the database

            await User.create({
              userName: username,
              Fname,
              jobPosition,
              password: hashedPassword
            })
   res.status(201).json({message:"user registered succesfully "})


     } catch (error) {
           console.error(error);
    res.status(500).json({message:"Server error"});
     }
})

app.post('/login', async (req,res)=>{
     try {
      
        const {username, password}= req.body;
        // 1.validate the input 
        if(!username|| !password ){
            return res.status(400).json({message:"All fields are required"})
        }
              //  2.find the user in db 
                const users = await sequelize.query(
          'SELECT * FROM users WHERE userName = ?',
          {
              replacements: [username], // The values to replace ? with
              type: Sequelize.QueryTypes.SELECT
          }
);
          if(users.length===0){
             return res.status(401).json({message:"invalid credential"})
          }

          const user = users[0]

        //   3.compare hashed pawword

         const isMatch = await bcrypt.compare(password, user.password);

         if(!isMatch){
            return res.status(401).json({message:"Password incorrect"});
         }   

        // 4. create session ( authentication)

        req.session.user = {
             id: user.id,
             username:user.username,
             role :user.role
        }

        res.status(200).json({
                             success: true,
                             message: "Login successful",
                             user: {
                             id: user.id,
                             username: user.username,
                             role: user.role
                        }
});


     } catch (error) {
            console.error(error);
        res.status(500).json({message:"Server error"});
     }     
})

app.post(`/admin/api/materials`,  async (req,res)=>{
    try {
        const { name,          // required
                unit,          // required (pcs, kg, m, bag, liter, ...)
                 
            } = req.body;

        if (!name || !unit) {
            return res.status(400).json({
                success: false,
                message: "name and unit are required fields"
            });
        } 
        // Insert the new material into the database
        await Material.create({
               name,
               unit 
            })
         res.status(201).json({message:"material registered succesfully "})
        
    }
      catch (error) { 
        console.error(error);
        res.status(500).json({message:"Server error"});
      }
    })

app.post('/admin/api/addLocation',async(req,res)=>{
    try {
      const {location_name , type} =req.body
      if (!location_name || !type) {
        return res.status(400).json({
          success: false,
          message: "location_name and type are required fields"
        });
      }
      await sequelize.query(
        `
        INSERT INTO locations (location_name, type)
        VALUES (?, ?)
        `,
        {
          replacements: [location_name, type], // use req.user from session
          type: QueryTypes.INSERT
        }
      );
      res.status(201).json({message:"Location added successfully"})

      
    } catch (error) {
      console.error(error);
      res.status(500).json({message:"Server error"});
    }

})
;
app.post('/admin/api/addProject', async(req,res)=>{
    console.log("heree")
  try {
    const {name, status}=req.body
      if (!name) {
        return res.status(400).json({
          success: false,
          message: "name and type are required fields"
        })

  }
    await Project.create(
     {
     project_name :name ,
     status
     }
    );
    res.status(201).json({message:"Project added successfully"})  
  }
  catch (error) {
      console.error(error);
      res.status(500).json({message:"Server error"});
    }


})


//============  get api zone  =============== 

app.get(`admin/api/users`,async(req,res)=>{
  try{
  const [users] =await db.query(
    `SELECT *
     FROM users `
  )
 res.status(200).json(users)
  }
  catch(err){
    console.error(err)
  }
})
app.get('/admin/api/location',isAuthenticated, isAdmin, async(req,res) =>{
    try {
        const locations = await Locations.findAll();
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Server error"});
    }
} )







app.listen(3000,()=>{
    console.log("server running http://localhost:3000")
})
