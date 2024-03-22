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

function Data ({ d }) {
    return (
        <p>{d}</p>
    )
}

function Foo ({ a, b }) {
    return (
        <div>
            <Data d={a}/>
            <Data d={b}/>
        </div>
    )
}

function Bar ({ a, b }) {
    return (
        <div>
            <Data d={a}/>
            <Data d={b}/>
        </div>
    )
}

export default function PagesRouter ({ foo, bar }) {
    return (
        <div>
            <h1>PagesRouter</h1>
            <Foo foo={foo} />
            <Bar bar={bar} />
        </div>
    )
}

export async function getServerSideProps () {
    return {
        props: {
            foo: {
                a: await getData(10000),
                b: await getData(10000)
            },
            bar: {
                a: await getData(10000),
                b: await getData(10000)
            }
        }
    }
}