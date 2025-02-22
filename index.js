const path = require('path')

const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const Blog = require('./models/blog')
require('dotenv').config()

const app = express()

const dbURI = process.env.MONGO_URI
mongoose.connect(dbURI)
    .then((result)=>{
        app.listen(process.env.PORT)
    })
    .catch((err)=>{console.log(err)})



app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//middleware and static files
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))


app.get('/debug', (req, res)=>{
    console.log('Views directory:', app.get('views'));
    console.log('Current directory:', __dirname);
    res.send('Check logs');
})

app.get('/', (req, res)=>{
    res.redirect('/blogs')
})

app.get ('/blogs', (req,res)=>{
    Blog.find().sort({ createdAt:-1 })
        .then(result=>{
            res.render('index', { title: 'All blogs', blogs: result});
        })
        .catch(err=>console.log(err))
})

app.get('/about', (req, res)=>{
    res.render('about', { title: 'About'});
})

app.post('/blogs', (req,res)=>{
    const blog = new Blog(req.body)

    blog.save()
        .then(result=>res.redirect('/blogs'))
        .catch(err=>console.log(err))
    
})

app.get('/blogs/create', (req, res)=>{
    res.render('create', { title: 'Create'});
})

app.get('/blogs/:id', (req,res)=>{
    const id = req.params.id;
    Blog.findById(id)
        .then(result=>{
            
            res.render('details', { title: "Blog Details", blog: result })
        })
        .catch(
            err=>{
                console.log(err);
                res.status(404).render('404', {title: '404'})
        })
})

app.delete('/blogs/:id', (req,res)=>{
    const id = req.params.id;

    Blog.findByIdAndDelete(id)
        .then(result=>{
            res.json({ redirect: '/blogs'})
        })
        .catch(err=>console.log(err))
})

app.use((req, res)=>{
    console.log('404 handler triggered');
    console.log('Attempting to render from:', app.get('views'));
    try {
        res.status(404).render('404', { title: '404' });
    } catch (error) {
        console.error('Error rendering 404:', error);
        res.status(404).send('Page not found');
    }
})

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('404', { title: '404' });
})
