import "#internal/nitro/virtual/polyfill";
import {Server} from "node:http";
import {toNodeListener} from "h3";
import getPort from "get-port"
import open from "open"

const nitroApp = useNitroApp();
const server = new Server(toNodeListener(nitroApp.h3App));
getPort()
    .then(port => {
        process.env.NITRO_PORT = `${port}`

        // @ts-ignore
        server.listen(port, (err) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            console.log(`Vif ui listening on http://localhost:${port}`)
            const args = process.argv

            const openInBrowser = args.findIndex(x => x === "--browser")
            if (openInBrowser !== -1) open(`http://localhost:${port}`);
        });
    })

