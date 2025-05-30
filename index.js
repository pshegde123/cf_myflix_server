const express = require("express"),
  morgan = require("morgan");
const { check, validationResult } = require("express-validator");

const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;

const app = express();

//parse the request URL
app.use(express.json()); // Import body parser
app.use(express.urlencoded({ extended: true })); // Import body parser

const cors = require("cors");
/*app.use(cors());*/
let allowedOrigins = [
  "http://localhost:4200",
  "http://localhost:8080",
  "http://localhost:1234",
  "http://testsite.com",
  "https://react-myflix.netlify.app",
  "https://pshegde123.github.io",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          "The CORS policy for this application doesn’t allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

let auth = require("./auth")(app);
const passport = require("passport");
require("./passport");

//Connect with Mongo DB
/*mongoose.connect("mongodb://localhost:27017/myflixDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});*/
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//middleware
app.use(morgan("common"));

/**
 * GET route for "/home" that returns a home page.
 *
 * @name GetHome
 * @function
 * @param {Object} req The request object containing the HTTP request data.
 * @returns {String} resp Returns a string message "Welcome to myFlix!".
 *
 */
// GET requests
app.get("/", (req, res) => {
  res.send("Welcome to myFlix!");
});

// GET welcome/landing page requests
app.get("/welcome", (req, res) => {
  res.send("Welcome to myFlix!");
});

// Get all movies
/**
 * GET route for "/movies" that returns a list of 10 movies in JSON format.
 * This endpoint requires JWT authentication.
 *
 * @name GetAllMovies
 * @route {GET} /movies
 * @authentication Requires JWT authentication.
 * @async
 * @function
 *
 * @param {object} req - The request object containing the HTTP request data.
 *
 * @returns {object} Sends a JSON response containing the movie list.
 *
 * @example
 * // Example Request
 * GET /movies
 * Authorization: Bearer <JWT_TOKEN>
 *
 * // Example Response
 * HTTP/1.1 200 OK
 * [{
 * "Actors": [],
 * "_id": "6781d222035202ff96cb0ce6",
 * "title": "The Dark Knight Rises",
 * "description": "When the menace known as The Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham.",
 * "genre": {
 * "name": "Action",
 * "description": "A genre that emphasizes physical feats, including hand-to-hand combat, chases, and explosions."
 * },
 * "director": {
 *  "name": "Christopher Nolan",
 * "bio": "Christopher Nolan is a British-American film director, screenwriter, and producer.",
 * "birth_date": "1970-07-30T00:00:00.000Z",
 * "death_date": null
 * },
 * "image": "https://m.media-amazon.com/images/M/MV5BMTk4ODQzNDY3Ml5BMl5BanBnXkFtZTcwODA0NTM4Nw@@._V1_SX300.jpg"
 * },
 * {...},
 * {...},
 * ]
 *
 * @throws {500} Returns a 500 status code if there is a server error.
 * @throws {401} Returns a 401 status code if authentication fails.
 */
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
/**
 * GET route for "/movies/:title" that returns a single movie by its title.
 * This endpoint requires JWT authentication.
 *
 * @name GetMovieByTitle
 * @route {GET} /movies/:title
 * @authentication Requires JWT authentication.
 * @async
 * @function
 *
 * @param {string} req.params.title - The title of the movie to retrieve.
 *
 * @returns {void} Sends a JSON response containing the movie object.
 *
 * @example
 * // Example Request
 * GET /movies/Inception
 * Authorization: Bearer <JWT_TOKEN>
 *
 * // Example Response
 * HTTP/1.1 200 OK
 * {
 *   "title": "Inception",
 *   "director": "Christopher Nolan",
 *   "year": 2010,
 *   "genre": "Science Fiction"
 * }
 *
 * @throws {500} Returns a 500 status code if there is a server error.
 * @throws {401} Returns a 401 status code if authentication fails.
 */
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

/**
 * GET route for "/genres/:name" that returns genre data (e.g., description) by genre name/title.
 * This endpoint requires JWT authentication.
 *
 * @name GetGenreByName
 * @route {GET} /genres/:name
 * @authentication Requires JWT authentication.
 * @function
 *
 * @param {string} req.params.name - The name of the genre to retrieve (case-insensitive).
 *
 * @returns {void} Sends a JSON response containing the genre object or an error message.
 *
 * @example
 * // Example Request
 * GET /genres/Science%20Fiction
 * Authorization: Bearer <JWT_TOKEN>
 *
 * // Example Successful Response
 * HTTP/1.1 200 OK
 * {
 *   "name": "Science Fiction",
 *   "description": "A genre that uses speculative, futuristic concepts."
 * }
 *
 * // Example 404 Response
 * HTTP/1.1 404 Not Found
 * "Science Fiction was not found."
 *
 * @throws {404} Returns a 404 status code if the genre is not found.
 * @throws {500} Returns a 500 status code if there is a server error.
 * @throws {401} Returns a 401 status code if authentication fails.
 */
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

/**
 * GET route for "/directors/:name" that returns a director's description by their last name.
 * This endpoint requires JWT authentication.
 *
 * @name GetDirectorByName
 * @route {GET} /directors/:name
 * @authentication Requires JWT authentication.
 * @function
 *
 * @param {string} req.params.name - The last name of the director to retrieve (case-insensitive).
 *
 * @returns {void} Sends a JSON response containing the director's information or an error message.
 *
 * @example
 * // Example Request
 * GET /directors/Christopher Nolan
 * Authorization: Bearer <JWT_TOKEN>
 *
 * // Example Successful Response
 * HTTP/1.1 200 OK
 * {
 *   "first_name": "Christopher",
 *   "last_name": "Nolan",
 *   "bio": "British-American film director, producer, and screenwriter...",
 *   "birth": "1970-07-30",
 *   "death": null
 * }
 *
 * // Example 404 Response
 * HTTP/1.1 404 Not Found
 * "Nolan was not found."
 *
 * @throws {404} Returns a 404 status code if the director is not found.
 * @throws {500} Returns a 500 status code if there is a server error.
 * @throws {401} Returns a 401 status code if authentication fails.
 */
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

/**
 * GET route for "/users" that returns a list of users in JSON format.
 * This endpoint is for testing purposes only.
 *
 * @name GetUsers
 * @route {GET} /users
 * @async
 * @function
 * @returns {void} Sends a JSON response containing an array of users.
 *
 * @example
 * // Example Response
 * HTTP/1.1 200 OK
 * [
 *   {
 *     "username": "john_doe",
 *     "email": "john@example.com",
 *     "createdAt": "2024-06-10T12:34:56Z"
 *   },
 *   {
 *     "username": "jane_doe",
 *     "email": "jane@example.com",
 *     "createdAt": "2024-06-11T09:15:30Z"
 *   }
 * ]
 *
 * @throws {500} Returns a 500 status code if there is a server error.
 */
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

/**
 * POST route for "/users/adduser" that creates a new user.
 * Includes input validation for username, password, and email.
 *
 * @name CreateUser
 * @route {POST} /users
 * @function
 *
 * @param {string} req.body.username - The desired username (min 5 characters, alphanumeric).
 * @param {string} req.body.password - The user's password (required).
 * @param {string} req.body.email - The user's email address (must be valid).
 * @param {string} [req.body.birthday] - The user's birthday (required).
 *
 * @returns {void} Sends a JSON response containing the newly created user object or an error message.
 *
 * @example
 * // Example Request
 * POST /users/adduser
 * Content-Type: application/json
 *
 * {
 *   "username": "johnDoe",
 *   "password": "12345",
 *   "email": "johndoe@example.com",
 *   "birthday": "1990-01-01"
 * }
 *
 * // Example Successful Response
 * HTTP/1.1 201 Created
 * {
 *   "username": "johnDoe",
 *   "email": "johndoe@example.com",
 *   "birthday": "1990-01-01",
 *   "_id": "60f6a2d5c8b4b123456789ab"
 * }
 *
 * // Example 400 Response (Username already exists)
 * HTTP/1.1 400 Bad Request
 * "johnDoe already exists"
 *
 * // Example 422 Response (Validation errors)
 * HTTP/1.1 422 Unprocessable Entity
 * {
 *   "errors": [
 *     { "msg": "Username is required", "param": "username" },
 *     { "msg": "Email does not appear to be valid", "param": "email" }
 *   ]
 * }
 *
 * @throws {400} Returns a 400 status code if the username already exists.
 * @throws {422} Returns a 422 status code if input validation fails.
 * @throws {500} Returns a 500 status code if there is a server error.
 */
//Add a user
/* Expect JSON in this format
{  
  Username: String, --required
  Password: String, --required
  Email: String, --required
  Birthday: Date,
  Favorites:[ObjectId] 
}*/
app.post(
  "/users/adduser",
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  async (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          //return res.status(400).send(req.body.Username + " already exists");
          return res.status(400).send({
            message: req.body.Username + " already exists",
            user: user,
          });
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
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
  }
);

/**
 * PUT route for "/users/:username" that updates a user's information.
 * This endpoint requires JWT authentication.
 *
 * @name UpdateUser
 * @route {PUT} /users/:username
 * @authentication Requires JWT authentication.
 * @function
 *
 * @param {string} req.params.username - The username of the user to be updated.
 * @param {string} req.body.username - The updated username (min 5 characters, alphanumeric).
 * @param {string} req.body.password - The updated password (required).
 * @param {string} req.body.email - The updated email address (must be valid).
 * @param {string} [req.body.birthday] - The updated birthday (optional).
 *
 * @returns {void} Sends a JSON response containing the updated user object or an error message.
 *
 * @example
 * // Example Request
 * PUT /users/johnDoe
 * Authorization: Bearer <JWT_TOKEN>
 * Content-Type: application/json
 *
 * {
 *   "username": "johnDoeUpdated",
 *   "password": "newPassword123",
 *   "email": "johndoeupdated@example.com",
 *   "birthday": "1990-01-01"
 * }
 *
 * // Example Successful Response
 * HTTP/1.1 200 OK
 * {
 *   "username": "johnDoeUpdated",
 *   "email": "johndoeupdated@example.com",
 *   "birthday": "1990-01-01",
 *   "_id": "60f6a2d5c8b4b123456789ab"
 * }
 *
 * // Example 400 Response (Permission Denied)
 * HTTP/1.1 400 Bad Request
 * "Permission denied"
 *
 * // Example 500 Response (Server Error)
 * HTTP/1.1 500 Internal Server Error
 * "Error: [Error details here]"
 *
 * @throws {400} Returns a 400 status code if the usernames do not match.
 * @throws {500} Returns a 500 status code if there is a server error.
 * @throws {401} Returns a 401 status code if authentication fails.
 */
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
app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    // CONDITION TO CHECK ADDED HERE
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send("Permission denied");
    }
    // CONDITION ENDS
    //console.log("Request params=",req.params);
    //console.log("Request body=",req.body);

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
        //console.log("Response =",updatedUser);
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Add a movie to a user's list of favorites
/**
 * PUT route for "/users/:username/movies/:MovieID" that adds a movie to a user's favorite list.
 * This endpoint requires JWT authentication.
 *
 * @name AddFavoriteMovie
 * @route {PUT} /users/:username/movies/:MovieID
 * @authentication Requires JWT authentication.
 * @function
 *
 * @param {string} req.params.username - The username of the user to update.
 * @param {string} req.params.MovieID - The ID of the movie to add to the favorites list.
 *
 * @returns {void} Sends a JSON response containing the updated user document.
 *
 * @example
 * // Example Request
 * PUT /users/johnDoe/movies/60f6a2d5c8b4b123456789ab
 * Authorization: Bearer <JWT_TOKEN>
 *
 * // Example Successful Response
 * HTTP/1.1 200 OK
 * {
 *   "username": "johnDoe",
 *   "email": "johndoe@example.com",
 *   "favorites": ["60f6a2d5c8b4b123456789ab", "60f6a2d5c8b4b123456789ac"],
 *   "birthday": "1990-01-01",
 *   "_id": "60f6a2d5c8b4b123456789aa"
 * }
 *
 * // Example 400 Response (Movie not found)
 * HTTP/1.1 400 Bad Request
 * "60f6a2d5c8b4b123456789ab was not found"
 *
 * // Example 500 Response (Server Error)
 * HTTP/1.1 500 Internal Server Error
 * "Error: [Error details here]"
 *
 * @throws {400} Returns a 400 status code if the movie does not exist in the database.
 * @throws {500} Returns a 500 status code if there is a server error.
 * @throws {401} Returns a 401 status code if authentication fails.
 */
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
/**
 * DELETE route for "/users/:username/movies/:MovieID" that removes a movie from a user's favorite list.
 * This endpoint requires JWT authentication.
 *
 * @name RemoveFavoriteMovie
 * @route {DELETE} /users/:username/movies/:MovieID
 * @authentication Requires JWT authentication.
 * @function
 *
 * @param {string} req.params.username - The username of the user to update.
 * @param {string} req.params.MovieID - The ID of the movie to remove from the favorites list.
 *
 * @returns {void} Sends a JSON response containing the updated user document.
 *
 * @example
 * // Example Request
 * DELETE /users/johnDoe/movies/60f6a2d5c8b4b123456789ab
 * Authorization: Bearer <JWT_TOKEN>
 *
 * // Example Successful Response
 * HTTP/1.1 200 OK
 * {
 *   "username": "johnDoe",
 *   "email": "johndoe@example.com",
 *   "favorites": ["60f6a2d5c8b4b123456789ac"],
 *   "birthday": "1990-01-01",
 *   "_id": "60f6a2d5c8b4b123456789aa"
 * }
 *
 * // Example 500 Response (Server Error)
 * HTTP/1.1 500 Internal Server Error
 * "Error: [Error details here]"
 *
 * @throws {500} Returns a 500 status code if there is a server error.
 * @throws {401} Returns a 401 status code if authentication fails.
 */
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
/**
 * DELETE route for "/users/:username" that deletes a user by their username.
 * This endpoint requires JWT authentication.
 *
 * @name DeleteUser
 * @route {DELETE} /users/:username
 * @authentication Requires JWT authentication.
 * @function
 *
 * @param {string} req.params.username - The username of the user to be deleted.
 *
 * @returns {void} Sends a success message if the user is deleted or an error message if not.
 *
 * @example
 * // Example Request
 * DELETE /users/johnDoe
 * Authorization: Bearer <JWT_TOKEN>
 *
 * // Example Successful Response
 * HTTP/1.1 200 OK
 * "johnDoe was deleted."
 *
 * // Example 400 Response (User Not Found)
 * HTTP/1.1 400 Bad Request
 * "johnDoe was not found"
 *
 * // Example 500 Response (Server Error)
 * HTTP/1.1 500 Internal Server Error
 * "Error: [Error details here]"
 *
 * @throws {400} Returns a 400 status code if the user does not exist.
 * @throws {500} Returns a 500 status code if there is a server error.
 * @throws {401} Returns a 401 status code if authentication fails.
 */
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

//app.listen(8080);
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
