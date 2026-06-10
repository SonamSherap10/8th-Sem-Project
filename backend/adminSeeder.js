const bcrypt = require('bcrypt');

const adminSeeder = async (User) => {
    try {
        const adminExists = await User.findOne({
            where: { email: "admin@gmail.com" }
        });

        if (!adminExists) {
            await User.create({
                name: "Admin",
                email: "admin@gmail.com",
                password_hash: await bcrypt.hash("admin123", 10),
                role: "admin"
            });
            console.log("Admin Seeded Successfully")
            return;
        }
            console.log("Admin is already Seeded")

    } catch (error) { 
        console.error("Error seeding admin:", error);
    }
};

module.exports = adminSeeder;  