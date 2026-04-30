const mongoose = require('mongoose');

const uri = "mongodb://elmejahidamine_db_user:Passwordmongodb2026@ac-eesinc6-shard-00-00.namspyw.mongodb.net:27017/goldenbouskoura?ssl=true&authSource=admin";

console.log('Testing single node connection...');

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4,
}).then(() => {
  console.log('✅ CONNECTED to single node');
  return mongoose.connection.close();
}).then(() => {
  console.log('Connection closed');
  process.exit(0);
}).catch(err => {
  console.error('❌ FAILED:', err.message);
  console.error('Full error:', err);
  process.exit(1);
});