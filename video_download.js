var fs = require('fs');
var url = require('url');
var http = require('http');
var xlsx = require('node-xlsx');
var userInput = require('prompt');
var listoffiles = [];
var listofurl = [];
var listcnt = 0;
var tokencnt = 0;
var videolen = 0;
var refidscnt = 0;
var parse_excel = null;
var refids = null;
var bolRefids = true;
var outputfolder = null;
var accountId = '';
var token = '';

var brightCoveManager = require('./brightCoveManager').brightCoveManager;

var DOWNLOAD_DIR = 'downloads';

var download_video = function (file_url, refID) {
    var options = {
        host: url.parse(file_url).host.split(':')[0],
        port: 80,
        path: url.parse(file_url).pathname
    };
    var file_name = refID + ".mp4";
    var file = fs.createWriteStream(DOWNLOAD_DIR + '/' + file_name);
    http.get(options, function (response) {
        response.on('data', function (data) {
            file.write(data);
        }).on('end', function () {
            file.end();
            console.log(file_name + ' downloaded to ' + DOWNLOAD_DIR);
            //todo what is this? bolrefids and flvurl ref
            if (!bolRefids) {
                videolen++;
                if (videolen === listoffiles.length) {
                    console.log("all video downloaded");
                    process.exit();
                }
                else {
                    if (listoffiles[videolen].FLVURL !== null)
                        download_video(listoffiles[videolen].FLVURL, listoffiles[videolen].referenceId);
                }
            }
            else {
                refidscnt++;               
                if (refidscnt === refids.length) {
                    console.log("all video downloaded");
                    process.exit();
                }
                else {
                    if (refids[refidscnt][0] !== null) {
                        processrefids(accountId, token, refids, function (err, commandObj, videoList) {
                            if (err != null) {
                                console.log('download_video error : '+err);
                                process.exit();
                            }
                            else {
                                if (videoList[0] !== null)
                                    download_video(videoList[0], refids[refidscnt][0]);
                            }
                        });
                    }
                }
            }
        });
    });
};


function processrefids(accountId, token, refids, cb) {
    try {
        if(outputfolder)
        {
           if (!fs.existsSync(__dirname + '/' + outputfolder))  {
                fs.mkdirSync(__dirname + '/' + outputfolder);
                DOWNLOAD_DIR = __dirname + '/' + outputfolder;
           }
        }
        else {
          if (!fs.existsSync(__dirname + '/' + DOWNLOAD_DIR)) {
            fs.mkdirSync(__dirname + '/' + DOWNLOAD_DIR);
          }
        }
    }
    catch (ex) {
        console.log("error creating download folder " + ex);
        process.exit();
    }  
    var video_fun = brightCoveManager();
    video_fun.getVideoListforRefids(accountId, token, refids[refidscnt], function (err, commandObj, videoList) {
        cb(err, commandObj, videoList);
    });

}


(function () {
    try {
        userInput.message = "";
        userInput.delimiter = "";
        userInput.start();
        userInput.get([{
            prefix:false,
            name: 'accountId',
            description: 'Enter Account Id: ',
            type: 'number',
            required: true
        }, {          
            prefix:false,
            name: 'token',
            description: 'Enter token: ',
            type: 'string',
            required: true
        }, { 
            prefix:'',
            name: 'input_file',
            description: 'Enter input file: ',
            type: 'string',
            required: true
        }, { 
            prefix: '',
            name: 'output_folder',
            description: 'Enter output folder (optional)',
            type: 'string'}], function (err, result) {
            if (err) { console.log('error retrieving prompt'); process.exit(); }
            else {
                
                if (result.accountId != null && result.token != null && result.input_file != null) {
                    accountId = result.accountId;
                    token = result.token;
                    bolRefids = true;
                    outputfolder = result.output_folder;
                    try {
                      parse_excel = xlsx.parse(fs.readFileSync(result.input_file)); // parsing input file   
                    } catch (ex){
                        console.log('Could not read input file, please re-enter ' + ex);
                        process.exit();
                    }                                    
                    refids = parse_excel[0].data;                   
                    processrefids(accountId, token, refids, function (err, commandObj, videoList) {
                        if (err != null) {
                            console.log('An error occured while retrieving videos');
                            process.exit();
                        }
                        else {
                            if (videoList[0] !== null)
                                download_video(videoList[0], refids[0][0]);
                        }
                    });
                }
                else {
                    console.log("Please provide accountId, token and input file.")
                }
            }
        });


    } catch (ex) {
        console.log("main function" + ex);
        process.exit();
    }

} ());


