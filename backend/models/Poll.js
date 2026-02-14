import mongoose from "mongoose";
const optionSchema=new mongoose.Schema({
  text:{
    type:String,
    required:true ,
    trim:true
  },

  votes:{
    type:Number,
    default:0,
    min:0
  }
});

const pollSchema=new mongoose.Schema({
  question:{
    type:String,
    required:true,
    trim:true
  },
  options:{
    type:[optionSchema],
    validate:{
      validator:function(arr){
        return arr.length>2;
    },
  message:"Minimum 2 options are required"
  }
  },
  createdAt:{
    type:Date,
    default:Date.now
  },
  expiresAt:{
    type:Date,
    default:null
  }

});

//index for search
pollSchema.index({createdAt:-1});
export default mongoose.model("Poll",pollSchema);