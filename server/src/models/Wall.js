import mongoose from 'mongoose'
 
const wallSchema = new mongoose.Schema({
    ownerId: {type: mongoose.Schema.Types.ObjectId, ref :"User", required:true},
    slug:{type:String,unique:true,required:true},
},{timestamps: true});

export default mongoose.model('Wall',wallSchema);