UPDATE `Expense` SET `categoryId` = 200 WHERE `categoryId` IN (201 , 202);

INSERT INTO `Category` (`id`, `grouping`, `name`, `icon`) VALUES (105, 'Life', 'Cats', 'Cat');
UPDATE `Category` SET `name` = 'Alma' WHERE `id` = 104;
UPDATE `Category` SET `name` = 'Krido', `icon` = 'Flower' WHERE `id` = 201;
DELETE FROM `Category` WHERE `id` = 202; 
