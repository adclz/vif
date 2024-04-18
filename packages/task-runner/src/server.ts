import express, {Express} from "express"
import cors from "cors";
import {PipeData} from "@/src/index.js";
//@ts-ignore
import launch from 'launch-editor'

export class Server {
    express: Express
    vifData: PipeData
    constructor(port: number, vifData: PipeData) {
        this.vifData = vifData
        this.express = express()
        this.express.use(cors({origin:true,credentials: true}))
        this.express.listen(port)

        this.express.post('/__open-in-editor', express.text(), (req, res) => {
            launch(req.body)
        })

        this.express.use('/__get-runner-file', (req, res) => {
            res.set('Content-Type', 'application/json');
            res.end(this.vifData.runnerFile)
        })

        this.express.use('/__get-provider-name', (req, res) => {
            res.set('Content-Type', 'application/json');
            res.end(this.vifData.providerName)
        })

        this.express.use('/__get-protocol', (req, res) => {
            res.set('Content-Type', 'application/json');
            res.end(this.vifData.protocol)
        })

        this.express.use('/__get-provider', (req, res) => {
            res.set('Content-Type', 'application/json');
            if (this.vifData.currentProviderAst)
                res.end(JSON.stringify(this.vifData.currentProviderAst))
            else
                res.sendStatus(500)
        })

        this.express.use('/__get-program', (req, res) => {
            res.set('Content-Type', 'application/json');
            if (this.vifData.currentProgramAst)
                res.end(JSON.stringify(this.vifData.currentProgramAst))
            else
                res.sendStatus(500)
        })

        this.express.use('/__get-compiled', (req, res) => {
            res.set('Content-Type', 'application/json');
            if (this.vifData.currentCompiled)
                res.end(JSON.stringify(this.vifData.currentCompiled))
            else
                res.sendStatus(500)
        })

        this.express.use('/__get-transformers', (req, res) => {
            res.set('Content-Type', 'application/json');
            if (this.vifData.transformers)
                res.end(JSON.stringify(this.vifData.transformers))
            else
                res.sendStatus(500)
        })

        this.express.use("/__get-states", (req, res) => {
            res.set('Content-Type', 'application/json');
            if (this.vifData.states)
                res.end(JSON.stringify(this.vifData.states))
            else
                res.sendStatus(500)
        })

        console.log(`Server listening on ${port}`);
    }
}