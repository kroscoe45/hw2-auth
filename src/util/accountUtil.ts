import db from "../database";
import exp from "node:constants";


/**
 * Check if a username is valid for registration
 * @param username
 * @returns {Promise<{errors: string[], statusCode: number}>}
 */
const checkUsername = async (username: string): Promise<{ errors: string[], statusCode: number }> => {
    const rules = [
        // make sure username is not empty
        {
            condition: (value: string) => value.length === 0,
            errorMessage: "Missing required field : username",
            statusCode: 400,
        },
        // check for duplicate in db (case-insensitive)
        {
            condition: async (value: string) => {
                return await new Promise<boolean>((resolve, reject) => {
                    db.get(
                        'SELECT COUNT(*) as count FROM accounts WHERE username = ? COLLATE NOCASE',
                        [value],
                        (err, row: { count: number }) => {
                            if (err) return reject(err);
                            resolve(row.count > 0);
                        }
                    );
                });
            },
            errorMessage: "Username already exists",
            statusCode: 409,
        },
        // check for length
        {
            condition: (value: string) => value.length < 3,
            errorMessage: "Username is too short",
            statusCode: 400,
        },
        // check for invalid characters
        {
            condition: (value: string) => !/^[a-zA-Z0-9_]*$/.test(value),
            errorMessage: "Username contains invalid characters",
            statusCode: 400,
        },
    ];
    const errors = (await Promise.all(rules.map(async ({condition, errorMessage, statusCode}) =>
        (await condition(username)) ? {errorMessage, statusCode} : null
    ))).filter((error) => error) as { errorMessage: string, statusCode: number }[];
    return {
        errors: errors.map(error => error.errorMessage),
        statusCode: errors[0]?.statusCode || 200,
    };
};

/**
 * Check if a password is valid for registration
 * @param password
 * @returns {Promise<{errors: string[], statusCode: number}>}
 */
const checkPassword = (password: string): { errors: string[], statusCode: number } => {
    const rules = [
        // make sure password is not empty
        {
            condition: (value: string) => value.length === 0,
            errorMessage: "Missing required field : password",
            statusCode: 400,
        },
        // check for length
        {
            condition: (value: string) => value.length < 8,
            errorMessage: "Password is too short",
            statusCode: 400
        },
        // check for uppercase
        {
            condition: (value: string) => !/[A-Z]/.test(value),
            errorMessage: "Password must contain at least one uppercase letter",
            statusCode: 400
        },
        // check for lowercase
        {
            condition: (value: string) => !/[a-z]/.test(value),
            errorMessage: "Password must contain at least one lowercase letter",
            statusCode: 400
        },
        // check for number
        {
            condition: (value: string) => !/\d/.test(value),
            errorMessage: "Password must contain at least one number",
            statusCode: 400
        },
    ];
    const errors = rules
        .filter(({condition}) => condition(password))
        .map(({errorMessage, statusCode}) => ({errorMessage, statusCode}));
    return {
        errors: errors.map(error => error.errorMessage),
        statusCode: errors[0]?.statusCode || 200,
    };
};

const registrationPrecheck = async (username: string, password: string) => {
    const {errors: usernameErrors, statusCode: usernameStatusCode} = await checkUsername(username);
    const {errors: passwordErrors, statusCode: passwordStatusCode} = checkPassword(password);
    return {
        usernameErrors,
        passwordErrors,
        statusCode: usernameStatusCode || passwordStatusCode || 200,
        canRegister() { return usernameStatusCode === 200 && passwordStatusCode === 200 }
    };
}

export { registrationPrecheck };