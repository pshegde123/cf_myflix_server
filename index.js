const express = require("express"),
  morgan = require("morgan");
const app = express();

let topMovies = [
  {
    Title: "The Shawshank Redemption",
    Year: "1994",
    Genre: "Drama",
  },
  {
    Title: "The Godfather",
    Year: "1972",
    Genre: "Crime, Drama",
  },
  {
    Title: "The Dark Knight",
    Year: "2008",
    Genre: "Action, Crime, Drama",
  },
  {
    Title: "The Godfather: Part II",
    Year: "1974",
    Genre: "Crime, Drama",
  },
  {
    Title: "12 Angry Men",
    Year: "1957",
    Genre: "Crime, Drama",
  },
  {
    Title: "Schindler's List",
    Year: "1993",
    Genre: "Biography, Drama, History",
  },
  {
    Title: "The Lord of the Rings: The Return of the King",
    Year: "2003",
    Genre: "Action, Adventure, Drama",
  },
];
//middleware
app.use(morgan("common"));

// GET requests
app.get("/", (req, res) => {
  res.send("Welcome to myFlix!");
});

app.get("/movies", (req, res) => {
  res.json(topMovies);
});

app.use(express.static("public"));

//error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(8080);
