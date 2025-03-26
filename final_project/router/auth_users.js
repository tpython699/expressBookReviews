const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  let usersWithSameName = users.filter((user) => {
    return user.username === username;
  })

  if(usersWithSameName.length > 0 ) {
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  let validateusers = users.filter((user) => {
    return(user.username === username && user.password === password)
  })

  if(validateusers.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const {username,password} = req.body;
    
    
    if(!username || !password) {
      return res.status(401).send( "Error logging in")
    }

    // Authenticate user
    if(authenticatedUser(username, password)){
      // Generate JWT access token
      let accessToken = jwt.sign(
        {data: username},
        'access',
        {expiresIn: 60 * 60}
      )
      
      // ✅ Debugging
      console.log("Generated token:", accessToken);

      // Store access token and username in session
      req.session.authorization = {
        accessToken, username
      };

      console.log("Session after login:", req.session); // ✅ Debugging

      return res.status(200).send(`User successfully logged in `)
    } else {
      return res.status(208).send("Invalid credentials")
    }
    
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const {isbn} = req.params;
  const review = req.query.review;
  const username = req.session.authorization['username'];

   // Extract username from JWT user payload
  //  const username = req.user.data;
   
  // if (!username) {
  //   return res.status(401).json({ message: "User not authenticated" });
  // }

  if (!review) {
      return res.status(400).json({ message: "Review content is required as a query parameter" });

  }

  // store or update the review the username
  books[isbn].reviews[username] = review;
  
  return res.status(200).json({ 
    message: "Review added/updated successfully", 
    reviews: books[isbn].reviews
});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;

  // Extract username from JWT user payload
  const username = req.user.data;

  if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews[username]) {
      return res.status(403).json({ message: "You have no review to delete for this book" });
  }

  // Delete the user's review
  delete books[isbn].reviews[username];

  return res.status(200).json({ 
      message: "Review deleted successfully", 
      reviews: books[isbn].reviews 
  });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
