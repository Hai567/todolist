const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const date = require(__dirname + "/date.js")
const path = require('path')
const bodyParser = require("body-parser");
const { rmSync } = require("fs");
const mongoose = require("mongoose");
const { render } = require("ejs");
const Schema = mongoose.Schema

// body parser middleware
app.use(bodyParser.urlencoded({ extended: true }))

// Connect to DB
mongoose.connect("mongodb://localhost:27017/todoListDB", (err) => {
  if (err){
    console.log(err)
  }else{
    console.log("Connected To DB Successfully!!!");
  }
})

// Create todo list Schema
const todoListSchema = new Schema({
  name : {
    type: String,
    required: true
  }
})

// Create todo list Model
const TodoItem = mongoose.model("TodoItem", todoListSchema)

// Default todo items
const default1 = new TodoItem ({
  name : "Type in what you want to do below"
})
const default2 = new TodoItem ({
  name : "Click the '+' button or press enter key on keyboard to add items"
})
const default3 = new TodoItem ({
  name : "After done doing that, check the check box on your left do delete it"
})



// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// View engine : ejs
app.set('view engine', 'ejs');


// Send Data To /
app.get('/', (req, res) => {
  // find item from TodoItem DB
  TodoItem.find({}, (err, foundItems) => {
    if (err){
      console.log(err);
    }else{
      // Check if the DB is empty then insert data
      if (foundItems.length === 0){
        TodoItem.insertMany([default1, default2, default3])
        res.redirect("/")
      }else{
        res.render('index', {date: date , todoItems : foundItems});
      }
    }
  })
}
);


// Get Data From /
app.post("/", (req, res) => {
  if (req.body.nextItem === "" ){
    console.log("redirect (line 78)");
    res.redirect("/")
  }else{
    // add the item user typed in into DB
    TodoItem.create({name : req.body.nextItem}, (err) => {
      if (err){
        console.log(err);
      }else{
        console.log("added successfully (line 86)");
      }
      res.redirect("/")
    })
  }
})

// Get Data From /delete
app.post("/delete", (req, res) => {
  var checkedItem = req.body.checked
  checkedItem = checkedItem.replace(/\s/g, '')
  // TodoItem.deleteOne({_id : `${checkedItem}`}, (err) => {
  //   if(err){
  //     console.log(err);
  //   }else{
  //     console.log("Deleted");
    // }
  // })
  TodoItem.findByIdAndRemove(checkedItem, (err) => {
    if (err){
      console.log(err)
    }else{
      console.log("Deleted")
    }
  })

  res.redirect("/")
  
})


// Listen to port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
