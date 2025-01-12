const express = require("express"),
  morgan = require("morgan");

const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;

const app = express();

//parse the request URL
app.use(express.json()); // Import body parser
app.use(express.urlencoded({ extended: true })); // Import body parser

//Connect with Mongo DB
mongoose.connect("mongodb://localhost:27017/myflixDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//middleware
app.use(morgan("common"));

// GET requests
app.get("/", (req, res) => {
  res.send("Welcome to myFlix!");
});

// Get all movies
app.get("/movies", async (req, res) => {
  await Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        message:
          "Something went wrong while fetching the movies. Please try again later.",
      });
    });
});

// Get a movie by title
app.get("/movies/:Title", async (req, res) => {
  await Movies.findOne({ title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        message:
          "Something went wrong while fetching the movie details. Please try again later.",
      });
    });
});

// Get a genre description
app.get("/genre/:genrename", async (req, res) => {
  await Movies.findOne({ "genre.name": req.params.genrename })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        message:
          "Something went wrong while fetching the genre details. Please try again later.",
      });
    });
});

// Get a directors details by director name
app.get("/directors/:dirname", async (req, res) => {
  await Movies.findOne({ "director.name": req.params.dirname })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        message:
          "Something went wrong while fetching the genre details. Please try again later.",
      });
    });
});

// Get all users
app.get("/users", async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get a user by username
app.get("/users/:Username", async (req, res) => {
  await Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});
//Add a user
/* Expect JSON in this format
{  
  Username: String, --required
  Password: String, --required
  Email: String, --required
  Birthday: Date,
  Favorites:[ObjectId] 
}*/
app.post("/users/adduser", async (req, res) => {
  //res.send("Successfully added new user.");
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + "already exists");
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        })
          .then((user) => {
            res.status(201).json(user);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send("Error: " + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

app.post("/users/:username/favorites", (req, res) => {
  res.send("Successfully added movie to favories.");
});

// Update a user's info, by username
/* We’ll expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
}*/
app.put("/users/:Username", async (req, res) => {
  await Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      },
    },
    { new: true }
  ) // This line makes sure that the updated document is returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Add a movie to a user's list of favorites
app.post("/users/:Username/movies/:MovieID", async (req, res) => {
  await Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $push: { FavoriteMovies: req.params.MovieID },
    },
    { new: true }
  ) // This line makes sure that the updated document is returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Delete a movie from users favorites list
app.delete("/users/:Username/movies/:MovieID", async (req, res) => {
  await Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $pull: { FavoriteMovies: req.params.MovieID },
    },
    { new: true }
  )
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Delete a user by username
app.delete("/users/:Username", async (req, res) => {
  await Users.findOneAndDelete({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + " was not found");
      } else {
        res.status(200).send(req.params.Username + " was deleted.");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

app.use(express.static("public"));

//error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(8080);
