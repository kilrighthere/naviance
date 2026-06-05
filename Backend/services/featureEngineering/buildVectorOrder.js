import { FEATURE_ORDER } from "./featureSchema.js";

export const buildFeatureVector = (featureObject) => {

    const featureVector = FEATURE_ORDER.map(
        feature => featureObject[feature] ?? 0
    );

    if (featureVector.length !== 47) {
        throw new Error(
            `Expected 47 features, got ${featureVector.length}`
        );
    }

    return featureVector;
};