'use strict';

const fs = require('fs');

const SECOND = 1000;
const TIMEOUT_DURATION_MS = 1 * SECOND;
const INTERVAL_DURATION_MS = 5 * SECOND;

global.pubcrawler = global.pubcrawler || {};
global.pubcrawler.processCpuUsage = 0;

let desiredLoadFactor = .5;

function getUsage() {
    const data = fs.readFileSync('/proc/' + process.pid + '/stat');
    const elems = data.toString().split(' ');
    const utime = parseInt(elems[13]);
    const stime = parseInt(elems[14]);

    return utime + stime;
}

function startWatching() {
    setInterval(function () {
        const startTime = getUsage();

        setTimeout(function () {
            const endTime = getUsage();
            const delta = endTime - startTime;
            const percentage = 100 * (delta / 500);

            global.processCpuUsage = percentage;
        }, TIMEOUT_DURATION_MS);
    }, INTERVAL_DURATION_MS);
}

function blockCpuFor(ms) {
	const now = new Date().getTime();
	let result = 0;

	while (true) {
		result += Math.random() * Math.random();

        if (new Date().getTime() > now + ms) {
            return;
        }
	}
}

setInterval(function () {
    console.log('Current process cpu usage: ' + (global.processCpuUsage || 0) + '%');
}, SECOND);

if (process.argv[2]) {
    const value = parseFloat(process.argv[2]);

    if ((value < 0) || (value > 1)) {
        console.log('Please give a desired load value as a range [0..1]');
	    process.exit(-1);
    } else {
        desiredLoadFactor = value;
    }
}

function start() {
    startWatching();
	blockCpuFor(desiredLoadFactor * SECOND);
	setTimeout(start, (1 - desiredLoadFactor) * SECOND);
}

start();
