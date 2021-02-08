/* Scala Nodejs Pool
 * Copyright Scala          <https://github.com/scala-network/scala-pool>
 * Copyright StelliteCoin   <https://github.com/stellitecoin/cryptonote-stellite-pool>
 * Copyright Ahmyi          <https://github.com/ahmyi/cryptonote-stellite-pool>
 * Copyright Dvandal        <https://github.com/dvandal/cryptonote-nodejs-pool>
 * Copyright Fancoder       <https://github.com/fancoder/cryptonote-universal-pool>
 * Copyright zone117x       <https://github.com/zone117x/node-cryptonote-pool>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
 
 var crypto = require('crypto');

 var dateFormat = require('dateformat');
 exports.dateFormat = dateFormat;

 var cnUtil = require('cryptoforknote-util');
 exports.cnUtil = cnUtil;

/**
 * Generate random instance id
 **/
 exports.instanceId = function() {
    return crypto.randomBytes(4);
}

// Get address prefix
function getAddressPrefix(address) {
    const addressBuffer = Buffer.from(address);

    var addressPrefix = cnUtil.address_decode(addressBuffer)
    
    if (addressPrefix) {
        addressPrefix = parseInt(addressPrefix.toString())
    }

    if (!addressPrefix) {
        addressPrefix = cnUtil.address_decode_integrated(addressBuffer)
        if (addressPrefix) addressPrefix = parseInt(addressPrefix.toString())
    }

return addressPrefix || null
}

exports.getAddressPrefix = getAddressPrefix;

exports.truncateAddress = function(address , limit){
  limit = limit || 7;
  return address.substring(0,limit)+'...'+address.substring(address.length-limit);
}



exports.isInteger = function(value){
    return /^(-?[1-9]+\d*)$|^0$/.test(value)
}

/**
 * Cleanup special characters (fix for non latin characters)
 **/
 function cleanupSpecialChars(str) { 
    str ="" + str
    str = str.replace(/[ÀÁÂÃÄÅ]/g,"A")
    str = str.replace(/[àáâãäå]/g,"a")
    str = str.replace(/[ÈÉÊË]/g,"E")
    str = str.replace(/[èéêë]/g,"e")
    str = str.replace(/[ÌÎÏ]/g,"I")
    str = str.replace(/[ìîï]/g,"i")
    str = str.replace(/[ÒÔÖ]/g,"O")
    str = str.replace(/[òôö]/g,"o")
    str = str.replace(/[ÙÛÜ]/g,"U")
    str = str.replace(/[ùûü]/g,"u")
    return str.replace(/[^A-Za-z0-9\-\_\.]/gi,'')
}
exports.cleanupSpecialChars = cleanupSpecialChars
const readableSI = (value, prefix, startUnit, isTime) => { // 1000.00

    let i = 0

    if(isTime) {

      const timeUnits =  ["nsecs","µsecs","msecs",'secs'];

      if(!startUnit) {
         i = 3
     } else if(startUnit === 'usecs') {
         i = 1
     } else {
         let ix = timeUnits.indexOf(startUnit);

         if(ix === false || ix < 0) {
            i = 3
        } else {
            i = ix
        }
    }


    while(value > 1000) {
        if(i === 3) break;
        value /= 1000
        i++
    }
    return parseFloat(value).toFixed(2) + ' ' + timeUnits[i]

}

const byteUnits =  ["n","µ","m",'','K', 'M', 'G', 'T', 'P'];

if(!startUnit) {
  i = 3
} else if(startUnit === 'u') {
  i = 1
} else {
  let ix = byteUnits.indexOf(startUnit);

  if(ix === false || ix < 0) {
     i = 3
 } else {
     i = ix
 }
}
while(value > 1000) {
  value /= 1000
  i++
}

if(!prefix) {
  prefix = ' '
}

return parseFloat(value).toFixed(2) + prefix +  byteUnits[i];

}
/**
 * Get readable hashrate
 **/
 exports.getReadableHashRate = function(hashrate){
    return readableSI(hashrate,' ') + '/sec';
}

 /**
 * Returns an appropriate unicode smiley for a donation level
 **/
 exports.getDonationSmiley = function(level) {
    return (
        level <= 0 ? '😢' :
        level <= 5 ? '😎' :
        level <= 10 ? '😄' :
        '😂');
}

/**
 * Get readable coins
 **/
 exports.getReadableCoins = function(coins, digits, withoutSymbol){
    var coinDecimalPlaces = config.coinDecimalPlaces || config.coinUnits.toString().length - 1;
    var amount = (parseInt(coins || 0) / config.coinUnits).toFixed(digits || coinDecimalPlaces);
    return amount + (withoutSymbol ? '' : (' ' + config.symbol));
}

/**
 * Generate unique id
 **/
 exports.uid = function(){
    var min = 100000000000000;
    var max = 999999999999999;
    var id = Math.floor(Math.random() * (max - min + 1)) + min;
    return id.toString();
};



exports.readableSI = readableSI 
/**
 * Ring buffer
 **/
 exports.ringBuffer = function(maxSize){
    var data = [];
    var cursor = 0;
    var isFull = false;

    return {
        append: function(x){
            if (isFull){
                data[cursor] = x;
                cursor = (cursor + 1) % maxSize;
            }
            else{
                data.push(x);
                cursor++;
                if (data.length === maxSize){
                    cursor = 0;
                    isFull = true;
                }
            }
        },
        avg: function(plusOne){
            var sum = data.reduce(function(a, b){ return a + b }, plusOne || 0);
            return sum / ((isFull ? maxSize : cursor) + (plusOne ? 1 : 0));
        },
        size: function(){
            return isFull ? maxSize : cursor;
        },
        clear: function(){
            data = [];
            cursor = 0;
            isFull = false;
        }
    };
};

exports.minerSeenWithIPForAddress=function(address, ip, callback) {
    var ipv4_regex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
    if (ipv4_regex.test(ip)) {
        ip = '::ffff:' + ip;
    }
    redisClient.sismember([config.coin + ':workers_ip:' + address, ip], function(error, result) {
        var found = result > 0 ? true : false;
        callback(error, found);
    });
}

/**
 * Takes a chart data JSON string and uses it to compute the average over the past hour, 6 hours,
 * and 24 hours.  Returns [AVG1, AVG6, AVG24].
 **/
 exports.extractAverageHashrates = function(chartdata) {
    var now = new Date() / 1000 | 0;

    var sums = [0, 0, 0]; // 1h, 6h, 24h
    var counts = [0, 0, 0];

    var sets = JSON.parse(chartdata); // [time, avgValue, updateCount]
    for (var j in sets) {
        var hr = sets[j][1];
        if (now - sets[j][0] <=  1*60*60) { sums[0] += hr; counts[0]++; }
        if (now - sets[j][0] <=  6*60*60) { sums[1] += hr; counts[1]++; }
        if (now - sets[j][0] <= 24*60*60) { sums[2] += hr; counts[2]++; }
    }

    return [sums[0] * 1.0 / (counts[0] || 1), sums[1] * 1.0 / (counts[1] || 1), sums[2] * 1.0 / (counts[2] || 1)];
}



/**
 * Convert payments data to chart
 **/
 exports.convertPaymentsDataToChart = (paymentsData) => {
    var data = [];
    if(paymentsData && paymentsData.length) {
        for(var i = 0; paymentsData[i]; i += 2) {
            data.unshift([+paymentsData[i + 1], paymentsData[i].split(':')[1]]);
        }
    }
    return data;
}


exports.compareTopHashes = (data, limit) => {
    limit = limit || 10;
    data.sort(function(a,b){
        var v1 = a.hashes ? parseInt(a.hashes) : 0;
        var v2 = b.hashes ? parseInt(b.hashes) : 0;
        if (v1 > v2) return -1;
        if (v1 < v2) return 1;
        return 0;   
    });

    return data.slice(0,limit);
}

exports.compareTopUnblockers = (data, limit) => {
    limit = limit || 10;
    data.sort(function(a,b){
        var v1 = a.blocksFound ? parseInt(a.blocksFound) : 0;
        var v2 = b.blocksFound ? parseInt(b.blocksFound) : 0;
        if (v1 > v2) return -1;
        if (v1 < v2) return 1;
        return 0;   
    });

    return data.slice(0,limit);
}
exports.compareTopMiners = (data, limit) => {

    limit = limit || 10;
    
    data.sort(function(a,b){
        var v1 = a.hashrate ? parseInt(a.hashrate) : 0;
        var v2 = b.hashrate ? parseInt(b.hashrate) : 0;
        if (v1 > v2) return -1;
        if (v1 < v2) return 1;
        return 0;   
    });
    
    var dataNoHashrate = [];
    var dataWithHashrate = [];
    
    for(var i in data){
        if(data[i].hashrate > 0){
            dataWithHashrate.push(data[i]);
        }else{
            dataNoHashrate.push(data[i]);
        }
    }
    
    if(dataWithHashrate.length >= limit){
        return data.slice(0,limit);
    }

    dataNoHashrate.sort(function(a,b){
        var v1 = a.lastShare ? parseInt(a.lastShare) : 0;
        var v2 = b.lastShare ? parseInt(b.lastShare) : 0;
        if (v1 > v2) return -1;
        if (v1 < v2) return 1;
        return 0;   
    });
    
    dataNoHashrate = dataNoHashrate.slice(0,limit-dataWithHashrate.length);
    for(var i in dataNoHashrate){
        dataWithHashrate.push(dataNoHashrate[i]);
    }

    return dataWithHashrate;
}
exports.compareTopDonators = (data, limit) => {

    limit = limit || 10;
    
    data.sort(function(a,b){
        var v1 = a.donations ? parseInt(a.donations) : 0;
        var v2 = b.donations ? parseInt(b.donations) : 0;
        if (v1 > v2) return -1;
        if (v1 < v2) return 1;
        return 0;   
    });
    
    const dataWithDonations = [];
    
    for(var i in data){

        if(data[i].donations > 0){
            dataWithDonations.push(data[i]);
            if(dataWithDonations.length >= limit) {
                break;
            }
        }
    }
    
    return dataWithDonations.slice(0,limit);
    
    
}
