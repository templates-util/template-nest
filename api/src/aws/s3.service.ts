import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { Readable } from 'stream';
import { Repository } from 'typeorm';
import { Arquivo } from '../models/arquivo.entity';

function getS3FileUrl(
  bucket: string,
  fileName: string,
  region: string,
  useLocal: boolean,
  endpoint: string,
): string {
  if (useLocal) {
    return `${endpoint}/ui/${bucket}/${fileName}`;
  } else {
    return `https://${bucket}.s3.${region}.amazonaws.com/${fileName}`;
  }
}

@Injectable()
export class S3Service {
  private s3: S3Client;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Arquivo)
    private arquivoRepository: Repository<Arquivo>,
  ) {
    this.s3 = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
      ...(process.env.NODE_ENV === 'local'
        ? { endpoint: this.configService.get('AWS_S3_ENDPOINT') }
        : {}),
    });
  }

  async uploadFile(file: Express.Multer.File, id: number): Promise<Arquivo> {
    const { originalname, buffer, mimetype } = file;

    const bucketName = this.configService.get('AWS_S3_BUCKET_NAME');
    const params = {
      Bucket: bucketName,
      Key: originalname,
      Body: buffer,
    };

    const command = new PutObjectCommand(params);
    await this.s3.send(command);

    const arquivo = new Arquivo();
    arquivo.nomeDoArquivo = originalname;
    arquivo.mimeType = mimetype;
    arquivo.bucket = params.Bucket;
    arquivo.url = getS3FileUrl(
      bucketName,
      originalname,
      this.configService.get('AWS_REGION'),
      process.env.NODE_ENV === 'local',
      this.configService.get('AWS_S3_ENDPOINT'),
    );

    arquivo.userId = id;

    return await this.arquivoRepository.save(arquivo);
  }

  async updateFile(
    arquivo: Arquivo,
    file: Express.Multer.File,
  ): Promise<Arquivo> {
    const { originalname, buffer, mimetype } = file;

    const bucketName = this.configService.get('AWS_S3_BUCKET_NAME');
    const params = {
      Bucket: bucketName,
      Key: originalname,
      Body: buffer,
    };

    const command = new PutObjectCommand(params);
    await this.s3.send(command);
    arquivo.nomeDoArquivo = originalname;
    arquivo.mimeType = mimetype;
    arquivo.bucket = params.Bucket;
    arquivo.url = getS3FileUrl(
      bucketName,
      originalname,
      this.configService.get('AWS_REGION'),
      process.env.NODE_ENV === 'local',
      this.configService.get('AWS_S3_ENDPOINT'),
    );

    return await this.arquivoRepository.save(arquivo);
  }

  async downloadFile(
    id: number,
  ): Promise<{ stream: Readable; mimeType: string; filename: string }> {
    const arquivo = await this.getArquivoById(id);

    if (!arquivo) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    if (arquivo.isExcluido) {
      throw new HttpException('Arquivo já excluído', HttpStatus.BAD_REQUEST);
    }

    const params = {
      Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
      Key: arquivo.nomeDoArquivo,
    };

    const command = new GetObjectCommand(params);
    const response = await this.s3.send(command);
    const fileStream = response.Body as Readable;
    if (!fileStream) {
      throw new HttpException('Arquivo excluído do S3', HttpStatus.BAD_REQUEST);
    }
    return {
      stream: fileStream,
      mimeType: arquivo.mimeType,
      filename: arquivo.nomeDoArquivo,
    };
  }

  async deleteFile(id: number): Promise<void> {
    const arquivo = await this.getArquivoById(id);

    if (!arquivo) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    if (!arquivo.isExcluido) {
      const params = {
        Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
        Key: arquivo.nomeDoArquivo,
      };

      const command = new DeleteObjectCommand(params);
      await this.s3.send(command);

      arquivo.isExcluido = true;
      arquivo.dataExclusao = new Date();

      await this.arquivoRepository.save(arquivo);
    } else {
      throw new HttpException('Arquivo já excluído', HttpStatus.BAD_REQUEST);
    }
  }
  async replaceFile(id: number, file: Express.Multer.File): Promise<Arquivo> {
    const arquivo = await this.getArquivoById(id);

    if (!arquivo) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    if (arquivo.isExcluido) {
      throw new HttpException('Arquivo já excluído', HttpStatus.BAD_REQUEST);
    }

    // Deletar o arquivo antigo do S3
    await this.deleteFileFromS3(arquivo.nomeDoArquivo);

    // Atualizar o arquivo no S3 e no banco de dados
    return await this.updateFile(arquivo, file);
  }

  private async deleteFileFromS3(filename: string): Promise<void> {
    const params = {
      Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
      Key: filename,
    };

    const command = new DeleteObjectCommand(params);
    await this.s3.send(command);
  }

  async getArquivoById(id: number): Promise<Arquivo> {
    return await this.arquivoRepository.findOne({ where: { id } });
  }
}
