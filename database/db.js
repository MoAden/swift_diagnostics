// Dependencies
var mysql   = require('mysql');
    

/*
 * @sqlConnection
 * Creates the connection, makes the query and close it to avoid concurrency conflicts.
 */
var sqlConnection = function(sql, values, next) {

    // It means that the values hasnt been passed
    if (arguments.length === 2) {
        next = values;
        values = null;
    }

    var connection = mysql.createConnection({
    host     : '127.0.0.1',
    user     : 'databaseuser',
    password : '1234',
    database : 'mainswiftdatabase'
});
    connection.connect(function(err) {
        if (err !== null) {
            console.log("[MYSQL] Error connecting to mysql:" + err+'\n');
        }
    });

    connection.query(sql, values, function(err) {

        connection.end(); // close the connection

        if (err) {
            console.log(err);
        }

        // Execute the callback
        next.apply(this, arguments);
    });
}

module.exports = sqlConnection;
