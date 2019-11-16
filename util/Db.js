
const fs = require('fs');

//TODO: Add periodic db json file backup via email

let db = [],
    categories = [
        { title: 'First Timers', tag: 'first-timers' },
        { title: 'Outreach Contacts', tag: 'outreach-contacts' },
        { title: 'Established', tag: 'established' },
        { title: 'New Converts', tag: 'new-converts' },
    ];
let dataDetails = [];
const DB_PATH = 'db/database.json';

let init = () => {
    return new Promise((resolve, reject) => {
        try {
            resolve(JSON.parse(fs.readFileSync(DB_PATH)));
        } catch (err) {
            reject(err);
        }
    });

};

if (fs.existsSync(DB_PATH)) {
    init()
        .then(rdb => {
            db = rdb.db;
            categories = rdb.categories;
            dataDetails = rdb.dataDetails;
            module.exports.db = db;
            module.exports.categories = categories;
            module.exports.dataDetails = dataDetails;
        })
        .catch(err => console.log(err));
} else {
    module.exports.db = db;
    module.exports.categories = categories;
    module.exports.dataDetails = dataDetails;
}



module.exports.saveDB = () => {
    fs.writeFile(DB_PATH, JSON.stringify({
        db, categories, dataDetails
    }), 'utf8', (err) => console.log(err));
};
