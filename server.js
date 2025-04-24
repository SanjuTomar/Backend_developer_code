
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const EventEmitter = require('events');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/userdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
    user: { type: String, required: true },
    interest: { type: [String], required: true },
    age: { type: Number, required: true },
    mobile: { type: Number, required: true },
    email: { type: String, required: true },
});

const User = mongoose.model('User ', userSchema);

const eventEmitter = new EventEmitter();

eventEmitter.on('userCreated', (user) => {
    console.log('User  created:', user);
});

eventEmitter.on('userUpdated', (user) => {
    console.log('User  updated:', user);
});

eventEmitter.on('userDeleted', (user) => {
    console.log('User  deleted:', user);
});

app.post('/api/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        res.status(201).send(user);
        eventEmitter.emit('userCreated', user); 
    } catch (error) {
        res.status(400).send(error);
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) {
            return res.status(404).send();
        }
        res.send(user);
        eventEmitter.emit('userUpdated', user); 
    } catch (error) {
        res.status(400).send(error);
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).send();
        }
        res.send(user);
        eventEmitter.emit('userDeleted', user); 
    } catch (error) {
        res.status(500).send(error);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
