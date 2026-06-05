import axios from "axios";

export const adaptivePlanningService = async (bodyPayload) => {
    try {
        const response = await axios.post(
            process.env.FORECAST_API_URL,
            bodyPayload
        );

        return {
            data: response.data,
            error: null
        };
    } catch (error) {
        return {
            data: null,
            error: error.response?.data || error.message
        };
    }
}