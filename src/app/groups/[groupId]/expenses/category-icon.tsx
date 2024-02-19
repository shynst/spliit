import { Category } from '@prisma/client'
import * as lucide from 'lucide-react'

export function CategoryIcon({
  category,
  ...props
}: { category: Category | null } & lucide.LucideProps) {

  const Icon: lucide.LucideIcon =
    (category && (lucide as any)[category.icon]) ?? lucide.Banknote
  return <Icon {...props} />
}

/*
categoryId   	grouping	name	COUNT(categoryId)	
0   Uncategorized 	General           	489   ->    0   General 	      General
1   Uncategorized 	Payment           	60	  ->    1   General 	      Payment

2   Entertainment 	Entertainment     	7     ->   201   Entertainment 	Events
4   Entertainment 	Movies            	4	    ->   201   Entertainment 	Events
5   Entertainment 	Music             	8	    ->   201   Entertainment 	Events
6   Entertainment 	Sports            	31	  ->   202   Entertainment 	Sports

7   Food and Drink	Food and Drink    	1	    ->   200   Entertainment 	Dining Out
8   Food and Drink	Dining Out        	286	  ->   200   Entertainment 	Dining Out	
9   Food and Drink	Groceries         	654	  ->   100   Life        	  Groceries
10	Food and Drink	Liquor            	33	  ->   100   Life        	  Groceries	

11	Home            Home              	3	    ->    303	Home          	Rent
12	Home          	Electronics	        23    -> 	  104	Life            Shopping
13	Home          	Furniture         	40	  ->    300	Home            Furniture 
14	Home          	Household Supplies	129	  ->    101	Life            Household Supplies
15	Home          	Maintenance	        23    ->    301	Home          	Maintenance
16	Home          	Mortgage	          66    ->    302	Home          	Operating Cost
17	Home          	Pets              	3	    ->    0   General       	General
18	Home          	Rent              	13	  ->    302	Home          	Operating Cost

20	Life          	Childcare	          94    ->    105	Life          	Childcare
21	Life          	Clothing          	27    ->    103	Life            Clothing   
23	Life          	Gifts	              67    ->    104	Life            Shopping
24	Life          	Insurance	          1     ->    302	Home          	Operating Cost
25	Life          	Medical Expenses	  89    ->    102	Life            Medical Expenses
26	Life          	Taxes             	17	  ->    0   General 	      General

27	Transportation	Transportation    	5     ->    401	Traveling	      Transportation	
28	Transportation	Bicycle           	3	    ->    202 Entertainment 	Sports	
29	Transportation	Bus/Train         	11    ->    401	Traveling	      Transportation	
30	Transportation	Car               	37	  ->    400	Traveling	      Car
31	Transportation	Gas/Fuel          	54	  ->    400	Traveling	      Car
32	Transportation	Hotel             	48	  ->    402	Traveling	      Accommodation
33	Transportation	Parking           	13    ->    400	Traveling	      Car	
34	Transportation	Plane             	9     ->    401	Traveling	      Transportation	
35	Transportation	Taxi              	6     ->    401	Traveling	      Transportation

37	Utilities       Cleaning          	25    ->    301	Home          	Maintenance	
38	Utilities       Electricity        	29    ->    302	Home          	Operating Cost
41	Utilities       TV/Phone/Internet	  29    ->    302	Home          	Operating Cost
42	Utilities       Water             	5     ->    302	Home          	Operating Cost
*/
