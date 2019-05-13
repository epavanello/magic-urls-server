import BaseController from './base.controller';
import User from '../models/user';

class AuthController extends BaseController {
  login = async (req, res, next) => {
    const { username, password } = req.body;

    try {
      const user = await User.findOne({ username });

      if (!user || !user.authenticate(password)) {
        const err = new Error('Please verify your credentials.');
        err.status = 401;
        return next(err);
      }

      const token = user.generateToken();
      return res.status(200).json({ token });
    } catch (err) {
      next(err);
    }
  }
  signup = async (req, res, next) => {
    const { email, username, password, cpassword } = req.body;

    if (password != cpassword) {
      const err = new Error('Passwords are different.');
      err.status = 400;
      return next(err);
    }

    let newUser = new User({
      email,
      username,
      password,
      provider: 'local',
    });

    try {
      await newUser.save();
      return res.status(200).json({ id: newUser._id });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  }
}

export default new AuthController();
