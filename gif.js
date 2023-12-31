#!/usr/bin/env node

const fs = require("fs")
const temp = require("temp")
const { spawnSync } = require("child_process")

const main = (argv) => {
    const url = argv.shift()
    const outputFilename = argv.shift()
    const start = argv.shift()
    const duration = argv.shift()
    if (!url || !outputFilename || !start || !duration) {
        console.error("Syntax: gif.js [url] [outputFilename] [startSeconds] [durationSeconds]")
        process.exit(1)
    }

    const tempVideoFilename = temp.path({ suffix: ".mp4" })

    console.log(`URL     : ${url}`)
    console.log(`Output  : ${outputFilename}`)
    console.log(`Start   : ${start}`)
    console.log(`Duration: ${duration}`)
    console.log(`Temp    : ${tempVideoFilename}`)

    spawnSync("yt-dlp", ["--remux-video", "mp4", "-f", "bv", "-o", tempVideoFilename, url], { stdio: "inherit" })
    if (!fs.existsSync(tempVideoFilename)) {
        console.log("Couldn't download video.")
        process.exit(1)
    }

    spawnSync(
        "ffmpeg",
        [
            "-ss",
            String(start),
            "-t",
            String(duration),
            "-i",
            tempVideoFilename,
            "-filter_complex",
            "[0:v] fps=12,scale=480:-1,split [a][b];[a] palettegen [p];[b][p] paletteuse",
            outputFilename
        ],
        { stdio: "inherit" }
    )
}

main(process.argv.slice(2))
