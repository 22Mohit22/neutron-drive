const { Router } = require('express');
const db = require('../db');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SERVICE_ROLE;

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(supabaseUrl, supabaseKey);

const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const router = Router();

router.get('/folders/:id/upload', async (req, res) => {
    if (req.user) {
        res.render('uploadFile', {user: req.user.username, parentId: req.params.id, errors: []});
    } else {
        res.redirect('/home');
    }
})

router.post('/folders/:id/upload', upload.single('uploaded_file'), async (req, res) => {
    if (req.user) {
        const {originalname, size} = req.file;

        function modifyName(name) {
            const newname = name + '-' + Date.now() + '-' + Math.round(Math.random() * 1E9);
            return newname;
        }

        const newname = modifyName(originalname);
        function formatBytes(sizeInBytes) {
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            if (sizeInBytes === 0) return '0 Bytes';
            const i = Math.floor(Math.log(sizeInBytes) / Math.log(1024));
            const size = parseFloat((sizeInBytes / Math.pow(1024, i)).toFixed(2));
            return `${size} ${sizes[i]}`;
        }
        const formatSize = formatBytes(size);
        const parentId = req.params.id;   
        try {

            const { data: uploadData, error } = await supabase
            .storage
            .from('drive')
            .upload(`${req.user.username}/${newname}`, req.file.buffer, {
                cacheControl: '3600',
                upsert: false,
                contentType: req.file.mimetype,
            });

            if (!error) {
                await db.createFile(newname, formatSize, uploadData.path, parentId, req.user.id);
                res.redirect(`/folders/${parentId}`);
            } else {
                res.render('uploadFile', {user: req.user.username, parentId: parentId, errors: [error]})
            }

            
        } catch (err) {
            console.log(err);
            throw new Error('Something went wrong');
        }
        
    } else {
        res.redirect('/home');
    }
})

router.get('/file/:id/update', (req, res) => {
    if (req.user) {
        res.render('editFileName', {user: req.user.username, fileId: req.params.id, errors: []});
    } else {
        res.redirect('/home');
    }
})

router.post('/file/:id/update', async (req, res) => {
    if (req.user) {
        const filename = req.body.filename;
        try {
            const file = await db.findFile(req.params.id);
            const parentFolder = await db.getFolderByFile(req.params.id);
            const newPath = `${req.user.username}/${filename}`;
            const { data, error } = await supabase
            .storage.from('drive')
            .move(`${file.path}`, newPath);
            if (data) {
                res.redirect(`/folders/${parentFolder.id}`);
                await db.editFile(filename, req.params.id, newPath);
            } else {
                res.render('editFileName', {user: req.user.username, fileId: req.params.id, errors: [error]});
            }
        } catch (err) {
            err = {
                path: 'filename',
                msg: 'File name is in use'
            }
            res.render('editFileName', {user: req.user.username, fileId: req.params.id, errors: [err]})
        }

    } else {
        res.redirect('/home');
    }
})

router.post('/file/:id/delete', async (req, res) => {
    if (req.user) {
        try {
            const file = await db.findFile(req.params.id);
            const { data, error } = await supabase
            .storage
            .from('drive').remove([file.path]);
            await db.delFile(req.params.id);
            if (!error) {
                res.redirect(`/folders/${file.folderId}`);
            } else {
                res.redirect(`/folders/${file.folderId}`)
                throw new Error('Error deleting file');
            }

        } catch (err) {
            res.redirect('/home')
        }
    } else {
        res.redirect('/home');
    }
})

router.get('/download/:id', async (req, res) => {
    if (req.user) {
        try {
            const file = await db.findFile(req.params.id);
            if (!file) {
                res.redirect('/notfound');
            }
            if (req.user.id === file.userId) {

                if (req.user.id === file.userId) {
                    
                    const { data: fileData, error: downloadError } = supabase
                    .storage
                    .from('drive')
                    .getPublicUrl(file.path, {
                        download: true,
                    });

                    res.redirect(fileData.publicUrl)

                } else {
                    res.redirect('/error')
                }
            }
        } catch (err) {
            console.log(err);
        }
    }
})

module.exports = router;