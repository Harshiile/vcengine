import { Worker } from "bullmq";
import { redisConnection } from "../../config/redis.js";
import { ENV } from "../../config/env.js";
import Docker from 'dockerode'

const worker = new Worker(
    "new_version_creation_queue",
    async (job) => {

        const { branch, workspace, commitMessage, changes } = job.data

        new Promise(async (resolve, reject) => {
            const docker = new Docker();
            const container = await docker.createContainer({
                Image: "build-new-version",
                name: `build-new-version_${Date.now()}`,
                HostConfig: {
                    NetworkMode: 'vcengine_vcengine',
                },
                Env: [
                    `WORKSPACE=${workspace}`,
                    `BRANCH=${branch}`,
                    `COMMIT_MESSAGE=${commitMessage}`,
                    `CHANGES_IN_STRING=${JSON.stringify(changes)}`,
                    `ACCESS_KEY=${ENV.IAM_ACCESS_KEY_ID}`,
                    `SECRET_KEY=${ENV.IAM_SECRET_KEY}`,
                    `DB_URL=postgresql://user:password@postgres_db:5432/postgres`,
                ],
            });
            const logs = await container.attach({
                stream: true,
                stdout: true,
                stderr: true,
            });

            logs.on("data", (data) => console.log(data.toString()));
            await container.start().catch(reject);

            const result = await container.wait();
            resolve(result);
        })
    },
    { connection: redisConnection }
);

worker.on("completed", (job) => {
    console.log('Process Finished !!');
});

worker.on("failed", (job, err) => {
    console.error("Worker failed error :", err.message);
});

worker.on("error", (err) => {
    console.error("Worker internal error :", err.message);
});
