// src/routes/devices.js
let lightStatus = "OFF";
const toggleLight = () => {
    lightStatus = lightStatus === "OFF" ? "ON" : "OFF";
    return `Light is now ${lightStatus}`;
};
module.exports = { toggleLight };
