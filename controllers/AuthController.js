const User = require('../models/User');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

class AuthController {

  async register(req, res) {
    res.render("register", { title: "Create Account" });
  }

  async login(req, res) {
    res.render("login", { title: "Sign In" });
  }

  async resetPasswordView(req, res) {
    const token = req.query.token || "";
    res.render("reset-password", { token, title: "Reset Password" });
  }

  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;
      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

      const user = await User.findOne({
        verificationToken: hashedToken,
        verificationExpiry: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Verification token is invalid or has expired."
        });
      }

      user.password = password;
      user.verificationToken = undefined;
      user.verificationExpiry = undefined;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Password reset successful"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async Userforgot(req, res, next) {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      // Generate a verification token for reset password purposes
      const resetToken = user.getverificationToken();
      await user.save();

      // Return token in response for local/testing convenience
      return res.status(200).json({
        success: true,
        message: "Reset token generated successfully",
        resetToken
      });
    } catch (error) {
      next(error);
    }
  }

  async registered(req, res, next) {
    try {
      const { name, email, phone, password, role } = req.body;
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(401).json({
          success: false,
          message: "Email already registered. Try logging in."
        });
      }

      // Check if phone already exists
      if (phone) {
        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
          return res.status(401).json({
            success: false,
            message: "Phone number already registered."
          });
        }
      }

      let newUser = await User.create({
        name,
        email,
        phone,
        password,
        role: role || 'customer'
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: newUser
      });

    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const hashedToken = crypto.createHash("sha256").update(req.params.verifyToken).digest("hex");
      const user = await User.findOne({
        verificationToken: hashedToken,
        verificationExpiry: { $gt: Date.now() },
      });
      if (!user) {
        return res.status(400).json({
          message: "Invalid or expired token"
        });
      }

      user.isEmailVerified = true;
      user.verificationToken = undefined;
      user.verificationExpiry = undefined;
      await user.save();
      res.json({
        message: "Email verified successfully",
      });

    } catch (error) {
      next(error);
    }
  }

  async logedin(req, res, next) {
    try {
      const { email, password } = req.body;
      const isExist = await User.findOne({ email }).select('+password');
      
      if (!isExist) {
        return res.status(401).json({
          success: false,
          message: "Email not found. Please register.",
        });
      }
      
      const result = await isExist.comparePassword(password);

      if (result) {
        const token = isExist.getToken();
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.status(200).json({
          success: true,
          message: "Login success",
          token,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Invalid Credentials",
        });
      }

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async dashboard(req, res) {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.redirect('/login');
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        res.clearCookie('token');
        return res.redirect('/login');
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        res.clearCookie('token');
        return res.redirect('/login');
      }

      res.render("dashboard", { user, title: "Dashboard" });
    } catch (error) {
      res.redirect('/login');
    }
  }

  async logout(req, res) {
    res.clearCookie('token');
    res.redirect('/login');
  }
}

module.exports = new AuthController();
