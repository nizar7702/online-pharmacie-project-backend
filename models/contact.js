const mongoose=require('mongoose')
const Contact=mongoose.model('contact',{
    message:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    subject:{
        type:String,
        required:true,
    },
})
module.exports=Contact