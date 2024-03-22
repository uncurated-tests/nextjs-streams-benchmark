export const metadata = {
    title: "Next.js Streams Benchmark application",
    description: "An app that demonstrates the various different Next.js stream operations",
};

export default function Layout ({ children }) {
    return (
        <html lang="en">
            <body>{ children }</body>
        </html>
    )
}