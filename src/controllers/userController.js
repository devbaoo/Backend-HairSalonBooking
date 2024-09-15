import userService from "../services/userService";

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: User login
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               address:
 *                 type: string
 *               gender:
 *                 type: string
 *               roleId:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               positionId:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */

let handleLogin = async (req, res) => {
  try {
    let data = await userService.handleUserLogin(req.body);
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errCode: 1,
      message: "Internal Server Error",
    });
  }
};
let handleRegister = async (req, res) => {
  try {
    let data = await userService.handleRegister(req.body);
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  handleLogin: handleLogin,
  handleRegister: handleRegister,
};
