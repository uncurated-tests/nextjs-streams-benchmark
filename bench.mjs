import { parseArgs } from 'node:util';
import packageJSON from './package.json' assert { type: 'json' };

const options = {
    port: {
        type: 'string',
        short: 'p'
    },
    endpoints: {
        type: 'string',
        multiple: true,
        short: 'e',
    }
}
const { values } = parseArgs({ options })

async function run (endpoint) {
    const res = await fetch(`http://localhost:${values.port}/${endpoint}`);
    performance.mark('streaming-start');
    const text = await res.text();
    performance.mark('streaming-end');
    performance.measure('streaming-duration', {
        start: 'streaming-start',
        end: 'streaming-end'
    });
}

function average (measures) {
    let ttl = 0;
    measures.forEach(measure => ttl += measure.duration);
    return ttl / measures.length;
}

function clear () {
    performance.clearMarks('streaming-start');
    performance.clearMarks('streaming-end');
    performance.clearMeasures('streaming-duration');
}

async function bench () {
    console.log('Benchmarking Next.js version', packageJSON.dependencies.next)

    for (const endpoint of values.endpoints) {
        console.log('Endpoint', endpoint);
        const runs = [];
        for (let i = 0; i < 100; i++) {
            runs.push(run(endpoint));
        }
        await Promise.all(runs);

        const measures = performance.getEntriesByName('streaming-duration');

        console.log('Average duration', average(measures))

        clear()
    }
}

const warmups = []
for (const endpoint of values.endpoints) {
    for (let i = 0; i < 5; i++) {
        warmups.push(run(endpoint));
    }
}

await Promise.all(warmups);

clear();

await bench();