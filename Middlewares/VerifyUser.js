const jwt = require("jsonwebtoken");

const verifyUser = async (req, res, next) => {
    console.log("Verifying User")

  try {
    // 1. Get the Authorization token from the request headers
    const token = req.headers["authorization"];

    // 2. Check if the token exists
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }


    // 4. Verify the token using jwt.verify()
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }
      console.log("Decoded User",decoded)

      // 5. Attach decoded user data to the request object
      req.user = decoded;

      // 6. Proceed to the next middleware or route handler
      next();
    });
  } catch (error) {
    // Handle server errors
    console.error("Error verifying token:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = verifyUser;
