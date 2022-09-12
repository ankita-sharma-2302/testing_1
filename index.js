const mongoose = require('mongoose');
const port = 3000
const app = require('./app');
const { DATABASE_URL } = process.env;

// const port = DATABASE_URL
mongoose.connect(DATABASE_URL,{ useNewUrlParser: true, useUnifiedTopology: true }, () => {
	console.log('connected to DB')
})

app.listen(port, () => console.log(`server is running at ${port}!`));