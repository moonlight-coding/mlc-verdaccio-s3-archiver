# mlc-verdaccio-s3-archiver

Builds an archive of your verdaccio instance, then backup it to AWS S3.

To import a backup in an empty installation, just extract the backup in the `verdaccio/` folder and run verdaccio.

Usefull to backup your private packages.

## WARNING

Do not backup the public packages ! You would backup public packages, pure waste and could become expensive.

In your verdaccio config.yaml, make sure public and private packages have a `storage` field and that it's not targeting the same folder.

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
