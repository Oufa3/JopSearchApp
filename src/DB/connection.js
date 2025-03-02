
import mongoose from "mongoose"


const connectDB = async () => {
    await mongoose.connect(process.env.DB_URL).then(res => {
        console.log(`DB Connected`);
    }).catch(err => {
        console.error(`Fail To Connect To DB`, err);
    })
}
export default connectDB