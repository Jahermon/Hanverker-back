const mongoose = require('mongoose');

const connectDatabase = () => {
  mongoose.connect(process.env.DB_LOCAL_URi, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(con => {
    console.log(`mongoDB DATABSASE CONNECTED with HOSt ${con.connection.host}`)
  })
}

module.exports = connectDatabase