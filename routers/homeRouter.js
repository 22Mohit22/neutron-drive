const { Router } = require("express");
const { createFolder, folderForm, afterSignin, getFolderContent, getUpdateFolderForm ,updateFolder, deleteFolder } = require("../controllers/home");

const router = Router();

router.get('/', afterSignin)
router.get('/home', getFolderContent)
router.get('/folders/:id', getFolderContent)
router.get('/folders/:id/create', folderForm)
router.post('/folders/:id/create', createFolder)

router.get('/folders/:id/update', getUpdateFolderForm)
router.post('/folders/:id/update', updateFolder)
router.post('/folders/:id/delete', deleteFolder)

module.exports = router;