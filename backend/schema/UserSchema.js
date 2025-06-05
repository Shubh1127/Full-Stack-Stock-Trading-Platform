const mongoose=require("mongoose")
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose")

const userSchema=new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    verified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
        default: null
    },
})

userSchema.plugin(passportLocalMongoose)
module.exports={userSchema}
