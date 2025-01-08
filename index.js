const express = require("express"),
  morgan = require("morgan");
const app = express();

//middleware
app.use(morgan("common"));

// GET requests
app.get("/", (req, res) => {
  res.send("Welcome to myFlix!");
});

app.get("/movies", (req, res) => {  
  res.send('Successful GET request returning data on all movies.');
});

app.get("/movies/:title", (req, res) => {
  res.send('Successful GET request returning data for movie {title}.');
});

app.get("/genre/:genrename", (req, res) => {
  res.send('Successful GET request returning info about the genre and a list of movies under that genre.');
});
app.get("/directors/:dirname", (req, res) => {  
  res.send('Successful GET request returning a JSON object containing data(bio, birth year, death year,movies) about given directors name.');
});
app.post("/users/adduser", (req, res) => {  
  res.send('Successfully added new user.');
});
app.post("/users/:username/favorites", (req, res) => {  
  res.send('Successfully added movie to favories.');
});
app.put("/users/:username", (req, res) => {  
  res.send('Successfully updated user info.');
});
app.post("/users/:username/favorites", (req, res) => { 
  res.send('Successfully added movie to list to favorites list.');
});
app.delete("/users/:username/favorites/:movieid", (req, res) => {  
  res.send('Successfully deleted {moviename} from favorites.');
});
app.delete("/users/:username", (req, res) => {  
  res.send('Successfully deleted {username}.');
});


app.use(express.static("public"));

//error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(8080);
