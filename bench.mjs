import { parseArgs } from 'node:util';
import fs from 'node:fs';

const packageJSON = JSON.parse(fs.readFileSync('./package.json'));

const options = {
    port: {
        type: 'string',
        short: 'p',
        default: '3000'
    },
    endpoint: {
        type: 'string',
        short: 'e'
    },
    log: {
        type: 'boolean',
        short: 'l',
        default: true
    },
    iterations: {
        type: 'string',
        short: 'i',
        default: '50'
    },
    runCount: {
        type: 'string',
        short: 'r',
        default: '100'
    }
    // output: {
    //     type: 'string',
    //     short: 'o'
    // }
}

const { values } = parseArgs({ options })

function findAverage (arr) {
    let ttl = 0;
    arr.forEach(e => ttl += e);
    return ttl / arr.length;
}

function findMedian(arr) {
    arr.sort((a, b) => a - b);
    const middleIndex = Math.floor(arr.length / 2);

    if (arr.length % 2 === 0) {
        return (arr[middleIndex - 1] + arr[middleIndex]) / 2;
    } else {
        return arr[middleIndex];
    }
}

async function run () {
    const res = await fetch(`http://localhost:${values.port}/${values.endpoint}`);
    performance.mark('streaming-start');
    const text = await res.text();
    performance.mark('streaming-end');
    performance.measure('streaming-duration', {
        start: 'streaming-start',
        end: 'streaming-end'
    });
}

function clear () {
    performance.clearMarks('streaming-start');
    performance.clearMarks('streaming-end');
    performance.clearMeasures('streaming-duration');
}

async function warmup () {
    const warmups = []
    for (let i = 0; i < 5; i++) {
        warmups.push(run());
    }
    await Promise.all(warmups);
    clear();
}

async function bench () {
    const runs = [];
    for (let i = 0; i < parseInt(values.runCount); i++) {
        runs.push(run());
    }
    await Promise.all(runs);

    const measures = performance.getEntriesByName('streaming-duration');
    const durations = measures.map(measure => measure.duration)
    const averageDuration = findAverage(durations);
    const medianDuration = findMedian(durations);

    clear();

    return {average: averageDuration, median: medianDuration};
}

if (values.log) {
    console.log('Benchmarking Next.js version', packageJSON.dependencies.next)
    console.log('Endpoint', values.endpoint)
    console.log('Iterations', values.iterations)
    console.log('Run Count', values.runCount)
}
await warmup();
// const output = values.output ?? `nextjs-streams-benchmark-${values.endpoint}-${Date.now()}`;
const results = [];

for (let i = 0; i < parseInt(values.iterations); i++) {
    const result = await bench();
    results.push(result);
}

const average = findAverage(results.map(result => result.average));
const median = findAverage(results.map(result => result.median));

if (values.log) { 
    console.log('Average', average);
    console.log('Median', median);
}
