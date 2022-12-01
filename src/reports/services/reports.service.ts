import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from '../entity/report.entity';
import { Repository } from 'typeorm';
import { CreateReportDTO } from '../dtos/create-report.dto';
import { User } from 'src/users/entity/user.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private reportRepository: Repository<Report>,
  ) {}

  create(reportDto: CreateReportDTO, user: User) {
    const report = this.reportRepository.create(reportDto);
    report.user = user;
    return this.reportRepository.save(report);
  }

  async approve(id: number, approved: boolean) {
    const report = await this.reportRepository.findOneBy({ id });
    if (!report) {
      throw new NotFoundException('report not found');
    }

    report.approved = approved;
    return this.reportRepository.save(report);
  }
}
