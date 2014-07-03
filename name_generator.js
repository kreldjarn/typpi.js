/**********************
 *                    *
 *      typpi.js      *
 *                    *
 **********************/
// Random name generator module

// TODO:
// parse values from .csv
prefix = ['Bjúgna',
          'Pylsu',
          'Epla',
          'Eitur',
          'Typpa',
          'Fugla',
          'Vél-',
          'Gúrku',
          'Tungl',
          'Þang',
          'Stál',
          'Barna',
          'Salt',
          'Eðlu',
          'Sveskju',
          'Skúffu',
          'Sorgar',
          'Gleði',
          'Saur',
          'Þarma',
          'Kakó',
          'Kaffi',
          'Svína',
          'Ellilífeyris',
          'Forsendu',
          'Legvatns',
          'Sveppa',
          'blog.central.is/',
          'Drasl',
          'Ógeðs',
          'Truntu',
          'Frussu',
          'Pussu',
          'Fröllu',
          'Ljóða',
          'Krabba',
          'Rusla',
          'Fiski',
          'Hárgreiðslu',
          'Niðursuðu',
          'Sjávarútvegs',
          'Líftækni',
          'Tauga',
          'Taugaveiklunar',
          'Móðursýkis',
          'Bauna',
          'Stjórnmála',
          'Forseta',
          'Fitu',
          'Kransæða',
          'Háls-, nef- og eyrna',
          'Sleik',
          'Kántrý',
          'Diskó',
          'Legganga',
          'Frygðar',
          'Klám',
          'Tilfinninga',
          'Getnaðar',
          'Virðingar',
          'Gæða',
          'Drauga',
          'Sykur',
          'Eiturlyfja',
          'Kisu',
          'Hvolpa',
          'Þvag',
          'Kleinu',
          'Ástar',
          'Haturs',
          'Kusk'];

postfix = ['maður',
           'sali',
           'mauk',
           'hrúga',
           'messa',
           'land.is',
           'flaska',
           'fótur',
           'grautur',
           'haus',
           'kaka',
           'partí',
           'samkoma',
           'samfélag',
           'söfnuður',
           'sölumaður',
           'bóndi',
           'fíkill',
           'bolla',
           'bolli',
           'vatn',
           'skjaldborgin',
           'brestur',
           'neytandi',
           'elskhugi',
           'Group hf.',
           'prestur',
           'sinnep',
           'pylsa',
           'fræðingur',
           'tæknir',
           'dúlla',
           'krútt',
           'sprengja',
           'skvísa',
           'hönnuður',
           'listamaður',
           'verkfræðingur',
           'smiður',
           'Prinsessa69@hotmail.com',
           'menni',
           'læknir',
           'frömuður',
           'frumkvöðull',
           'fullnæging',
           'örlög',
           'veiki',
           'rass',
           'stuna',
           'sýking',
           'galdur',
           'pizza',
           'heilkenni',
           'kæfa',
           'klám',
           'draugur',
           'kisa',
           'klístur',
           'áróður',
           'hvolpur',
           'tæki',
           'lánasjóður',
           'moli',
           'hrúður',
           'drasl',
           'barn',
           'blóð',
           'vessi',
           'safi',
           'mergur',
           'bomba',
           'snúður'];

function generate()
{
    return prefix[Math.floor(Math.random() * prefix.length)] + 
           postfix[Math.floor(Math.random() * postfix.length)];
}

var FORBIDDEN_NAMES = ['Barnaklám', 'blog.central.is/Prinsessa69@hotmail.com',
    'blog.central.is/land.is'];

exports.random  = function()
{
    do
        name = generate();
    while (FORBIDDEN_NAMES.indexOf(name) >= 0)
    return name;
}


