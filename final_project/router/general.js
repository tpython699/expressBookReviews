const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const axios = require('axios');

const doesExist = (username) => {
  let usersWithSameName = users.filter((user) => {
    return user.username === username;
  })

  if(usersWithSameName.length > 0 ) {
    return true;
  } else {
    return false;
  }
}

public_users.post("/register", (req,res) => {
  const username = req.query.username;
  const password = req.query.password;
  
  if(!username){
    return res.status(401).send("Username is required");
  }
  if(!password){
    return res.status(401).send("Password is required");
  }
  
  if(!doesExist(username)){
    users.push(
      {
        username: username,
        password: password
      }
    )
    return res.status(200).json({message: `User ${username} successfully registered. Now you can login`});

  } else {
    return res.status(404).json({message: "User already exists!"});

  }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    return res.send(JSON.stringify(books));  
});

// AXIOS
axios.get('http://localhost:5000/')
  .then(response => {
    console.log("List of Books:", response.data);
  })
  .catch(error => {
    console.error("Error fetching books:", error);
  });


// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  if(books[isbn]){
    res.send(JSON.stringify(books[isbn]))
  } else {
    res.send("Book not found")
  }
 });

 // AXIOS
axios.get(`http://localhost:5000/isbn/${isbn}`)
.then(response => {
  console.log("Book Details:", response.data);
})
.catch(error => {
  console.error("Error fetching book:", error);
});

  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const filteredBooks = Object.fromEntries(
    Object.entries(books).filter(([key, value]) => value.author === author)
  );
  
  if(Object.keys(filteredBooks).length > 0){
    res.send(JSON.stringify(filteredBooks))
  } else {
    res.send("Author not found")
  }
});

// AXIOS
axios.get(`http://localhost:5000/author/${author}`)
  .then(response => {
    console.log("Books by Author:", response.data);
  })
  .catch(error => {
    console.error("Error fetching books by author:", error);
  });


// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title;
  const filteredBooks = Object.fromEntries(
    Object.entries(books).filter(([key, value]) => value.title === title)
  )

  if(Object.keys(filteredBooks).length > 0){
    res.send(JSON.stringify(filteredBooks))
  } else {
    res.send("Title not found")
  }
});

// AXIOS
axios.get(`http://localhost:5000/title/${title}`)
  .then(response => {
    console.log("Book Details:", response.data);
  })
  .catch(error => {
    console.error("Error fetching book by title:", error);
  });


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;  
  const book = books[isbn];

  if(book){
    return res.send(JSON.stringify(book.reviews));
  } else {
    return res.send("Book not found");
  }
});

module.exports.general = public_users;
