const { Router } = require('express');
const db = require('../db');

const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage: storage });

const router = Router();

router.get('/folders/:id/upload', async (req, res) => {
    if (req.user) {
        res.render('uploadFile', {user: req.user.username, parentId: req.params.id});
    } else {
        res.redirect('/home');
    }
})

router.post('/folders/:id/upload', upload.single('uploaded_file'), async (req, res) => {
    if (req.user) {
    console.log(req.file || req.files);
    const {originalname, size, path} = req.file;
    console.log(req.params);
    const parentId = req.params.id;   
    try {
        await db.getFolders(parentId, req.user.id);
        const file = await db.createFile(originalname,size, path, parentId, req.user.id);
        console.log(file);
        res.redirect(`/folders/${parentId}`);
    } catch (err) {
        console.log(err);
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
            await db.editFile(filename, req.params.id);
            const parentFolder = await db.getFolderByFile(req.params.id);
            res.redirect(`/folders/${parentFolder.id}`);
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

module.exports = router;