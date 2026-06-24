import { getAdminProfile, loginAdmin } from "../services/authService.js";

export async function postAdminLogin(req, res, next) {
  try {
    const session = await loginAdmin(req.body);
    res.json(session);
  } catch (error) {
    next(error);
  }
}

export async function getAdminMe(req, res, next) {
  try {
    const user = await getAdminProfile(req.user.id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
}
