"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const stream_1 = require("stream");
const uuid_1 = require("uuid");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_1 = require("./config/s3");
const db_1 = require("./config/db");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const BUCKETS = {
    VC_RAW_VIDEOS: "vc-raw-videos",
    VC_AVATAR: "vc-user-avatars",
    VC_SECTION: "vc-sections"
};
var RecordType;
(function (RecordType) {
    RecordType["ADD"] = "ADD";
    RecordType["REMOVE"] = "REMOVE";
    RecordType["REPLACE"] = "REPLACE";
})(RecordType || (RecordType = {}));
const downloadVideo = (bucket, key, outputPath) => __awaiter(void 0, void 0, void 0, function* () {
    const { Body, ContentLength } = yield s3_1.s3.send(new client_s3_1.GetObjectCommand({ Bucket: bucket, Key: key }));
    const totalLength = ContentLength;
    let chunkLength = 0;
    if (!Body || !totalLength)
        throw new Error("File not available");
    // const readStream-
    yield new Promise((resolve, reject) => {
        const writeStream = fs_1.default.createWriteStream(outputPath);
        const fileBody = Body;
        fileBody.pipe(writeStream);
        fileBody.on("data", (chunk) => {
            chunkLength += chunk.length;
            console.log(`Downloading ${key}: ${((chunkLength / totalLength) * 100).toPrecision(4)}%`);
        });
        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
    });
    return key;
});
// Helper: Get video duration
function getVideoDuration(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fluent_ffmpeg_1.default.ffprobe(filePath, (err, metadata) => {
                if (err)
                    return reject(err);
                resolve(metadata.format.duration || 0);
            });
        });
    });
}
// Helper: Generate filter for trimmed segment
function trimFilter(lastEnd, end, vLabel, aLabel, width = 1280, height = 720) {
    return {
        video: `[0:v]trim=start=${lastEnd}:end=${end},setpts=PTS-STARTPTS,scale=${width}:${height}[${vLabel}]`,
        audio: `[0:a]atrim=start=${lastEnd}:end=${end},asetpts=PTS-STARTPTS[${aLabel}]`,
    };
}
// Helper: Generate filter for add/replace section
function addReplaceFilter(inputIndex, vLabel, aLabel, width = 1280, height = 720) {
    return {
        video: `[${inputIndex}:v]setpts=PTS-STARTPTS,scale=${width}:${height}[${vLabel}]`,
        audio: `[${inputIndex}:a]asetpts=PTS-STARTPTS[${aLabel}]`,
    };
}
function buildFilterComplex(changes) {
    return __awaiter(this, void 0, void 0, function* () {
        const filters = [];
        const vLabels = [];
        const aLabels = [];
        let lastEnd = 0;
        let inputIndex = 1;
        const nextLabel = () => {
            const vLabel = `v${vLabels.length + 1}`;
            const aLabel = `a${aLabels.length + 1}`;
            vLabels.push(vLabel);
            aLabels.push(aLabel);
            return { vLabel, aLabel };
        };
        for (const c of changes) {
            // Keep segment before change
            if (c.startTimestamp > lastEnd) {
                const { vLabel, aLabel } = nextLabel();
                const { video, audio } = trimFilter(lastEnd, c.startTimestamp, vLabel, aLabel);
                filters.push(video, audio);
            }
            if (c.type === "REMOVE") {
                lastEnd = c.endTimestamp;
                continue;
            }
            if (c.type === "REPLACE" || c.type === "ADD") {
                const { vLabel, aLabel } = nextLabel();
                const { video, audio } = addReplaceFilter(inputIndex, vLabel, aLabel);
                filters.push(video, audio);
                inputIndex++;
                lastEnd = c.type === "REPLACE" ? c.endTimestamp : c.startTimestamp;
            }
        }
        // Handle tail of original video
        const videoDuration = yield getVideoDuration(path_1.default.resolve("videos", "input.mp4"));
        if (lastEnd < videoDuration) {
            const { vLabel, aLabel } = nextLabel();
            const { video, audio } = trimFilter(lastEnd, videoDuration, vLabel, aLabel);
            filters.push(video, audio);
        }
        const concat = `${vLabels.map((v, i) => `[${v}][${aLabels[i]}]`).join("")}concat=n=${vLabels.length}:v=1:a=1[outv][outa]`;
        filters.push(concat);
        return filters.join(";");
    });
}
function createVersion_NEW(workspace, branch, commitMessage, changes) {
    return __awaiter(this, void 0, void 0, function* () {
        const db = (0, db_1.getDbClient)();
        yield db.connect();
        const { rows } = yield db.query(`
            SELECT A.id, B."contentType" 
            FROM "Versions" AS A 
            JOIN "Videos" AS B ON A.id = B.version
            WHERE A.workspace = $1 AND A.branch = $2
            ORDER BY A."createdAt" DESC 
            LIMIT 1
        `, [workspace, branch]);
        const versionId = rows[0].id;
        const ext = rows[0].contentType;
        const downloadPath = path_1.default.resolve("videos");
        if (!fs_1.default.existsSync(downloadPath))
            fs_1.default.mkdirSync(downloadPath);
        const originalVideoPath = `${downloadPath}/input.${ext}`;
        const videoKey = `${workspace}/${versionId}/video.mp4`;
        yield downloadVideo(BUCKETS.VC_RAW_VIDEOS, videoKey, originalVideoPath);
        const inputs = [originalVideoPath];
        // Add new section inputs
        for (const c of changes) {
            if (c.newSection) {
                yield downloadVideo(BUCKETS.VC_SECTION, c.newSection, `${downloadPath}/${c.newSection}`);
                inputs.push(`${downloadPath}/${c.newSection}`);
            }
        }
        const filter = yield buildFilterComplex(changes);
        const ffmpegStream = new stream_1.PassThrough();
        const cmd = (0, fluent_ffmpeg_1.default)();
        inputs.forEach(v => cmd.input(v));
        cmd
            .complexFilter(filter)
            .outputOptions([
            "-map [outv]",
            "-map [outa]",
            "-movflags frag_keyframe+empty_moov",
            "-c:v libx264",
            "-c:a aac",
            "-preset veryfast",
            "-f mp4"
        ]) // must specify -f mp4 for streaming
            .on("start", c => console.log("FFmpeg started:", c))
            .on("progress", p => { var _a; return console.log(`Processing: ${(_a = p.percent) === null || _a === void 0 ? void 0 : _a.toFixed(2)}%`); })
            .on("error", err => {
            console.log(err);
            console.error("❌ FFmpeg error:", err);
            ffmpegStream.destroy(err);
        })
            .on("end", () => console.log("✅ FFmpeg finished"))
            .pipe(ffmpegStream, { end: true }); // Pipe output directly to the stream
        // Insert Versions DB Record
        const newVersionId = (0, uuid_1.v4)();
        yield db.query(`
          INSERT INTO "Versions" (id, branch, workspace, "commitMessage")
          VALUES ($1, $2, $3, $4)
        `, [newVersionId, branch, workspace, commitMessage]);
        // Uploading Start
        const uploader = new lib_storage_1.Upload({
            client: s3_1.s3,
            params: {
                Bucket: BUCKETS.VC_RAW_VIDEOS,
                Key: `${workspace}/${newVersionId}/video.${ext}`,
                Body: ffmpegStream,
                ContentType: "video/mp4",
            },
        });
        uploader.on("httpUploadProgress", p => {
            if (p.loaded && p.total)
                console.log(`S3 upload progress: ${((p.loaded / p.total) * 100).toFixed(2)}%`);
        });
        yield uploader.done()
            .then(() => {
            console.log("✅ Uploaded to S3 successfully!");
        })
            .catch(err => {
            console.log('Error : ', err);
        });
        yield db.end();
    });
}
// Main Function
(() => __awaiter(void 0, void 0, void 0, function* () {
    const { SECRET_KEY, ACCESS_KEY, DB_URL, WORKSPACE, BRANCH, COMMIT_MESSAGE, CHANGES_IN_STRING } = process.env;
    if (!SECRET_KEY || !ACCESS_KEY || !DB_URL)
        throw new Error("AWS or DB credentials are missing");
    if (!WORKSPACE || !BRANCH || !COMMIT_MESSAGE || !CHANGES_IN_STRING)
        throw new Error("Parameters are missing");
    const changes = JSON.parse(CHANGES_IN_STRING);
    changes.sort((a, b) => a.startTimestamp - b.startTimestamp);
    yield createVersion_NEW(WORKSPACE, BRANCH, COMMIT_MESSAGE, changes);
}))();
