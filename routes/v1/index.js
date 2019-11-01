
let express = require('express');
let bodyParser = require('body-parser');
const Response = require('../../util/Response');

let DB = require('../../util/Db');

const app = express();

app.use(bodyParser());
app.use(express.json());


app.get('/get_categories', (req, res) => {
    res.json(Response.success(DB.categories));
});

app.get('/get_category_data', (req, res) => {
    const category = req.param('category', undefined);
    if (!category) {
        const resp = Response.error(`No Category value sent`);
        res.status(resp.status).json(resp); //should exit
        return;
    }
    const data = DB.db.filter(d => d.category === category);
    if (!data) {
        const resp = Response.error(`Category '${category}' not found`);
        res.status(resp.status).json(resp); //should exit
    } else {
        //sort by the once that have been not been called recently
        //better way: a.date_last_called - b.date_last_called
        //lets just leave it like that
        data.sort((a, b) => {
            if (a.date_last_called > b.date_last_called) return 1;
            else if (b.date_last_called > a.date_last_called) return -1;
            else return 0;
        });
        res.json(Response.success(data));
    }
});

app.get('/get_table_column_titles', (req, res) => {
    res.json(Response.success(['Phone', 'Name', 'Last called']));
});

app.get('/get_data_detail', (req, res) => {
    const id = req.param('id', undefined);
    if (!id) {
        const resp = Response.error(`Invalid Info ID value sent`);
        res.status(resp.status).json(resp); //should exit
        return;
    }
    const index = DB.db.findIndex((d) => d.id === parseInt(id));
    if (index === -1) {
        const resp = Response.error(`Data ID '${id}' was not found in the database`);
        res.status(resp.status).json(resp); //should exit
    } else {
        let detail = {};
        res.json(Response.success(Object.assign(detail, DB.dataDetails[index], DB.db[index])));
    }
});

app.get('/search_phone', (req, res) => {
    const phone = req.param('phone', undefined);
    if (!phone) {
        const resp = Response.error(`API needs a valid phone number to search`);
        res.status(resp.status).json(resp); //should exit
        return;
    }
    const result = DB.db.filter((d) => d.phone.match(phone) !== null);
    result.sort((a, b) => {
        if (a.date_last_called > b.date_last_called) return 1;
        else if (b.date_last_called > a.date_last_called) return -1;
        else return 0;
    });
    res.json(Response.success(result));
});

app.get('/search_date_period', (req, res) => {
    const from = req.param('from', undefined);
    const to = req.param('to', undefined);
    const category = req.param('category', undefined);
    if (!from || !to || !category) {
        const resp = Response.error(`Date period from, to and category must be properly passed`);
        res.status(resp.status).json(resp); //should exit
        return;
    }
    const result = DB.db.filter((d) => d.category === category && d.date_created >= parseInt(from) && d.date_created <= parseInt(to));
    result.sort((a, b) => {
        if (a.date_last_called > b.date_last_called) return 1;
        else if (b.date_last_called > a.date_last_called) return -1;
        else return 0;
    });
    res.json(Response.success(result));
});

app.get('/move_category_data', (req, res) => {
    const category = req.param('category', undefined);
    const id = req.param('id', undefined);
    if (!category || !id) {
        const resp = Response.error(`Invalid Category or ID value sent`);
        res.status(resp.status).json(resp); //should exit
        return;
    }
    const index = DB.db.findIndex((d) => d.id === parseInt(id));
    if (index === -1) {
        const resp = Response.error(`category '${category}' not found`);
        res.status(resp.status).json(resp); //should exit
    } else {
        DB.db[index].category = category;
        res.json(Response.success('ok'));
        DB.saveDB();
    }
});

app.post('/edit_data_detail', (req, res) => {
    const newComment = req.body.new_comment;
    const prayer = req.body.prayer;
    const date_last_called = req.body.date_last_called;
    const id = req.body.id;

    if (newComment === undefined || id === undefined || prayer === undefined || date_last_called === undefined) {
        const resp = Response.error("'new_comment', 'date_last_called', 'prayer' and 'id' parameters must all be sent");
        res.status(resp.status).json(resp); //should exit
        return;
    }
    const index = DB.db.findIndex((d) => d.id === parseInt(id));
    if (index === -1) {
        const resp = Response.error(`Row with ID '${id}' was not found`);
        res.status(resp.status).json(resp); //should exit
    } else {
        DB.db[index].date_last_called = date_last_called;
        DB.dataDetails[index].date_last_called = date_last_called;
        DB.dataDetails[index].comments = newComment;
        DB.dataDetails[index].prayer = prayer;
        res.json(Response.success('ok'));
        DB.saveDB();
    }
});

app.get('/delete_data', (req, res) => {
    const id = req.param('id', undefined);
    if (!id) {
        const resp = Response.error(`Invalid Info ID value sent`);
        res.status(resp.status).json(resp); //should exit
        return;
    }
    const index = DB.db.findIndex((d) => d.id === parseInt(id));
    if (index === -1) {
        const resp = Response.error(`Data ID '${id}' was not found in the database`);
        res.status(resp.status).json(resp); //should exit
    } else {
        const id_ = DB.db[index].id;
        DB.dataDetails.splice(index, 1);
        DB.db.splice(index, 1);
        res.json(Response.success({ id: id_ }));
        DB.saveDB();
    }
});

app.post('/add_data', (req, res) => {
    const body = req.body;
    //probably don't need error checking here
    const phone = body.phone;
    const name = body.name;
    const category = body.category;
    //comment, prayer and address are optional
    if (!phone || !name || !category) {
        const resp = Response.error('phone, name and category parameters are all required!');
        res.status(resp.status).json(resp); //should exit
        return;
    }
    const index = DB.db.findIndex((d) => d.phone === phone);
    if (index !== -1) {
        const resp = Response.error(`Record with phone number '${phone}' already exists in the database under category ${DB.db[index].category}!`);
        res.status(resp.status).json(resp); //should exit
    } else {
        let data = {};
        data.name = name;
        data.phone = phone;
        data.category = category;
        data.id = DB.db.length + 1;

        let detail = {};
        detail.id = data.id;
        detail.comments = body.comment || "";
        detail.address = body.address || "";
        detail.prayer = body.prayer || "";

        detail.date_created = new Date().getTime();
        detail.date_last_called = body.been_called === true ? detail.date_created : 0;
        //duplicate in first table
        data.date_created = detail.date_created;
        data.date_last_called = detail.date_last_called;

        DB.db.push(data);
        DB.dataDetails.push(detail);
        res.json(Response.success(data));
        DB.saveDB();
    }
});


module.exports = app;