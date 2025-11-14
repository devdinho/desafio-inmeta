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
} from '@nestjs/common';
import {
  DocumentRequestService,
  DocumentTypeService,
} from './document.service';

import { ApiTags } from '@nestjs/swagger';

import { CreateDocumentRequestDto } from './dto/create-document-request.dto';
import { UpdateDocumentRequestDto } from './dto/update-document-request.dto';

import { CreateDocumentTypeDto } from './dto/create-document-type.dto';
import { UpdateDocumentTypeDto } from './dto/update-document-type.dto';

@ApiTags('Document Request')
@Controller('document-request')
export class DocumentRequestController {
  constructor(private readonly documentService: DocumentRequestService) {}

  @Post()
  create(@Body() createDocumentRequestDto: CreateDocumentRequestDto) {
    return this.documentService.create(createDocumentRequestDto);
  }

  @Get()
  findAll() {
    return this.documentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDocumentRequestDto: UpdateDocumentRequestDto,
  ) {
    return this.documentService.update(+id, updateDocumentRequestDto);
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
