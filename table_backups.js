'use strict';
require('dotenv').config();
const mysql = require('mysql');
const {exec} = require('child_process');
const connection = mysql.createConnection({
 host: process.env.DB_HOST,
 user: process.env.DB_USER,
 password: process.env.DB_PASSWORD,
 multipleStatements: true
});

var args = require('minimist')(process.argv.slice(2), {
 boolean: ["help"],
 string: ["env", "version", "schema"],
 _: []
});

try{
 if(args.help) {
 printHelp();
 }
 else if(args.env){

 const table = `${__dirname}/${args.env}/tables.sql`,
 data = `${__dirname}/${args.env}/data.sql`,
 procedures = `${__dirname}/${args.env}/procedures.sql`,
 tables = ['t_table_one', 't_table_two', 't_table_three', 't_table_four'];

 dumpDB(table, data, procedures, tables);

 // build(args.env, args.schema);

 }
 else{
 error('Incorrect Usage', true)
 }
}catch(err){
 error(err, true);
}

/*************************************************/

function printHelp(){
 console.log('db_build usage');
 console.log('db_build.js --env={ENVIRONMENT} --schema={SCHEMA_NAME} --version={VERSION_NUMBER}');
 console.log('');
 console.log('--help print this help');
 console.log('--env environment/file path the build scripts will dump to');
 console.log('--version new version number');
 console.log('--schema schema to build');
 console.log('');
}

function error(err, includeHelp = false){
 console.log(err);
 if(includeHelp){
 printHelp();
 }
}

async function dumpDB(table, data, procedures, tables){
 await exec(`mysqldump --column-statistics=0 --user=${process.env.DB_USER} --password=${process.env.DB_PASSWORD} --host=${process.env.DB_HOST} --no-data ${process.env.DB_DATABASE} ${tables.join(' ')} > ${table}`);

 await exec(`mysqldump --column-statistics=0 --user=${process.env.DB_USER} --password=${process.env.DB_PASSWORD} --host=${process.env.DB_HOST} --no-create-info --extended-insert ${process.env.DB_DATABASE} ${tables.join(' ')} > ${data}`);

 await exec(`mysqldump --column-statistics=0 --user=${process.env.DB_USER} --password=${process.env.DB_PASSWORD} --host=${process.env.DB_HOST} --routines --no-create-info --no-data --no-create-db --skip-opt ${process.env.DB_DATABASE} ${tables.join(' ')} > ${procedures}`);
}

function build(env, schema){

 connection.connect();

 connection.query(
 `DROP SCHEMA IF EXISTS ${schema}; CREATE SCHEMA ${schema}; USE ${schema}; SOURCE ./${env}/tables.sql; SOURCE ./${env}/procedures.sql; SOURCE ./${env}/data.sql;`
 );

 connection.end();

 // -- UPDATE SCHEMA VERSION
 // SET @version = '1.2.0';
 // CALL sp_update (@version);
}