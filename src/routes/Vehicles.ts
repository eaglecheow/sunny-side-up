import { Request, Response, Router } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import {
    BAD_REQUEST,
    CREATED,
    INTERNAL_SERVER_ERROR,
    OK
} from "http-status-codes";
import models from "src/models";

const router = Router();

router.get("/all", async (req: Request, res: Response) => {
    const vehiclesPromise = models.Vehicle.find();
    try {
        const vehicleList = await vehiclesPromise;
        return res.status(OK).json(vehicleList);
    } catch {
        return res.status(INTERNAL_SERVER_ERROR);
    }
});

router.get("/:id", async (req: Request, res: Response) => {
    const { id } = req.params as ParamsDictionary;
    const vehiclePromise = models.Vehicle.findById(id);
    try {
        const vehicle = await vehiclePromise;
        return res.status(OK).json(vehicle);
    } catch {
        return res.status(INTERNAL_SERVER_ERROR);
    }
});

export default router;
