UPDATE "Category" SET "grouping" = 'General' WHERE "id" = 0;
UPDATE "Category" SET "grouping" = 'General', "icon" = 'HandCoins' WHERE "id" = 1;

INSERT INTO "Category" ("id", "grouping", "name", "icon")
VALUES
    (100, 'Life', 'Groceries', 'ShoppingCart'),
    (101, 'Life', 'Shopping', 'ShoppingBag'),
    (102, 'Life', 'Household Supplies', 'SprayCan'),
    (103, 'Life', 'Medical Expenses', 'Stethoscope'),
    (104, 'Life', 'Childcare', 'Baby'),
    (200, 'Home', 'Home', 'Home'),
    (201, 'Home', 'Furniture', 'Armchair'),
    (202, 'Home', 'Maintenance', 'Wrench'),
    (203, 'Home', 'Operating Cost', 'Landmark'),
    (300, 'Entertainment', 'Dining Out', 'Utensils'),
    (301, 'Entertainment', 'Events', 'Music'),
    (302, 'Entertainment', 'Sports', 'Sailboat'),
    (400, 'Traveling', 'Traveling', 'Plane'),
    (401, 'Traveling', 'Car', 'Car'),
    (402, 'Traveling', 'Accommodation', 'Hotel');

UPDATE "Expense" SET "categoryId" = 100 WHERE "categoryId" IN ( 9 ,10);
UPDATE "Expense" SET "categoryId" = 101 WHERE "categoryId" IN (12 ,21, 23);
UPDATE "Expense" SET "categoryId" = 102 WHERE "categoryId" = 14;
UPDATE "Expense" SET "categoryId" = 103 WHERE "categoryId" = 25;
UPDATE "Expense" SET "categoryId" = 104 WHERE "categoryId" = 20;
UPDATE "Expense" SET "categoryId" = 200 WHERE "categoryId" = 11;
UPDATE "Expense" SET "categoryId" = 201 WHERE "categoryId" = 13;
UPDATE "Expense" SET "categoryId" = 202 WHERE "categoryId" IN (15, 37);
UPDATE "Expense" SET "categoryId" = 203 WHERE "categoryId" IN (16, 18, 38, 39, 40, 41, 42);
UPDATE "Expense" SET "categoryId" = 300 WHERE "categoryId" IN ( 7,  8);
UPDATE "Expense" SET "categoryId" = 301 WHERE "categoryId" IN ( 2,  3,  4,  5);
UPDATE "Expense" SET "categoryId" = 302 WHERE "categoryId" IN ( 6, 28);
UPDATE "Expense" SET "categoryId" = 400 WHERE "categoryId" IN (27, 29, 34, 35);
UPDATE "Expense" SET "categoryId" = 401 WHERE "categoryId" IN (30, 31, 33);
UPDATE "Expense" SET "categoryId" = 402 WHERE "categoryId" = 32;
UPDATE "Expense" SET "categoryId" = 0   WHERE "categoryId" > 1 AND "categoryId" < 100;

DELETE FROM "Category" WHERE "id" > 1 AND "id" < 100; 
