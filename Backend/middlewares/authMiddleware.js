import { supabase } from "../config/supabaseClient.js"
// TODO: Read Bearer token from Authorization header.
export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || "";
        const [bearer, token] = authHeader.split(" ");

        if (bearer?.toLowerCase() !== "bearer" || !token) {
            return res.status(401).json({message: "Missing or invalid token"});
        }

        // TODO: Validate token with Supabase Auth and fetch user info.
        const { data, error } = await supabase.auth.getUser(token);
        // TODO: Reject requests without valid token (401).
        if(error || !data?.user){
            return res.status(401).json({message: "Invalid or expired token"});
        }

        // TODO: Attach user info to req.user (id, email).
        req.user = {
            id: data.user.id,
            email: data.user.email
        };
        req.accessToken = token;
        return next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Auth middleware error"});
    }
}
