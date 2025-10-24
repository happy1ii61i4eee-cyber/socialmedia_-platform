const postgres = require('postgres');
let pgConfig;
if (!process.env.TEST_MODE){
    pgConfig=require('../../configs/postgres.json');
    console.log('Connect to production database.');
} else {
    pgConfig=require('../../configs/postgres-test.json');
    console.log('Connect to test database.');
}