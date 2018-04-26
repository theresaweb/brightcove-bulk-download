var request = require('request');
exports.brightCoveManager = function () {  
    
    /**
 * Generic array sorting
 *
 * @param property
 * @returns {Function}
 */
    var sortByProperty = function (property) {
        return function (x, y) {
            return ((x[property] === y[property]) ? 0 : ((x[property] > y[property]) ? 1 : -1));
        };
    };  


    //constructs a command object for the given refids, accountId and auth token
    function createSearchVideosCommandforRefIds(accountId, token, referenceid, callback_brightcove) {
        var commandObj = {
            url: 'https://edge.api.brightcove.com/playback/v1/accounts/'+accountId+'/videos/ref:'+referenceid[0],
            method: 'GET',
            headers: {
              'BCOV-Policy': token
            }
        };
        callback_brightcove(commandObj);
    }

    var videoList = [];   


    function getFLVURL(commandObj, callback_brightcove) {
        request(
            commandObj,
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var data = JSON.parse(body);
                    if (data.sources != undefined || data.sources != null) {
                        var sources = data.sources;
                        var mp4s = sources.filter(source => source.container === 'MP4');
                        //sort sources by bitrate first, then by width
                        var mp4sByBitrate = mp4s.sort(sortByProperty('avg_bitrate'));
                        var mp4sByWidth = mp4sByBitrate.sort(sortByProperty('width'));
                        if (mp4s.length > 0) {
                            videoList = videoList.concat(mp4sByWidth[mp4sByWidth.length - 1].src);
                        } else {
                             console.log("no mp4s available");
                        }
                    } else {
                        console.log("video sources not available");
                    }
                    callback_brightcove(null, commandObj, videoList);
                  } else {
                      var err = 'An error detected when getting video list from server: '+ response.statusCode;
                      callback_brightcove(err, commandObj, videoList);
                  }
            });
    }


    function getVideoListforRefids(accountId, token, refids, callback_brightcove) {
        createSearchVideosCommandforRefIds(accountId, token, refids, function (commandObj) {

            videoList = [];
            //retrieve the video list from BrightCove
            getFLVURL(commandObj, callback_brightcove);

        });
    }

    return {
        createSearchVideosCommandforRefIds: createSearchVideosCommandforRefIds,
        getVideoListforRefids: getVideoListforRefids,
        getFLVURL: getFLVURL
    };
}

