export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
};

export const AUTH_MESSAGES = {
    REGISTER_SUCCESS: "User registered successfully!",
    REGISTER_ERROR: "Failed to register user.",
    USER_ALREADY_REGISTERED_ERROR: "User is already registered. Kindly Login!",
    USER_NOT_FOUND_ERROR: "User not registered",
    LOGIN_SUCCESS: "User logged in successfully.",
    WRONG_PASSWORD: "Wrong password",
    INVALID_CREDENTIALS: "Invalid Email or Password.",
    SERVER_ERROR: "An unexpected error occurred while processing your request.",
};

export const BOOK_MESSAGES = {
    FETCH_SUCCESS: "Books fetched successfully.",
    FETCH_ERROR: "Failed to fetch books.",
};
