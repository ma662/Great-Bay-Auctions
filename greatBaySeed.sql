DROP DATABASE IF EXISTS great_bay_db;
CREATE DATABASE great_bay_db;
USE great_bay_db;

CREATE TABLE all_stuff (
    id INT NOT NULL AUTO_INCREMENT,
    thingy_type VARCHAR(45) NULL,               /* item, task, project, job */
    title VARCHAR(45) NULL,
    current_bid DECIMAL(10,2) NULL,

    PRIMARY KEY (id)
);

INSERT INTO all_stuff (thingy_type, title, current_bid)
VALUES ("item", "Moldy Slice of Pizza", 3.50),
("item", "Jason's Laptop", 10.00),
("job", "Hacking", 13.00),
("task","Paint my room",  5.00),
("project", "Destroy Jason's Laptop", 15.00);

SELECT * FROM all_stuff WHERE ;

-- ### Alternative way to insert more than one row
-- INSERT INTO products (flavor, price, quantity)
-- VALUES ("vanilla", 2.50, 100), ("chocolate", 3.10, 120), ("strawberry", 3.25, 75);
