var express = require('express');
var router = express.Router();
var Nat = require("../model/nat");

/* GET home page. */
router.get('/:prenom', function(req, res, next) {
  var prenom = req.params.prenom;
  console.log(prenom);
    // Nat.
    // find().where("preusuel").equals(prenom)
    // .exec((err, object) => {
    //   const nbre = object.reduce((prev, valeurCourante) => prev + valeurCourante.nombre , 0);
    //   console.log(nbre);
    // })
    Nat.aggregate([
        { $match: {
            preusuel: prenom
        }},
        { $group: {
            _id: "$preusuel",
            nombre: { $sum: "$nombre"  }
        }}
    ], (err, result) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log(result[0].nombre);
      });
    res.send('respond with a resource annee is a numbre');

});

module.exports = router;
