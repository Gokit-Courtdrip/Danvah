// mock-api.js
class MockAPI {
    constructor() {
        // In-memory database
        this.users = [
            {
                id: 1,
                full_name: "Test User",
                email: "test@example.com",
                phone: "1234567890",
                password: "5f4dcc3b5aa765d61d8327deb882cf99" // MD5 of 'password'
            }
        ];
        this.policies = [];
        this.policyDetails = [];
        this.nextUserId = 2;
        this.nextPolicyId = 1;
    }

    handleRequest(action, data) {
        switch (action) {
            case 'login':
                return this.login(data);
            case 'register':
                return this.register(data);
            case 'purchase':
                return this.purchase(data);
            case 'test':
                return { success: true, message: 'AJAX connection successful' };
            default:
                return { success: false, message: 'Invalid action: ' + action };
        }
    }

    login(data) {
        const { email, password } = data;

        if (!email || !password) {
            return { success: false, message: 'Email and password are required' };
        }

        // Simple MD5 hash simulation for demo purposes
        const hashedPassword = this.md5(password);

        const user = this.users.find(u => u.email === email && u.password === hashedPassword);

        if (user) {
            return {
                success: true,
                message: 'Login successful',
                user: user.full_name,
                user_id: user.id
            };
        } else {
            return { success: false, message: 'Invalid email or password' };
        }
    }

    register(data) {
        const { fullName, email, phone, password } = data;

        if (!fullName || !email || !phone || !password) {
            return { success: false, message: 'All fields are required' };
        }

        // Password validation
        if (password.length < 8) {
            return { success: false, message: 'Password must be at least 8 characters long' };
        }

        // Check for password complexity
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

        if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars)) {
            return { success: false, message: 'Password must contain uppercase, lowercase, numbers, and special characters' };
        }

        // Check if email already exists
        if (this.users.some(u => u.email === email)) {
            return { success: false, message: 'Email already registered' };
        }

        // Add new user
        const newUser = {
            id: this.nextUserId++,
            full_name: fullName,
            email: email,
            phone: phone,
            password: this.md5(password)
        };

        this.users.push(newUser);

        return { success: true, message: 'Registration successful' };
    }

    purchase(data) {
        const { insuranceType, tier, price, fullName, email, phone, address, paymentMethod } = data;

        if (!insuranceType || !tier || !price || !fullName || !email) {
            return { success: false, message: 'Required fields are missing' };
        }

        // Generate policy number
        const policyNumber = 'DI' + new Date().getFullYear() +
            String(Math.floor(Math.random() * 99999)).padStart(5, '0');

        // Check if user exists, if not create them
        let userId;
        const existingUser = this.users.find(u => u.email === email);

        if (!existingUser) {
            // Create new user
            const newUser = {
                id: this.nextUserId++,
                full_name: fullName,
                email: email,
                phone: phone,
                password: this.md5('defaultpass')
            };

            this.users.push(newUser);
            userId = newUser.id;
        } else {
            userId = existingUser.id;
        }

        // Create policy
        const startDate = new Date().toISOString().split('T')[0];
        const endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
            .toISOString().split('T')[0];

        const policy = {
            id: this.nextPolicyId++,
            user_id: userId,
            policy_number: policyNumber,
            insurance_type: insuranceType,
            insurance_tier: tier,
            price: price,
            status: 'active',
            start_date: startDate,
            end_date: endDate,
            created_at: new Date().toISOString()
        };

        this.policies.push(policy);

        // Add policy details
        const details = [
            { policy_id: policy.id, field_name: 'customer_address', field_value: address },
            { policy_id: policy.id, field_name: 'payment_method', field_value: paymentMethod },
            { policy_id: policy.id, field_name: 'purchase_date', field_value: new Date().toISOString() }
        ];

        this.policyDetails.push(...details);

        return {
            success: true,
            message: 'Purchase successful',
            policyNumber: policyNumber
        };
    }

    // Simple MD5 simulation for demo purposes
    md5(string) {
        // This is NOT a real MD5 implementation, just a simple hash for demo
        // In a real app, you'd use a proper crypto library
        let hash = 0;
        for (let i = 0; i < string.length; i++) {
            const char = string.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(16);
    }
}

// Create a global instance
const mockAPI = new MockAPI();
