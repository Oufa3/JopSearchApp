
export const successResponse = ({ res, message = "Done", status = 200, data = {} }) => {
    res.status(status).json({ message, data: { ...data } });
}