-- AlterTable
ALTER TABLE "Category" ADD COLUMN "icon" TEXT;

-- Insert category icons
UPDATE "Category" SET "icon" = 'Banknote' WHERE "id" = 0;
UPDATE "Category" SET "icon" = 'Banknote' WHERE "id" = 1;
UPDATE "Category" SET "icon" = 'FerrisWheel' WHERE "id" = 2;
UPDATE "Category" SET "icon" = 'Dices' WHERE "id" = 3;
UPDATE "Category" SET "icon" = 'Clapperboard' WHERE "id" = 4;
UPDATE "Category" SET "icon" = 'Music' WHERE "id" = 5;
UPDATE "Category" SET "icon" = 'Dribbble' WHERE "id" = 6;
UPDATE "Category" SET "icon" = 'Apple' WHERE "id" = 7;
UPDATE "Category" SET "icon" = 'Utensils' WHERE "id" = 8;
UPDATE "Category" SET "icon" = 'ShoppingCart' WHERE "id" = 9;
UPDATE "Category" SET "icon" = 'Wine' WHERE "id" = 10;
UPDATE "Category" SET "icon" = 'Home' WHERE "id" = 11;
UPDATE "Category" SET "icon" = 'Plug' WHERE "id" = 12;
UPDATE "Category" SET "icon" = 'Armchair' WHERE "id" = 13;
UPDATE "Category" SET "icon" = 'SprayCan' WHERE "id" = 14;
UPDATE "Category" SET "icon" = 'Wrench' WHERE "id" = 15;
UPDATE "Category" SET "icon" = 'Landmark' WHERE "id" = 16;
UPDATE "Category" SET "icon" = 'Cat' WHERE "id" = 17;
UPDATE "Category" SET "icon" = 'Home' WHERE "id" = 18;
UPDATE "Category" SET "icon" = 'HandPlatter' WHERE "id" = 19;
UPDATE "Category" SET "icon" = 'Baby' WHERE "id" = 20;
UPDATE "Category" SET "icon" = 'Shirt' WHERE "id" = 21;
UPDATE "Category" SET "icon" = 'LibraryBig' WHERE "id" = 22;
UPDATE "Category" SET "icon" = 'Gift' WHERE "id" = 23;
UPDATE "Category" SET "icon" = 'Landmark' WHERE "id" = 24;
UPDATE "Category" SET "icon" = 'Stethoscope' WHERE "id" = 25;
UPDATE "Category" SET "icon" = 'Percent' WHERE "id" = 26;
UPDATE "Category" SET "icon" = 'Bus' WHERE "id" = 27;
UPDATE "Category" SET "icon" = 'Bike' WHERE "id" = 28;
UPDATE "Category" SET "icon" = 'Train' WHERE "id" = 29;
UPDATE "Category" SET "icon" = 'Car' WHERE "id" = 30;
UPDATE "Category" SET "icon" = 'Fuel' WHERE "id" = 31;
UPDATE "Category" SET "icon" = 'Hotel' WHERE "id" = 32;
UPDATE "Category" SET "icon" = 'ParkingSquare' WHERE "id" = 33;
UPDATE "Category" SET "icon" = 'Plane' WHERE "id" = 34;
UPDATE "Category" SET "icon" = 'CarTaxiFront' WHERE "id" = 35;
UPDATE "Category" SET "icon" = 'Cog' WHERE "id" = 36;
UPDATE "Category" SET "icon" = 'Sparkles' WHERE "id" = 37;
UPDATE "Category" SET "icon" = 'Lightbulb' WHERE "id" = 38;
UPDATE "Category" SET "icon" = 'ThermometerSun' WHERE "id" = 39;
UPDATE "Category" SET "icon" = 'Trash' WHERE "id" = 40;
UPDATE "Category" SET "icon" = 'Wifi' WHERE "id" = 41;
UPDATE "Category" SET "icon" = 'Droplets' WHERE "id" = 42;
UPDATE "Category" SET "icon" = 'Banknote' WHERE "id" > 42;

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "icon" SET NOT NULL;
