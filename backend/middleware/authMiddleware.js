module.exports = (req, res, next) => {
  console.log('Is Authenticated:', req.isAuthenticated());
  console.log('User:', req.user);
  if (req.isAuthenticated()) {
    // If the user is authenticated, proceed to the next middleware or route
    return next();
  } else {
    // If not authenticated, return an error response
    return res.status(401).json({ message: "You must be logged in to access this resource" });
  }
};