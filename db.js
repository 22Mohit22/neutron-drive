const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createUser(username, password) {
    try {
        const user = prisma.user.create({
            data: {
                username: username,
                password: password
            }
        })
        return user;
    } catch (err) {
        console.log('Error in creating user: ', err);
        return 'Username exist';
    }
}

async function checkUser(username) {
    try {
        const user = prisma.user.findUnique({
            where: {
                username: username,
            },
            include: {
                files: false,
                folders: false,
            }
        })
        if (user) return true;
    } catch (err) {
        console.log('Error checking username: ', err);
        return err;
    }

}

async function getUser(username) {
    try {
        const user = prisma.user.findUnique({
            where: {
                username: username
            },
            include: {
                folders: true,
                files: true,
            }
        })
        return user;
    } catch (err) {
        console.log(err);
        return err;
    }

}

module.exports = {
    createUser,
    getUser,
    checkUser,
}