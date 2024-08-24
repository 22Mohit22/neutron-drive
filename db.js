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

async function createRoot(user) {

    const rootFolder = await prisma.folder.create({
        data: {
            name: 'root',
            user: {
                connect: {
                    id: user.id,
                }
            }
        }
    })

    return rootFolder;
}

async function createFolder(name, userId, parentId) {
    
    try {
        const folder = await prisma.folder.create({
            data: {
                name: name,
                parentId: parentId,
                user: {
                    connect: {
                        id: userId,
                    }
                }
            }
        })
        return folder;
    } catch (err) {
        console.log(err);
        
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
    createRoot,
    createFolder
}