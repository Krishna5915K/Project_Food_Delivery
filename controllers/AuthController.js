const AuthService = require('../services/AuthService');

class AuthController {
  async register(req, res, next) {
    try {
      const user = await AuthService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await AuthService.login(email, password);

      // Set cookie options
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax'
      };

      res.cookie('accessToken', accessToken, {
        ...cookieOptions,
        expires: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
      });

      res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: { user, accessToken, refreshToken }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  async refresh(req, res, next) {
    try {
      const refreshTokenStr = req.body.refreshToken || req.cookies.refreshToken;
      if (!refreshTokenStr) {
        return res.status(400).json({ success: false, message: 'Refresh token is required' });
      }

      const { accessToken, refreshToken } = await AuthService.refreshTokens(refreshTokenStr);

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax'
      };

      res.cookie('accessToken', accessToken, {
        ...cookieOptions,
        expires: new Date(Date.now() + 15 * 60 * 1000)
      });

      res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      res.status(200).json({
        success: true,
        data: { accessToken, refreshToken }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }
}
module.exports = new AuthController();
