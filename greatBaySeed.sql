DROP DATABASE IF EXISTS great_bay_db;
CREATE DATABASE great_bay_db;
USE great_bay_db;

CREATE TABLE auction_items (
    id INT NOT NULL AUTO_INCREMENT,
	poster VARCHAR(32) NOT NULL,
	thingy_type VARCHAR(32) NULL,               /* item, task, project, job */
    title VARCHAR(64) NULL,
    current_bid DECIMAL(10,2) NULL,
    current_highest_bidder VARCHAR(32) NULL,

    PRIMARY KEY (id)
);

INSERT INTO auction_items (poster, thingy_type, title, current_bid, current_highest_bidder)
VALUES ("marizu", "item", "Moldy Slice of Pizza", 3.50, "dancer"),
("chlora", "item", "Jason's Laptop", 10.00, "tommyWiseau"),
("RICHMAN", "job", "Hacking", 13.00, "fAntasTiCFISH_030"),
("tommyWiseau", "task","Paint my room",  5.00, "None"),
("chlora", "project", "Destroy Jason's Laptop", 15.00, "marizu"),
("RICHMAN", "job", "Hit job", 15000.00, "None"),
("RICHMAN", "item", "Michael's Pizzas", 75.00, "None");

SELECT * FROM auction_items;

/* UPDATE auction_items SET current_bid=7.0, current_highest_bidder="marizu" WHERE id=4;
SELECT id from users WHERE uname='fAntaTiCFISH_030' and pass='pass'; */

-- Users Table
CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT,
    uname VARCHAR(32) NULL,
    pass VARCHAR(32) NULL,

    PRIMARY KEY (id)
);

INSERT INTO users (uname, pass)
VALUES ("marizu", "pass"), ("chlora", "pass"), ("fAntaTiCFISH_030", "pass"), ("tommyWiseau", "tw"), ("dancer", "pass"), ("RICHMAN", "$$$");

SELECT * FROM users;
-- ### Alternative way to insert more than one row
-- INSERT INTO products (flavor, price, quantity)
-- VALUES ("vanilla", 2.50, 100), ("chocolate", 3.10, 120), ("strawberry", 3.25, 75);
