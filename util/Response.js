
module.exports = {
    success: (message_) => {
        return {
            status: 200,
            body: message_
        };
    },
    error: (message_, status_) => {
        return {
            status: status_ || 401,
            body: message_
        };
    }
};