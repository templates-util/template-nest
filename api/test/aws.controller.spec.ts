// test/aws.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { createReadStream, promises as fsPromises } from 'fs';
import * as tmp from 'tmp';
import { AwsController } from '../src/aws/aws.controller';
import { S3Service } from '../src/aws/s3.service';
import { Arquivo } from '../src/models/arquivo.entity';

describe('AwsController', () => {
  let controller: AwsController;
  let service: S3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AwsController],
      providers: [
        {
          provide: S3Service,
          useValue: {
            uploadFile: jest.fn(),
            downloadFile: jest.fn(),
            deleteFile: jest.fn(),
            replaceFile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AwsController>(AwsController);
    service = module.get<S3Service>(S3Service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should call S3Service.uploadFile', async () => {
      const file = {
        originalname: 'test.txt',
        buffer: Buffer.from('test'),
        fieldname: 'file',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 4,
        destination: '',
        filename: '',
        path: '',
        stream: null,
      };
      const arquivo = new Arquivo();
      arquivo.nomeDoArquivo = 'test.txt';
      arquivo.mimeType = 'text/plain';
      arquivo.bucket = 'test-bucket';
      arquivo.url = 'https://s3.amazonaws.com/test-bucket/test.txt';

      (service.uploadFile as jest.Mock).mockResolvedValue(arquivo);

      const exemploUserId = 1;
      const result = await controller.uploadFile(file, {
        user: { id: exemploUserId },
      } as any);

      expect(service.uploadFile).toHaveBeenCalledWith(file, exemploUserId);
      expect(result).toEqual(arquivo);
    });
  });

  describe('downloadFile', () => {
    let tmpFile: tmp.FileResult;

    beforeEach(async () => {
      tmpFile = tmp.fileSync({ postfix: '.txt' });
      await fsPromises.writeFile(tmpFile.name, 'test content');
    });

    afterEach(() => {
      tmpFile.removeCallback();
    });

    it('should call S3Service.downloadFile', async () => {
      const id = 1;
      const mimeType = 'text/plain';
      const stream = createReadStream(tmpFile.name);

      (service.downloadFile as jest.Mock).mockResolvedValue({
        stream,
        mimeType,
      });

      const res = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
        pipe: jest.fn(),
      };

      await controller.downloadFile(id, res as any);

      expect(service.downloadFile).toHaveBeenCalledWith(id);
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', mimeType);
      // expect(stream.pipe).toHaveBeenCalledWith(res);
    });
  });

  describe('replaceFile', () => {
    it('should call S3Service.replaceFile', async () => {
      const id = 1;
      const file = {
        originalname: 'test.txt',
        buffer: Buffer.from('test'),
        fieldname: 'file',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 4,
        destination: '',
        filename: '',
        path: '',
        stream: null,
      };
      const arquivo = new Arquivo();
      arquivo.nomeDoArquivo = 'test.txt';
      arquivo.mimeType = 'text/plain';
      arquivo.bucket = 'test-bucket';
      arquivo.url = 'https://s3.amazonaws.com/test-bucket/test.txt';

      (service.replaceFile as jest.Mock).mockResolvedValue(arquivo);

      const result = await controller.replaceFile(id, file);

      expect(service.replaceFile).toHaveBeenCalledWith(id, file);
      expect(result).toEqual(arquivo);
    });
  });

  describe('deleteFile', () => {
    it('should call S3Service.deleteFile', async () => {
      const id = 1;
      (service.deleteFile as jest.Mock).mockResolvedValue(undefined);

      await controller.deleteFile(id);

      expect(service.deleteFile).toHaveBeenCalledWith(id);
    });
  });
});
