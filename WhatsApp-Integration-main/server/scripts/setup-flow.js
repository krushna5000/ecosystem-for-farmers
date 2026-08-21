import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import { ADD_FARM_FLOW_JSON_STRING } from "../src/config/flowJson.js";
import fs from "fs";

const WABA_ID = process.env.WABA_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;
const EXISTING_FLOW_ID = "1718231966205876";

async function updateFlow() {
    try {
        console.log("Updating existing Flow with fixed JSON version...");

        // Update the flow JSON
        const response = await axios.post(
            `https://graph.facebook.com/v21.0/${EXISTING_FLOW_ID}/assets`,
            {
                name: "flow.json",
                asset_type: "FLOW_JSON",
                file: ADD_FARM_FLOW_JSON_STRING,
            },
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );

        fs.writeFileSync("flow_result.txt", `UPDATE SUCCESS: ${JSON.stringify(response.data, null, 2)}\n`);
        console.log("Update result:", JSON.stringify(response.data));

    } catch (err) {
        const errData = err.response?.data || err.message;
        console.log("Update error:", JSON.stringify(errData));

        // If update fails, try deleting and creating a new one
        console.log("Trying to delete old flow and create a new one...");
        try {
            await axios.delete(`https://graph.facebook.com/v21.0/${EXISTING_FLOW_ID}`, {
                headers: { Authorization: `Bearer ${TOKEN}` },
            });
            console.log("Old flow deleted.");

            const createResponse = await axios.post(
                `https://graph.facebook.com/v21.0/${WABA_ID}/flows`,
                {
                    name: "FarmsEasy - Add Farm",
                    categories: ["OTHER"],
                    flow_json: ADD_FARM_FLOW_JSON_STRING,
                },
                {
                    headers: {
                        Authorization: `Bearer ${TOKEN}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const flowId = createResponse.data.id;
            fs.writeFileSync("flow_result.txt", `NEW FLOW CREATED: ADD_FARM_FLOW_ID=${flowId}\n`);
            console.log("New flow created! ID:", flowId);

        } catch (err2) {
            const errData2 = err2.response?.data || err2.message;
            fs.writeFileSync("flow_result.txt", `ALL FAILED:\nUpdate: ${JSON.stringify(errData)}\nCreate: ${JSON.stringify(errData2)}\n`);
            console.log("Create also failed:", JSON.stringify(errData2));
        }
    }
    process.exit(0);
}

updateFlow();
