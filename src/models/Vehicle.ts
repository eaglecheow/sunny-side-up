import mongoose from "mongoose";

export interface IVehicle extends mongoose.Document {
    numberPlate: string;
    phoneNumber: string;
    vehicleDescription: string;
}

const vehicleSchema = new mongoose.Schema({
    numberPlate: {
        type: String,
        unique: true,
        required: true
    },
    phoneNumber: {
        type: String,
        unique: true,
        required: true
    },
    vehicleDescription: {
        type: String
    }
});

vehicleSchema.pre("remove", function(next) {
    this.model("AccidentCase").deleteMany({ vehicle: this._id }, next);
});

const Vehicle = mongoose.model<IVehicle>("Vehicle", vehicleSchema);

export default Vehicle;
