import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  DocumentRequestService,
  DocumentTypeService,
} from './document.service';
import { UploadService } from '../upload/upload.service';

import { ApiTags, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

  const fileFilter = (_req: any, file: Express.Multer.File, cb: Function) => {
  const name = file.originalname?.toLowerCase() ?? '';
  const ext = name.split('.').pop();
  const allowedExt = ['pdf', 'docx'];
  const allowedMime = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ];

  if (!ext || !allowedExt.includes(ext) || !allowedMime.includes(file.mimetype)) {
    return cb(new BadRequestException('Only PDF or DOCX files are allowed'), false);
  }

  cb(null, true);
};

import { CreateDocumentRequestDto } from './dto/create-document-request.dto';
import { UpdateDocumentRequestDto } from './dto/update-document-request.dto';

import { CreateDocumentTypeDto } from './dto/create-document-type.dto';
import { UpdateDocumentTypeDto } from './dto/update-document-type.dto';

@ApiTags('Document Request')
@Controller('document-request')
export class DocumentRequestController {
  @Get()
  @ApiBearerAuth()
  findAll() {
    return this.documentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentService.findOne(+id);
  }

  constructor(
    private readonly documentService: DocumentRequestService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  create(@Body() createDocumentRequestDto: CreateDocumentRequestDto) {
    return this.documentService.create(createDocumentRequestDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDocumentRequestDto: UpdateDocumentRequestDto,
  ) {
    return this.documentService.update(+id, updateDocumentRequestDto);
  }

  @Post(':id/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employee')
  async uploadFile(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Req() req?: any) {
    const uploaded = await this.uploadService.uploadToMinio(file);
    const dto: any = { documentUrl: uploaded.url };
    // attach audit info if user present
    if (req && req.user) {
      dto.uploadedBy = { id: req.user.id };
      dto.uploadedAt = new Date().toISOString();
    }
    return this.documentService.update(+id, dto);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('recruiter', 'admin')
  async approve(
    @Param('id') id: string,
    @Body() body: { approvedBy: number },
  ) {
    const dto: any = { approved: true, approvedBy: body.approvedBy };
    return this.documentService.update(+id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.documentService.remove(+id);
  }
}

@ApiTags('Document Type')
@Controller('document-type')
export class DocumentTypeController {
  constructor(private readonly documentService: DocumentTypeService) {}

  @Post()
  create(@Body() createDocumentTypeDto: CreateDocumentTypeDto) {
    return this.documentService.createType(createDocumentTypeDto);
  }

  @Get()
  findAll() {
    return this.documentService.findAllTypes();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentService.findOneType(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDocumentTypeDto: UpdateDocumentTypeDto,
  ) {
    return this.documentService.updateType(+id, updateDocumentTypeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.documentService.removeType(+id);
  }
}
