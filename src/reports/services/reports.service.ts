import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from '../entity/report.entity';
import { Repository } from 'typeorm';
import { CreateReportDTO } from '../dtos/create-report.dto';
import { User } from 'src/users/entity/user.entity';
import { GetEstimateDto } from '../dtos/get-estimate.dto';

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

  createEstimate({ make, model, lng, lat, mileage, year }: GetEstimateDto) {
    return this.reportRepository
      .createQueryBuilder()
      .select('AVG(price)', 'price')
      .where('make = :make', { make })
      .andWhere('model = :model', { model })
      .andWhere('lng - :lng BETWEEN -5 AND 5', { lng })
      .andWhere('lat - :lat BETWEEN -5 AND 5', { lat })
      .andWhere('year - :year BETWEEN -3 AND 3', { year })
      .andWhere('approved IS TRUE')
      .orderBy('ABS(mileage - :mileage', 'DESC')
      .setParameters({ mileage })
      .limit(3)
      .getRawOne();
  }
}
