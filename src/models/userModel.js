const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')



const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        required: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("email is invalid")
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.includes("password")) {
                throw new Error("password cannont contains the word 'Password'")
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    score: {
        type: Number,
        default: 0
    },
    numberOfGames: {
        type: Number,
        default: 0
    },
    numberOfWins: {
        type: Number,
        default: 0
    },
    numberOfLosses: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

//Hash the text of password before saving
userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})


//When new user created or login we generate him new token
userSchema.methods.generateAuthToken = async function () {
    const user = this  //the user from the route "login" or new user
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat(({ token }))
    user.save()
    return token
}


// When user login we find him with this function
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error("Email is unknown to the system")
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error("Unable to login")
    }
    return user
}

//toJSON get called when json.stringifiy get called,whice happend when we send back the user.
//so before we send the user info we REMOVE the password and tokens
userSchema.methods.toJSON = function () {
    const user = this
    const userObj = user.toObject()

    delete userObj.password
    delete userObj.tokens

    return userObj
}

const User = mongoose.model('User', userSchema)

module.exports = User

