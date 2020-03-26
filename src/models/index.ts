import mongoose from "mongoose";
import Vehicle from "./Vehicle";
import AccidentCase from "./AccidentCase";

const connectDb = () => {
    if (process.env.DATABASE_URL) {
        return mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    } else {
        throw new Error("No database URL defined");
    }
};

const models = { Vehicle, AccidentCase };

export { connectDb };

export default models;
