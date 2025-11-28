import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import Stream, { PassThrough } from "stream";
import { v4 } from "uuid";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { s3 } from "./config/s3";
import { getDbClient } from "./config/db";
import { Upload } from "@aws-sdk/lib-storage";

const BUCKETS = {
    VC_RAW_VIDEOS: "vc-raw-videos",
    VC_AVATAR: "vc-user-avatars",
    VC_SECTION: "vc-sections"
};

enum RecordType {
    ADD = "ADD",
    REMOVE = "REMOVE",
    REPLACE = "REPLACE",
}

interface ChangeRecordType {
    type: RecordType;
    startTimestamp: number;
    endTimestamp?: number;
    newSection?: string;
}

const downloadVideo = async (bucket: string, key: string, outputPath: string) => {

    const { Body, ContentLength } = await s3.send(
        new GetObjectCommand({ Bucket: bucket, Key: key })
    );

    const totalLength = ContentLength;
    let chunkLength = 0;

    if (!Body || !totalLength) throw new Error("File not available");

    // const readStream-
    await new Promise<void>((resolve, reject) => {
        const writeStream = fs.createWriteStream(outputPath);
        const fileBody = Body as Stream;

        fileBody.pipe(writeStream);

        fileBody.on("data", (chunk) => {
            chunkLength += chunk.length;
            console.log(
                `Downloading ${key}: ${((chunkLength / totalLength) * 100).toPrecision(4)}%`
            );
        });

        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
    });

    return key;
};

// Helper: Get video duration
async function getVideoDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) return reject(err);
            resolve(metadata.format.duration || 0);
        });
    });
}

// Helper: Generate filter for trimmed segment
function trimFilter(lastEnd: number, end: number, vLabel: string, aLabel: string, width = 1280, height = 720) {
    return {
        video: `[0:v]trim=start=${lastEnd}:end=${end},setpts=PTS-STARTPTS,scale=${width}:${height}[${vLabel}]`,
        audio: `[0:a]atrim=start=${lastEnd}:end=${end},asetpts=PTS-STARTPTS[${aLabel}]`,
    };
}

// Helper: Generate filter for add/replace section
function addReplaceFilter(inputIndex: number, vLabel: string, aLabel: string, width = 1280, height = 720) {
    return {
        video: `[${inputIndex}:v]setpts=PTS-STARTPTS,scale=${width}:${height}[${vLabel}]`,
        audio: `[${inputIndex}:a]asetpts=PTS-STARTPTS[${aLabel}]`,
    };
}

async function buildFilterComplex(changes: ChangeRecordType[]) {
    const filters: string[] = [];
    const vLabels: string[] = [];
    const aLabels: string[] = [];

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
            lastEnd = c.endTimestamp!;
            continue;
        }

        if (c.type === "REPLACE" || c.type === "ADD") {
            const { vLabel, aLabel } = nextLabel();
            const { video, audio } = addReplaceFilter(inputIndex, vLabel, aLabel);
            filters.push(video, audio);
            inputIndex++;
            lastEnd = c.type === "REPLACE" ? c.endTimestamp! : c.startTimestamp;
        }
    }

    // Handle tail of original video
    const videoDuration = await getVideoDuration(path.resolve("videos", "input.mp4"));
    if (lastEnd < videoDuration) {
        const { vLabel, aLabel } = nextLabel();
        const { video, audio } = trimFilter(lastEnd, videoDuration, vLabel, aLabel);
        filters.push(video, audio);
    }

    const concat = `${vLabels.map((v, i) => `[${v}][${aLabels[i]}]`).join("")}concat=n=${vLabels.length}:v=1:a=1[outv][outa]`;
    filters.push(concat);


    return filters.join(";");
}


async function createVersion_NEW(workspace: string, branch: string, commitMessage: string, changes: ChangeRecordType[]) {
    const db = getDbClient();
    await db.connect();

    const { rows } = await db.query(`
            SELECT A.id, B."contentType" 
            FROM "Versions" AS A 
            JOIN "Videos" AS B ON A.id = B.version
            WHERE A.workspace = $1 AND A.branch = $2
            ORDER BY A."createdAt" DESC 
            LIMIT 1
        `, [workspace, branch]);

    const versionId = rows[0].id;
    const ext = rows[0].contentType;

    const downloadPath = path.resolve("videos");
    if (!fs.existsSync(downloadPath)) fs.mkdirSync(downloadPath);

    const originalVideoPath = `${downloadPath}/input.${ext}`;
    const videoKey = `${workspace}/${versionId}/video.mp4`;

    await downloadVideo(BUCKETS.VC_RAW_VIDEOS, videoKey, originalVideoPath);
    const inputs = [originalVideoPath];

    // Add new section inputs
    for (const c of changes) {
        if (c.newSection) {
            await downloadVideo(BUCKETS.VC_SECTION, c.newSection, `${downloadPath}/${c.newSection}`);
            inputs.push(`${downloadPath}/${c.newSection}`);
        }
    }

    const filter = await buildFilterComplex(changes);

    const ffmpegStream = new PassThrough();
    const cmd = ffmpeg();
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
        .on("progress", p => console.log(`Processing: ${p.percent?.toFixed(2)}%`))
        .on("error", err => {
            console.log(err);
            console.error("❌ FFmpeg error:", err);
            ffmpegStream.destroy(err);
        })
        .on("end", () => console.log("✅ FFmpeg finished"))
        .pipe(ffmpegStream, { end: true }); // Pipe output directly to the stream




    // Insert Versions DB Record
    const newVersionId = v4()
    await db.query(
        `
          INSERT INTO "Versions" (id, branch, workspace, "commitMessage")
          VALUES ($1, $2, $3, $4)
        `,
        [newVersionId, branch, workspace, commitMessage]
    )

    // Uploading Start
    const uploader = new Upload({
        client: s3,
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

    await uploader.done()
        .then(() => {
            console.log("✅ Uploaded to S3 successfully!");
        })
        .catch(err => {
            console.log('Error : ', err);
        });

    await db.end();
}



// Main Function
(async () => {
    const { SECRET_KEY, ACCESS_KEY, DB_URL, WORKSPACE, BRANCH, COMMIT_MESSAGE, CHANGES_IN_STRING } = process.env;

    if (!SECRET_KEY || !ACCESS_KEY || !DB_URL) throw new Error("AWS or DB credentials are missing");
    if (!WORKSPACE || !BRANCH || !COMMIT_MESSAGE || !CHANGES_IN_STRING) throw new Error("Parameters are missing");


    const changes: ChangeRecordType[] = JSON.parse(CHANGES_IN_STRING!);

    changes.sort((a, b) => a.startTimestamp - b.startTimestamp);

    await createVersion_NEW(WORKSPACE!, BRANCH!, COMMIT_MESSAGE, changes);
})();