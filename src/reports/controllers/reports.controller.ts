import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { currentUser } from 'src/users/decorators/current-user.decorator';
import { CreateReportDTO } from '../dtos/create-report.dto';
import { ReportsService } from '../services/reports.service';
import { User } from 'src/users/entity/user.entity';
import { Serialize } from 'src/interceptors/serialize.interceptors';
import { ReportDto } from '../dtos/report.dto';
import { ApproveReportDto } from '../dtos/approve-report.dto';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Serialize(ReportDto)
  createReport(@Body() body: CreateReportDTO, @currentUser() user: User) {
    return this.reportsService.create(body, user);
  }

  @Patch('/:id')
  approveReport(@Param('id') id: number, @Body() body: ApproveReportDto) {
    return this.reportsService.approve(id, body.approved);
  }
}
