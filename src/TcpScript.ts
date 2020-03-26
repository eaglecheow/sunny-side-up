import net from "net";
import models from "./models";
import { MongooseFilterQuery } from "mongoose";
import { IVehicle } from "./models/Vehicle";
import twilio from "twilio";

const HOST = "127.0.0.1";
const PORT = 8181;

const tcpServer = net
    .createServer(socket => {
        socket.on("data", data => {
            let stringData = data.toString();
            if (stringData.indexOf("AD ->") > -1) {
                stringData = stringData.replace("AD ->", "");
                let protocolArray = stringData.split("|");

                console.log(protocolArray);

                let phoneNumber = protocolArray[0].replace(" ", "");
                let sensorProtocol = protocolArray[1];
                let locationProtocol = protocolArray[2];
                let cameraProtocol = protocolArray[3];

                models.Vehicle.findOne(
                    { phoneNumber: phoneNumber },
                    (err, vehicle) => {
                        if (err || vehicle === null) {
                            console.log(err);
                            console.log(vehicle);
                            console.error(
                                `Unable to find vehicle with phone number ${phoneNumber}`
                            );
                        } else {
                            // Location Protocol
                            locationProtocol = locationProtocol.replace(
                                "GPS:TRUE",
                                ""
                            );
                            let locationStringDataList = locationProtocol.split(
                                ";"
                            );
                            locationStringDataList.shift();
                            locationStringDataList.pop();

                            let coordinateList: {
                                latitude: number;
                                longitude: number;
                            }[] = [];
                            let speedList: number[] = [];

                            locationStringDataList.forEach(locationData => {
                                let locationDataArray = locationData.split(",");
                                const latitude = Number.parseFloat(
                                    locationDataArray[0]
                                );
                                const longitude = Number.parseFloat(
                                    locationDataArray[1]
                                );
                                const speed = Number.parseFloat(
                                    locationDataArray[2]
                                );

                                coordinateList.push({ latitude, longitude });
                                speedList.push(speed);
                            });

                            // Sensor Protocol
                            sensorProtocol = sensorProtocol.replace(
                                "SENSOR:TRUE",
                                ""
                            );
                            let sensorStringDataList = sensorProtocol.split(
                                ";"
                            );
                            sensorStringDataList.shift();
                            sensorStringDataList.pop();
                            let sensorDataList = sensorStringDataList.map(
                                data => Number.parseFloat(data)
                            );

                            let accidentCase = new models.AccidentCase();
                            accidentCase.vehicle = vehicle._id;
                            accidentCase.accidentStatus = "new";

                            accidentCase.speedRecord = speedList;
                            accidentCase.locationRecord = coordinateList;
                            accidentCase.accelerometerRecord = sensorDataList;
                            accidentCase.latitude =
                                coordinateList[
                                    coordinateList.length - 1
                                ].latitude;
                            accidentCase.longitude =
                                coordinateList[
                                    coordinateList.length - 1
                                ].longitude;
                            accidentCase.imageDetectionReason =
                                cameraProtocol.includes("EYELID") &&
                                cameraProtocol.includes("MOVEMENT")
                                    ? "both"
                                    : cameraProtocol.includes("EYELID")
                                    ? "eyelid"
                                    : "movement";
                            accidentCase.timeStamp = Date.now();

                            accidentCase.save(err => {
                                if (err) {
                                    console.error(err);
                                }
                            });

                            // Twilio Call
                            let numberPlateMessage = vehicle.numberPlate
                                .split("")
                                .join(" ");
                            let latitudeMessage = accidentCase.latitude;
                            let longitudeMessage = accidentCase.longitude;
                            let timeMessage = `${
                                new Date(accidentCase.timeStamp).getHours() -
                                    12 >
                                0
                                    ? new Date(
                                          accidentCase.timeStamp
                                      ).getHours() - 12
                                    : new Date(
                                          accidentCase.timeStamp
                                      ).getHours()
                            }.${new Date(accidentCase.timeStamp).getMinutes()}${
                                new Date(accidentCase.timeStamp).getHours() -
                                    12 >
                                0
                                    ? "p.m."
                                    : "a.m."
                            }`;
                            let accidentMessage = `Vehicle ${numberPlateMessage} had an accident in latitude ${latitudeMessage}, longitude ${longitudeMessage} at ${timeMessage}`;

                            let twilioMessage = `
                            <Response>
                                <Say>This is a computer generated accident report.</Say>
                                <Pause length="1" />
                                <Say>${accidentMessage}</Say>
                                <Pause length="1" />
                                <Say>${accidentMessage}</Say>
                            </Response>
                            `;

                            const twilioSID = process.env.TWILIO_SID;
                            const twilioAuthToken =
                                process.env.TWILIO_AUTHTOKEN;
                            const twilioItem = twilio(
                                twilioSID,
                                twilioAuthToken
                            );
                            twilioItem.calls
                                .create({
                                    twiml: twilioMessage,
                                    to: phoneNumber,
                                    from: process.env.TWILIO_PHONENUMBER || ""
                                })
                                .then(call => {
                                    console.log(
                                        "A call has been made to " + call.to
                                    );
                                })
                                .catch(err => {
                                    console.log(err);
                                });
                        }
                    }
                );
            }
        });
    })
    .listen(PORT, HOST);

console.log("TCP Server listening on " + HOST + ":" + PORT);

export default tcpServer;
