const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createUser(username, password) {
    try {
        const user = await prisma.user.create({
            data: {
                username: username,
                password: password
            }
        })
        return user;
    } catch (err) {
        console.log('Error in creating user: ', err);
        throw new  Error('Username is already taken');
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

async function getRootFolder(userId) {
    try{
        const rootFolder = await prisma.folder.findFirst({
            where: {
                name: 'root',
                userId: userId
            },
            include: {
                files: true,
                subFolders: {
                    orderBy: {
                        name: 'asc'
                    }
                }
            }
        })
        return rootFolder;
    } catch (err) {
        console.log(err);
        return err;
        
    }
}

async function createFolder(name, userId, parentId) {
    
    try {
        const folder = await prisma.folder.create({
            data: {
                name: name,
                parent: {
                    connect: {
                        id: parentId
                    }
                },
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
        throw new Error('Folder name already exists');
        
    }
}

async function getFolders(parentId, userId) {

    if (parentId == undefined || parentId == null || parentId == NaN) {
        const folders = getRootFolder(userId);
        return folders;
    }
    try {
        const folders = await prisma.folder.findUnique({
            where: {
                id: parentId
            },
            include: {
                files: true,
                subFolders: {
                    orderBy: {
                        name: 'asc'
                    }
                }
            }
        })
        return folders;
    } catch (err) {
        console.log(err);
        return err;
    }
}

async function checkUser(username) {
    try {
        const user = await prisma.user.findUnique({
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
        const user = await prisma.user.findUnique({
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

async function changeFolderName(name, folderId) {
    try {
        const folder = await prisma.folder.update({
            where: {
                id: folderId
            },
            data: {
                name: name
            }
        })
        return folder;
    } catch (err) {
        throw new Error('Folder name is in use')
    }

}

async function delFolder(folderId) {
    try {
        // Step 1: Delete all files in the current folder
        await prisma.file.deleteMany({
            where: {
                folderId: folderId
            }
        });

        // Step 2: Get all subfolders of the current folder
        const subFolders = await prisma.folder.findMany({
            where: {
                parentId: folderId
            },
            include: {
                files: true,
                subFolders: true // Include subfolders to handle nested deletion
            }
        });

        // Step 3: Recursively delete each subfolder
        for (const subFolder of subFolders) {
            await delFolder(subFolder.id); // Recursively call delFolder for each subfolder
        }

        // Step 4: Delete the current folder itself
        await prisma.folder.delete({
            where: {
                id: folderId
            }
        });

        return true;
    } catch (err) {
        console.error('Error deleting folder:', err);
        throw new Error('Error deleting folder');
    }
}

async function createFile(fileName, size, path, folderId, userId) {
    try {
        const file = await prisma.file.create({
            data: {
                name: fileName,
                size: size,
                path: path,
                folderId: folderId,
                userId: userId,
            }
        })
        return file;
    } catch (err) {
        console.log(err);
        throw new Error('Error while saving file to database')
    }
}

async function editFile(name, folderId) {
    try {
        const file = await prisma.file.update({
            where: {
                id: folderId
            },
            data: {
                name: name
            }
        })
        return file;
    } catch (err) {
        throw new Error('File name is in use')
    }
}

async function getFolderByFile(fileId) {
    try {
        const file = await prisma.file.findUnique({
            where: {
                id: fileId
            },
            include: {
                folder: true
            }
        })
        return file.folder;
    } catch (err) {
        console.log(err);
        throw new Error('Folder not found')
    }
}

module.exports = {
    createUser,
    getUser,
    checkUser,
    createRoot,
    getRootFolder,
    createFolder,
    getFolders,
    changeFolderName,
    delFolder,
    createFile,
    editFile,
    getFolderByFile
}