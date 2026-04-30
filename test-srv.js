const mongoose = require('mongoose');

const uri = "mongodb+srv://elmejahidamine_db_user:Passwordmongodb2026@cluster0.namspyw.mongodb.net/goldenbouskoura?retryWrites=true&w=majority&appName=Cluster0";

console.log('Testing SRV connection...');

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 15000,
  socketTimeoutMS: 45000,
}).then(() => {
  console.log('✅ CONNECTED via SRV');
  return mongoose.connection.close();
}).then(() => {
  process.exit(0);
}).catch(err => {
  console.error('❌ FAILED:', err.message);
  process.exit(1);
});