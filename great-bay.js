// initialize dependencies
var mysql = require("mysql");
var inquirer = require('inquirer');

// configure connection
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  user: "root",
  password: "root",
  database: "great_bay_db"
});

var options = {
    firstRun : true,

    chooseOption : function() {

        var msg = "";
        if (options.firstRun){
            msg = "Welcome to Great-Bay Auctions!";
        }
        else {
            msg = "Would you like to do something else?";
        }

        inquirer
        .prompt([
            {
                name: "option",
                type: "list",
                message: msg,
                choices: ["BID ON AN ITEM", "POST AN ITEM", "DISPLAY ITEMS", "EXIT"]
            }
        ])
        .then(answers => {
            var sel = answers.option.split(' ')[0];
    
            switch (sel) {
                case 'BID' : 
                    console.log("Bid Case Running ... ");
                    options.firstRun = false;
                    options.bidFunc();
                break;
    
                case 'POST' :
                console.log("Post Case Running ... ");
                    options.firstRun = false;
                    options.postFunc();
                // post logic
                break;

                case 'DISPLAY' :
                console.log("Display Case Running ... ");
                    options.firstRun = false;
                    options.dispList(true);
                break;

                case 'EXIT' :
                // exit logic
                    console.log("Ok, Goodbye!");
                    connection.end();
                    process.exit();
                break;
    
                default :
                    console.log("default case stuff");
                break;
            }
        });
    },

    bidFunc : function()
    {
        connection.query("SELECT * FROM all_stuff", function(err, res) {
            if (err) throw (err);

            var choicesArr = [];
            for (var i=0; i<res.length; i++){
                var choicesObj = {
                        name: ((i+1) + " - [" + res[i].thingy_type + "] -- " + res[i].title) + " || Highest Bid: " + res[i].current_bid,
                        value: res[i].id,
                        short: res[i].thingy_type
                    }

                // array of choice object
                choicesArr.push(choicesObj);
            }

            // choose item to bid on
            inquirer
            .prompt([
                {
                    name: "selection-id",
                    type: "list",
                    message: "Select an item or service to bid on: ",
                    choices: choicesArr
                }
            ]).then(function(answer) 
            {
                // select an item to bid on
                var current_bid;
                var sel_id = answer['selection-id'];

                // init another db query, retrieve logged bid
                connection.query("SELECT * FROM all_stuff WHERE ?",
                [
                    {
                        id: sel_id
                    }
                ],
                 function(err, res) {
                    if (err) throw err;

                    console.log("\nYou've selected: " + res[0]['title']);
                    
                    current_bid = res[0]['current_bid'];
                    console.log("Current highest bid: " + current_bid);

                    // inquirer amount to bid 
                    inquirer
                    .prompt([
                        {
                            name: "bid-attempt",
                            type: "input",
                            message: ("How much are you willing to bid on this item? \n"),
                        }
                    ]).then(function(answer) {
                        var raw = answer['bid-attempt'];

                        // attempt formatting to x.00 notation
                        try {
                            var formatted = parseFloat(Math.round(raw * 100) / 100).toFixed(2);
                            if (formatted != raw){
                                console.log("Rounded to: " + formatted );
                            }
                        }
                        catch (err){
                            console.log(err);
                        }

                        // if (answer['bid-attempt'] > current_bid){
                        if (formatted > current_bid) {
                            console.log("You currently have the highest bid on this item!");

                                connection.query(
                                "UPDATE all_stuff SET ? WHERE ?",
                                [
                                {
                                    current_bid: formatted
                                },
                                {
                                    id: sel_id
                                }
                                ],
                                function(err, res) {
                                    console.log(res.affectedRows + " item updated!\n");
                                    options.chooseOption();
                                });
                        }
                        else {
                            console.log("Your bid is either too low or invalid to be listed for this item.");
                            options.chooseOption();
                        }
                    });
                });
            });
        });
    },

    postFunc : function() {
        // display without rerunning options function
        options.dispList(false);

        connection.query("SELECT * FROM all_stuff", function(err, res) {
            if (err) throw (err);
            
            // print all items
            for (var i=0; i<res.length; i++){
                var myStr = ( (i+1) + " - [" + res[i].thingy_type + "] -- " + res[i].title + " || Highest Bid: " + res[i].current_bid );
                console.log(myStr + " \\\\");
                
                // dynamic line length shenanigans
                var eql  = "=";
                for (var y=0; y<myStr.length; y++){
                    eql = eql + "=";
                }
                console.log(eql + "˩˩");
            }

            inquirer
            .prompt([
                {
                    name: "item-type",
                    type: "list",
                    message: ("What would you like to put up for auction? "),
                    choices: ["an item", "a job", "a task", "a project", "nevermind"]
                }
            ]).then(function(answer) {
                var item_type = answer['item-type'];

                if (item_type === 'nevermind'){
                    // break;
                    console.log("\n\n\n\n\n");
                    
                    options.chooseOption();
                }

                item_type = item_type.split(' ')[1];
                // console.log(item_type);
                
                inquirer
                .prompt([
                    {
                        name: "item-name",
                        type: "input",
                        message: ("What is the title of this " + item_type + "?"),
                    }
                ]).then(function(answer) {
                    var item_name = answer['item-name'];
                    
                    inquirer
                    .prompt([
                        {
                            name: "item-starting-bid",
                            type: "input",
                            message: ("What would you like to start the bidding at?"),
                        }
                    ]).then(function(answer) {
                        var starting_bid = answer['item-starting-bid'];

                        console.log(
                            "\ntype or service: " + "[ " + item_type + " ]" + "\n" +
                            "title: " + "[ " + item_name + " ]" + "\n" +
                            "starting bid: " + "[ " + starting_bid + " ]" + "\n"
                        );
                        
                        inquirer
                        .prompt([
                            {
                                name: "item",
                                type: "confirm",
                                message: ("Is this information correct?"),
                            }
                        ]).then(function(answer) {
                            // if wrong input, re-run options
                            if (!answer.item){
                                options.postFunc();
                            }
                            else {
                                try{
                                    connection.query(
                                        "INSERT INTO all_stuff SET ?",
                                        {
                                        thingy_type: item_type,
                                        title: item_name,
                                        current_bid: starting_bid,
                                        },
                                        function(err, res) {
                                        console.log("Entry successfully added!\n");
                                        options.chooseOption();
                                        }
                                    );
                                }
                                catch (err) {
                                    console.log(err);
                                    process.exit();
                                }
                            }
                        });
                 
                    });
                 
                });
                    
            });
            
        });
    },

    dispList : function (rerun){
        connection.query("SELECT * FROM all_stuff", function(err, res) {
            if (err) throw err;
            // console.log(res);
            
            console.log('\n');
            console.log("[[ Great-Bay Auction List ]] ==========================\\\\");

            for (var i=0; i<res.length; i++){
                var myStr = ( (i+1) + " - [" + res[i].thingy_type + "] -- " + res[i].title + " || Highest Bid: " + res[i].current_bid );
                console.log(myStr + " \\\\");
                
                // dynamic line length shenanigans
                var eql  = "=";
                for (var y=0; y<myStr.length; y++){
                    eql = eql + "=";
                }
                console.log(eql + "˩˩");
            }

            console.log('\n\n\n');
        });
        if (rerun){
            options.chooseOption();
        }
    },
};

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");

    options.chooseOption();
});

// // function createProduct() {
// //     console.log("Inserting a new product...\n");
// //     var query = connection.query(
// //       "INSERT INTO products SET ?",
// //       {
// //         flavor: "Rocky Road",
// //         price: 3.0,
// //         quantity: 50
// //       },
// //       function(err, res) {
// //         console.log(res.affectedRows + " product inserted!\n");
// //         // Call updateProduct AFTER the INSERT completes
// //         updateProduct();
// //       }
// //     );


// // function createProduct() {
// //   console.log("Inserting a new product...\n");
// //   var query = connection.query(
// //     "INSERT INTO products SET ?",
// //     {
// //       flavor: "Rocky Road",
// //       price: 3.0,
// //       quantity: 50
// //     },
// //     function(err, res) {
// //       console.log(res.affectedRows + " product inserted!\n");
// //       // Call updateProduct AFTER the INSERT completes
// //       updateProduct();
// //     }
// //   );

// //   // logs the actual query being run
// //   console.log(query.sql);
// // }

// // function updateProduct() {
// //   console.log("Updating all Rocky Road quantities...\n");
// //   var query = connection.query(
// //     "UPDATE products SET ? WHERE ?",
// //     [
// //       {
// //         quantity: 100
// //       },
// //       {
// //         flavor: "Rocky Road"
// //       }
// //     ],
// //     function(err, res) {
// //       console.log(res.affectedRows + " products updated!\n");
// //       // Call deleteProduct AFTER the UPDATE completes
// //       deleteProduct();
// //     }
// //   );

// //   // logs the actual query being run
// //   console.log(query.sql);
// // }

// // function deleteProduct() {
// //   console.log("Deleting all strawberry icecream...\n");
// //   connection.query(
// //     "DELETE FROM products WHERE ?",
// //     {
// //       flavor: "strawberry"
// //     },
// //     function(err, res) {
// //       console.log(res.affectedRows + " products deleted!\n");
// //       // Call readProducts AFTER the DELETE completes
// //       readProducts();
// //     }
// //   );
// // }

// function readStuff() {
//   console.log("Selecting all from all_stuff...\n");
//   connection.query("SELECT * FROM all_stuff", function(err, res) {
//     if (err) throw err;
//     // Log all results of the SELECT statement
//     console.log(res);
//     connection.end();
//   });
// }
