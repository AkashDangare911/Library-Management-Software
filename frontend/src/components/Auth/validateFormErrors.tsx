export const handleErrors = (userEmail: string, password: string, userName: string) => {
    if (!userEmail) {
        return "Please enter your email";
    }
    if (!password) {
        return "Please enter your password";
    }
    if (!userName) {
        return "Please enter your full name";
    }
    return "";
}
