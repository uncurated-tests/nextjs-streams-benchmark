async function bench () {
    const res = await fetch('http://localhost:3000/pages-router');
    performance.mark('streaming-start');
    const text = await res.text();
    performance.mark('streaming-end');
    performance.measure('streaming-duration', {
        start: 'streaming-start',
        end: 'streaming-end'
    });
}

// warmup
for (let i = 0; i < 5; i++) {
    await bench();
}

performance.clearMarks('streaming-start');
performance.clearMarks('streaming-end');
performance.clearMeasures('streaming-duration');

const { default: packageJSON } = await import('./package.json', { assert: { type: "json" } } );
console.log('Benchmarking Next.js version', packageJSON.dependencies.next, 'for endpoint', '/pages-router')

const runs = [];
for (let i = 0; i < 100; i++) {
    runs.push(bench());
}
await Promise.all(runs);

const measures = performance.getEntriesByName('streaming-duration');
let ttl = 0;
measures.forEach(measure => ttl += measure.duration);
const avg = ttl / measures.length;

console.log('Average duration: ', avg)
