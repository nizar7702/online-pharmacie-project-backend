const mongoose = require('mongoose')
const Med = mongoose.model('med', {
    imageurl:{
        type:String
    },
    name: {
        type: String,
        required: true
    },
    Speciality: {
        type: String,
        required: true
    },
    Dosage: {
        type: String,
        required: true
    },
    Forme: {
        type: String,
        required: true
    },
    Presentation: {
        type: String,
        required: true
    },
    Conditionnement_primaire: {
        type: String,
        required: true
    },
    Specification: {
        type: String,
        required: true
    },
    DCI: {
        type: String,
        required: true
    },
    Classement_VEIC: {
        type: String,
        required: true
    },
    Class_Therapeutic: {
        type: String,
        required: true
    },
    Sous_Classe: {
        type: String,
        required: true
    },
    Laboratoire: {
        type: String,
        required: true
    },
    Tableau: {
        type: String,
        required: true
    },
    Duration_of_conservation: {
        type: String,
        required: true
    },
    Indication: {
        type: String,
        required: true
    },
    Generic_Princeps: {
        type: String,
        required: true
    },
    AMM: {
        type: String,
        required: true
    },
    Date_AMM: {
        type: String,
        required: true
    },
    symptome1: {
        type: String,
        required: true
        ,
    },
    symptome2: {
        type: String,
        required: true
        ,
    },
    symptome3: {
        type: String,
        required: true
        ,
    },
    prix: {
        type: String,
        required: true
        ,
    }
})
module.exports = Med