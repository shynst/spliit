-- 1. Create the Currency table
CREATE TABLE "Currency" (
    "code"   VARCHAR(5) NOT NULL,
    "symbol" VARCHAR(5) NOT NULL,
    "name"   TEXT NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("code")
);

-- 2. Seed it
-- source: https://github.com/ourworldincode/currency/blob/main/currencies.json
INSERT INTO `Currency` (`name`, `symbol`, `code`) VALUES
    ('Afghan Afghani', '؋', 'AFN'),
    ('Albanian Lek', 'L', 'ALL'),
    ('Algerian Dinar', 'د.ج.', 'DZD'),
    ('Angolan Kwanza', 'Kz', 'AOA'),
    ('Argentine Peso', '$', 'ARS'),
    ('Armenian Dram', 'դր', 'AMD'),
    ('Aruban Florin', 'ƒ', 'AWG'),
    ('Australian Dollar', '$', 'AUD'),
    ('Azerbaijani Manat', '₼', 'AZN'),
    ('Bahamian Dollar', '$', 'BSD'),
    ('Bahraini Dinar', 'د.ب.', 'BHD'),
    ('Bangladeshi Taka', '৳', 'BDT'),
    ('Barbadian Dollar', '$', 'BBD'),
    ('Belarusian Ruble', 'руб.', 'BYN'),
    ('Belize Dollar', '$', 'BZD'),
    ('Bermudian Dollar', '$', 'BMD'),
    ('Bhutanese Ngultrum', 'Nu.', 'BTN'),
    ('Bolivian Boliviano', 'Bs.', 'BOB'),
    ('Bosnia-Herzegovina Convertible Mark', 'КМ', 'BAM'),
    ('Botswana Pula', 'P', 'BWP'),
    ('Brazilian Real', 'R$', 'BRL'),
    ('British Pound Sterling', '£', 'GBP'),
    ('Brunei Dollar', '$', 'BND'),
    ('Bulgarian Lev', 'лв.', 'BGN'),
    ('Burundian Franc', 'FBu', 'BIF'),
    ('Cambodian Riel', '៛', 'KHR'),
    ('Canadian Dollar', '$', 'CAD'),
    ('Cape Verdean Escudo', '$', 'CVE'),
    ('Cayman Islands Dollar', '$', 'KYD'),
    ('Central African CFA Franc BEAC', 'Fr.', 'XAF'),
    ('CFP Franc (Franc Pacifique)', '₣', 'XPF'),
    ('Chilean Peso', '$', 'CLP'),
    ('Chinese Yuan', '¥元', 'CNY'),
    ('Colombian Peso', '$', 'COP'),
    ('Comorian Franc', 'CF', 'KMF'),
    ('Congolese Franc', '₣', 'CDF'),
    ('Cook Islands Dollar', '$', 'CKD'),
    ('Costa Rican Colón', '₡', 'CRC'),
    ('Croatian Kuna', 'kn', 'HRK'),
    ('Cuban Convertible Peso', '$', 'CUC'),
    ('Cuban Peso', '₱', 'CUP'),
    ('Czech Koruna', 'Kč', 'CZK'),
    ('Danish Krone', 'kr.', 'DKK'),
    ('Djiboutian Franc', 'ف.ج.', 'DJF'),
    ('Dominican Peso', '$', 'DOP'),
    ('East Caribbean Dollar', '$', 'XCD'),
    ('Egyptian Pound', 'ج.م.', 'EGP'),
    ('Eritrean Nakfa', 'ناكفا', 'ERN'),
    ('Ethiopian Birr', 'ብር', 'ETB'),
    ('Euro', '€', 'EUR'),
    ('Falkland Islands Pound', '£', 'FKP'),
    ('Faroese Króna', 'kr', 'FOK'),
    ('Fijian Dollar', '$', 'FJD'),
    ('Gambian Dalasi', 'D', 'GMD'),
    ('Georgian Lari', '₾', 'GEL'),
    ('Ghanaian Cedi', '₵', 'GHS'),
    ('Gibraltar Pound', '£', 'GIP'),
    ('Guatemalan Quetzal', '$', 'GTQ'),
    ('Guernsey Pound', '£', 'GGP'),
    ('Guinean Franc', 'FG', 'GNF'),
    ('Guyanese Dollar', '$', 'GYD'),
    ('Haitian Gourde', 'G', 'HTG'),
    ('Honduran Lempira', 'L', 'HNL'),
    ('Hong Kong Dollar', '$', 'HKD'),
    ('Hungarian Forint', 'Ft', 'HUF'),
    ('Icelandic Króna', 'kr', 'ISK'),
    ('Indian Rupee', '₹', 'INR'),
    ('Indonesian Rupiah', 'Rp', 'IDR'),
    ('Iranian Rial', '﷼', 'IRR'),
    ('Iraqi Dinar', 'د.ع.', 'IQD'),
    ('Israeli New Shekel', '₪', 'ILS'),
    ('Jamaican Dollar', '$', 'JMD'),
    ('Japanese Yen', '¥', 'JPY'),
    ('Jersey Pound', '£', 'JEP'),
    ('Jordanian Dinar', 'د.أ.', 'JOD'),
    ('Kazakhstani Tenge', '₸', 'KZT'),
    ('Kenyan Shilling', 'KSh', 'KES'),
    ('Kiribati Dollar', '$', 'KID'),
    ('Kuwaiti Dinar', 'د.ك.', 'KWD'),
    ('Kyrgyzstani Som', 'с', 'KGS'),
    ('Lao Kip', '₭', 'LAK'),
    ('Lebanese Pound', 'ل.ل.', 'LBP'),
    ('Lesotho Loti', 'L', 'LSL'),
    ('Liberian Dollar', '$', 'LRD'),
    ('Libyan Dinar', 'ل.د.', 'LYD'),
    ('Macanese Pataca', 'MOP$', 'MOP'),
    ('Macedonian Denar', 'ден', 'MKD'),
    ('Malagasy Ariary', 'Ar', 'MGA'),
    ('Malawian Kwacha', 'MK', 'MWK'),
    ('Malaysian Ringgit', 'RM', 'MYR'),
    ('Maldivian Rufiyaa', '.ރ', 'MVR'),
    ('Manx Pound', '£', 'IMP'),
    ('Mauritanian Ouguiya', 'أ.م.', 'MRU'),
    ('Mauritian Rupee', 'रु ', 'MUR'),
    ('Mexican Peso', '$', 'MXN'),
    ('Moldovan Leu', 'L', 'MDL'),
    ('Mongolian Tögrög', '₮', 'MNT'),
    ('Moroccan Dirham', 'د.م.', 'MAD'),
    ('Mozambican Metical', 'MT', 'MZN'),
    ('Myanmar Kyat', 'Ks', 'MMK'),
    ('Namibian Dollar', '$', 'NAD'),
    ('Nepalese Rupee', 'रू', 'NPR'),
    ('Netherlands Antillean Guilder', 'ƒ', 'ANG'),
    ('New Taiwan Dollar', '圓', 'TWD'),
    ('New Zealand Dollar', '$', 'NZD'),
    ('Nicaraguan Córdoba', 'C$', 'NIO'),
    ('Nigerian Naira', '₦', 'NGN'),
    ('North Korean Won', '₩', 'KPW'),
    ('Norwegian Krone', 'kr', 'NOK'),
    ('Omani Rial', 'ر.ع.', 'OMR'),
    ('Pakistani Rupee', 'Rs', 'PKR'),
    ('Panamanian Balboa', 'B/.', 'PAB'),
    ('Papua New Guinean Kina', 'K', 'PGK'),
    ('Paraguayan Guaraní', '₲', 'PYG'),
    ('Peruvian Sol', 'S/.', 'PEN'),
    ('Philippine Peso', '₱', 'PHP'),
    ('Pitcairn Islands Dollar', '$', 'PND'),
    ('Polish Zloty', 'zł', 'PLN'),
    ('Qatari Riyal', 'ر.ق.', 'QAR'),
    ('Romanian Leu', 'L', 'RON'),
    ('RTGS Dollar', 'ZWB', 'ZWB'),
    ('Russian Ruble', '₽', 'RUB'),
    ('Rwandan Franc', 'R₣', 'RWF'),
    ('Sahrawi Peseta', 'Ptas.', 'EHP'),
    ('Saint Helena Pound', '£', 'SHP'),
    ('Salvadoran Colón', '₡', 'SVC'),
    ('Samoan Tala', 'ST', 'WST'),
    ('Sao Tome and Príncipe Dobra', 'Db', 'STN'),
    ('Saudi Riyal', 'ر.س.', 'SAR'),
    ('Serbian Dinar', 'дин', 'RSD'),
    ('Seychellois Rupee', 'Rs', 'SCR'),
    ('Sierra Leonean Leone', 'Le', 'SLL'),
    ('Singapore Dollar', '$', 'SGD'),
    ('Solomon Islands Dollar', '$', 'SBD'),
    ('Somali Shilling', 'Ssh', 'SOS'),
    ('Somaliland Shilling', 'Sl', 'SLS'),
    ('South African Rand', 'R', 'ZAR'),
    ('South Korean Won', '₩', 'KRW'),
    ('South Sudanese Pound', 'SS£', 'SSP'),
    ('Sri Lankan Rupee', 'රු', 'LKR'),
    ('Sudanese Pound', 'ج.س.', 'SDG'),
    ('Surinamese Dollar', '$', 'SRD'),
    ('Swazi Lilangeni', 'L', 'SZL'),
    ('Swedish Krona', 'kr', 'SEK'),
    ('Swiss Franc', '₣', 'CHF'),
    ('Syrian Pound', 'ل.س.', 'SYP'),
    ('Tajikistani Somoni', 'SM', 'TJS'),
    ('Tanzanian Shilling', 'TSh', 'TZS'),
    ('Thai Baht', '฿', 'THB'),
    ('Tongan Paʻanga', 'PT', 'TOP'),
    ('Transnistrian Ruble', 'р.', 'PRB'),
    ('Trinidad and Tobago Dollar', '$', 'TTD'),
    ('Tunisian Dinar', 'د.ت.', 'TND'),
    ('Turkish Lira', '₺', 'TRY'),
    ('Turkmenistan Manat', 'T', 'TMT'),
    ('Tuvaluan Dollar', '$', 'TVD'),
    ('Ugandan Shilling', 'Sh', 'UGX'),
    ('Ukrainian Hryvnia', 'грн', 'UAH'),
    ('United Arab Emirates Dirham', 'د.إ.', 'AED'),
    ('Uruguayan Peso', '$', 'UYU'),
    ('US Dollar', '$', 'USD'),
    ('Uzbekistani Som', 'сум', 'UZS'),
    ('Vanuatu Vatu', 'VT', 'VUV'),
    ('Venezuelan Bolívar Digital', 'Bs.', 'VED'),
    ('Venezuelan Bolívar Soberano', 'Bs.F', 'VES'),
    ('Vietnamese Dong', '₫', 'VND'),
    ('West African CFA Franc BCEAO', '₣', 'XOF'),
    ('Yemeni Rial', 'ر.ي.', 'YER'),
    ('Zambian Kwacha', 'ZK', 'ZMW'),
    ('Zimbabwean Dollar', '$', 'ZWL');

-- 3. Add the new column as NULLABLE first (no default/FK yet) so we
--    can backfill it row by row without a constraint fighting us.
ALTER TABLE "Expense" ADD COLUMN "currencyCode" VARCHAR(5);

-- 4. Backfill from the old free-text "currency" symbol column.
UPDATE "Expense"
SET "currencyCode" = CASE "currency"
    WHEN '$'     THEN 'USD'
    WHEN '$U'    THEN 'UYU'
    WHEN '£'     THEN 'GBP'
    WHEN '¥'     THEN 'JPY'
    WHEN '฿'     THEN 'THB'
    WHEN '₡'     THEN 'CRC'
    WHEN '₦'     THEN 'NGN'
    WHEN '₩'     THEN 'KRW'
    WHEN '₪'     THEN 'ILS'
    WHEN '₫'     THEN 'VND'
    WHEN '₱'     THEN 'PHP'
    WHEN '₲'     THEN 'PYG'
    WHEN '₴'     THEN 'UAH'
    WHEN 'Af'    THEN 'AFN'
    WHEN 'AR$'   THEN 'ARS'
    WHEN 'AU$'   THEN 'AUD'
    WHEN 'B/.'   THEN 'PAB'
    WHEN 'BD'    THEN 'BHD'
    WHEN 'BN$'   THEN 'BND'
    WHEN 'Br'    THEN 'BYN'
    WHEN 'Bs.F.' THEN 'VEF'
    WHEN 'Bs'    THEN 'BOB'
    WHEN 'BZ$'   THEN 'BZD'
    WHEN 'C$'    THEN 'NIO'
    WHEN 'CA$'   THEN 'CAD'
    WHEN 'CF'    THEN 'KMF'
    WHEN 'CFA'   THEN 'XOF'
    WHEN 'CL$'   THEN 'CLP'
    WHEN 'CN¥'   THEN 'CNY'
    WHEN 'CO$'   THEN 'COP'
    WHEN 'CV$'   THEN 'CVE'
    WHEN 'DA'    THEN 'DZD'
    WHEN 'din.'  THEN 'RSD'
    WHEN 'Dkr'   THEN 'DKK'
    WHEN 'DT'    THEN 'TND'
    WHEN 'EBr'   THEN 'ETB'
    WHEN 'Ekr'   THEN 'EEK'
    WHEN 'FBu'   THEN 'BIF'
    WHEN 'FCFA'  THEN 'XAF'
    WHEN 'Fdj'   THEN 'DJF'
    WHEN 'FG'    THEN 'GNF'
    WHEN 'Ft'    THEN 'HUF'
    WHEN 'GH₵'   THEN 'GHS'
    WHEN 'HK$'   THEN 'HKD'
    WHEN 'Ikr'   THEN 'ISK'
    WHEN 'J$'    THEN 'JMD'
    WHEN 'JD'    THEN 'JOD'
    WHEN 'Kč'    THEN 'CZK'
    WHEN 'KD'    THEN 'KWD'
    WHEN 'KM'    THEN 'BAM'
    WHEN 'kn'    THEN 'HRK'
    WHEN 'Ksh'   THEN 'KES'
    WHEN 'LB£'   THEN 'LBP'
    WHEN 'LD'    THEN 'LYD'
    WHEN 'Ls'    THEN 'LVL'
    WHEN 'Lt'    THEN 'LTL'
    WHEN 'man.'  THEN 'AZN'
    WHEN 'MOP$'  THEN 'MOP'
    WHEN 'MTn'   THEN 'MZN'
    WHEN 'MURs'  THEN 'MUR'
    WHEN 'MX$'   THEN 'MXN'
    WHEN 'N$'    THEN 'NAD'
    WHEN 'Nfk'   THEN 'ERN'
    WHEN 'Nkr'   THEN 'NOK'
    WHEN 'NPRs'  THEN 'NPR'
    WHEN 'NT$'   THEN 'TWD'
    WHEN 'NZ$'   THEN 'NZD'
    WHEN 'PKRs'  THEN 'PKR'
    WHEN 'QR'    THEN 'QAR'
    WHEN 'R'     THEN 'ZAR'
    WHEN 'R$'    THEN 'BRL'
    WHEN 'RD$'   THEN 'DOP'
    WHEN 'RM'    THEN 'MYR'
    WHEN 'Rp'    THEN 'IDR'
    WHEN 'Rs'    THEN 'INR'
    WHEN 'S/.'   THEN 'PEN'
    WHEN 'S$'    THEN 'SGD'
    WHEN 'Skr'   THEN 'SEK'
    WHEN 'SLRs'  THEN 'LKR'
    WHEN 'SR'    THEN 'SAR'
    WHEN 'Ssh'   THEN 'SOS'
    WHEN 'SY£'   THEN 'SYP'
    WHEN 'T$'    THEN 'TOP'
    WHEN 'Tk'    THEN 'BDT'
    WHEN 'TL'    THEN 'TRY'
    WHEN 'TSh'   THEN 'TZS'
    WHEN 'TT$'   THEN 'TTD'
    WHEN 'USh'   THEN 'UGX'
    WHEN 'YR'    THEN 'YER'
    WHEN 'ZK'    THEN 'ZMK'
    WHEN 'zł'    THEN 'PLN'
    ELSE "currency"
END;

-- 5. Now that every row has a value, enforce NOT NULL + set the
--    column default for future inserts.
ALTER TABLE "Expense" ALTER COLUMN "currencyCode" SET NOT NULL;
ALTER TABLE "Expense" ALTER COLUMN "currencyCode" SET DEFAULT 'EUR';

-- 6. Drop the old column and its index, add the new index + FK.
DROP INDEX IF EXISTS "Expense_currency_idx";
ALTER TABLE "Expense" DROP COLUMN "currency";

CREATE INDEX "Expense_currencyCode_idx" ON "Expense"("currencyCode");

ALTER TABLE "Expense" ADD CONSTRAINT "Expense_currencyCode_fkey"
    FOREIGN KEY ("currencyCode") REFERENCES "Currency"("code")
    ON DELETE RESTRICT ON UPDATE CASCADE;
