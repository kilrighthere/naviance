import axios from "axios";

export const predictSpendingPattern = async (featureVector) => {
    try {
        const response = await axios.post(
            `${process.env.ML_SERVICE_URL}/predict`,
            {
                features: featureVector
            }
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
};