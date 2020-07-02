



const express = require('express');
const app = express();
const PORT = 3000;
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt')
const faker = require('faker');
const mongoose = require('mongoose');
const config = require('./config')




 
mongoose.connect(`mongodb+srv://ExpressMovies:${config.db.password}@cluster0-tkpe4.mongodb.net/${config.db.user}?retryWrites=true&w=majority`)
.then(() =>{
    console.log('Succesfully connected to MongoDB ATLAS !'); 
})
.catch((err) => {  
  console.log('Unable to connect ! ');
  console.error(err);
  
  
})


const movieSchema = mongoose.Schema({
    movietitle: String,
    movieyear: Number
})

const Movie = mongoose.model('Movie', movieSchema);





/*mongoose.connect('mongodb+srv://ExpressMovies:<Bwana1@cluster0-tkpe4.mongodb.net/ExpressMovies?retryWrites=true&w=majority',{ useNewUrlParser: true })
const db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error: cannot connect to my DB'));
db.once('open',() => {
    console.log('connected to the DB :)');
    
})*/




let mangaCulte = [];


//middleware
app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }))

const secret = 'qsdjS12ozehdoIJ123DJOZJLDSCqsdeffdg123ER56SDFZedhWXojqshduzaohduihqsDAqsdq';
app.use(expressJwt({ secret: secret }).unless({path: ['/movies','/','/login','/movies-search', new RegExp('/movies.*/','i'),new RegExp('/movie-details.*/','i')]}));




// Templates
app.set('views','./views')
app.set('view engine','ejs')

//route


app.get('/movies', (req,res) => {
  
    const title = 'Les animes les plus cultes !!! '

   FilmCulte = []

    Movie.find((err,movies) => {
        if (err) {
            console.error('could not retrieve movies from DB');
            res.sendStatus(500)
        }else{
            FilmCulte = movies
            res.render('movies', {movies : FilmCulte, title : title})
        }

    });

   
})

app.post('/movies' , upload.fields([]),(req,res) => {
     if (!req.body) {
         return res.sendStatus(500);
     }else{
         const formData = req.body;
         console.log('formData', formData);
         const title = req.body.movietitle
         const year = req.body.movieyear
         const myMovie = new Movie({ movietitle: title , movieyear: year})
         myMovie.save((err,savedMovie) => {
             if (err) {
                 console.error(err);
             }else{
                 console.log(savedMovie);
                 res.sendStatus(201);
                 
             }
         })
     }
})

/*app.post('/movies' , (req,res) =>{
    //res.send('le titre est ' + req.body.title + 'le heros est ' + req.body.heros)
    
   
  
    
  
    console.log(mangaCulte);
    res.send(mangaCulte);
    
})*/


app.get('/movies/add', (req,res) =>{
   
    res.send('Ajouté votre formulaire ici ! ')
})
app.get('/movies/:id', (req ,res ) => {
   const id = req.params.id;

   res.render('movie-details', { movieid : id });
  
})

app.get('/movie-details/:id', (req, res) => {
    const id = req.params.id;
    Movie.findById(id, (err, movie) => {
        console.log(movie);  
        
        res.render('movie-details' , {movie: movie})
    })
 
})

app.post('/movie-details/:id',upload.fields([]),(req , res) => {
   if (!req.body) {
       return res.sendStatus(500)
   }   
       console.log(req.body.movietitle,req.body.movieyear);
       const id = req.params.id
       mongoose.set('useFindAndModify', false);
       Movie.findByIdAndUpdate(id, {$set: {movietitle : req.body.movietitle, movieyear:req.body.movieyear}}, { new: true }, (err, movie) =>
       {
           if(err) {
               connsole.log(err)
               return res.send('Film non MAJ')               
           }
           res.redirect('/movies')
        })
})


/*app.delete('/movie-details/:id',upload.fields([]),(req, res) => {
    const id = req.params.id

    Movie.deleteOne(id , (err , movie) => {
      res.sendStatus(202)
  })
});*/

app.delete('/movie-details/:id', (req, res, next) => {
    Movie.deleteOne({_id: req.params.id}).then(
      () => {
        res.status(200).json({
          message: 'Deleted!'
        });
      }
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
    );
  });






app.get('/movies-search', (req, res) => {
  res.render('movies-search')
})

app.get('/login', (req, res) => {
  res.render('login', {title: 'Espace membre'})
})

const fakeUser = {email: "fakeuser@fake.fr", password: "lalala"}

app.post('/login',(req, res) => {
    if (!req.body) {
        console.log('LOGIN POST '+req.body);   
        return res.sendStatus(500);
    }else if(fakeUser.email === req.body.email && fakeUser.password === req.body.password  ){
        const myToken = jwt.sign({iss: 'http://expressmovies.fr',user: 'Samy', role:'moderator'},secret)
        res.json(myToken)
    }
    else{
        res.sendStatus(401)
    }

})

app.get('/member-only', (req, res) => {
    console.log(req.user);
    res.send(req.user)
      
    //res.render('member')
})


app.get('/', (req,res) => {

res.render('index')
})

// port call 
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
    
})

