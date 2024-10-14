const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const authorize = (roleId = []) => {
  return (req, res, next) => {
    console.log("User Role ID:", req.user.roleId); // Thêm log để kiểm tra
    console.log("Allowed Roles:", roleId);

    // Kiểm tra nếu vai trò của người dùng nằm trong danh sách roles được cho phép
    if (!roleId.includes(req.user.roleId)) {
      return res.sendStatus(403); // Forbidden
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorize,
};
