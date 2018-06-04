var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;
var reader = require ("buffered-reader");
var DataReader = reader.DataReader;
var url = "mongodb://localhost:27017";
var async = require ('async');
var Nat = require("../model/nat");

var data = [];
var total_entries = 0;

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

new DataReader ("./public/data/nat2016.txt", { encoding: "utf8" })
        .on ("error", function (error){
            console.log (error);
        })
        .on ("line", function (line, nextByteOffset){
          var csvrow = line.split("\t");
          if (isNumber(csvrow[2]) && isNumber(csvrow[3])){
            var prenom = new Nat({
                sexe: csvrow[0],
                preusuel: csvrow[1],
                annee: csvrow[2],
                nombre: csvrow[3],
            });
            data.push(prenom);
            total_entries++
          }
        })
        .on ("end", function (){
          console.log ("EOF");
          console.log ("Number of data", data.length);
          MongoClient.connect(url, function(err, client) {
            // Get the collection
            var db = client.db("prenoms");
            db.createCollection("nats", function(err, res) {
              if (err) throw err;
              console.log("Collection created!");
            });

            var col = db.collection('nats');
                //

            var bulk = col.initializeOrderedBulkOp();
            var counter = 0;

            async.whilst(
                // Iterator condition
                function() { return counter < total_entries - 1},

                // Do this in the iterator
                function(callback) {
                    counter++;
                    bulk.insert(data[counter] );

                    if ( counter % 1000 == 0 ) {
                        bulk.execute(function(err,result) {
                            bulk = col.initializeOrderedBulkOp();
                            callback(err);
                        });
                    } else {
                        callback();
                    }
                },

                // When all is done
                function(err) {
                    if ( counter % 1000 != 0 )
                        bulk.execute(function(err,result) {
                            console.log( "inserted some more" );
                        });
                    console.log( "I'm finished now" );
                    client.close();
                }
            );
          });

        })
        .read ();
