// src/aws/aws.controller.ts
import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RequestWithUser } from '../auth/requestWithUser.interface';
import { Arquivo } from '../models/arquivo.entity';
import { S3Service } from './s3.service';

@ApiTags('aws')
@Controller('aws')
@UseGuards(JwtAuthGuard)
export class AwsController {
  constructor(private readonly s3Service: S3Service) {}

  @ApiOperation({ summary: 'Upload a file to S3' })
  @ApiResponse({
    status: 201,
    description: 'The file has been successfully uploaded.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File to be uploaded',
    type: 'multipart/form-data',
    schema: {
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ): Promise<Arquivo> {
    if (!file) {
      throw new BadRequestException('File not uploaded');
    }
    const userId = req.user.id;
    return await this.s3Service.uploadFile(file, userId);
  }

  @ApiOperation({ summary: 'Download a file from S3' })
  @ApiResponse({
    status: 200,
    description: 'The file has been successfully downloaded.',
  })
  @ApiResponse({ status: 404, description: 'File not found.' })
  @Get('download/:id')
  async downloadFile(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const { stream, mimeType, filename } = await this.s3Service.downloadFile(
        id,
      );
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.setHeader('Content-Type', mimeType);
      stream.pipe(res);
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(404).send({ message: 'File not found' });
      } else {
        res.status(500).send({ message: 'Internal server error' });
      }
    }
  }

  @ApiOperation({ summary: 'Delete a file from S3' })
  @ApiResponse({
    status: 200,
    description: 'The file has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'File not found.' })
  @ApiResponse({ status: 400, description: 'File already deleted.' })
  @Delete('delete/:id')
  async deleteFile(@Param('id') id: number): Promise<void> {
    try {
      await this.s3Service.deleteFile(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('File not found');
      } else if (error instanceof HttpException) {
        throw new HttpException('File already deleted', HttpStatus.BAD_REQUEST);
      } else {
        throw new InternalServerErrorException('Internal server error');
      }
    }
  }

  @ApiOperation({ summary: 'Replace a file in S3' })
  @ApiResponse({
    status: 200,
    description: 'The file has been successfully replaced.',
  })
  @ApiResponse({ status: 404, description: 'File not found.' })
  @ApiResponse({ status: 400, description: 'File already deleted.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File to replace',
    type: 'multipart/form-data',
    schema: {
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @Put('replace/:id')
  @UseInterceptors(FileInterceptor('file'))
  async replaceFile(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Arquivo> {
    try {
      if (!file) {
        throw new BadRequestException('File not uploaded');
      }
      return await this.s3Service.replaceFile(id, file);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('File not found');
      } else if (error instanceof BadRequestException) {
        throw new BadRequestException('File already deleted');
      } else {
        throw new InternalServerErrorException('Internal server error');
      }
    }
  }
}
