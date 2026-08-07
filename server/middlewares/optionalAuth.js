import jwt from "jsonwebtoken";

const optionalAuth = (request, _response, next) => {
  const token =
    request?.headers?.authorization?.split(" ")[1] ||
    request.cookies?.accessToken;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
    request.userId = decoded?.id;
  } catch {
    request.userId = null;
  }
  return next();
};

export default optionalAuth;
