const User=require('../model/userModel');
const sendEmail = require('../utils/mailer');
const passport = require('passport');
const crypto = require('crypto');

module.exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }

    const verificationToken=crypto.randomBytes(32).toString('hex');
    const registeredUser = await User.register({ email, username,verificationToken,verified:false }, password);

    const verificationLink= `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendEmail(
        email,
        'Verify your email',
        `Please click the link to verify your email: ${verificationLink}`,
    )

    res
      .status(201)
      .json({ message: "User registered successfully. Please verify your email", user: registeredUser });
  } catch (err) {
    return res.status(500).json({ message: "An error occurred during signup" });
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username && !email) {
      return res.status(400).json({ message: 'Username or email is required' });
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    passport.authenticate('local', (err, authenticatedUser, info) => {
      if (err) {
        console.error('Error during authentication:', err);
        return res.status(500).json({ message: 'An error occurred during login' });
      }

      if (!authenticatedUser) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      req.logIn(authenticatedUser, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Login failed' });
        }

        const mssg = authenticatedUser.verified
          ? 'Login successful'
          : 'Please verify your email';

          console.log("Authenticated User:", authenticatedUser);
        return res.status(200).json({ message: mssg, user: authenticatedUser });
      });
    })(req, res, next);
  } catch (err) {
    console.error("Error in login route:", err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports.logout=async(req,res)=>{
    try{
        req.logout((err) => {
            if (err) {
                return next(err);
            }
            req.session.destroy(() => {
                res.clearCookie('connect.sid');
                res.status(200).json({ message: 'Logged out successfully' });
            });
        });
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports.verifyEmail=async(req,res)=>{
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(400).json({ message: 'Verification token is required' });
        }
        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(404).json({ message: 'Invalid or expired verification token' });
        }
        user.verified = true;
        user.verificationToken = null; // Clear the token after verification
        await user.save();
        res.status(200).json({ message: 'Email verified successfully' });
    } catch (err) {
        console.error('Error verifying email:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}