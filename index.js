const express = require('express');
const config=require('config');
const startupDebugger=require('debug')('app:startup');
const dbDebugger=require('debug')('app:db');
const helmet = require('helmet');
const morgan = require('morgan');
const Joi = require('joi');
const app = express();
app.use(express.json());

app.set('view engine','pug');
app.set('views','./views')

console.log(`Node env: ${process.env.NODE_ENV}`);
console.log(`app: ${app.get('env')}`);

console.log('Application Name: '+config.get('name'));
console.log('Mail Server Name: '+config.get('mail.host'));
console.log('Password: '+config.get('mail.password'));

app.use(function (req, res, next) {
    console.log('Logging');
    next();
});
app.use(helmet());
if(app.get('env')==='Development'){
    app.use(morgan('tiny'));
    //console.log('Morgan enabled');
    startupDebugger('Morgan enable');
}

dbDebugger('Connected to database');

const courses = [
    { id: 1, name: 'course1' },
    { id: 2, name: 'course2' },
    { id: 3, name: 'course3' }
]
app.get('/', (req, res) => {
    res.send('Hi I am here.. ');
});

// app.get('/api/courses/:id', (req, res) => {
//     res.send(req.params.id);
// });

// app.get('/api/courses/:year/:month', (req, res) => {
//     res.send(req.params);
// });
app.get('/api/courses', (req, res) => {
   // res.send(courses);
   res.render('index',{title:'My Express App', message:'Hello'})
});
app.get('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id))
    if (!course) return res.status(404).send('The course could not be found');
    res.send(course);
})

// app.get('/api/courses/:year/:month', (req, res) => {
//     res.send(req.query);
// });

app.post('/api/courses', (req, res) => {
    // const schema = {
    //     name: Joi.string().min(3).required()
    // };
    // const result = Joi.validate(req.body, schema);
    // //console.log(result);
    const { error } = validateCourse(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    const course = {
        id: courses.length + 1,
        name: req.body.name
    };
    courses.push(course);
    res.send(course);
})

app.put('/api/courses/:id', (req, res) => {
    console.log("Hello");
    const course = courses.find(c => c.id === parseInt(req.params.id));
    console.log(course);
    if (!course) return res.status(404).send('The course with given id does not exist');
    // const schema = {
    //     name: Joi.string().min(3).required()
    // };
    // const result = Joi.validate(req.body, schema);
    const { error } = validateCourse(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    course.name = req.body.name;
    res.send(course);
})

app.delete('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).send('The course with given id does not exist');
    const index = courses.indexOf(course);
    courses.splice(index, 1);
    res.send(course);
})
function validateCourse(course) {
    const schema = {
        name: Joi.string().min(3).required()
    };
    return Joi.validate(course, schema);
}
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));