import { Request, Response, Router } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import {
    BAD_REQUEST,
    CREATED,
    INTERNAL_SERVER_ERROR,
    OK
} from "http-status-codes";
import models from "src/models";
import { MongooseFilterQuery } from "mongoose";
import { IAccidentCase } from "src/models/AccidentCase";
import { paramMissingError } from "@shared/constants";

const router = Router();

router.get("/all", async (req: Request, res: Response) => {
    const accidentCaseListPromise = models.AccidentCase.find();
    try {
        const accidentCaseList = await accidentCaseListPromise;
        return res.status(OK).json(accidentCaseList);
    } catch {
        return res.status(INTERNAL_SERVER_ERROR);
    }
});

router.get("/new", async (req: Request, res: Response) => {
    let query: MongooseFilterQuery<IAccidentCase> = { accidentStatus: "new" };
    const accidentCaseListPromise = models.AccidentCase.find(query);
    try {
        const accidentCaseList = await accidentCaseListPromise;

        let extendedAccidentCaseList = accidentCaseList.map(async item => {
            let vehicle = await models.Vehicle.findById(item.vehicle);
            let newItem = {
                vehicle: item.vehicle,
                numberPlate: vehicle?.numberPlate,
                accidentStatus: item.accidentStatus,
                latitude: item.latitude,
                longitude: item.longitude,
                timeStamp: item.timeStamp,
                locationRecord: item.locationRecord,
                speedRecord: item.speedRecord,
                imageDetectionReason: item.imageDetectionReason,
                accelerometer: item.accelerometerRecord
            }
            return newItem;
        });

        let result = await Promise.all(extendedAccidentCaseList);
        console.log(result);
        return res.status(OK).json(result);
    } catch {
        return res.status(INTERNAL_SERVER_ERROR);
    }
});

router.put("/update", async (req: Request, res: Response) => {
    const { accidentCase } = req.body;
    if (!accidentCase) {
        return res.status(BAD_REQUEST).json({
            error: paramMissingError
        });
    }
    const updatePromise = models.AccidentCase.findByIdAndUpdate(
        (accidentCase as IAccidentCase)._id,
        accidentCase as IAccidentCase
    );
    try {
        const updated = await updatePromise;
        return res.status(OK).end();
    } catch {
        return res.status(INTERNAL_SERVER_ERROR);
    }
});

router.delete("/delete/:id", async (req: Request, res: Response) => {
    const { id } = req.params as ParamsDictionary;
    const deletePromise = models.AccidentCase.findByIdAndDelete();
    try {
        const deletedResult = await deletePromise;
        return res.status(OK).end();
    } catch {
        return res.status(INTERNAL_SERVER_ERROR);
    }
});

export default router;
