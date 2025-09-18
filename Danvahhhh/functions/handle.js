// functions/handle.js
exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ success: false, message: "Method Not Allowed" }),
        };
    }

    try {
        // Parse the request body
        const data = JSON.parse(event.body);
        const action = data.action;

        // Handle different actions
        switch (action) {
            case "login":
                return handleLogin(data);
            case "register":
                return handleRegister(data);
            case "purchase":
                return handlePurchase(data);
            default:
                return {
                    statusCode: 400,
                    body: JSON.stringify({ success: false, message: "Invalid action" }),
                };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: error.message }),
        };
    }
};

// Mock user database
const users = [
    {
        id: 1,
        full_name: "Test User",
        email: "test@example.com",
        phone: "1234567890",
        password: "5f4dcc3b5aa765d61d8327deb882cf99", // MD5 of 'password'
    },
];

// Mock functions
async function handleLogin(data) {
    const { email, password } = data;

    if (!email || !password) {
        return {
            statusCode: 400,
            body: JSON.stringify({ success: false, message: "Email and password are required" }),
        };
    }

    // In a real app, you'd use a proper hashing library
    const hashedPassword = password; // Simplified for demo

    const user = users.find(u => u.email === email);

    if (user) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: "Login successful",
                user: user.full_name,
                user_id: user.id,
            }),
        };
    } else {
        return {
            statusCode: 401,
            body: JSON.stringify({ success: false, message: "Invalid email or password" }),
        };
    }
}

async function handleRegister(data) {
    // Implementation similar to the mock API
    return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: "Registration successful" }),
    };
}

async function handlePurchase(data) {
    // Implementation similar to the mock API
    const policyNumber = 'DI' + new Date().getFullYear() +
        String(Math.floor(Math.random() * 99999)).padStart(5, '0');

    return {
        statusCode: 200,
        body: JSON.stringify({
            success: true,
            message: "Purchase successful",
            policyNumber: policyNumber,
        }),
    };
}
