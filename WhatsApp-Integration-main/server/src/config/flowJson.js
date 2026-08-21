// WhatsApp Flow JSON for "Add Farm" form
// This creates a single-screen form that collects all farm details at once

export const ADD_FARM_FLOW_JSON = {
    version: "6.3",
    screens: [
        {
            id: "ADD_FARM_SCREEN",
            title: "Add Farm",
            terminal: true,
            success: true,
            layout: {
                type: "SingleColumnLayout",
                children: [
                    {
                        type: "TextHeading",
                        text: "Register Your Farm"
                    },
                    {
                        type: "TextBody",
                        text: "Please fill in the details below to register your farm."
                    },
                    {
                        type: "TextInput",
                        label: "Farm Name",
                        name: "farm_name",
                        required: true,
                        "input-type": "text",
                        "helper-text": "Enter your farm name (min 2 characters)"
                    },
                    {
                        type: "TextInput",
                        label: "Pincode (6 digits)",
                        name: "pincode",
                        required: true,
                        "input-type": "number",
                        "min-chars": 6,
                        "max-chars": 6,
                        "helper-text": "Enter your 6-digit pincode"
                    },
                    {
                        type: "TextInput",
                        label: "Farm Area (in Acres)",
                        name: "area_acres",
                        required: true,
                        "input-type": "number",
                        "helper-text": "Max 24.7 acres / 10 hectares"
                    },
                    {
                        type: "TextBody",
                        text: "📍 Location: After submitting, you'll be asked to share your farm location."
                    },
                    {
                        type: "Footer",
                        label: "Submit Farm Details",
                        "on-click-action": {
                            name: "complete",
                            payload: {
                                farm_name: "${form.farm_name}",
                                pincode: "${form.pincode}",
                                area_acres: "${form.area_acres}"
                            }
                        }
                    }
                ]
            }
        }
    ]
};

// Stringified version for API calls
export const ADD_FARM_FLOW_JSON_STRING = JSON.stringify(ADD_FARM_FLOW_JSON);
