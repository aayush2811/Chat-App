const express = require('express')
const router = express.Router()
const app = express()
const session = require('express-session');
const usercontroller = require('../controllers/userController')
const path = require('path')
const multer = require('multer')
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/images'))
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name);
    }
})
const upload = multer({storage:storage})
app.use(session({
    secret:"abshvbhsbc",
    resave:false,
    saveUninitialized:false
}))
const authmiddle = require('../middleware/authMiddleware')

router.get('/register',authmiddle.islogout,usercontroller.getregister)
router.post('/register',upload.single('image'),usercontroller.register)

router.get('/',authmiddle.islogout,usercontroller.getlogin)
router.post('/',usercontroller.login)
router.get('/logout',authmiddle.islogin,usercontroller.logout)
router.get('/dashboard',authmiddle.islogin,usercontroller.dashboard)
router.post('/savechat',usercontroller.savechat)
router.post('/deletechat',usercontroller.deletechat)
router.post('/updatechat',usercontroller.updatechat)

router.get('*',function(req,res){
    res.redirect('/login')
})
module.exports = router