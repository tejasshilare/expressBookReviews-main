const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const getBookByAsync = async({isbn, author, title}) => {
  return new Promise((resolve, reject) => {
    var book;
    if (isbn) {
      book = books[isbn];
    } else if (author) {
      for (let key in books) {
        if (books[key].author === author) {
          book = books[key];
          break;
        }
      }
    } else if (title) {
      for (let key in books) {
        if (books[key].title === title) {
          book = books[key];
          break;
        }
      }
    }

    resolve(book);
  });
}

const getBooksAsync = async() => {
  return new Promise((resolve, reject) => {
    resolve(books);
  });
}

public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (username === undefined || password === undefined || username.length === 0 || password.length === 0)
    return res.status(405).json({ message: "Please input a username and a password." });

  for (let i = 0; i < users.length; i++)
    if (username === users[i].username)
      return res.status(405).json({ message: "Username already exists!" });

  users.push({
    username: username,
    password: password
  });

  return res.status(200).json({message: `User '${username}' successfully created! Now you can log in.`});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  getBooksAsync()
    .then((books) => res.json(books))
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  getBookByAsync({isbn: req.params.isbn})
    .then((book) => {
      if (book === undefined)
        return res.status(405).json({message: `Book with ISBN '${isbn}' could not be found.`})
      return res.status(200).json({book});
    })
 });
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  getBookByAsync({author: req.params.author})
    .then((book) => book ? res.json(book) : res.status(403).json({
      message: "unable to find book by author"
    }));
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  getBookByAsync({title: req.params.title})
    .then((book) => book ? res.json(book) : res.status(403).json({
      message: "unable to find book by title"
    }));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  var book = books[req.params.isbn];

  if (book === undefined)
    return res.status(405).json({message: `Book with ISBN '${req.params.isbn}' 
      could not be found.`});
  else {
    var reviews = book.reviews;
    if (Object.keys(reviews).length === 0)
      return res.status(200).json({message: `No reviews for '${book.title}'`});

    return res.status(200).json(reviews); 
  }
});

module.exports.general = public_users;