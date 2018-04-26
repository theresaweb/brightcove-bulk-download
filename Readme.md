This node script takes an excel sheet of Brightcove video reference ids and downloads the mp4 video rendition with the highest average bitrate and the greatest width

Requirements:
- Brightcove Account Id
- Policy token obtained by method explained here https://support.brightcove.com/policy-keys
- excel spreadsheet with one column containing reference ids of videos to be downloaded


To run locally:
```
clone repo
npm install
npm start
enter Brightcove accountID, policy key, location of excel and output folder(optional)
mp4 files will be found in a downloads folder unless output folder is specified
```

