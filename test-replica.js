const mongoose = require('mongoose');

const uri = "mongodb://elmejahidamine_db_user:Passwordmongodb2026@ac-eesinc6-shard-00-00.namspyw.mongodb.net:27017,ac-eesinc6-shard-00-01.namspyw.mongodb.net:27017,ac-eesinc6-shard-00-02.namspyw.mongodb.net:27017/goldenbouskoura?tls=true&replicaSet=atlas-eesinc6-shard-0&authSource=admin&retryWrites=true&w=majority";

console.log('Testing replica set...');

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
}).then(() => {
  console.log('✅ CONNECTED to replica set');
  return mongoose.connection.close();
}).then(() => {
  process.exit(0);
}).catch(err => {
  console.error('❌ FAILED:', err.message);
  process.exit(1);
});