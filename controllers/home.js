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
    const folderId = req.params.id;
    const folderContents = await db.getFolders(folderId);
    res.render('folder', { user: req.user.username, folderContents: folderContents })
}

folderNameValidation = [
    body('newfolder').trim().isLength({min: 1}).withMessage('Folder cannot be empty').escape(),
    body('newfolder').trim().isEmpty({ignore_whitespace: false}).withMessage('Folder cannot be empty').escape()
]

async function createFolder(req, res) {
    const user = req.user;
    const newfolder = req.body.newfolder.toLowerCase();
    const parentFolderId = req.params.id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('newfolder', {user: user.username, parentFolderId: parentFolderId, folderName: newfolder, errors: errors.array()})
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
        res.render('newFolder', {user: req.user.username, parentFolderId: req.params.id, folderName: null, errors: []})
    }
}

async function getUpdateFolderForm(req, res) {
    res.render('changeName', {user: req.user.username, parentFolderId: req.params.id, errors: [] });
}

async function updateFolder(req, res) {

    const parentId = req.params.id;
    const folder = await db.getFolders(parentId, req.user.id);
    const { newname } = req.body;

    try {
        await db.changeFolderName(newname, folder.id);
        res.redirect(`/folders/${folder.parentId}`);
    } catch (err) {
        err = {
            path: 'editname',
            msg: 'Folder name is already in use'
        }
        res.render('changeName', {user: req.user.username,parentFolderId: folder.parentId, errors: [err]})
    }
}

async function deleteFolder(req, res) {
    const folderId = req.params.id;
    const folder = await db.getFolders(folderId, req.user.id);
    try {
        await db.delFolder(folderId);
        res.redirect(`/folders/${folder.parentId}`)
    } catch(err) {
        res.redirect(`/folders/${folder.parentId}`)
    }
}

module.exports = {
    createFolder,
    folderForm,
    afterSignin,
    getFolderContent,
    getUpdateFolderForm,
    updateFolder,
    deleteFolder
}