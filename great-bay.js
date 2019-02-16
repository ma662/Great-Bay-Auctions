// initialize dependencies
var mysql = require("mysql");
var inquirer = require('inquirer');
const cTable = require('console.table');

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
        if (user.authenticated) {

            var msg = "";
            if (options.firstRun){
                msg = "Welcome to Great-Bay Auctions, " + user.username +" !";
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
                    choices: ["[ bid on an item ]", "[ post an item ]", "[ show all auction items ]", "[ my bids ]", "[ my posts ]", "[ logout ]", "[ exit ]"]
                }
            ])
            .then(answers => {
                var sel = answers.option.split(' ');

                if (sel[1] === "my") {
                    if (sel[2] === "bids"){
                        sel = "my-bids";
                    }
                    else if (sel[2] === "posts"){
                        sel = "my-posts";
                    }

                }
                else if ( sel != "exit" ) {
                    sel = sel[1];
                }

                switch (sel) {
                    case 'bid' : 
                        options.firstRun = false;
                        options.bidFunc();
                    break;
        
                    case 'post' :
                        options.firstRun = false;
                        options.postFunc();
                    break;

                    case 'show' :
                        options.firstRun = false;
                        options.dispList(true);
                    break;

                    case 'my-bids':
                        options['my-bids']();
                    break;

                    case 'my-posts':
                        options['my-posts']();
                    break;

                    case "logout":
                        user.logout();
                    break;

                    case 'exit' :
                        options.quit();
                    break;
        
                    default :
                        console.log("default case stuff");
                    break;
                }
            });
        }
        else {
            console.log("Please sign-in to use these features.");
            home();
        }
    },

    bidFunc : function()
    {       
        connection.query("SELECT * FROM auction_items", function(err, res) {
        if (err) throw (err);

        options.dispList(false);
        console.log("\n\n\n");

        var choicesArr = [];
        for (var i=0; i<res.length; i++){
            var formatted = parseFloat(Math.round(res[i].current_bid * 100) / 100).toFixed(2);

            var myStr = ( i + 1 ) + ") [" + res[i].thingy_type + "] " + res[i].title + " || Highest Bid: " + formatted + " (" + res[i].current_highest_bidder + ")";
            
            var choicesObj = {
                name: myStr,
                
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
            connection.query("SELECT * FROM auction_items WHERE ?",
            [
                {
                    id: sel_id
                }
            ],
                function(err, res) {
                if (err) throw err;

                console.log("\nYou've selected: " + res[0]['title']);
                
                current_bid = res[0]['current_bid'];
                current_bid = parseFloat(Math.round(current_bid * 100) / 100).toFixed(2);

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
                    var formatted = parseFloat(Math.round(raw * 100) / 100).toFixed(2);
                    if (!formatted === raw){
                        console.log("\nRounded to: " + formatted );
                    }

                    if (parseFloat(formatted) > parseFloat(current_bid)) {

                        console.log("\nYou currently have the highest bid on this item!");
                            // connection.query('UPDATE users SET foo = ?, bar = ?, baz = ? WHERE id = ?', ['a', 'b', 'c', userId], function (error, results, fields) {
                            // UPDATE auction_items SET current_bid=7.0, current_highest_bidder="marizu" WHERE id=4;

                            connection.query('UPDATE auction_items SET ?, ? WHERE ?', 
                            [ 
                                {current_bid : formatted}, 
                                {current_highest_bidder : user.username}, 
                                {id : sel_id} 
                            ],
                            function(err, res) {
                                if(err) throw (err);
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

        connection.query("SELECT * FROM auction_items", function(err, res) {
            if (err) throw (err);

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
                    var item_name = answer['item-name'].trim();
                    
                    inquirer
                    .prompt([
                        {
                            name: "item-starting-bid",
                            type: "input",
                            message: ("What would you like to start the bidding at?"),
                        }
                    ]).then(function(answer) {
                        var raw = parseFloat(answer['item-starting-bid']);

                        // user has provided trash input
                        if (Number.isNaN(raw)){
                            console.log("\nThat is not a valid starting bid price.\n");
                            options.chooseOption();
                        }
                        else {
                            var starting_bid = parseFloat(Math.round(raw * 100) / 100).toFixed(2);
                            
                            var tableObj = {
                                'Type' : item_type,
                                'Title' : item_name,
                                'Starting Bid' : starting_bid
                            };
                            
                            console.table('\nAddition Information', [tableObj]);
                        }
                        
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
                                        "INSERT INTO auction_items SET ?",
                                        [{
                                            thingy_type: item_type,
                                            poster: user.username,
                                            title: item_name,
                                            current_bid: starting_bid,
                                            current_highest_bidder: "None"
                                        }],
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
        connection.query("SELECT * FROM auction_items", function(err, res) {
            if (err) throw err;
            console.log('\n');

            var tableArr = [];
            for (var i = 0; i < res.length; i++){
                var tableObj = {
                    'Type' : res[i].thingy_type,
                    'Poster' : res[i].poster,
                    'Title' : res[i].title,
                    // 'Bid Status' : res[i].status,
                    'Highest Bid' : parseFloat(Math.round(res[i].current_bid * 100) / 100).toFixed(2),
                    'Current Highest Bidder' : res[i].current_highest_bidder
                };

                tableArr.push(tableObj);
            }
            console.table('Great-Bay Current Auction List', tableArr);
            console.log("( Use arrow keys to pull up the menu )");
        });
        if (rerun){
            options.chooseOption();
        }
    },

    'my-bids' : function () {
        connection.query("SELECT * FROM auction_items WHERE ?",
        [
            {
                current_highest_bidder: user.username
            }
        ],
        function(err, res) {
            if (res.length === 0) {
                console.log("No bids found\n");
                options.chooseOption();
            }
            else {                
                var tableArr = [];
                for (var i = 0; i < res.length; i++) {

                    console.log('\n');

                    var tableObj = {
                        'Type' : res[i].thingy_type,
                        'Poster' : res[i].poster,
                        'Title' : res[i].title,
                        // 'Bid Status' : res[i].status,
                        'Highest Bid' : parseFloat(Math.round(res[i].current_bid * 100) / 100).toFixed(2),
                        'Current Highest Bidder' : res[i].current_highest_bidder + " (You)"
                    };

                    tableArr.push(tableObj);
                }
                console.table('Your Bids', tableArr);
                options.chooseOption();
            }
        });
    },

    'my-posts' : function () {
        connection.query("SELECT * FROM auction_items WHERE ?",
        [
            {
                poster: user.username
            }
        ],
        function(err, res) {
            if (res.length === 0) {
                console.log("No posts found\n");
                options.chooseOption();
            }
            else {                
                var tableArr = [];
                for (var i = 0; i < res.length; i++) {

                    console.log('\n');

                    var tableObj = {
                        'Type' : res[i].thingy_type,
                        'Poster' : res[i].poster + ' (You)',
                        'Title' : res[i].title,
                        // 'Bid Status' : res[i].status,
                        'Highest Bid' : parseFloat(Math.round(res[i].current_bid * 100) / 100).toFixed(2),
                        'Current Highest Bidder' : res[i].current_highest_bidder
                    };

                    tableArr.push(tableObj);
                }
                console.table('Your Bids', tableArr);
                options.chooseOption();
            }
        });
    },

    quit : function (){
        console.log("Ok, Goodbye!");
        connection.end();
        process.exit();
    },
};

// Application Start
connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");

    home();
});

var user = {
    username : '',
    pass : '',
    authenticated: false,
    
    login : function (){
        inquirer
        .prompt([
            {
                name: "uname",
                type: "input",
                message: ("Username:"),
            }
        ]).then(function(answer) {
            user.username = answer.uname.trim();

            inquirer
            .prompt([
                {
                    name: "pass",
                    type: "password",
                    message: ("Password:"),
                }
            ]).then(function(answer) {
                user.pass = answer.pass.trim();
                
                try {
                    connection.query("SELECT * FROM users WHERE ?",
                    [
                    {
                        uname: user.username,
                    }
                    ],
                    function(err, res) {
                        if (res.length === 0){
                            console.log("Login failed.\n");
                            home();
                        }

                        // console.log(res);
                        // console.log(res[0].pass);
                        if (user.username === res[0].uname && user.pass === res[0].pass){
                            console.log("\nLogin successful ... \n");
                            user.authenticated = true;
                            options.chooseOption();
                        }
                        else{
                            console.log("Login failed.\n")
                            home();
                        }

                    });
                }
                catch (err){
                    throw (err);
                }

            });
            
        });
    
    },

    signup : function (){
        inquirer
        .prompt([
            {
                name: "uname",
                type: "input",
                message: ("Register Username:"),
            }
        ]).then(function(answer) {
            var attempt = {
                uname : answer.uname.trim()
            };

            inquirer
            .prompt([
                {
                    name: "pass",
                    type: "password",
                    message: ("Password:"),
                }
            ]).then(function(answer) {
                attempt.pass = answer.pass.trim();

                // console.log(attempt);

                inquirer
                .prompt([
                    {
                        name: "cpass",
                        type: "password",
                        message: ("Confirm Password:"),
                    }
                ]).then(function(answer) {
                    if (attempt.pass === answer.cpass){
                        // console.log("Passwords match");

                        // check if username already exists
                        connection.query("SELECT id FROM users WHERE ?",
                        [
                            {
                                uname: attempt.uname   
                            }
                        ],
                        function (err, res) {
                            // console.log(res);
                            
                            // username not in db
                            if (res.length === 0){
                                console.log("\nAttemping to create account");

                                connection.query("INSERT INTO users SET ?",
                                [
                                    {
                                        uname: attempt.uname,
                                        pass: attempt.pass
                                    }
                                ],
                                function(err, res) {
                                    console.log("account created successfully!\n");
                                    home();
                                });
                            }
                            else {
                                console.log("That username is taken\n");
                                home();
                            }

                        });
                           
                    }
                    else{
                        console.log("Your passwords must match!\n");
                        home();
                    }
                });
            });
        });
    },
    
    logout : function (){
        this.username = '';
        this.pass = '';
        this.authenticated = false;

        console.log("You've been logged out.\n");
        home();
    },
}

function home() {
    inquirer
    .prompt([
        {
            name: "sel",
            type: "list",
            message: ("Great-Bay Auctions"),
            choices: ["Login", "Sign-up", "Exit"]
        }
    ]).then(function(answer) {

        switch (answer.sel){
            case "Login":
                user.login();
            break;
        
            case "Sign-up":
                user.signup();
            break;

            case "Exit":
                options.quit();
            break;

            default:
            console.log("Some default stuff");
        };
    });
}