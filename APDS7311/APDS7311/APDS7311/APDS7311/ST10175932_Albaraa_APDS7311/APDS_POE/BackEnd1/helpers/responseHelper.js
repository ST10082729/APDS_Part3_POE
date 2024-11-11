export const responseHelper = (res, statusCode, message, data = null) => {
    res.status(statusCode).json({ message, data });
};
