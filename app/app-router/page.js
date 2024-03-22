export const dynamic = 'force-dynamic'

function createRandomString(length) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function getData(c) {
    return new Promise(resolve => {
        setImmediate(() => {
            resolve(createRandomString(c))
        })
    })
}

async function Data ({ i }) {
    const d = await getData(i);
    return (
        <p>{d}</p>
    )
}

function Foo () {
    return (
        <div>
            <Data i={10000}/>
            <Data i={10000}/>
        </div>
    )
}

function Bar () {
    return (
        <div>
            <Data i={10000}/>
            <Data i={10000}/>
        </div>
    )
}

export default async function AppRouter () {
    return (
        <div>
            <h1>AppRouter</h1>
            <Foo />
            <Bar />
        </div>
    )
}