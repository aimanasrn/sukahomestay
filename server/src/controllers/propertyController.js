import {
  getAllProperties,
  getHomestayProperty,
  getRoomstayProperty,
} from "../services/propertyService.js";

export async function getProperties(_req, res, next) {
  try {
    const properties = await getAllProperties();
    res.json({ properties });
  } catch (error) {
    next(error);
  }
}

export async function getHomestay(_req, res, next) {
  try {
    const property = await getHomestayProperty();
    res.json({ property });
  } catch (error) {
    next(error);
  }
}

export async function getRoomstay(_req, res, next) {
  try {
    const property = await getRoomstayProperty();
    res.json({ property });
  } catch (error) {
    next(error);
  }
}
