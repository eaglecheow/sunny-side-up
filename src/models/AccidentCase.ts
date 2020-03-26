import mongoose, { Schema } from "mongoose";
import { IVehicle } from "./Vehicle";

export interface IAccidentCase extends mongoose.Document {
    vehicle: IVehicle["_id"];
    accidentStatus: "new" | "in-progress" | "resolved";
    latitude: number;
    longitude: number;
    timeStamp: number;
    locationRecord: {
        latitude: number;
        longitude: number;
    }[];
    speedRecord: number[];
    imageDetectionReason: "eyelid" | "movement" | "both";
    accelerometerRecord: number[];
}

const accidentCaseSchema = new mongoose.Schema({
    vehicle: {
        type: Schema.Types.ObjectId,
        required: true
    },
    accidentStatus: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    timeStamp: {
        type: Number,
        required: true
    },
    locationRecord: {
        type: [
            {
                latitude: { type: Number, required: true },
                longitude: { type: Number, required: true }
            }
        ],
        required: true
    },
    speedRecord: {
        type: [Number],
        required: true
    },
    imageDetectionReason: {
        type: String,
        required: true
    },
    accelerometerRecord: {
        type: [Number],
        required: true
    }
});

const AccidentCase = mongoose.model<IAccidentCase>(
    "AccidentCase",
    accidentCaseSchema
);

export default AccidentCase;
