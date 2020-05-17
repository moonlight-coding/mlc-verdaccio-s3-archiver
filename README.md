# mlc-verdaccio-s3-archiver

Builds an archive of your verdaccio instance, then backup it to AWS S3.

To import a backup in an empty installation, just extract the backup in the `verdaccio/` folder and run verdaccio.

## Install

`npm i mlc-verdaccio-s3-archiver`

Your own `archiver.conf.json` has to be created from `archiver.conf.example.json`.

## usage

```
./node_modules/.bin/mlc-verdaccio-s3-archiver <conf_path> <verdaccio_folder_path>
```

Example:

```
./node_modules/.bin/mlc-verdaccio-s3-archiver archiver.conf.json verdaccio
``` 
