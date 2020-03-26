import { Router } from "express";
import UserRouter from "./Users";
import VehicleRouter from "./Vehicles";
import AccidentCaseRouter from "./AccidentCases";

// Init router and path
const router = Router();

// Add sub-routes
router.use("/users", UserRouter);
router.use("/vehicles", VehicleRouter);
router.use("/accidentCases", AccidentCaseRouter);

// Export the base-router
export default router;
