const { body, validationResult } = require('express-validator');
const db = require('../db');

async function afterSignin(req, res) {
    if (req.user) {
        res.redirect('/home')
    } else{
        res.redirect('/signin');
    }
}

async function getFolderContent(req, res) {
    if (req.user) {
        const folderId = req.params.id;
        try {
            const folderContents = await db.getFolders(folderId);
            if(!folderContents) {
                res.redirect('/home')
            } else {
                res.render('folder', { user: req.user.username, folderContents: folderContents })
            }
        } catch (err) {
            throw new Error("Not found")
        }
    } else {
        res.redirect('/signin');
    }
}

const folderNameValidation = [
    body('newfolder').trim().isLength({min: 1}).withMessage('Enter a name').escape(),
]
const editFolderNameValidation = [
    body('editname').trim().notEmpty().withMessage('Enter a name').escape()
]

async function createFolder(req, res) {
    const user = req.user;
    const newfolder = req.body.newfolder.toLowerCase();
    const parentFolderId = req.params.id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {        
        res.render('newfolder', {user: user.username, parentFolderId: parentFolderId, folderName: newfolder, errors: errors.array()})
        return;
    }

    try {
        await db.createFolder(newfolder, user.id, parentFolderId);
        res.redirect(`/folders/${parentFolderId}`);
    } catch (err) {
        err = {
            path: 'newfolder',
            msg: 'Folder name is already in use'
        }
        res.render('newfolder', {user: user.username, parentFolderId: parentFolderId, folderName: newfolder, errors: [err]});
    }
}

async function folderForm(req, res) {
    if (req.user) {
        try {
            const folder = await db.getFolders(req.params.id, req.user.id);
            if (!folder) {
                res.redirect('/home');
                return;
            }
        } catch (err) {
            throw new Error('Not found');
        }
        res.render('newfolder', {user: req.user.username, parentFolderId: req.params.id, folderName: null, errors: []})
    }
}

async function getUpdateFolderForm(req, res) {
    if (req.user) {
        try {
            const folder = await db.getFolders(req.params.id, req.user.id);
            if (!folder) {
                res.redirect('/home');
                return;
            } 
            res.render('changeName', {user: req.user.username, parentFolderId: req.params.id, errors: [] });
        } catch (err) {
            throw new Error('Not found');
        }
    }
}

async function updateFolder(req, res) {

    const parentId = req.params.id;
    const folder = await db.getFolders(parentId, req.user.id);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        
        res.render('changeName', {user: req.user.username, parentFolderId: folder.parentId, errors: errors.array()})
        return;
    }
    const { editname } = req.body;
    try {
        if (!folder) {
            res.redirect('/home');
            return;
        } else {
            try {
                await db.changeFolderName(editname, folder.id);
                res.redirect(`/folders/${folder.parentId}`);
            } catch (err) {
                console.log(err);
                res.render('changeName', {user: req.user.username, parentFolderId: folder.parentId, errors: [err]})
            }
        }
    } catch (err) {
        throw new Error('not found');
    }

}

async function deleteFolder(req, res) {
    if (req.user) {
        const folderId = req.params.id;

        const folder = await db.getFolders(folderId, req.user.id);
        try {
            if (!folder) {
                res.redirect('/home');
                return;
            }
            await db.delFolder(folderId);
            res.redirect(`/folders/${folder.parentId}`)
        } catch(err) {
            res.redirect(`/folders/${folder.parentId}`)
        }
    } else {
        res.redirect('/home');
    }
}

module.exports = {
    createFolder,
    folderForm,
    afterSignin,
    getFolderContent,
    getUpdateFolderForm,
    updateFolder,
    deleteFolder,
    folderNameValidation,
    editFolderNameValidation
}