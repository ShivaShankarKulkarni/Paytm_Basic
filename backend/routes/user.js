const express = require("express");

const router = express.Router();
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { User, Account } = require("../db");
const JWT_SECRET = require("../config");
const  { authMiddleware } = require("../middlewares");

// Creating ZOD Schema
const signupSchema = zod.object({
    username: zod.string(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string()
})

// Creating post requst for signup page
router.post("/signup", async (req,res) => {
    const body = req.body;
    const {success} = signupSchema.safeParse(body);
    if(!success) {
        return res.json({
            message: "Incorrect Inputs / Something Missing"
        })
    }
    // Checking if Users exists
    const user = User.findOne({
        username: body.username
    })

    if(user._id){
        return res.json({
            message: "Email Already exists"
        })
    }
// Creating user and json web token and sending the right response.
    const dbUser = await User.create(body);
    const userID = dbUser._id;
    await Account.create({
        userId: userID,
        balance: 1 + Math.random() * 10000
    })
    const token = jwt.sign({
        userId: dbUser._id
    },JWT_SECRET)

    res.json({
        message: "User created successfuly",
        token: token
    })

})


// Crearing signin zod validation
const signinBody = zod.object({
    username: zod.string().email(),
	password: zod.string()
})
// Creating a Post request for signin page
router.post("/signin",async (req,res) =>{
    const body = req.body;
    const {success} = signinBody.safeParse(body);
    if (!success) {
        return res.status(411).json({
            message: "Incorrect Inputs"
        })
    }

    // checking if user exits:
    const user = await User.findOne({
        username: body.username,
        password: body.password
    });

    if(user){
        const token = jwt.sign({
            userId: user._id
        },JWT_SECRET)
        res.json({
            token: token
        })
        return;
    }

    res.status(411).json({
        message: "Error while logging in"
    })
})
// Creating put route to update the parameters from the body
const updateBody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional()
})

router.put("/",authMiddleware,async (req,res)=>{
    const {success} = updateBody.safeParse(req.body);
    if(!success){
        return res.json({
            message: "Error while updating information"
        })
    }
    await User.updateOne({
        _id: req.userId
    }, req.body)
    res.json({
        message: "Updated successfully"
    })
})

// Creating a get route to get all the users to get from typing firstName or lastName
router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

module.exports = router;