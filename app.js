const express = require('express')
const app = express()
const jwt= require("jsonwebtoken")
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
var multer = require('multer');
const cors = require("cors")
const dotenv= require("dotenv")
const userModel = require('./models/user');
const postModel= require("./models/post")

const auth = require("./middleware/auth");

// const secret = "RESTAPI"

// Middlewares
app.use(express.urlencoded());
app.use(bodyParser());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
dotenv.config()



// set up multer for storing uploaded files
  
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname + '-' + Date.now())
    }
});
  
const upload = multer({ storage: storage });
// app.get('/',(req,res)=>{
// 	res.send("hiii")
// })

// app.post("/register", async (req, res) => {
// 	try {
// 		// console.log(userModel)
// 			const data = await userModel.create(req.body);
			
// 			res.status(201).json({
// 					status: "Sucess",
// 					data
// 			})
// 	} catch (e) {
// 			res.status(400).json({
// 					status: "Failed",
// 					message: e.message
// 			})
// 	}
// });

app.post("/register", async (req, res) => {

  // Our register logic starts here
  try {
    // Get user input
    const { name, email, password } = req.body;

    // Validate user input
    if (!(email && password && name)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await userModel.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await userModel.create({
      name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    });

		res.json({
			status: "sucess",
			// message: "Registration successful",
			user
	})
  } 
	catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});


// app.post("/login", async (req, res) => {
// 	try {
// 			const data = await userModel.create(req.body);
// 			res.status(201).json({
// 					status: "Sucess",
// 					data
// 			})
// 	} catch (e) {
// 			res.status(400).json({
// 					status: "Failed",
// 					message: e.message
// 			})
// 	}
// });

// app.post("/register", async (req, res) => {
// 	try {
			
// 			const { name, email, password } = req.body;

// 			bcrypt.hash(password, 10, async function (err, hash) {
// 					// Store hash in your password DB.
// 					if (err) {
// 							res.status(500).json({
// 									status: "failed",
// 									message: err.message
// 							})
// 					}
// 					const user = await userModel.create({
// 							name,
// 							email,
// 							password: hash

// 					});
// 					res.json({
// 							status: "sucess",
// 							message: "Registration successful",
// 							user
// 					})
// 			});
// 	} catch (e) {
// 			res.status(500).json({
// 					status: "failed",
// 					message: e.message
// 			});
// 	}
// });

app.post("/login",async (req, res) => {
			try {
				const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
					// console.log(password);
					const data = await userModel.findOne({email});
					console.log(data.password);
					// console.log(data);

					if(!data){
						 return res.status(400).json({
									status: "failed",
									message : "User is not registerd"
							})
					}

					bcrypt.compare(password, data.password, function(err, result) {
							if (err) {
									return res.status(500).json({
											status: "failed",
											message: err.message
									})
							}

							if(result){
									const token = jwt.sign({
											exp: Math.floor(Date.now() / 1000) + (60 * 60),
											data: data._id
										}, process.env.TOKEN_KEY);

										res.json({
											status:  "Sucess",
											token
									});
							}


					});

			} catch (e) {
					res.status(500).json({
							status: "failed",
							message: e.message
					});
			};
	});
// Read operation
app.get("/posts",auth, async (req, res) => {
    try {
        const data = await postModel.find();
        res.json({
            status: "Sucess",
            data
        })
    } catch (e) {
        res.status(500).json({
            status: "Failed",
            message: e.message
        })
        
    }
});


app.post("/posts",auth, async (req, res) => {
	try {
			const data = await postModel.create(req.body);
			res.status(201).json({
					status: "Sucess",
					data
			})
	} catch (e) {
			res.status(400).json({
					status: "Failed",
					message: e.message
			})
	}
});

app.put("/posts/:postId",auth, async (req, res) => {

	try {
			// console.log(req.query);
			const users = await postModel.updateOne({postId: req.params.id}, req.body);
			res.json({
					status: "Success",
					users
			})

	}catch(e) {
			res.status(500).json({
					status: "failed",
					message: e.message
			})
	}
})

// delete operation 
app.delete("/posts/:postId",auth, async (req, res) => {
    try {
        const data = await postModel.deleteOne({ postId: req.params.id });
        res.status(200).json({
            status: "Sucess",
            message: "character deleted"
        })
    } catch (e) {
        res.status(400).json({
            status: "Failed",
            message: e.message
        })
    }
});

app.get("*", (req, res) => {
    res.status(404).json({
        status: "Failed",
        message: "API NOT FOUND"
    })
})




module.exports = app;