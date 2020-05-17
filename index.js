#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Archive = require("./src/archive.js");
const moment = require('moment');
const AWS = require('aws-sdk');

if(process.argv.length != 4) {
  console.error("usage: mlc-verdaccio-s3-archiver <conf_path> <verdaccio_folder_path>");
  process.exit(1);
}

const conf_path = path.resolve(process.argv[2]);
const verdaccio_path = path.resolve(process.argv[3]);

if(!fs.existsSync(conf_path)) {
  console.error(`file ${conf_path} not found`);
  process.exit(1);
}

if(!fs.existsSync(verdaccio_path)) {
  console.error(`folder ${verdaccio_path} not found`);
  process.exit(1);
}

let config;

try {
  config = JSON.parse(fs.readFileSync(conf_path, 'utf-8'));
}
catch(e) {
  console.error(`file ${conf_path} is not a valid JSON`);
  process.exit(1);
}

// configure AWS to use the correct credentials
AWS.config.update(config.AWS);

async function main() {
  
  // =================
  // build the archive
  // =================
  
  const date = moment().format("YYYYMMDD-HHmmss");
  
  const archive_path = path.join(path.dirname(conf_path), `backup-${date}.zip`);

  let archive = new Archive(archive_path);

  // add the verdaccio default files
  archive.addFile(path.join(verdaccio_path, "config.yaml"), "config.yaml");
  archive.addFile(path.join(verdaccio_path, "htpasswd"), "htpasswd");
  archive.addFile(path.join(verdaccio_path, "storage/.sinopia-db.json"), "storage/.sinopia-db.json");
  archive.addFile(path.join(verdaccio_path, "storage/.verdaccio-db.json"), "storage/.verdaccio-db.json");
  
  // add the folders required in the config
  for(let folder of config.folders) {
    archive.addDirectory(path.join(verdaccio_path, "storage", folder), path.join("storage", folder));
  }
  
  // wait until the archive is created
  await archive.finalize();
  
  console.log("archive built in " + archive_path);
  
  // ===================
  // upload the archive
  // ===================
  
  await S3Upload(archive_path);
  
  // =========================
  // remove the local archive 
  // =========================
  
  fs.unlinkSync(archive_path);
}

main();

async function S3Upload(archive_path) {
  let s3 = new AWS.S3({apiVersion: '2006-03-01'});
  
  let fileStream = fs.createReadStream(archive_path);
  fileStream.on('error', function(err) {
    console.log('File Error', err);
    process.exit(1);
  });
  
  let uploadParams = {
    Bucket: config.bucket, 
    Key: path.basename(archive_path), 
    Body: fileStream
  };
  
  return new Promise((resolve, reject) => {
    // call S3 to retrieve upload file to specified bucket
    s3.upload(uploadParams, function(err, data) {
      if(err) {
        console.error("Error ", err);
        reject();
      }
      
      if (data) {
        console.log("Upload Success", data.Location);
        resolve();
      }
    });
  });
}
