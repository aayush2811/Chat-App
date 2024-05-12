const userModel = require('../models/userModel');
const chatModel = require('../models/chatModel')
const bcrypt = require('bcrypt')
exports.getregister = async (req, res) => {
    try {
        res.render('register')
    } catch (error) {
        console.log(error);
    }
}

exports.register = async (req, res) => {
    try {
        const hashPassword = await bcrypt.hash(req.body.password, 10)
        const user = new userModel({
            name: req.body.name,
            email: req.body.email,
            image: 'images/' + req.file.filename,
            password: hashPassword
        });
        await user.save();
        res.render('register', { message: "Registered Succesfully" })
    } catch (error) {
        console.log(error.message);
    }
}

exports.getlogin = async (req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error);
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await userModel.findOne({ email: email })
        if (userData) {
            const passwordmatch = await bcrypt.compare(password, userData.password)
            if (passwordmatch) {
                req.session.user = userData;
                res.redirect('/dashboard')
            }
            else {
                res.render('login', { message: 'Please write correct email or password' })
            }
        }
        else {
            res.render('login', { message: 'Please write correct email or password' })
        }
    } catch (error) {
        console.log(error);
    }
}

exports.logout = async (req, res) => {
    try {
        await req.session.destroy(); // Destroy the session
        res.redirect('/'); // Send the redirect response
    } catch (error) {
        console.log(error);
    }
}

exports.dashboard = async (req, res) => {
    try {
        if (req.session.user && req.session.user._id) {
            const users = await userModel.find({ _id: { $nin: [req.session.user._id] } });
            res.render('dashboard', { user: req.session.user, users: users });
        } else {
            res.redirect('/login'); 
        }
    } catch (error) {
        console.log(error);
    }
}

exports.savechat = async (req, res) => {
    try {
        const { sender_id, receiver_id, message } = req.body;

        if (!sender_id || !receiver_id || !message) {
            return res.status(400).json({ success: false, msg: 'Invalid data provided' });
        }

        const chat = new chatModel({
            sender_id: sender_id,
            receiver_id: receiver_id,
            message: message,
        });

        // Save the chat
        const newChat = await chat.save();
        res.status(200).json({ success: true, msg: 'Chat saved successfully', data: newChat });
    } catch (error) {
        console.log('Error saving chat:', error);
        res.status(500).json({ success: false, msg: 'Error saving chat' });
    }
};

exports.deletechat = async (req,res)=>{
    try {
       await chatModel.deleteOne({_id:req.body.id});
       res.status(200).send({success:true})

    } catch (error) {
        res.status(400).send({success:false,msg:error.message})
    }
}

exports.updatechat = async (req,res)=>{
    try {
       await chatModel.findByIdAndUpdate({_id:req.body.id},{
        $set:{
            message:req.body.message
        }
       })
       res.status(200).send({success:true})

    } catch (error) {
        res.status(400).send({success:false,msg:error.message})
    }
}