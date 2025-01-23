import {
  HttpException,
  HttpStatus,
  Injectable,
  NotAcceptableException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

import * as fs from "fs/promises"; // Ensure using fs.promises
import { createWriteStream } from "fs";
import { join } from "path";
import { UploadMultipleFileInput } from "./dto/upload-file-input.dto";
import { GetUploadedFile } from "./dto/get-upload-file.dto";

@Injectable()
export class UploadService {
  constructor(private prisma: PrismaService) {}

  async uploadFiles(uploadFileInput) {
    const { file } = uploadFileInput;

    console.log("file: ", file);

    let uniqueFilename = null;
    const uniqueString = `${Date.now()}`;
    const { createReadStream, filename, mimetype } = await file;

    if (!mimetype.includes("image")) {
      throw new HttpException("Its not an image!", HttpStatus.BAD_REQUEST);
    }

    uniqueFilename = `${uniqueString}-${filename}`;

    await new Promise(async (resolve) => {
      createReadStream()
        .pipe(
          createWriteStream(
            join(process.cwd(), `./public/uploads/${uniqueFilename}`)
          )
        )
        .on("finish", () =>
          resolve({
            file: filename,
          })
        )
        .on("error", () => {
          new HttpException("Could not save image", HttpStatus.BAD_REQUEST);
        });
    });

    let data = {
      file: uniqueFilename,
    };

    try {
      const newFile = await this.prisma.upload.create({
        data,
      });

      return {
        id: newFile.id,
        fileUrl: `${process.env.BACKEND_BASE_URL}/uploads/${newFile.file}`,
      };
    } catch (error) {
      throw new NotAcceptableException("Course couldn't be created", {
        cause: new Error(),
        description: error,
      });
    }
  }

  async uploadMulipleFiles(uploadMultipleFileInput: UploadMultipleFileInput) {
    const { files } = uploadMultipleFileInput;
    const multiFiles = [];
    let invalidImages = [];

    for (const file of await files) {
      const { filename, mimetype } = await file;
      if (!mimetype.includes("image")) {
        invalidImages.push(filename);
      }
    }

    if (invalidImages.length > 0) {
      if (invalidImages.length == 1) {
        throw new HttpException(
          `'${invalidImages.join(", ")}' is not an image!`,
          HttpStatus.BAD_REQUEST
        );
      } else {
        throw new HttpException(
          `'${invalidImages.join(", ")}' are not images!`,
          HttpStatus.BAD_REQUEST
        );
      }
    }

    for (const file of await files) {
      const { createReadStream, filename } = await file;

      let uniqueFilename = null;
      const uniqueString = `${Date.now()}`;

      uniqueFilename = `${uniqueString}-${filename}`;

      createReadStream()
        .pipe(
          createWriteStream(
            join(process.cwd(), `./public/uploads/${uniqueFilename}`)
          )
        )
        .on("finish", () =>
          console.log("File uploaded successfully: ", filename)
        )
        .on("error", () => {
          new HttpException(
            `Could not save image '${filename}'`,
            HttpStatus.BAD_REQUEST
          );
        });

      multiFiles.push({
        file: uniqueFilename,
      });
    }

    try {
      const newFiles = await this.prisma.upload.createManyAndReturn({
        data: multiFiles,
      });

      const uploadedFiles = newFiles.map((file) => {
        return {
          id: file.id,
          fileUrl: `${process.env.BACKEND_BASE_URL}/uploads/${file.file}`,
        };
      });

      return uploadedFiles;
    } catch (error) {
      throw new NotAcceptableException("Upload failed!", {
        cause: new Error(),
        description: error,
      });
    }
  }

  async listFiles(paginationArgs) {
    let skip = paginationArgs?.skip || 0;
    let take = paginationArgs?.limit || 10;
    try {
      const filesLength = await this.prisma.upload.count();
      const files: any = await this.prisma.upload.findMany({ skip, take });

      if (files.length > 0) {
        files.map((file) => {
          file.fileUrl = `${process.env.BACKEND_BASE_URL}/uploads/${file.file}`;
        });
      }

      return { files, total: filesLength };
    } catch (error) {
      console.log("Error=", error);

      throw new Error(error.message);
    }
  }

  async file(getUploadedFile: GetUploadedFile) {
    const { id } = getUploadedFile;
    try {
      const file: any = await this.prisma.upload.findFirst({
        where: {
          id,
        },
      });

      file.fileUrl = `${process.env.BACKEND_BASE_URL}/uploads/${file.file}`;

      return file;
    } catch (error) {
      console.log("Error=", error);

      throw new Error(error.message);
    }
  }

  async deleteFile(deleteUploadedFile: GetUploadedFile) {
    const { id } = deleteUploadedFile;

    try {
      const fileName = await this.prisma.upload.findFirst({
        select: {
          file: true,
        },
        where: {
          id,
        },
      });

      if (!fileName) {
        throw Error("No file present with this ID!");
      }

      const publicFolderPath = `${process.cwd()}/public/uploads/${
        fileName.file
      }`;

      try {
        fs.unlink(publicFolderPath);

        await this.prisma.upload.delete({
          where: {
            id,
          },
        });
      } catch (error) {
        throw error("Failed to delete File. Please try after some time!");
      }

      return "File deleted successfully!";
    } catch (error) {
      console.log("Error=", error);
      throw new Error(error.message);
    }
  }

  // async uploadVideo(ctx, file, uploadVideoInput) {
  //   const publicFolderPath = path.join(cwd(), "public", "uploads");
  //   const user = ctx.req.user;

  //   try {
  //     // Step 1: Generate unique filename
  //     const filename = `video-${file.originalname}-${new Date().toISOString()}`;
  //     const videoPath = path.join(publicFolderPath, filename);

  //     const writeStream = fsS.createWriteStream(videoPath);
  //     writeStream.write(file.buffer);
  //     writeStream.end();
  //     writeStream.on("finish", async () => {
  //       console.log("Buffer has been written to file successfully");

  //       // Step 3: Prepare for HLS conversion asynchronously
  //       const outputDir = path.join(publicFolderPath, "hls-videos", filename);
  //       await fs.mkdir(outputDir, { recursive: true }); // Using async mkdir
  //       const playlistPath = path.join(outputDir, "output.m3u8");

  //       // Record the start time
  //       const startTime = Date.now();
  //       console.log("startTime=", startTime);

  //       // Step 4: Run ffmpeg to convert video to HLS asynchronously
  //       await new Promise<void>((resolve, reject) => {
  //         // Step 4: Run ffmpeg to convert video to HLS asynchronously
  //         const ffmpeg = spawn("ffmpeg", [
  //           "-i",
  //           videoPath,
  //           "-c:v",
  //           "libx264",
  //           "-c:a",
  //           "aac",
  //           "-start_number",
  //           "0",
  //           "-hls_time",
  //           "10",
  //           "-hls_list_size",
  //           "0",
  //           "-f",
  //           "hls",
  //           "-loglevel",
  //           "debug",
  //           playlistPath,
  //         ]);

  //         let stderrLog = "";
  //         ffmpeg.stderr.on("data", (data) => {
  //           stderrLog += data.toString();
  //         });

  //         ffmpeg.on("close", (code) => {
  //           // Record the end time
  //           const endTime = Date.now();
  //           const duration = (endTime - startTime) / 1000; // Calculate duration in seconds

  //           console.log("endTime=", endTime);
  //           console.log("duration=", duration);

  //           if (code === 0) {
  //             resolve();
  //           } else {
  //             console.error("FFmpeg error output:", stderrLog);
  //             reject(new Error(`ffmpeg failed with code ${code}`));
  //           }
  //         });
  //       });
  //       console.log("Finished");
  //     });

  //     // Step 5: Get video duration
  //     const duration = await this.stream.getVideoDuration(videoPath);

  //     // Step 6: Store video metadata in the database
  //     const uploadFile = await this.prisma.video.create({
  //       data: {
  //         filename,
  //         playlist: `hls-videos/${filename}/output.m3u8`,
  //         playtime: duration,
  //         user: { connect: { id: user.userId } },
  //         ...uploadVideoInput,
  //       },
  //     });

  //     // Step 7: Remove the original file after processing
  //     await fs.unlink(videoPath);

  //     return {
  //       message: "Video uploaded and processed successfully",
  //       video: uploadFile,
  //     };
  //   } catch (err) {
  //     console.error("Upload error:", err);
  //     throw new BadRequestException("Error uploading video");
  //   }
  // }
}
