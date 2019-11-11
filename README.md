# Node-Mysqldump

A script that runs three seperate mysqldump's on an array of specific tables. The three dumps seperate the table create queries, the table data, and the stored procedures/functions/triggers into seperate files in a parent directory.

### Installation:

```sh
npm install

node table_backups.js --help
```