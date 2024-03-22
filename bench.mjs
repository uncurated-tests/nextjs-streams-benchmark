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
        default: false
    },
    iterations: {
        type: 'string',
        short: 'i',
        default: '10'
    },
    output: {
        type: 'string',
        short: 'o'
    }
}

const { values } = parseArgs({ options })

function average (measures) {
    let ttl = 0;
    measures.forEach(measure => ttl += measure.duration);
    return ttl / measures.length;
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
    for (let i = 0; i < 100; i++) {
        runs.push(run());
    }
    await Promise.all(runs);

    const measures = performance.getEntriesByName('streaming-duration');

    const averageDuration = average(measures);

    clear();

    return { endpoint: values.endpoint, average_duration: averageDuration };
}

if (values.log) {
    console.log('Benchmarking Next.js version', packageJSON.dependencies.next)
    console.log('Endpoint', values.endpoint)
}
await warmup();
const output = values.output ?? `nextjs-streams-benchmark-${values.endpoint}-${Date.now()}`;
const results = [];
for (let i = 0; i < parseInt(values.iterations); i++) {
    const result = await bench();
    results.push(result);
}

let t = 0;
results.forEach(({ average_duration }) => t += average_duration);
const outString = `Average duration for ${values.endpoint} after ${values.iterations} iterations of 100 runs: ${t/results.length}ms`;
if (values.log) { 
    console.log(outString)
} else {
    fs.writeFileSync(output, outString);
}
