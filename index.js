const express = require('express')
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')
const cors = require('cors')
const mongoose = require('./config/db')
const User = require('./models/User')
const Contact = require('./models/contact')
const app = express()
const jwt = require('jsonwebtoken')
const { db } = require('./models/User')
const Med = require('./models/Med')
const multer = require('multer');
const fs = require('fs');
const nodemailer = require("nodemailer");
const { url } = require('inspector')
var code=""
async function main(user,callBack) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    code=Math.floor(100000 + Math.random() * 900000).toString();
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service:'gmail',
        auth: {
            user:'projetpharma0000' , // generated ethereal user
            pass: 'Projet2021', // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: 'projetpharma0000@gmail.com', // sender address
        to: user.email, // list of receivers
        subject: "Pharmacie centrale ✔", // Subject line
        text: "Activation code?", // plain text body
        html: "<b>This is your activation code: "+code, // html body
    });
    callBack(info);
}
const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, 'uploads')
    },
    filename: (req, file, callBack) => {
        console.log(file)
        callBack(null, file.originalname)
    }
})
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }

}
var upload = multer({ storage: storage, fileFilter: fileFilter })
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.json())
app.use(cors())
app.post('/register', (req, res) => {
    //recuperation des données
    let data = req.body;
    console.log(data);
    let salt = bcrypt.genSaltSync(10)
    let hashedPassword = bcrypt.hashSync(data.password, salt)
    //creation d'un objet <=donnée récupéré
    const user = new User({
        firstname: data.firstname,
        lastname: data.lastname,
        phone: data.phone,
        adress: data.adress,
        email: data.email,
        password: hashedPassword
    });
    //enregistrer l'objet dans la base de données
    user.save()
        .then(() => {
            //retour en cas el user tsajel
            res.status(201).send({ message: "user saved" })
        })
        .catch(() => {
            //retour en cas el user matsjlch
            res.status(400).send({ message: "user not saved" })
        })
})
app.post('/login', (req, res) => {
    //recuperation des données
    let data = req.body;
    console.log(data);
    User.findOne({ email: data.email })
        .then((userFromDB) => {
            if (!userFromDB) {
                res.status(400).send({ message: "user Not Found" })
            }
            else {
                let compare = bcrypt.compareSync(data.password, userFromDB.password)
                if (!compare) {
                    res.status(404).send({ message: "Email/Password incorrect(s)" })
                } else {
                    if (data.email == userFromDB.email) {
                        let mytoken = jwt.sign({
                            id: userFromDB._id
                        }, "secretKey")
                        res.status(200).send({ token: mytoken })
                    }
                    else {
                        res.status(201).send({ message: "login done" })
                    }
                }
            }
        })
        .catch(() => {
            res.status(400).send({ message: "ERROR" })
        })


})
app.get('/verifyemail/:email', (req, res) => {
    let email = req.params.email;
    User.findOne({ email: email  })
        .then((userFromDB) => {
            if (!userFromDB) {
                res.status(404).send({ message: "email Not Found" })
            }
            else {
                res.status(200).send(userFromDB)
            }
        })
        .catch(() => {
            res.status(400).send({ message: "ERROR" })
        })
})
app.get('/cart/:id', (req, res) => {
    let userid = req.params.id;
    User.findOne({ _id: userid }, { medicaments: 1, _id: 0 })
        .then((userFromDB) => {
            if (!userFromDB) {
                res.status(404).send({ message: "user Not Found" })
            }
            else {
                res.status(200).send(userFromDB)
                console.log(userFromDB)
            }
        })
        .catch(() => {
            res.status(400).send({ message: "ERROR" })
        })
})
app.post('/buy', (req, res) => {
    let userid = req.query.id;
    let med = req.query.med;
    let qte = req.query.qte;
    let prix = req.query.prix
    console.log(userid);
    console.log(med);
    console.log(qte);
    console.log(prix)
    User.findOneAndUpdate({ _id: userid }, { "$push": { medicaments: { medicament: med, qte: qte, prix: prix } } }, { new: true })
        .then((userFromDB) => {
            if (!userFromDB) {
                res.status(404).send({ message: "user Not Found" })
            }
            else {
                res.status(201).send(userFromDB)
            }
        })
        .catch(() => {
            res.status(400).send()
        })

})
app.get('/header/:id', (req, res) => {
    let userid = req.params.id;
    User.findOne({ _id: userid })
        .then((userFromDB) => {
            if (!userFromDB) {
                res.status(404).send({ message: "user Not Found" })
            }
            else {
                res.status(200).send(userFromDB)
            }
        })
        .catch(() => {
            res.status(400).send({ message: "ERROR" })
        })
})
app.post('/delete', (req, res) => {
    let userid = req.query.id;
    User.findOneAndUpdate({ _id: userid }, { "$pull": { medicaments: {} } }, { new: true })
        .then((userFromDB) => {
            if (!userFromDB) {
                res.status(404).send({ message: "user Not Found" })
            }
            else {
                res.status(201).send(userFromDB)
            }
        })
        .catch(() => {
            res.status(400).send({ message: "ERROR" })
        })

})
app.delete('/deletecontact/:id', (req, res) => {
    let userid = req.params.id
    Contact.findOneAndDelete({ _id: userid })
        .then((userFromDB) => {
            if (!userFromDB) {
                res.status(404).send({ message: "user Not Found" })
            }
            else {
                res.status(201).send(userFromDB)
            }
        })
        .catch(() => {
            res.status(400).send({ message: "ERROR" })
        })

})
app.get('/clientslist', (req, res) => {
    User.find({ medicaments: { "$not": { "$size": 0 } } })
        .then((users) => {
            res.status(200).send(users)
        })
        .catch(() => {
            res.status(400).send({ message: "ERROR" })
        })
})
app.post('/contact', (req, res) => {
    let data = req.body;
    console.log(data);
    const contact = new Contact({
        message: data.message,
        name: data.name,
        email: data.email,
        subject: data.subject,
    });
    contact.save()
        .then(() => {
            res.status(201).send({ message: "contact saved" })
        })
        .catch(() => {
            res.status(400).send({ message: "contact not saved" })
        })
})
app.get('/contactslist', (req, res) => {
    Contact.find()
        .then((users) => {
            res.status(200).send(users)
        })
        .catch(() => {
            res.status(400).send({ message: "ERROR" })
        })
})
app.post('/addMed', (req, res) => {
    let data = req.body;
    console.log(data);
    const med = new Med({
        imageurl: data.imageurl,
        name: data.name,
        Speciality: data.Speciality,
        Dosage: data.Dosage,
        Forme: data.Forme,
        Presentation: data.Presentation,
        Conditionnement_primaire: data.Conditionnement_primaire,
        Specification: data.Specification,
        DCI: data.DCI,
        Classement_VEIC: data.Classement_VEIC,
        Class_Therapeutic: data.Class_Therapeutic,
        Sous_Classe: data.Sous_Classe,
        Laboratoire: data.Laboratoire,
        Tableau: data.Tableau,
        Duration_of_conservation: data.Duration_of_conservation,
        Indication: data.Indication,
        Generic_Princeps: data.Generic_Princeps,
        AMM: data.AMM,
        Date_AMM: data.Date_AMM,
        symptome1: data.symptome1,
        symptome2: data.symptome2,
        symptome3: data.symptome3,
        prix: data.prix
    });
    med.save()
        .then(() => {
            res.status(201).send({ message: "medicament saved" })
        })
        .catch(() => {
            res.status(400).send({ message: "medicament not saved" })
        })
})
app.post('/file', upload.single('file'), (req, res) => {
    const file = req.file;
    if (!file) {
        res.status(400).send({ message: "No file" })
    }
    if (req.query.oldimagename != null) {
        let url = "/Users/user/Desktop/bootcamp2020/node projects/PROJETFPHARMABACKEND/uploads/" + req.query.oldimagename
        fs.unlink(url, (err => {
            if (err) console.log(err);
            else {
                console.log("file deleted");
            }
        }))

    }
    res.send(file);
})
app.get('/medlist', (req, res) => {
    Med.find()
        .then((medicaments) => {
            res.status(200).send(medicaments)
        })
        .catch(() => {
            res.status(400).send({ message: "ERROR" })
        })
})
app.get('/details/:name', (req, res) => {
    let productname = req.params.name;
    Med.findOne({ name: productname })
        .then((medFromDB) => {
            if (medFromDB) {
                res.status(200).send(medFromDB)
            }
        })
        .catch(() => {
            res.status(400).send({ message: "ERROR" })
        })
})
app.delete('/deletemed/:name', (req, res) => {
    let med = req.params.name
    Med.findOneAndDelete({ name: med })
        .then((userFromDB) => {
            if (!userFromDB) {
                res.status(404).send({ message: "med Not Found" })
            }
            else {

                let url = userFromDB.imageurl.replace("http://localhost:3001/", "/Users/user/Desktop/bootcamp2020/node projects/PROJETFPHARMABACKEND/");
                console.log(url)
                fs.unlink(url, (err => {
                    if (err) console.log(err);
                    else {
                        console.log("file deleted");
                    }
                }))
                res.status(201).send(userFromDB)
            }
        })
        .catch(() => {
            res.status(400).send({ message: "ERROR" })
        })

})
app.post('/editmed', (req, res) => {
    let type = req.query.type;
    let edit = req.query.edit;
    let medname = req.query.medname
    console.log(medname);
    console.log(type);
    console.log(edit);
    Med.findOneAndUpdate({ name: medname }, { [type]: edit }, { new: true })
        .then((userFromDB) => {
            if (!userFromDB) {
                console.log({ name: medname })
                console.log({ [type]: edit })
                res.status(404).send({ message: "edit failed" })
            }
            else {
                res.status(201).send(userFromDB)
            }
        })
        .catch(() => {
            res.status(400).send()
        })

})
app.post('/sendmail', (req, res) => {
    let user = req.body;
    console.log(user);
    main(user,info=>{
        console.log("The mail has been send")
        console.log(info)
        res.send(code);
    })
})
app.post('/updatepassword', (req, res) => {
    let email = req.query.email;
    let password = req.query.password;
    console.log(email);
    console.log(password);
    let salt = bcrypt.genSaltSync(10)
    let hashedPassword = bcrypt.hashSync(password, salt)
    User.findOneAndUpdate({ email: email}, { password: hashedPassword }, { new: true })
        .then((userFromDB) => {
            if (!userFromDB) {
                res.status(404).send({ message: "update failed" })
            }
            else {
                res.status(201).send(userFromDB)
            }
        })
        .catch(() => {
            res.status(400).send()
        })

})
app.listen(3001, function () {
    console.log('server started on port 3001')
})