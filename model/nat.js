var mongoose = require("mongoose");

var natSchema = mongoose.Schema({
    sexe: Number,
    preusuel: String,
    annee: Number,
    nombre: Number,
})

module.exports = mongoose.model('Nat', natSchema);
