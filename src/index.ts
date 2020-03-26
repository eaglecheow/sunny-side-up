import "./LoadEnv"; // Must be the first import
import app from "@server";
import logger from "@shared/Logger";
import { connectDb } from "./models";
import "./TcpScript";

// Start the server
const port = Number(process.env.PORT || 3000);

connectDb().then(async () => {
    app.listen(port, () => {
        logger.info("Express server started on port: " + port);
    });
});
