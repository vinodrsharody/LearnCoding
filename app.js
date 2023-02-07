const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const _ = require("lodash"); 
const app = express();
app.set('view engine', 'ejs');
mongoose.set('strictQuery', true);
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


const port = 3000;
mongoose.connect('');

const itemSchema = {
  name:String
}
const listSchema = {
  name:String,
  items: [itemSchema]
}

const Item = mongoose.model('Item',itemSchema);
const List = mongoose.model('List', listSchema);

const defaultItems =[ { name: 'Buy Food' }, { name: 'Cook Food' }, { name: 'Eat Food' }]


app.get('/', (req, res) => {
    Item.find({}, function(err, foundItems) {
      if(foundItems.length === 0) {
        Item.insertMany(defaultItems, function(error) {
          if(error) {
            console.log('Not able to push the items');
          }
          else {
            console.log('Successfully added the items to collection');
          }
        });
        res.redirect("/");
      }
      else {
        res.render('list', {listTitle: "Today", listItem: foundItems});
      }
    });
    
});

app.post('/', (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newItem = new Item({
    name: itemName
 });

  if(listName === "Today") {
    newItem.save().then(() => console.log("Item added"));
    res.redirect("/");
  }
  else {
    List.findOne({name: listName}, function(err, foundList) {
      console.log(foundList);
      foundList.items.push(newItem);
      foundList.save().then(() => console.log("Item added"));
      res.redirect("/"+ listName);
    });
  }
});

app.post("/delete",(req, res)=> {
  const deleteItem = req.body.checkList;
  const listItem = req.body.list;
  if(listItem === "Today") {
    Item.findByIdAndRemove(deleteItem, function(err){
      if(err) {
        console.log("Didn't able to remove the item");
      }
      else {
        console.log("Successfully removed the item");
        res.redirect("/");
      }
    });
  }
  else {
    List.findOneAndUpdate({name:listItem},{$pull:{items:{_id:deleteItem}}}, function(err, foundList) {
      if(!err) {
        res.redirect("/"+listItem);
      }
    })
  }
});

app.get("/:customListName", (req, res)=> {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name:customListName }, function(err, foundList) {
    if(!err) {
      if(!foundList) {
        const listItems = new List({
          name:customListName,
          items: defaultItems
        });
        listItems.save().then(()=> console.log("Updated list array items"));
        res.redirect("/"+ customListName);
      } else {
        res.render('list', {listTitle:foundList.name, listItem: foundList.items});
      }
    }
  }) 
})

app.listen(port, (req, res) => {
    console.log('App has been initialized successfully');
})